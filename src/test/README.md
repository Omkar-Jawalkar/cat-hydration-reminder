# Property-Based Testing Infrastructure

This directory contains the property-based testing infrastructure for the VS Code Cat Hydration Reminder extension.

## Overview

The testing infrastructure uses:

- **Mocha**: Test framework for organizing and running tests
- **fast-check**: Property-based testing library for generating random test cases
- **Minimum 100 iterations**: Each property test runs at least 100 times with different inputs

## File Structure

```
src/test/
├── README.md                    # This file
├── runTest.js                   # Test runner (executes all tests)
├── testUtils.ts                 # Test utilities and generators
├── propertyTestConfig.ts        # Configuration for property tests
├── sample.property.test.ts      # Sample property-based tests
└── *.property.test.ts           # Property-based test files
```

## Test Utilities

### Arbitrary Generators

The `testUtils.ts` file provides generators for creating random test data:

- `validIntervalArbitrary()`: Generates valid intervals (15-240 minutes)
- `outOfBoundsIntervalArbitrary()`: Generates invalid intervals (for testing validation)
- `anyIntervalArbitrary()`: Generates any interval value
- `extensionStateArbitrary()`: Generates random extension states
- `notificationMessageArbitrary()`: Generates random notification messages

### Mock VS Code APIs

Mock implementations for testing without VS Code:

- `MockConfiguration`: Mock VS Code configuration
- `MockWorkspace`: Mock VS Code workspace
- `MockWindow`: Mock VS Code window (notifications, output channels, status bar)
- `MockExtensionContext`: Mock extension context (state storage, subscriptions)
- `MockMemento`: Mock state storage (globalState, workspaceState)

### Helper Functions

- `createMockVSCode()`: Creates a complete mock VS Code API
- `verifyNotificationContent(message)`: Verifies notification contains cat, meow, and water message
- `createSpy()`: Creates a spy function for tracking calls

## Writing Property-Based Tests

### Basic Structure

```typescript
import * as assert from "assert";
import * as fc from "fast-check";
import {
    propertyTestConfig,
    createPropertyTestTag,
} from "./propertyTestConfig";
import { validIntervalArbitrary } from "./testUtils";

suite("My Feature Tests", () => {
    test("Property N: Description", () => {
        const tag = createPropertyTestTag(N, "Description");

        fc.assert(
            fc.property(validIntervalArbitrary(), (interval) => {
                // Test logic here
                assert.ok(interval >= 15);
                assert.ok(interval <= 240);
            }),
            propertyTestConfig,
        );
    });
});
```

### Test Naming Convention

All property-based tests should follow this format:

- **Test name**: `Property N: Description`
- **Tag**: `Feature: vscode-extension-template, Property N: Description`

Where N corresponds to the property number in the design document.

### Configuration

Tests use `propertyTestConfig` which sets:

- `numRuns: 100` - Minimum 100 iterations per test
- `verbose: false` - Quiet output (set to true for debugging)
- `endOnFailure: false` - Run all iterations even if one fails

For longer tests, use `extendedPropertyTestConfig` (1000 iterations).

## Running Tests

### Compile and Run All Tests

```bash
npm run compile
npm test
```

### Run Tests in Watch Mode

```bash
npm run watch
# In another terminal:
npm test
```

### Run Specific Test File

```bash
npm run compile
node ./out/test/runTest.js
```

## Property Tests to Implement

Based on the design document, the following property tests should be implemented:

1. **Property 1**: Notification Content Completeness (Requirements 1.1, 1.2, 2.2, 2.3)
2. **Property 2**: Timer Triggers at Correct Intervals (Requirements 2.1)
3. **Property 3**: Reminder Events Are Logged (Requirements 2.4)
4. **Property 4**: Configuration Changes Update Scheduler (Requirements 3.2)
5. **Property 5**: Interval Validation Enforces Bounds (Requirements 3.3)
6. **Property 6**: Dismissal Reschedules Next Reminder (Requirements 4.3)
7. **Property 7**: Activation Initializes Scheduler (Requirements 5.2)
8. **Property 8**: Deactivation Cleans Up Resources (Requirements 5.4)
9. **Property 9**: State Persistence Round Trip (Requirements 5.3, 6.4)
10. **Property 10**: Enabled State Controls Notifications (Requirements 6.2, 6.3)
11. **Property 11**: Status Bar Reflects Enabled State (Requirements 6.5)

## Best Practices

1. **Use appropriate generators**: Choose the right arbitrary generator for your test case
2. **Keep tests focused**: Each property test should verify one specific property
3. **Use meaningful assertions**: Make it clear what property is being tested
4. **Mock VS Code APIs**: Use the provided mocks to avoid dependencies on VS Code
5. **Tag your tests**: Always use `createPropertyTestTag()` for consistent naming
6. **Document properties**: Add comments explaining what property is being verified

## Debugging Failed Tests

When a property test fails, fast-check will provide:

- The failing input that caused the failure
- A seed value to reproduce the failure
- A shrunk (simplified) version of the failing input

To reproduce a failure:

```typescript
fc.assert(
    fc.property(arbitrary, predicate),
    { ...propertyTestConfig, seed: 1234567890 }, // Use the seed from the failure
);
```

## Example: Complete Property Test

```typescript
import * as assert from "assert";
import * as fc from "fast-check";
import {
    propertyTestConfig,
    createPropertyTestTag,
} from "./propertyTestConfig";
import { outOfBoundsIntervalArbitrary } from "./testUtils";
import { ConfigurationManager } from "../ConfigurationManager";
import { MockWorkspace } from "./testUtils";

suite("ConfigurationManager Property Tests", () => {
    test("Property 5: Interval Validation Enforces Bounds", () => {
        /**
         * Validates: Requirements 3.3
         * For any interval value outside [15, 240], the configuration manager
         * should clamp it to the nearest valid boundary.
         */
        const tag = createPropertyTestTag(
            5,
            "Interval Validation Enforces Bounds",
        );

        fc.assert(
            fc.property(outOfBoundsIntervalArbitrary(), (invalidInterval) => {
                const mockWorkspace = new MockWorkspace();
                const config = new ConfigurationManager(mockWorkspace as any);

                // Set invalid interval
                config.setReminderInterval(invalidInterval);

                // Get the clamped value
                const actualInterval = config.getReminderInterval();

                // Verify it's within bounds
                assert.ok(
                    actualInterval >= 15,
                    `Interval ${actualInterval} should be >= 15 (input: ${invalidInterval})`,
                );
                assert.ok(
                    actualInterval <= 240,
                    `Interval ${actualInterval} should be <= 240 (input: ${invalidInterval})`,
                );
            }),
            propertyTestConfig,
        );
    });
});
```

## Troubleshooting

### Tests not running

- Ensure TypeScript is compiled: `npm run compile`
- Check that test files end with `.test.ts`
- Verify Mocha is installed: `npm install --save-dev mocha @types/mocha`

### fast-check errors

- Ensure fast-check is installed: `npm install --save-dev fast-check`
- Check that arbitraries are properly imported
- Verify property test configuration is correct

### Mock API issues

- Ensure you're using the mock APIs from `testUtils.ts`
- Don't try to import real VS Code APIs in tests
- Use `createMockVSCode()` for complete mock setup
