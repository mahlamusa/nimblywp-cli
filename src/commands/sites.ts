/**
 * Site management commands
 *
 * Handles WordPress site operations: create, list, get, update, delete, start, stop.
 */
import { Command } from 'commander';
import { createApiClient } from '../lib/api-client.js';
import { output, outputSuccess, outputError } from '../utils/output.js';
import { pollOperation } from '../utils/operations.js';
import type { Site } from '../types/index.js';

export function registerSiteCommands(program: Command): void {
  const sites = program.command('sites').description('Manage WordPress sites');

  // List sites
  sites
    .command('list')
    .description('List all WordPress sites')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .option('--page <number>', 'Page number', '1')
    .option('--per-page <number>', 'Items per page', '20')
    .action(async (options) => {
      try {
        const client = createApiClient();
        const response = await client.getList<Site>('/api/sites', {
          page: parseInt(options.page),
          perPage: parseInt(options.perPage),
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        const sites = response.data?.data || [];

        output(sites, options.output, [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
          { key: 'domain', label: 'Domain' },
          { key: 'status', label: 'Status' },
          { key: 'phpVersion', label: 'PHP' },
          { key: 'wpVersion', label: 'WordPress' },
        ]);

        if (response.data?.pagination) {
          const { page, totalPages, total } = response.data.pagination;
          console.log(`\nPage ${page} of ${totalPages} (${total} total)`);
        }
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to list sites');
        process.exit(1);
      }
    });

  // Get site
  sites
    .command('get')
    .description('Get site details')
    .argument('<site-id>', 'Site ID')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.get<Site>(`/api/sites/${siteId}`);

        if (response.error) {
          throw new Error(response.error.message);
        }

        output(response.data, options.output);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to get site');
        process.exit(1);
      }
    });

  // Create site
  sites
    .command('create')
    .description('Create a new WordPress site')
    .requiredOption('-n, --name <name>', 'Site name')
    .option('-d, --domain <domain>', 'Custom domain')
    .option('--php <version>', 'PHP version', '8.2')
    .option('--wp <version>', 'WordPress version', 'latest')
    .option('-w, --wait', 'Wait for operation to complete')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ site: Site; operationId?: string }>('/api/sites', {
          name: options.name,
          domain: options.domain,
          phpVersion: options.php,
          wpVersion: options.wp,
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { site, operationId } = response.data!;

        // Wait for operation if requested
        if (options.wait && operationId) {
          await pollOperation(client, operationId);

          // Fetch updated site
          const siteResponse = await client.get<Site>(`/api/sites/${site.id}`);
          if (siteResponse.data) {
            output(siteResponse.data, options.output);
          }
        } else {
          output(site, options.output);
          if (operationId) {
            console.log(`\nOperation ID: ${operationId}`);
            console.log('Use --wait to wait for completion or check status with: nimbly operations get ' + operationId);
          }
        }

        outputSuccess('Site created successfully');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to create site');
        process.exit(1);
      }
    });

  // Update site
  sites
    .command('update')
    .description('Update site configuration')
    .argument('<site-id>', 'Site ID')
    .option('-n, --name <name>', 'New site name')
    .option('-d, --domain <domain>', 'New domain')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const updateData: Record<string, string> = {};

        if (options.name) updateData.name = options.name;
        if (options.domain) updateData.domain = options.domain;

        if (Object.keys(updateData).length === 0) {
          outputError('No update options provided');
          process.exit(1);
        }

        const response = await client.patch<Site>(`/api/sites/${siteId}`, updateData);

        if (response.error) {
          throw new Error(response.error.message);
        }

        output(response.data, options.output);
        outputSuccess('Site updated successfully');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to update site');
        process.exit(1);
      }
    });

  // Delete site
  sites
    .command('delete')
    .description('Delete a WordPress site')
    .argument('<site-id>', 'Site ID')
    .option('-f, --force', 'Skip confirmation prompt')
    .action(async (siteId, options) => {
      try {
        // TODO: Add confirmation prompt if not forced

        const client = createApiClient();
        const response = await client.delete(`/api/sites/${siteId}`);

        if (response.error) {
          throw new Error(response.error.message);
        }

        outputSuccess(`Site ${siteId} deleted successfully`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to delete site');
        process.exit(1);
      }
    });

  // Start site
  sites
    .command('start')
    .description('Start a stopped site')
    .argument('<site-id>', 'Site ID')
    .option('-w, --wait', 'Wait for operation to complete')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationId: string }>(`/api/sites/${siteId}/start`);

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { operationId } = response.data!;

        if (options.wait) {
          await pollOperation(client, operationId);
        } else {
          console.log(`Operation ID: ${operationId}`);
        }

        outputSuccess(`Site ${siteId} started successfully`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to start site');
        process.exit(1);
      }
    });

  // Stop site
  sites
    .command('stop')
    .description('Stop a running site')
    .argument('<site-id>', 'Site ID')
    .option('-w, --wait', 'Wait for operation to complete')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationId: string }>(`/api/sites/${siteId}/stop`);

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { operationId } = response.data!;

        if (options.wait) {
          await pollOperation(client, operationId);
        } else {
          console.log(`Operation ID: ${operationId}`);
        }

        outputSuccess(`Site ${siteId} stopped successfully`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to stop site');
        process.exit(1);
      }
    });
}
