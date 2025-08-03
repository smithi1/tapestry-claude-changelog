// Claude Code Tapestry Connector
// Parses the Claude Code changelog and creates timeline items

// Constants
const DAYS_BETWEEN_RELEASES = 2.5;
const GITHUB_RELEASES_LIMIT = 30;
const CHANGELOG_URL = "https://raw.githubusercontent.com/anthropics/claude-code/refs/heads/main/CHANGELOG.md";
const GITHUB_API_BASE = "https://api.github.com/repos/anthropics/claude-code";

// Verify function to validate connector configuration
function verify() {
    const testUrl = GITHUB_API_BASE;
    return sendRequest(testUrl, "GET", null, { "Accept": "application/vnd.github.v3+json" })
        .then((response) => {
            try {
                JSON.parse(response);
                return true;
            } catch (e) {
                return false;
            }
        })
        .catch(() => false);
}

// Handle actions from actions.json
function performAction(actionId, item) {
    switch(actionId) {
        case "download":
            // Extract version from item title or URI
            const versionMatch = item.title.match(/Claude Code ([\d.]+)/);
            if (versionMatch) {
                const downloadUrl = `https://github.com/anthropics/claude-code/releases/tag/v${versionMatch[1]}`;
                actionComplete(true, downloadUrl);
            } else {
                actionComplete(false, "Could not determine version");
            }
            break;
        case "view_commits":
            // Link to commits page for this version
            const commitsUrl = "https://github.com/anthropics/claude-code/commits/main";
            actionComplete(true, commitsUrl);
            break;
        default:
            actionComplete(false, "Unknown action: " + actionId);
    }
}

function load() {
    // Use constant for changelog URL

    // Fetch the changelog
    sendRequest(CHANGELOG_URL)
        .then((changelogText) => {
            // Validate response
            if (!changelogText || typeof changelogText !== 'string') {
                throw new Error("Invalid changelog response: empty or non-string data");
            }
            
            if (changelogText.length < 100) {
                throw new Error("Changelog appears to be too short or invalid");
            }
            
            const sections = extractVersionSections(changelogText);
            
            if (!sections || sections.length === 0) {
                throw new Error("No version sections found in changelog");
            }

            // Check if we should use GitHub API (with proper variable check)
            if (typeof use_github_api !== 'undefined' && use_github_api === "on") {
                return enhanceWithGitHubDates(sections);
            } else {
                return parseWithEstimatedDates(sections);
            }
        })
        .then((results) => {
            if (!results || results.length === 0) {
                processError("No changelog items could be created");
            } else {
                processResults(results);
            }
        })
        .catch((requestError) => {
            // Enhanced error logging
            const errorMessage = requestError.message || requestError.toString() || "Unknown error occurred";
            console.error("Claude Code Changelog Error:", errorMessage);
            processError("Failed to load changelog: " + errorMessage);
        });
}

function enhanceWithGitHubDates(sections) {
    const releasesUrl = `${GITHUB_API_BASE}/releases?per_page=${GITHUB_RELEASES_LIMIT}`;

    return sendRequest(releasesUrl, "GET", null, { "Accept": "application/vnd.github.v3+json" })
        .then((releasesText) => {
            try {
                // Validate response
                if (!releasesText) {
                    throw new Error("Empty GitHub API response");
                }
                
                const releases = JSON.parse(releasesText);
                
                if (!Array.isArray(releases)) {
                    throw new Error("GitHub API response is not an array");
                }
                
                const releaseDates = {};

                releases.forEach(release => {
                    if (release && release.tag_name) {
                        const version = release.tag_name.replace(/^v/, '');
                        const dateStr = release.published_at || release.created_at;
                        if (dateStr) {
                            const date = new Date(dateStr);
                            if (!isNaN(date.getTime())) {
                                releaseDates[version] = date;
                            }
                        }
                    }
                });

                return parseWithMixedDates(sections, releaseDates);
            } catch (e) {
                // Log the error but fall back gracefully
                console.error("GitHub API error:", e.message);
                return parseWithEstimatedDates(sections);
            }
        })
        .catch((error) => {
            // API failed, log and use estimation
            console.error("GitHub API request failed:", error.message || error);
            return parseWithEstimatedDates(sections);
        });
}

