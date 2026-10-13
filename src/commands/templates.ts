/**
 * Template commands
 *
 * Handles site template operations: list, deploy, manage.
 */
import { Command } from 'commander';
import { createApiClient } from '../lib/api-client.js';
import { output, outputSuccess, outputError } from '../utils/output.js';
import { pollOperation } from '../utils/operations.js';
import type { Template, Site } from '../types/index.js';

export function registerTemplateCommands(program: Command): void {
  const templates = program.command('templates').description('Manage site templates');

  // List templates
  templates
    .command('list')
    .description('List available templates')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (options) => {
      try {
        const client = createApiClient();
        const response = await client.get<{ templates: Template[] }>('/api/templates');

        if (response.error) {
          throw new Error(response.error.message);
        }

        const templates = response.data?.templates || [];

        output(templates, options.output, [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
          { key: 'description', label: 'Description' },
          { key: 'visibility', label: 'Visibility' },
        ]);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to list templates');
        process.exit(1);
      }
    });

  // Deploy from template
  templates
    .command('deploy')
    .description('Deploy a site from template')
    .argument('<template-id>', 'Template ID')
    .requiredOption('-n, --name <name>', 'Site name')
    .option('-d, --domain <domain>', 'Custom domain')
    .option('-w, --wait', 'Wait for operation to complete')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (templateId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ site: Site; operationId: string }>(
          `/api/templates/${templateId}/deploy`,
          {
            name: options.name,
            domain: options.domain,
          }
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { site, operationId } = response.data!;

        if (options.wait) {
          await pollOperation(client, operationId);

          // Fetch updated site
          const siteResponse = await client.get<Site>(`/api/sites/${site.id}`);
          if (siteResponse.data) {
            output(siteResponse.data, options.output);
          }
        } else {
          output(site, options.output);
          console.log(`\nOperation ID: ${operationId}`);
        }

        outputSuccess('Template deployed successfully');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to deploy template');
        process.exit(1);
      }
    });
}
