const GENERIC_PROMPT = `Role: You are an expert researcher.
Task: Summarize the provided webpage.
Constraints: Ignore navigation menus, footers, and advertisements.
Structure: Provide a concise 2-3 sentence overview of the page content.
Main Points: Create a bulleted list of the core takeaways.
Tone: Direct, informative, and objective.
Language: Use the same language as the content.
Content: {{URL}}`;

const YOUTUBE_PROMPT = `Role: You are an expert researcher.
Task: Summarize the provided YouTube video.
Constraints: Remove bloat: ignore all sponsorships, "like and subscribe" requests, intro/outro music descriptions, and repetitive filler.
Structure: Provide a concise 2-3 sentence overview of the video's purpose.
Main Points: Create a bulleted list of the core takeaways. Each bullet should be a "TL;DR" of a specific segment.
Tone: Direct, informative, and objective.
Language: Use the same language as the content.
Video: {{URL}}`;

const DEFAULT_PROMPTS = [
    { pattern: "*", prompt: GENERIC_PROMPT },
    { pattern: "*youtube.com/watch*", prompt: YOUTUBE_PROMPT },
    { pattern: "*youtu.be/*", prompt: YOUTUBE_PROMPT }
];
