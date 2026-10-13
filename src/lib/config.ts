/**
 * Configuration management for NimblyWP CLI
 *
 * Handles profile storage, retrieval, and switching. Configuration is stored
 * in `~/.nimblywp/config.json` with support for multiple profiles.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type { Config, Profile } from '../types/index.js';

const CONFIG_DIR = join(homedir(), '.nimblywp');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG: Config = {
  currentProfile: 'default',
  profiles: {},
};

/**
 * Ensure the configuration directory exists
 */
function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Load configuration from disk
 *
 * @return The current configuration, or default if none exists
 */
export function loadConfig(): Config {
  ensureConfigDir();

  if (!existsSync(CONFIG_FILE)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const content = readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('Failed to load config, using defaults:', error);
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Save configuration to disk
 *
 * @param config Configuration to save
 */
export function saveConfig(config: Config): void {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

/**
 * Get the current active profile
 *
 * @return The active profile, or undefined if none exists
 */
export function getCurrentProfile(): Profile | undefined {
  const config = loadConfig();
  return config.profiles[config.currentProfile];
}

/**
 * Get a specific profile by name
 *
 * @param name Profile name
 *
 * @return The profile, or undefined if not found
 */
export function getProfile(name: string): Profile | undefined {
  const config = loadConfig();
  return config.profiles[name];
}

/**
 * Set or update a profile
 *
 * @param name Profile name
 * @param profile Profile data
 */
export function setProfile(name: string, profile: Profile): void {
  const config = loadConfig();
  config.profiles[name] = profile;
  saveConfig(config);
}

/**
 * Switch to a different profile
 *
 * @param name Profile name to switch to
 *
 * @throws Error if profile doesn't exist
 */
export function useProfile(name: string): void {
  const config = loadConfig();

  if (!config.profiles[name]) {
    throw new Error(`Profile "${name}" does not exist`);
  }

  config.currentProfile = name;
  saveConfig(config);
}

/**
 * List all configured profiles
 *
 * @return Array of profile names
 */
export function listProfiles(): string[] {
  const config = loadConfig();
  return Object.keys(config.profiles);
}

/**
 * Delete a profile
 *
 * @param name Profile name to delete
 *
 * @throws Error if trying to delete the current profile
 */
export function deleteProfile(name: string): void {
  const config = loadConfig();

  if (config.currentProfile === name) {
    throw new Error('Cannot delete the current profile. Switch to another profile first.');
  }

  delete config.profiles[name];
  saveConfig(config);
}

/**
 * Get the current profile name
 *
 * @return The current profile name
 */
export function getCurrentProfileName(): string {
  const config = loadConfig();
  return config.currentProfile;
}
