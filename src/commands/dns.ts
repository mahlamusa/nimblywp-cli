/**
 * DNS management commands
 *
 * Handles DNS record management for WordPress sites.
 */
import { Command } from 'commander';
import { createApiClient } from '../lib/api-client.js';
import { output, outputSuccess, outputError } from '../utils/output.js';
import type { DnsRecord } from '../types/index.js';

export function registerDnsCommands(program: Command): void {
  const dns = program.command('dns').description('Manage DNS records');

  // List DNS records
  dns
    .command('list')
    .description('List DNS records for a site')
    .argument('<site-id>', 'Site ID')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.get<{ records: DnsRecord[] }>(
          `/api/sites/${siteId}/dns`
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const records = response.data?.records || [];

        output(records, options.output, [
          { key: 'id', label: 'ID' },
          { key: 'type', label: 'Type' },
          { key: 'name', label: 'Name' },
          { key: 'value', label: 'Value' },
          { key: 'ttl', label: 'TTL' },
        ]);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to list DNS records');
        process.exit(1);
      }
    });

  // Get DNS record
  dns
    .command('get')
    .description('Get details of a DNS record')
    .argument('<record-id>', 'DNS Record ID')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (recordId, options) => {
      try {
        const client = createApiClient();
        const response = await client.get<DnsRecord>(`/api/dns/${recordId}`);

        if (response.error) {
          throw new Error(response.error.message);
        }

        output(response.data, options.output);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to get DNS record');
        process.exit(1);
      }
    });

  // Create DNS record
  dns
    .command('create')
    .description('Create a DNS record for a site')
    .argument('<site-id>', 'Site ID')
    .requiredOption('-t, --type <type>', 'Record type (A, AAAA, CNAME, MX, TXT, etc.)')
    .requiredOption('-n, --name <name>', 'Record name')
    .requiredOption('-v, --value <value>', 'Record value')
    .option('--ttl <seconds>', 'TTL in seconds', '3600')
    .option('--priority <number>', 'Priority (for MX records)')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ record: DnsRecord }>(
          `/api/sites/${siteId}/dns`,
          {
            type: options.type.toUpperCase(),
            name: options.name,
            value: options.value,
            ttl: parseInt(options.ttl),
            priority: options.priority ? parseInt(options.priority) : undefined,
          }
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        output(response.data?.record, options.output);
        outputSuccess('DNS record created successfully');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to create DNS record');
        process.exit(1);
      }
    });

  // Update DNS record
  dns
    .command('update')
    .description('Update a DNS record')
    .argument('<record-id>', 'DNS Record ID')
    .option('-v, --value <value>', 'New record value')
    .option('--ttl <seconds>', 'New TTL in seconds')
    .option('--priority <number>', 'New priority (for MX records)')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (recordId, options) => {
      try {
        const client = createApiClient();
        const updateData: Record<string, string | number> = {};

        if (options.value) updateData.value = options.value;
        if (options.ttl) updateData.ttl = parseInt(options.ttl);
        if (options.priority) updateData.priority = parseInt(options.priority);

        if (Object.keys(updateData).length === 0) {
          outputError('No update options provided');
          process.exit(1);
        }

        const response = await client.patch<DnsRecord>(`/api/dns/${recordId}`, updateData);

        if (response.error) {
          throw new Error(response.error.message);
        }

        output(response.data, options.output);
        outputSuccess('DNS record updated successfully');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to update DNS record');
        process.exit(1);
      }
    });

  // Delete DNS record
  dns
    .command('delete')
    .description('Delete a DNS record')
    .argument('<record-id>', 'DNS Record ID')
    .option('-f, --force', 'Skip confirmation prompt')
    .action(async (recordId, options) => {
      try {
        // TODO: Add confirmation prompt if not forced

        const client = createApiClient();
        const response = await client.delete(`/api/dns/${recordId}`);

        if (response.error) {
          throw new Error(response.error.message);
        }

        outputSuccess(`DNS record ${recordId} deleted successfully`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to delete DNS record');
        process.exit(1);
      }
    });
}
