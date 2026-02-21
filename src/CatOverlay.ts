import * as vscode from "vscode";
import { Logger } from "./Logger";
import { ThemeFlasher } from "./ThemeFlasher";

/**
 * CatOverlay creates an animated pixel cat notification
 * with theme flashing to grab user's attention
 */
export class CatOverlay {
    private logger: Logger;
    private context: vscode.ExtensionContext;
    private statusBarItem: vscode.StatusBarItem | undefined;
    private themeFlasher: ThemeFlasher;

    constructor(context: vscode.ExtensionContext, logger: Logger) {
        this.context = context;
        this.logger = logger;
        this.themeFlasher = new ThemeFlasher(logger);
    }

    /**
     * Show the animated cat notification with theme flashing
     */
    async show(): Promise<void> {
        try {
            this.logger.info(
                "Showing enhanced cat notification with theme flash",
            );

            // Check if theme flashing is enabled
            const flashEnabled = vscode.workspace
                .getConfiguration("catHydrationReminder")
                .get<boolean>("flashTheme", true);

            // Start theme flash to yellow (if enabled)
            if (flashEnabled) {
                await this.themeFlasher.startFlash();
            }

            // Create a temporary status bar animation
            await this.showAnimatedStatusBar();

            // Show the main notification
            await this.showEnhancedNotification();
        } catch (error) {
            this.logger.error("Failed to show cat notification", error);
            // Make sure to stop flash even if there's an error
            await this.themeFlasher.stopFlash();
            throw error;
        }
    }

    /**
     * Show animated status bar notification
     */
    private async showAnimatedStatusBar(): Promise<void> {
        if (!this.statusBarItem) {
            this.statusBarItem = vscode.window.createStatusBarItem(
                vscode.StatusBarAlignment.Right,
                1000,
            );
        }

        const frames = [
            "🐱 Meow!",
            "🐱💧 Meow!",
            "🐱💧💧 Meow!",
            "🐱💧 Drink Water!",
            "🐱💧💧 Drink Water!",
            "🐱💧 Drink Water Now!",
        ];

        let frameIndex = 0;
        const animate = () => {
            if (frameIndex < frames.length) {
                this.statusBarItem!.text = frames[frameIndex];
                this.statusBarItem!.show();
                frameIndex++;
                setTimeout(animate, 300);
            } else {
                setTimeout(() => {
                    if (this.statusBarItem) {
                        this.statusBarItem.hide();
                    }
                }, 2000);
            }
        };

        animate();
    }

    /**
     * Show enhanced notification with better styling
     */
    private async showEnhancedNotification(): Promise<void> {
        const message = "🐱 Meow meow! Time to drink water! 💧";

        const result = await vscode.window.showInformationMessage(
            message,
            { modal: false },
            "💧 Done!",
            "⏰ Remind me in 15 min",
            "⚙️ Settings",
        );

        // Stop theme flash when user responds
        await this.themeFlasher.stopFlash();

        if (result === "⚙️ Settings") {
            vscode.commands.executeCommand(
                "workbench.action.openSettings",
                "catHydrationReminder",
            );
        } else if (result === "⏰ Remind me in 15 min") {
            // User wants to be reminded sooner
            vscode.window.showInformationMessage(
                "⏰ I'll remind you in 15 minutes!",
            );
        } else if (result === "💧 Done!") {
            // User confirmed they drank water
            vscode.window.showInformationMessage(
                "🎉 Great job staying hydrated!",
            );
        }
    }

    /**
     * Dismiss the cat notification and restore theme
     */
    async dismiss(): Promise<void> {
        // Stop theme flash
        await this.themeFlasher.stopFlash();

        if (this.statusBarItem) {
            this.statusBarItem.dispose();
            this.statusBarItem = undefined;
        }
        this.logger.info("Cat notification dismissed");
    }
}
