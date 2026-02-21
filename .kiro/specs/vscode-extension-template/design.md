# Design Document: VS Code Cat Hydration Reminder Extension

## Overview

This extension provides wellness reminders to developers by displaying a cat mascot with hydration prompts at configurable intervals. The design leverages VS Code's extension API, notification system, and configuration management to create a lightweight, non-intrusive reminder system.

The extension will use VS Code's notification API for displaying the cat and message, a timer-based system for scheduling reminders, and the configuration API for user preferences.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────┐
│           VS Code Extension Host            │
│                                             │
│  ┌────────────────────────────────────┐   │
│  │     Extension Activation           │   │
│  │  - Register commands               │   │
│  │  - Initialize reminder system      │   │
│  │  - Set up configuration listeners  │   │
│  └────────────────────────────────────┘   │
│                    │                        │
│                    ▼                        │
│  ┌────────────────────────────────────┐   │
│  │      Reminder Scheduler            │   │
│  │  - Timer management                │   │
│  │  - Interval tracking               │   │
│  │  - Enable/disable state            │   │
│  └────────────────────────────────────┘   │
│                    │                        │
│                    ▼                        │
│  ┌────────────────────────────────────┐   │
│  │      Notification Display          │   │
│  │  - Cat visual + message            │   │
│  │  - Dismiss handling                │   │
│  │  - Theme-aware styling             │   │
│  └────────────────────────────────────┘   │
│                    │                        │
│                    ▼                        │
│  ┌────────────────────────────────────┐   │
│  │    Configuration Manager           │   │
│  │  - Read/write settings             │   │
│  │  - Validate intervals              │   │
│  │  - Persist state                   │   │
│  └────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **Activation**: Extension activates on VS Code startup
2. **Initialization**: Reminder scheduler reads configuration and starts timer
3. **Timer Trigger**: When interval elapses, scheduler triggers notification display
4. **Display**: Notification shows cat mascot with "meow meow" and hydration message
5. **Dismissal**: User dismisses notification, scheduler resets timer
6. **Configuration**: User changes settings, scheduler updates interval

## Components and Interfaces

### Extension Entry Point

**Responsibility**: Initialize and clean up the extension

```typescript
interface ExtensionContext {
    subscriptions: Disposable[];
    globalState: Memento;
    workspaceState: Memento;
}

function activate(context: ExtensionContext): void;
function deactivate(): void;
```

**Key Operations**:

- Register commands (enable, disable, show reminder)
- Initialize ReminderScheduler
- Set up configuration change listeners
- Register status bar item

### ReminderScheduler

**Responsibility**: Manage timing and scheduling of reminders

```typescript
interface ReminderScheduler {
    start(): void;
    stop(): void;
    reset(): void;
    isEnabled(): boolean;
    setEnabled(enabled: boolean): void;
}

class ReminderSchedulerImpl implements ReminderScheduler {
    private timer: NodeJS.Timeout | null;
    private intervalMinutes: number;
    private enabled: boolean;

    constructor(config: ConfigurationManager);
    start(): void;
    stop(): void;
    reset(): void;
    isEnabled(): boolean;
    setEnabled(enabled: boolean): void;
    private scheduleNext(): void;
    private onTimerTrigger(): void;
}
```

**Key Operations**:

- `start()`: Begin scheduling reminders
- `stop()`: Cancel current timer
- `reset()`: Restart timer with current interval
- `scheduleNext()`: Set up next reminder based on interval
- `onTimerTrigger()`: Handle timer expiration, trigger notification

### NotificationDisplay

**Responsibility**: Show cat mascot and hydration message to user

```typescript
interface NotificationDisplay {
    show(): Promise<void>;
}

class NotificationDisplayImpl implements NotificationDisplay {
    async show(): Promise<void>;
    private getCatEmoji(): string;
    private getMessage(): string;
}
```

**Key Operations**:

- `show()`: Display notification using VS Code API
- `getCatEmoji()`: Return cat emoji or ASCII art
- `getMessage()`: Format "meow meow" + hydration message

**Implementation Approach**:

- Use `vscode.window.showInformationMessage()` for simple notifications
- Include cat emoji (🐱) or ASCII art
- Message format: "🐱 Meow meow! Time to drink water! 💧"
- Provide "Dismiss" and "Remind me later" buttons

### ConfigurationManager

**Responsibility**: Handle extension settings and state persistence

