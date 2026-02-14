import {
    DEFAULT_PROMPTS,
    DEFAULT_PROVIDER,
    KEY_CUSTOM_PROMPTS,
    KEY_PROVIDER,
} from './constants.js';

const elements = {
    promptSelect: document.getElementById('prompt-select'),
    editArea: document.getElementById('edit-area'),
    editPattern: document.getElementById('edit-pattern'),
    editPromptText: document.getElementById('edit-prompt-text'),
    saveEditBtn: document.getElementById('save-edit-btn'),
    deletePromptBtn: document.getElementById('delete-prompt-btn'),
    resetAllBtn: document.getElementById('reset-all-btn'),
    resetPromptBtn: document.getElementById('reset-prompt-btn'),
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

        if (elements.providerSelect) {
            elements.providerSelect.value = state.provider;
        }
    });

    setupEventListeners();
}

function setupEventListeners() {
    elements.promptSelect.addEventListener('change', handlePromptSelectChange);

    if (elements.providerSelect) {
        elements.providerSelect.addEventListener('change', handleProviderChange);
    }

    elements.saveEditBtn.addEventListener('click', savePrompt);
    elements.deletePromptBtn.addEventListener('click', deletePrompt);
    elements.resetPromptBtn.addEventListener('click', resetCurrentPrompt);
    elements.resetAllBtn.addEventListener('click', resetAll);

    // Dirty state tracking
    elements.editPattern.addEventListener('input', setDirty);
    elements.editPromptText.addEventListener('input', setDirty);
}

// Event Handlers
function handlePromptSelectChange(e) {
    updateEditMode(e.target.value);
}

function handleProviderChange(e) {
    state.provider = e.target.value;
    chrome.storage.local.set({ [KEY_PROVIDER]: state.provider });
    showStatus('Provider updated!', 'success');
}

function updateEditMode(value) {
    const isNew = value === 'new';

    setClean(); // Clear dirty state when switching

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
    elements.saveEditBtn.textContent = isNew ? 'Add Pattern' : 'Update Pattern';

    toggleVisibility(elements.deletePromptBtn, !isNew);

    const isDefault = !isNew && DEFAULT_PROMPTS.some(p => p.pattern === value);
    toggleVisibility(elements.resetPromptBtn, isDefault);
}

function toggleVisibility(element, isVisible) {
    element.style.display = isVisible ? 'inline-flex' : 'none';
}

function renderPromptsSelect() {
    const currentValue = elements.promptSelect.value;
    const currentPatternInInput = elements.editPattern.value;

    elements.promptSelect.innerHTML = '<option value="new">-- Add New Pattern --</option>';

    const sortedPrompts = [...state.prompts].sort((a, b) => a.pattern.localeCompare(b.pattern));

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
        return showStatus('Please enter both a pattern and a prompt.', 'error');
    }

    const exists = state.prompts.some(p => p.pattern === newPattern);
    if (exists && (isNew || newPattern !== originalPattern)) {
        return showStatus('Pattern already exists! Please choose another.', 'error');
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
    if (pattern === 'new' || !confirm(`Delete prompt for "${pattern}"?`)) return;

    state.prompts = state.prompts.filter(p => p.pattern !== pattern);
    saveAndRefresh('Prompt deleted!', 'new');
}

function resetCurrentPrompt() {
    const pattern = elements.promptSelect.value;
    const defaultObj = DEFAULT_PROMPTS.find(p => p.pattern === pattern);

    if (!defaultObj || !confirm(`Reset prompt for "${pattern}" to its default value?`)) return;

    elements.editPromptText.value = defaultObj.prompt;
    setDirty();
    showStatus("Prompt reset to default (unsaved)", "success");
}

function resetAll() {
    if (!confirm('Reset ALL prompts to defaults?')) return;

    state.prompts = [...DEFAULT_PROMPTS];
    saveAndRefresh('Defaults restored!', 'new');
}

function saveAndRefresh(message, nextSelection) {
    chrome.storage.local.set({ [KEY_CUSTOM_PROMPTS]: state.prompts });
    if (message) showStatus(message, 'success');

    renderPromptsSelect();
    elements.promptSelect.value = nextSelection;
    updateEditMode(nextSelection);
}

// Status Indicator Logic
function setDirty() {
    if (elements.statusIndicator.textContent !== 'Unsaved changes...') {
        elements.statusIndicator.textContent = 'Unsaved changes...';
        elements.statusIndicator.className = 'status-bar status-dirty';
    }
}

function setClean() {
    elements.statusIndicator.textContent = '';
    elements.statusIndicator.className = 'status-bar';
}

function showStatus(message, type = 'success') {
    elements.statusIndicator.textContent = message;
    elements.statusIndicator.className = `status-bar status-${type}`;

    setTimeout(() => {
        if (elements.statusIndicator.textContent === message) {
            setClean();
        }
    }, 2000);
}

init();