function extractVersionSections(markdown) {
    // Input validation
    if (!markdown || typeof markdown !== 'string') {
        console.error("Invalid markdown input to extractVersionSections");
        return [];
    }
    
    const sections = [];
    const lines = markdown.split('\n');
    let currentSection = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const versionMatch = line.match(/^##\s+([\d.]+(?:-[a-zA-Z0-9]+)?)\s*$/);

        if (versionMatch) {
            if (currentSection && currentSection.changes.length > 0) {
                sections.push(currentSection);
            }
            currentSection = {
                version: versionMatch[1],
                changes: [],
                lineNumber: i
            };
        } else if (currentSection && line.trim().startsWith('-')) {
            const change = line.trim().substring(1).trim();
            if (change.length > 0) { // Only add non-empty changes
                currentSection.changes.push(change);
            }
        }
    }

    if (currentSection && currentSection.changes.length > 0) {
        sections.push(currentSection);
    }

    return sections;
}

function parseWithEstimatedDates(sections) {
    const results = [];
    // Start from a few days ago for the newest release (not today)
    const today = new Date();
    let estimatedDate = new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000)); // Start 3 days ago

    sections.forEach((section, index) => {
        // Average days between releases with some variance
        const variance = (Math.random() - 0.5);
        const daysToSubtract = DAYS_BETWEEN_RELEASES + variance;

        if (index > 0) {
            estimatedDate = new Date(estimatedDate.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
        }

        const item = createItem(section, new Date(estimatedDate));
        if (item) results.push(item);
    });

    return results;
}

function parseWithMixedDates(sections, knownDates) {
    const results = [];

    sections.forEach((section, index) => {
        let date;

        if (knownDates[section.version]) {
            date = knownDates[section.version];
        } else {
            // Estimate based on surrounding known dates
            date = estimateDateBetweenKnown(section, index, sections, knownDates);
        }

        const item = createItem(section, date);
        if (item) results.push(item);
    });

    return results;
}

function estimateDateBetweenKnown(section, index, allSections, knownDates) {
    // Find nearest known dates
    let beforeDate = null;
    let afterDate = null;
    let beforeIndex = -1;
    let afterIndex = allSections.length;

    // Look backwards for a known date
    for (let i = index - 1; i >= 0; i--) {
        if (knownDates[allSections[i].version]) {
            beforeIndex = i;
            beforeDate = knownDates[allSections[i].version];
            break;
        }
    }

    // Look forwards for a known date
    for (let i = index + 1; i < allSections.length; i++) {
        if (knownDates[allSections[i].version]) {
            afterIndex = i;
            afterDate = knownDates[allSections[i].version];
            break;
        }
    }

    if (beforeDate && afterDate) {
        // Interpolate between known dates
        const totalGap = afterDate.getTime() - beforeDate.getTime();
        const position = (index - beforeIndex) / (afterIndex - beforeIndex);
        return new Date(beforeDate.getTime() + totalGap * position);
    } else if (beforeDate) {
        // Extrapolate from before date
        const daysSince = (index - beforeIndex) * DAYS_BETWEEN_RELEASES;
        return new Date(beforeDate.getTime() - daysSince * 24 * 60 * 60 * 1000);
    } else if (afterDate) {
        // Extrapolate from after date
        const daysBefore = (afterIndex - index) * DAYS_BETWEEN_RELEASES;
        return new Date(afterDate.getTime() + daysBefore * 24 * 60 * 60 * 1000);
    } else {
        // No known dates, simple estimation starting from 3 days ago
        const today = new Date();
        const daysAgo = (index * DAYS_BETWEEN_RELEASES) + 3; // Add 3 days offset
        return new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    }
}

