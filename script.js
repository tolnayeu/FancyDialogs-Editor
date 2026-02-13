let currentDialog = {
    id: 'my_dialog',
    title: '<b><color:#ff7300>My Dialog</color></b>',
    canCloseWithEscape: true,
    body: [],
    inputs: {
        textFields: [],
        selects: [],
        checkboxes: []
    },
    buttons: [
        {
            label: '<color:red>Close</color>',
            tooltip: 'Click to close',
            actions: []
        }
    ]
};

let currentButtonIndex = -1;
let currentSelectIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    renderButtons();
    updatePreview();
});

// Warn before leaving page if there are unsaved changes
window.addEventListener('beforeunload', (e) => {
    // Always show confirmation when leaving/refreshing
    e.preventDefault();
    e.returnValue = ''; // Required for Chrome
    return ''; // For older browsers
});

function setupTabs() {
    document.querySelectorAll('.mc-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab || tab.dataset.subtab || tab.dataset.preview;
            const container = tab.closest('.mc-tabs').parentElement;

            container.querySelectorAll('.mc-tab').forEach(t => t.classList.remove('active'));
            container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            tab.classList.add('active');

            if (tab.dataset.preview) {
                document.getElementById(tabName + '-preview').classList.add('active');
            } else if (tab.dataset.subtab) {
                document.getElementById(tabName + '-subtab').classList.add('active');
            } else {
                document.getElementById(tabName + '-tab').classList.add('active');
            }
        });
    });
}

function updateActionFields() {
    const type = document.getElementById('action-type').value;
    const container = document.getElementById('action-fields');

    const fields = {
        'message': {
            label: 'Message Text:',
            placeholder: 'Hello {player}! You chose {color_choice}',
            type: 'textarea',
            help: 'Use {key} for input placeholders'
        },
        'open_dialog': {
            label: 'Dialog ID:',
            placeholder: 'rules',
            type: 'input',
            help: 'ID of dialog to open'
        },
        'open_random_dialog': {
            label: 'Dialog IDs (comma-separated):',
            placeholder: 'dialog1,dialog2,dialog3',
            type: 'input',
            help: 'Opens random dialog from list'
        },
        'console_command': {
            label: 'Console Command:',
            placeholder: 'give {player} diamond 1',
            type: 'input',
            help: 'Runs as server console'
        },
        'player_command': {
            label: 'Player Command:',
            placeholder: 'spawn',
            type: 'input',
            help: 'Runs as player (no /)'
        },
        'send_to_server': {
            label: 'Server Name:',
            placeholder: 'lobby',
            type: 'input',
            help: 'BungeeCord/Velocity server'
        }
    };

    const field = fields[type];
    container.innerHTML = `
        <label class="mc-label">${field.label}</label>
        ${field.type === 'textarea'
            ? `<textarea class="mc-textarea" id="action-data" placeholder="${field.placeholder}"></textarea>`
            : `<input type="text" class="mc-input" id="action-data" placeholder="${field.placeholder}">`
        }
        <div class="mc-info-box">${field.help}</div>
    `;
}

function addBodyLine() {
    currentDialog.body.push({ text: '' });
    renderBodyLines();
    updatePreview();
}

function renderBodyLines() {
    const container = document.getElementById('body-lines-container');
    if (currentDialog.body.length === 0) {
        container.innerHTML = '<div class="empty-state">No body text yet</div>';
        return;
    }

    container.innerHTML = currentDialog.body.map((line, index) => `
        <div class="mc-item">
            <div class="mc-item-header">
                <span class="mc-item-title">Line ${index + 1}</span>
                <div class="mc-item-actions">
                    <button class="mc-button mc-button-red" onclick="deleteBodyLine(${index})">DEL</button>
                </div>
            </div>
            <textarea class="mc-textarea"
                placeholder="Body text (supports MiniMessage)"
                oninput="updateBodyLine(${index}, this.value)"
                style="margin-top: 8px;">${escapeHtml(line.text)}</textarea>
        </div>
    `).join('');
}

function updateBodyLine(index, value) {
    currentDialog.body[index].text = value;
    updatePreview();
}

function deleteBodyLine(index) {
    currentDialog.body.splice(index, 1);
    renderBodyLines();
    updatePreview();
}

function addTextField() {
    currentDialog.inputs.textFields.push({
        placeholder: '',
        maxLength: 50,
        maxLines: 1,
        key: 'field_' + Date.now(),
        label: 'Text Field',
        order: currentDialog.inputs.textFields.length + 1
    });
    renderTextFields();
    updatePreview();
}

function renderTextFields() {
    const container = document.getElementById('textfields-container');
    if (currentDialog.inputs.textFields.length === 0) {
        container.innerHTML = '<div class="empty-state">No text fields</div>';
        return;
    }

    container.innerHTML = currentDialog.inputs.textFields.map((field, index) => `
        <div class="mc-item">
            <div class="mc-item-header">
                <span class="mc-item-title">Text Field ${index + 1}</span>
                <div class="mc-item-actions">
                    <button class="mc-button mc-button-red" onclick="deleteTextField(${index})">DEL</button>
                </div>
            </div>
            <div style="margin-top: 8px;">
                <label class="mc-label">Label:</label>
                <input type="text" class="mc-input" value="${escapeHtml(field.label)}"
                    oninput="updateTextField(${index}, 'label', this.value)">

                <label class="mc-label">Key (placeholder variable):</label>
                <input type="text" class="mc-input" value="${escapeHtml(field.key)}"
                    oninput="updateTextField(${index}, 'key', this.value)">

                <label class="mc-label">Placeholder:</label>
                <input type="text" class="mc-input" value="${escapeHtml(field.placeholder)}"
                    oninput="updateTextField(${index}, 'placeholder', this.value)">

                <label class="mc-label">Max Length:</label>
                <input type="number" class="mc-input" value="${field.maxLength}"
                    oninput="updateTextField(${index}, 'maxLength', parseInt(this.value) || 50)">

                <label class="mc-label">Max Lines:</label>
                <input type="number" class="mc-input" value="${field.maxLines}"
                    oninput="updateTextField(${index}, 'maxLines', parseInt(this.value) || 1)">
            </div>
        </div>
    `).join('');
}

function updateTextField(index, field, value) {
    currentDialog.inputs.textFields[index][field] = value;
    updatePreview();
}

function deleteTextField(index) {
    currentDialog.inputs.textFields.splice(index, 1);
    renderTextFields();
    updatePreview();
}

function addSelect() {
    currentDialog.inputs.selects.push({
        options: [],
        key: 'select_' + Date.now(),
        label: 'Dropdown',
        order: currentDialog.inputs.selects.length + 1
    });
    renderSelects();
    updatePreview();
}

