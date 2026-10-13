/**
 * Tests for configuration management
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, unlinkSync, mkdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  loadConfig,
  saveConfig,
  setProfile,
  getProfile,
  listProfiles,
  getCurrentProfileName,
} from '../../src/lib/config.js';

describe('Config Management', () => {
  const testConfigDir = join(tmpdir(), '.nimblywp-test-' + Date.now());
  const testConfigFile = join(testConfigDir, 'config.json');

  beforeEach(() => {
    // Mock the config directory
    process.env.HOME = tmpdir();
    if (!existsSync(testConfigDir)) {
      mkdirSync(testConfigDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Cleanup
    if (existsSync(testConfigFile)) {
      unlinkSync(testConfigFile);
    }
    if (existsSync(testConfigDir)) {
      rmdirSync(testConfigDir);
    }
  });

  it('should load default config when file does not exist', () => {
    const config = loadConfig();
    expect(config).toBeDefined();
    expect(config.currentProfile).toBe('default');
    expect(config.profiles).toEqual({});
  });

  it('should save and load config', () => {
    const testConfig = {
      currentProfile: 'test',
      profiles: {
        test: {
          apiUrl: 'https://test.api',
          token: 'test-token',
        },
      },
    };

    saveConfig(testConfig);
    const loaded = loadConfig();

    expect(loaded.currentProfile).toBe('test');
    expect(loaded.profiles.test).toBeDefined();
    expect(loaded.profiles.test.apiUrl).toBe('https://test.api');
  });

  it('should set and get profile', () => {
    setProfile('myprofile', {
      apiUrl: 'https://my.api',
      token: 'my-token',
    });

    const profile = getProfile('myprofile');
    expect(profile).toBeDefined();
    expect(profile?.apiUrl).toBe('https://my.api');
    expect(profile?.token).toBe('my-token');
  });

  it('should list all profiles', () => {
    setProfile('profile1', { apiUrl: 'url1' });
    setProfile('profile2', { apiUrl: 'url2' });

    const profiles = listProfiles();
    expect(profiles).toContain('profile1');
    expect(profiles).toContain('profile2');
    expect(profiles).toHaveLength(2);
  });

  it('should get current profile name', () => {
    const config = loadConfig();
    const currentName = getCurrentProfileName();
    expect(currentName).toBe(config.currentProfile);
  });
});
