export function sortPromptsByPatternLength(prompts) {
    return [...prompts].sort((a, b) => b.pattern.length - a.pattern.length);
}

export function escapeRegex(value) {
    return value.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}

export function isUrlMatchGlob(url, pattern) {
    const regexString = '^' + pattern.split('*').map(escapeRegex).join('.*') + '$';
    return new RegExp(regexString).test(url);
}
