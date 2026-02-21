const path = require("path");
const Mocha = require("mocha");
const glob = require("glob");

async function main() {
    try {
        // Create the mocha test runner
        const mocha = new Mocha({
            ui: "tdd",
            color: true,
            timeout: 10000,
        });

        const testsRoot = path.resolve(__dirname, "..");

        // Find only property test files (to avoid VS Code dependency issues)
        const files = glob.sync("**/**.property.test.js", { cwd: testsRoot });

        // Add files to the test suite
        files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

        // Run the mocha test
        return new Promise((resolve, reject) => {
            mocha.run((failures) => {
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed.`));
                } else {
                    resolve();
                }
            });
        });
    } catch (err) {
        console.error("Failed to run tests:", err);
        throw err;
    }
}

main()
    .then(() => {
        console.log("All tests passed!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Test run failed:", err);
        process.exit(1);
    });
