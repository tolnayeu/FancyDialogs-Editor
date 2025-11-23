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
    updatePreview();
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

    let html = `
        <div class="preview-title">${parseMinimessage(currentDialog.title)}</div>
        <div class="preview-body">
            ${currentDialog.body.map(line => `<p>${parseMinimessage(line.text)}</p>`).join('') || '<p style="color: #888;">No body text</p>'}
        </div>
    `;

    if (currentDialog.inputs.textFields.length > 0 || currentDialog.inputs.selects.length > 0 || currentDialog.inputs.checkboxes.length > 0) {
        html += '<div class="preview-inputs">';
        [...currentDialog.inputs.textFields, ...currentDialog.inputs.selects, ...currentDialog.inputs.checkboxes]
            .sort((a, b) => a.order - b.order)
            .forEach(input => {
                html += '<div class="preview-input-item">';
                html += `<span class="preview-input-label">${parseMinimessage(input.label)}</span>`;

                if (input.maxLength !== undefined) {
                    html += `<input type="text" class="mc-input" placeholder="${input.placeholder}" style="margin: 0;">`;
                } else if (input.options !== undefined) {
                    html += '<select class="mc-select" style="margin: 0;">';
                    input.options.forEach(opt => {
                        html += `<option ${opt.initial ? 'selected' : ''}>${parseMinimessage(opt.display)}</option>`;
                    });
                    html += '</select>';
                } else {
                    html += `<input type="checkbox" class="mc-checkbox" ${input.initial ? 'checked' : ''}>`;
                }
                html += '</div>';
            });
        html += '</div>';
    }

    if (currentDialog.buttons.length > 0) {
        html += '<div class="preview-buttons">';
        currentDialog.buttons.forEach(button => {
            html += `<div class="preview-button" data-tooltip="${escapeHtml(stripMinimessage(button.tooltip))}">${parseMinimessage(button.label)}</div>`;
        });
        html += '</div>';
    }

    preview.innerHTML = html;
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

document.addEventListener('input', (e) => {
    if (e.target.id === 'dialog-id' || e.target.id === 'dialog-title' || e.target.id === 'can-close-escape') {
        updatePreview();
    }
});