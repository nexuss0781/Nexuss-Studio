# Nexuss Studio

## 🚀 AI-Powered Development Environment

A modern, premium dual-window chat studio with AI-powered study and coding modes.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PHP](https://img.shields.io/badge/PHP-8+-purple.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)

---

## ✨ Features

### 🎯 Dual Window Interface
- **Left Panel**: Chat with AI assistant using puter.js
- **Right Panel**: Dual-purpose workspace (Study/Coding modes)

### 📚 Study Mode
- PDF Reader with single-page rendering
- Page-by-page navigation
- Text extraction from PDF pages
- AI-assisted document analysis
- Context-aware learning support

### 💻 Coding Mode
- File/Folder CRUD operations
- Move and copy functionality
- Real-time file diff rendering
- Syntax-highlighted code editor
- Project management

### 🤖 AI Integration
Support for 5 world-class models:
1. **GPT-4 Turbo** - Complex reasoning & code generation
2. **Claude 3 Opus** - Long context understanding
3. **Gemini Ultra** - Multi-modal tasks
4. **Llama 3 70B** - Open-source efficiency
5. **Mistral Large** - European compliance

### 🗄️ Data Persistence
- Projects stored in `/projects/`
- Chat history stored in `/history/`
- Automatic backup system

### ⚡ Aggressive Caching
- 3-level caching system:
  - Level 1: Memory cache (LRU, 100MB)
  - Level 2: Disk cache (1GB)
  - Level 3: Browser localStorage (50MB)
- Prefetching capabilities
- Function memoization

### 🎨 Modern Premium UI
- Dark/Light theme support
- Responsive design
- Smooth animations
- Resizable panels
- Custom scrollbars

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: PHP 8+
- **AI**: puter.js SDK
- **PDF**: PDF.js
- **Storage**: File-based JSON

---

## 📦 Installation

### Requirements
- PHP 8.0 or higher
- Web server (Apache/Nginx) or PHP built-in server
- Modern web browser

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/infinite-studio.git
cd infinite-studio

# Start PHP built-in server
php -S localhost:8000

# Open in browser
http://localhost:8000
```

---

## 📁 Project Structure

```
infinite-studio/
├── index.php              # Main entry point & API server
├── templates/
│   └── index.html         # Main HTML template
├── src/
│   ├── css/
│   │   └── styles.css     # Premium UI styles
│   └── js/
│       ├── app.js         # Application initialization
│       ├── chat.js        # Chat module
│       ├── study-mode.js  # Study mode (PDF reader)
│       ├── coding-mode.js # Coding mode (file manager)
│       ├── cache.js       # Caching system
│       └── api.js         # API communication
├── projects/              # User projects storage
├── history/               # Chat history storage
├── cache/                 # Cache storage
├── system_prompts/        # AI system prompts
│   ├── chat_assistant.md
│   └── workspace_assistant.md
└── docs/                  # Documentation
    ├── requirements.md
    └── system_design.md
```

---

## 🎮 Usage

### Chat with AI
1. Select your preferred model from the dropdown
2. Type your message in the chat input
3. Press Enter or click Send
4. Get instant AI-powered responses

### Study Mode
1. Click "Study Mode" button
2. Upload a PDF document
3. Navigate through pages
4. Click "Analyze with AI" for assistance

### Coding Mode
1. Click "Coding Mode" button
2. Browse files in the sidebar
3. Click a file to edit
4. Use toolbar actions: Save, Diff, Copy, Move, Delete

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to AI |
| GET | `/api/history` | Get chat history |
| POST | `/api/history/save` | Save chat history |
| GET | `/api/files/list` | List files |
| GET | `/api/files/read` | Read file content |
| POST | `/api/files/write` | Write file content |
| POST | `/api/files/create` | Create file/folder |
| DELETE | `/api/files/delete` | Delete file/folder |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/health` | Health check |

---

## 🧪 Development

### Running Tests
```bash
# Run PHP lint check
php -l index.php

# Run in development mode
php -S localhost:8000
```

### Code Style
- Follow PSR-12 for PHP
- Use ESLint rules for JavaScript
- Maintain consistent naming conventions

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- [puter.js](https://puter.com/) - AI integration
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering
- [Inter Font](https://rsms.me/inter/) - Typography
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/) - Code font

---

## 📬 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ by the Infinite Studio Team
