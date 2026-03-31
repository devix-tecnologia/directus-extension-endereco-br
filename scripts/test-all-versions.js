#!/usr/bin/env node

/**
 * Multi-version Directus Test Runner
 *
 * Runs integration tests against multiple Directus versions to ensure
 * compatibility with both v10 and v11.
 *
 * @author Matt Pocock style test orchestration
 */

import { spawn } from 'child_process';
import { directusVersions, blockedDirectusVersions } from '../src/tests/directus-versions.js';

// ANSI color codes for pretty output
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	green: '\x1b[32m',
	red: '\x1b[31m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	cyan: '\x1b[36m',
};

/**
 * Logs a formatted message with timestamp
 */
function log(message, color = colors.reset) {
	const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
	// eslint-disable-next-line no-console
	console.log(`${colors.bright}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`);
}

/**
 * Runs tests for a specific Directus version
 * Returns a promise that resolves with the test results
 */
function runTestsForVersion(version) {
	return new Promise((resolve, reject) => {
		log(`Testing Directus ${version}`, colors.cyan);

		const env = {
			...process.env,
			DIRECTUS_TEST_VERSION: version,
		};

		const child = spawn('pnpm', ['test:integration'], {
			env,
			stdio: 'inherit',
			shell: true,
		});

		child.on('close', (code) => {
			if (code === 0) {
				log(`✓ Directus ${version} - PASSED`, colors.green);
				resolve({ version, passed: true });
			} else {
				log(`✗ Directus ${version} - FAILED`, colors.red);
				resolve({ version, passed: false, exitCode: code });
			}
		});

		child.on('error', (error) => {
			log(`✗ Directus ${version} - ERROR: ${error.message}`, colors.red);
			reject({ version, error });
		});
	});
}

/**
 * Main test runner
 */
async function main() {
	log('Starting multi-version Directus tests', colors.bright);
	log('═'.repeat(60), colors.blue);

	// Filter out blocked versions
	const versionsToTest = directusVersions.filter((v) => !blockedDirectusVersions.includes(v));

	log(`Testing ${versionsToTest.length} versions: ${versionsToTest.join(', ')}`, colors.yellow);
	log('═'.repeat(60), colors.blue);

	const results = [];

	// Run tests sequentially to avoid port conflicts
	for (const version of versionsToTest) {
		try {
			const result = await runTestsForVersion(version);
			results.push(result);
		} catch (error) {
			results.push(error);
		}

		// Add a small delay between test runs
		await new Promise((resolve) => setTimeout(resolve, 2000));
	}

	// Print summary
	log('═'.repeat(60), colors.blue);
	log('Test Summary', colors.bright);
	log('═'.repeat(60), colors.blue);

	const passed = results.filter((r) => r.passed);
	const failed = results.filter((r) => !r.passed);

	passed.forEach((r) => {
		log(`✓ ${r.version}`, colors.green);
	});

	failed.forEach((r) => {
		log(`✗ ${r.version} (exit code: ${r.exitCode || 'unknown'})`, colors.red);
	});

	log('═'.repeat(60), colors.blue);

	log(
		`Total: ${results.length} | Passed: ${passed.length} | Failed: ${failed.length}`,
		colors.bright
	);

	// Exit with error if any tests failed
	if (failed.length > 0) {
		process.exit(1);
	}
}

// Run the tests
main().catch((error) => {
	log(`Unexpected error: ${error.message}`, colors.red);
	// eslint-disable-next-line no-console
	console.error(error);
	process.exit(1);
});
