import * as vscode from "vscode";
import { ConfigurationManager } from "./ConfigurationManager";
import { NotificationDisplay } from "./NotificationDisplay";
import { Logger } from "./Logger";

/**
 * ReminderScheduler manages the timing and scheduling of hydration reminders.
 * It uses setTimeout to schedule reminders at configurable intervals and
 * handles enabling/disabling the reminder system.
 *
 * Requirements: 2.1, 2.4, 4.3, 6.2, 6.3
 */
export class ReminderScheduler {
    private timer: NodeJS.Timeout | null = null;
    private configManager: ConfigurationManager;
    private notificationDisplay: NotificationDisplay;
    private logger: Logger;

    /**
     * Create a new ReminderScheduler instance.
     *
     * @param configManager - The configuration manager for reading settings
     * @param notificationDisplay - The notification display for showing reminders
     * @param logger - Logger for logging reminder events
     */
    constructor(
        configManager: ConfigurationManager,
        notificationDisplay: NotificationDisplay,
        logger: Logger,
    ) {
        this.configManager = configManager;
        this.notificationDisplay = notificationDisplay;
        this.logger = logger;
    }

    /**
     * Start the reminder scheduler.
     * Begins scheduling reminders based on the configured interval.
     * Does nothing if reminders are disabled.
     */
    start(): void {
        if (!this.isEnabled()) {
            this.logger.info(
                "Scheduler start requested but reminders are disabled",
            );
            return;
        }

        this.logger.info("Starting reminder scheduler");
        this.scheduleNext();
    }

    /**
     * Stop the reminder scheduler.
     * Cancels any active timer and prevents future reminders until start() is called again.
     */
    stop(): void {
        this.logger.info("Stopping reminder scheduler");
        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
            this.logger.info("Active timer cleared");
        }
    }

    /**
     * Reset the reminder scheduler.
     * Stops the current timer and starts a new one with the current interval.
     * Useful when configuration changes or after manual reminder triggers.
     */
    reset(): void {
        this.logger.info("Resetting reminder scheduler");
        this.stop();
        this.start();
    }

    /**
     * Check if reminders are currently enabled.
     *
     * @returns true if reminders are enabled, false otherwise
     */
    isEnabled(): boolean {
        return this.configManager.isEnabled();
    }

    /**
     * Enable or disable reminders.
     * When enabling, starts the scheduler. When disabling, stops the scheduler.
     *
     * @param enabled - true to enable reminders, false to disable
     */
    async setEnabled(enabled: boolean): Promise<void> {
        this.logger.info(`Setting enabled state to: ${enabled}`);
        await this.configManager.setEnabled(enabled);

        if (enabled) {
            this.start();
        } else {
            this.stop();
        }
    }

    /**
     * Schedule the next reminder based on the configured interval.
     * Creates a new timer that will trigger after the interval elapses.
     */
    private scheduleNext(): void {
        try {
            // Clear any existing timer first
            if (this.timer !== null) {
                clearTimeout(this.timer);
            }

            const intervalMinutes = this.configManager.getReminderInterval();
            const intervalMs = intervalMinutes * 60 * 1000;

            this.logger.info(
                `Scheduling next reminder in ${intervalMinutes} minutes (${intervalMs}ms)`,
            );

            this.timer = setTimeout(() => {
                this.onTimerTrigger().catch((error) => {
                    this.logger.error("Error in timer callback", error);
                    // Attempt to reschedule after error
                    if (this.isEnabled()) {
                        this.logger.warn(
                            "Attempting to reschedule after timer error",
                        );
                        setTimeout(() => {
                            try {
                                this.scheduleNext();
                            } catch (retryError) {
                                this.logger.error(
                                    "Failed to reschedule after error",
                                    retryError,
                                );
                            }
                        }, 60000); // Retry after 1 minute
                    }
                });
            }, intervalMs);
        } catch (error) {
            this.logger.error("Error scheduling next reminder", error);
            // Attempt to retry scheduling after a delay
            if (this.isEnabled()) {
                this.logger.warn("Retrying schedule after 1 minute");
                setTimeout(() => {
                    try {
                        this.scheduleNext();
                    } catch (retryError) {
                        this.logger.error(
                            "Failed to retry scheduling",
                            retryError,
                        );
                    }
                }, 60000);
            }
        }
    }

    /**
     * Handle timer expiration.
     * Displays the notification and schedules the next reminder if still enabled.
     */
    private async onTimerTrigger(): Promise<void> {
        this.timer = null;

        // Check if still enabled (user might have disabled while timer was running)
        if (!this.isEnabled()) {
            this.logger.info(
                "Timer triggered but reminders are now disabled, not showing notification",
            );
            return;
        }

        try {
            this.logger.info("Timer triggered - showing hydration reminder");
            await this.notificationDisplay.show();
            this.logger.info("Hydration reminder displayed successfully");
        } catch (error) {
            this.logger.error("Error displaying notification", error);
        }

        // Schedule next reminder if still enabled
        if (this.isEnabled()) {
            this.scheduleNext();
        }
    }
}
