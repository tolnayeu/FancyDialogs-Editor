// Modal management — native <dialog> with animated open/close

import { currentDialog, editorState, renderButtons, loadDialogToForm } from './dialog.js';
import { updatePreview } from './preview.js';
import { loadPreset } from './presets.js';

// ── Animated close helper ─────────────────────────────────────────────────────
function closeAnimated(modal, onClosed) {
  if (!modal || !modal.open || modal.classList.contains('closing')) return;
  modal.classList.add('closing');
  modal.addEventListener('animationend', () => {
    modal.classList.remove('closing');
    modal.close();
    if (onClosed) onClosed();
  }, { once: true });
}

// ── Action Modal ─────────────────────────────────────────────────────────────

export function openActionModal(buttonIndex) {
  editorState.currentButtonIndex = buttonIndex;
  updateActionFields();

  const modal = document.getElementById('action-modal');
  if (modal) modal.showModal();
}

export function closeActionModal() {
  const modal = document.getElementById('action-modal');
  closeAnimated(modal, () => { editorState.currentButtonIndex = -1; });
}

export function confirmAction() {
  const typeEl = document.getElementById('action-type');
  const dataEl = document.getElementById('action-data');

  if (!typeEl || !dataEl) return;

  const type = typeEl.value;
  const data = dataEl.value;

  if (!data.trim()) return;

  currentDialog.buttons[editorState.currentButtonIndex].actions.push({
    name: type,
    data: data,
  });

  dataEl.value = '';
  renderButtons();
  updatePreview();
  closeActionModal();
}

export function updateActionFields() {
  const typeEl = document.getElementById('action-type');
  if (!typeEl) return;

  const type = typeEl.value;
  const container = document.getElementById('action-fields');
  if (!container) return;

  const fields = {
    message: {
      label: 'Message Text:',
      placeholder: 'Hello {player}! You chose {color_choice}',
      type: 'textarea',
      help: 'Use {key} for input placeholders',
    },
    open_dialog: {
      label: 'Dialog ID:',
      placeholder: 'rules',
      type: 'input',
      help: 'ID of dialog to open',
    },
    open_random_dialog: {
      label: 'Dialog IDs (comma-separated):',
      placeholder: 'dialog1,dialog2,dialog3',
      type: 'input',
      help: 'Opens random dialog from list',
    },
    console_command: {
      label: 'Console Command:',
      placeholder: 'give {player} diamond 1',
      type: 'input',
      help: 'Runs as server console',
    },
    player_command: {
      label: 'Player Command:',
      placeholder: 'spawn',
      type: 'input',
      help: 'Runs as player (no /)',
    },
    send_to_server: {
      label: 'Server Name:',
      placeholder: 'lobby',
      type: 'input',
      help: 'BungeeCord/Velocity server',
    },
  };

  const field = fields[type];
  if (!field) return;

  container.innerHTML = `
    <label class="mc-label">${field.label}</label>
    ${
      field.type === 'textarea'
        ? `<textarea class="mc-textarea" id="action-data" placeholder="${field.placeholder}"></textarea>`
        : `<input type="text" class="mc-input" id="action-data" placeholder="${field.placeholder}">`
    }
    <div class="mc-info-box">${field.help}</div>
  `;
}

// ── Select Option Modal (legacy — options added inline now) ──────────────────

export function openOptionModal(selectIndex) {
  editorState.currentSelectIndex = selectIndex;
  const modal = document.getElementById('option-modal');
  if (modal) modal.showModal();
}

export function closeOptionModal() {
  const modal = document.getElementById('option-modal');
  closeAnimated(modal, () => { editorState.currentSelectIndex = -1; });
}

export function confirmOption() {
  // Not used — options are added inline via addSelectOption()
}

// ── Presets Modal ─────────────────────────────────────────────────────────────

export function openPresetsModal() {
  const modal = document.getElementById('presets-modal');
  if (modal) modal.showModal();
}

export function closePresetsModal() {
  const modal = document.getElementById('presets-modal');
  closeAnimated(modal);
}

export function loadPresetAndClose(presetType) {
  const data = loadPreset(presetType);
  if (data) loadDialogToForm(data);
  closePresetsModal();
}
