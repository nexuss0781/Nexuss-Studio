<?php
/**
 * Nexus Studio - Main Entry Point
 * PHP Backend Server for InfinityFree
 */

// Disable error display in production (InfinityFree requirement)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Set default timezone
date_default_timezone_set('UTC');

// Define base path
define('BASE_PATH', __DIR__);
define('PROJECTS_PATH', BASE_PATH . '/projects');
define('HISTORY_PATH', BASE_PATH . '/history');
define('CACHE_PATH', BASE_PATH . '/cache');
define('TEMP_PATH', BASE_PATH . '/temp');
define('LOGS_PATH', BASE_PATH . '/logs');

// Ensure directories exist with proper permissions
ensureDirectory(PROJECTS_PATH, 0755);
ensureDirectory(HISTORY_PATH, 0755);
ensureDirectory(CACHE_PATH, 0755);
ensureDirectory(TEMP_PATH, 0755);
ensureDirectory(LOGS_PATH, 0755);

// Autoloader
spl_autoload_register(function ($class) {
    $file = BASE_PATH . '/src/php/' . str_replace('\\', '/', $class) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// Handle API requests
handleRequest();

/**
 * Ensure directory exists with proper permissions
 */
function ensureDirectory($path, $permissions = 0755) {
    if (!is_dir($path)) {
        @mkdir($path, $permissions, true);
        @chmod($path, $permissions);
    }
}

/**
 * Main request handler
 */
function handleRequest() {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Route handling
    if (strpos($uri, '/api/') === 0) {
        handleApiRequest($uri, $method);
    } else {
        serveStaticFile($uri);
    }
}

/**
 * Handle API requests - InfinityFree Compatible
 */
function handleApiRequest($uri, $method) {
    // Send headers early to prevent 403 on InfinityFree
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
    }
    
    // Handle preflight
    if ($method === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
    
    // Parse endpoint
    $endpoint = str_replace('/api/', '', $uri);
    $parts = explode('/', $endpoint);
    $resource = $parts[0] ?? '';
    
    try {
        switch ($resource) {
            case 'chat':
                handleChat($method);
                break;
                
            case 'history':
                handleHistory($method);
                break;
                
            case 'files':
                handleFiles($method, $parts);
                break;
                
            case 'projects':
                handleProjects($method, $parts);
                break;
                
            case 'pdf':
                handlePdf($method);
                break;
                
            case 'cache':
                handleCache($method, $parts);
                break;
                
            case 'health':
                handleHealth();
                break;
                
            default:
                sendJson(['error' => 'Unknown endpoint'], 404);
        }
    } catch (Exception $e) {
        sendJson(['error' => $e->getMessage()], 500);
    }
}

/**
 * Handle chat requests
 */
function handleChat($method) {
    if ($method !== 'POST') {
        sendJson(['error' => 'Method not allowed'], 405);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $message = $input['message'] ?? '';
    $context = $input['context'] ?? null;
    $model = $input['model'] ?? 'gpt-4-turbo';
    $sessionId = $input['sessionId'] ?? '';
    
    // Log message to history
    if ($sessionId) {
        logMessage($sessionId, 'user', $message);
    }
    
    // For now, return a demo response
    // In production, integrate with puter.js or other AI services
    $response = generateDemoResponse($message, $context);
    
    // Log AI response
    if ($sessionId) {
        logMessage($sessionId, 'assistant', $response);
    }
    
    sendJson([
        'success' => true,
        'response' => $response,
        'model' => $model
    ]);
}

/**
 * Generate demo response (replace with actual AI integration)
 */
function generateDemoResponse($message, $context) {
    $responses = [
        "I understand you're asking about: \"" . substr($message, 0, 50) . "...\"",
        "That's a great question! Let me help you with that.",
        "Based on my analysis, here's what I found:",
        "Would you like me to elaborate on any specific aspect?",
        "I can assist you with coding, document analysis, or general questions."
    ];
    
    return implode("\n\n", $responses);
}

/**
 * Handle history requests
 */
function handleHistory($method, $parts = []) {
    $sessionId = $_GET['sessionId'] ?? '';
    
    switch ($method) {
        case 'GET':
            if (!$sessionId) {
                sendJson(['error' => 'Session ID required'], 400);
                return;
            }
            
            $history = loadHistory($sessionId);
            sendJson(['success' => true, 'messages' => $history]);
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            $sessionId = $input['sessionId'] ?? '';
            $messages = $input['messages'] ?? [];
            
            if (!$sessionId) {
                sendJson(['error' => 'Session ID required'], 400);
                return;
            }
            
            saveHistory($sessionId, $messages);
            sendJson(['success' => true]);
            break;
            
        case 'DELETE':
            if (!$sessionId) {
                sendJson(['error' => 'Session ID required'], 400);
                return;
            }
            
            deleteHistory($sessionId);
            sendJson(['success' => true]);
            break;
            
        default:
            sendJson(['error' => 'Method not allowed'], 405);
    }
}

/**
 * Handle file operations
 */
function handleFiles($method, $parts) {
    $action = $parts[1] ?? '';
    
    switch ($action) {
        case 'list':
            $path = $_GET['path'] ?? PROJECTS_PATH;
            $files = listFiles($path);
            sendJson(['success' => true, 'files' => $files]);
            break;
            
        case 'read':
            $path = $_GET['path'] ?? '';
            if (!$path) {
                sendJson(['error' => 'Path required'], 400);
                return;
            }
            $content = readFile($path);
            sendJson(['success' => true, 'content' => $content]);
            break;
            
        case 'write':
            if ($method !== 'POST') {
                sendJson(['error' => 'Method not allowed'], 405);
                return;
            }
            $input = json_decode(file_get_contents('php://input'), true);
            $path = $input['path'] ?? '';
            $content = $input['content'] ?? '';
            
            if (!$path) {
                sendJson(['error' => 'Path required'], 400);
                return;
            }
            
            writeFile($path, $content);
            sendJson(['success' => true]);
            break;
            
        case 'create':
            if ($method !== 'POST') {
                sendJson(['error' => 'Method not allowed'], 405);
                return;
            }
            $input = json_decode(file_get_contents('php://input'), true);
            $path = $input['path'] ?? '';
            $type = $input['type'] ?? 'file';
            
            if (!$path) {
                sendJson(['error' => 'Path required'], 400);
                return;
            }
            
            createFileOrFolder($path, $type);
            sendJson(['success' => true]);
            break;
            
        case 'delete':
            if ($method !== 'DELETE') {
                sendJson(['error' => 'Method not allowed'], 405);
                return;
            }
            $input = json_decode(file_get_contents('php://input'), true);
            $path = $input['path'] ?? '';
            
            if (!$path) {
                sendJson(['error' => 'Path required'], 400);
                return;
            }
            
            deleteFileOrFolder($path);
            sendJson(['success' => true]);
            break;
            
        default:
            sendJson(['error' => 'Unknown action'], 400);
    }
}

/**
 * Handle project operations
 */
function handleProjects($method, $parts) {
    switch ($method) {
        case 'GET':
            $projects = listProjects();
            sendJson(['success' => true, 'projects' => $projects]);
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            $name = $input['name'] ?? 'Untitled Project';
            $template = $input['template'] ?? 'default';
            
            $project = createProject($name, $template);
            sendJson(['success' => true, 'project' => $project]);
            break;
            
        default:
            sendJson(['error' => 'Method not allowed'], 405);
    }
}

/**
 * Handle PDF operations
 */
function handlePdf($method) {
    sendJson(['error' => 'PDF processing requires external library'], 501);
}

/**
 * Handle cache operations
 */
function handleCache($method, $parts) {
    $action = $parts[1] ?? '';
    
    switch ($action) {
        case 'clear':
            clearCache();
            sendJson(['success' => true]);
            break;
            
        case 'stats':
            $stats = getCacheStats();
            sendJson(['success' => true, 'stats' => $stats]);
            break;
            
        default:
            sendJson(['error' => 'Unknown action'], 400);
    }
}

/**
 * Health check endpoint
 */
function handleHealth() {
    sendJson([
        'status' => 'healthy',
        'timestamp' => date('c'),
        'version' => '1.0.0'
    ]);
}

/**
 * Serve static files - InfinityFree Compatible
 */
function serveStaticFile($uri) {
    // Default to index.html
    if ($uri === '/' || $uri === '') {
        $uri = '/templates/index.html';
    }
    
    $path = BASE_PATH . $uri;
    
    // Security: prevent directory traversal
    $realPath = @realpath($path);
    if ($realPath === false || strpos($realPath, BASE_PATH) !== 0) {
        http_response_code(404);
        echo '404 Not Found';
        return;
    }
    
    if (!file_exists($path)) {
        http_response_code(404);
        echo '404 Not Found';
        return;
    }
    
    // Set content type with charset
    $ext = pathinfo($path, PATHINFO_EXTENSION);
    $mimeTypes = [
        'html' => 'text/html; charset=utf-8',
        'css' => 'text/css; charset=utf-8',
        'js' => 'application/javascript; charset=utf-8',
        'json' => 'application/json; charset=utf-8',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        'pdf' => 'application/pdf'
    ];
    
    $contentType = $mimeTypes[$ext] ?? 'text/plain';
    
    // Send headers safely
    if (!headers_sent()) {
        header("Content-Type: $contentType");
        header('X-Content-Type-Options: nosniff');
        
        // Cache control for static assets
        if (in_array($ext, ['css', 'js', 'png', 'jpg', 'gif', 'svg', 'ico'])) {
            header('Cache-Control: public, max-age=2592000'); // 30 days
        }
    }
    
    // Read and output file
    @readfile($path);
}

/**
 * File system helpers
 */
function listFiles($path) {
    $files = [];
    $safePath = getSafePath($path);
    
    if (!is_dir($safePath)) {
        return $files;
    }
    
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($safePath),
        RecursiveIteratorIterator::SELF_FIRST
    );
    
    foreach ($iterator as $file) {
        if ($file->getFilename() === '.' || $file->getFilename() === '..') {
            continue;
        }
        
        $files[] = [
            'name' => $file->getFilename(),
            'path' => $file->getPathname(),
            'type' => $file->isDir() ? 'folder' : 'file',
            'size' => $file->isFile() ? $file->getSize() : 0
        ];
    }
    
    return $files;
}

function readFile($path) {
    $safePath = getSafePath($path);
    
    if (!file_exists($safePath)) {
        throw new Exception('File not found');
    }
    
    if (!is_file($safePath)) {
        throw new Exception('Not a file');
    }
    
    return file_get_contents($safePath);
}

function writeFile($path, $content) {
    $safePath = getSafePath($path);
    
    // Create directory if needed
    $dir = dirname($safePath);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    
    file_put_contents($safePath, $content);
}

function createFileOrFolder($path, $type) {
    $safePath = getSafePath($path);
    
    if ($type === 'folder') {
        if (!is_dir($safePath)) {
            mkdir($safePath, 0755, true);
        }
    } else {
        $dir = dirname($safePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        if (!file_exists($safePath)) {
            file_put_contents($safePath, '');
        }
    }
}

function deleteFileOrFolder($path) {
    $safePath = getSafePath($path);
    
    if (is_dir($safePath)) {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($safePath, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        
        foreach ($iterator as $file) {
            if ($file->isDir()) {
                rmdir($file->getPathname());
            } else {
                unlink($file->getPathname());
            }
        }
        
        rmdir($safePath);
    } else {
        unlink($safePath);
    }
}

function getSafePath($path) {
    // Prevent directory traversal
    $basePaths = [PROJECTS_PATH, HISTORY_PATH, CACHE_PATH];
    $resolved = realpath($path) ?: $path;
    
    foreach ($basePaths as $basePath) {
        if (strpos($resolved, $basePath) === 0) {
            return $resolved;
        }
    }
    
    // Default to projects if path is relative
    if (strpos($path, '/') !== 0) {
        return PROJECTS_PATH . '/' . $path;
    }
    
    throw new Exception('Invalid path');
}

/**
 * History management
 */
function logMessage($sessionId, $role, $content) {
    $history = loadHistory($sessionId);
    $history[] = [
        'role' => $role,
        'content' => $content,
        'timestamp' => date('c')
    ];
    saveHistory($sessionId, $history);
}

function loadHistory($sessionId) {
    $file = HISTORY_PATH . "/{$sessionId}.json";
    
    if (!file_exists($file)) {
        return [];
    }
    
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

function saveHistory($sessionId, $messages) {
    $file = HISTORY_PATH . "/{$sessionId}.json";
    file_put_contents($file, json_encode($messages, JSON_PRETTY_PRINT));
}

function deleteHistory($sessionId) {
    $file = HISTORY_PATH . "/{$sessionId}.json";
    
    if (file_exists($file)) {
        unlink($file);
    }
}

/**
 * Project management
 */
function listProjects() {
    return listFiles(PROJECTS_PATH);
}

function createProject($name, $template) {
    $safeName = preg_replace('/[^a-zA-Z0-9_-]/', '', $name);
    $path = PROJECTS_PATH . "/{$safeName}";
    
    if (!is_dir($path)) {
        mkdir($path, 0755, true);
    }
    
    // Create basic structure
    $files = [
        'README.md' => "# {$name}\n\nCreated: " . date('c'),
        'index.html' => '<!DOCTYPE html><html><head><title>' . $name . '</title></head><body></body></html>',
        'style.css' => '/* Styles */',
        'app.js' => '// Application code'
    ];
    
    foreach ($files as $filename => $content) {
        file_put_contents("{$path}/{$filename}", $content);
    }
    
    return ['name' => $name, 'path' => $path];
}

/**
 * Cache management
 */
function clearCache() {
    $files = glob(CACHE_PATH . '/*');
    
    foreach ($files as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }
}

function getCacheStats() {
    $files = glob(CACHE_PATH . '/*');
    $totalSize = 0;
    
    foreach ($files as $file) {
        if (is_file($file)) {
            $totalSize += filesize($file);
        }
    }
    
    return [
        'files' => count($files),
        'size' => $totalSize,
        'sizeFormatted' => formatBytes($totalSize)
    ];
}

function formatBytes($bytes) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= pow(1024, $pow);
    
    return round($bytes, 2) . ' ' . $units[$pow];
}

/**
 * JSON response helper
 */
function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}
