# AI Summarizer Sidebar

**Frustrated with AI slop, ads, and misinformation?** Use this free, open-source tool to cut through the noise, get to the point, and call out BS.

> **Free • Open Source • Private • No Sign-up or API Key Required**

## Installation (2 Mins)

1.  **[Download the latest release](https://github.com/mguan/ai-summarizer-sidebar/releases)** and unzip.
2.  Go to `chrome://extensions/` in Chrome and enable **Developer mode** (top right).
3.  Click **Load unpacked**, select the unzipped folder, and pin the extension.

## Key Features & Privacy

*   **Zero Tracking**: We collect **no data**. The extension runs entirely on your device.
*   **No API Keys**: Works with your existing logged-in accounts (ChatGPT, Claude, Gemini, Grok).
*   **Smart Context**: Automatically feeds webpage content to the AI for summarization.
*   **Customizable**: Right-click the icon -> **Options** to set custom prompts or change your default AI provider.

## Troubleshooting

*   If the AI doesn't load, ensure you are logged into that provider in a normal tab.
*   If the prompt doesn't inject, try refreshing the page.

<details>
<summary><b>Technical Note: How it works</b></summary>

This extension embeds AI chat pages directly into the sidebar using an `iframe`. To enable this, we securely modify `X-Frame-Options` and `Content-Security-Policy` headers for these specific domains *only within the sidebar context*.
</details>
