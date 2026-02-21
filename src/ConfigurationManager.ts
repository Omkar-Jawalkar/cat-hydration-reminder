import * as vscode from "vscode";

/**
 * ConfigurationManager handles reading and writing extension settings,
 * validating configuration values, and listening for configuration changes.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 6.1
 */
export class ConfigurationManager {
    private readonly configSection = "catHydrationReminder";
    private readonly minInterval = 15;
    private readonly maxInterval = 240;
    private readonly defaultInterval = 60;

    /**
     * Get the configured reminder interval in minutes.
     * Returns a value between 15 and 240 minutes.
     *
     * @returns The reminder interval in minutes (validated and clamped)
     */
    getReminderInterval(): number {
        try {
            const config = vscode.workspace.getConfiguration(
                this.configSection,
            );
            const interval = config.get<number>(
                "intervalMinutes",
                this.defaultInterval,
            );
            return this.validateInterval(interval);
        } catch (error) {
            console.error(
                `Error reading reminder interval configuration: ${error instanceof Error ? error.message : String(error)}`,
            );
            console.warn(`Using default interval: ${this.defaultInterval}`);
            return this.defaultInterval;
        }
    }

    /**
     * Set the reminder interval in minutes.
     * The value will be validated and clamped to the range [15, 240].
     *
     * @param minutes - The desired interval in minutes
     */
    async setReminderInterval(minutes: number): Promise<void> {
        try {
            const validatedInterval = this.validateInterval(minutes);
            const config = vscode.workspace.getConfiguration(
                this.configSection,
            );
            await config.update(
                "intervalMinutes",
                validatedInterval,
                vscode.ConfigurationTarget.Global,
            );
        } catch (error) {
            const errorMessage = `Failed to set reminder interval: ${error instanceof Error ? error.message : String(error)}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    /**
     * Check if reminders are currently enabled.
     *
     * @returns true if reminders are enabled, false otherwise
     */
    isEnabled(): boolean {
        try {
            const config = vscode.workspace.getConfiguration(
                this.configSection,
            );
            return config.get<boolean>("enabled", true);
        } catch (error) {
            console.error(
                `Error reading enabled configuration: ${error instanceof Error ? error.message : String(error)}`,
            );
            console.warn("Using default enabled state: true");
            return true;
        }
    }

    /**
     * Enable or disable reminders.
     *
     * @param enabled - true to enable reminders, false to disable
     */
    async setEnabled(enabled: boolean): Promise<void> {
        try {
            const config = vscode.workspace.getConfiguration(
                this.configSection,
            );
            await config.update(
                "enabled",
                enabled,
                vscode.ConfigurationTarget.Global,
            );
        } catch (error) {
            const errorMessage = `Failed to set enabled state: ${error instanceof Error ? error.message : String(error)}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    /**
     * Register a callback to be invoked when configuration changes.
     *
     * @param callback - Function to call when configuration changes
     * @returns Disposable to unregister the listener
     */
    onConfigurationChanged(callback: () => void): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration((event) => {
            if (
                event.affectsConfiguration(
                    `${this.configSection}.intervalMinutes`,
                ) ||
                event.affectsConfiguration(`${this.configSection}.enabled`)
            ) {
                callback();
            }
        });
    }

    /**
     * Validate and clamp interval values to the allowed range [15, 240].
     *
     * @param minutes - The interval value to validate
     * @returns The validated interval, clamped to [15, 240]
     */
    private validateInterval(minutes: number): number {
        // Handle invalid values (null, undefined, NaN, non-numeric)
        if (typeof minutes !== "number" || isNaN(minutes)) {
            console.warn(
                `Invalid interval value: ${minutes}. Using default: ${this.defaultInterval}`,
            );
            return this.defaultInterval;
        }

        // Clamp to minimum
        if (minutes < this.minInterval) {
            console.warn(
                `Interval ${minutes} is below minimum. Clamping to ${this.minInterval}`,
            );
            return this.minInterval;
        }

        // Clamp to maximum
        if (minutes > this.maxInterval) {
            console.warn(
                `Interval ${minutes} is above maximum. Clamping to ${this.maxInterval}`,
            );
            return this.maxInterval;
        }

        return minutes;
    }
}
