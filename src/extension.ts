import * as vscode from "vscode";
import { ConfigurationManager } from "./ConfigurationManager";
import { loadState, saveState, ExtensionState } from "./StateManager";
import { ReminderScheduler } from "./ReminderScheduler";
import { NotificationDisplay } from "./NotificationDisplay";
import { StatusBarManager } from "./StatusBarManager";
import { Logger } from "./Logger";

// Module-level variables to store extension components for cleanup in deactivate()
let extensionContext: vscode.ExtensionContext | undefined;
let scheduler: ReminderScheduler | undefined;
let configManager: ConfigurationManager | undefined;
let logger: Logger | undefined;

/**
 * This method is called when the extension is activated.
 * The extension is activated the very first time a command is executed or on startup (activationEvents: "*").
 */
export function activate(context: vscode.ExtensionContext) {
    console.log("Cat Hydration Reminder extension is now active");

    try {
        // Store context for deactivate()
        extensionContext = context;

        // Load persisted state
        const state = loadState(context);
        console.log("Loaded extension state:", state);

        // Create logger
        logger = new Logger("Cat Hydration Reminder");
        context.subscriptions.push(logger.getOutputChannel());
        logger.info("Extension activation started");

        // Initialize ConfigurationManager
        configManager = new ConfigurationManager();

        // Initialize NotificationDisplay with animated overlay support
        const notificationDisplay = new NotificationDisplay(context, logger);

        // Set overlay preference from configuration
        const useOverlay = vscode.workspace
            .getConfiguration("catHydrationReminder")
            .get<boolean>("useAnimatedOverlay", true);
        notificationDisplay.setUseOverlay(useOverlay);

        // Initialize ReminderScheduler
        scheduler = new ReminderScheduler(
            configManager,
            notificationDisplay,
            logger,
        );

        // Initialize StatusBarManager
        const statusBarManager = new StatusBarManager();
        context.subscriptions.push(statusBarManager);

        // Update status bar with current enabled state
        statusBarManager.update(configManager!.isEnabled());

        // Start scheduler if enabled
        if (configManager!.isEnabled()) {
            scheduler!.start();
            logger!.info("Scheduler started (reminders enabled)");
        } else {
            logger!.info("Scheduler not started (reminders disabled)");
        }

        // Register "catHydrationReminder.toggle" command
        const toggleCommand = vscode.commands.registerCommand(
            "catHydrationReminder.toggle",
            async () => {
                try {
                    const currentState = configManager!.isEnabled();
                    const newState = !currentState;

                    logger!.info(
                        `Toggle command: ${currentState} -> ${newState}`,
                    );

                    // Update enabled state
                    await scheduler!.setEnabled(newState);

                    // Update status bar
                    statusBarManager.update(newState);

                    // Save state
                    const updatedState: ExtensionState = {
                        enabled: newState,
                        lastReminderTime: state.lastReminderTime,
                        intervalMinutes: configManager!.getReminderInterval(),
                    };
                    await saveState(context, updatedState);

                    // Show confirmation message
                    const statusText = newState ? "enabled" : "disabled";
                    vscode.window.showInformationMessage(
                        `Cat Hydration Reminders ${statusText}`,
                    );
                } catch (error) {
                    const errorMessage = `Failed to toggle reminders`;
                    logger!.error(errorMessage, error);
                    vscode.window.showErrorMessage(
                        `${errorMessage}: ${error instanceof Error ? error.message : String(error)}`,
                    );
                }
            },
        );
        context.subscriptions.push(toggleCommand);

        // Register "catHydrationReminder.showNow" command
        const showNowCommand = vscode.commands.registerCommand(
            "catHydrationReminder.showNow",
            async () => {
                try {
                    logger!.info("Show now command triggered");

                    // Show notification immediately
                    await notificationDisplay.show();

                    // Reset scheduler timer
                    if (configManager!.isEnabled()) {
                        scheduler!.reset();
                        logger!.info("Scheduler reset after manual trigger");
                    }
                } catch (error) {
                    const errorMessage = `Failed to show reminder`;
                    logger!.error(errorMessage, error);
                    vscode.window.showErrorMessage(
                        `${errorMessage}: ${error instanceof Error ? error.message : String(error)}`,
                    );
                }
            },
        );
        context.subscriptions.push(showNowCommand);

        // Set up configuration change listeners
        const configListener = configManager!.onConfigurationChanged(() => {
            try {
                const interval = configManager!.getReminderInterval();
                const enabled = configManager!.isEnabled();
                const useOverlay = vscode.workspace
                    .getConfiguration("catHydrationReminder")
                    .get<boolean>("useAnimatedOverlay", true);

                logger!.info(
                    `Configuration changed: interval=${interval}min, enabled=${enabled}, overlay=${useOverlay}`,
                );

                // Update notification display mode
                notificationDisplay.setUseOverlay(useOverlay);

                // Update status bar
                statusBarManager.update(enabled);

                // Reset scheduler to apply new interval
                if (enabled) {
                    scheduler!.reset();
                    logger!.info("Scheduler reset with new configuration");
                } else {
                    scheduler!.stop();
                    logger!.info("Scheduler stopped (disabled)");
                }

                // Save updated state
                const updatedState: ExtensionState = {
                    enabled: enabled,
                    lastReminderTime: state.lastReminderTime,
                    intervalMinutes: interval,
                };
                saveState(context, updatedState).catch((error) => {
                    logger!.error(
                        "Failed to save state after configuration change",
                        error,
                    );
                });
            } catch (error) {
                logger!.error("Failed to handle configuration change", error);
            }
        });
        context.subscriptions.push(configListener);

        logger!.info("Extension activation complete");
    } catch (error) {
        const errorMessage = `Critical error during extension activation`;
        console.error(errorMessage, error);
        if (logger) {
            logger.error(errorMessage, error);
        }
        vscode.window.showErrorMessage(
            `Cat Hydration Reminder failed to activate: ${error instanceof Error ? error.message : String(error)}`,
        );
        // Don't throw - allow VS Code to continue
    }
}

/**
 * This method is called when the extension is deactivated.
 * Cleans up resources and saves state before shutdown.
 *
 * Requirements: 5.4
 */
export async function deactivate() {
    console.log("Cat Hydration Reminder extension is now deactivating");

    try {
        // Stop scheduler to clear any active timers
        if (scheduler) {
            scheduler.stop();
            console.log("Scheduler stopped");
        }

        // Save current state
        if (extensionContext && configManager) {
            const currentState: ExtensionState = {
                enabled: configManager.isEnabled(),
                lastReminderTime: Date.now(),
                intervalMinutes: configManager.getReminderInterval(),
            };
            await saveState(extensionContext, currentState);
            console.log("Current state saved");
        }

        // Log completion
        if (logger) {
            logger.info("Extension deactivated, resources cleaned up");
        }

        console.log("Cat Hydration Reminder extension deactivation complete");
    } catch (error) {
        console.error("Error during deactivation:", error);
        if (logger) {
            logger.error("Error during deactivation", error);
        }
        // Don't throw - allow deactivation to complete
    }
}
