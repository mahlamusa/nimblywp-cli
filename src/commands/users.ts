/**
 * WordPress user management commands
 *
 * Handles WordPress user operations: list, create, update, delete.
 */
import { Command } from 'commander';
import { createApiClient } from '../lib/api-client.js';
import { output, outputSuccess, outputError } from '../utils/output.js';
import type { WordPressUser } from '../types/index.js';

export function registerUserCommands(program: Command): void {
  const users = program.command('users').description('Manage WordPress users');

  // List users
  users
    .command('list')
    .description('List WordPress users for a site')
    .argument('<site-id>', 'Site ID')
    .option('-r, --role <role>', 'Filter by role (administrator, editor, author, contributor, subscriber)')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const params = options.role ? { role: options.role } : {};
        const response = await client.get<{ users: WordPressUser[] }>(
          `/api/sites/${siteId}/users`,
          params
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        const users = response.data?.users || [];

        output(users, options.output, [
          { key: 'id', label: 'ID' },
          { key: 'username', label: 'Username' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'displayName', label: 'Display Name' },
        ]);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to list users');
        process.exit(1);
      }
    });

  // Get user
  users
    .command('get')
    .description('Get WordPress user details')
    .argument('<site-id>', 'Site ID')
    .argument('<user-id>', 'WordPress User ID')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, userId, options) => {
      try {
        const client = createApiClient();
        const response = await client.get<WordPressUser>(`/api/sites/${siteId}/users/${userId}`);

        if (response.error) {
          throw new Error(response.error.message);
        }

        output(response.data, options.output);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to get user');
        process.exit(1);
      }
    });

  // Create user
  users
    .command('create')
    .description('Create a WordPress user')
    .argument('<site-id>', 'Site ID')
    .requiredOption('-u, --username <username>', 'Username')
    .requiredOption('-e, --email <email>', 'Email address')
    .requiredOption('-p, --password <password>', 'Password')
    .option('-r, --role <role>', 'User role', 'subscriber')
    .option('-d, --display-name <name>', 'Display name')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, options) => {
      try {
        const client = createApiClient();
        const response = await client.post<{ user: WordPressUser }>(
          `/api/sites/${siteId}/users`,
          {
            username: options.username,
            email: options.email,
            password: options.password,
            role: options.role,
            displayName: options.displayName,
          }
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        output(response.data?.user, options.output);
        outputSuccess('User created successfully');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to create user');
        process.exit(1);
      }
    });

  // Update user
  users
    .command('update')
    .description('Update a WordPress user')
    .argument('<site-id>', 'Site ID')
    .argument('<user-id>', 'WordPress User ID')
    .option('-e, --email <email>', 'New email address')
    .option('-p, --password <password>', 'New password')
    .option('-r, --role <role>', 'New role')
    .option('-d, --display-name <name>', 'New display name')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (siteId, userId, options) => {
      try {
        const client = createApiClient();
        const updateData: Record<string, string> = {};

        if (options.email) updateData.email = options.email;
        if (options.password) updateData.password = options.password;
        if (options.role) updateData.role = options.role;
        if (options.displayName) updateData.displayName = options.displayName;

        if (Object.keys(updateData).length === 0) {
          outputError('No update options provided');
          process.exit(1);
        }

        const response = await client.patch<WordPressUser>(
          `/api/sites/${siteId}/users/${userId}`,
          updateData
        );

        if (response.error) {
          throw new Error(response.error.message);
        }

        output(response.data, options.output);
        outputSuccess('User updated successfully');
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to update user');
        process.exit(1);
      }
    });

  // Delete user
  users
    .command('delete')
    .description('Delete a WordPress user')
    .argument('<site-id>', 'Site ID')
    .argument('<user-id>', 'WordPress User ID')
    .option('--reassign <user-id>', 'Reassign posts to this user ID')
    .option('-f, --force', 'Skip confirmation prompt')
    .action(async (siteId, userId, options) => {
      try {
        // TODO: Add confirmation prompt if not forced

        const client = createApiClient();
        const params = options.reassign ? { reassign: options.reassign } : {};
        const response = await client.delete(`/api/sites/${siteId}/users/${userId}`, params);

        if (response.error) {
          throw new Error(response.error.message);
        }

        outputSuccess(`User ${userId} deleted successfully`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to delete user');
        process.exit(1);
      }
    });
}
