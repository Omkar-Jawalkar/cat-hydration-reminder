# Changelog

All notable changes to the "Cat Hydration Reminder" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-01

### Added

- Initial release of Cat Hydration Reminder extension
- Friendly cat mascot (🐱) that displays "meow meow" with hydration reminders
- Configurable reminder intervals (15-240 minutes, default 60 minutes)
- Automatic activation on VS Code startup
- Enable/disable functionality via command palette
- Status bar indicator showing current reminder state (ON/OFF)
- "Show Hydration Reminder Now" command for immediate reminders
- "Toggle Cat Hydration Reminders" command to enable/disable reminders
- State persistence across VS Code sessions
- Automatic rescheduling after dismissing reminders
- Theme-aware notifications that respect VS Code's light/dark mode
- Comprehensive logging of reminder events
- Error handling with graceful degradation

### Configuration

- `catHydrationReminder.intervalMinutes`: Set reminder frequency (15-240 minutes)
- `catHydrationReminder.enabled`: Enable or disable reminders

### Commands

- `catHydrationReminder.toggle`: Toggle reminders on/off
- `catHydrationReminder.showNow`: Show a reminder immediately

[0.1.0]: https://github.com/your-username/cat-hydration-reminder/releases/tag/v0.1.0
