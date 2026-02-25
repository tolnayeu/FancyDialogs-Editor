// Dialog state and CRUD operations

// === Shared state ===
export const currentDialog = {
  id: 'my_dialog',
  title: '<b><color:#ff7300>My Dialog</color></b>',
  canCloseWithEscape: true,
  body: [],
  inputs: {
    textFields: [],
    selects: [],
    checkboxes: [],
  },
  buttons: [
    {
      label: '<color:red>Close</color>',
      tooltip: 'Click to close',
      actions: [],
    },
  ],
};

// Mutable primitive state wrapped in an object so modules share the reference
export const editorState = {
  currentButtonIndex: -1,
  currentSelectIndex: -1,
};

/**
 * Replace the entire dialog in-place (preserves object reference for all importers).
 */
export function replaceDialog(data) {
  Object.keys(currentDialog).forEach((k) => delete currentDialog[k]);
  Object.assign(currentDialog, JSON.parse(JSON.stringify(data)));
  // Ensure required structure exists
  if (!currentDialog.inputs) {
    currentDialog.inputs = { textFields: [], selects: [], checkboxes: [] };
  }
  if (!Array.isArray(currentDialog.inputs.textFields)) currentDialog.inputs.textFields = [];
  if (!Array.isArray(currentDialog.inputs.selects)) currentDialog.inputs.selects = [];
  if (!Array.isArray(currentDialog.inputs.checkboxes)) currentDialog.inputs.checkboxes = [];
  if (!Array.isArray(currentDialog.body)) currentDialog.body = [];
  if (!Array.isArray(currentDialog.buttons) || currentDialog.buttons.length === 0) {
    currentDialog.buttons = [{ label: '<color:red>Close</color>', tooltip: 'Click to close', actions: [] }];
  }
}

// === Utility ===
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

// These callbacks are injected by main.js to avoid circular imports
let _updatePreview = () => {};
export function setUpdatePreviewCallback(fn) {
  _updatePreview = fn;
}

// === Body Lines ===
export function addBodyLine() {
  currentDialog.body.push({ text: '' });
  renderBodyLines();
  _updatePreview();
}

export function renderBodyLines() {
  const container = document.getElementById('body-lines-container');
  if (!container) return;

  if (currentDialog.body.length === 0) {
    container.innerHTML = '<div class="empty-state">No body text yet</div>';
    return;
  }

  container.innerHTML = currentDialog.body
    .map(
      (line, index) => `
    <div class="mc-item">
      <div class="mc-item-header">
        <span class="mc-item-title">Line ${index + 1}</span>
        <div class="mc-item-actions">
          <button class="icon-btn icon-btn-danger" onclick="window.__deleteBodyLine(${index})" aria-label="Delete line"><span class="material-symbols-outlined">delete</span></button>
        </div>
      </div>
      <textarea class="mc-textarea"
        placeholder="Body text (supports MiniMessage)"
        oninput="window.__updateBodyLine(${index}, this.value)"
        style="margin-top: 8px;">${escapeHtml(line.text)}</textarea>
    </div>
  `
    )
    .join('');
}

export function updateBodyLine(index, value) {
  currentDialog.body[index].text = value;
  _updatePreview();
}

export function deleteBodyLine(index) {
  currentDialog.body.splice(index, 1);
  renderBodyLines();
  _updatePreview();
}

// === Text Fields ===
export function addTextField() {
  currentDialog.inputs.textFields.push({
    placeholder: '',
    maxLength: 50,
    maxLines: 1,
    key: 'field_' + Date.now(),
    label: 'Text Field',
    order: currentDialog.inputs.textFields.length + 1,
  });
  renderTextFields();
  _updatePreview();
}

