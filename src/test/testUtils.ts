/**
 * Test utilities for property-based testing
 * Provides generators for random extension states and VS Code API mocks
 */

import * as fc from "fast-check";

/**
 * Extension state interface for testing
 */
export interface ExtensionState {
    enabled: boolean;
    lastReminderTime: number;
    intervalMinutes: number;
}

/**
 * Arbitrary generator for valid reminder intervals (15-240 minutes)
 */
export const validIntervalArbitrary = (): fc.Arbitrary<number> => {
    return fc.integer({ min: 15, max: 240 });
};

/**
 * Arbitrary generator for out-of-bounds intervals (for testing validation)
 */
export const outOfBoundsIntervalArbitrary = (): fc.Arbitrary<number> => {
    return fc.oneof(
        fc.integer({ min: -1000, max: 14 }), // Below minimum
        fc.integer({ min: 241, max: 10000 }), // Above maximum
    );
};

/**
 * Arbitrary generator for any interval (valid or invalid)
 */
export const anyIntervalArbitrary = (): fc.Arbitrary<number> => {
    return fc.integer({ min: -1000, max: 10000 });
};

/**
 * Arbitrary generator for extension states
 */
export const extensionStateArbitrary = (): fc.Arbitrary<ExtensionState> => {
    return fc.record({
        enabled: fc.boolean(),
        lastReminderTime: fc.integer({ min: 0, max: Date.now() }),
        intervalMinutes: validIntervalArbitrary(),
    });
};

/**
 * Arbitrary generator for notification messages
 */
export const notificationMessageArbitrary = (): fc.Arbitrary<string> => {
    return fc.string({ minLength: 1, maxLength: 200 });
};

/**
 * Mock VS Code configuration
 */
export class MockConfiguration {
    private config: Map<string, any> = new Map();

    get<T>(section: string, defaultValue?: T): T | undefined {
        return this.config.has(section)
            ? this.config.get(section)
            : defaultValue;
    }

    update(section: string, value: any): Promise<void> {
        this.config.set(section, value);
        return Promise.resolve();
    }

    has(section: string): boolean {
        return this.config.has(section);
    }

    inspect<T>(section: string) {
        return {
            key: section,
            defaultValue: undefined,
            globalValue: this.config.get(section),
            workspaceValue: undefined,
            workspaceFolderValue: undefined,
        };
    }
}

/**
 * Mock VS Code workspace
 */
export class MockWorkspace {
    private configuration = new MockConfiguration();

    getConfiguration(section?: string) {
        return this.configuration;
    }

    onDidChangeConfiguration(listener: any) {
        return { dispose: () => {} };
    }
}

/**
 * Mock VS Code window
 */
export class MockWindow {
    private messages: string[] = [];

    showInformationMessage(
        message: string,
        ...items: string[]
    ): Promise<string | undefined> {
        this.messages.push(message);
        return Promise.resolve(items[0]);
    }

    showWarningMessage(
        message: string,
        ...items: string[]
    ): Promise<string | undefined> {
        this.messages.push(message);
        return Promise.resolve(items[0]);
    }

    showErrorMessage(
        message: string,
        ...items: string[]
    ): Promise<string | undefined> {
        this.messages.push(message);
        return Promise.resolve(items[0]);
    }

    createOutputChannel(name: string) {
        return {
            append: () => {},
            appendLine: () => {},
            clear: () => {},
            show: () => {},
            hide: () => {},
            dispose: () => {},
        };
    }

    createStatusBarItem(alignment?: any, priority?: number) {
        return {
            text: "",
            tooltip: "",
            command: "",
            show: () => {},
            hide: () => {},
            dispose: () => {},
        };
    }

    getMessages(): string[] {
        return [...this.messages];
    }

    clearMessages(): void {
        this.messages = [];
    }
}

/**
 * Mock VS Code extension context
 */
export class MockExtensionContext {
    subscriptions: any[] = [];
    globalState: MockMemento = new MockMemento();
    workspaceState: MockMemento = new MockMemento();
    extensionPath: string = "/mock/extension/path";
    storagePath: string = "/mock/storage/path";
    globalStoragePath: string = "/mock/global/storage/path";
    logPath: string = "/mock/log/path";

    asAbsolutePath(relativePath: string): string {
        return `${this.extensionPath}/${relativePath}`;
    }
}

/**
 * Mock VS Code Memento (state storage)
 */
export class MockMemento {
    private storage: Map<string, any> = new Map();

    get<T>(key: string, defaultValue?: T): T {
        return this.storage.has(key)
            ? this.storage.get(key)
            : (defaultValue as T);
    }

    update(key: string, value: any): Promise<void> {
        this.storage.set(key, value);
        return Promise.resolve();
    }

    keys(): readonly string[] {
        return Array.from(this.storage.keys());
    }
}

/**
 * Helper to create a mock VS Code API
 */
export function createMockVSCode() {
    return {
        workspace: new MockWorkspace(),
        window: new MockWindow(),
        StatusBarAlignment: {
            Left: 1,
            Right: 2,
        },
        Disposable: {
            from: (...disposables: any[]) => ({
                dispose: () =>
                    disposables.forEach((d) => d.dispose && d.dispose()),
            }),
        },
    };
}

/**
 * Helper to verify notification message contains required elements
 */
export function verifyNotificationContent(message: string): {
    hasCat: boolean;
    hasWaterMessage: boolean;
    hasMeow: boolean;
} {
    const lowerMessage = message.toLowerCase();
    return {
        hasCat: message.includes("🐱") || lowerMessage.includes("cat"),
        hasWaterMessage:
            lowerMessage.includes("water") || lowerMessage.includes("hydrat"),
        hasMeow: lowerMessage.includes("meow"),
    };
}

/**
 * Helper to create a spy function for testing
 */
export function createSpy<T extends (...args: any[]) => any>(): T & {
    calls: any[][];
    callCount: number;
} {
    const calls: any[][] = [];
    const spy = ((...args: any[]) => {
        calls.push(args);
    }) as any;
    spy.calls = calls;
    Object.defineProperty(spy, "callCount", {
        get: () => calls.length,
    });
    return spy;
}
