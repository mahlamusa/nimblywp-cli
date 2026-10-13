/**
 * Deployment commands
 *
 * Handles Git-based deployment automation for WordPress sites.
 */
import { Command } from 'commander';
import { createApiClient } from '../lib/api-client.js';
import { output, outputSuccess, outputError } from '../utils/output.js';
import { pollOperation } from '../utils/operations.js';
import type { Deployment } from '../types/index.js';

export function registerDeploymentCommands(program: Command): void {
  const deployments = program.command('deployments').description('Manage Git deployments');

  // List deployments
  deployments
    .command('list')
    .description('List deployments for a site')
    .argument('<site-id>', 'Site ID')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.get<{ deployments: Deployment[] }>(
          `/api/sites/${siteId}/deployments`
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const deployments = response.data?.deployments || [];

        output(deployments, options.output, [
          { key: 'id', label: 'ID' },
          { key: 'repository', label: 'Repository' },
          { key: 'branch', label: 'Branch' },
          { key: 'status', label: 'Status' },
          { key: 'createdAt', label: 'Created' },
        ]);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to list deployments');
        process.exit(1);
      }
    });

  // Create deployment
  deployments
    .command('create')
    .description('Create a new deployment configuration')
    .argument('<site-id>', 'Site ID')
    .requiredOption('-r, --repo <url>', 'Git repository URL')
    .option('-b, --branch <name>', 'Git branch', 'main')
    .option('-p, --path <path>', 'Deploy path within repository')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ deployment: Deployment }>(
          `/api/sites/${siteId}/deployments`,
          {
            repository: options.repo,
            branch: options.branch,
            path: options.path,
          }
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        output(response.data?.deployment, options.output);
        outputSuccess('Deployment configuration created successfully');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to create deployment');
        process.exit(1);
      }
    });

  // Trigger deployment
  deployments
    .command('trigger')
    .description('Trigger a deployment')
    .argument('<deployment-id>', 'Deployment ID')
    .option('-w, --wait', 'Wait for operation to complete')
    .action(async (deploymentId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationId: string }>(
          `/api/deployments/${deploymentId}/trigger`
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

        outputSuccess('Deployment triggered successfully');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to trigger deployment');
        process.exit(1);
      }
    });

  // Delete deployment
  deployments
    .command('delete')
    .description('Delete a deployment configuration')
    .argument('<deployment-id>', 'Deployment ID')
    .action(async (deploymentId) => {
      try {
        const client = createApiClient();
        const response = await client.delete(`/api/deployments/${deploymentId}`);

        if (response.error) {
          throw new Error(response.error.message);
        }

        outputSuccess(`Deployment ${deploymentId} deleted successfully`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to delete deployment');
        process.exit(1);
      }
    });
}
