const Providers = {
    'chatgpt.com': {
        getInput: () => document.querySelector('#prompt-textarea'),
        getSubmitButton: () => document.querySelector('button[data-testid="send-button"], #composer-submit-button'),
        fillInput: (input, text) => {
            input.focus();
            input.innerHTML = text;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    },
    'claude.ai': {
        getInput: () => document.querySelector('div[contenteditable="true"].ProseMirror'),
        getSubmitButton: () => document.querySelector('button[aria-label*="Send"]'),
        fillInput: (input, text) => {
            input.focus();
            input.innerHTML = text; // ProseMirror often needs innerHTML for rich text
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    },
    'gemini.google.com': {
        getInput: () => {
            // Enhanced strategy for finding Gemini's input
            const selectors = [
                'rich-textarea > div[contenteditable="true"]', // Most common recent selector
                'div[role="textbox"][contenteditable="true"]', // Generic accessible textbox
                'div[aria-label*="Enter a prompt"]', // Accessibility label
                '.input-area div[contenteditable="true"]', // Old class-based
                'textarea' // Fallback
            ];
            for (const selector of selectors) {
                const el = document.querySelector(selector);
                if (el) return el;
            }
            return null;
        },
        getSubmitButton: () => {
            const selectors = [
                'button[aria-label="Send message"]',
                'button[aria-label*="Send"]',
                'button[aria-label*="Submit"]',
                '.send-button' // Generic fallback
            ];
            for (const selector of selectors) {
                const btn = document.querySelector(selector);
                if (btn && !btn.hasAttribute('disabled') && btn.getAttribute('aria-disabled') !== 'true') {
                    return btn;
                }
            }
            return null;
        },
        fillInput: (input, text) => {
            input.focus();
            // Gemini is tricky; sometimes execCommand works best to trigger internal state
            document.execCommand('insertText', false, text);
            // Dispatch events to ensure state is updated if execCommand didn't fully work
            input.dispatchEvent(new Event('input', { bubbles: true }));
            // Sometimes a keypress is needed to wake up the "Send" button
            input.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
        }
    },
    'grok.com': {
        getInput: () => document.querySelector('.tiptap.ProseMirror'),
        getSubmitButton: () => document.querySelector('button[aria-label="Send"], button[type="submit"]'),
        fillInput: (input, text) => {
            input.focus();
            // Tiptap/ProseMirror usually handles HTML well
            input.innerHTML = `<p>${text}</p>`;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
};

function getProvider() {
    const hostname = window.location.hostname;
    for (const key in Providers) {
        if (hostname.includes(key)) {
            return Providers[key];
        }
    }
    return null;
}

async function injectPrompt() {
    const params = new URLSearchParams(window.location.search);
    const promptText = params.get("custom_q");
    const autoSubmit = params.get("auto_submit") === 'true';

    if (!promptText || window.hasInjectedPrompt) return;

    const provider = getProvider();
    if (!provider) {
        console.warn("AI Summarizer: No provider found for this hostname.");
        return;
    }

    // Retry finding the input element
    let inputField = null;
    for (let i = 0; i < 10; i++) {
        inputField = provider.getInput();
        if (inputField) break;
        await new Promise(r => setTimeout(r, 500));
    }

    if (inputField) {
        window.hasInjectedPrompt = true;
        provider.fillInput(inputField, promptText);

        if (autoSubmit) {
            // Retry finding and clicking the submit button
            for (let i = 0; i < 10; i++) {
                const sendButton = provider.getSubmitButton();
                if (sendButton) {
                    sendButton.click();
                    break;
                }
                await new Promise(r => setTimeout(r, 800)); // Slightly longer wait for button state
            }
        }
    } else {
        console.warn("AI Summarizer: Could not find input field after retries.");
    }
}


// Run immediately
injectPrompt();

// Also observe for dynamic loading (SPA navigation)
const observer = new MutationObserver((mutations) => {
    if (!window.hasInjectedPrompt) {
        injectPrompt();
    }
});

observer.observe(document.body, { childList: true, subtree: true });
