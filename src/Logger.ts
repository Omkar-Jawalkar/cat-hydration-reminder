import * as vscode from "vscode";

/**
 * Logger utility for the Cat Hydration Reminder extension.
 * Provides structured logging with different severity levels (info, warn, error).
 * All logs are written to a VS Code output channel with timestamps.
 *
 * Requirements: 2.4
 */
export class Logger {
    private outputChannel: vscode.OutputChannel;

    /**
     * Create a new Logger instance.
     *
     * @param channelName - The name of the output channel to create
     */
    constructor(channelName: string = "Cat Hydration Reminder") {
        this.outputChannel = vscode.window.createOutputChannel(channelName);
    }

    /**
     * Get the underlying output channel for disposal or direct access.
     *
     * @returns The VS Code output channel
     */
    getOutputChannel(): vscode.OutputChannel {
        return this.outputChannel;
    }

    /**
     * Log an informational message.
     * Use for general events like reminder triggers, state changes, etc.
     *
     * @param message - The message to log
     */
    info(message: string): void {
        this.log("INFO", message);
    }

    /**
     * Log a warning message.
     * Use for recoverable issues or unexpected but non-critical situations.
     *
     * @param message - The warning message to log
     */
    warn(message: string): void {
        this.log("WARN", message);
    }

    /**
     * Log an error message.
     * Use for errors, exceptions, and critical issues.
     *
     * @param message - The error message to log
     * @param error - Optional error object to include details from
     */
    error(message: string, error?: Error | unknown): void {
        let fullMessage = message;
        if (error) {
            const errorDetails =
                error instanceof Error ? error.message : String(error);
            fullMessage = `${message}: ${errorDetails}`;
            if (error instanceof Error && error.stack) {
                fullMessage += `\n${error.stack}`;
            }
        }
        this.log("ERROR", fullMessage);
    }

    /**
     * Internal method to format and write log messages.
     *
     * @param level - The log level (INFO, WARN, ERROR)
     * @param message - The message to log
     */
    private log(level: string, message: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] [${level}] ${message}`);
    }
}
