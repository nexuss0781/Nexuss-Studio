# System Design Document

## Architecture Overview

### 1. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   HTML5     │  │   CSS3      │  │   JavaScript ES6+   │  │
│  │  Templates  │  │   Styles    │  │   puter.js Client   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Router    │  │  Controller │  │   Service Layer     │  │
│  │   (PHP)     │  │   (PHP)     │  │   (Business Logic)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   File      │  │   JSON      │  │   Cache             │  │
│  │   Storage   │  │   Database  │  │   (Aggressive)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI Integration Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              puter.js SDK                             │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────┐ │   │
│  │  │ GPT-4  │ │Claude 3│ │Gemini  │ │ Llama3 │ │Mist│ │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Component Design

#### 2.1 Dual Window Chat Interface
- **ChatWindow Component**: Left panel for AI conversation
- **WorkspaceWindow Component**: Right panel for Study/Coding modes
- **ModeSwitcher Component**: Toggle between Study and Coding modes

#### 2.2 Study Mode Components
- **PDFReader Component**: Single-page PDF rendering
- **PageExtractor Service**: Extract current page content
- **AIContextManager**: Send page context to AI model

#### 2.3 Coding Mode Components
- **FileManager Component**: CRUD operations for files/folders
- **DiffRenderer Component**: Visual file comparison
- **CodeEditor Component**: Syntax-highlighted editing

#### 2.4 Caching Strategy
```
Level 1: Memory Cache (LRU, 100MB limit)
Level 2: Disk Cache (/cache/, 1GB limit)
Level 3: Browser localStorage (50MB limit)
```

### 3. Data Models

#### 3.1 Project Model
```json
{
  "id": "uuid",
  "name": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "files": ["file_paths"],
  "mode": "study|coding"
}
```

#### 3.2 Chat History Model
```json
{
  "id": "uuid",
  "session_id": "uuid",
  "model": "string",
  "messages": [
    {
      "role": "user|assistant",
      "content": "string",
      "timestamp": "timestamp",
      "context": "object"
    }
  ]
}
```

### 4. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chat | Send message to AI |
| GET | /api/projects | List all projects |
| POST | /api/projects | Create new project |
| PUT | /api/projects/{id} | Update project |
| DELETE | /api/projects/{id} | Delete project |
| POST | /api/files/upload | Upload file |
| GET | /api/files/{path} | Get file content |
| PUT | /api/files/{path} | Update file |
| DELETE | /api/files/{path} | Delete file |
| POST | /api/files/move | Move file/folder |
| POST | /api/files/copy | Copy file/folder |
| GET | /api/diff | Generate file diff |
| POST | /api/pdf/extract | Extract PDF page |

### 5. Security Considerations
- Input validation on all endpoints
- File type restrictions
- Path traversal prevention
- Rate limiting for AI calls
- Session management

---
Generated: Phase 2 Complete
