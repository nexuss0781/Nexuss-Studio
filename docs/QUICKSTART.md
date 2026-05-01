# Nexuss-Studio Quick Start Guide

Get up and running with Nexuss-Studio in under 5 minutes!

## Prerequisites

- PHP 7.4 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git (optional, for cloning)

## Installation

### Option 1: Quick Download

1. Download the latest release from GitHub
2. Extract to your web server directory
3. Open in browser

### Option 2: Git Clone

```bash
git clone https://github.com/nexuss0781/Nexuss-Studio.git
cd Nexuss-Studio
```

## Running Locally

### Start Development Server

```bash
php -S localhost:8000
```

### Access Application

Open your browser and navigate to:
```
http://localhost:8000
```

## First Steps

### 1. Choose Your Mode

**Study Mode** 📚
- Upload PDF documents
- Get AI assistance page by page
- Perfect for research and learning

**Coding Mode** 💻
- Create, edit, move, copy files
- View file diffs
- Get AI coding assistance

### 2. Select AI Model

Choose from 5 world-class models:
- GPT-4 Turbo
- Claude 3 Opus
- Gemini Ultra
- Llama 3 70B
- Mistral Large

### 3. Start Chatting

Left Window: Chat with AI
Right Window: Study or Code workspace

## Key Features

### Dual Window Interface
- Chat window for AI conversations
- Workspace window for tasks
- Simultaneous interaction

### Aggressive Caching
- 3-level cache system
- Lightning-fast responses
- Offline support

### Data Persistence
- Projects saved automatically
- Chat history preserved
- Easy backup and restore

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New chat |
| `Ctrl+S` | Save project |
| `Ctrl+O` | Open file |
| `Ctrl+P` | Search files |
| `Ctrl+/` | Toggle theme |
| `F1` | Help |

## Tips & Tricks

### Study Mode
1. Upload large PDFs for best results
2. Use specific questions about pages
3. Export notes for later review

### Coding Mode
1. Create folder structure first
2. Use diff view for changes
3. Ask AI for code reviews

### Performance
1. Clear cache monthly
2. Backup weekly
3. Use keyboard shortcuts

## Troubleshooting

### Can't Start Server?

```bash
# Check PHP installation
php -v

# Check port availability
netstat -an | grep 8000

# Try different port
php -S localhost:8080
```

### Cache Issues?

```bash
# Clear all caches
php scripts/clear_cache.php
```

### Need Help?

- Documentation: `docs/` folder
- Issues: GitHub Issues tab
- Email: nexuss0781@gmail.com

## Next Steps

1. ✅ Explore Study Mode
2. ✅ Try Coding Mode
3. ✅ Test different AI models
4. ✅ Customize themes
5. ✅ Set up backups

## Resources

- Full Documentation: `README.md`
- API Guide: `docs/API.md`
- Maintenance: `docs/MAINTENANCE.md`
- Deployment: `docs/DEPLOYMENT.md`
- Security: `SECURITY.md`
- Contributing: `CONTRIBUTING.md`

---

**Enjoy Nexuss-Studio!** 🚀

For more information, visit: https://github.com/nexuss0781/Nexuss-Studio
