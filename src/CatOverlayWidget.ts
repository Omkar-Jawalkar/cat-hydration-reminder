import * as vscode from "vscode";
import { Logger } from "./Logger";

/**
 * CatOverlayWidget creates an animated pixel cat using VS Code's decoration API
 * The cat appears as an inline widget in the active editor
 */
export class CatOverlayWidget {
    private logger: Logger;
    private context: vscode.ExtensionContext;
    private decorationType: vscode.TextEditorDecorationType | undefined;
    private animationInterval: NodeJS.Timeout | undefined;
    private currentFrame: number = 0;

    constructor(context: vscode.ExtensionContext, logger: Logger) {
        this.context = context;
        this.logger = logger;
    }

    /**
     * Show the animated cat widget
     */
    async show(): Promise<void> {
        try {
            this.logger.info("Showing animated cat widget");

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                // Fallback to notification if no active editor
                vscode.window.showInformationMessage(
                    "🐱 Meow meow! Drink water now! 💧",
                );
                return;
            }

            // Create a floating notification-style message
            this.showFloatingMessage();
        } catch (error) {
            this.logger.error("Failed to show cat widget", error);
            throw error;
        }
    }

    /**
     * Show a floating notification with better styling
     */
    private async showFloatingMessage(): Promise<void> {
        // Create a more prominent notification
        const message = "🐱 Meow meow! Time to drink water! 💧";

        // Show with multiple buttons for better UX
        const result = await vscode.window.showInformationMessage(
            message,
            { modal: false },
            "💧 Hydrated!",
            "⏰ Remind Later",
            "⚙️ Settings",
        );

        if (result === "⚙️ Settings") {
            vscode.commands.executeCommand(
                "workbench.action.openSettings",
                "catHydrationReminder",
            );
        }
    }

    /**
     * Dismiss the cat widget
     */
    dismiss(): void {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = undefined;
        }
        if (this.decorationType) {
            this.decorationType.dispose();
            this.decorationType = undefined;
        }
        this.logger.info("Cat widget dismissed");
    }
}
