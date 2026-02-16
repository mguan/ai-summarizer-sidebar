# AI Summarizer Sidebar

**Are you frustrated with the amount of AI crap, intrusive ads, misinformation, and fake news on the web?** If so, use this free, open-source tool to automatically cut through the noise, get to the point, and call out BS.

> **Free • Open Source • Private • No Sign-up Required**

## Installation (Takes 2 Minutes)

1.  **[Download the latest release (Source code zip)](https://github.com/mguan/ai-summarizer-sidebar/releases)** and unzip it.
2.  Open Chrome and go to `chrome://extensions/`.
3.  Turn on **Developer mode** (top right switch).
4.  Click **Load unpacked** (top left).
5.  Select the unzipped folder.
6.  Pin the extension to your toolbar. Done!

## Privacy & Data

*   **Zero Tracking**: We collect **no data**. The extension runs entirely on your device.
*   **Direct Connection**: When you open the sidebar, the extension sends *only* the current tab's URL to the AI provider you select.
*   **No new accounts**: You log in directly to the AI provider (e.g. ChatGPT). We never see your password.

## Features

*   **Multi-Provider Support**: Switch between ChatGPT, Claude, Gemini, and Grok.
*   **Smart Context**: Automatically feeds the webpage content to the AI and generate summaries.
*   **Customizable**: Create your own prompts for specific websites.

## Usage & Troubleshooting

1.  Open the sidebar on any page. It will load your selected AI.
2.  If the AI doesn't load, make sure you are logged into that provider in a normal tab.
3.  If the prompt doesn't inject, try refreshing the page.

<details>
<summary><b>Technical Note: How it works (Click to expand)</b></summary>

This extension embeds AI chat pages (ChatGPT, Claude, Gemini, Grok) directly into the sidebar using an HTML `iframe`. To make this possible, we modify certain browser headers (`X-Frame-Options` and `Content-Security-Policy`) for these specific domains *only while you are using the extension*.

**Security Note**: While we restrict this modification strictly to this extension, it does technically relax the iframe policy for these sites within the context of the sidebar. As always, only install extensions from trusted sources.
</details>

## Configuration (Optional)

Right-click the extension icon -> **Options** to customize:
-   **Preferred AI Service**: Choose your default (ChatGPT, Claude, etc.).
-   **Custom Prompts**: Set specific instructions for specific websites (e.g., `*wikipedia.org*`).