```typescript
interface ConfigurationManager {
    getReminderInterval(): number;
    setReminderInterval(minutes: number): void;
    isEnabled(): boolean;
    setEnabled(enabled: boolean): void;
    onConfigurationChanged(callback: () => void): void;
}

class ConfigurationManagerImpl implements ConfigurationManager {
    private readonly configSection = "catHydrationReminder";

    getReminderInterval(): number;
    setReminderInterval(minutes: number): void;
    isEnabled(): boolean;
    setEnabled(enabled: boolean): void;
    onConfigurationChanged(callback: () => void): void;
    private validateInterval(minutes: number): number;
}
```

**Configuration Schema** (package.json):

```json
{
    "contributes": {
        "configuration": {
            "title": "Cat Hydration Reminder",
            "properties": {
                "catHydrationReminder.intervalMinutes": {
                    "type": "number",
                    "default": 60,
                    "minimum": 15,
                    "maximum": 240,
                    "description": "Minutes between hydration reminders"
                },
                "catHydrationReminder.enabled": {
                    "type": "boolean",
                    "default": true,
                    "description": "Enable or disable hydration reminders"
                }
            }
        }
    }
}
```

### StatusBarManager

**Responsibility**: Display extension status in VS Code status bar

```typescript
interface StatusBarManager {
    update(enabled: boolean): void;
    dispose(): void;
}

class StatusBarManagerImpl implements StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;

    constructor();
    update(enabled: boolean): void;
    dispose(): void;
}
```

**Key Operations**:

- Show "🐱 Hydration: ON" or "🐱 Hydration: OFF"
- Click to toggle enabled/disabled state
- Update when configuration changes

## Data Models

### Extension State

```typescript
interface ExtensionState {
    enabled: boolean;
    lastReminderTime: number; // Unix timestamp
    intervalMinutes: number;
}
```

**Persistence**: Stored in VS Code's `globalState` to persist across sessions

### Configuration

```typescript
interface ExtensionConfiguration {
    intervalMinutes: number; // 15-240
    enabled: boolean;
}
```

**Validation Rules**:

- `intervalMinutes`: Must be between 15 and 240 (inclusive)
- `enabled`: Boolean value
- Invalid values default to safe defaults (60 minutes, true)

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Notification Content Completeness

_For any_ reminder notification displayed, the notification message should contain both a cat visual element (emoji or ASCII art) and a hydration message (containing "meow meow" and water-related text).

**Validates: Requirements 1.1, 1.2, 2.2, 2.3**

### Property 2: Timer Triggers at Correct Intervals

_For any_ configured reminder interval, when that interval elapses, the reminder system should trigger exactly one notification.

**Validates: Requirements 2.1**

### Property 3: Reminder Events Are Logged

_For any_ reminder notification shown, the system should create a corresponding log entry with timestamp and event details.

**Validates: Requirements 2.4**

### Property 4: Configuration Changes Update Scheduler

_For any_ valid interval value, when the user changes the reminder interval configuration, the scheduler should update to use the new interval for subsequent reminders.

**Validates: Requirements 3.2**

### Property 5: Interval Validation Enforces Bounds

_For any_ interval value outside the range [15, 240] minutes, the configuration manager should either reject the value or clamp it to the nearest valid boundary.

**Validates: Requirements 3.3**

### Property 6: Dismissal Reschedules Next Reminder

_For any_ active reminder notification, when dismissed, the scheduler should immediately schedule the next reminder based on the current configured interval.

**Validates: Requirements 4.3**

### Property 7: Activation Initializes Scheduler

_For any_ extension activation event, the activation function should create a reminder scheduler instance and start it with the configured interval.

**Validates: Requirements 5.2**

### Property 8: Deactivation Cleans Up Resources

_For any_ extension deactivation event, the deactivation function should stop all active timers and dispose of all registered resources.

**Validates: Requirements 5.4**

### Property 9: State Persistence Round Trip

_For any_ extension state (enabled status, last reminder time, interval), saving the state to global storage and then loading it should produce an equivalent state object.

**Validates: Requirements 5.3, 6.4**

### Property 10: Enabled State Controls Notifications

_For any_ scheduler state, when reminders are disabled, timer triggers should not display notifications; when re-enabled, the scheduler should start a fresh timer and resume showing notifications.

**Validates: Requirements 6.2, 6.3**

### Property 11: Status Bar Reflects Enabled State

_For any_ enabled/disabled state change, the status bar item should update its text to accurately reflect the current state (e.g., "ON" when enabled, "OFF" when disabled).

**Validates: Requirements 6.5**

## Error Handling

### Configuration Errors

**Invalid Interval Values**:

