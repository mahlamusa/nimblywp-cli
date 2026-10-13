/**
 * Authentication commands
 *
 * Handles login, logout, profile management, and authentication configuration.
 */
import { Command } from 'commander';
import inquirer from 'inquirer';
import {
  setProfile,
  useProfile,
  listProfiles,
  deleteProfile,
  getCurrentProfileName,
  getProfile,
} from '../lib/config.js';
import { createApiClient } from '../lib/api-client.js';
import { output, outputSuccess, outputError } from '../utils/output.js';

export function registerAuthCommands(program: Command): void {
  const auth = program.command('auth').description('Authentication and profile management');

  // Login command
  auth
    .command('login')
    .description('Login to NimblyWP')
    .option('-t, --token <token>', 'API token (skip interactive login)')
    .option('-u, --url <url>', 'API URL', 'https://api.nimblywp.com')
    .option('-p, --profile <name>', 'Profile name', 'default')
    .action(async (options) => {
      try {
        let token = options.token;

        // Interactive login if no token provided
        if (!token) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'apiUrl',
              message: 'API URL:',
              default: options.url,
            },
            {
              type: 'password',
              name: 'token',
              message: 'API Token:',
              mask: '*',
            },
          ]);

          token = answers.token;
          options.url = answers.apiUrl;
        }

        // Validate credentials by making a test request
        const client = createApiClient(options.url, token);
        const response = await client.get('/api/user/profile');

        if (response.error) {
          throw new Error(`Authentication failed: ${response.error.message}`);
        }

        // Save profile
        setProfile(options.profile, {
          apiUrl: options.url,
          token,
        });

        // Switch to this profile if not default
        if (options.profile !== getCurrentProfileName()) {
          useProfile(options.profile);
        }

        outputSuccess(`Logged in successfully as profile "${options.profile}"`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Login failed');
        process.exit(1);
      }
    });

  // Logout command
  auth
    .command('logout')
    .description('Logout (remove current profile)')
    .option('-p, --profile <name>', 'Profile to logout')
    .action(async (options) => {
      try {
        const profileName = options.profile || getCurrentProfileName();

        if (profileName === getCurrentProfileName() && listProfiles().length > 1) {
          outputError(
            'Cannot delete current profile when other profiles exist. Switch profiles first with "nimbly auth use <profile>"'
          );
          process.exit(1);
        }

        deleteProfile(profileName);
        outputSuccess(`Logged out profile "${profileName}"`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Logout failed');
        process.exit(1);
      }
    });

  // Use profile command
  auth
    .command('use')
    .description('Switch to a different profile')
    .argument('<profile>', 'Profile name')
    .action(async (profileName) => {
      try {
        useProfile(profileName);
        outputSuccess(`Switched to profile "${profileName}"`);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to switch profile');
        process.exit(1);
      }
    });

  // List profiles command
  auth
    .command('profiles')
    .description('List all configured profiles')
    .option('-o, --output <format>', 'Output format (table|json|yaml|csv)', 'table')
    .action(async (options) => {
      try {
        const profiles = listProfiles();
        const current = getCurrentProfileName();

        const data = profiles.map((name) => {
          const profile = getProfile(name);
          return {
            name,
            current: name === current ? 'Yes' : 'No',
            apiUrl: profile?.apiUrl || '-',
          };
        });

        output(data, options.output, [
          { key: 'name', label: 'Profile' },
          { key: 'current', label: 'Current' },
          { key: 'apiUrl', label: 'API URL' },
        ]);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to list profiles');
        process.exit(1);
      }
    });

  // Whoami command
  auth
    .command('whoami')
    .description('Show current authentication info')
    .action(async () => {
      try {
        const profileName = getCurrentProfileName();
        const profile = getProfile(profileName);

        if (!profile) {
          outputError('Not logged in. Run "nimbly auth login" first.');
          process.exit(1);
        }

        const client = createApiClient();
        const response = await client.get('/api/user/profile');

        if (response.error) {
          throw new Error(response.error.message);
        }

        console.log(`Profile: ${profileName}`);
        console.log(`API URL: ${profile.apiUrl}`);
        console.log(`User:`, response.data);
      } catch (error) {
        outputError(error instanceof Error ? error.message : 'Failed to get user info');
        process.exit(1);
      }
    });
}
