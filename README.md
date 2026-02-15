# AI Summarizer Sidebar

A Chrome extension that integrates AI assistants (Claude, ChatGPT, Gemini, Grok) directly into your browser's sidebar. It automatically summarizes and assigns a bullshit score to the webpage or video you are currently viewing using customizable prompts.

## Features

-   **Multi-Provider Support:** Seamlessly switch between ChatGPT, Claude, Gemini and Grok.
-   **Smart Context Awareness:** Automatically detects the current page URL and injects it into the AI prompt.
-   **Customizable Prompts:** distinct prompts for different websites using URL patterns.
    -   *Example:* set a specific prompt for YouTube videos (`*youtube.com*`) to "Summarize this video" and another for generic pages (`*`) to "Summarize this article".
-   **Auto-Submit:** Automatically sends the prompt to the AI for immediate results (configurable).
-   **Sidebar Interface:** persistent access to your AI assistant alongside your browsing content.
-   **Header Modification:** handles `X-Frame-Options` and CSP headers to ensure AI providers load correctly within the sidebar.

> [!WARNING]
> **Security Notice: Header Modification & Embedded Iframes**
>
> **How It Works**: This extension functions by embedding AI chat pages (ChatGPT, Claude, Gemini, Grok) directly into the sidebar using an HTML `iframe`. By default, these services send strict security headers (`X-Frame-Options` and `Content-Security-Policy`) to prevent themselves from being embedded anywhere. To make this extension possible, we must **modify these headers** for the specific AI domains to allow framing within the extension.
>
> **The Risk**: While we restrict framing to **only this extension** (using `frame-ancestors`)—which is much safer than allowing all framing—it still technically relaxes the strict "do not frame" policy of these providers.
>
> **User Caution**:
> *   **Awareness**: Be aware that while using this extension, you are browsing these AI sites with slightly relaxed framing protections.
> *   **Trusted Source**: Ensure you install this extension only from a trusted source (e.g., the official repository or Chrome Web Store) to prevent malicious code from exploiting these relaxed headers.

## Installation


1.  **Download** the latest release "Source code (zip)" from the [releases page](https://github.com/mguan/ai-summarizer-sidebar/releases)
 and unzip the file.
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Toggle **Developer mode** in the top right corner.
4.  Click **Load unpacked** in the top left.
5.  Select the directory where you saved/unzipped this project.
6.  Go to the extension details and click **Pin to toolbar**.
7.  The "AI Summarizer Sidebar" icon should appear in your toolbar.
8.  Open a YouTube video or any other page and click the extension icon to open the sidebar. The summary should appear in the sidebar.

## Configuration (Optional)

You can configure the extension via the **Options Page**. To access it:
-   Right-click the extension icon in the toolbar and select **Options**.
-   Or, go to `chrome://extensions`, find the expansion, click **Details**, then **Extension options**.

### Settings Available:

-   **Preferred AI Service:** Choose your default AI provider (ChatGPT, Claude, Gemini or Grok).
-   **Custom Prompts:** Manage your prompt strategies.
    -   **URL Pattern:** Define where the prompt applies (e.g., `*wikipedia.org*`). Supports wildcards (`*`).
    -   **Prompt Template:** Write your instruction. Use `{{URL}}` as a placeholder for the current page's link.
    -   **Reset Options:** You can reset individual prompts to their defaults or reset all prompts at once.
    -   **Priority:** The extension uses the *longest matching pattern* for specificity.

## Usage

1.  Click the extension icon in the Chrome toolbar to open the **Side Panel**.
2.  Navigate to any webpage you wish to analyze.
3.  The sidebar will automatically load your selected AI provider.
4.  If a defined pattern matches the current URL, the extension will:
    -   Construct the prompt using your template.
    -   Inject the prompt into the AI's chat input.
    -   (Depending on settings) Automatically click "Send".

## Permissions

This extension requires the following permissions to function:
-   `sidePanel`: To display the sidebar interface.
-   `declarativeNetRequest`: To modify HTTP headers for iframe embedding compatibility.
-   `storage`: To save your preferences and custom prompts.
-   `tabs`: To read the current tab's URL.
-   `host_permissions`: Access to AI provider domains (`chatgpt.com`, `claude.ai`, `gemini.google.com`, `grok.com`) to inject scripts.

## Troubleshooting

-   **Iframe not loading?** Ensure you are logged into the respective AI provider's website in your main browser window.
-   **Prompt not injecting?** Refresh the sidebar or the webpage. Some AI providers often change their DOM structure, which may require an update to the `injector.js` selectors.
