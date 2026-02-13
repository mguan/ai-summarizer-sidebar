// Open side panel on icon click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Modify headers to allow embedding
const RULES = [
    {
        id: 1,
        priority: 1,
        action: {
            type: "modifyHeaders",
            responseHeaders: [
                { header: "X-Frame-Options", operation: "remove" },
                { header: "content-security-policy", operation: "remove" }
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
