/**
 * SSL certificate management commands
 *
 * Handles SSL certificate status, renewal, and configuration.
 */
import { Command } from 'commander';
import { createApiClient } from '../lib/api-client.js';
import { output, outputSuccess, outputError } from '../utils/output.js';
import { pollOperation } from '../utils/operations.js';
import type { SslCertificate } from '../types/index.js';

export function registerSslCommands(program: Command): void {
  const ssl = program.command('ssl').description('Manage SSL certificates');

  // Get SSL status
  ssl
    .command('status')
    .description('Check SSL certificate status for a site')
    .argument('<site-id>', 'Site ID')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.get<SslCertificate>(`/api/sites/${siteId}/ssl`);

        if (response.error) {
          throw new Error(response.error.message);
        }

        output(response.data, options.output);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to get SSL status');
        process.exit(1);
      }
    });

  // Renew SSL certificate
  ssl
    .command('renew')
    .description('Force SSL certificate renewal')
    .argument('<site-id>', 'Site ID')
    .option('-w, --wait', 'Wait for operation to complete')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationId: string }>(
          `/api/sites/${siteId}/ssl/renew`
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const { operationId } = response.data!;

        if (options.wait) {
          await pollOperation(client, operationId);

          // Fetch updated SSL info
          const sslResponse = await client.get<SslCertificate>(`/api/sites/${siteId}/ssl`);
          if (sslResponse.data) {
            output(sslResponse.data, options.output);
          }
        } else {
          console.log(`Operation ID: ${operationId}`);
        }

        outputSuccess('SSL certificate renewal initiated');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to renew SSL certificate');
        process.exit(1);
      }
    });

  // Enable SSL
  ssl
    .command('enable')
    .description('Enable SSL for a site')
    .argument('<site-id>', 'Site ID')
    .option('-w, --wait', 'Wait for operation to complete')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationId: string }>(
          `/api/sites/${siteId}/ssl/enable`
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

        outputSuccess('SSL enabled successfully');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to enable SSL');
        process.exit(1);
      }
    });

  // Disable SSL
  ssl
    .command('disable')
    .description('Disable SSL for a site')
    .argument('<site-id>', 'Site ID')
    .option('-w, --wait', 'Wait for operation to complete')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ operationId: string }>(
          `/api/sites/${siteId}/ssl/disable`
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

        outputSuccess('SSL disabled successfully');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to disable SSL');
        process.exit(1);
      }
    });

  // Verify SSL certificate
  ssl
    .command('verify')
    .description('Verify SSL certificate validity')
    .argument('<site-id>', 'Site ID')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.get<{
          valid: boolean;
          issuer: string;
          expiresAt: string;
          daysRemaining: number;
        }>(`/api/sites/${siteId}/ssl/verify`);

        if (response.error) {
          throw new Error(response.error.message);
        }

        output(response.data, options.output);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to verify SSL certificate');
        process.exit(1);
      }
    });
}