- Values < 15 minutes: Clamp to 15 minutes, log warning
- Values > 240 minutes: Clamp to 240 minutes, log warning
- Non-numeric values: Use default 60 minutes, log error
- Null/undefined: Use default 60 minutes

**State Persistence Errors**:

- Failed to read state: Use default values, log warning
- Failed to write state: Continue operation, log error
- Corrupted state data: Reset to defaults, log error

### Runtime Errors

**Timer Failures**:

- Timer creation fails: Log error, retry after 1 minute
- Timer callback throws: Log error, reschedule next reminder

**Notification Display Errors**:

- VS Code API unavailable: Log error, skip this reminder
- Notification fails to show: Log error, reschedule

**Command Execution Errors**:

- Command registration fails: Log error, extension continues with reduced functionality
- Command execution throws: Log error, show error message to user

### Error Recovery Strategy

1. **Graceful Degradation**: Extension continues operating even if non-critical features fail
2. **Automatic Retry**: Timer-related failures trigger automatic retry with exponential backoff
3. **User Notification**: Critical errors that affect functionality show user-facing error messages
4. **Logging**: All errors logged with context for debugging

## Testing Strategy

### Dual Testing Approach

This extension will use both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, command registration, and VS Code API integration
- **Property tests**: Verify universal properties across all valid configurations and state transitions

### Unit Testing Focus

Unit tests will cover:

- Specific examples of notification messages with expected format
- Edge cases like minimum/maximum interval values
- Command registration and execution
- Status bar initialization and updates
- Integration with VS Code APIs (mocked)
- Error handling for specific failure scenarios

### Property-Based Testing Configuration

**Library**: Use `fast-check` for TypeScript property-based testing

**Configuration**:

- Minimum 100 iterations per property test
- Each test tagged with: **Feature: vscode-extension-template, Property {number}: {property_text}**

**Property Test Coverage**:

- Property 1: Generate random notification content, verify cat + water message present
- Property 2: Generate random intervals, verify timer triggers correctly
- Property 3: Generate random reminder events, verify logging occurs
- Property 4: Generate random interval changes, verify scheduler updates
- Property 5: Generate random out-of-bounds intervals, verify clamping/rejection
- Property 6: Generate random dismissal events, verify rescheduling
- Property 7: Generate random activation scenarios, verify initialization
- Property 8: Generate random deactivation scenarios, verify cleanup
- Property 9: Generate random state objects, verify save/load round trip
- Property 10: Generate random enable/disable sequences, verify notification control
- Property 11: Generate random state changes, verify status bar updates

### Test Environment

- **Framework**: Jest or Mocha for VS Code extensions
- **Mocking**: Mock VS Code API using `@types/vscode` and test doubles
- **Coverage Target**: 80%+ code coverage
- **CI Integration**: Run tests on every commit

### Integration Testing

- Test extension activation in real VS Code environment
- Verify configuration changes persist across sessions
- Test notification display in actual VS Code UI
- Verify keyboard shortcuts work as expected

## Implementation Notes

### VS Code Extension Structure

**Required Files**:

- `package.json`: Extension manifest with activation events, commands, configuration
- `src/extension.ts`: Main entry point with activate/deactivate functions
- `tsconfig.json`: TypeScript configuration
- `.vscodeignore`: Files to exclude from extension package

**Dependencies**:

- `@types/vscode`: VS Code API type definitions
- `@types/node`: Node.js type definitions
- `typescript`: TypeScript compiler
- `fast-check`: Property-based testing library
- `jest` or `mocha`: Testing framework

### Activation Events

```json
{
    "activationEvents": ["*"]
}
```

Using `"*"` ensures the extension activates on VS Code startup.

### Commands

```json
{
    "contributes": {
        "commands": [
            {
                "command": "catHydrationReminder.toggle",
                "title": "Toggle Cat Hydration Reminders"
            },
            {
                "command": "catHydrationReminder.showNow",
                "title": "Show Hydration Reminder Now"
            }
        ]
    }
}
```

### Performance Considerations

- Use `setTimeout` for timer management (lightweight)
- Avoid heavy computations in timer callbacks
- Dispose of resources properly to prevent memory leaks
- Minimize extension activation time (< 100ms)

### Accessibility

- Use clear, readable text in notifications
- Ensure status bar item has appropriate ARIA labels
- Support keyboard navigation for all commands
- Provide text alternatives for cat emoji

### Future Enhancements

Potential features for future versions:

- Multiple cat variations (different breeds, expressions)
- Customizable messages
- Statistics tracking (reminders shown, dismissed)
- Integration with health tracking apps
- Sound effects (optional meow sound)
- Webview panel with animated cat
