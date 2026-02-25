// ── M3 Web Component registrations ──────────────────────────────────────────
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/tabs/secondary-tab.js';
import '@material/web/dialog/dialog.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/progress/circular-progress.js';

// ── CSS ──────────────────────────────────────────────────────────────────────
import './styles/tokens.css';
import './styles/layout.css';
import './styles/preview.css';
import './styles/overrides.css';

// ── App Modules ───────────────────────────────────────────────────────────────
import {
  currentDialog,
  editorState,
  setUpdatePreviewCallback,
  setAddButtonActionCallback,
  addBodyLine,
  addTextField,
  addSelect,
  addCheckbox,
  addButton,
  updateBodyLine,
  deleteBodyLine,
  updateTextField,
  deleteTextField,
  updateSelect,
  updateSelectOption,
  deleteSelectOption,
  deleteSelect,
  addSelectOption,
  updateCheckbox,
  deleteCheckbox,
  updateButton,
  deleteButton,
  deleteButtonAction,
  renderBodyLines,
  renderButtons,
  renderTextFields,
  renderSelects,
  renderCheckboxes,
  loadDialogToForm,
  resetDialog,
  replaceDialog,
} from './dialog.js';

import { updatePreview, updateJSONPreview } from './preview.js';

import {
  openActionModal,
  closeActionModal,
  confirmAction,
  updateActionFields,
  openPresetsModal,
  closePresetsModal,
  loadPresetAndClose,
  openOptionModal,
  closeOptionModal,
} from './modals.js';

import {
  dialogHistory,
  debounce,
  registerHistoryCallbacks,
  performUndo,
  performRedo,
} from './history.js';

import {
  downloadJSON,
  copyJSON,
  importJSON,
  handleFileImport,
  setupDragDrop,
} from './storage.js';

import { initTheme, toggleTheme } from './theme.js';
import { showToast } from './toast.js';
import {
  setupKeyboardShortcuts,
  createHelpPanel,
  toggleHelpPanel,
  initTooltips,
} from './shortcuts.js';

// ── Wire up cross-module callbacks ────────────────────────────────────────────

// Allow dialog.js CRUD functions to call updatePreview() without circular import
setUpdatePreviewCallback(() => {
  updatePreview();
  debouncedTrack();
});

// Allow dialog.js button render to call openActionModal via window
setAddButtonActionCallback(openActionModal);

// Allow history module to call loadDialogToForm for undo/redo
registerHistoryCallbacks(
  () => dialogHistory.push(currentDialog),
  (data) => loadDialogToForm(data)
);

// ── Global window handlers (used by innerHTML-generated event handlers) ────────

window.__updateBodyLine = updateBodyLine;
window.__deleteBodyLine = deleteBodyLine;
window.__updateTextField = updateTextField;
window.__deleteTextField = deleteTextField;
window.__updateSelect = updateSelect;
window.__updateSelectOption = updateSelectOption;
window.__deleteSelectOption = deleteSelectOption;
window.__deleteSelect = deleteSelect;
window.__addSelectOption = addSelectOption;
window.__updateCheckbox = updateCheckbox;
window.__deleteCheckbox = deleteCheckbox;
window.__updateButton = updateButton;
window.__deleteButton = deleteButton;
window.__deleteButtonAction = deleteButtonAction;

// ── Debounced change tracking ─────────────────────────────────────────────────

const debouncedTrack = debounce(() => dialogHistory.push(currentDialog), 500);

