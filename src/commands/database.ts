/**
 * Database operation commands
 *
 * Handles database export, import, optimization, and management.
 */
import { Command } from 'commander';
import { createApiClient } from '../lib/api-client.js';
import { output, outputSuccess, outputError } from '../utils/output.js';
import { pollOperation } from '../utils/operations.js';

export function registerDatabaseCommands(program: Command): void {
  const database = program.command('database').alias('db').description('Manage site databases');

  // Export database
  database
    .command('export')
    .description('Export site database')
    .argument('<site-id>', 'Site ID')
    .option('--tables <tables...>', 'Specific tables to export')
    .option('--exclude-tables <tables...>', 'Tables to exclude from export')
    .option('-w, --wait', 'Wait for operation to complete')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationId: string; downloadUrl?: string }>(
          `/api/sites/${siteId}/database/export`,
          {
            tables: options.tables,
            excludeTables: options.excludeTables,
          }
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { operationId, downloadUrl } = response.data!;

        if (options.wait) {
          const operation = await pollOperation(client, operationId);

          if (operation?.result && typeof operation.result === 'object' && 'downloadUrl' in operation.result) {
            console.log('Database exported successfully');
            console.log(`Download URL: ${operation.result.downloadUrl}`);
          }
        } else {
          console.log(`Operation ID: ${operationId}`);
          if (downloadUrl) {
            console.log(`Download URL: ${downloadUrl}`);
          }
        }

        outputSuccess('Database export initiated');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to export database');
        process.exit(1);
      }
    });

  // Import database
  database
    .command('import')
    .description('Import database from SQL file')
    .argument('<site-id>', 'Site ID')
    .requiredOption('-f, --file <path>', 'Path to SQL file or URL')
    .option('-w, --wait', 'Wait for operation to complete')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationId: string }>(
          `/api/sites/${siteId}/database/import`,
          {
            source: options.file,
          }
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { operationId } = response.data!;

        if (options.wait) {
          await pollOperation(client, operationId);
        } else {
          console.log(`Operation ID: ${operationId}`);
        }

        outputSuccess('Database import initiated');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to import database');
        process.exit(1);
      }
    });

  // Optimize database
  database
    .command('optimize')
    .description('Optimize database tables')
    .argument('<site-id>', 'Site ID')
    .option('--tables <tables...>', 'Specific tables to optimize (default: all)')
    .option('-w, --wait', 'Wait for operation to complete')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationId: string }>(
          `/api/sites/${siteId}/database/optimize`,
          {
            tables: options.tables,
          }
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { operationId } = response.data!;

        if (options.wait) {
          await pollOperation(client, operationId);
        } else {
          console.log(`Operation ID: ${operationId}`);
        }

        outputSuccess('Database optimization initiated');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to optimize database');
        process.exit(1);
      }
    });

  // Repair database
  database
    .command('repair')
    .description('Repair database tables')
    .argument('<site-id>', 'Site ID')
    .option('--tables <tables...>', 'Specific tables to repair (default: all)')
    .option('-w, --wait', 'Wait for operation to complete')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationId: string }>(
          `/api/sites/${siteId}/database/repair`,
          {
            tables: options.tables,
          }
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { operationId } = response.data!;

        if (options.wait) {
          await pollOperation(client, operationId);
        } else {
          console.log(`Operation ID: ${operationId}`);
        }

        outputSuccess('Database repair initiated');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to repair database');
        process.exit(1);
      }
    });

  // Get database info
  database
    .command('info')
    .description('Get database information')
    .argument('<site-id>', 'Site ID')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.get<{
          name: string;
          size: number;
          tables: number;
          version: string;
        }>(`/api/sites/${siteId}/database/info`);

        if (response.error) {
          throw new Error(response.error.message);
        }

        output(response.data, options.output);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to get database info');
        process.exit(1);
      }
    });

  // Search and replace
  database
    .command('search-replace')
    .description('Search and replace in database')
    .argument('<site-id>', 'Site ID')
    .requiredOption('-s, --search <string>', 'Search string')
    .requiredOption('-r, --replace <string>', 'Replace string')
    .option('--tables <tables...>', 'Specific tables (default: all)')
    .option('--dry-run', 'Perform a dry run without making changes')
    .option('-w, --wait', 'Wait for operation to complete')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationId: string }>(
          `/api/sites/${siteId}/database/search-replace`,
          {
            search: options.search,
            replace: options.replace,
            tables: options.tables,
            dryRun: options.dryRun || false,
          }
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { operationId } = response.data!;

        if (options.wait) {
          const operation = await pollOperation(client, operationId);

          if (operation?.result) {
            output(operation.result, 'table');
          }
        } else {
          console.log(`Operation ID: ${operationId}`);
        }

        outputSuccess(
          options.dryRun
            ? 'Search and replace dry run completed'
            : 'Search and replace operation initiated'
        );
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to search and replace');
        process.exit(1);
      }
    });
}
