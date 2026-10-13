/**
 * WordPress Core management commands
 *
 * Handles WordPress core version updates and information retrieval.
 */
import { Command } from 'commander';
import { createApiClient } from '../lib/api-client.js';
import { output, outputSuccess, outputError } from '../utils/output.js';
import { pollOperation } from '../utils/operations.js';
import type { CoreInfo } from '../types/index.js';

export function registerCoreCommands(program: Command): void {
  const core = program.command('core').description('Manage WordPress core');

  // Get core info
  core
    .command('info')
    .description('Get WordPress core version information')
    .argument('<site-id>', 'Site ID')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.get<CoreInfo>(`/api/sites/${siteId}/core`);

        if (response.error) {
          throw new Error(response.error.message);
        }

        output(response.data, options.output);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to get core info');
        process.exit(1);
      }
    });

  // Update core
  core
    .command('update')
    .description('Update WordPress core version')
    .argument('<site-id>', 'Site ID')
    .option('-v, --version <version>', 'Target WordPress version (default: latest)')
    .option('-w, --wait', 'Wait for operation to complete')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationId: string }>(
          `/api/sites/${siteId}/core/update`,
          {
            version: options.version,
          }
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { operationId } = response.data!;

        if (options.wait) {
          await pollOperation(client, operationId);

          // Fetch updated core info
          const coreResponse = await client.get<CoreInfo>(`/api/sites/${siteId}/core`);
          if (coreResponse.data) {
            output(coreResponse.data, options.output);
          }
        } else {
          console.log(`Operation ID: ${operationId}`);
        }

        outputSuccess('WordPress core update initiated');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to update core');
        process.exit(1);
      }
    });

  // Check for updates
  core
    .command('check-update')
    .description('Check for available WordPress core updates')
    .argument('<site-id>', 'Site ID')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.get<{ available: boolean; current: string; latest: string }>(
          `/api/sites/${siteId}/core/check-update`
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        output(response.data, options.output);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to check for updates');
        process.exit(1);
      }
    });
}