// ── DOMContentLoaded ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme
  initTheme();

  // 2. Initial form render & preview
  loadDialogToForm();

  // 3. Set up md-tabs: Editor tabs
  setupEditorTabs();

  // 4. Set up md-tabs: Inputs sub-tabs
  setupInputSubTabs();

  // 5. Set up md-tabs: Preview tabs
  setupPreviewTabs();

  // 6. Navbar page navigation
  setupNavigation();

  // 7. Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // 8. Action bar buttons
  document.getElementById('download-btn')?.addEventListener('click', downloadJSON);
  document.getElementById('presets-btn')?.addEventListener('click', openPresetsModal);
  document.getElementById('import-btn')?.addEventListener('click', () =>
    document.getElementById('file-input')?.click()
  );
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (confirm('Reset dialog to defaults?')) {
      resetDialog();
      loadDialogToForm();
      showToast('Dialog reset', 'info');
    }
  });
  document.getElementById('file-input')?.addEventListener('change', importJSON);

  // 9. Add content buttons (in tab panels)
  document.getElementById('add-body-line-btn')?.addEventListener('click', addBodyLine);
  document.getElementById('add-textfield-btn')?.addEventListener('click', addTextField);
  document.getElementById('add-select-btn')?.addEventListener('click', addSelect);
  document.getElementById('add-checkbox-btn')?.addEventListener('click', addCheckbox);
  document.getElementById('add-button-btn')?.addEventListener('click', addButton);

  // 10. Copy JSON
  document.getElementById('copy-json-btn')?.addEventListener('click', copyJSON);

  // 11. Action modal
  document.getElementById('action-type')?.addEventListener('change', updateActionFields);
  document.getElementById('cancel-action-btn')?.addEventListener('click', closeActionModal);
  document.getElementById('confirm-action-btn')?.addEventListener('click', confirmAction);
  // Escape key fires 'cancel' which instantly closes; preventDefault + animate instead
  document.getElementById('action-modal')?.addEventListener('cancel', (e) => { e.preventDefault(); closeActionModal(); });

  // 12. Option modal (legacy)
  document.getElementById('cancel-option-btn')?.addEventListener('click', closeOptionModal);
  document.getElementById('confirm-option-btn')?.addEventListener('click', () => {}); // no-op
  document.getElementById('option-modal')?.addEventListener('cancel', (e) => { e.preventDefault(); closeOptionModal(); });

  // 13. Presets modal
  document.getElementById('cancel-presets-btn')?.addEventListener('click', closePresetsModal);
  document.getElementById('presets-modal')?.addEventListener('cancel', (e) => { e.preventDefault(); closePresetsModal(); });
  document.querySelectorAll('.preset-card').forEach((card) => {
    card.addEventListener('click', () => loadPresetAndClose(card.dataset.preset));
  });

  // 14. Undo / Redo buttons
  document.getElementById('undo-btn')?.addEventListener('click', performUndo);
  document.getElementById('redo-btn')?.addEventListener('click', performRedo);

  // 15. Live update from M3 text fields in Basic tab
  document.getElementById('dialog-id')?.addEventListener('input', () => {
    updatePreview();
    debouncedTrack();
  });
  document.getElementById('dialog-title')?.addEventListener('input', () => {
    updatePreview();
    debouncedTrack();
  });
  document.getElementById('can-close-escape')?.addEventListener('change', () => {
    updatePreview();
    debouncedTrack();
  });

  // 16. Keyboard shortcuts
  setupKeyboardShortcuts();

  // 17. Drag & drop
  setupDragDrop();

  // 18. Tooltips
  initTooltips();

  // 19. Help panel
  createHelpPanel();

  // 20. Preview controls (scale + device)
  setTimeout(() => {
    addPreviewControls();
    addHistoryControls();
  }, 100);

  // 21. Track initial state
  setTimeout(() => dialogHistory.push(currentDialog), 600);

  // 22. Hide preloader
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.opacity = '0';
    setTimeout(() => (preloader.style.display = 'none'), 300);
  }
});

// ── Tab setup helpers ─────────────────────────────────────────────────────────

function setupEditorTabs() {
  const tabs = document.getElementById('editor-tabs');
  if (!tabs) return;

  const panelIds = ['basic-panel', 'body-panel', 'inputs-panel', 'buttons-panel'];

  tabs.addEventListener('change', () => {
    panelIds.forEach((id, i) => {
      document.getElementById(id)?.classList.toggle('hidden', i !== tabs.activeTabIndex);
    });
  });
}

