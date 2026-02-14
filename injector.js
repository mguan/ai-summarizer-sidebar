// Define constants locally to avoid dynamic import. 
// Since KEY_CUSTOM_PROMPTS and KEY_AUTO_SUBMIT are also defined in constants.js,
// if you modify these, be sure to also modify them in constants.js.
const KEY_CUSTOM_PROMPTS = 'custom_prompts';
const KEY_AUTO_SUBMIT = 'auto_submit';

const Providers = {
    'chatgpt.com': {
        getInput: () => document.querySelector('#prompt-textarea'),
        getSubmitButton: () =>
            document.querySelector(
                'button[data-testid="send-button"], #composer-submit-button'
            ),
        fillInput: (input, text) => {
            input.focus();
            input.innerHTML = text;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        },
    },
    'claude.ai': {
        getInput: () => document.querySelector('div[contenteditable="true"].ProseMirror'),
        getSubmitButton: () => document.querySelector('button[aria-label*="Send"]'),
        fillInput: (input, text) => {
            input.focus();
            input.innerHTML = text;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        },
    },
    'gemini.google.com': {
        getInput: () => {
            const selectors = [
                'rich-textarea > div[contenteditable="true"]',
                'div[role="textbox"][contenteditable="true"]',
                'div[aria-label*="Enter a prompt"]',
                '.input-area div[contenteditable="true"]',
                'textarea',
            ];
            return selectors.map(s => document.querySelector(s)).find(el => el) || null;
        },
        getSubmitButton: () => {
            const selectors = [
                'button[aria-label="Send message"]',
                'button[aria-label*="Send"]',
                'button[aria-label*="Submit"]',
                '.send-button',
            ];
            // Helper to check if button is enabled
            const isEnabled = (btn) =>
                btn &&
                !btn.hasAttribute('disabled') &&
                btn.getAttribute('aria-disabled') !== 'true';
            return selectors.map(s => document.querySelector(s)).find(isEnabled) ||
                null;
        },
        fillInput: (input, text) => {
            input.focus();
            document.execCommand('insertText', false, text); // Gemini specific legacy support
            input.dispatchEvent(new Event('input', { bubbles: true }));
        },
    },
    'grok.com': {
        getInput: () => document.querySelector('.tiptap.ProseMirror'),
        getSubmitButton: () =>
            document.querySelector(
                'button[aria-label="Send"], button[type="submit"]'
            ),
        fillInput: (input, text) => {
            input.focus();
            input.innerHTML = `<p>${text}</p>`;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        },
    },
};

function getProvider() {
    const hostname = window.location.hostname;
    // Iterate keys and check if hostname includes the key
    return Object.keys(Providers).reduce(
        (found, key) => (hostname.includes(key) ? Providers[key] : found),
        null
    );
}

async function injectPrompt() {
    // Avoid re-injection if already done
    if (window.hasInjectedPrompt) return;

    const params = new URLSearchParams(window.location.search);
    const promptText = params.get(KEY_CUSTOM_PROMPTS);
    const autoSubmit = params.get(KEY_AUTO_SUBMIT) === 'true';

    if (!promptText) return;

    const provider = getProvider();
    if (!provider) {
        // Only log if we expect to find a provider but didn't (silent fail is
        // okay for generally unsupported sites, but this script only runs on
        // matches)
        console.warn(
            'AI Summarizer: No provider match found for',
            window.location.hostname
        );
        return;
    }

    // Try finding input
    let inputField = provider.getInput();
    let retries = 0;
    while (!inputField && retries < 10) {
        await new Promise(r => setTimeout(r, 500));
        inputField = provider.getInput();
        retries++;
    }

    if (!inputField) {
        console.warn('AI Summarizer: Could not find input field.');
        return;
    }

    window.hasInjectedPrompt = true;
    provider.fillInput(inputField, promptText);

    if (!autoSubmit) return;

    // Wait for button to become ready
    let sendButton = provider.getSubmitButton();
    let buttonRetries = 0;
    while (!sendButton && buttonRetries < 15) {
        // Slightly more retries for button state
        await new Promise(r => setTimeout(r, 500));
        sendButton = provider.getSubmitButton();
        buttonRetries++;
    }

    if (sendButton) {
        // Small delay to ensure UI is interactive
        setTimeout(() => sendButton.click(), 300);
    }
}

// Run immediately
injectPrompt();

// Basic debounce implementation
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedInject = debounce(injectPrompt, 500);

const observer = new MutationObserver((mutations) => {
    if (!window.hasInjectedPrompt) {
        debouncedInject();
    }
});

observer.observe(document.body, { childList: true, subtree: true });
