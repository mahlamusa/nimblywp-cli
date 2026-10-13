/**
 * NimblyWP API client
 *
 * Handles all HTTP communication with the NimblyWP REST API, including
 * authentication, error handling, and request/response formatting.
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiError, ApiResponse, ListResponse } from '../types/index.js';
import { getCurrentProfile } from './config.js';

export class ApiClient {
  private client: AxiosInstance;
  private apiUrl: string;
  private token?: string;

  constructor(apiUrl?: string, token?: string) {
    // Use provided values or load from current profile
    const profile = getCurrentProfile();
    this.apiUrl = apiUrl || profile?.apiUrl || process.env.NIMBLYWP_API_URL || '';
    this.token = token || profile?.token || process.env.NIMBLYWP_TOKEN;

    if (!this.apiUrl) {
      throw new Error(
        'No API URL configured. Run "nimbly auth login" or set NIMBLYWP_API_URL environment variable.'
      );
    }

    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        throw this.formatError(error);
      }
    );
  }

  /**
   * Format axios error into ApiError
   */
  private formatError(error: AxiosError): ApiError {
    if (error.response) {
      const data = error.response.data as { message?: string; error?: string };
      return {
        message: data.message || data.error || 'Request failed',
        status: error.response.status,
        code: error.code,
      };
    }

    if (error.request) {
      return {
        message: 'No response from server. Check your network connection.',
        code: error.code,
      };
    }

    return {
      message: error.message || 'Unknown error occurred',
      code: error.code,
    };
  }

  /**
   * GET request
   */
  async get<T>(path: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(path, { params });
      return { data: response.data };
    } catch (error) {
      return { error: error as ApiError };
    }
  }

  /**
   * POST request
   */
  async post<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(path, data);
      return { data: response.data };
    } catch (error) {
      return { error: error as ApiError };
    }
  }

  /**
   * PUT request
   */
  async put<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(path, data);
      return { data: response.data };
    } catch (error) {
      return { error: error as ApiError };
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(path, data);
      return { data: response.data };
    } catch (error) {
      return { error: error as ApiError };
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(path);
      return { data: response.data };
    } catch (error) {
      return { error: error as ApiError };
    }
  }

  /**
   * Get list with pagination
   */
  async getList<T>(
    path: string,
    params?: { page?: number; perPage?: number; [key: string]: unknown }
  ): Promise<ApiResponse<ListResponse<T>>> {
    return this.get<ListResponse<T>>(path, params);
  }
}

/**
 * Create a new API client instance
 */
export function createApiClient(apiUrl?: string, token?: string): ApiClient {
  return new ApiClient(apiUrl, token);
}
