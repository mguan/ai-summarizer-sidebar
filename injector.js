// Duplicated from constants.js — content scripts cannot use ES module imports.
// If you change these values, update constants.js to match.
const KEY_CUSTOM_PROMPTS = 'custom_prompts';
const KEY_AUTO_SUBMIT = 'auto_submit';

const RETRY_INTERVAL_MS = 500;
const INPUT_MAX_RETRIES = 10;
const BUTTON_MAX_RETRIES = 15;
const SUBMIT_DELAY_MS = 300;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function findFirst(selectors) {
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            return element;
        }
    }
    return null;
}

function isButtonEnabled(button) {
    return !!button && !button.disabled && button.getAttribute('aria-disabled') !== 'true';
}

function findFirstEnabledButton(selectors) {
    for (const selector of selectors) {
        const button = document.querySelector(selector);
        if (isButtonEnabled(button)) {
            return button;
        }
    }
    return null;
}

function fillContentEditable(input, text) {
    input.focus();
    input.innerHTML = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function fillGrokInput(input, text) {
    fillContentEditable(input, `<p>${text}</p>`);
}

function fillGeminiInput(input, text) {
    input.focus();
    document.execCommand('insertText', false, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

const PROVIDER_ADAPTERS = {
    'chatgpt.com': {
        getInput: () => findFirst(['#prompt-textarea']),
        getSubmitButton: () =>
            findFirstEnabledButton([
                'button[data-testid="send-button"]',
                '#composer-submit-button',
            ]),
        fillInput: fillContentEditable,
    },
    'claude.ai': {
        getInput: () => findFirst(['div[contenteditable="true"].ProseMirror']),
        getSubmitButton: () => findFirstEnabledButton(['button[aria-label*="Send"]']),
        fillInput: fillContentEditable,
    },
    'gemini.google.com': {
        getInput: () =>
            findFirst([
                'rich-textarea > div[contenteditable="true"]',
                'div[role="textbox"][contenteditable="true"]',
                'div[aria-label*="Enter a prompt"]',
                '.input-area div[contenteditable="true"]',
                'textarea',
            ]),
        getSubmitButton: () =>
            findFirstEnabledButton([
                'button[aria-label="Send message"]',
                'button[aria-label*="Send"]',
                'button[aria-label*="Submit"]',
                '.send-button',
            ]),
        fillInput: fillGeminiInput,
    },
    'grok.com': {
        getInput: () => findFirst(['.tiptap.ProseMirror']),
        getSubmitButton: () =>
            findFirstEnabledButton(['button[aria-label="Send"]', 'button[type="submit"]']),
        fillInput: fillGrokInput,
    },
};

function getProviderAdapter() {
    const hostname = window.location.hostname;
    for (const [providerHost, adapter] of Object.entries(PROVIDER_ADAPTERS)) {
        if (hostname.includes(providerHost)) {
            return adapter;
        }
    }
    return null;
}

async function waitForElement(getElement, maxRetries) {
    let retries = 0;
    let element = getElement();

    while (!element && retries < maxRetries) {
        await sleep(RETRY_INTERVAL_MS);
        element = getElement();
        retries += 1;
    }

    return element;
}

async function injectPrompt() {
    if (window.hasInjectedPrompt) return;

    const params = new URLSearchParams(window.location.search);
    const promptText = params.get(KEY_CUSTOM_PROMPTS);
    const autoSubmit = params.get(KEY_AUTO_SUBMIT) === 'true';

    if (!promptText) return;

    const provider = getProviderAdapter();
    if (!provider) {
        console.warn('AI Summarizer: No provider match found for', window.location.hostname);
        return;
    }

    const inputField = await waitForElement(provider.getInput, INPUT_MAX_RETRIES);
    if (!inputField) {
        console.warn('AI Summarizer: Could not find input field.');
        return;
    }

    window.hasInjectedPrompt = true;
    provider.fillInput(inputField, promptText);

    if (!autoSubmit) return;

    const sendButton = await waitForElement(provider.getSubmitButton, BUTTON_MAX_RETRIES);
    if (sendButton) {
        setTimeout(() => sendButton.click(), SUBMIT_DELAY_MS);
    }
}

function debounce(func, wait) {
    let timeout;
    return function debounced(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

const debouncedInject = debounce(injectPrompt, 500);
const observer = new MutationObserver(() => {
    if (!window.hasInjectedPrompt) {
        debouncedInject();
    }
});

function init() {
    injectPrompt();
    observer.observe(document.body, { childList: true, subtree: true });
}

init();
