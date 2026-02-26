export function sortPromptsByPatternLength(prompts) {
    return [...prompts].sort((a, b) => b.pattern.length - a.pattern.length);
}

