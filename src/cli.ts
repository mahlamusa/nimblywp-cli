#!/usr/bin/env node
/**
 * NimblyWP CLI entry point
 *
 * Main command-line interface that registers all commands and handles global
 * options and error handling.
 */
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import command modules
import { registerAuthCommands } from './commands/auth.js';
import { registerSiteCommands } from './commands/sites.js';
import { registerSnapshotCommands } from './commands/snapshots.js';
import { registerTemplateCommands } from './commands/templates.js';
import { registerPluginCommands } from './commands/plugins.js';
import { registerThemeCommands } from './commands/themes.js';
import { registerDeploymentCommands } from './commands/deployments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf8')
);

const program = new Command();

program
  .name('nimbly')
  .description('Official command-line interface for NimblyWP')
  .version(packageJson.version)
  .option('-p, --profile <name>', 'Use specific profile')
  .option('-v, --verbose', 'Verbose output');

// Register all command groups
registerAuthCommands(program);
registerSiteCommands(program);
registerSnapshotCommands(program);
registerTemplateCommands(program);
registerPluginCommands(program);
registerThemeCommands(program);
registerDeploymentCommands(program);

// Global error handler
program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (error) {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
  throw error;
}
