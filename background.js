import { DEFAULT_PROMPTS, DEFAULT_PROVIDER, KEY_CUSTOM_PROMPTS, KEY_PROVIDER } from './constants.js';

// Open side panel on icon click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Modify headers to allow embedding
const EXTENSION_ORIGIN = 'chrome-extension://' + chrome.runtime.id;
const AI_DOMAINS = [
    "chatgpt\\.com",
    "claude\\.ai",
    "gemini\\.google\\.com",
    "grok\\.com"
];

const RULES = [
    {
        id: 1,
        priority: 1,
        action: {
            type: "modifyHeaders",
            responseHeaders: [
                { header: "X-Frame-Options", operation: "remove" },
                { header: "content-security-policy", operation: "set", value: `frame-ancestors 'self' ${EXTENSION_ORIGIN}` }
            ]
        },
        condition: {
            // Match supported AI providers
            regexFilter: `^https://(${AI_DOMAINS.join('|')})/.*`,
            resourceTypes: ["sub_frame"]
        }
    }
];

chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: RULES.map(r => r.id),
    addRules: RULES
});

// Initialize default settings on install
chrome.runtime.onInstalled.addListener((details) => {
    chrome.storage.local.get([KEY_CUSTOM_PROMPTS, KEY_PROVIDER], (result) => {
        if (!result[KEY_CUSTOM_PROMPTS] && typeof DEFAULT_PROMPTS !== 'undefined') {
            chrome.storage.local.set({ [KEY_CUSTOM_PROMPTS]: DEFAULT_PROMPTS });
        }
        if (!result[KEY_PROVIDER]) {
            chrome.storage.local.set({ [KEY_PROVIDER]: DEFAULT_PROVIDER });
        }
    });
});

// Detect URL changes to trigger the content update
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        chrome.runtime.sendMessage({
            type: "UPDATE_CONTENT",
            url: tab.url
        }).catch((error) => {
            // Suppress error if side panel is closed (no receiver), which is expected behavior
        });
    }
});
