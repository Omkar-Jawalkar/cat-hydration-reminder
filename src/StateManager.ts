import * as vscode from "vscode";

/**
 * Interface representing the persisted state of the extension.
 * This state is saved across VS Code sessions using globalState.
 */
export interface ExtensionState {
    /** Whether reminders are currently enabled */
    enabled: boolean;
    /** Unix timestamp (milliseconds) of the last reminder shown */
    lastReminderTime: number;
    /** Configured interval in minutes between reminders */
    intervalMinutes: number;
}

/**
 * Default state values used when no saved state exists or state is corrupted.
 */
const DEFAULT_STATE: ExtensionState = {
    enabled: true,
    lastReminderTime: 0,
    intervalMinutes: 60,
};

/**
 * Key used to store state in VS Code's globalState.
 */
const STATE_KEY = "catHydrationReminder.state";

/**
 * Saves the extension state to VS Code's global state storage.
 *
 * @param context - The VS Code extension context
 * @param state - The state object to save
 * @returns Promise that resolves when state is saved
 * @throws Error if state cannot be saved (logged but not thrown)
 */
export async function saveState(
    context: vscode.ExtensionContext,
    state: ExtensionState,
): Promise<void> {
    try {
        await context.globalState.update(STATE_KEY, state);
        console.log("State saved successfully:", state);
    } catch (error) {
        console.error("Failed to save extension state:", error);
        // Don't throw - allow extension to continue operating
    }
}

/**
 * Loads the extension state from VS Code's global state storage.
 *
 * @param context - The VS Code extension context
 * @returns The loaded state, or default state if none exists or loading fails
 */
export function loadState(context: vscode.ExtensionContext): ExtensionState {
    try {
        const savedState = context.globalState.get<ExtensionState>(STATE_KEY);

        if (!savedState) {
            console.log("No saved state found, using defaults");
            return { ...DEFAULT_STATE };
        }

        // Validate the loaded state structure
        if (!isValidState(savedState)) {
            console.warn("Corrupted state detected, using defaults");
            return { ...DEFAULT_STATE };
        }

        console.log("State loaded successfully:", savedState);
        return savedState;
    } catch (error) {
        console.error("Failed to load extension state:", error);
        return { ...DEFAULT_STATE };
    }
}

/**
 * Validates that a loaded state object has the correct structure.
 * Handles corrupted state data by checking types and required fields.
 *
 * @param state - The state object to validate
 * @returns true if state is valid, false otherwise
 */
function isValidState(state: any): state is ExtensionState {
    return (
        state !== null &&
        typeof state === "object" &&
        typeof state.enabled === "boolean" &&
        typeof state.lastReminderTime === "number" &&
        typeof state.intervalMinutes === "number" &&
        state.intervalMinutes >= 15 &&
        state.intervalMinutes <= 240
    );
}
