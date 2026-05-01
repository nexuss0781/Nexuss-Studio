# API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
Most endpoints require CSRF token in header:
```
X-CSRF-Token: <token>
```

## Endpoints

### Chat

#### POST /chat
Send a message to AI.

**Request:**
```json
{
  "message": "Hello, how are you?",
  "model": "gpt-4-turbo",
  "systemPrompt": "You are a helpful assistant.",
  "conversationId": "conv_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "I'm doing well, thank you!",
    "model": "gpt-4-turbo",
    "usage": {
      "promptTokens": 10,
      "completionTokens": 8,
      "totalTokens": 18
    }
  }
}
```

### Files

#### GET /files
List all files and folders.

**Query Parameters:**
- `path` (optional): Directory path to list

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "index.php",
      "type": "file",
      "path": "/index.php",
      "size": 1024,
      "modified": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /files
Create a new file or folder.

**Request:**
```json
{
  "path": "/newfile.txt",
  "content": "File content",
  "type": "file"
}
```

#### PUT /files/{path}
Update an existing file.

**Request:**
```json
{
  "content": "Updated content"
}
```

#### DELETE /files/{path}
Delete a file or folder.

#### POST /files/move
Move or rename a file.

**Request:**
```json
{
  "source": "/old/path/file.txt",
  "destination": "/new/path/file.txt"
}
```

#### POST /files/copy
Copy a file.

**Request:**
```json
{
  "source": "/path/file.txt",
  "destination": "/path/file-copy.txt"
}
```

### PDF

#### POST /pdf/extract
Extract text from PDF.

**Request:**
- `file`: PDF file (multipart/form-data)
- `page`: Page number (optional, default: all)

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "Extracted text...",
    "pages": 10,
    "currentPage": 1
  }
}
```

### Cache

#### GET /cache/stats
Get cache statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "memory": {
      "hits": 100,
      "misses": 20,
      "size": 50
    },
    "localStorage": {
      "hits": 80,
      "misses": 10,
      "size": 30
    },
    "indexedDB": {
      "hits": 60,
      "misses": 5,
      "size": 20
    }
  }
}
```

#### DELETE /cache
Clear all caches.

**Query Parameters:**
- `type`: Specific cache type (memory, localStorage, indexedDB, all)

### Analytics

#### POST /analytics
Submit analytics events.

**Request:**
```json
{
  "events": [...],
  "userId": "user_123",
  "sessionId": "session_456"
}
```

#### GET /analytics/metrics
Get aggregated metrics.

### Health

#### GET /health
Check server health.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Common Error Codes
- `INVALID_REQUEST`: Bad request format
- `UNAUTHORIZED`: Missing or invalid authentication
- `NOT_FOUND`: Resource not found
- `FORBIDDEN`: Insufficient permissions
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

Default limits:
- 100 requests per minute per IP
- 1000 requests per hour per user

Headers included in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## WebSocket

### Connection
```
ws://localhost:8000/ws
```

### Messages

#### Join Room
```json
{
  "type": "join",
  "roomId": "room_123",
  "userId": "user_456"
}
```

#### Operation
```json
{
  "type": "operation",
  "operation": {
    "type": "insert",
    "position": 0,
    "text": "Hello"
  }
}
```

## Examples

### cURL Examples

#### Send Chat Message
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <token>" \
  -d '{
    "message": "Hello",
    "model": "gpt-4-turbo"
  }'
```

#### Upload PDF
```bash
curl -X POST http://localhost:8000/api/pdf/extract \
  -F "file=@document.pdf" \
  -F "page=1"
```

#### Create File
```bash
curl -X POST http://localhost:8000/api/files \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/test.txt",
    "content": "Hello World"
  }'
```
