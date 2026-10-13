# Contributing to NimblyWP CLI

Thank you for your interest in contributing to the NimblyWP CLI! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Git

### Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nimblywp-cli.git
   cd nimblywp-cli
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Link the CLI locally for testing:
   ```bash
   npm link
   ```

Now you can run `nimbly` commands from anywhere on your system.

## Development Workflow

### Building

```bash
# Build once
npm run build

# Watch mode (rebuilds on changes)
npm run dev
```

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

### Linting and Formatting

```bash
# Check for linting errors
npm run lint

# Format code
npm run format
```

## Project Structure

```
nimblywp-cli/
├── src/
│   ├── cli.ts              # Main CLI entry point
│   ├── index.ts            # Library exports
│   ├── commands/           # Command implementations
│   │   ├── auth.ts
│   │   ├── sites.ts
│   │   ├── snapshots.ts
│   │   ├── templates.ts
│   │   ├── plugins.ts
│   │   ├── themes.ts
│   │   └── deployments.ts
│   ├── lib/                # Core functionality
│   │   ├── api-client.ts   # API client
│   │   └── config.ts       # Configuration management
│   ├── utils/              # Utilities
│   │   ├── output.ts       # Output formatting
│   │   └── operations.ts   # Operation polling
│   └── types/              # TypeScript types
│       └── index.ts
├── dist/                   # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types for all function parameters and return values
- Avoid `any` - use `unknown` if the type is truly unknown
- Use strict mode

### Code Style

- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Maximum line length: 100 characters
- Use arrow functions for callbacks
- Use async/await instead of promises chains

### Naming Conventions

- camelCase for variables and functions
- PascalCase for classes and types
- UPPER_CASE for constants
- Descriptive names that indicate purpose

### Documentation

- Add JSDoc comments for all public functions and classes
- Include parameter descriptions and return types
- Provide examples for complex functionality

Example:
```typescript
/**
 * Create a new site
 *
 * @param name Site name
 * @param options Site creation options
 *
 * @return Created site object
 *
 * @example
 * const site = await createSite('My Blog', { phpVersion: '8.2' });
 */
```

## Adding New Commands

To add a new command:

1. Create a new file in `src/commands/` (e.g., `my-feature.ts`)
2. Define command registration function:
   ```typescript
   import { Command } from 'commander';
   import { createApiClient } from '../lib/api-client.js';
   import { output, outputSuccess, outputError } from '../utils/output.js';

   export function registerMyFeatureCommands(program: Command): void {
     const myFeature = program.command('my-feature').description('My feature description');

     myFeature
       .command('list')
       .description('List items')
       .action(async () => {
         // Implementation
       });
   }
   ```

3. Register in `src/cli.ts`:
   ```typescript
   import { registerMyFeatureCommands } from './commands/my-feature.js';
   // ...
   registerMyFeatureCommands(program);
   ```

## Testing

### Writing Tests

- Write tests for all new functionality
- Use Vitest for testing
- Test both success and error cases
- Mock API calls
- Test edge cases and error handling

Example:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { createApiClient } from '../lib/api-client';

describe('ApiClient', () => {
  it('should make GET requests', async () => {
    const client = createApiClient('http://test.api', 'token');
    // Test implementation
  });
});
```

## Pull Request Process

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. Make your changes following the coding standards

3. Add tests for your changes

4. Ensure all tests pass:
   ```bash
   npm test
   npm run lint
   ```

5. Commit your changes with a descriptive message:
   ```bash
   git commit -m "Add feature: description of what you added"
   ```

6. Push to your fork:
   ```bash
   git push origin feature/my-new-feature
   ```

7. Open a Pull Request on GitHub

### Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure CI checks pass
- Request review from maintainers

## Commit Message Format

Use clear, descriptive commit messages:

```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat: add WordPress core update command

Implements nimbly core update command to update WordPress core version
on a site. Includes operation polling and --wait flag support.

Closes #123
```

## Reporting Issues

When reporting issues, please include:

- CLI version (`nimbly --version`)
- Node.js version (`node --version`)
- Operating system
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages (if any)

## Questions?

If you have questions about contributing, please:

- Open an issue on GitHub
- Check existing issues and PRs
- Review the README and documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