function renderSelects() {
    const container = document.getElementById('selects-container');
    if (currentDialog.inputs.selects.length === 0) {
        container.innerHTML = '<div class="empty-state">No dropdowns</div>';
        return;
    }

    container.innerHTML = currentDialog.inputs.selects.map((select, index) => `
        <div class="mc-item">
            <div class="mc-item-header">
                <span class="mc-item-title">Dropdown ${index + 1}</span>
                <div class="mc-item-actions">
                    <button class="mc-button mc-button-green" onclick="addSelectOption(${index})">+OPT</button>
                    <button class="mc-button mc-button-red" onclick="deleteSelect(${index})">DEL</button>
                </div>
            </div>
            <div style="margin-top: 8px;">
                <label class="mc-label">Label:</label>
                <input type="text" class="mc-input" value="${escapeHtml(select.label)}"
                    oninput="updateSelect(${index}, 'label', this.value)">

                <label class="mc-label">Key (placeholder variable):</label>
                <input type="text" class="mc-input" value="${escapeHtml(select.key)}"
                    oninput="updateSelect(${index}, 'key', this.value)">

                <label class="mc-label">Options (${select.options.length}):</label>
                ${select.options.map((opt, optIndex) => `
                    <div class="mc-item" style="padding: 8px; margin-bottom: 6px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <span style="font-size: 12px; color: #FFFF55;">Option ${optIndex + 1}</span>
                            <button class="mc-button mc-button-red" onclick="deleteSelectOption(${index}, ${optIndex})" style="padding: 6px 12px; font-size: 11px;">DEL</button>
                        </div>
                        <label class="mc-label" style="font-size: 11px;">Value:</label>
                        <input type="text" class="mc-input" value="${escapeHtml(opt.value)}"
                            oninput="updateSelectOption(${index}, ${optIndex}, 'value', this.value)" style="font-size: 12px; padding: 8px;">

                        <label class="mc-label" style="font-size: 11px;">Display:</label>
                        <input type="text" class="mc-input" value="${escapeHtml(opt.display)}"
                            oninput="updateSelectOption(${index}, ${optIndex}, 'display', this.value)" style="font-size: 12px; padding: 8px;">

                        <div class="mc-checkbox-group" style="padding: 6px;">
                            <input type="checkbox" class="mc-checkbox" ${opt.initial ? 'checked' : ''}
                                onchange="updateSelectOption(${index}, ${optIndex}, 'initial', this.checked)">
                            <label class="mc-label" style="margin: 0; font-size: 11px;">Default Selection</label>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function updateSelect(index, field, value) {
    currentDialog.inputs.selects[index][field] = value;
    updatePreview();
}

function updateSelectOption(selectIndex, optionIndex, field, value) {
    // If setting 'initial' to true, uncheck all other options in this select
    if (field === 'initial' && value === true) {
        currentDialog.inputs.selects[selectIndex].options.forEach((opt, idx) => {
            if (idx !== optionIndex) {
                opt.initial = false;
            }
        });
    }

    currentDialog.inputs.selects[selectIndex].options[optionIndex][field] = value;
    renderSelects();
    updatePreview();
}

function deleteSelectOption(selectIndex, optionIndex) {
    currentDialog.inputs.selects[selectIndex].options.splice(optionIndex, 1);
    renderSelects();
    updatePreview();
}

function deleteSelect(index) {
    currentDialog.inputs.selects.splice(index, 1);
    renderSelects();
    updatePreview();
}

function addSelectOption(selectIndex) {
    currentDialog.inputs.selects[selectIndex].options.push({
        value: '',
        display: '',
        initial: false
    });
    renderSelects();
    updatePreview();
}

function closeOptionModal() {
    document.getElementById('option-modal').classList.remove('show');
    currentSelectIndex = -1;
}

function confirmOption() {
    // Not used anymore - keeping for compatibility
}

function addCheckbox() {
    currentDialog.inputs.checkboxes.push({
        initial: false,
        key: 'checkbox_' + Date.now(),
        label: 'Checkbox',
        order: currentDialog.inputs.checkboxes.length + 1
    });
    renderCheckboxes();
    updatePreview();
}

function renderCheckboxes() {
    const container = document.getElementById('checkboxes-container');
    if (currentDialog.inputs.checkboxes.length === 0) {
        container.innerHTML = '<div class="empty-state">No checkboxes</div>';
        return;
    }

    container.innerHTML = currentDialog.inputs.checkboxes.map((checkbox, index) => `
        <div class="mc-item">
            <div class="mc-item-header">
                <span class="mc-item-title">Checkbox ${index + 1}</span>
                <div class="mc-item-actions">
                    <button class="mc-button mc-button-red" onclick="deleteCheckbox(${index})">DEL</button>
                </div>
            </div>
            <div style="margin-top: 8px;">
                <label class="mc-label">Label:</label>
                <input type="text" class="mc-input" value="${escapeHtml(checkbox.label)}"
                    oninput="updateCheckbox(${index}, 'label', this.value)">

                <label class="mc-label">Key (placeholder variable):</label>
                <input type="text" class="mc-input" value="${escapeHtml(checkbox.key)}"
                    oninput="updateCheckbox(${index}, 'key', this.value)">

                <div class="mc-checkbox-group">
                    <input type="checkbox" class="mc-checkbox" ${checkbox.initial ? 'checked' : ''}
                        onchange="updateCheckbox(${index}, 'initial', this.checked)">
                    <label class="mc-label" style="margin: 0;">Checked by default</label>
                </div>
            </div>
        </div>
    `).join('');
}

function updateCheckbox(index, field, value) {
    currentDialog.inputs.checkboxes[index][field] = value;
    updatePreview();
}

function deleteCheckbox(index) {
    currentDialog.inputs.checkboxes.splice(index, 1);
    renderCheckboxes();
    updatePreview();
}

function addButton() {
    currentDialog.buttons.push({
        label: 'Button',
        tooltip: '',
        actions: []
    });
    renderButtons();
    updatePreview();
}

function renderButtons() {
    const container = document.getElementById('buttons-container');
    if (currentDialog.buttons.length === 0) {
        container.innerHTML = '<div class="empty-state">No buttons</div>';
        return;
    }

    const isLastButton = currentDialog.buttons.length === 1;
    container.innerHTML = currentDialog.buttons.map((button, index) => `
        <div class="mc-item">
            <div class="mc-item-header">
                <span class="mc-item-title">Button ${index + 1} <span class="mc-badge mc-badge-blue">${button.actions.length} actions</span>${isLastButton ? ' <span class="mc-badge">Required</span>' : ''}</span>
                <div class="mc-item-actions">
                    <button class="mc-button mc-button-green" onclick="addButtonAction(${index})">+ACT</button>
                    ${!isLastButton ? `<button class="mc-button mc-button-red" onclick="deleteButton(${index})">DEL</button>` : ''}
                </div>
            </div>
            <div style="margin-top: 8px;">
                <label class="mc-label">Label:</label>
                <input type="text" class="mc-input" value="${escapeHtml(button.label)}"
                    oninput="updateButton(${index}, 'label', this.value)">

                <label class="mc-label">Tooltip:</label>
                <input type="text" class="mc-input" value="${escapeHtml(button.tooltip)}"
                    oninput="updateButton(${index}, 'tooltip', this.value)">

                ${button.actions.length > 0 ? `
                    <label class="mc-label">Actions:</label>
                    <div class="action-preview">
                        ${button.actions.map((action, aIndex) => `
                            <div class="action-item">
                                <span class="action-type">${action.name}</span>
                                <span class="action-data">${escapeHtml(action.data.substring(0, 30))}${action.data.length > 30 ? '...' : ''}</span>
                                <button class="mc-button mc-button-red" onclick="deleteButtonAction(${index}, ${aIndex})">×</button>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function updateButton(index, field, value) {
    currentDialog.buttons[index][field] = value;
    updatePreview();
}

function deleteButton(index) {
    // Prevent deleting the last button (dialogs must have at least one button)
    if (currentDialog.buttons.length <= 1) {
        return;
    }
    currentDialog.buttons.splice(index, 1);
    renderButtons();
    updatePreview();
}

function addButtonAction(buttonIndex) {
    currentButtonIndex = buttonIndex;
    updateActionFields();
    document.getElementById('action-modal').classList.add('show');
}

function closeActionModal() {
    document.getElementById('action-modal').classList.remove('show');
    currentButtonIndex = -1;
}

function confirmAction() {
    const type = document.getElementById('action-type').value;
    const data = document.getElementById('action-data').value;

    if (!data) {
        return; // Just don't add if empty
    }

    currentDialog.buttons[currentButtonIndex].actions.push({
        name: type,
        data: data
    });

    document.getElementById('action-data').value = '';
    renderButtons();
    updatePreview();
    closeActionModal();
}

function deleteButtonAction(buttonIndex, actionIndex) {
    currentDialog.buttons[buttonIndex].actions.splice(actionIndex, 1);
    renderButtons();
    updatePreview();
}

function updatePreview() {
    currentDialog.id = document.getElementById('dialog-id').value;
    currentDialog.title = document.getElementById('dialog-title').value;
    currentDialog.canCloseWithEscape = document.getElementById('can-close-escape').checked;

    updateVisualPreview();
    updateJSONPreview();
}

function updateVisualPreview() {
    const preview = document.getElementById('preview-container');
    const px = (n) => `calc(var(--dialog-px) * ${n})`;

    // Save scroll position
    const scrollContainer = preview.querySelector('.dialog-preview > div:nth-child(2)');
    const scrollPosition = scrollContainer ? scrollContainer.scrollTop : 0;

    // Title section
    let titleHtml = `
        <div style="height: ${px(33)}; display: flex; gap: ${px(10)}; justify-content: center; align-items: center">
            <span class="text-component">${parseMinimessage(currentDialog.title)}</span>
            <div class="tooltip-container">
                <div class="dialog-warning-button" style="width: ${px(20)}; height: ${px(20)};"></div>
                <div class="dialog-tooltip" style="left: ${px(20)}; top: ${px(-10)};">
                    <span class="text-component">This is a custom screen. Click here to learn more.</span>
                </div>
            </div>
        </div>
    `;

    // Body and inputs section
    let bodyHtml = '';
    if (currentDialog.body.length > 0 && currentDialog.body.some(line => line.text.trim())) {
        currentDialog.body.forEach(line => {
            if (line.text.trim()) {
                bodyHtml += `<div class="dialog-body" style="max-width: ${px(200)}; padding: ${px(4)}">
                    <span class="text-component">${parseMinimessage(line.text)}</span>
                </div>`;
            }
        });
    }

    // Inputs
    let inputsHtml = '';
    if (currentDialog.inputs.textFields.length > 0 || currentDialog.inputs.selects.length > 0 || currentDialog.inputs.checkboxes.length > 0) {
        let selectIndex = 0;
        [...currentDialog.inputs.textFields, ...currentDialog.inputs.selects, ...currentDialog.inputs.checkboxes]
            .sort((a, b) => a.order - b.order)
            .forEach(input => {
                if (input.maxLength !== undefined) {
                    // Text field
                    const currentValue = input.currentValue || '';
                    inputsHtml += `<div style="display: flex; flex-direction: column; gap: ${px(4)}; margin-bottom: ${px(10)};">
                        <span class="text-component">${parseMinimessage(input.label)}</span>
                        <div class="dialog-edit-box" style="width: ${px(200)}; height: ${px(20)}; position: relative;">
                            <input type="text"
                                class="preview-text-input"
                                data-field-key="${input.key}"
                                value="${escapeHtml(currentValue)}"
                                placeholder="${escapeHtml(input.placeholder || '')}"
                                maxlength="${input.maxLength}"
                                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: transparent; border: none; outline: none; padding: ${px(4)}; font-family: MinecraftSeven, sans-serif; font-size: ${px(8)}; color: #fff;">
                        </div>
                    </div>`;
                } else if (input.options !== undefined) {
                    // Select/dropdown
                    const selectedOption = input.options.find(opt => opt.initial) || input.options[0];
                    const label = selectedOption ? selectedOption.display || selectedOption.value : '';
                    inputsHtml += `<div class="dialog-button minecraft-select-button" data-select-index="${selectIndex}" style="width: ${px(200)}; height: ${px(20)}; cursor: pointer; margin-bottom: ${px(10)};">
                        <span class="text-component">${parseMinimessage(input.label)} ${parseMinimessage(label)}</span>
                    </div>`;
                    selectIndex++;
                } else {
                    // Checkbox
                    inputsHtml += `<div style="display: flex; gap: ${px(4)}; align-items: center; justify-content: center; margin-bottom: ${px(10)};">
                        <div class="dialog-checkbox ${input.initial ? 'dialog-selected' : ''}" style="width: ${px(17)}; height: ${px(17)}; flex-shrink: 0;"></div>
                        <span class="text-component" style="color: #e0e0e0; line-height: ${px(17)};">${parseMinimessage(input.label)}</span>
                    </div>`;
                }
            });
    }

    // Buttons section
    let buttonsHtml = '';
    if (currentDialog.buttons.length > 0) {
        const columns = 2;
        const totalCount = currentDialog.buttons.length;
        const gridCount = Math.floor(totalCount / columns) * columns;

        buttonsHtml = `<div style="padding-top: ${px(4)}; display: grid; grid-template-columns: repeat(${columns}, minmax(0, 1fr)); gap: ${px(2)}; justify-content: center;">`;

        currentDialog.buttons.slice(0, gridCount).forEach((button, index) => {
            if (button.tooltip) {
                buttonsHtml += `<div class="tooltip-container">
                    <div class="dialog-button preview-button-click" data-button-index="${index}" style="width: ${px(150)}; height: ${px(20)}; cursor: pointer;">
                        <span class="text-component">${parseMinimessage(button.label)}</span>
                    </div>
                    <div class="dialog-tooltip" style="left: 50%; transform: translateX(-50%); bottom: ${px(25)};">
                        <span class="text-component">${parseMinimessage(button.tooltip)}</span>
                    </div>
                </div>`;
            } else {
                buttonsHtml += `<div class="dialog-button preview-button-click" data-button-index="${index}" style="width: ${px(150)}; height: ${px(20)}; cursor: pointer;">
                    <span class="text-component">${parseMinimessage(button.label)}</span>
                </div>`;
            }
        });

        if (totalCount > gridCount) {
            buttonsHtml += `<div style="grid-column: span ${columns}; display: flex; gap: ${px(2)}; justify-content: center;">`;
            currentDialog.buttons.slice(gridCount).forEach((button, i) => {
                const index = gridCount + i;
                if (button.tooltip) {
                    buttonsHtml += `<div class="tooltip-container">
                        <div class="dialog-button preview-button-click" data-button-index="${index}" style="width: ${px(150)}; height: ${px(20)}; cursor: pointer;">
                            <span class="text-component">${parseMinimessage(button.label)}</span>
                        </div>
                        <div class="dialog-tooltip" style="left: 50%; transform: translateX(-50%); bottom: ${px(25)};">
                            <span class="text-component">${parseMinimessage(button.tooltip)}</span>
                        </div>
                    </div>`;
                } else {
                    buttonsHtml += `<div class="dialog-button preview-button-click" data-button-index="${index}" style="width: ${px(150)}; height: ${px(20)}; cursor: pointer;">
                        <span class="text-component">${parseMinimessage(button.label)}</span>
                    </div>`;
                }
            });
            buttonsHtml += '</div>';
        }

        buttonsHtml += '</div>';
    }

    const footerHeight = 33;

    preview.innerHTML = `
        <div class="dialog-preview" style="--dialog-px: 1px; width: 100%; max-width: 400px; max-height: 450px; display: flex; flex-direction: column; margin: 0 auto;">
            ${titleHtml}
            <div style="display: flex; flex-direction: column; gap: ${px(10)}; align-items: center; overflow-y: auto; flex: 1; padding: ${px(10)} 0;">
                ${bodyHtml}
                ${inputsHtml}
            </div>
            <div style="padding-top: ${px(10)}; flex-shrink: 0; display: flex; justify-content: center;">
                ${buttonsHtml}
            </div>
        </div>
    `;

    // Set up responsive scaling
    const dialogPreview = preview.querySelector('.dialog-preview');
    if (dialogPreview) {
        function resizeHandler() {
            const width = Math.floor(preview.clientWidth);
            dialogPreview.style.setProperty('--dialog-px', `${width/400}px`);
        }
        resizeHandler();
        window.removeEventListener('resize', resizeHandler);
        window.addEventListener('resize', resizeHandler);
    }

    // Restore scroll position
    const newScrollContainer = preview.querySelector('.dialog-preview > div:nth-child(2)');
    if (newScrollContainer && scrollPosition > 0) {
        newScrollContainer.scrollTop = scrollPosition;
    }

    // Add click handlers for select buttons
    document.querySelectorAll('.minecraft-select-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const selectIndex = parseInt(e.currentTarget.dataset.selectIndex);
            cycleSelectOption(selectIndex);
        });
    });

    // Add click handlers for action buttons
    document.querySelectorAll('.preview-button-click').forEach(button => {
        button.addEventListener('click', (e) => {
            const buttonIndex = parseInt(e.currentTarget.dataset.buttonIndex);
            showButtonActions(buttonIndex);
        });
    });

    // Add input handlers for text fields
    document.querySelectorAll('.preview-text-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const fieldKey = e.target.dataset.fieldKey;
            const value = e.target.value;

            // Store the value in the dialog data
            const textField = currentDialog.inputs.textFields.find(f => f.key === fieldKey);
            if (textField) {
                textField.currentValue = value;
            }
        });
    });
}

function showButtonActions(buttonIndex) {
    const button = currentDialog.buttons[buttonIndex];
    const consoleContent = document.getElementById('preview-console-content');

    if (!button || !button.actions || button.actions.length === 0) {
        consoleContent.innerHTML = `<div style="color: var(--text-muted); font-style: italic;">Button "${stripMinimessage(button.label)}" has no actions</div>`;
        return;
    }

    // Get current input values
    const inputValues = {};

    // Get text field values
    currentDialog.inputs.textFields.forEach(field => {
        inputValues[field.key] = field.currentValue || '';
    });

    // Get select values
    currentDialog.inputs.selects.forEach(select => {
        const selectedOption = select.options.find(opt => opt.initial) || select.options[0];
        inputValues[select.key] = selectedOption ? selectedOption.value : '';
    });

    // Get checkbox values
    currentDialog.inputs.checkboxes.forEach(checkbox => {
        inputValues[checkbox.key] = checkbox.initial ? 'true' : 'false';
    });

    let output = '';
    button.actions.forEach((action, index) => {
        const actionType = action.name || 'unknown';
        let actionData = action.data || '';

        // Replace placeholders with actual values
        actionData = actionData.replace(/\{(\w+)\}/g, (match, key) => {
            return inputValues[key] !== undefined ? inputValues[key] : match;
        });

        output += `<div>`;
        output += `<div class="console-action-type">${actionType}</div>`;
        output += `<div class="console-action-data">`;

        switch(actionType) {
            case 'message':
                output += `Send message: "${actionData}"`;
                break;
            case 'open_dialog':
                output += `Open dialog: "${actionData}"`;
                break;
            case 'open_random_dialog':
                output += `Open random dialog from: ${actionData}`;
                break;
            case 'console_command':
                output += `Execute console command: /${actionData}`;
                break;
            case 'player_command':
                output += `Execute as player: /${actionData}`;
                break;
            case 'send_to_server':
                output += `Transfer to server: "${actionData}"`;
                break;
            default:
                output += `Data: ${actionData}`;
        }

        output += `</div></div>`;
    });

    consoleContent.innerHTML = output;
}

function cycleSelectOption(selectIndex) {
    const selects = currentDialog.inputs.selects;
    if (!selects[selectIndex]) return;

    const select = selects[selectIndex];
    const currentInitialIndex = select.options.findIndex(opt => opt.initial);

    // Reset all options
    select.options.forEach(opt => opt.initial = false);

    // Set next option as initial
    const nextIndex = (currentInitialIndex + 1) % select.options.length;
    select.options[nextIndex].initial = true;

    updatePreview();
}

function updateJSONPreview() {
    const json = JSON.stringify(currentDialog, null, 2);
    document.getElementById('json-preview').textContent = json;
}

function parseMinimessage(text) {
    if (!text) return '';

    // Minecraft color name mappings
    const colorMap = {
        'black': '#000000',
        'dark_blue': '#0000AA',
        'dark_green': '#00AA00',
        'dark_aqua': '#00AAAA',
        'dark_red': '#AA0000',
        'dark_purple': '#AA00AA',
        'gold': '#FFAA00',
        'gray': '#AAAAAA',
        'dark_gray': '#555555',
        'blue': '#5555FF',
        'green': '#55FF55',
        'aqua': '#55FFFF',
        'red': '#FF5555',
        'light_purple': '#FF55FF',
        'yellow': '#FFFF55',
        'white': '#FFFFFF'
    };

    text = text.replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>');
    text = text.replace(/<i>(.*?)<\/i>/g, '<em>$1</em>');
    text = text.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');

    // Replace named colors with hex codes
    text = text.replace(/<color:(\w+)>(.*?)<\/color>/g, (match, colorName, content) => {
        const hexColor = colorMap[colorName.toLowerCase()] || colorName;
        return `<span style="color: ${hexColor};">${content}</span>`;
    });

    text = text.replace(/<color:(#[0-9a-fA-F]{6})>(.*?)<\/color>/g, '<span style="color: $1;">$2</span>');
    text = text.replace(/<gradient:(#[0-9a-fA-F]{6}):.*?>(.*?)<\/gradient>/g, '<span style="color: $1;">$2</span>');
    text = text.replace(/<rainbow>(.*?)<\/rainbow>/g, '<span style="background: linear-gradient(to right, red, orange, yellow, green, blue, violet); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">$1</span>');
    return text;
}

function stripMinimessage(text) {
    if (!text) return '';
    // Remove all MiniMessage formatting tags to get plain text
    text = text.replace(/<\/?b>/g, '');
    text = text.replace(/<\/?i>/g, '');
    text = text.replace(/<\/?u>/g, '');
    text = text.replace(/<color:[^>]+>/g, '');
    text = text.replace(/<\/color>/g, '');
    text = text.replace(/<gradient:[^>]+>/g, '');
    text = text.replace(/<\/gradient>/g, '');
    text = text.replace(/<\/?rainbow>/g, '');
    text = text.replace(/<click:[^>]+>/g, '');
    text = text.replace(/<\/click>/g, '');
    return text;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyJSON() {
    updatePreview();
    const json = JSON.stringify(currentDialog, null, 2);

    navigator.clipboard.writeText(json).then(() => {
        const btn = document.querySelector('.copy-json-btn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

function downloadJSON() {
    updatePreview();

    // Validate that dialog has at least one button
    if (!currentDialog.buttons || currentDialog.buttons.length === 0) {
        console.error('Dialog must have at least one button');
        return;
    }

    const json = JSON.stringify(currentDialog, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDialog.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            currentDialog = JSON.parse(e.target.result);

            // Ensure dialog has at least one button
            if (!currentDialog.buttons || currentDialog.buttons.length === 0) {
                currentDialog.buttons = [
                    {
                        label: '<color:red>Close</color>',
                        tooltip: 'Click to close',
                        actions: []
                    }
                ];
            }

            loadDialogToForm();
        } catch (error) {
            console.error('Error loading dialog:', error);
        }
    };
    reader.readAsText(file);
}

function loadDialogToForm() {
    document.getElementById('dialog-id').value = currentDialog.id || '';
    document.getElementById('dialog-title').value = currentDialog.title || '';
    document.getElementById('can-close-escape').checked = currentDialog.canCloseWithEscape !== false;

    renderBodyLines();
    renderTextFields();
    renderSelects();
    renderCheckboxes();
    renderButtons();
    updatePreview();
}

function loadExample() {
    currentDialog = {
        "id": "welcome_example",
        "title": "<u><b><color:#ff7300>Welcome!</color></b></u>",
        "canCloseWithEscape": false,
        "body": [
            {"text": "<color:#ffd199><i>Example dialog<i></color>"},
            {"text": ""},
            {"text": "This is a demo of FancyDialogs!"}
        ],
        "inputs": {
            "textFields": [{
                "placeholder": "",
                "maxLength": 50,
                "maxLines": 1,
                "key": "name",
                "label": "<color:#ff7300>Your name?</color>",
                "order": 1
            }],
            "selects": [{
                "options": [
                    {"value": "red", "display": "<color:red>Red</color>", "initial": true},
                    {"value": "blue", "display": "<color:blue>Blue</color>", "initial": false}
                ],
                "key": "color",
                "label": "<color:#ff7300>Favorite color?</color>",
                "order": 2
            }],
            "checkboxes": [{
                "initial": true,
                "key": "cool",
                "label": "<color:#ff7300>Are you cool?</color>",
                "order": 3
            }]
        },
        "buttons": [
            {"label": "<color:#ff4f19>Close</color>", "tooltip": "Exit", "actions": []},
            {"label": "<color:#ffd000>Show Info</color>", "tooltip": "Display", "actions": [
                {"name": "message", "data": "Hi {name}! Color: {color}"}
            ]}
        ]
    };
    loadDialogToForm();
}

function resetDialog() {
    currentDialog = {
        id: 'my_dialog',
        title: '<b><color:#ff7300>My Dialog</color></b>',
        canCloseWithEscape: true,
        body: [],
        inputs: { textFields: [], selects: [], checkboxes: [] },
        buttons: [
            {
                label: '<color:red>Close</color>',
                tooltip: 'Click to close',
                actions: []
            }
        ]
    };
    loadDialogToForm();
}

function loadPreset(presetType) {
    const presets = {
        welcome: {
            id: "welcome_dialog",
            title: "<u><b><color:#ffd000>Welcome to the Server!</color></b></u>",
            canCloseWithEscape: true,
            body: [
                {"text": "<color:#ffd199>Hello and welcome!</color>"},
                {"text": ""},
                {"text": "We're glad to have you here."},
                {"text": "Please take a moment to read the rules."}
            ],
            inputs: { textFields: [], selects: [], checkboxes: [] },
            buttons: [
                {"label": "<color:#10b981>Continue</color>", "tooltip": "Proceed", "actions": []},
                {"label": "<color:#94a3b8>Read Rules</color>", "tooltip": "View rules", "actions": [
                    {"name": "open_dialog", "data": "rules_dialog"}
                ]}
            ]
        },
        confirm: {
            id: "confirm_dialog",
            title: "<b><color:#ea580c>Confirm Action</color></b>",
            canCloseWithEscape: true,
            body: [
                {"text": "<color:#fbbf24>Are you sure?</color>"},
                {"text": ""},
                {"text": "This action cannot be undone."}
            ],
            inputs: { textFields: [], selects: [], checkboxes: [] },
            buttons: [
                {"label": "<color:#ef4444>Cancel</color>", "tooltip": "Cancel action", "actions": []},
                {"label": "<color:#10b981>Confirm</color>", "tooltip": "Confirm action", "actions": [
                    {"name": "console_command", "data": "say Action confirmed!"}
                ]}
            ]
        },
        survey: {
            id: "survey_dialog",
            title: "<b><color:#3b82f6>Player Survey</color></b>",
            canCloseWithEscape: false,
            body: [
                {"text": "<color:#ffd199>Help us improve!</color>"},
                {"text": ""},
                {"text": "Please answer a few questions:"}
            ],
            inputs: {
                textFields: [{
                    placeholder: "Your feedback here...",
                    maxLength: 200,
                    maxLines: 3,
                    key: "feedback",
                    label: "<color:#fbbf24>What do you think?</color>",
                    order: 1
                }],
                selects: [{
                    options: [
                        {"value": "5", "display": "<color:#10b981>⭐⭐⭐⭐⭐ Excellent</color>", "initial": true},
                        {"value": "4", "display": "<color:#3b82f6>⭐⭐⭐⭐ Good</color>", "initial": false},
                        {"value": "3", "display": "<color:#fbbf24>⭐⭐⭐ Average</color>", "initial": false},
                        {"value": "2", "display": "<color:#ea580c>⭐⭐ Poor</color>", "initial": false},
                        {"value": "1", "display": "<color:#ef4444>⭐ Bad</color>", "initial": false}
                    ],
                    key: "rating",
                    label: "<color:#fbbf24>Rate your experience:</color>",
                    order: 2
                }],
                checkboxes: [{
                    initial: false,
                    key: "recommend",
                    label: "<color:#fbbf24>Would you recommend us?</color>",
                    order: 3
                }]
            },
            buttons: [
                {"label": "<color:#10b981>Submit</color>", "tooltip": "Submit survey", "actions": [
                    {"name": "message", "data": "Thank you for your feedback!"}
                ]}
            ]
        },
        settings: {
            id: "settings_dialog",
            title: "<b><color:#d97706>⚙️ Settings</color></b>",
            canCloseWithEscape: true,
            body: [
                {"text": "<color:#ffd199>Configure your preferences</color>"}
            ],
            inputs: {
                textFields: [],
                selects: [{
                    options: [
                        {"value": "low", "display": "Low", "initial": false},
                        {"value": "medium", "display": "Medium", "initial": true},
                        {"value": "high", "display": "High", "initial": false}
                    ],
                    key: "quality",
                    label: "<color:#fbbf24>Graphics Quality:</color>",
                    order: 1
                }],
                checkboxes: [
                    {
                        initial: true,
                        key: "sounds",
                        label: "<color:#fbbf24>Enable Sounds</color>",
                        order: 2
                    },
                    {
                        initial: false,
                        key: "notifications",
                        label: "<color:#fbbf24>Show Notifications</color>",
                        order: 3
                    }
                ]
            },
            buttons: [
                {"label": "<color:#ef4444>Cancel</color>", "tooltip": "Discard changes", "actions": []},
                {"label": "<color:#10b981>Save</color>", "tooltip": "Save settings", "actions": [
                    {"name": "message", "data": "Settings saved!"}
                ]}
            ]
        },
        warning: {
            id: "warning_dialog",
            title: "<b><color:#ef4444>⚠️ Warning</color></b>",
            canCloseWithEscape: false,
            body: [
                {"text": "<color:#ef4444><b>ATTENTION!</b></color>"},
                {"text": ""},
                {"text": "You are entering a dangerous area."},
                {"text": "Proceed with caution!"}
            ],
            inputs: { textFields: [], selects: [], checkboxes: [] },
            buttons: [
                {"label": "<color:#94a3b8>Go Back</color>", "tooltip": "Return to safety", "actions": []},
                {"label": "<color:#fbbf24>I Understand</color>", "tooltip": "Accept risk", "actions": [
                    {"name": "message", "data": "Be careful!"}
                ]}
            ]
        }
    };

    if (presets[presetType]) {
        currentDialog = presets[presetType];
        loadDialogToForm();
    }
}

document.addEventListener('input', (e) => {
    if (e.target.id === 'dialog-id' || e.target.id === 'dialog-title' || e.target.id === 'can-close-escape') {
        updatePreview();
    }
});

function openPresetsModal() {
    document.getElementById('presets-modal').classList.add('show');
}

function closePresetsModal() {
    document.getElementById('presets-modal').classList.remove('show');
}

function loadPresetAndClose(presetType) {
    loadPreset(presetType);
    closePresetsModal();
}

function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    document.getElementById(pageName + '-page').classList.add('active');

    // Update navbar
    document.querySelectorAll('.navbar-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.navbar-item').classList.add('active');
}

// ===== NEW FEATURES =====

// Utility Functions for Performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Theme System
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
    showToast(`Switched to ${newTheme} mode`, 'success', 2000);
}

function updateThemeButton(theme) {
    const icon = document.querySelector('.theme-toggle .material-icons');
    if (icon) {
        icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    }
}

// Toast Notifications
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };

    toast.innerHTML = `
        <span class="material-icons">${icons[type] || 'info'}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Drag and Drop File Import
function setupDragDrop() {
    const dropZones = [document.getElementById('editor-page'), document.body];

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showDropIndicator();
        });

        zone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.target === zone) {
                hideDropIndicator();
            }
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            hideDropIndicator();

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                if (files[0].name.endsWith('.json')) {
                    handleFileImport(files[0]);
                } else {
                    showToast('Please drop a valid JSON file', 'error');
                }
            }
        });
    });
}

