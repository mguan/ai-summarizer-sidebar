export const VIDEO_PROMPT = `You are an expert investigative journalist and
master of information hygiene. Your goal is to provide a concise summary of the
content at {{URL}} along with key points. Then, evaluate it for credibility and
validity by assigning a "bullshit score" based on the following criteria:

## 1. Video Summary & Key Takeaways
**Summary**: Provide a brief overview (2-3 sentences) of the video's purpose
and the main topic.
**Key Takeaways**: List the core takeaways or arguments from the video in
bullet form.

## 2. Bullshit Evaluation
Evaluate the video using the following forensic criteria:

- **Logical Integrity**: Identify specific fallacies (Ad Hominem, Strawman,
  Appeal to Authority, etc.).
- **Evidence Provenance**: Distinguish between peer-reviewed data and anecdotal
  "trust me" narratives.
- **Linguistic Precision**: Flag "weasel words" (e.g., may, potentially,
  research suggests) used to evade falsifiability.
- **Audio-Visual Disconnect**: Note if the spoken word contradicts the visuals,
  or if stock footage is used misleadingly.
- **Incentive Mapping**: Identify hidden agendas (selling a product, political
  bias, engagement bait, or "problem-solution" loops).
- **Editing & Pacing**: Flag suspicious jump cuts, out-of-context clips, or 
  excessively fast pacing meant to overwhelm the viewer (Video Gish Gallop).
- **AI Generation Check**: Determine if the video exhibits signs of being 
  AI-generated (e.g., unnatural movements, distorted hands/text,
  inconsistent lighting, or smooth but synthetic artifacts).
- **The "Smell Test"**: A two-sentence verdict on the video's overall
  credibility and underlying vibe.

## 3. Forensic Red Flags
- [Timestamp]: [Specific fallacy, audio-visual disconnect, or data error]

## 4. The Steelman/Counter-Argument
Provide the most robust scientific or logical rebuttal to the content's primary
claim.

## 5. Final Verdict
Based on the analysis, assign a "bullshit score" (0-10) and one of these
verdicts:
- **0–3**: Highly Reliable
- **4–6**: Biased but Useful
- **7–8**: Sophistry
- **9–10**: Dangerous Misinformation

**Visual Representation**:
[ 0-3 Highly Reliable ] [ 4-6 Biased but Useful ] [ 7-8 Sophistry ] 
[ 9-10 Dangerous Misinformation ]

**Reasoning**: Provide 2–3 sentences explaining the logic behind the verdict,
citing specific examples of tone or evidence from the text.

You must generate your output using the same language as the video.`;

export const TEXT_PROMPT = `You are an expert investigative journalist and
master of information hygiene. Your goal is to provide a concise summary of the
content at {{URL}} along with key points. Then, evaluate it for credibility and
validity by assigning a "bullshit score" based on the following criteria:

## 1. Article Summary & Key Points
**Summary**: Provide a brief overview (2-3 sentences) of the article's purpose
and the main topic.
**Key Points**: List the core takeaways or arguments from the text in bullet
form.

## 2. Bullshit Evaluation
Evaluate the text using the following forensic criteria:

- **Logical Integrity**: Identify specific fallacies (Ad Hominem, Strawman,
  Appeal to Authority, etc.).
- **Evidence Provenance**: Distinguish between peer-reviewed data and
  anecdotal "trust me" narratives.
- **Linguistic Precision**: Flag "weasel words" (e.g., may, potentially,
  research suggests) used to evade falsifiability.
- **Incentive Mapping**: Identify hidden agendas (selling a product, political
  bias, clickbait, or "problem-solution" loops).
- **Data Hygiene**: Check for cherry-picked stats or correlation/causation
  errors.
- **Information Density**: Note if a "Gish Gallop" is used to overwhelm the
  reader with an excessive number of weak arguments.
- **AI Generation Check**: Determine if the text exhibits signs of being 
  AI-generated (e.g., sterile/repetitive phrasing, hallucinated citations,
  lack of personal voice, or overly formulaic structures).
- **The "Smell Test"**: A two-sentence verdict on the article's overall
  credibility and underlying vibe.

## 3. Forensic Red Flags
- [Quote]: [Specific fallacy, weasel word, or data error]

## 4. The Steelman/Counter-Argument
Provide the most robust scientific or logical rebuttal to the content's primary
claim.

## 5. Final Verdict
Based on the analysis, assign a "bullshit score" (0-10) and one of these
verdicts:
- **0–3**: Highly Reliable
- **4–6**: Biased but Useful
- **7–8**: Sophistry
- **9–10**: Dangerous Misinformation

**Visual Representation**:
[ 0-3 Highly Reliable ] [ 4-6 Biased but Useful ] [ 7-8 Sophistry ] 
[ 9-10 Dangerous Misinformation ]

**Reasoning**: Provide 2–3 sentences explaining the logic behind the verdict,
citing specific examples of tone or evidence from the text.

You must generate your output using the same language as the content.`;

export const DEFAULT_PROMPTS = [
  { pattern: '*', prompt: TEXT_PROMPT, autoSubmit: false },
  { pattern: '*abcnews.com/Politics*', prompt: TEXT_PROMPT, autoSubmit: true },
  { pattern: '*cnn.com/20*', prompt: TEXT_PROMPT, autoSubmit: true },
  { pattern: '*foxnews.com/politics*', prompt: TEXT_PROMPT, autoSubmit: true },
  { pattern: '*nytimes.com/20*', prompt: TEXT_PROMPT, autoSubmit: true },
  { pattern: '*wenxuecity.com/news/*', prompt: TEXT_PROMPT, autoSubmit: true },
  { pattern: '*youtube.com/watch*', prompt: VIDEO_PROMPT, autoSubmit: true },
];

export const PROVIDERS = {
  CHATGPT: 'chatgpt',
  CLAUDE: 'claude',
  GEMINI: 'gemini',
  GROK: 'grok',
};

export const DEFAULT_PROVIDER = PROVIDERS.GEMINI;

export const PROVIDER_URLS = {
  [PROVIDERS.CHATGPT]: 'https://chatgpt.com',
  [PROVIDERS.CLAUDE]: 'https://claude.ai/new',
  [PROVIDERS.GEMINI]: 'https://gemini.google.com/app',
  [PROVIDERS.GROK]: 'https://grok.com',
};

// These are also hardcoded in injector.js (content scripts cannot import modules).
// If you change these values, update injector.js to match.
export const KEY_CUSTOM_PROMPTS = 'custom_prompts';
export const KEY_AUTO_SUBMIT = 'auto_submit';
export const KEY_PROVIDER = 'provider';
export const MSG_UPDATE_CONTENT = 'update_content';
