# Claude Code Changelog - Tapestry Connector

A [Tapestry](https://www.iconfactory.com/tapestry) connector that displays Claude Code version updates in your universal timeline.

![Timeline View](screenshots/timeline-view.png)

## Features

- 📋 **Automatic Updates**: Checks for new Claude Code releases hourly
- 🏷️ **Version Tracking**: Each release shows version number and categorized changes
- 🔗 **Direct Links**: Click any version to jump to its section in the changelog
- 📊 **Smart Categorization**: Changes grouped as Features, Fixes, Breaking Changes, etc.
- 📅 **Accurate Dating**: Optional GitHub API integration for real release dates
- ⚡ **Lightweight**: Works without authentication (60 requests/hour per IP)

## Installation

### Method 1: Direct Download

1. Download the latest [`claude-code-changelog.tapestry`](releases/claude-code-changelog.tapestry) file
2. Open Tapestry
3. Drag the `.tapestry` file onto Tapestry, or use File → Import Connector

### Method 2: Build from Source

```bash
git clone https://github.com/YOUR_USERNAME/claude-code-tapestry-connector.git
cd claude-code-tapestry-connector/connector
zip -r ../claude-code-changelog.tapestry .
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

### File Structure

```
connector/
├── plugin-config.json    # Connector metadata and configuration
├── plugin.js            # Main parsing and transformation logic
└── ui-config.json       # User interface settings
```

### Key Functions

- `extractVersionSections()` - Parses markdown to find version entries
- `createItem()` - Transforms version data into Tapestry items
- `groupChanges()` - Categorizes changes by type
- `enhanceWithGitHubDates()` - Fetches real dates from GitHub API

### Testing

1. Make your changes in the `connector/` directory
2. Create a new `.tapestry` file: `zip -r test.tapestry connector/*`
3. Import into Tapestry for testing
4. Check the timeline and verify links work correctly

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

- 🐛 **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/claude-code-tapestry-connector/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/claude-code-tapestry-connector/discussions)
- 📧 **Contact**: your-email@example.com

---

_This connector is not officially affiliated with Anthropic or The Iconfactory._