function showDropIndicator() {
    if (document.getElementById('drop-indicator')) return;

    const indicator = document.createElement('div');
    indicator.id = 'drop-indicator';
    indicator.innerHTML = `
        <div class="drop-overlay">
            <span class="material-icons">cloud_upload</span>
            <div>Drop JSON file to import</div>
        </div>
    `;
    document.body.appendChild(indicator);
}

function hideDropIndicator() {
    const indicator = document.getElementById('drop-indicator');
    if (indicator) indicator.remove();
}

function handleFileImport(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            const validation = validateImportedJSON(data);

            if (!validation.valid) {
                showToast(`Import failed: ${validation.error}`, 'error', 5000);
                return;
            }

            currentDialog = validation.data;
            loadDialogToForm();
            showToast('Dialog imported successfully!', 'success');
            trackChange();
        } catch (error) {
            showToast('Invalid JSON file', 'error');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
}

// Real-time Validation
function validateDialog() {
    const errors = [];
    const warnings = [];

    // ID validation
    if (!currentDialog.id || !currentDialog.id.trim()) {
        errors.push({ field: 'dialog-id', message: 'Dialog ID is required' });
    } else if (!/^[a-z0-9_]+$/.test(currentDialog.id)) {
        warnings.push({ field: 'dialog-id', message: 'ID should use lowercase letters, numbers, and underscores only' });
    }

    // Title validation
    if (!currentDialog.title || !currentDialog.title.trim()) {
        warnings.push({ field: 'dialog-title', message: 'Dialog title is empty' });
    }

    // Button validation
    if (!currentDialog.buttons || currentDialog.buttons.length === 0) {
        errors.push({ field: 'buttons', message: 'Dialog must have at least one button' });
    }

    // Input key validation
    const keys = new Set();
    const allInputs = [
        ...currentDialog.inputs.textFields,
        ...currentDialog.inputs.selects,
        ...currentDialog.inputs.checkboxes
    ];

    allInputs.forEach(input => {
        if (keys.has(input.key)) {
            errors.push({ field: input.key, message: `Duplicate key "${input.key}"` });
        }
        keys.add(input.key);

        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(input.key)) {
            warnings.push({ field: input.key, message: `Key "${input.key}" should be a valid identifier` });
        }
    });

    // Select options validation
    currentDialog.inputs.selects.forEach((select, idx) => {
        if (select.options.length === 0) {
            warnings.push({ field: `select_${idx}`, message: 'Dropdown has no options' });
        }

        const hasInitial = select.options.some(opt => opt.initial);
        if (!hasInitial && select.options.length > 0) {
            warnings.push({ field: `select_${idx}`, message: 'No default option selected' });
        }
    });

    return { errors, warnings, isValid: errors.length === 0 };
}

