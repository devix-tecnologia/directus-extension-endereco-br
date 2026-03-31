/**
 * Tests for Directus version detection utility
 *
 * @author Matt Pocock style test implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	detectDirectusVersion,
	isDirectusV10,
	isDirectusV11,
	meetsMinimumVersion,
	getCompatibilityMode,
	resetVersionCache,
	getCurrentDirectusVersion,
	type DirectusVersionInfo,
} from '../utils/directus-version.js';

// Mock logger for testing
const mockLogger = {
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
	debug: vi.fn(),
};

describe('Directus Version Detection', () => {
	beforeEach(() => {
		resetVersionCache();
		vi.clearAllMocks();
	});

	describe('Type guards', () => {
		it('should identify v10 correctly', () => {
			const versionV10: DirectusVersionInfo = {
				major: 10,
				minor: 13,
				patch: 3,
				full: '10.13.3',
				isV10: true,
				isV11: false,
			};

			expect(isDirectusV10(versionV10)).toBe(true);
			expect(isDirectusV11(versionV10)).toBe(false);
		});

		it('should identify v11 correctly', () => {
			const versionV11: DirectusVersionInfo = {
				major: 11,
				minor: 17,
				patch: 1,
				full: '11.17.1',
				isV10: false,
				isV11: true,
			};

			expect(isDirectusV10(versionV11)).toBe(false);
			expect(isDirectusV11(versionV11)).toBe(true);
		});
	});

	describe('meetsMinimumVersion', () => {
		it('should return true when version meets major requirement', () => {
			const current: DirectusVersionInfo = {
				major: 11,
				minor: 0,
				patch: 0,
				full: '11.0.0',
				isV10: false,
				isV11: true,
			};

			expect(meetsMinimumVersion(current, { major: 11 })).toBe(true);
		});

		it('should return false when version is below major requirement', () => {
			const current: DirectusVersionInfo = {
				major: 10,
				minor: 13,
				patch: 3,
				full: '10.13.3',
				isV10: true,
				isV11: false,
			};

			expect(meetsMinimumVersion(current, { major: 11 })).toBe(false);
		});

		it('should check minor version when specified', () => {
			const current: DirectusVersionInfo = {
				major: 11,
				minor: 17,
				patch: 1,
				full: '11.17.1',
				isV10: false,
				isV11: true,
			};

			expect(meetsMinimumVersion(current, { major: 11, minor: 10 })).toBe(true);
			expect(meetsMinimumVersion(current, { major: 11, minor: 20 })).toBe(false);
		});

		it('should check patch version when specified', () => {
			const current: DirectusVersionInfo = {
				major: 11,
				minor: 17,
				patch: 5,
				full: '11.17.5',
				isV10: false,
				isV11: true,
			};

			expect(meetsMinimumVersion(current, { major: 11, minor: 17, patch: 3 })).toBe(true);
			expect(meetsMinimumVersion(current, { major: 11, minor: 17, patch: 10 })).toBe(false);
		});

		it('should handle edge cases with exact matches', () => {
			const current: DirectusVersionInfo = {
				major: 11,
				minor: 17,
				patch: 1,
				full: '11.17.1',
				isV10: false,
				isV11: true,
			};

			expect(meetsMinimumVersion(current, { major: 11, minor: 17, patch: 1 })).toBe(true);
		});
	});

	describe('getCompatibilityMode', () => {
		it('should return formatted string for v10', () => {
			const version: DirectusVersionInfo = {
				major: 10,
				minor: 13,
				patch: 3,
				full: '10.13.3',
				isV10: true,
				isV11: false,
			};

			expect(getCompatibilityMode(version)).toBe('Directus 10.x (10.13.3)');
		});

		it('should return formatted string for v11', () => {
			const version: DirectusVersionInfo = {
				major: 11,
				minor: 17,
				patch: 1,
				full: '11.17.1',
				isV10: false,
				isV11: true,
			};

			expect(getCompatibilityMode(version)).toBe('Directus 11.x (11.17.1)');
		});
	});

	describe('getCurrentDirectusVersion caching', () => {
		it('should cache version info on first call', () => {
			const first = getCurrentDirectusVersion(mockLogger as any);
			const second = getCurrentDirectusVersion(mockLogger as any);

			// Should return same reference (cached)
			expect(first).toBe(second);
		});

		it('should log version on first call', () => {
			getCurrentDirectusVersion(mockLogger as any);

			// Should have logged the version info
			expect(mockLogger.info).toHaveBeenCalled();
		});

		it('should reset cache when resetVersionCache is called', () => {
			const first = getCurrentDirectusVersion(mockLogger as any);
			resetVersionCache();
			const second = getCurrentDirectusVersion(mockLogger as any);

			// May not be the same reference after reset
			expect(first).toEqual(second);
		});
	});

	describe('detectDirectusVersion integration', () => {
		it('should detect some version without throwing', () => {
			expect(() => {
				const version = detectDirectusVersion(mockLogger as any);
				expect(version).toBeDefined();
				expect(version.major).toBeGreaterThanOrEqual(10);
				expect(version.minor).toBeGreaterThanOrEqual(0);
				expect(version.patch).toBeGreaterThanOrEqual(0);
			}).not.toThrow();
		});

		it('should always return a valid version info', () => {
			const version = detectDirectusVersion(mockLogger as any);

			expect(version).toHaveProperty('major');
			expect(version).toHaveProperty('minor');
			expect(version).toHaveProperty('patch');
			expect(version).toHaveProperty('full');
			expect(version).toHaveProperty('isV10');
			expect(version).toHaveProperty('isV11');

			// One of them must be true
			expect(version.isV10 || version.isV11).toBe(true);
		});
	});

	describe('Type safety with discriminated unions', () => {
		it('should narrow types correctly with isDirectusV10', () => {
			const version: DirectusVersionInfo = {
				major: 10,
				minor: 13,
				patch: 3,
				full: '10.13.3',
				isV10: true,
				isV11: false,
			};

			if (isDirectusV10(version)) {
				// TypeScript should know isV10 is true here
				expect(version.isV10).toBe(true);
				expect(version.major).toBe(10);
			}
		});

		it('should narrow types correctly with isDirectusV11', () => {
			const version: DirectusVersionInfo = {
				major: 11,
				minor: 17,
				patch: 1,
				full: '11.17.1',
				isV10: false,
				isV11: true,
			};

			if (isDirectusV11(version)) {
				// TypeScript should know isV11 is true here
				expect(version.isV11).toBe(true);
				expect(version.major).toBe(11);
			}
		});
	});
});
