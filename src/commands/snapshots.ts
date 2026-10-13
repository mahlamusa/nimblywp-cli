/**
 * Snapshot commands
 *
 * Handles backup and restore operations for WordPress sites.
 */
import { Command } from 'commander';
import { createApiClient } from '../lib/api-client.js';
import { output, outputSuccess, outputError } from '../utils/output.js';
import { pollOperation } from '../utils/operations.js';
import type { Snapshot } from '../types/index.js';

export function registerSnapshotCommands(program: Command): void {
  const snapshots = program.command('snapshots').description('Manage site snapshots (backups)');

  // List snapshots
  snapshots
    .command('list')
    .description('List snapshots for a site')
    .argument('<site-id>', 'Site ID')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.get<{ snapshots: Snapshot[] }>(
          `/api/sites/${siteId}/snapshots`
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const snapshots = response.data?.snapshots || [];

        output(snapshots, options.output, [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
          { key: 'size', label: 'Size (bytes)' },
          { key: 'status', label: 'Status' },
          { key: 'createdAt', label: 'Created' },
        ]);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to list snapshots');
        process.exit(1);
      }
    });

  // Create snapshot
  snapshots
    .command('create')
    .description('Create a new snapshot')
    .argument('<site-id>', 'Site ID')
    .option('-n, --name <name>', 'Snapshot name')
    .option('-w, --wait', 'Wait for operation to complete')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ snapshot: Snapshot; operationId: string }>(
          `/api/sites/${siteId}/snapshots`,
          {
            name: options.name,
          }
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { snapshot, operationId } = response.data!;

        if (options.wait) {
          await pollOperation(client, operationId);
          outputSuccess(`Snapshot ${snapshot.id} created successfully`);
        } else {
          console.log(`Snapshot ID: ${snapshot.id}`);
          console.log(`Operation ID: ${operationId}`);
          outputSuccess('Snapshot creation started');
        }
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to create snapshot');
        process.exit(1);
      }
    });

  // Restore snapshot
  snapshots
    .command('restore')
    .description('Restore a site from snapshot')
    .argument('<snapshot-id>', 'Snapshot ID')
    .option('-w, --wait', 'Wait for operation to complete')
    .action(async (snapshotId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationId: string }>(
          `/api/snapshots/${snapshotId}/restore`
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { operationId } = response.data!;

        if (options.wait) {
          await pollOperation(client, operationId);
          outputSuccess('Snapshot restored successfully');
        } else {
          console.log(`Operation ID: ${operationId}`);
          outputSuccess('Snapshot restore started');
        }
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to restore snapshot');
        process.exit(1);
      }
    });

  // Delete snapshot
  snapshots
    .command('delete')
    .description('Delete a snapshot')
    .argument('<snapshot-id>', 'Snapshot ID')
    .action(async (snapshotId) => {
      try {
        const client = createApiClient();
        const response = await client.delete(`/api/snapshots/${snapshotId}`);

        if (response.error) {
          throw new Error(response.error.message);
        }

        outputSuccess(`Snapshot ${snapshotId} deleted successfully`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to delete snapshot');
        process.exit(1);
      }
    });
}
