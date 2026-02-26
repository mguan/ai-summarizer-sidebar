import {
    DEFAULT_PROMPTS,
    DEFAULT_PROVIDER,
    KEY_CUSTOM_PROMPTS,
    KEY_PROVIDER,
} from './constants.js';
import { sortPromptsByPatternLength } from './utils.js';

const STATUS = { SUCCESS: 'success', ERROR: 'error', DIRTY: 'dirty' };

const elements = {
    promptSelect: document.getElementById('prompt-select'),
    editArea: document.getElementById('edit-area'),
    editPattern: document.getElementById('edit-pattern'),
    editPromptText: document.getElementById('edit-prompt-text'),
    saveEditBtn: document.getElementById('save-edit-btn'),
    deletePromptBtn: document.getElementById('delete-prompt-btn'),
    resetAllBtn: document.getElementById('reset-all-btn'),
    defaultPromptBtn: document.getElementById('default-prompt-btn'),
    statusIndicator: document.getElementById('status-indicator'),
    providerSelect: document.getElementById('provider-select'),
};


const state = {
    prompts: [],
    provider: DEFAULT_PROVIDER,
};

// Initialize
function init() {
    chrome.storage.local.get([KEY_CUSTOM_PROMPTS, KEY_PROVIDER], (result) => {
        state.prompts = result[KEY_CUSTOM_PROMPTS] || [...DEFAULT_PROMPTS];
        state.provider = result[KEY_PROVIDER] || DEFAULT_PROVIDER;

        if (!result[KEY_CUSTOM_PROMPTS]) {
            chrome.storage.local.set({ [KEY_CUSTOM_PROMPTS]: state.prompts });
        }

        renderPromptsSelect();
        updateEditMode('new');

        elements.providerSelect.value = state.provider;
    });

    setupEventListeners();
}

function setupEventListeners() {
    elements.promptSelect.addEventListener('change', handlePromptSelectChange);

    elements.providerSelect.addEventListener('change', handleProviderChange);

    elements.saveEditBtn.addEventListener('click', savePrompt);
    elements.deletePromptBtn.addEventListener('click', deletePrompt);
    elements.defaultPromptBtn.addEventListener('click', defaultPrompt);
    elements.resetAllBtn.addEventListener('click', resetAll);

    // Dirty state tracking
    elements.editPattern.addEventListener('input', () => setStatus('URL pattern changed (unsaved)...', STATUS.DIRTY));
    elements.editPromptText.addEventListener('input', () => setStatus('Prompt changed (unsaved)...', STATUS.DIRTY));
}

// Event Handlers
function handlePromptSelectChange(e) {
    updateEditMode(e.target.value);
}

function handleProviderChange(e) {
    state.provider = e.target.value;
    chrome.storage.local.set({ [KEY_PROVIDER]: state.provider });
    setStatus('Provider updated!', STATUS.SUCCESS, true);
}

function updateEditMode(value) {
    const isNew = value === 'new';

    setStatus(); // Clear dirty state when switching

    if (isNew) {
        elements.editPattern.value = "";
        elements.editPromptText.value = "";
    } else {
        const promptObj = state.prompts.find(p => p.pattern === value);
        if (promptObj) {
            elements.editPattern.value = promptObj.pattern;
            elements.editPromptText.value = promptObj.prompt;
        }
    }

    elements.editPattern.readOnly = false;

    toggleVisibility(elements.deletePromptBtn, !isNew);

    const isDefault = !isNew && DEFAULT_PROMPTS.some(p => p.pattern === value);
    toggleVisibility(elements.defaultPromptBtn, isDefault);
}

function toggleVisibility(element, isVisible) {
    element.style.display = isVisible ? 'inline-flex' : 'none';
}

function renderPromptsSelect() {
    const currentValue = elements.promptSelect.value;
    const currentPatternInInput = elements.editPattern.value;

    elements.promptSelect.innerHTML = '<option value="new">-- Add New Pattern --</option>';

    const sortedPrompts = sortPromptsByPatternLength(state.prompts);

    sortedPrompts.forEach(item => {
        const option = document.createElement('option');
        option.value = item.pattern;
        option.textContent = item.pattern;
        elements.promptSelect.appendChild(option);
    });

    restoreSelection(currentValue, currentPatternInInput);
}

function restoreSelection(currentValue, currentPatternInInput) {
    if (currentValue && (currentValue === 'new' || state.prompts.some(p => p.pattern === currentValue))) {
        elements.promptSelect.value = currentValue;
    } else if (state.prompts.some(p => p.pattern === currentPatternInInput)) {
        elements.promptSelect.value = currentPatternInInput;
    }
}

// Logic Actions
function savePrompt() {
    const newPattern = elements.editPattern.value.trim();
    const promptText = elements.editPromptText.value.trim();
    const originalPattern = elements.promptSelect.value;
    const isNew = originalPattern === 'new';

    if (!newPattern || !promptText) {
        return setStatus('Please enter both a URL pattern and a prompt.', STATUS.ERROR);
    }

    const exists = state.prompts.some(p => p.pattern === newPattern);
    if (exists && (isNew || newPattern !== originalPattern)) {
        return setStatus('URL pattern already exists! Please choose another.', STATUS.ERROR);
    }

    if (isNew) {
        state.prompts.push({ pattern: newPattern, prompt: promptText });
    } else {
        const index = state.prompts.findIndex(p => p.pattern === originalPattern);
        if (index !== -1) {
            state.prompts[index].pattern = newPattern;
            state.prompts[index].prompt = promptText;
        }
    }

    saveAndRefresh("Changes saved!", newPattern);
}

function deletePrompt() {
    const pattern = elements.promptSelect.value;
    if (pattern === 'new' || !confirm(`Delete prompt for "${pattern}"?`))
        return;

    state.prompts = state.prompts.filter(p => p.pattern !== pattern);
    saveAndRefresh('Prompt deleted!', 'new');
}

function defaultPrompt() {
    const pattern = elements.promptSelect.value;
    const defaultObj = DEFAULT_PROMPTS.find(p => p.pattern === pattern);

    if (!defaultObj) return;

    elements.editPromptText.value = defaultObj.prompt;
    setStatus("Prompt reset to default (unsaved)...", STATUS.DIRTY);
}

function resetAll() {
    if (!confirm('Reset ALL prompts to defaults?')) return;

    state.prompts = [...DEFAULT_PROMPTS];
    saveAndRefresh('Defaults restored!', 'new');
}

function saveAndRefresh(message, nextSelection) {
    chrome.storage.local.set({ [KEY_CUSTOM_PROMPTS]: state.prompts });
    if (message) setStatus(message, STATUS.SUCCESS, true);

    renderPromptsSelect();
    elements.promptSelect.value = nextSelection;
    updateEditMode(nextSelection);
}

// Status Indicator Logic
// Pass timeout=true for transient post-save confirmations (auto-dismisses after 2s).
// Omit timeout (or pass false) for persistent messages like unsaved state.
function setStatus(message = '', type = null, timeout = false) {
    elements.statusIndicator.textContent = message;
    elements.statusIndicator.className = type ? `status-bar status-${type}` : 'status-bar';

    if (timeout) {
        setTimeout(() => {
            if (elements.statusIndicator.textContent === message) {
                setStatus();
            }
        }, 2000);
    }
}

init();
