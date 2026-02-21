/**
 * Configuration for property-based tests
 * Sets minimum iterations and test parameters
 */

import * as fc from "fast-check";

/**
 * Default configuration for property-based tests
 * Minimum 100 iterations as specified in the design
 */
export const propertyTestConfig: fc.Parameters<unknown> = {
    numRuns: 100,
    verbose: false,
    seed: undefined, // Use random seed by default
    path: undefined,
    endOnFailure: false,
};

/**
 * Configuration for longer-running property tests
 */
export const extendedPropertyTestConfig: fc.Parameters<unknown> = {
    numRuns: 1000,
    verbose: false,
    seed: undefined,
    path: undefined,
    endOnFailure: false,
};

/**
 * Helper to create test tags for property-based tests
 * Format: "Feature: vscode-extension-template, Property {N}: {description}"
 */
export function createPropertyTestTag(
    propertyNumber: number,
    description: string,
): string {
    return `Feature: vscode-extension-template, Property ${propertyNumber}: ${description}`;
}

/**
 * Property test wrapper that applies default configuration
 */
export function propertyTest<T>(
    name: string,
    arbitraries: fc.Arbitrary<T>,
    predicate: (value: T) => boolean | void,
    config: fc.Parameters<unknown> = propertyTestConfig,
): void {
    fc.assert(fc.property(arbitraries, predicate), config);
}