export function renderTextFields() {
  const container = document.getElementById('textfields-container');
  if (!container) return;

  if (currentDialog.inputs.textFields.length === 0) {
    container.innerHTML = '<div class="empty-state">No text fields</div>';
    return;
  }

  container.innerHTML = currentDialog.inputs.textFields
    .map(
      (field, index) => `
    <div class="mc-item">
      <div class="mc-item-header">
        <span class="mc-item-title">Text Field ${index + 1}</span>
        <div class="mc-item-actions">
          <button class="icon-btn icon-btn-danger" onclick="window.__deleteTextField(${index})" aria-label="Delete field"><span class="material-symbols-outlined">delete</span></button>
        </div>
      </div>
      <div style="margin-top: 8px;">
        <label class="mc-label">Label:</label>
        <input type="text" class="mc-input" value="${escapeHtml(field.label)}"
          oninput="window.__updateTextField(${index}, 'label', this.value)">

        <label class="mc-label">Key (placeholder variable):</label>
        <input type="text" class="mc-input" value="${escapeHtml(field.key)}"
          oninput="window.__updateTextField(${index}, 'key', this.value)">

        <label class="mc-label">Placeholder:</label>
        <input type="text" class="mc-input" value="${escapeHtml(field.placeholder)}"
          oninput="window.__updateTextField(${index}, 'placeholder', this.value)">

        <label class="mc-label">Max Length:</label>
        <input type="number" class="mc-input" value="${field.maxLength}"
          oninput="window.__updateTextField(${index}, 'maxLength', parseInt(this.value) || 50)">

        <label class="mc-label">Max Lines:</label>
        <input type="number" class="mc-input" value="${field.maxLines}"
          oninput="window.__updateTextField(${index}, 'maxLines', parseInt(this.value) || 1)">
      </div>
    </div>
  `
    )
    .join('');
}

export function updateTextField(index, field, value) {
  currentDialog.inputs.textFields[index][field] = value;
  _updatePreview();
}

export function deleteTextField(index) {
  currentDialog.inputs.textFields.splice(index, 1);
  renderTextFields();
  _updatePreview();
}

// === Selects / Dropdowns ===
export function addSelect() {
  currentDialog.inputs.selects.push({
    options: [],
    key: 'select_' + Date.now(),
    label: 'Dropdown',
    order: currentDialog.inputs.selects.length + 1,
  });
  renderSelects();
  _updatePreview();
}

