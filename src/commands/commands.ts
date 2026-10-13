/**
 * WP-CLI command execution
 *
 * Handles remote execution of WP-CLI commands on WordPress sites.
 */
import { Command } from 'commander';
import { createApiClient } from '../lib/api-client.js';
import { output, outputSuccess, outputError } from '../utils/output.js';
import { pollOperation } from '../utils/operations.js';

export function registerCommandExecutionCommands(program: Command): void {
  const commands = program.command('commands').description('Execute WP-CLI commands remotely');

  // List available commands
  commands
    .command('list')
    .description('List available WP-CLI commands')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (options) => {
      try {
        const client = createApiClient();
        const response = await client.get<{ commands: string[] }>('/api/commands/available');

        if (response.error) {
          throw new Error(response.error.message);
        }

        const commandList = response.data?.commands || [];
        const formatted = commandList.map((cmd) => ({ command: cmd }));

        output(formatted, options.output, [{ key: 'command', label: 'Available Commands' }]);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to list commands');
        process.exit(1);
      }
    });

  // Run command
  commands
    .command('run')
    .description('Execute a WP-CLI command on a site')
    .argument('<site-id>', 'Site ID')
    .argument('<command>', 'WP-CLI command to execute (e.g., "option get siteurl")')
    .option('-w, --wait', 'Wait for operation to complete')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, command, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationId: string; result?: unknown }>(
          `/api/sites/${siteId}/commands/run`,
          {
            command,
          }
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { operationId, result } = response.data!;

        if (options.wait) {
          const operation = await pollOperation(client, operationId);

          // Output the command result
          if (operation?.result) {
            if (typeof operation.result === 'string') {
              console.log(operation.result);
            } else {
              output(operation.result, options.output);
            }
          }
        } else {
          if (result) {
            if (typeof result === 'string') {
              console.log(result);
            } else {
              output(result, options.output);
            }
          }
          if (operationId) {
            console.log(`\nOperation ID: ${operationId}`);
          }
        }

        outputSuccess('Command executed successfully');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to execute command');
        process.exit(1);
      }
    });

  // Run batch commands
  commands
    .command('batch')
    .description('Execute multiple WP-CLI commands in sequence')
    .argument('<site-id>', 'Site ID')
    .requiredOption('-c, --commands <commands...>', 'WP-CLI commands to execute')
    .option('-w, --wait', 'Wait for all operations to complete')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationIds: string[] }>(
          `/api/sites/${siteId}/commands/batch`,
          {
            commands: options.commands,
          }
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { operationIds } = response.data!;

        if (options.wait) {
          // Poll all operations
          for (const opId of operationIds) {
            await pollOperation(client, opId);
          }
        } else {
          console.log('Operation IDs:');
          operationIds.forEach((id, index) => {
            console.log(`  ${index + 1}. ${id}`);
          });
        }

        outputSuccess(`Batch execution initiated (${operationIds.length} commands)`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to execute batch commands');
        process.exit(1);
      }
    });
}
