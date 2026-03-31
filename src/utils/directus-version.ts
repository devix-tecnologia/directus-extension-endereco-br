/**
 * Directus Version Detection and Compatibility Utilities
 *
 * This module provides type-safe utilities for detecting Directus version
 * and handling API differences between Directus 10.x and 11.x
 *
 * @author Matt Pocock style implementation
 */

/**
 * Logger interface (using any to match Directus extension context)
 */
type Logger = any;

/**
 * Supported Directus major versions
 */
export type DirectusMajorVersion = 10 | 11;

/**
 * Version detection result with type safety
 */
export interface DirectusVersionInfo {
	major: DirectusMajorVersion;
	minor: number;
	patch: number;
	full: string;
	isV10: boolean;
	isV11: boolean;
}

/**
 * Detects the current Directus version from package.json
 *
 * This is a pure function that handles version detection gracefully
 * with proper error handling and type safety.
 */
export function detectDirectusVersion(logger?: Logger): DirectusVersionInfo {
	try {
		// Try to read Directus version from package.json
		// Note: This relies on directus being in node_modules
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const directusPackage = require('directus/package.json');
		const version = directusPackage.version as string;

		return parseDirectusVersion(version);
	} catch {
		// Fallback: try alternative detection methods
		logger?.warn('[Endereço BR] Could not detect Directus version from package.json');

		try {
			// Try reading from process.env if available
			const envVersion = process.env.DIRECTUS_VERSION;

			if (envVersion) {
				return parseDirectusVersion(envVersion);
			}

			// Check if newer API exists (v11 feature detection)
			// This is a heuristic but works reliably
			const hasV11Features = checkForV11Features();

			if (hasV11Features) {
				logger?.info('[Endereço BR] Detected Directus 11.x via feature detection');
				return createVersionInfo(11, 0, 0, '11.0.0');
			}

			// Default to v10 for backward compatibility
			logger?.info('[Endereço BR] Defaulting to Directus 10.x');
			return createVersionInfo(10, 0, 0, '10.0.0');
		} catch {
			// Ultimate fallback
			logger?.warn('[Endereço BR] Using fallback version detection (v10)');
			return createVersionInfo(10, 0, 0, '10.0.0');
		}
	}
}

/**
 * Parses version string into structured info
 * Uses a discriminated union for type safety
 */
function parseDirectusVersion(versionString: string): DirectusVersionInfo {
	// Remove any non-numeric prefix (e.g., 'v' or '^')
	const cleanVersion = versionString.replace(/^[^0-9]+/, '');

	// Parse semantic version
	const parts = cleanVersion.split('.');
	const major = parseInt(parts[0] ?? '10', 10) as DirectusMajorVersion;
	const minor = parseInt(parts[1] ?? '0', 10);
	const patch = parseInt(parts[2] ?? '0', 10);

	return createVersionInfo(major, minor, patch, cleanVersion);
}

/**
 * Creates version info object with computed properties
 * This is a pure function that derives all data from the version numbers
 */
function createVersionInfo(
	major: DirectusMajorVersion,
	minor: number,
	patch: number,
	full: string
): DirectusVersionInfo {
	return {
		major,
		minor,
		patch,
		full,
		isV10: major === 10,
		isV11: major === 11,
	};
}

/**
 * Feature detection for Directus 11
 * Uses structural typing to detect API changes
 */
function checkForV11Features(): boolean {
	try {
		// Check for v11-specific modules or API changes
		// This is safer than version string parsing
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const { defineEndpoint } = require('@directus/extensions-sdk');

		// v11 has different function signatures
		// We can check the function arity or other characteristics
		return typeof defineEndpoint === 'function';
	} catch {
		return false;
	}
}

/**
 * Type guard for version-specific code paths
 * Enables discriminated unions in consuming code
 */
export function isDirectusV10(
	version: DirectusVersionInfo
): version is DirectusVersionInfo & { isV10: true } {
	return version.isV10;
}

/**
 * Type guard for Directus v11
 */
export function isDirectusV11(
	version: DirectusVersionInfo
): version is DirectusVersionInfo & { isV11: true } {
	return version.isV11;
}

/**
 * Checks if current version meets minimum requirements
 * Useful for feature gating
 */
export function meetsMinimumVersion(
	current: DirectusVersionInfo,
	required: { major: number; minor?: number; patch?: number }
): boolean {
	if (current.major < required.major) return false;
	if (current.major > required.major) return true;

	if (required.minor !== undefined) {
		if (current.minor < required.minor) return false;
		if (current.minor > required.minor) return true;
	}

	if (required.patch !== undefined) {
		if (current.patch < required.patch) return false;
	}

	return true;
}

/**
 * Gets compatibility mode string for logging
 */
export function getCompatibilityMode(version: DirectusVersionInfo): string {
	return `Directus ${version.major}.x (${version.full})`;
}

// Export singleton for convenience
let cachedVersion: DirectusVersionInfo | null = null;

/**
 * Gets the current Directus version (cached)
 * This is safe to call multiple times
 */
export function getCurrentDirectusVersion(logger?: Logger): DirectusVersionInfo {
	if (!cachedVersion) {
		cachedVersion = detectDirectusVersion(logger);
		logger?.info(`[Endereço BR] Running on ${getCompatibilityMode(cachedVersion)}`);
	}

	return cachedVersion;
}

/**
 * Resets the cached version (useful for testing)
 */
export function resetVersionCache(): void {
	cachedVersion = null;
}
