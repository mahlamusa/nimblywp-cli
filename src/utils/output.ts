/**
 * Output formatting utilities
 *
 * Handles rendering data in multiple formats (table, JSON, YAML, CSV) for
 * consistent CLI output across all commands.
 */
import Table from 'cli-table3';
import YAML from 'yaml';
import type { OutputFormat } from '../types/index.js';

/**
 * Format and output data in the specified format
 *
 * @param data Data to output
 * @param format Output format
 * @param columns Column configuration for table format
 */
export function output(
  data: unknown,
  format: OutputFormat = 'table',
  columns?: { key: string; label: string }[]
): void {
  switch (format) {
    case 'json':
      console.log(JSON.stringify(data, null, 2));
      break;

    case 'yaml':
      console.log(YAML.stringify(data));
      break;

    case 'csv':
      outputCsv(data, columns);
      break;

    case 'table':
    default:
      outputTable(data, columns);
      break;
  }
}

/**
 * Output data as a table
 */
function outputTable(data: unknown, columns?: { key: string; label: string }[]): void {
  if (!data) {
    console.log('No data');
    return;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    if (data.length === 0) {
      console.log('No results');
      return;
    }

    // Auto-detect columns if not provided
    const cols = columns || autoDetectColumns(data[0]);

    const table = new Table({
      head: cols.map((c) => c.label),
    });

    data.forEach((item) => {
      const row = cols.map((col) => {
        const value = getNestedValue(item, col.key);
        return formatValue(value);
      });
      table.push(row);
    });

    console.log(table.toString());
    return;
  }

  // Handle single objects
  if (typeof data === 'object') {
    const table = new Table();
    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
      table.push({ [key]: formatValue(value) });
    });
    console.log(table.toString());
    return;
  }

  // Handle primitives
  console.log(data);
}

/**
 * Output data as CSV
 */
function outputCsv(data: unknown, columns?: { key: string; label: string }[]): void {
  if (!Array.isArray(data) || data.length === 0) {
    return;
  }

  const cols = columns || autoDetectColumns(data[0]);
  const headers = cols.map((c) => c.label);

  // Simple CSV implementation
  console.log(headers.join(','));
  data.forEach((item) => {
    const row = cols.map((col) => {
      const value = getNestedValue(item, col.key);
      const formatted = formatValue(value);
      // Escape commas and quotes
      return formatted.includes(',') || formatted.includes('"')
        ? `"${formatted.replace(/"/g, '""')}"`
        : formatted;
    });
    console.log(row.join(','));
  });
}

/**
 * Auto-detect columns from object keys
 */
function autoDetectColumns(obj: unknown): { key: string; label: string }[] {
  if (!obj || typeof obj !== 'object') {
    return [];
  }

  return Object.keys(obj).map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
  }));
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }

  return path.split('.').reduce((current: unknown, key: string) => {
    return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
  }, obj as unknown);
}

/**
 * Format value for display
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 47) + '...';
  }

  return String(value);
}

/**
 * Output an error message
 */
export function outputError(message: string, details?: unknown): void {
  console.error(`Error: ${message}`);
  if (details) {
    console.error(JSON.stringify(details, null, 2));
  }
}

/**
 * Output a success message
 */
export function outputSuccess(message: string): void {
  console.log(`✓ ${message}`);
}

/**
 * Output a warning message
 */
export function outputWarning(message: string): void {
  console.warn(`⚠ ${message}`);
}
