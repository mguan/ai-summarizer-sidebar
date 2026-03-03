import {
    DEFAULT_PROMPTS,
    KEY_CUSTOM_PROMPTS,
    PROMPT_TEMPLATES,
} from './constants.js';
import { sortPromptsByPatternLength } from './utils.js';

const STATUS = { SUCCESS: 'success', ERROR: 'error', DIRTY: 'dirty' };

const elements = {
    patternSelect: document.getElementById('pattern-select'),
    editAutoSubmit: document.getElementById('edit-auto-submit'),
    editArea: document.getElementById('edit-area'),
    editPattern: document.getElementById('edit-pattern'),
    editPromptText: document.getElementById('edit-prompt-text'),
    saveEditBtn: document.getElementById('save-edit-btn'),
    deletePromptBtn: document.getElementById('delete-prompt-btn'),
    resetAllBtn: document.getElementById('reset-all-btn'),
    statusIndicator: document.getElementById('status-indicator'),
    templateSelect: document.getElementById('template-select'),
};


const state = {
    prompts: [],
};

// Initialize
async function init() {
    const result = await chrome.storage.local.get([KEY_CUSTOM_PROMPTS]);
    state.prompts = result[KEY_CUSTOM_PROMPTS] || structuredClone(DEFAULT_PROMPTS);

    if (!result[KEY_CUSTOM_PROMPTS]) {
        chrome.storage.local.set({ [KEY_CUSTOM_PROMPTS]: state.prompts });
    }

    renderPromptsSelect();
    updateEditMode('new');

    setupEventListeners();
}

function setupEventListeners() {
    elements.patternSelect.addEventListener('change', e => updateEditMode(e.target.value));
    elements.templateSelect.addEventListener('change', handleTemplateSelectChange);

    elements.saveEditBtn.addEventListener('click', savePrompt);
    elements.deletePromptBtn.addEventListener('click', deletePrompt);
    elements.resetAllBtn.addEventListener('click', resetAll);


    // Dirty state tracking
    elements.editPattern.addEventListener('input', () => setStatus('URL pattern changed (unsaved)...', STATUS.DIRTY));
    elements.editAutoSubmit.addEventListener('change', () => setStatus('Auto submit changed (unsaved)...', STATUS.DIRTY));
    elements.editPromptText.addEventListener('input', () => setStatus('Prompt changed (unsaved)...', STATUS.DIRTY));
}

// Event Handlers
function handleTemplateSelectChange(e) {
    const value = e.target.value;
    if (!value) return;
    elements.editPromptText.value = PROMPT_TEMPLATES[value] ?? PROMPT_TEMPLATES.text;
    e.target.value = '';
    setStatus('Template loaded (unsaved)...', STATUS.DIRTY);
}

function updateEditMode(value) {
    setStatus();

    const promptObj = state.prompts.find(p => p.pattern === value);

    elements.editPattern.value = promptObj?.pattern || '';
    elements.editAutoSubmit.checked = promptObj?.autoSubmit || false;
    elements.editPromptText.value = promptObj?.prompt || '';
    elements.editPattern.readOnly = false;

    elements.deletePromptBtn.style.display = promptObj ? 'inline-flex' : 'none';
}

function renderPromptsSelect() {
    const currentValue = elements.patternSelect.value;
    const currentPatternInInput = elements.editPattern.value;

    elements.patternSelect.innerHTML = '<option value="new">-- Add New Pattern --</option>';

    const sortedPrompts = sortPromptsByPatternLength(state.prompts);

    sortedPrompts.forEach(item => {
        const option = document.createElement('option');
        option.value = item.pattern;
        option.textContent = item.pattern;
        elements.patternSelect.appendChild(option);
    });

    restoreSelection(currentValue, currentPatternInInput);
}

function restoreSelection(currentValue, currentPatternInInput) {
    const isValid = val => val === 'new' || state.prompts.some(p => p.pattern === val);

    elements.patternSelect.value = isValid(currentValue) ? currentValue
        : isValid(currentPatternInInput) ? currentPatternInInput
            : 'new';
}

// Logic Actions
function savePrompt() {
    const pattern = elements.editPattern.value.trim();
    const prompt = elements.editPromptText.value.trim();
    const originalPattern = elements.patternSelect.value;

    if (!pattern || !prompt) {
        return setStatus('Please enter both a URL pattern and a prompt.', STATUS.ERROR);
    }

    const isDuplicate = state.prompts.some(p => p.pattern === pattern && pattern !== originalPattern);
    if (isDuplicate) {
        return setStatus('URL pattern already exists! Please choose another.', STATUS.ERROR);
    }

    const autoSubmit = elements.editAutoSubmit.checked;
    const existingIndex = state.prompts.findIndex(p => p.pattern === originalPattern);

    if (existingIndex !== -1) {
        state.prompts[existingIndex] = { pattern, prompt, autoSubmit };
    } else {
        state.prompts.push({ pattern, prompt, autoSubmit });
    }

    saveAndRefresh("Changes saved!", pattern);
}

function deletePrompt() {
    const pattern = elements.patternSelect.value;
    if (pattern === 'new' || !confirm(`Delete prompt for "${pattern}"?`))
        return;

    state.prompts = state.prompts.filter(p => p.pattern !== pattern);
    saveAndRefresh('Prompt deleted!', 'new');
}


function resetAll() {
    if (!confirm('Reset ALL prompts to defaults?')) return;

    state.prompts = structuredClone(DEFAULT_PROMPTS);
    saveAndRefresh('Defaults restored!', 'new');
}

function saveAndRefresh(message, nextSelection) {
    chrome.storage.local.set({ [KEY_CUSTOM_PROMPTS]: state.prompts });

    renderPromptsSelect();
    elements.patternSelect.value = nextSelection;
    updateEditMode(nextSelection);

    // Must come after updateEditMode, which resets the status.
    if (message) setStatus(message, STATUS.SUCCESS, true);
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