function setupInputSubTabs() {
  const tabs = document.getElementById('inputs-tabs');
  if (!tabs) return;

  const panelIds = ['textfields-panel', 'selects-panel', 'checkboxes-panel'];

  tabs.addEventListener('change', () => {
    panelIds.forEach((id, i) => {
      document.getElementById(id)?.classList.toggle('hidden', i !== tabs.activeTabIndex);
    });
  });
}

function setupPreviewTabs() {
  const tabs = document.getElementById('preview-tabs');
  if (!tabs) return;

  const panelIds = ['visual-preview-panel', 'code-preview-panel'];

  tabs.addEventListener('change', () => {
    panelIds.forEach((id, i) => {
      document.getElementById(id)?.classList.toggle('hidden', i !== tabs.activeTabIndex);
    });
    // Refresh JSON view when switching to code tab
    if (tabs.activeTabIndex === 1) updateJSONPreview();
  });
}

// ── Navigation ────────────────────────────────────────────────────────────────

function setupNavigation() {
  const navEditor = document.getElementById('nav-editor');
  const navInstructions = document.getElementById('nav-instructions');

  function showPage(name) {
    document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
    document.getElementById(`${name}-page`)?.classList.add('active');

    [navEditor, navInstructions].forEach((btn) => btn?.classList.remove('active'));
  }

  navEditor?.addEventListener('click', () => {
    showPage('editor');
    navEditor.classList.add('active');
  });

  navInstructions?.addEventListener('click', () => {
    showPage('instructions');
    navInstructions.classList.add('active');
  });

  // "instructions" link inside the Basic tab info box
  document.getElementById('go-to-instructions')?.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('instructions');
    navEditor?.classList.remove('active');
    navInstructions?.classList.add('active');
  });
}

// ── Preview controls (scale + device) ────────────────────────────────────────

function addPreviewControls() {
  const previewPanel = document.querySelector('.surface-card:has(#preview-container)');
  if (!previewPanel) return;

  const controls = document.createElement('div');
  controls.className = 'preview-controls';
  controls.innerHTML = `
    <div class="preview-scale-controls">
      <label class="mc-label">Preview Scale:</label>
      <div class="button-group">
        <button class="tonal-btn" data-scale="0.75">75%</button>
        <button class="tonal-btn active" data-scale="1">100%</button>
        <button class="tonal-btn" data-scale="1.25">125%</button>
        <button class="tonal-btn" data-scale="1.5">150%</button>
      </div>
    </div>
    <div class="preview-device-controls">
      <label class="mc-label">Device Preview:</label>
      <div class="button-group">
        <button class="tonal-btn active" data-device="desktop" aria-label="Desktop view">
          <span class="material-symbols-outlined">computer</span>
        </button>
        <button class="tonal-btn" data-device="tablet" aria-label="Tablet view">
          <span class="material-symbols-outlined">tablet</span>
        </button>
        <button class="tonal-btn" data-device="mobile" aria-label="Mobile view">
          <span class="material-symbols-outlined">phone_android</span>
        </button>
      </div>
    </div>
  `;

  // Insert before the md-tabs in the preview panel
  const tabs = previewPanel.querySelector('md-tabs');
  if (tabs) previewPanel.insertBefore(controls, tabs);

  // Scale buttons
  controls.querySelectorAll('[data-scale]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const scale = parseFloat(btn.dataset.scale);
      const dialog = document.querySelector('.preview-dialog');
      if (dialog) {
        dialog.style.transform = `scale(${scale})`;
        dialog.style.transformOrigin = 'top center';
      }
      controls.querySelectorAll('[data-scale]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Device buttons
  controls.querySelectorAll('[data-device]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const wrapper = document.querySelector('.preview-wrapper');
      if (wrapper) {
        wrapper.classList.remove('device-desktop', 'device-tablet', 'device-mobile');
        wrapper.classList.add(`device-${btn.dataset.device}`);
      }
      controls.querySelectorAll('[data-device]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// ── History controls ──────────────────────────────────────────────────────────

function addHistoryControls() {
  // Buttons are already in the HTML; just ensure they reflect current state
  dialogHistory.updateUI();
}
