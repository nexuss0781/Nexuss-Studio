# Testing Guide

## Overview
This document provides comprehensive testing instructions for the Infinite Free Ready PHP/JS Studio.

## Unit Tests

### Running Tests
```bash
# Run all tests
php -S localhost:8000 &
open http://localhost:8000/tests/

# Or run CLI tests
php tests/run-tests.php
```

### Test Coverage
- Voice Assistant Module
- Keyboard Shortcuts Manager
- Collaboration Manager
- Analytics Manager
- Plugin System
- Export/Import Manager
- Notification System
- Security Manager
- Theme Manager

## Integration Tests

### API Endpoints
Test the following endpoints:
- `POST /api/chat` - Chat with AI
- `GET /api/files` - List files
- `POST /api/files` - Create file
- `PUT /api/files/{path}` - Update file
- `DELETE /api/files/{path}` - Delete file
- `POST /api/pdf/extract` - Extract PDF text

### Browser Tests
1. Open application in browser
2. Test chat functionality
3. Test Study Mode with PDF upload
4. Test Coding Mode file operations
5. Verify theme switching
6. Test keyboard shortcuts

## Performance Tests

### Cache Performance
- Memory cache hit rate should be > 80%
- LocalStorage cache hit rate should be > 60%
- IndexedDB operations should complete in < 100ms

### Load Testing
Use Apache Bench or similar:
```bash
ab -n 1000 -c 10 http://localhost:8000/api/health
```

## Security Tests

### XSS Protection
Test input sanitization with malicious payloads:
```html
<script>alert('xss')</script>
<img src=x onerror=alert('xss')>
```

### CSRF Protection
Verify all state-changing requests include CSRF token.

## Accessibility Tests

### WCAG 2.1 Compliance
- Test keyboard navigation
- Verify screen reader compatibility
- Check color contrast ratios
- Test with reduced motion preference

## Browser Compatibility

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Responsiveness

Test on:
- iPhone (various sizes)
- Android devices
- Tablet viewports
