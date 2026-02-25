// Auto-save, localStorage, import/export

import { currentDialog, loadDialogToForm } from './dialog.js';
import { updatePreview } from './preview.js';
import { showToast } from './toast.js';
import { dialogHistory } from './history.js';

// ── Download JSON ────────────────────────────────────────────────────────────

export function downloadJSON() {
  updatePreview();

  if (!currentDialog.buttons || currentDialog.buttons.length === 0) {
    showToast('Dialog must have at least one button', 'error');
    return;
  }

  const json = JSON.stringify(currentDialog, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentDialog.id || 'dialog'}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Dialog downloaded!', 'success');
}

// ── Copy JSON ────────────────────────────────────────────────────────────────

export function copyJSON() {
  updatePreview();

  const json = JSON.stringify(currentDialog, null, 2);
  navigator.clipboard
    .writeText(json)
    .then(() => {
      showToast('JSON copied to clipboard!', 'success');
      const icon = document.querySelector('#copy-json-btn .material-symbols-outlined');
      if (icon) {
        icon.textContent = 'check';
        setTimeout(() => (icon.textContent = 'content_copy'), 2000);
      }
    })
    .catch(() => showToast('Failed to copy to clipboard', 'error'));
}

// ── Import JSON ──────────────────────────────────────────────────────────────

export function importJSON(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  handleFileImport(file);
}

export function handleFileImport(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      const validation = validateImportedJSON(data);

      if (!validation.valid) {
        showToast(`Import failed: ${validation.error}`, 'error', 5000);
        return;
      }

      loadDialogToForm(validation.data);
      showToast('Dialog imported successfully!', 'success');
      dialogHistory.push(currentDialog);
    } catch {
      showToast('Invalid JSON file', 'error');
    }
  };
  reader.readAsText(file);
}

export function validateImportedJSON(data) {
  try {
    const required = ['id', 'title', 'buttons'];
    const missing = required.filter((f) => !data[f]);
    if (missing.length > 0) throw new Error(`Missing required fields: ${missing.join(', ')}`);
    if (typeof data.id !== 'string') throw new Error('Dialog ID must be a string');
    if (!Array.isArray(data.buttons) || data.buttons.length === 0)
      throw new Error('Dialog must have at least one button');

    if (!data.inputs) data.inputs = { textFields: [], selects: [], checkboxes: [] };
    else {
      if (!data.inputs.textFields) data.inputs.textFields = [];
      if (!data.inputs.selects) data.inputs.selects = [];
      if (!data.inputs.checkboxes) data.inputs.checkboxes = [];
    }
    if (!data.body) data.body = [];

    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// ── Auto-save ────────────────────────────────────────────────────────────────

let _autoSaveInterval = null;

export function startAutoSave() {
  _autoSaveInterval = setInterval(saveToLocalStorage, 30_000);
}

export function saveToLocalStorage() {
  try {
    localStorage.setItem(
      'fancydialogs_autosave',
      JSON.stringify({ dialog: currentDialog, timestamp: Date.now() })
    );
    showAutoSaveIndicator(true);
    setTimeout(() => showAutoSaveIndicator(false), 2000);
  } catch (e) {
    console.error('Auto-save failed:', e);
  }
}

export function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('fancydialogs_autosave');
    if (saved) {
      const data = JSON.parse(saved);
      const age = Date.now() - data.timestamp;
      if (age < 86_400_000) return data.dialog; // < 24 h
    }
  } catch {
    // ignore
  }
  return null;
}

function showAutoSaveIndicator(saving) {
  let indicator = document.getElementById('autosave-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'autosave-indicator';
    indicator.className = 'autosave-indicator';
    const menu = document.querySelector('.app-bar-actions');
    if (menu) menu.appendChild(indicator);
  }

  if (saving) {
    indicator.innerHTML = '<span class="material-symbols-outlined">sync</span><span>Saving…</span>';
    indicator.classList.remove('saved');
  } else {
    indicator.innerHTML = '<span class="material-symbols-outlined">cloud_done</span><span>Saved</span>';
    indicator.classList.add('saved');
  }
}

// ── Drag-and-drop import ─────────────────────────────────────────────────────

export function setupDragDrop() {
  const zones = [document.getElementById('editor-page'), document.body].filter(Boolean);

  zones.forEach((zone) => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showDropIndicator();
    });

    zone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target === zone) hideDropIndicator();
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideDropIndicator();

      const file = e.dataTransfer.files?.[0];
      if (file) {
        if (file.name.endsWith('.json')) {
          handleFileImport(file);
        } else {
          showToast('Please drop a valid JSON file', 'error');
        }
      }
    });
  });
}

function showDropIndicator() {
  if (document.getElementById('drop-indicator')) return;

  const el = document.createElement('div');
  el.id = 'drop-indicator';
  el.innerHTML = `
    <div class="drop-overlay">
      <span class="material-symbols-outlined">cloud_upload</span>
      <div>Drop JSON file to import</div>
    </div>`;
  document.body.appendChild(el);
}

function hideDropIndicator() {
  document.getElementById('drop-indicator')?.remove();
}
