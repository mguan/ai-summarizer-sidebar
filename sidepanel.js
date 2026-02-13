// --- Constants ---
const DEFAULT_PROVIDER = 'gemini';
const PROVIDER_URLS = {
    'chatgpt': 'https://chatgpt.com/?custom_q=',
    'claude': 'https://claude.ai/new?custom_q=',
    'gemini': 'https://gemini.google.com/app?custom_q=',
    'grok': 'https://grok.com/?custom_q='
};

// --- State ---
const state = {
    provider: DEFAULT_PROVIDER,
    prompts: []
};

// --- Initialization ---
function init() {
    loadSettings().then(() => {
        setupEventListeners();
        updateSidePanelContent();
    });
}

function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['provider', 'customPrompts'], (result) => {
            state.provider = result.provider || DEFAULT_PROVIDER;
            state.prompts = result.customPrompts || [];
            resolve();
        });
    });
}

// --- Event Listeners ---
function setupEventListeners() {
    // Listen for messages from background/content scripts
    chrome.runtime.onMessage.addListener((request) => {
        if (request.type === "UPDATE_CONTENT") {
            updateIframeContentFromUrl(request.url);
        }
    });

    // Listen for settings changes
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return;

        if (changes.customPrompts) {
            state.prompts = changes.customPrompts.newValue;
        }

        if (changes.provider) {
            state.provider = changes.provider.newValue;
            updateSidePanelContent();
        }
    });
}

// --- Core Logic ---
function updateSidePanelContent() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs?.[0]?.url;
        if (url) updateIframeContentFromUrl(url);
    });
}

function updateIframeContentFromUrl(url) {
    const targetUrl = calculateTargetUrl(url);

    const iframe = document.getElementById('content-frame');
    if (iframe && iframe.src !== targetUrl) {
        iframe.src = targetUrl;
    }
}

function calculateTargetUrl(url) {
    const baseUrl = getBaseUrl();

    if (!isValidHttpUrl(url)) {
        return baseUrl;
    }

    const match = findMatchingPrompt(url);
    if (!match) {
        return baseUrl;
    }

    const finalPrompt = match.prompt.replace(/{{URL}}/g, url);
    // If pattern is '*', do not auto-submit. Otherwise, auto-submit.
    const autoSubmit = match.pattern !== '*';

    return `${baseUrl}${encodeURIComponent(finalPrompt)}&auto_submit=${autoSubmit}`;
}

function findMatchingPrompt(url) {
    if (!state.prompts || state.prompts.length === 0) return null;

    // Sort by pattern length (longest first) for specificity
    const sortedPrompts = [...state.prompts].sort((a, b) => b.pattern.length - a.pattern.length);
    return sortedPrompts.find(item => isUrlMatch(url, item.pattern)) || null;
}

function isUrlMatch(url, pattern) {
    // Convert glob pattern (e.g., "example.com/*") to regex
    const regexString = '^' + pattern.split('*').map(escapeRegex).join('.*') + '$';
    return new RegExp(regexString).test(url);
}

// --- Utilities ---
function isValidHttpUrl(url) {
    return url && url.startsWith('http');
}

function getBaseUrl() {
    return PROVIDER_URLS[state.provider] || PROVIDER_URLS[DEFAULT_PROVIDER];
}

function escapeRegex(string) {
    return string.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}

// --- Start ---
init();
