import * as vscode from "vscode";

/**
 * StatusBarManager displays the extension's enabled/disabled status in the VS Code status bar.
 * Provides a visual indicator and click handler to toggle the reminder system.
 *
 * Requirements: 6.5
 */
export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;
    private onToggleCallback?: () => void;

    /**
     * Create a new StatusBarManager instance.
     * Initializes the status bar item and makes it visible.
     */
    constructor() {
        // Create status bar item aligned to the right with priority 100
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100,
        );

        // Set up click command - will be registered by the extension
        this.statusBarItem.command = "catHydrationReminder.toggle";

        // Make the status bar item visible
        this.statusBarItem.show();
    }

    /**
     * Update the status bar text based on the enabled state.
     * Shows "🐱 Hydration: ON" when enabled, "🐱 Hydration: OFF" when disabled.
     *
     * @param enabled - true if reminders are enabled, false otherwise
     */
    update(enabled: boolean): void {
        try {
            if (enabled) {
                this.statusBarItem.text = "🐱 Hydration: ON";
                this.statusBarItem.tooltip =
                    "Cat Hydration Reminders are enabled. Click to disable.";
            } else {
                this.statusBarItem.text = "🐱 Hydration: OFF";
                this.statusBarItem.tooltip =
                    "Cat Hydration Reminders are disabled. Click to enable.";
            }
        } catch (error) {
            console.error(
                `Failed to update status bar: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    /**
     * Clean up the status bar item.
     * Should be called when the extension is deactivated.
     */
    dispose(): void {
        try {
            this.statusBarItem.dispose();
        } catch (error) {
            console.error(
                `Failed to dispose status bar: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}
