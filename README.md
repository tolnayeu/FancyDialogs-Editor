# FancyDialogs Web Editor

A web-based visual editor for creating custom dialogs for the FancyDialogs Minecraft plugin (1.21.6+). 

![FancyDialogs Editor](https://img.shields.io/badge/Minecraft-1.21.6+-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## Getting Started

### Online Editor

[FancyDialogs Web Editor](https://tserato.github.io/FancyDialogs-Web-Editor/)

## Features

- Visual dialog editor with live preview
- Dark and light theme modes
- Drag and drop JSON import
- Auto-save with recovery
- Undo/redo (50 state history)
- Keyboard shortcuts
- Preview scaling and device modes
- Input validation
- Help panel with tips and shortcuts

## How to Use

### Basic Dialog Creation

1. **Set Basic Info**
   - Enter a unique Dialog ID (e.g., `welcome_dialog`)
   - Add a title with MiniMessage formatting
   - Toggle "Close with ESC" option

2. **Add Body Text**
   - Click the "BODY" tab
   - Add lines of text that appear in your dialog
   - Each line supports MiniMessage formatting

3. **Add Inputs** (Optional)
   - **Text Fields**: Single or multi-line text input
   - **Dropdowns**: Selection menus with custom options
   - **Checkboxes**: Toggle options

4. **Create Buttons**
   - Add clickable buttons with custom labels
   - Attach actions to buttons (messages, commands, etc.)
   - Set tooltips for hover effects

5. **Export**
   - Click "DOWNLOAD" to save your dialog as JSON
   - Place the file in your FancyDialogs plugin folder

### Keyboard Shortcuts

- `Ctrl+S` - Save dialog
- `Ctrl+K` - Copy JSON to clipboard
- `Ctrl+O` - Import file
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo
- `Ctrl+1-4` - Switch between tabs
- `Ctrl+/` - Toggle help panel
- `Escape` - Close modals

### File Management

- Drag and drop JSON files to import
- Auto-save runs every 30 seconds
- Recovery prompt on page reload if auto-save exists

## MiniMessage Formatting

FancyDialogs supports [MiniMessage](https://docs.adventure.kyori.net/minimessage/format.html) for rich text formatting.

## PlaceholderAPI Integration

Use PlaceholderAPI placeholders in your dialogs to display dynamic content.

### In Body Text

```
Welcome, %player_name%!
You have %vault_eco_balance% coins.
Your rank: %luckperms_prefix%
```

### In Actions

```
Message: "Hello %player_name%! You selected {input_choice}"
Console Command: "give %player_name% diamond 1"
```

### Custom Input Placeholders

When you create inputs (text fields, dropdowns, checkboxes), you assign them a **key**. Use this key as a placeholder in actions:

**Example:**
- Text field with key: `player_age`
- Dropdown with key: `favorite_color`
- Checkbox with key: `accept_rules`

**Usage in actions:**
```
Message: "You are {player_age} years old and your favorite color is {favorite_color}!"
Console Command: "setrules {player_name} {accept_rules}"
```

## Dialog Components

### Text Fields

- **Label**: Display text above the input
- **Key**: Variable name for referencing the value (e.g., `player_name`)
- **Placeholder**: Hint text shown when empty
- **Max Length**: Character limit
- **Max Lines**: Number of lines (1 for single-line, >1 for multi-line)

### Dropdowns (Select)

- **Label**: Display text above the dropdown
- **Key**: Variable name for the selected value
- **Options**: List of choices
  - **Value**: Internal value stored (e.g., `red`)
  - **Display**: Text shown to player (e.g., `<color:red>Red</color>`)
  - **Default**: Pre-selected option

### Checkboxes

- **Label**: Display text next to checkbox
- **Key**: Variable name (returns `true` or `false`)
- **Initial**: Checked by default?

### Buttons

Every dialog must have at least one button. Buttons can have:

- **Label**: Display text (supports MiniMessage)
- **Tooltip**: Text shown on hover
- **Actions**: List of actions to execute when clicked

#### Available Actions

1. **Message**
   - Send a message to the player
   - Supports PlaceholderAPI and input placeholders
   - Example: `Hello {player_name}! Color: {color_choice}`

2. **Open Dialog**
   - Open another dialog by ID
   - Example: `rules_dialog`

3. **Random Dialog**
   - Open a random dialog from a list
   - Example: `quest1,quest2,quest3`

4. **Console Command**
   - Execute command as console
   - Example: `give {player_name} diamond 1`

5. **Player Command**
   - Execute command as player (without `/`)
   - Example: `spawn`

6. **Transfer Server**
   - Transfer player to another server (BungeeCord/Velocity)
   - Example: `lobby`

## Example Dialog

Here's a complete example dialog:

```json
{
  "id": "welcome_dialog",
  "title": "<b><color:#ff7300>Welcome to the Server!</color></b>",
  "canCloseWithEscape": false,
  "body": [
    {
      "text": "<color:#ffd199>Please introduce yourself:</color>"
    },
    {
      "text": ""
    },
    {
      "text": "Fill out the form below to get started!"
    }
  ],
  "inputs": {
    "textFields": [
      {
        "placeholder": "Enter your name...",
        "maxLength": 50,
        "maxLines": 1,
        "key": "player_name",
        "label": "<color:#ff7300>Your Name:</color>",
        "order": 1
      }
    ],
    "selects": [
      {
        "options": [
          {
            "value": "red",
            "display": "<color:red>Red Team</color>",
            "initial": true
          },
          {
            "value": "blue",
            "display": "<color:blue>Blue Team</color>",
            "initial": false
          }
        ],
        "key": "team_choice",
        "label": "<color:#ff7300>Choose Your Team:</color>",
        "order": 2
      }
    ],
    "checkboxes": [
      {
        "initial": false,
        "key": "accept_rules",
        "label": "<color:#ff7300>I accept the server rules</color>",
        "order": 3
      }
    ]
  },
  "buttons": [
    {
      "label": "<color:red>Cancel</color>",
      "tooltip": "Close dialog",
      "actions": []
    },
    {
      "label": "<color:green>Submit</color>",
      "tooltip": "Join the server",
      "actions": [
        {
          "name": "message",
          "data": "Welcome {player_name}! You joined the {team_choice} team!"
        },
        {
          "name": "console_command",
          "data": "team add {team_choice} {player_name}"
        }
      ]
    }
  ]
}
```

## Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## Issues & Support

If you find any issues or have feature ideas, please report them in the [issues](https://github.com/TSERATO/FancyDialogs-Web-Editor/issues).

## License

MIT License - Feel free to use, modify, and distribute!

## Credits

- **Editor**: Created for the FancyDialogs plugin from Oliver
- **MiniMessage**: [Adventure Library](https://docs.adventure.kyori.net/)
- **PlaceholderAPI**: [PlaceholderAPI Wiki](https://github.com/PlaceholderAPI/PlaceholderAPI/wiki)

---

Made for the FancyDialogs plugin by Alex and Barni
