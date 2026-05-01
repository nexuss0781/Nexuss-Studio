/**
 * API Module - Backend Communication Layer
 * Handles all server-side API calls for file operations, chat, and persistence
 */

const APIModule = (function() {
    // Base URL configuration
    const baseURL = window.location.origin;
    
    // Request timeout
    const timeout = 30000; // 30 seconds
    
    // Request cache
    let requestCache = new Map();
    
    // Initialize module
    function init() {
        console.log('🔌 API Module initialized');
    }
    
    // Generic fetch wrapper with timeout and caching
    async function fetch(endpoint, options = {}) {
        const url = `${baseURL}${endpoint}`;
        const cacheKey = generateCacheKey(url, options);
        
        // Check cache for GET requests
        if (options.method === 'GET' || !options.method) {
            const cached = requestCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < 5000) { // 5 second cache
                return cached.data;
            }
        }
        
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache successful GET responses
            if (options.method === 'GET' || !options.method) {
                requestCache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
            }
            
            return data;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            throw error;
        }
    }
    
    // Generate cache key for requests
    function generateCacheKey(url, options) {
        return `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || '')}`;
    }
    
    // Clear request cache
    function clearCache() {
        requestCache.clear();
    }
    
    // ========================================================================
    // Chat API Endpoints
    // ========================================================================
    
    // Send message to AI
    async function chat(message, context = null) {
        return fetch('/api/chat', {
            method: 'POST',
            body: JSON.stringify({
                message,
                context,
                model: AppState.currentModel,
                sessionId: AppState.sessionId
            })
        });
    }
    
    // Get chat history
    async function getChatHistory(sessionId) {
        return fetch(`/api/history?sessionId=${sessionId}`);
    }
    
    // Save chat history
    async function saveChatHistory(sessionId, messages) {
        return fetch('/api/history/save', {
            method: 'POST',
            body: JSON.stringify({
                sessionId,
                messages
            })
        });
    }
    
    // Delete chat history
    async function deleteChatHistory(sessionId) {
        return fetch(`/api/history?sessionId=${sessionId}`, {
            method: 'DELETE'
        });
    }
    
    // ========================================================================
    // File Management API Endpoints
    // ========================================================================
    
    // List files in directory
    async function listFiles(path = 'projects') {
        return fetch(`/api/files/list?path=${encodeURIComponent(path)}`);
    }
    
    // Read file content
    async function readFile(path) {
        return fetch(`/api/files/read?path=${encodeURIComponent(path)}`);
    }
    
    // Write file content
    async function writeFile(path, content) {
        return fetch('/api/files/write', {
            method: 'POST',
            body: JSON.stringify({ path, content })
        });
    }
    
    // Create file or folder
    async function createFile(path, type = 'file') {
        return fetch('/api/files/create', {
            method: 'POST',
            body: JSON.stringify({ path, type })
        });
    }
    
    // Delete file or folder
    async function deleteFile(path) {
        return fetch('/api/files/delete', {
            method: 'DELETE',
            body: JSON.stringify({ path })
        });
    }
    
    // Move file or folder
    async function moveFile(fromPath, toPath) {
        return fetch('/api/files/move', {
            method: 'POST',
            body: JSON.stringify({ from: fromPath, to: toPath })
        });
    }
    
    // Copy file or folder
    async function copyFile(fromPath, toPath) {
        return fetch('/api/files/copy', {
            method: 'POST',
            body: JSON.stringify({ from: fromPath, to: toPath })
        });
    }
    
    // Get file diff
    async function getDiff(path1, path2) {
        return fetch(`/api/diff?path1=${encodeURIComponent(path1)}&path2=${encodeURIComponent(path2)}`);
    }
    
    // ========================================================================
    // Project Management API Endpoints
    // ========================================================================
    
    // List all projects
    async function listProjects() {
        return fetch('/api/projects');
    }
    
    // Create new project
    async function createProject(name, template = 'default') {
        return fetch('/api/projects', {
            method: 'POST',
            body: JSON.stringify({ name, template })
        });
    }
    
    // Get project details
    async function getProject(id) {
        return fetch(`/api/projects/${id}`);
    }
    
    // Update project
    async function updateProject(id, data) {
        return fetch(`/api/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    // Delete project
    async function deleteProject(id) {
        return fetch(`/api/projects/${id}`, {
            method: 'DELETE'
        });
    }
    
    // ========================================================================
    // PDF Processing API Endpoints
    // ========================================================================
    
    // Upload PDF
    async function uploadPdf(file) {
        const formData = new FormData();
        formData.append('pdf', file);
        
        return fetch('/api/pdf/upload', {
            method: 'POST',
            body: formData
        });
    }
    
    // Extract text from PDF page
    async function extractPdfText(pdfId, pageNum) {
        return fetch(`/api/pdf/extract?pdfId=${pdfId}&page=${pageNum}`);
    }
    
    // Get PDF info
    async function getPdfInfo(pdfId) {
        return fetch(`/api/pdf/info?pdfId=${pdfId}`);
    }
    
    // ========================================================================
    // Cache API Endpoints
    // ========================================================================
    
    // Clear server cache
    async function clearServerCache() {
        return fetch('/api/cache/clear', {
            method: 'POST'
        });
    }
    
    // Get cache statistics
    async function getCacheStats() {
        return fetch('/api/cache/stats');
    }
    
    // ========================================================================
    // System API Endpoints
    // ========================================================================
    
    // Health check
    async function healthCheck() {
        return fetch('/api/health');
    }
    
    // Get system info
    async function getSystemInfo() {
        return fetch('/api/system/info');
    }
    
    // Get available models
    async function getAvailableModels() {
        return fetch('/api/models');
    }
    
    // ========================================================================
    // Batch Operations
    // ========================================================================
    
    // Execute multiple file operations
    async function batchFileOperations(operations) {
        return fetch('/api/files/batch', {
            method: 'POST',
            body: JSON.stringify({ operations })
        });
    }
    
    // Search across files
    async function searchFiles(query, options = {}) {
        return fetch('/api/files/search', {
            method: 'POST',
            body: JSON.stringify({ query, options })
        });
    }
    
    // Public API
    return {
        init,
        fetch,
        clearCache,
        
        // Chat
        chat,
        getChatHistory,
        saveChatHistory,
        deleteChatHistory,
        
        // Files
        listFiles,
        readFile,
        writeFile,
        createFile,
        deleteFile,
        moveFile,
        copyFile,
        getDiff,
        batchFileOperations,
        searchFiles,
        
        // Projects
        listProjects,
        createProject,
        getProject,
        updateProject,
        deleteProject,
        
        // PDF
        uploadPdf,
        extractPdfText,
        getPdfInfo,
        
        // Cache
        clearServerCache,
        getCacheStats,
        
        // System
        healthCheck,
        getSystemInfo,
        getAvailableModels
    };
})();

// Export to global scope
window.APIModule = APIModule;
