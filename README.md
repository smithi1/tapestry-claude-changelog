# Claude Code Changelog - Tapestry Connector

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build](https://github.com/smithi1/tapestry-claude-changelog/actions/workflows/build.yml/badge.svg)](https://github.com/smithi1/tapestry-claude-changelog/actions)
[![GitHub release](https://img.shields.io/github/release/smithi1/tapestry-claude-changelog.svg)](https://github.com/smithi1/tapestry-claude-changelog/releases)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/smithi1/tapestry-claude-changelog/graphs/commit-activity)

A [Tapestry](https://www.iconfactory.com/tapestry) connector that displays Claude Code version updates in your universal timeline.

## Features

- 📋 **Automatic Updates**: Checks for new Claude Code releases hourly
- 🏷️ **Version Tracking**: Each release shows version number and categorized changes
- 🔗 **Direct Links**: Click any version to jump to its section in the changelog
- 📊 **Smart Categorization**: Changes grouped as Features, Fixes, Breaking Changes, etc.
- 📅 **Accurate Dating**: Optional GitHub API integration for real release dates
- ⚡ **Lightweight**: Works without authentication (60 requests/hour per IP)

## Installation

### Method 1: Direct Download (Recommended)

1. Go to the [latest release](https://github.com/smithi1/tapestry-claude-changelog/releases/latest)
2. Download `claude-code-changelog.tapestry`
3. Open Tapestry
4. Drag the `.tapestry` file onto Tapestry, or use File → Import Connector

### Method 2: Build from Source

```bash
git clone https://github.com/smithi1/tapestry-claude-changelog.git
cd claude-code-tapestry-connector
zip -r claude-code-changelog.tapestry plugin.js plugin-config.json ui-config.json actions.json
```

## Configuration

### GitHub API (Optional)

- **Enabled** (default): Uses 1 GitHub API request per update to fetch accurate release dates
- **Disabled**: Estimates release dates based on version patterns

Each user gets 60 unauthenticated API requests per hour from their IP address, which is more than sufficient for hourly changelog checks.

## How It Works

The connector:

1. Fetches the [Claude Code CHANGELOG.md](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
2. Parses version numbers and changes
3. Optionally fetches release dates from GitHub API
4. Creates timeline items with categorized changes
5. Links each version to its changelog section using GitHub's auto-generated anchors

## Example Output

Each timeline entry shows:

- **Version number** with primary change type (e.g., "1.0.65 🐛 Bug Fixes")
- **Categorized changes** in the detail view
- **Direct link** to the changelog section on GitHub

## Development

### Quick Start

```bash
# Clone the repository
git clone https://github.com/smithi1/tapestry-claude-changelog.git
cd claude-code-tapestry-connector

# Create a test build
zip -r test.tapestry plugin.js plugin-config.json ui-config.json actions.json

# Verify syntax
node -c plugin.js

# Import test.tapestry into Tapestry for testing
```

### File Structure

```
├── plugin-config.json    # Connector metadata and configuration
├── plugin.js            # Main parsing and transformation logic
├── ui-config.json       # User interface settings
├── actions.json         # Custom timeline item actions
└── CLAUDE.md           # AI assistant instructions
```

### Key Functions

- `extractVersionSections()` - Parses markdown to find version entries
- `createItem()` - Transforms version data into Tapestry items
- `groupChanges()` - Categorizes changes by type
- `enhanceWithGitHubDates()` - Fetches real dates from GitHub API

### Testing

1. Make your changes to the plugin files
2. Run syntax validation: `node -c plugin.js`
3. Create test package: `zip -r test.tapestry plugin.js plugin-config.json ui-config.json actions.json`
4. Import into Tapestry for testing
5. Verify timeline items appear correctly and links work

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Ideas for Contributions

- Add support for other Anthropic tools (Claude Desktop, etc.)
- Enhance date detection with git history parsing
- Add release notes summarization
- Support for changelog formats beyond Markdown
- Internationalization support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Tapestry](https://www.iconfactory.com/tapestry) by The Iconfactory
- [Claude Code](https://github.com/anthropics/claude-code) by Anthropic
- Contributors and testers from the Tapestry community

## Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/smithi1/tapestry-claude-changelog/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/smithi1/tapestry-claude-changelog/discussions)

---

_This connector is not officially affiliated with Anthropic or The Iconfactory._