export function renderSelects() {
  const container = document.getElementById('selects-container');
  if (!container) return;

  if (currentDialog.inputs.selects.length === 0) {
    container.innerHTML = '<div class="empty-state">No dropdowns</div>';
    return;
  }

  container.innerHTML = currentDialog.inputs.selects
    .map(
      (select, index) => `
    <div class="mc-item">
      <div class="mc-item-header">
        <span class="mc-item-title">Dropdown ${index + 1}</span>
        <div class="mc-item-actions">
          <button class="mc-button mc-button-green" onclick="window.__addSelectOption(${index})">+OPT</button>
          <button class="icon-btn icon-btn-danger" onclick="window.__deleteSelect(${index})" aria-label="Delete dropdown"><span class="material-symbols-outlined">delete</span></button>
        </div>
      </div>
      <div style="margin-top: 8px;">
        <label class="mc-label">Label:</label>
        <input type="text" class="mc-input" value="${escapeHtml(select.label)}"
          oninput="window.__updateSelect(${index}, 'label', this.value)">

        <label class="mc-label">Key (placeholder variable):</label>
        <input type="text" class="mc-input" value="${escapeHtml(select.key)}"
          oninput="window.__updateSelect(${index}, 'key', this.value)">

        <label class="mc-label">Options (${select.options.length}):</label>
        ${select.options
          .map(
            (opt, optIndex) => `
          <div class="mc-item" style="padding: 8px; margin-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 12px; color: #FFFF55;">Option ${optIndex + 1}</span>
              <button class="icon-btn icon-btn-danger" onclick="window.__deleteSelectOption(${index}, ${optIndex})" aria-label="Delete option"><span class="material-symbols-outlined">delete</span></button>
            </div>
            <label class="mc-label" style="font-size: 11px;">Value:</label>
            <input type="text" class="mc-input" value="${escapeHtml(opt.value)}"
              oninput="window.__updateSelectOption(${index}, ${optIndex}, 'value', this.value)"
              style="font-size: 12px; padding: 8px;">

            <label class="mc-label" style="font-size: 11px;">Display:</label>
            <input type="text" class="mc-input" value="${escapeHtml(opt.display)}"
              oninput="window.__updateSelectOption(${index}, ${optIndex}, 'display', this.value)"
              style="font-size: 12px; padding: 8px;">

            <div class="mc-checkbox-group" style="padding: 6px;">
              <input type="checkbox" class="mc-checkbox" ${opt.initial ? 'checked' : ''}
                onchange="window.__updateSelectOption(${index}, ${optIndex}, 'initial', this.checked)">
              <label class="mc-label" style="margin: 0; font-size: 11px;">Default Selection</label>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `
    )
    .join('');
}

export function updateSelect(index, field, value) {
  currentDialog.inputs.selects[index][field] = value;
  _updatePreview();
}

export function updateSelectOption(selectIndex, optionIndex, field, value) {
  if (field === 'initial' && value === true) {
    currentDialog.inputs.selects[selectIndex].options.forEach((opt, idx) => {
      if (idx !== optionIndex) opt.initial = false;
    });
  }
  currentDialog.inputs.selects[selectIndex].options[optionIndex][field] = value;
  renderSelects();
  _updatePreview();
}

export function deleteSelectOption(selectIndex, optionIndex) {
  currentDialog.inputs.selects[selectIndex].options.splice(optionIndex, 1);
  renderSelects();
  _updatePreview();
}

export function deleteSelect(index) {
  currentDialog.inputs.selects.splice(index, 1);
  renderSelects();
  _updatePreview();
}

export function addSelectOption(selectIndex) {
  currentDialog.inputs.selects[selectIndex].options.push({
    value: '',
    display: '',
    initial: false,
  });
  renderSelects();
  _updatePreview();
}

// === Checkboxes ===
export function addCheckbox() {
  currentDialog.inputs.checkboxes.push({
    initial: false,
    key: 'checkbox_' + Date.now(),
    label: 'Checkbox',
    order: currentDialog.inputs.checkboxes.length + 1,
  });
  renderCheckboxes();
  _updatePreview();
}

export function renderCheckboxes() {
  const container = document.getElementById('checkboxes-container');
  if (!container) return;

  if (currentDialog.inputs.checkboxes.length === 0) {
    container.innerHTML = '<div class="empty-state">No checkboxes</div>';
    return;
  }

  container.innerHTML = currentDialog.inputs.checkboxes
    .map(
      (checkbox, index) => `
    <div class="mc-item">
      <div class="mc-item-header">
        <span class="mc-item-title">Checkbox ${index + 1}</span>
        <div class="mc-item-actions">
          <button class="icon-btn icon-btn-danger" onclick="window.__deleteCheckbox(${index})" aria-label="Delete checkbox"><span class="material-symbols-outlined">delete</span></button>
        </div>
      </div>
      <div style="margin-top: 8px;">
        <label class="mc-label">Label:</label>
        <input type="text" class="mc-input" value="${escapeHtml(checkbox.label)}"
          oninput="window.__updateCheckbox(${index}, 'label', this.value)">

        <label class="mc-label">Key (placeholder variable):</label>
        <input type="text" class="mc-input" value="${escapeHtml(checkbox.key)}"
          oninput="window.__updateCheckbox(${index}, 'key', this.value)">

        <div class="mc-checkbox-group">
          <input type="checkbox" class="mc-checkbox" ${checkbox.initial ? 'checked' : ''}
            onchange="window.__updateCheckbox(${index}, 'initial', this.checked)">
          <label class="mc-label" style="margin: 0;">Checked by default</label>
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

export function updateCheckbox(index, field, value) {
  currentDialog.inputs.checkboxes[index][field] = value;
  _updatePreview();
}

export function deleteCheckbox(index) {
  currentDialog.inputs.checkboxes.splice(index, 1);
  renderCheckboxes();
  _updatePreview();
}

// === Buttons ===
export function addButton() {
  currentDialog.buttons.push({
    label: 'Button',
    tooltip: '',
    actions: [],
  });
  renderButtons();
  _updatePreview();
}

export function renderButtons() {
  const container = document.getElementById('buttons-container');
  if (!container) return;

  if (currentDialog.buttons.length === 0) {
    container.innerHTML = '<div class="empty-state">No buttons</div>';
    return;
  }

  const isLastButton = currentDialog.buttons.length === 1;
  container.innerHTML = currentDialog.buttons
    .map(
      (button, index) => `
    <div class="mc-item">
      <div class="mc-item-header">
        <span class="mc-item-title">
          Button ${index + 1}
          <span class="mc-badge mc-badge-blue">${button.actions.length} actions</span>
          ${isLastButton ? '<span class="mc-badge">Required</span>' : ''}
        </span>
        <div class="mc-item-actions">
          <button class="mc-button mc-button-green" onclick="window.__addButtonAction(${index})">+ACT</button>
          ${!isLastButton ? `<button class="icon-btn icon-btn-danger" onclick="window.__deleteButton(${index})" aria-label="Delete button"><span class="material-symbols-outlined">delete</span></button>` : ''}
        </div>
      </div>
      <div style="margin-top: 8px;">
        <label class="mc-label">Label:</label>
        <input type="text" class="mc-input" value="${escapeHtml(button.label)}"
          oninput="window.__updateButton(${index}, 'label', this.value)">

        <label class="mc-label">Tooltip:</label>
        <input type="text" class="mc-input" value="${escapeHtml(button.tooltip)}"
          oninput="window.__updateButton(${index}, 'tooltip', this.value)">

        ${
          button.actions.length > 0
            ? `
          <label class="mc-label">Actions:</label>
          <div class="action-preview">
            ${button.actions
              .map(
                (action, aIndex) => `
              <div class="action-item">
                <span class="action-type">${action.name}</span>
                <span class="action-data">${escapeHtml(action.data.substring(0, 30))}${action.data.length > 30 ? '…' : ''}</span>
                <button class="icon-btn icon-btn-danger" onclick="window.__deleteButtonAction(${index}, ${aIndex})" aria-label="Remove action"><span class="material-symbols-outlined">delete</span></button>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
      </div>
    </div>
  `
    )
    .join('');
}

export function updateButton(index, field, value) {
  currentDialog.buttons[index][field] = value;
  _updatePreview();
}

export function deleteButton(index) {
  if (currentDialog.buttons.length <= 1) return;
  currentDialog.buttons.splice(index, 1);
  renderButtons();
  _updatePreview();
}

export function deleteButtonAction(buttonIndex, actionIndex) {
  currentDialog.buttons[buttonIndex].actions.splice(actionIndex, 1);
  renderButtons();
  _updatePreview();
}

// addButtonAction is called from modals.js via window.__addButtonAction
export function setAddButtonActionCallback(fn) {
  window.__addButtonAction = fn;
}

// === Reset ===
export function resetDialog() {
  replaceDialog({
    id: 'my_dialog',
    title: '<b><color:#ff7300>My Dialog</color></b>',
    canCloseWithEscape: true,
    body: [],
    inputs: { textFields: [], selects: [], checkboxes: [] },
    buttons: [{ label: '<color:red>Close</color>', tooltip: 'Click to close', actions: [] }],
  });
}

// === Load dialog data into the form ===
export function loadDialogToForm(data) {
  if (data) replaceDialog(data);

  const idEl = document.getElementById('dialog-id');
  const titleEl = document.getElementById('dialog-title');
  const escEl = document.getElementById('can-close-escape');

  if (idEl) idEl.value = currentDialog.id || '';
  if (titleEl) titleEl.value = currentDialog.title || '';
  if (escEl) escEl.checked = currentDialog.canCloseWithEscape !== false;

  renderBodyLines();
  renderTextFields();
  renderSelects();
  renderCheckboxes();
  renderButtons();
  _updatePreview();
}

// === Validation ===
export function validateDialog() {
  const errors = [];
  const warnings = [];

  if (!currentDialog.id || !currentDialog.id.trim()) {
    errors.push({ field: 'dialog-id', message: 'Dialog ID is required' });
  } else if (!/^[a-z0-9_]+$/.test(currentDialog.id)) {
    warnings.push({ field: 'dialog-id', message: 'ID should use lowercase letters, numbers, and underscores only' });
  }

  if (!currentDialog.title || !currentDialog.title.trim()) {
    warnings.push({ field: 'dialog-title', message: 'Dialog title is empty' });
  }

  if (!currentDialog.buttons || currentDialog.buttons.length === 0) {
    errors.push({ field: 'buttons', message: 'Dialog must have at least one button' });
  }

  const keys = new Set();
  const allInputs = [
    ...currentDialog.inputs.textFields,
    ...currentDialog.inputs.selects,
    ...currentDialog.inputs.checkboxes,
  ];

  allInputs.forEach((input) => {
    if (keys.has(input.key)) {
      errors.push({ field: input.key, message: `Duplicate key "${input.key}"` });
    }
    keys.add(input.key);

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(input.key)) {
      warnings.push({ field: input.key, message: `Key "${input.key}" should be a valid identifier` });
    }
  });

  currentDialog.inputs.selects.forEach((select, idx) => {
    if (select.options.length === 0) {
      warnings.push({ field: `select_${idx}`, message: 'Dropdown has no options' });
    }
    if (!select.options.some((opt) => opt.initial) && select.options.length > 0) {
      warnings.push({ field: `select_${idx}`, message: 'No default option selected' });
    }
  });

  return { errors, warnings, isValid: errors.length === 0 };
}
