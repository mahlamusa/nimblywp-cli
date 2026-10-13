/**
 * Tests for output formatting utilities
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { output, outputError, outputSuccess, outputWarning } from '../../src/utils/output.js';

describe('Output Utilities', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('JSON output', () => {
    it('should output data as JSON', () => {
      const data = { id: '123', name: 'Test' };
      output(data, 'json');

      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
    });
  });

  describe('Table output', () => {
    it('should output array as table', () => {
      const data = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];

      output(data, 'table');

      // Should call console.log with table output
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle empty array', () => {
      output([], 'table');
      expect(consoleLogSpy).toHaveBeenCalledWith('No results');
    });
  });

  describe('Success/Error/Warning messages', () => {
    it('should output success message', () => {
      outputSuccess('Operation successful');
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ Operation successful');
    });

    it('should output error message', () => {
      outputError('Something went wrong');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Something went wrong');
    });

    it('should output warning message', () => {
      outputWarning('This is a warning');
      expect(consoleWarnSpy).toHaveBeenCalledWith('⚠ This is a warning');
    });
  });
});
