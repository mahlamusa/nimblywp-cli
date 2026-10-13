/**
 * Plugin commands
 *
 * Handles WordPress plugin operations: list, install, activate, deactivate, update, delete.
 */
import { Command } from 'commander';
import { createApiClient } from '../lib/api-client.js';
import { output, outputSuccess, outputError } from '../utils/output.js';
import { pollOperation } from '../utils/operations.js';
import type { Plugin } from '../types/index.js';

export function registerPluginCommands(program: Command): void {
  const plugins = program.command('plugins').description('Manage WordPress plugins');

  // List plugins
  plugins
    .command('list')
    .description('List installed plugins')
    .argument('<site-id>', 'Site ID')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.get<{ plugins: Plugin[] }>(
          `/api/sites/${siteId}/plugins`
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const plugins = response.data?.plugins || [];

        output(plugins, options.output, [
          { key: 'slug', label: 'Slug' },
          { key: 'name', label: 'Name' },
          { key: 'version', label: 'Version' },
          { key: 'status', label: 'Status' },
          { key: 'updateAvailable', label: 'Update Available' },
        ]);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to list plugins');
        process.exit(1);
      }
    });

  // Install plugin
  plugins
    .command('install')
    .description('Install a plugin')
    .argument('<site-id>', 'Site ID')
    .argument('<plugin-slug>', 'Plugin slug')
    .option('--activate', 'Activate after installation')
    .option('-w, --wait', 'Wait for operation to complete')
    .action(async (siteId, pluginSlug, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationId: string }>(
          `/api/sites/${siteId}/plugins`,
          {
            slug: pluginSlug,
            activate: options.activate,
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

        outputSuccess(`Plugin ${pluginSlug} installed successfully`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to install plugin');
        process.exit(1);
      }
    });

  // Activate plugin
  plugins
    .command('activate')
    .description('Activate a plugin')
    .argument('<site-id>', 'Site ID')
    .argument('<plugin-slug>', 'Plugin slug')
    .action(async (siteId, pluginSlug) => {
      try {
        const client = createApiClient();
        const response = await client.post(
          `/api/sites/${siteId}/plugins/${pluginSlug}/activate`
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        outputSuccess(`Plugin ${pluginSlug} activated successfully`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to activate plugin');
        process.exit(1);
      }
    });

  // Deactivate plugin
  plugins
    .command('deactivate')
    .description('Deactivate a plugin')
    .argument('<site-id>', 'Site ID')
    .argument('<plugin-slug>', 'Plugin slug')
    .action(async (siteId, pluginSlug) => {
      try {
        const client = createApiClient();
        const response = await client.post(
          `/api/sites/${siteId}/plugins/${pluginSlug}/deactivate`
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        outputSuccess(`Plugin ${pluginSlug} deactivated successfully`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to deactivate plugin');
        process.exit(1);
      }
    });

  // Update plugin
  plugins
    .command('update')
    .description('Update plugin(s)')
    .argument('<site-id>', 'Site ID')
    .argument('[plugin-slug]', 'Plugin slug (omit to update all)')
    .option('-w, --wait', 'Wait for operation to complete')
    .action(async (siteId, pluginSlug, options) => {
      try {
        const client = createApiClient();
        const endpoint = pluginSlug
          ? `/api/sites/${siteId}/plugins/${pluginSlug}/update`
          : `/api/sites/${siteId}/plugins/update-all`;

        const response = await client.post<{ operationId: string }>(endpoint);

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { operationId } = response.data!;

        if (options.wait) {
          await pollOperation(client, operationId);
        } else {
          console.log(`Operation ID: ${operationId}`);
        }

        outputSuccess(
          pluginSlug ? `Plugin ${pluginSlug} updated successfully` : 'All plugins updated successfully'
        );
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to update plugin(s)');
        process.exit(1);
      }
    });

  // Delete plugin
  plugins
    .command('delete')
    .description('Delete a plugin')
    .argument('<site-id>', 'Site ID')
    .argument('<plugin-slug>', 'Plugin slug')
    .action(async (siteId, pluginSlug) => {
      try {
        const client = createApiClient();
        const response = await client.delete(
          `/api/sites/${siteId}/plugins/${pluginSlug}`
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        outputSuccess(`Plugin ${pluginSlug} deleted successfully`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to delete plugin');
        process.exit(1);
      }
    });
}
