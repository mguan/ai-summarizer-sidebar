import {
    DEFAULT_PROVIDER,
    KEY_AUTO_SUBMIT,
    KEY_CUSTOM_PROMPTS,
    KEY_PROVIDER,
    MSG_UPDATE_CONTENT,
    PROVIDERS
} from './constants.js';
import { sortPromptsByPatternLength } from './utils.js';

// --- State ---
const state = {
    provider: DEFAULT_PROVIDER,
    prompts: []
};

const lastProcessedUrls = {};

// --- Initialization ---
async function init() {
    await loadSettings();
    setupEventListeners();
    updateActiveTabUI();
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
    });

    // Add tab click listeners
    const tabsContainer = document.getElementById('tabs-container');
    if (tabsContainer) {
        tabsContainer.addEventListener('click', (e) => {
            const tab = e.target.closest('.tab');
            if (tab) {
                const newProvider = tab.dataset.provider;
                if (newProvider && newProvider !== state.provider) {
                    state.provider = newProvider;
                    chrome.storage.local.set({ [KEY_PROVIDER]: newProvider });
                    updateActiveTabUI();
                    updateSidePanelContent();
                }
            }
        });
    }
}

function updateActiveTabUI() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.provider === state.provider);
    });
}

// --- Core Logic ---
async function updateSidePanelContent() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tabs?.[0]?.url;
    if (url) updateIframeContentFromUrl(url);
}

function updateIframeContentFromUrl(url) {
    Object.entries(PROVIDERS).forEach(([provider, { url: baseUrl }]) => {
        const iframe = document.getElementById(`frame-${provider}`);
        if (!iframe) return;

        if (provider !== state.provider) {
            iframe.classList.add('hidden');
            return;
        }

        iframe.classList.remove('hidden');
        const targetUrl = calculateTargetUrl(url, baseUrl);

        const isFirstLoad = !iframe.getAttribute('src');
        const urlChanged = url !== lastProcessedUrls[provider];
        const hasPromptMatch = targetUrl !== baseUrl;

        if (isFirstLoad || urlChanged) {
            lastProcessedUrls[provider] = url;
            if (isFirstLoad || hasPromptMatch) {
                iframe.src = targetUrl;
            }
        }
    });
}

function calculateTargetUrl(url, baseUrl) {
    if (!url?.startsWith('http')) return baseUrl;

    const match = state.prompts.find(item => globToRegex(item.pattern).test(url));
    if (!match) return baseUrl;

    const finalPrompt = match.prompt.replace(/{{URL}}/g, url);

    try {
        const targetUrl = new URL(baseUrl);
        targetUrl.searchParams.set(KEY_CUSTOM_PROMPTS, finalPrompt);
        targetUrl.searchParams.set(KEY_AUTO_SUBMIT, match.autoSubmit.toString());
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

// --- Start ---
init();
