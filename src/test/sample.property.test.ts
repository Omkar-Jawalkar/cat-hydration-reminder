/**
 * Sample property-based test
 * Demonstrates the testing infrastructure setup
 * Feature: vscode-extension-template
 */

import * as assert from "assert";
import * as fc from "fast-check";
import {
    propertyTestConfig,
    createPropertyTestTag,
} from "./propertyTestConfig";
import {
    validIntervalArbitrary,
    outOfBoundsIntervalArbitrary,
    extensionStateArbitrary,
    verifyNotificationContent,
} from "./testUtils";

suite("Property-Based Testing Infrastructure", () => {
    test("Sample: Valid intervals are within bounds", () => {
        const tag = createPropertyTestTag(0, "Sample test - Valid intervals");

        fc.assert(
            fc.property(validIntervalArbitrary(), (interval) => {
                // Verify that generated intervals are within valid range
                assert.ok(
                    interval >= 15,
                    `Interval ${interval} should be >= 15`,
                );
                assert.ok(
                    interval <= 240,
                    `Interval ${interval} should be <= 240`,
                );
            }),
            { ...propertyTestConfig, verbose: true },
        );
    });

    test("Sample: Out-of-bounds intervals are outside valid range", () => {
        const tag = createPropertyTestTag(
            0,
            "Sample test - Out-of-bounds intervals",
        );

        fc.assert(
            fc.property(outOfBoundsIntervalArbitrary(), (interval) => {
                // Verify that generated out-of-bounds intervals are actually out of bounds
                assert.ok(
                    interval < 15 || interval > 240,
                    `Interval ${interval} should be outside [15, 240] range`,
                );
            }),
            propertyTestConfig,
        );
    });

    test("Sample: Extension states have valid structure", () => {
        const tag = createPropertyTestTag(
            0,
            "Sample test - Extension state structure",
        );

        fc.assert(
            fc.property(extensionStateArbitrary(), (state) => {
                // Verify state has required properties
                assert.ok(
                    typeof state.enabled === "boolean",
                    "enabled should be boolean",
                );
                assert.ok(
                    typeof state.lastReminderTime === "number",
                    "lastReminderTime should be number",
                );
                assert.ok(
                    typeof state.intervalMinutes === "number",
                    "intervalMinutes should be number",
                );

                // Verify interval is valid
                assert.ok(
                    state.intervalMinutes >= 15 && state.intervalMinutes <= 240,
                    "intervalMinutes should be in valid range",
                );
            }),
            propertyTestConfig,
        );
    });

    test("Sample: Notification content verification helper works", () => {
        // Test with valid notification
        const validMessage = "🐱 Meow meow! Time to drink water! 💧";
        const result = verifyNotificationContent(validMessage);

        assert.ok(result.hasCat, "Should detect cat emoji");
        assert.ok(result.hasWaterMessage, "Should detect water message");
        assert.ok(result.hasMeow, "Should detect meow text");

        // Test with invalid notification
        const invalidMessage = "Hello world";
        const invalidResult = verifyNotificationContent(invalidMessage);

        assert.ok(
            !invalidResult.hasCat,
            "Should not detect cat in invalid message",
        );
        assert.ok(
            !invalidResult.hasWaterMessage,
            "Should not detect water in invalid message",
        );
        assert.ok(
            !invalidResult.hasMeow,
            "Should not detect meow in invalid message",
        );
    });
});