function createItem(section, date) {
    // Create URI using GitHub's auto-generated header anchors
    const anchorId = section.version.replace(/\./g, '');
    const uri = `https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#${anchorId}`;

    const item = Item.createWithUriDate(uri, date);

    // Create title
    const highlight = findHighlight(section.changes);
    item.title = `Claude Code ${section.version}${highlight ? ' - ' + highlight : ''}`;

    // Format the body
    let bodyHtml = '';

    // Group changes by type
    const grouped = groupChanges(section.changes);

    // Determine primary change type for preview
    let previewText = `${section.version}`;
    if (grouped.breaking.length > 0) {
        previewText += ` ${getTypeEmoji('breaking')} ${getTypeLabel('breaking')}`;
    } else if (grouped.features.length > 0) {
        previewText += ` ${getTypeEmoji('features')} ${getTypeLabel('features')}`;
    } else if (grouped.fixes.length > 0) {
        previewText += ` ${getTypeEmoji('fixes')} ${getTypeLabel('fixes')}`;
    } else if (grouped.improvements.length > 0) {
        previewText += ` ${getTypeEmoji('improvements')} ${getTypeLabel('improvements')}`;
    }

    // Start with version + type for table preview
    bodyHtml += `<p><strong>${previewText}</strong></p>`;

    // Add all changes organized by type
    ['breaking', 'features', 'fixes', 'improvements'].forEach(type => {
        if (grouped[type].length > 0) {
            bodyHtml += '<ul>';
            grouped[type].forEach(change => {
                bodyHtml += `<li>${formatChange(change)}</li>`;
            });
            bodyHtml += '</ul>';
        }
    });

    item.body = bodyHtml;

    // Add author identity
    const identity = Identity.createWithName("Claude Code Team");
    identity.uri = "https://github.com/anthropics/claude-code";
    identity.avatar = "https://avatars.githubusercontent.com/u/76263028";
    identity.username = "@anthropics";
    item.author = identity;

    // Add annotations for special releases
    const annotations = [];
    if (section.version === '1.0.0') {
        annotations.push(createAnnotation("🎉 GA Release"));
    } else if (hasBreakingChanges(section.changes)) {
        annotations.push(createAnnotation("⚠️ Breaking Changes"));
    } else if (section.version.endsWith('.0')) {
        annotations.push(createAnnotation("✨ Feature Release"));
    }

    if (annotations.length > 0) {
        item.annotations = annotations;
    }

    return item;
}

function findHighlight(changes) {
    // Look for the most important change to highlight
    for (const change of changes) {
        const lower = change.toLowerCase();
        if (lower.includes('introducing') || lower.includes('new model')) {
            return extractFeatureName(change);
        }
    }

    for (const change of changes) {
        if (change.toLowerCase().includes('breaking change')) {
            return 'Breaking Changes';
        }
    }

    for (const change of changes) {
        const lower = change.toLowerCase();
        if (lower.includes('can now') || lower.includes('added support')) {
            return extractFeatureName(change);
        }
    }

    return null;
}

function extractFeatureName(change) {
    // Try to extract a concise feature name
    const patterns = [
        /introducing\s+(.+?)(?:\s*[-–—]|$)/i,
        /added\s+support\s+for\s+(.+?)(?:\s*[-–—]|$)/i,
        /can\s+now\s+(.+?)(?:\s*[-–—]|$)/i,
        /new\s+(.+?)(?:\s*[-–—]|$)/i
    ];

    for (const pattern of patterns) {
        const match = change.match(pattern);
        if (match) {
            let feature = match[1].trim();
            // Truncate if too long
            if (feature.length > 30) {
                feature = feature.substring(0, 27) + '...';
            }
            return feature;
        }
    }

    // Fallback: use first few words
    const words = change.split(' ').slice(0, 5).join(' ');
    return words.length > 30 ? words.substring(0, 27) + '...' : words;
}

function groupChanges(changes) {
    const groups = {
        breaking: [],
        features: [],
        fixes: [],
        improvements: []
    };

    changes.forEach(change => {
        const lower = change.toLowerCase();
        if (lower.includes('breaking change') || lower.startsWith('breaking:')) {
            groups.breaking.push(change);
        } else if (lower.includes('fixed') || lower.includes('fix ')) {
            groups.fixes.push(change);
        } else if (lower.includes('added') || lower.includes('new ') ||
            lower.includes('introducing') || lower.includes('can now')) {
            groups.features.push(change);
        } else {
            groups.improvements.push(change);
        }
    });

    return groups;
}

function formatChange(change) {
    // Escape HTML
    let formatted = escapeHtml(change);

    // Format code elements
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold important keywords
    formatted = formatted.replace(/\b(Breaking change:|BREAKING:)/gi, '<strong>$1</strong>');

    return formatted;
}

function hasBreakingChanges(changes) {
    return changes.some(change =>
        change.toLowerCase().includes('breaking change') ||
        change.toLowerCase().startsWith('breaking:')
    );
}

function createAnnotation(text) {
    const annotation = Annotation.createWithText(text);
    return annotation;
}

function getTypeEmoji(type) {
    const emojis = {
        breaking: '⚠️',
        features: '✨',
        fixes: '🐛',
        improvements: '📈'
    };
    return emojis[type] || '•';
}

function getTypeLabel(type) {
    const labels = {
        breaking: 'Breaking Changes',
        features: 'New Features',
        fixes: 'Bug Fixes',
        improvements: 'Improvements'
    };
    return labels[type] || 'Changes';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}