# NimblyWP CLI

Official command-line interface for [NimblyWP](https://nimblywp.com) - Manage WordPress sites, snapshots, deployments, and more from your terminal.

## Features

- 🚀 **Site Management** - Create, update, and delete WordPress sites
- 📸 **Snapshots** - Backup and restore with one command
- 🎨 **Templates** - Deploy pre-configured WordPress setups
- 🔌 **Plugins & Themes** - Install, update, and manage WordPress extensions
- 🚢 **Deployments** - Git-based deployment automation
- 🔐 **Multi-Profile** - Manage multiple NimblyWP accounts
- 📊 **Rich Output** - Table, JSON, YAML, and CSV formats
- ⚡ **Real-time Progress** - WebSocket-based operation tracking

## Installation

```bash
npm install -g nimblywp-cli
```

## Quick Start

### Authentication

```bash
# Login to your NimblyWP account
nimbly auth login

# Use API token (recommended for CI/CD)
nimbly auth login --token YOUR_API_TOKEN
```

### Site Management

```bash
# List all sites
nimbly sites list

# Create a new site
nimbly sites create --name "My Blog" --wait

# Get site details
nimbly sites get <site-id>

# Delete a site
nimbly sites delete <site-id>
```

### Snapshots

```bash
# Create a snapshot
nimbly snapshots create <site-id>

# List snapshots for a site
nimbly snapshots list <site-id>

# Restore from snapshot
nimbly snapshots restore <snapshot-id>
```

### Templates

```bash
# Deploy from template
nimbly templates deploy <template-id> --name "New Site"

# List available templates
nimbly templates list
```

### Plugins & Themes

```bash
# Install a plugin
nimbly plugins install <site-id> woocommerce

# Update all plugins
nimbly plugins update <site-id> --all

# Install a theme
nimbly themes install <site-id> twentytwentyfour
```

### Deployments

```bash
# Create a deployment
nimbly deployments create <site-id> --repo https://github.com/user/repo

# List deployments
nimbly deployments list <site-id>

# Trigger deployment
nimbly deployments trigger <deployment-id>
```

### WordPress Core

```bash
# Check WordPress version
nimbly core info <site-id>

# Update WordPress
nimbly core update <site-id> --wait

# Check for updates
nimbly core check-update <site-id>
```

### WP-CLI Commands

```bash
# List available commands
nimbly commands list

# Execute a WP-CLI command
nimbly commands run <site-id> "option get siteurl" --wait

# Run batch commands
nimbly commands batch <site-id> -c "cache flush" "rewrite flush"
```

### DNS Management

```bash
# List DNS records
nimbly dns list <site-id>

# Create A record
nimbly dns create <site-id> --type A --name www --value 192.168.1.1

# Update DNS record
nimbly dns update <record-id> --value 192.168.1.2

# Delete DNS record
nimbly dns delete <record-id>
```

### SSL Certificates

```bash
# Check SSL status
nimbly ssl status <site-id>

# Renew SSL certificate
nimbly ssl renew <site-id> --wait

# Enable SSL
nimbly ssl enable <site-id>

# Verify certificate
nimbly ssl verify <site-id>
```

### WordPress Users

```bash
# List users
nimbly users list <site-id>

# Create admin user
nimbly users create <site-id> -u admin -e admin@example.com -p password123 -r administrator

# Update user
nimbly users update <site-id> <user-id> --role editor

# Delete user
nimbly users delete <site-id> <user-id> --reassign 1
```

### Database Operations

```bash
# Get database info
nimbly database info <site-id>

# Export database
nimbly database export <site-id> --wait

# Import database
nimbly database import <site-id> --file backup.sql

# Optimize database
nimbly database optimize <site-id>

# Search and replace
nimbly database search-replace <site-id> -s "oldurl.com" -r "newurl.com" --dry-run
```

## Output Formats

All list commands support multiple output formats:

```bash
# Table format (default)
nimbly sites list

# JSON format
nimbly sites list --output json

# YAML format
nimbly sites list --output yaml

# CSV format
nimbly sites list --output csv
```

## Multi-Profile Support

Manage multiple NimblyWP accounts:

```bash
# Add a new profile
nimbly auth login --profile production

# Switch between profiles
nimbly auth use production

# List all profiles
nimbly auth profiles
```

## Configuration

The CLI stores configuration in `~/.nimblywp/config.json`:

```json
{
  "currentProfile": "default",
  "profiles": {
    "default": {
      "apiUrl": "https://api.nimblywp.com",
      "token": "..."
    }
  }
}
```

## Environment Variables

- `NIMBLYWP_API_URL` - Override API base URL
- `NIMBLYWP_TOKEN` - API token (alternative to login)
- `NIMBLYWP_PROFILE` - Active profile name

## Development

```bash
# Clone the repository
git clone https://github.com/mahlamusa/nimblywp-cli.git
cd nimblywp-cli

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run dev
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Linting
npm run lint

# Format code
npm run format
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © Lindeni Mahlalela

## Links

- [NimblyWP Platform](https://nimblywp.com)
- [Documentation](https://docs.nimblywp.com)
- [API Reference](https://docs.nimblywp.com/api)
- [Issues](https://github.com/mahlamusa/nimblywp-cli/issues)
