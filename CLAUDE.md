# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tapestry connector that displays Claude Code version updates in a universal timeline. It parses the
Claude Code CHANGELOG.md from GitHub and creates timeline items with categorized changes. Be sure to consult
Tapestry's [API docs](https://raw.githubusercontent.com/TheIconfactory/Tapestry/refs/heads/main/Documentation/API.md)
for technical information about the environment that the plugin runs in.

## Commands

### Build and Package

```bash
# Create a .tapestry file for distribution
zip -r claude-code-changelog.tapestry plugin.js plugin-config.json ui-config.json actions.json

# Create from the connector directory
cd connector
zip -r ../claude-code-changelog.tapestry .
```

### Testing

```bash
# Create a test build
zip -r test.tapestry plugin.js plugin-config.json ui-config.json actions.json

# Verify JavaScript syntax
node -c plugin.js

# Then import test.tapestry into Tapestry application for testing
```

## Architecture

### Core Components

1. **plugin.js** - Main parsing logic (plugin.js:1-368)

   - `load()` - Entry point, fetches changelog and processes it
   - `extractVersionSections()` - Parses markdown to extract version entries
   - `createItem()` - Transforms version data into Tapestry timeline items
   - `enhanceWithGitHubDates()` - Optional GitHub API integration for real release dates

2. **plugin-config.json** - Connector metadata

   - Defines connector ID, display name, update interval (hourly)
   - Points to Claude Code changelog URL

3. **ui-config.json** - User settings

   - Toggle for GitHub API usage (for accurate release dates)

4. **actions.json** - Custom timeline item actions

### Data Flow

1. Fetches raw CHANGELOG.md from GitHub
2. Parses version sections using regex patterns
3. Optionally fetches real release dates from GitHub API
4. Groups changes by type (features, fixes, breaking changes)
5. Creates Tapestry Item objects with formatted HTML content
6. Returns items to Tapestry for timeline display

### Key Patterns

- **Date Handling**: Dual approach - GitHub API for accuracy or estimation based on release patterns
- **Change Categorization**: Automatic grouping based on keywords (fixed, added, breaking, etc.)
- **URI Generation**: Creates direct links to changelog sections using GitHub's auto-generated anchors
- **HTML Formatting**: Builds structured HTML for timeline display with proper escaping

### Tapestry API Usage

- `sendRequest()` - HTTP requests to GitHub
- `Item.createWithUriDate()` - Timeline item creation
- `Identity.createWithName()` - Author attribution
- `Annotation.createWithText()` - Special release markers
- `processResults()` / `processError()` - Result handling
