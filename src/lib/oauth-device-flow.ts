/**
 * OAuth 2.0 Device Authorization Grant Flow (RFC 8628)
 *
 * Implements device flow for CLI authentication without requiring
 * users to manually copy/paste API tokens.
 */
import open from 'open';
import ora from 'ora';
import { createApiClient } from './api-client.js';

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
}

/**
 * Perform OAuth device flow login
 *
 * @param apiUrl - Base URL of the NimblyWP API
 * @param scope - OAuth scopes to request (default: 'read write')
 * @returns Access token
 */
export async function deviceFlowLogin(
  apiUrl: string,
  scope: string = 'read write'
): Promise<string> {
  const client = createApiClient(apiUrl);

  // Step 1: Request device code from authorization server
  const deviceCodeResp = await client.post<DeviceCodeResponse>('/api/v1/oauth/device/code', {
    client_id: 'nimblywp-cli',
    scope,
  });

  if (deviceCodeResp.error) {
    throw new Error(`Failed to initiate device flow: ${deviceCodeResp.error.message}`);
  }

  const deviceCode = deviceCodeResp.data!;

  // Step 2: Display user code and open browser
  displayAuthorizationInstructions(deviceCode);

  // Try to open browser automatically
  await attemptBrowserOpen(deviceCode.verification_uri_complete);

  // Step 3: Poll for token
  const token = await pollForToken(client, deviceCode);

  return token;
}

/**
 * Display authorization instructions to user
 */
function displayAuthorizationInstructions(deviceCode: DeviceCodeResponse): void {
  console.log('\n┌─────────────────────────────────────────────┐');
  console.log('│   🔐 Device Authorization Required         │');
  console.log('└─────────────────────────────────────────────┘\n');

  console.log(`Please visit: \x1b[36m${deviceCode.verification_uri}\x1b[0m`);
  console.log(`\nEnter this code: \x1b[1m\x1b[33m${deviceCode.user_code}\x1b[0m\n`);

  const expiresInMinutes = Math.floor(deviceCode.expires_in / 60);
  console.log(`\x1b[2m(Code expires in ${expiresInMinutes} minutes)\x1b[0m\n`);
}

/**
 * Attempt to open browser automatically
 */
async function attemptBrowserOpen(url: string): Promise<void> {
  try {
    await open(url);
    console.log('✓ Opened browser for authorization\n');
  } catch (error) {
    console.log('⚠ Could not open browser automatically\n');
    console.log(`Please manually open: ${url}\n`);
  }
}

/**
 * Poll for token until authorized or timeout
 */
async function pollForToken(
  client: ReturnType<typeof createApiClient>,
  deviceCode: DeviceCodeResponse
): Promise<string> {
  const spinner = ora('Waiting for authorization...').start();

  const expiresAt = Date.now() + deviceCode.expires_in * 1000;
  const pollInterval = deviceCode.interval * 1000;

  while (Date.now() < expiresAt) {
    await sleep(pollInterval);

    try {
      const tokenResp = await client.post<TokenResponse>('/api/v1/oauth/device/token', {
        device_code: deviceCode.device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      });

      if (!tokenResp.error) {
        // Success! Got the token
        spinner.succeed('✓ Authorization successful!');
        return tokenResp.data!.access_token;
      }

      // Handle different error cases
      const errorCode = (tokenResp.error as any).code || tokenResp.error.message;

      if (errorCode === 'authorization_pending' || errorCode === 'Authorization pending') {
        // Still waiting for user to authorize, continue polling
        continue;
      }

      if (errorCode === 'slow_down') {
        // Server requested slower polling
        spinner.text = 'Waiting for authorization (polling slower)...';
        await sleep(5000); // Add extra 5 seconds
        continue;
      }

      if (
        errorCode === 'access_denied' ||
        errorCode === 'Authorization denied' ||
        errorCode === 'FORBIDDEN'
      ) {
        spinner.fail('✗ Authorization denied');
        throw new Error('User denied authorization request');
      }

      if (errorCode === 'expired_token' || errorCode === 'Code expired') {
        spinner.fail('✗ Authorization timed out');
        throw new Error('Device code expired - please try again');
      }

      // Unknown error
      spinner.fail('✗ Authorization failed');
      throw new Error(tokenResp.error.message || 'Unknown error during authorization');
    } catch (error) {
      // Network error or other exception
      if (error instanceof Error && error.message.includes('denied')) {
        throw error;
      }
      // Continue polling on network errors
      spinner.text = 'Waiting for authorization (connection issue, retrying)...';
    }
  }

  // Timeout
  spinner.fail('✗ Authorization timed out');
  throw new Error('Device code expired before authorization completed');
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate user code format (XXXX-XXXX)
 */
export function isValidUserCode(code: string): boolean {
  return /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code);
}

/**
 * Format user input as device code
 */
export function formatUserCode(input: string): string {
  let value = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (value.length > 4) {
    value = value.slice(0, 4) + '-' + value.slice(4, 8);
  }
  return value;
}
