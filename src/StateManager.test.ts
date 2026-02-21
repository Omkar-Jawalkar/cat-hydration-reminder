import * as assert from "assert";
import { ExtensionState, saveState, loadState } from "./StateManager";

/**
 * Mock implementation of VS Code's Memento interface for testing.
 */
class MockMemento {
    private storage = new Map<string, any>();

    get<T>(key: string): T | undefined;
    get<T>(key: string, defaultValue: T): T;
    get<T>(key: string, defaultValue?: T): T | undefined {
        const value = this.storage.get(key);
        return value !== undefined ? value : defaultValue;
    }

    async update(key: string, value: any): Promise<void> {
        this.storage.set(key, value);
    }

    keys(): readonly string[] {
        return Array.from(this.storage.keys());
    }

    setKeysForSync(keys: readonly string[]): void {
        // Not needed for tests
    }
}

/**
 * Creates a mock ExtensionContext for testing.
 */
function createMockContext(): any {
    return {
        globalState: new MockMemento(),
        subscriptions: [],
    };
}

suite("StateManager Tests", () => {
    test("loadState returns default state when no saved state exists", () => {
        const context = createMockContext();
        const state = loadState(context);

        assert.strictEqual(state.enabled, true);
        assert.strictEqual(state.lastReminderTime, 0);
        assert.strictEqual(state.intervalMinutes, 60);
    });

    test("saveState and loadState round trip preserves state", async () => {
        const context = createMockContext();
        const originalState: ExtensionState = {
            enabled: false,
            lastReminderTime: 1234567890,
            intervalMinutes: 120,
        };

        await saveState(context, originalState);
        const loadedState = loadState(context);

        assert.strictEqual(loadedState.enabled, originalState.enabled);
        assert.strictEqual(
            loadedState.lastReminderTime,
            originalState.lastReminderTime,
        );
        assert.strictEqual(
            loadedState.intervalMinutes,
            originalState.intervalMinutes,
        );
    });

    test("loadState returns default state for corrupted data (missing fields)", () => {
        const context = createMockContext();
        // Manually corrupt the state
        context.globalState.update("catHydrationReminder.state", {
            enabled: true,
            // Missing lastReminderTime and intervalMinutes
        });

        const state = loadState(context);

        // Should return defaults due to validation failure
        assert.strictEqual(state.enabled, true);
        assert.strictEqual(state.lastReminderTime, 0);
        assert.strictEqual(state.intervalMinutes, 60);
    });

    test("loadState returns default state for corrupted data (wrong types)", () => {
        const context = createMockContext();
        // Manually corrupt the state with wrong types
        context.globalState.update("catHydrationReminder.state", {
            enabled: "yes", // Should be boolean
            lastReminderTime: "invalid", // Should be number
            intervalMinutes: 60,
        });

        const state = loadState(context);

        // Should return defaults due to validation failure
        assert.strictEqual(state.enabled, true);
        assert.strictEqual(state.lastReminderTime, 0);
        assert.strictEqual(state.intervalMinutes, 60);
    });

    test("loadState returns default state for out-of-bounds interval", () => {
        const context = createMockContext();
        // Save state with invalid interval
        context.globalState.update("catHydrationReminder.state", {
            enabled: true,
            lastReminderTime: 0,
            intervalMinutes: 500, // Out of bounds (max is 240)
        });

        const state = loadState(context);

        // Should return defaults due to validation failure
        assert.strictEqual(state.enabled, true);
        assert.strictEqual(state.lastReminderTime, 0);
        assert.strictEqual(state.intervalMinutes, 60);
    });

    test("loadState handles null state gracefully", () => {
        const context = createMockContext();
        context.globalState.update("catHydrationReminder.state", null);

        const state = loadState(context);

        assert.strictEqual(state.enabled, true);
        assert.strictEqual(state.lastReminderTime, 0);
        assert.strictEqual(state.intervalMinutes, 60);
    });

    test("saveState handles minimum valid interval", async () => {
        const context = createMockContext();
        const state: ExtensionState = {
            enabled: true,
            lastReminderTime: 0,
            intervalMinutes: 15, // Minimum valid value
        };

        await saveState(context, state);
        const loadedState = loadState(context);

        assert.strictEqual(loadedState.intervalMinutes, 15);
    });

    test("saveState handles maximum valid interval", async () => {
        const context = createMockContext();
        const state: ExtensionState = {
            enabled: true,
            lastReminderTime: 0,
            intervalMinutes: 240, // Maximum valid value
        };

        await saveState(context, state);
        const loadedState = loadState(context);

        assert.strictEqual(loadedState.intervalMinutes, 240);
    });
});
