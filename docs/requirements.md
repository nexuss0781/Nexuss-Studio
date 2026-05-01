# Requirements Specification Document

## Project: Infinite Free Ready PHP/JS Studio

### 1. Overview
A modern, premium dual-window chat studio with AI-powered study and coding modes.

### 2. Core Features

#### 2.1 Dual Window Chat Interface
- Left Window: Chat with puter.js AI assistant
- Right Window: Dual-purpose workspace (Study Mode / Coding Mode)

#### 2.2 Study Mode
- PDF Reader with single-page rendering
- Current page context extraction
- AI-assisted learning and explanations
- Page upload/access to AI model

#### 2.3 Coding Mode
- File/Folder CRUD operations
- Move and copy functionality
- Real-time file diff rendering
- AI-assisted code generation and review

#### 2.4 System Prompts
- Dedicated markdown prompts for both models
- Context-aware prompt switching

#### 2.5 Model Integration
- Top 5 world's smartest models:
  1. GPT-4 Turbo
  2. Claude 3 Opus
  3. Gemini Ultra
  4. Llama 3 70B
  5. Mistral Large

#### 2.6 Data Persistence
- Projects stored in `/projects/`
- Chat history stored in `/history/`

#### 2.7 Caching Strategy
- Aggressive caching for optimal performance
- Multi-level cache (memory, disk, browser)

#### 2.8 UI/UX
- Modern premium design
- Responsive layout
- Dark/Light theme support
- Smooth animations

### 3. Technical Stack
- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Backend: PHP 8+
- Storage: File-based with JSON
- AI Integration: puter.js SDK

### 4. SDLC Waterfall Phases
1. Requirements Analysis ✓
2. System Design
3. Implementation
4. Testing
5. Deployment
5. Maintenance

---
Generated: Phase 1 Complete
