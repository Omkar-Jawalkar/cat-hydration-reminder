import * as assert from "assert";
import { Logger } from "./Logger";

/**
 * Unit tests for the Logger utility.
 * Tests the info, warn, and error logging methods.
 *
 * Requirements: 2.4
 */

suite("Logger", () => {
    let logger: Logger;
    let mockOutputChannel: any;
    let loggedMessages: string[];

    setup(() => {
        loggedMessages = [];

        // Create a mock output channel
        mockOutputChannel = {
            appendLine: (message: string) => {
                loggedMessages.push(message);
            },
            name: "Test Channel",
            append: () => {},
            clear: () => {},
            show: () => {},
            hide: () => {},
            dispose: () => {},
        };

        // Create logger with mocked output channel
        logger = new Logger("Test Channel");
        // Replace the internal output channel with our mock
        (logger as any).outputChannel = mockOutputChannel;
    });

    suite("info", () => {
        test("should log info messages with INFO level", () => {
            logger.info("Test info message");

            assert.strictEqual(loggedMessages.length, 1);
            const loggedMessage = loggedMessages[0];
            assert.ok(loggedMessage.includes("[INFO]"));
            assert.ok(loggedMessage.includes("Test info message"));
            assert.ok(
                /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(loggedMessage),
            ); // ISO timestamp
        });
    });

    suite("warn", () => {
        test("should log warning messages with WARN level", () => {
            logger.warn("Test warning message");

            assert.strictEqual(loggedMessages.length, 1);
            const loggedMessage = loggedMessages[0];
            assert.ok(loggedMessage.includes("[WARN]"));
            assert.ok(loggedMessage.includes("Test warning message"));
            assert.ok(
                /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(loggedMessage),
            );
        });
    });

    suite("error", () => {
        test("should log error messages with ERROR level", () => {
            logger.error("Test error message");

            assert.strictEqual(loggedMessages.length, 1);
            const loggedMessage = loggedMessages[0];
            assert.ok(loggedMessage.includes("[ERROR]"));
            assert.ok(loggedMessage.includes("Test error message"));
            assert.ok(
                /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(loggedMessage),
            );
        });

        test("should include error details when Error object is provided", () => {
            const error = new Error("Something went wrong");
            logger.error("Test error with details", error);

            assert.strictEqual(loggedMessages.length, 1);
            const loggedMessage = loggedMessages[0];
            assert.ok(loggedMessage.includes("[ERROR]"));
            assert.ok(loggedMessage.includes("Test error with details"));
            assert.ok(loggedMessage.includes("Something went wrong"));
        });

        test("should include stack trace when Error object has stack", () => {
            const error = new Error("Error with stack");
            error.stack = "Error: Error with stack\n    at test.ts:10:5";
            logger.error("Test error with stack", error);

            assert.strictEqual(loggedMessages.length, 1);
            const loggedMessage = loggedMessages[0];
            assert.ok(loggedMessage.includes("Error with stack"));
            assert.ok(loggedMessage.includes("at test.ts:10:5"));
        });

        test("should handle non-Error objects", () => {
            logger.error("Test error with string", "string error");

            assert.strictEqual(loggedMessages.length, 1);
            const loggedMessage = loggedMessages[0];
            assert.ok(loggedMessage.includes("[ERROR]"));
            assert.ok(loggedMessage.includes("Test error with string"));
            assert.ok(loggedMessage.includes("string error"));
        });
    });

    suite("getOutputChannel", () => {
        test("should return the output channel", () => {
            const channel = logger.getOutputChannel();
            assert.strictEqual(channel, mockOutputChannel);
        });
    });

    suite("log format", () => {
        test("should include timestamp, level, and message in correct format", () => {
            logger.info("Format test");

            const loggedMessage = loggedMessages[0];
            // Format: [YYYY-MM-DDTHH:MM:SS.sssZ] [LEVEL] message
            assert.ok(
                /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] Format test$/.test(
                    loggedMessage,
                ),
            );
        });
    });
});