function validateImportedJSON(data) {
    try {
        const required = ['id', 'title', 'buttons'];
        const missing = required.filter(field => !data[field]);

        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        if (typeof data.id !== 'string') {
            throw new Error('Dialog ID must be a string');
        }

        if (!Array.isArray(data.buttons) || data.buttons.length === 0) {
            throw new Error('Dialog must have at least one button');
        }

        // Ensure inputs structure exists
        if (!data.inputs) {
            data.inputs = { textFields: [], selects: [], checkboxes: [] };
        } else {
            if (!data.inputs.textFields) data.inputs.textFields = [];
            if (!data.inputs.selects) data.inputs.selects = [];
            if (!data.inputs.checkboxes) data.inputs.checkboxes = [];
        }

        // Ensure body exists
        if (!data.body) {
            data.body = [];
        }

        return { valid: true, data };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

// Undo/Redo System
class DialogHistory {
    constructor(maxSize = 50) {
        this.history = [];
        this.currentIndex = -1;
        this.maxSize = maxSize;
    }

    push(state) {
        // Remove any states after current index
        this.history = this.history.slice(0, this.currentIndex + 1);

        // Add new state
        this.history.push(JSON.parse(JSON.stringify(state)));

        // Limit history size
        if (this.history.length > this.maxSize) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }

        this.updateUI();
    }

    undo() {
        if (this.canUndo()) {
            this.currentIndex--;
            this.updateUI();
            return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
        }
        return null;
    }

    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            this.updateUI();
            return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
        }
        return null;
    }

    canUndo() {
        return this.currentIndex > 0;
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    updateUI() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');

        if (undoBtn) undoBtn.disabled = !this.canUndo();
        if (redoBtn) redoBtn.disabled = !this.canRedo();
    }
}

