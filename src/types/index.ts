/**
 * Core type definitions for the NimblyWP CLI
 */

export interface Config {
  currentProfile: string;
  profiles: Record<string, Profile>;
}

export interface Profile {
  apiUrl: string;
  token?: string;
  name?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface Site {
  id: string;
  name: string;
  domain: string;
  status: 'pending' | 'running' | 'stopped' | 'error';
  phpVersion: string;
  wpVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface Snapshot {
  id: string;
  siteId: string;
  name: string;
  size: number;
  createdAt: string;
  status: 'pending' | 'complete' | 'failed';
}

export interface Template {
  id: string;
  name: string;
  description: string;
  visibility: 'public' | 'private';
  createdAt: string;
}

export interface Plugin {
  slug: string;
  name: string;
  version: string;
  status: 'active' | 'inactive';
  updateAvailable: boolean;
}

export interface Theme {
  slug: string;
  name: string;
  version: string;
  status: 'active' | 'inactive';
  updateAvailable: boolean;
}

export interface Deployment {
  id: string;
  siteId: string;
  repository: string;
  branch: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  createdAt: string;
}

export interface Operation {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  progress?: number;
  message?: string;
  result?: unknown;
  createdAt: string;
  completedAt?: string;
}

export interface CoreInfo {
  version: string;
  locale: string;
  updateAvailable: boolean;
  latestVersion?: string;
}

export interface DnsRecord {
  id: string;
  type: string;
  name: string;
  value: string;
  ttl: number;
  priority?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SslCertificate {
  enabled: boolean;
  status: 'active' | 'pending' | 'expired' | 'none';
  issuer?: string;
  expiresAt?: string;
  daysRemaining?: number;
  autoRenew: boolean;
}

export interface WordPressUser {
  id: number;
  username: string;
  email: string;
  role: string;
  displayName: string;
  registered: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
}

export interface ListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export type OutputFormat = 'table' | 'json' | 'yaml' | 'csv';

export interface CommandOptions {
  output?: OutputFormat;
  profile?: string;
  wait?: boolean;
  verbose?: boolean;
}
