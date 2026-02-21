import * as vscode from "vscode";
import { Logger } from "./Logger";

/**
 * ThemeFlasher temporarily changes VS Code's theme colors to yellow
 * to grab the user's attention for hydration reminders
 */
export class ThemeFlasher {
    private logger: Logger;
    private originalColors: any = {};
    private isFlashing: boolean = false;
    private flashTimeout: NodeJS.Timeout | undefined;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    /**
     * Start flashing the theme to yellow
     * Continues until user dismisses or timeout
     */
    async startFlash(): Promise<void> {
        if (this.isFlashing) {
            this.logger.warn("Theme flash already in progress");
            return;
        }

        try {
            this.isFlashing = true;
            this.logger.info("Starting theme flash to yellow");

            // Save original colors
            await this.saveOriginalColors();

            // Apply yellow theme
            await this.applyYellowTheme();

            // Set auto-restore timeout (30 seconds max)
            this.flashTimeout = setTimeout(() => {
                this.stopFlash();
            }, 30000);
        } catch (error) {
            this.logger.error("Failed to start theme flash", error);
            this.isFlashing = false;
        }
    }

    /**
     * Stop flashing and restore original theme
     */
    async stopFlash(): Promise<void> {
        if (!this.isFlashing) {
            return;
        }

        try {
            this.logger.info("Stopping theme flash, restoring original colors");

            // Clear timeout
            if (this.flashTimeout) {
                clearTimeout(this.flashTimeout);
                this.flashTimeout = undefined;
            }

            // Restore original colors
            await this.restoreOriginalColors();

            this.isFlashing = false;
        } catch (error) {
            this.logger.error("Failed to stop theme flash", error);
        }
    }

    /**
     * Check if currently flashing
     */
    isCurrentlyFlashing(): boolean {
        return this.isFlashing;
    }

    /**
     * Save the current workbench colors
     */
    private async saveOriginalColors(): Promise<void> {
        const config = vscode.workspace.getConfiguration();
        this.originalColors = config.get("workbench.colorCustomizations") || {};
        this.logger.info("Saved original theme colors");
    }

    /**
     * Apply yellow theme colors for attention-grabbing
     * Only changes title bar, status bar, and activity bar - keeps editor unchanged
     */
    private async applyYellowTheme(): Promise<void> {
        const config = vscode.workspace.getConfiguration();
        const existingColors =
            config.get("workbench.colorCustomizations") || {};

        // Only flash the top bars - keep everything else unchanged
        const yellowTheme = {
            ...existingColors,

            // Title bar - bright yellow for attention
            "titleBar.activeBackground": "#FFCC00",
            "titleBar.activeForeground": "#000000",
            "titleBar.inactiveBackground": "#FFD54F",
            "titleBar.inactiveForeground": "#333333",
            "titleBar.border": "#FFB300",

            // Status bar - vibrant yellow
            "statusBar.background": "#FFCC00",
            "statusBar.foreground": "#000000",
            "statusBar.border": "#FFB300",
            "statusBar.noFolderBackground": "#FFCC00",
            "statusBar.debuggingBackground": "#FF9800",
            "statusBar.debuggingForeground": "#000000",

            // Activity bar - golden yellow
            "activityBar.background": "#FFD54F",
            "activityBar.foreground": "#000000",
            "activityBar.inactiveForeground": "#666666",
            "activityBar.border": "#FFC107",
            "activityBarBadge.background": "#FF6F00",
            "activityBarBadge.foreground": "#FFFFFF",
        };

        await config.update(
            "workbench.colorCustomizations",
            yellowTheme,
            vscode.ConfigurationTarget.Global,
        );

        this.logger.info(
            "Applied yellow flash to title bar, status bar, and activity bar",
        );
    }

    /**
     * Restore the original theme colors
     */
    private async restoreOriginalColors(): Promise<void> {
        const config = vscode.workspace.getConfiguration();

        await config.update(
            "workbench.colorCustomizations",
            this.originalColors,
            vscode.ConfigurationTarget.Global,
        );

        this.logger.info("Restored original theme colors");
    }
}