const dialogHistory = new DialogHistory();

function trackChange() {
    dialogHistory.push(currentDialog);
}

const debouncedTrack = debounce(trackChange, 500);

function performUndo() {
    const state = dialogHistory.undo();
    if (state) {
        currentDialog = state;
        loadDialogToForm();
        showToast('Undo successful', 'info', 1500);
    }
}

function performRedo() {
    const state = dialogHistory.redo();
    if (state) {
        currentDialog = state;
        loadDialogToForm();
        showToast('Redo successful', 'info', 1500);
    }
}

// Auto-save Functionality
let autoSaveInterval;

function startAutoSave() {
    autoSaveInterval = setInterval(() => {
        saveToLocalStorage();
    }, 30000); // Every 30 seconds
}

function saveToLocalStorage() {
    try {
        const dialogData = {
            dialog: currentDialog,
            timestamp: Date.now()
        };
        localStorage.setItem('fancydialogs_autosave', JSON.stringify(dialogData));
        showAutoSaveIndicator(true);
        setTimeout(() => showAutoSaveIndicator(false), 2000);
    } catch (e) {
        console.error('Auto-save failed:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('fancydialogs_autosave');
        if (saved) {
            const data = JSON.parse(saved);
            const age = Date.now() - data.timestamp;

            // If auto-save is less than 24 hours old
            if (age < 86400000) {
                return data.dialog;
            }
        }
    } catch (e) {
        console.error('Failed to load auto-save:', e);
    }
    return null;
}

function showAutoSaveIndicator(saving) {
    let indicator = document.getElementById('autosave-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'autosave-indicator';
        indicator.className = 'autosave-indicator';
        document.querySelector('.navbar-menu').appendChild(indicator);
    }

    if (saving) {
        indicator.innerHTML = '<span class="material-icons">sync</span><span>Saving...</span>';
        indicator.classList.remove('saved');
    } else {
        indicator.innerHTML = '<span class="material-icons">cloud_done</span><span>Saved</span>';
        indicator.classList.add('saved');
    }
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? e.metaKey : e.ctrlKey;

        // Save: Ctrl/Cmd + S
        if (modifier && e.key === 's') {
            e.preventDefault();
            downloadJSON();
            showToast('Dialog saved!', 'success');
        }

        // Copy JSON: Ctrl/Cmd + K
        if (modifier && e.key === 'k') {
            e.preventDefault();
            copyJSON();
        }

        // Open import: Ctrl/Cmd + O
        if (modifier && e.key === 'o') {
            e.preventDefault();
            document.getElementById('file-input').click();
        }

        // Undo: Ctrl/Cmd + Z
        if (modifier && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            performUndo();
        }

        // Redo: Ctrl/Cmd + Shift + Z
        if (modifier && e.shiftKey && e.key === 'z') {
            e.preventDefault();
            performRedo();
        }

        // Tab navigation: Ctrl/Cmd + 1-4
        if (modifier && ['1', '2', '3', '4'].includes(e.key)) {
            e.preventDefault();
            const tabs = ['basic', 'body', 'inputs', 'buttons'];
            switchTab(tabs[parseInt(e.key) - 1]);
        }

        // Help panel: Ctrl/Cmd + /
        if (modifier && e.key === '/') {
            e.preventDefault();
            toggleHelpPanel();
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            closeActionModal();
            closeOptionModal();
            closePresetsModal();
        }
    });
}

