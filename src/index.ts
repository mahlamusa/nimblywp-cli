/**
 * NimblyWP CLI library exports
 *
 * Exports core functionality for programmatic use of the CLI.
 */
export { ApiClient, createApiClient } from './lib/api-client.js';
export {
  loadConfig,
  saveConfig,
  getCurrentProfile,
  getProfile,
  setProfile,
  useProfile,
  listProfiles,
  deleteProfile,
  getCurrentProfileName,
} from './lib/config.js';
export { output, outputError, outputSuccess, outputWarning } from './utils/output.js';
export { pollOperation, pollOperations } from './utils/operations.js';
export type * from './types/index.js';
