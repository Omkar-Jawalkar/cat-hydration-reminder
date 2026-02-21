import * as vscode from "vscode";
import { CatOverlay } from "./CatOverlay";
import { Logger } from "./Logger";

/**
 * NotificationDisplay handles showing the cat mascot and hydration message
 * to the user using either an animated overlay or VS Code's notification API.
 *
 * Requirements: 1.1, 1.2, 2.2, 2.3, 4.1, 7.1
 */
export class NotificationDisplay {
    private catOverlay: CatOverlay | undefined;
    private useOverlay: boolean = true;

    constructor(context?: vscode.ExtensionContext, logger?: Logger) {
        if (context && logger) {
            this.catOverlay = new CatOverlay(context, logger);
        }
    }

    /**
     * Display the cat hydration reminder notification to the user.
     * Shows either an animated pixel cat overlay or a standard notification.
     * Provides "Dismiss" and "Remind me later" buttons for user interaction.
     *
     * @returns Promise that resolves when the notification is shown
     * @throws Error if notification display fails
     */
    async show(): Promise<void> {
        try {
            // Try to show animated overlay first
            if (this.useOverlay && this.catOverlay) {
                try {
                    await this.catOverlay.show();
                    console.log("Animated cat overlay displayed");
                    return;
                } catch (overlayError) {
                    console.warn(
                        "Failed to show overlay, falling back to notification:",
                        overlayError,
                    );
                    // Fall back to standard notification
                }
            }

            // Fallback: Standard notification
            const message = this.getMessage();
            const dismissButton = "Dismiss";
            const remindLaterButton = "Remind me later";

            const selection = await vscode.window.showInformationMessage(
                message,
                dismissButton,
                remindLaterButton,
            );

            // Log user's choice
            if (selection === dismissButton) {
                console.log("User dismissed the hydration reminder");
            } else if (selection === remindLaterButton) {
                console.log("User chose to be reminded later");
            } else {
                console.log("User closed the notification without selecting");
            }
        } catch (error) {
            const errorMessage = `Failed to display notification: ${error instanceof Error ? error.message : String(error)}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    /**
     * Set whether to use the animated overlay (true) or standard notification (false)
     */
    setUseOverlay(useOverlay: boolean): void {
        this.useOverlay = useOverlay;
    }

    /**
     * Get the cat emoji visual element.
     *
     * @returns The cat emoji (🐱)
     */
    private getCatEmoji(): string {
        return "🐱";
    }

    /**
     * Format the complete notification message with cat emoji,
     * "meow meow" text, and hydration reminder.
     *
     * @returns The formatted message string
     */
    private getMessage(): string {
        const catEmoji = this.getCatEmoji();
        return `${catEmoji} Meow meow! Time to drink water! 💧`;
    }
}