function switchTab(tabName) {
    const tab = document.querySelector(`[data-tab="${tabName}"]`);
    if (tab) {
        tab.click();
    }
}

// Help Panel
function createHelpPanel() {
    const panel = document.createElement('div');
    panel.id = 'help-panel';
    panel.className = 'help-panel collapsed';
    panel.innerHTML = `
        <button class="help-toggle" onclick="toggleHelpPanel()">
            <span class="material-icons">help</span>
        </button>

        <div class="help-content">
            <div class="help-header">
                <h3>Quick Help</h3>
                <button onclick="toggleHelpPanel()">
                    <span class="material-icons">close</span>
                </button>
            </div>

            <div class="help-sections">
                <div class="help-section">
                    <h4>Keyboard Shortcuts</h4>
                    <ul>
                        <li><kbd>Ctrl</kbd> + <kbd>S</kbd> - Save dialog</li>
                        <li><kbd>Ctrl</kbd> + <kbd>K</kbd> - Copy JSON</li>
                        <li><kbd>Ctrl</kbd> + <kbd>O</kbd> - Import file</li>
                        <li><kbd>Ctrl</kbd> + <kbd>Z</kbd> - Undo</li>
                        <li><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> - Redo</li>
                        <li><kbd>Ctrl</kbd> + <kbd>1-4</kbd> - Switch tabs</li>
                        <li><kbd>Ctrl</kbd> + <kbd>/</kbd> - Toggle help</li>
                    </ul>
                </div>

                <div class="help-section">
                    <h4>MiniMessage Examples</h4>
                    <ul>
                        <li><code>&lt;b&gt;Bold&lt;/b&gt;</code></li>
                        <li><code>&lt;i&gt;Italic&lt;/i&gt;</code></li>
                        <li><code>&lt;u&gt;Underline&lt;/u&gt;</code></li>
                        <li><code>&lt;color:red&gt;Red&lt;/color&gt;</code></li>
                        <li><code>&lt;color:#ff0000&gt;Hex&lt;/color&gt;</code></li>
                        <li><code>&lt;gradient:red:blue&gt;Text&lt;/gradient&gt;</code></li>
                    </ul>
                </div>

                <div class="help-section">
                    <h4>Quick Tips</h4>
                    <ul>
                        <li>Use {key} to reference input values</li>
                        <li>Use %placeholder% for PlaceholderAPI</li>
                        <li>Dialogs need at least one button</li>
                        <li>Drag and drop JSON files to import</li>
                        <li>Changes are auto-saved every 30s</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(panel);
}

function toggleHelpPanel() {
    const panel = document.getElementById('help-panel');
    if (panel) {
        panel.classList.toggle('collapsed');
    }
}

// Tooltip System
let currentTooltipTarget = null;

function initTooltips() {
    // Use mouseover/mouseout instead of mouseenter/mouseleave for better event bubbling
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('[data-tooltip]');
        if (target && target !== currentTooltipTarget) {
            currentTooltipTarget = target;
            showTooltip(target, target.getAttribute('data-tooltip'));
        }
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('[data-tooltip]');
        if (target && target === currentTooltipTarget) {
            // Check if we're actually leaving the element
            const relatedTarget = e.relatedTarget;
            if (!relatedTarget || !target.contains(relatedTarget)) {
                hideTooltip();
                currentTooltipTarget = null;
            }
        }
    });

    // Also hide tooltip on scroll or when clicking anywhere
    document.addEventListener('scroll', hideTooltip, true);
    document.addEventListener('click', hideTooltip);
}

function showTooltip(element, text) {
    hideTooltip(); // Remove any existing tooltip

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.id = 'active-tooltip';
    tooltip.textContent = text;

    document.body.appendChild(tooltip);

    // Position tooltip below the element
    const rect = element.getBoundingClientRect();
    const tooltipHeight = tooltip.offsetHeight;
    const tooltipWidth = tooltip.offsetWidth;

    // Calculate position (below the element, centered)
    let top = rect.bottom + 8;
    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

    // Ensure tooltip stays within viewport
    const padding = 10;
    if (left < padding) {
        left = padding;
    } else if (left + tooltipWidth > window.innerWidth - padding) {
        left = window.innerWidth - tooltipWidth - padding;
    }

    // If tooltip would go below viewport, position it above the element instead
    if (top + tooltipHeight > window.innerHeight - padding) {
        top = rect.top - tooltipHeight - 8;
        tooltip.classList.add('tooltip-top');
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;

    requestAnimationFrame(() => {
        tooltip.classList.add('visible');
    });
}

function hideTooltip() {
    const tooltip = document.getElementById('active-tooltip');
    if (tooltip) {
        tooltip.classList.remove('visible');
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.remove();
            }
        }, 200);
    }
}

// Preview Controls
function addPreviewControls() {
    const previewPanel = document.querySelector('.mc-panel:has(#preview-container)');
    if (!previewPanel) return;

    const controls = document.createElement('div');
    controls.className = 'preview-controls';
    controls.innerHTML = `
        <div class="preview-scale-controls">
            <label class="mc-label">Preview Scale:</label>
            <div class="button-group">
                <button class="mc-button" onclick="setPreviewScale(0.75)">75%</button>
                <button class="mc-button active" onclick="setPreviewScale(1)">100%</button>
                <button class="mc-button" onclick="setPreviewScale(1.25)">125%</button>
                <button class="mc-button" onclick="setPreviewScale(1.5)">150%</button>
            </div>
        </div>

        <div class="preview-device-controls">
            <label class="mc-label">Device Preview:</label>
            <div class="button-group">
                <button class="mc-button active" onclick="setDevicePreview('desktop')" aria-label="Desktop view">
                    <span class="material-icons">computer</span>
                </button>
                <button class="mc-button" onclick="setDevicePreview('tablet')" aria-label="Tablet view">
                    <span class="material-icons">tablet</span>
                </button>
                <button class="mc-button" onclick="setDevicePreview('mobile')" aria-label="Mobile view">
                    <span class="material-icons">phone_android</span>
                </button>
            </div>
        </div>
    `;

    const tabs = previewPanel.querySelector('.mc-tabs');
    if (tabs) {
        previewPanel.insertBefore(controls, tabs);
    }
}

function setPreviewScale(scale) {
    const preview = document.querySelector('.preview-dialog');
    if (preview) {
        preview.style.transform = `scale(${scale})`;
        preview.style.transformOrigin = 'top center';
    }

    // Update active button
    document.querySelectorAll('.preview-scale-controls .mc-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(scale * 100)) {
            btn.classList.add('active');
        }
    });
}

function setDevicePreview(device) {
    const previewWrapper = document.querySelector('.preview-wrapper');
    if (!previewWrapper) return;

    // Remove existing device classes
    previewWrapper.classList.remove('device-desktop', 'device-tablet', 'device-mobile');

    // Add new device class
    previewWrapper.classList.add(`device-${device}`);

    // Update active button
    document.querySelectorAll('.preview-device-controls .mc-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.mc-button').classList.add('active');
}

// History Controls
function addHistoryControls() {
    const buttonRow = document.querySelector('.button-row');
    if (!buttonRow) return;

    const historyControls = document.createElement('div');
    historyControls.className = 'history-controls';
    historyControls.innerHTML = `
        <button id="undo-btn" class="mc-button" onclick="performUndo()" title="Undo (Ctrl+Z)" disabled>
            <span class="material-icons">undo</span>
        </button>
        <button id="redo-btn" class="mc-button" onclick="performRedo()" title="Redo (Ctrl+Shift+Z)" disabled>
            <span class="material-icons">redo</span>
        </button>
    `;

    buttonRow.insertBefore(historyControls, buttonRow.firstChild);
}

// Initialize All Features
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();

    // Setup drag and drop
    setupDragDrop();

    // Setup tooltips
    initTooltips();

    // Create help panel
    createHelpPanel();

    // Add preview controls
    setTimeout(() => {
        addPreviewControls();
        addHistoryControls();
    }, 100);

    // Start auto-save
    startAutoSave();

    // Check for auto-saved data
    const autoSaved = loadFromLocalStorage();
    if (autoSaved) {
        if (confirm('We found an auto-saved dialog. Would you like to restore it?')) {
            currentDialog = autoSaved;
            loadDialogToForm();
            showToast('Auto-save restored!', 'success');
        }
    }

    // Track initial state
    setTimeout(() => trackChange(), 500);

    // Track changes on update
    const originalUpdatePreview = updatePreview;
    updatePreview = function() {
        originalUpdatePreview();
        debouncedTrack();
    };
});

// Enhanced updatePreview with debouncing
const debouncedUpdatePreview = debounce(updatePreview, 300);