import {
    DEFAULT_PROVIDER,
    KEY_AUTO_SUBMIT,
    KEY_CUSTOM_PROMPTS,
    KEY_PROVIDER,
    MSG_UPDATE_CONTENT,
    PROVIDER_URLS,
} from './constants.js';
import { sortPromptsByPatternLength } from './utils.js';

// --- State ---
const state = {
    provider: DEFAULT_PROVIDER,
    prompts: []
};

// --- Initialization ---
async function init() {
    await loadSettings();
    setupEventListeners();
    updateSidePanelContent();
}

async function loadSettings() {
    const result = await chrome.storage.local.get([KEY_PROVIDER, KEY_CUSTOM_PROMPTS]);
    state.provider = result[KEY_PROVIDER] || DEFAULT_PROVIDER;
    state.prompts = sortPromptsByPatternLength(result[KEY_CUSTOM_PROMPTS] || []);
}

// --- Event Listeners ---
function setupEventListeners() {
    // Listen for messages from background/content scripts
    chrome.runtime.onMessage.addListener((request) => {
        if (request.type === MSG_UPDATE_CONTENT) {
            updateIframeContentFromUrl(request.url);
        }
    });

    // Listen for settings changes
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return;

        if (changes[KEY_CUSTOM_PROMPTS]) {
            state.prompts = sortPromptsByPatternLength(changes[KEY_CUSTOM_PROMPTS].newValue || []);
        }

        if (changes[KEY_PROVIDER]) {
            state.provider = changes[KEY_PROVIDER].newValue;
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
    if (iframe.src !== targetUrl) {
        iframe.src = targetUrl;
    }
}

function calculateTargetUrl(url) {
    const baseUrl = PROVIDER_URLS[state.provider] || PROVIDER_URLS[DEFAULT_PROVIDER];

    if (!url?.startsWith('http')) return baseUrl;

    const match = findMatchingPrompt(url);
    if (!match) {
        return baseUrl;
    }

    const finalPrompt = match.prompt.replace(/{{URL}}/g, url);
    // If pattern is '*', do not auto-submit. Otherwise, auto-submit.
    const autoSubmit = match.pattern !== '*';

    try {
        const targetUrl = new URL(baseUrl);
        targetUrl.searchParams.set(KEY_CUSTOM_PROMPTS, finalPrompt);
        targetUrl.searchParams.set(KEY_AUTO_SUBMIT, autoSubmit.toString());
        return targetUrl.toString();
    } catch (e) {
        console.error('Invalid base URL:', baseUrl, e);
        return baseUrl;
    }
}

function globToRegex(pattern) {
    const parts = pattern.split('*').map(p => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp('^' + parts.join('.*') + '$');
}

function findMatchingPrompt(url) {
    return state.prompts.find(item => globToRegex(item.pattern).test(url)) || null;
}

// --- Start ---
init();
