# NimblyWP CLI Quick Start Guide

Get started with the NimblyWP CLI in minutes.

## Installation

### From Source (Current - Pre-release)

```bash
git clone https://github.com/mahlamusa/nimblywp-cli.git
cd nimblywp-cli
npm install
npm run build
npm link
```

### From npm (Coming Soon)

```bash
npm install -g nimblywp-cli
```

## Initial Setup

### 1. Login to Your Account

The CLI uses **OAuth 2.0 Device Flow** for seamless authentication:

```bash
nimbly auth login
```

**What happens:**
1. CLI displays a verification code (e.g., `WXYZ-1234`)
2. Browser opens automatically to https://dashboard.nimblywp.com/device
3. You log in (if not already logged in)
4. You authorize the CLI
5. CLI receives token and saves it automatically

**Alternative - Token-based login (for CI/CD):**

```bash
# Get token from dashboard: Settings → API Tokens
nimbly auth login --token wpp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Custom API URL:**

```bash
nimbly auth login --url https://your-instance.com
```

### 2. Verify Authentication

```bash
nimbly auth whoami
```

Shows your logged-in user email and role.

## Common Tasks

### Create a New WordPress Site

```bash
# Quick create
nimbly sites create --name "My Blog"

# With custom options and wait for completion
nimbly sites create \
  --name "My Blog" \
  --domain "myblog.example.com" \
  --php 8.2 \
  --wp latest \
  --wait
```

### List Your Sites

```bash
# Table format (default)
nimbly sites list

# JSON format
nimbly sites list --output json

# With pagination
nimbly sites list --page 2 --per-page 10
```

### Backup a Site (Snapshot)

```bash
# Create snapshot
nimbly snapshots create <site-id> --name "Before update"

# List snapshots
nimbly snapshots list <site-id>

# Restore from snapshot
nimbly snapshots restore <snapshot-id> --wait
```

### Manage Plugins

```bash
# List installed plugins
nimbly plugins list <site-id>

# Install and activate a plugin
nimbly plugins install <site-id> woocommerce --activate --wait

# Update all plugins
nimbly plugins update <site-id> --wait
```

### Manage Themes

```bash
# List themes
nimbly themes list <site-id>

# Install and activate a theme
nimbly themes install <site-id> twentytwentyfour --activate --wait
```

### Deploy from Template

```bash
# List available templates
nimbly templates list

# Deploy a template
nimbly templates deploy <template-id> \
  --name "New Site" \
  --domain "newsite.com" \
  --wait
```

### Git Deployments

```bash
# Create deployment configuration
nimbly deployments create <site-id> \
  --repo https://github.com/user/repo \
  --branch main

# Trigger deployment
nimbly deployments trigger <deployment-id> --wait
```

## Working with Multiple Accounts

### Add a Second Profile

```bash
nimbly auth login --profile production
```

### Switch Between Profiles

```bash
nimbly auth use production
```

### List All Profiles

```bash
nimbly auth profiles
```

## Output Formats

All list commands support multiple output formats:

```bash
# Human-readable table
nimbly sites list

# JSON for scripts
nimbly sites list --output json

# YAML
nimbly sites list --output yaml

# CSV for spreadsheets
nimbly sites list --output csv > sites.csv
```

## Using --wait Flag

Many operations are asynchronous. Use `--wait` to poll until completion:

```bash
# Without --wait: Returns immediately with operation ID
nimbly sites create --name "Test"
# Output: Operation ID: op_123456

# With --wait: Polls until site is ready
nimbly sites create --name "Test" --wait
# Output: Shows progress, then site details
```

## Environment Variables

Override configuration with environment variables:

```bash
# Use different API URL
export NIMBLYWP_API_URL=https://staging-api.nimblywp.com
nimbly sites list

# Use specific token
export NIMBLYWP_TOKEN=your-token-here
nimbly sites list

# Use specific profile
export NIMBLYWP_PROFILE=production
nimbly sites list
```

## Getting Help

### Command Help

```bash
# General help
nimbly --help

# Command group help
nimbly sites --help

# Specific command help
nimbly sites create --help
```

### Version

```bash
nimbly --version
```

## Troubleshooting

### "No API URL configured"

You need to login first:
```bash
nimbly auth login
```

### "Authentication failed"

Check your API token is correct:
```bash
nimbly auth whoami
```

### "Operation timed out"

Increase timeout or check operation status separately:
```bash
# The operation may still be running
# Check in your dashboard or use the operation ID
```

### Network Issues

Verify you can reach the API:
```bash
curl https://api.nimblywp.com/health
```

## Next Steps

- Read the [full README](README.md) for all commands
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Review [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for roadmap
- See the [requirements doc](../nimblywp-cli-requirements.md) for technical details

## Support

- GitHub Issues: https://github.com/mahlamusa/nimblywp-cli/issues
- Documentation: https://docs.nimblywp.com
- Platform Repository: https://github.com/mahlamusa/nginx-wordpress-installer

---

Happy deploying! 🚀
