/**
 * Operation polling utilities
 *
 * Handles polling long-running async operations (202 Accepted pattern) with
 * progress feedback via spinner.
 */
import ora, { Ora } from 'ora';
import type { Operation } from '../types/index.js';
import { ApiClient } from '../lib/api-client.js';

export interface PollOptions {
  interval?: number; // Polling interval in ms (default: 1000)
  timeout?: number; // Max wait time in ms (default: 300000 = 5 minutes)
  spinner?: boolean; // Show spinner (default: true)
}

/**
 * Poll an operation until completion
 *
 * @param client API client instance
 * @param operationId Operation ID to poll
 * @param options Polling options
 *
 * @return The completed operation
 *
 * @throws Error if operation times out or fails
 */
export async function pollOperation(
  client: ApiClient,
  operationId: string,
  options: PollOptions = {}
): Promise<Operation> {
  const { interval = 1000, timeout = 300000, spinner = true } = options;

  let spinnerInstance: Ora | null = null;
  if (spinner) {
    spinnerInstance = ora('Operation in progress...').start();
  }

  const startTime = Date.now();

  while (true) {
    // Check timeout
    if (Date.now() - startTime > timeout) {
      spinnerInstance?.fail('Operation timed out');
      throw new Error('Operation timed out');
    }

    // Poll operation status
    const response = await client.get<Operation>(`/api/operations/${operationId}`);

    if (response.error) {
      spinnerInstance?.fail('Failed to check operation status');
      throw new Error(response.error.message);
    }

    const operation = response.data!;

    // Update spinner with progress
    if (spinnerInstance && operation.progress !== undefined) {
      spinnerInstance.text = `Operation in progress... ${operation.progress}%`;
    }

    if (spinnerInstance && operation.message) {
      spinnerInstance.text = operation.message;
    }

    // Check if complete
    if (operation.status === 'success') {
      spinnerInstance?.succeed('Operation completed successfully');
      return operation;
    }

    if (operation.status === 'failed') {
      spinnerInstance?.fail('Operation failed');
      throw new Error(operation.message || 'Operation failed');
    }

    // Wait before next poll
    await sleep(interval);
  }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for multiple operations to complete
 *
 * @param client API client instance
 * @param operationIds Array of operation IDs
 * @param options Polling options
 *
 * @return Array of completed operations
 */
export async function pollOperations(
  client: ApiClient,
  operationIds: string[],
  options: PollOptions = {}
): Promise<Operation[]> {
  return Promise.all(operationIds.map((id) => pollOperation(client, id, options)));
}
