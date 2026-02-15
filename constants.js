export const GENERIC_PROMPT = `You are an expert investigative journalist and
master of information hygiene. Your goal is to provide a concise summary of
the content at {{URL}} along with key points. Then, evaluate it for credibility and
validity by assigning a "bullshit score" based on the following criteria:

1. Summary & Key Points
Summary: Provide a brief overview (2-3 sentences) of the video's purpose and
the main topic.
Key Points: List the core takeaways or arguments from the conternt in bullet form.

2. Bullshit Evaluation
Evaluate the content using the following forensic criteria:

Logical Integrity: Identify specific fallacies (Ad Hominem, Strawman,
Appeal to Authority, etc.).

Evidence Provenance: Distinguish between peer-reviewed data and anecdotal
"trust me" narratives.

Linguistic Precision: Flag "weasel words" (e.g., may, potentially,
research suggests) used to evade falsifiability.

Incentive Mapping: Identify hidden agendas (selling a product, political
bias, or "problem-solution" loops).

Data Hygiene: Check for cherry-picked stats or correlation/causation errors.

Information Density: Note if a "Gish Gallop" is used to overwhelm the
audience.

The "Smell Test": A two-sentence verdict on the video’s overall credibility
and underlying vibe.

Forensic Red Flags:
[Timestamp/Quote]: [Specific fallacy or data error]

The Steelman/Counter-Argument: Provide the most robust scientific or logical
rebuttal to the video’s primary claim.

Final Verdict: 

Based on the score, assign one of these verdicts:

Highly Reliable (0–3)

Biased but Useful (4–6)

Sophistry (7–8)

Dangerous Misinformation (9–10)

4. Visual Representation

Here’s a more intuitive graphic showing the verdict based on the final score:

[ 0-3 Highly Reliable ]  [ 4-6 Biased but Useful ]  [ 7-8 Sophistry ]  [ 9-10 Dangerous Misinformation ]

Reasoning: (Provide 2–3 sentences explaining the logic behind the verdict,
citing specific examples of tone or evidence from the text.)

You must generate your output using the same language as the content.`;


export const DEFAULT_PROMPTS = [
  { pattern: '*', prompt: GENERIC_PROMPT },
  { pattern: '*cnn.com/20*', prompt: GENERIC_PROMPT },
  { pattern: '*foxnews.com/politics*', prompt: GENERIC_PROMPT },
  { pattern: '*nytimes.com/20*', prompt: GENERIC_PROMPT },
  { pattern: '*wenxuecity.com/news/*', prompt: GENERIC_PROMPT },
  { pattern: '*youtube.com/watch*', prompt: GENERIC_PROMPT },
];

export const DEFAULT_PROVIDER = 'gemini';

export const PROVIDER_URLS = {
  'chatgpt': 'https://chatgpt.com',
  'claude': 'https://claude.ai/new',
  'gemini': 'https://gemini.google.com/app',
  'grok': 'https://grok.com',
};

// KEY_CUSTOM_PROMPTS and KEY_AUTO_SUBMIT are also defined in injector.js
// If you modify these, be sure to modify them in injector.js as well.
export const KEY_CUSTOM_PROMPTS = 'custom_prompts';
export const KEY_AUTO_SUBMIT = 'auto_submit';


export const KEY_PROVIDER = 'provider';
export const MSG_UPDATE_CONTENT = 'update_content';
