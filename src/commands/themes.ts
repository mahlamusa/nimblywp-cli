/**
 * Theme commands
 *
 * Handles WordPress theme operations: list, install, activate, update, delete.
 */
import { Command } from 'commander';
import { createApiClient } from '../lib/api-client.js';
import { output, outputSuccess, outputError } from '../utils/output.js';
import { pollOperation } from '../utils/operations.js';
import type { Theme } from '../types/index.js';

export function registerThemeCommands(program: Command): void {
  const themes = program.command('themes').description('Manage WordPress themes');

  // List themes
  themes
    .command('list')
    .description('List installed themes')
    .argument('<site-id>', 'Site ID')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.get<{ themes: Theme[] }>(
          `/api/sites/${siteId}/themes`
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const themes = response.data?.themes || [];

        output(themes, options.output, [
          { key: 'slug', label: 'Slug' },
          { key: 'name', label: 'Name' },
          { key: 'version', label: 'Version' },
          { key: 'status', label: 'Status' },
          { key: 'updateAvailable', label: 'Update Available' },
        ]);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to list themes');
        process.exit(1);
      }
    });

  // Install theme
  themes
    .command('install')
    .description('Install a theme')
    .argument('<site-id>', 'Site ID')
    .argument('<theme-slug>', 'Theme slug')
    .option('--activate', 'Activate after installation')
    .option('-w, --wait', 'Wait for operation to complete')
    .action(async (siteId, themeSlug, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationId: string }>(
          `/api/sites/${siteId}/themes`,
          {
            slug: themeSlug,
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

        outputSuccess(`Theme ${themeSlug} installed successfully`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to install theme');
        process.exit(1);
      }
    });

  // Activate theme
  themes
    .command('activate')
    .description('Activate a theme')
    .argument('<site-id>', 'Site ID')
    .argument('<theme-slug>', 'Theme slug')
    .action(async (siteId, themeSlug) => {
      try {
        const client = createApiClient();
        const response = await client.post(
          `/api/sites/${siteId}/themes/${themeSlug}/activate`
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        outputSuccess(`Theme ${themeSlug} activated successfully`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to activate theme');
        process.exit(1);
      }
    });

  // Update theme
  themes
    .command('update')
    .description('Update theme(s)')
    .argument('<site-id>', 'Site ID')
    .argument('[theme-slug]', 'Theme slug (omit to update all)')
    .option('-w, --wait', 'Wait for operation to complete')
    .action(async (siteId, themeSlug, options) => {
      try {
        const client = createApiClient();
        const endpoint = themeSlug
          ? `/api/sites/${siteId}/themes/${themeSlug}/update`
          : `/api/sites/${siteId}/themes/update-all`;

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
          themeSlug ? `Theme ${themeSlug} updated successfully` : 'All themes updated successfully'
        );
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to update theme(s)');
        process.exit(1);
      }
    });

  // Delete theme
  themes
    .command('delete')
    .description('Delete a theme')
    .argument('<site-id>', 'Site ID')
    .argument('<theme-slug>', 'Theme slug')
    .action(async (siteId, themeSlug) => {
      try {
        const client = createApiClient();
        const response = await client.delete(
          `/api/sites/${siteId}/themes/${themeSlug}`
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        outputSuccess(`Theme ${themeSlug} deleted successfully`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to delete theme');
        process.exit(1);
      }
    });
}
