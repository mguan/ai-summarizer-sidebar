// Import shared constants (available in Service Worker context)
try {
    importScripts('constants.js');
} catch (e) {
    console.error(e);
}

// Open side panel on icon click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Modify headers to allow embedding
const EXTENSION_ORIGIN = 'chrome-extension://' + chrome.runtime.id;

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
            // Match Gemini, ChatGPT, Claude, and Grok
            regexFilter: "^https://(gemini\\.google\\.com|chatgpt\\.com|claude\\.ai|grok\\.com|accounts\\.google\\.com)/.*",
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
    chrome.storage.local.get(['customPrompts', 'provider'], (result) => {
        if (!result.customPrompts && typeof DEFAULT_PROMPTS !== 'undefined') {
            chrome.storage.local.set({ customPrompts: DEFAULT_PROMPTS });
        }
        if (!result.provider) {
            chrome.storage.local.set({ provider: 'gemini' });
        }
    });
});

// Detect URL changes to trigger the content update
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && (tab.url.startsWith('http'))) {
        chrome.runtime.sendMessage({
            type: "UPDATE_CONTENT",
            url: tab.url
        }).catch((error) => {
            // Suppress error if side panel is closed (no receiver)
        });
    }
});
