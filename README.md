# 💧 Cat Hydration Reminder

A VS Code extension that reminds you to stay hydrated with cute cat notifications and attention-grabbing yellow theme flashes.

## Features

- **Customizable Reminders**: Set hydration reminders from 15 to 240 minutes
- **Theme Flash**: Top bars (title, status, activity) flash bright yellow to grab your attention
- **Rich Notifications**: Interactive notifications with cat emoji and action buttons
- **Persistent State**: Remembers your settings and timer state across VS Code sessions
- **Status Bar Indicator**: Shows ON/OFF status with a water droplet emoji
- **Multiple Actions**: Mark as done, snooze for 15 minutes, or open settings

## Installation

### From VSIX File

```bash
code --install-extension cat-hydration-reminder-0.2.0.vsix
```

Then reload VS Code.

### From Source

1. Clone the repository
2. Run `npm install`
3. Run `npm run compile`
4. Press F5 to launch Extension Development Host

## Usage

### Start Reminder

- Open Command Palette (`Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Windows/Linux)
- Type "Cat Hydration: Start Reminder"
- Or click the status bar item (💧 OFF → 💧 ON)

### When Reminder Triggers

- Title bar, status bar, and activity bar flash bright yellow
- Notification appears with cat emoji and message
- Click "💧 Done!" to mark as complete and restore theme
- Click "⏰ Remind me in 15 min" to snooze
- Click "⚙️ Settings" to adjust preferences
- Theme auto-restores after 30 seconds if no action taken

### Stop Reminder

- Command Palette → "Cat Hydration: Stop Reminder"
- Or click the status bar item (💧 ON → 💧 OFF)

### Reset Timer

- Command Palette → "Cat Hydration: Reset Timer"

## Configuration

Open VS Code Settings (`Cmd+,`) and search for "Cat Hydration":

- **Reminder Interval**: Set interval between reminders (15-240 minutes, default: 60)
- **Flash Theme**: Enable/disable yellow theme flash (default: true)
- **Use Animated Overlay**: Enable/disable animated notifications (default: true)

## Commands

- `catHydrationReminder.startReminder` - Start the hydration reminder
- `catHydrationReminder.stopReminder` - Stop the hydration reminder
- `catHydrationReminder.resetTimer` - Reset the reminder timer

## Requirements

- VS Code 1.85.0 or higher

## Extension Settings

This extension contributes the following settings:

- `catHydrationReminder.reminderInterval`: Reminder interval in minutes (15-240)
- `catHydrationReminder.flashTheme`: Flash theme to yellow when reminder triggers
- `catHydrationReminder.useAnimatedOverlay`: Use animated cat overlay notifications

## Known Issues

- Theme flash only affects title bar, status bar, and activity bar (by design to maintain editor readability)
- VS Code API does not support true overlays over the editor area

## Release Notes

### 0.2.0

- Added theme flash feature for maximum attention
- Only flashes top bars to maintain editor readability
- Enhanced notification system with multiple action buttons
- Improved status bar indicator

### 0.1.0

- Initial release
- Basic hydration reminder functionality
- Configurable intervals
- Persistent state management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

Stay hydrated! 💧🐱
