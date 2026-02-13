const PROVIDERS = {
    'chatgpt.com': {
        inputSelector: '#prompt-textarea',
        submitSelector: '#composer-submit-button',
        inputType: 'contenteditable'
    },
    'claude.ai': {
        inputSelector: 'div[contenteditable="true"], fieldset div[contenteditable="true"]',
        submitSelector: 'button[aria-label*="Send"]',
        inputType: 'contenteditable'
    },
    'gemini.google.com': {
        inputSelector: 'div[aria-label="Enter a prompt for Gemini"], .input-area div[contenteditable="true"], div[contenteditable="true"][role="textbox"], textarea',
        submitSelector: 'button[aria-label="Send message"], button[aria-label*="Send"], button[aria-label*="Submit"]',
        inputType: 'contenteditable'
    },

    'grok.com': {
        inputSelector: '.tiptap.ProseMirror',
        submitSelector: 'button[aria-label="Send"], button[type="submit"]',
        inputType: 'contenteditable'
    }
};

function getProviderConfig() {
    const hostname = window.location.hostname;
    for (const key in PROVIDERS) {
        if (hostname.includes(key)) {
            return PROVIDERS[key];
        }
    }
    return null;
}

function setInputValue(inputField, value, config) {
    if (config.inputType === 'textarea') {
        inputField.value = value;
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        inputField.focus();
        document.execCommand('insertText', false, value);
    }
}

function injectPrompt() {
    const params = new URLSearchParams(window.location.search);
    const promptText = params.get("custom_q");

    if (!promptText || window.hasInjectedPrompt) return;

    const config = getProviderConfig();
    if (!config) return;

    const inputField = document.querySelector(config.inputSelector);

    if (inputField) {
        window.hasInjectedPrompt = true;
        setInputValue(inputField, promptText, config);

        if (params.get("auto_submit") === 'true') {
            setTimeout(() => {
                const sendButton = document.querySelector(config.submitSelector);
                if (sendButton) sendButton.click();
            }, 1000);
        }
    } else {
        retryInjection();
    }
}

function retryInjection() {
    if (!window._injectionAttempts) window._injectionAttempts = 0;
    if (window._injectionAttempts < 20) {
        window._injectionAttempts++;
        setTimeout(injectPrompt, 500);
    }
}

// Run immediately and observe for dynamic loading
injectPrompt();

const observer = new MutationObserver((mutations) => {
    if (!window.hasInjectedPrompt) {
        injectPrompt();
    } else {
        observer.disconnect();
    }
});

observer.observe(document.body, { childList: true, subtree: true });
