# Contributing to Nexuss-Studio

Thank you for your interest in contributing to Nexuss-Studio! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Accept constructive criticism
- Focus on what's best for the community

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- Clear title and description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment details (OS, browser, PHP version)

**Example:**
```markdown
**Bug:** PDF reader crashes on large files

**Steps to Reproduce:**
1. Open Study Mode
2. Upload PDF with 500+ pages
3. Navigate to page 400

**Expected:** Page loads successfully
**Actual:** Application crashes

**Environment:** Chrome 120, PHP 8.1
```

### Suggesting Features

Feature suggestions are welcome! Please provide:

- Use case description
- Proposed solution
- Alternatives considered
- Additional context

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests
5. Commit with clear messages
6. Push to your branch
7. Open a Pull Request

### Commit Message Guidelines

Follow these conventions:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

**Examples:**
```
feat: Add voice assistant support
fix: Resolve PDF rendering issue on mobile
docs: Update API documentation
refactor: Optimize cache layer
```

## Development Setup

### Prerequisites

- PHP 7.4+
- Git
- Modern browser
- Code editor

### Installation

```bash
git clone https://github.com/nexuss0781/Nexuss-Studio.git
cd Nexuss-Studio
php -S localhost:8000
```

### Running Tests

```bash
# Run health check
./scripts/health_check.sh

# Test backup system
./scripts/backup.sh

# Clear cache
php scripts/clear_cache.php
```

## Project Structure

```
Nexuss-Studio/
├── index.php              # Main backend
├── templates/             # HTML templates
├── src/
│   ├── css/              # Stylesheets
│   └── js/               # JavaScript modules
├── system_prompts/       # AI system prompts
├── docs/                 # Documentation
├── scripts/              # Utility scripts
├── projects/             # User projects
├── history/              # Chat history
├── backups/              # Backups
├── logs/                 # Logs
├── temp/                 # Temporary files
└── cache/                # Cache storage
```

## Coding Standards

### PHP

- Follow PSR-12 coding standards
- Use meaningful variable names
- Add comments for complex logic
- Include type hints

### JavaScript

- Use ES6+ features
- Follow consistent naming conventions
- Add JSDoc comments
- Handle errors gracefully

### CSS

- Use BEM naming convention
- Mobile-first approach
- Consistent spacing
- Reusable classes

## Testing Requirements

Before submitting a PR:

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Added necessary documentation
- [ ] No new warnings introduced
- [ ] Tested in multiple browsers
- [ ] Health check passes

## Documentation

When adding features, update:

- README.md (if user-facing)
- docs/API.md (if API changes)
- CHANGELOG.md (all changes)
- Inline code comments

## Review Process

1. Submit PR with clear description
2. Automated checks run
3. Maintainer reviews
4. Address feedback
5. Approval and merge

## Questions?

- Check existing documentation
- Search closed issues
- Create a new issue
- Contact: nexuss0781@gmail.com

## License

By contributing, you agree that your contributions will be licensed under the project's license.

---

Thank you for contributing to Nexuss-Studio! 🚀
