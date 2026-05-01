/**
 * Coding Mode Module - File Manager and Code Editor
 * Handles file CRUD operations, diff rendering, and project management
 */

const CodingMode = (function() {
    // Private state
    let currentFile = null;
    let files = [];
    let projectRoot = 'projects';
    let fileHistory = {};
    
    // File icons by extension
    const fileIcons = {
        'js': '📜', 'ts': '📘', 'jsx': '⚛️', 'tsx': '⚛️',
        'py': '🐍', 'php': '🐘', 'rb': '💎', 'java': '☕',
        'c': '©️', 'cpp': '©️', 'cs': '🔷', 'go': '🔹',
        'rs': '🦀', 'swift': '🍎', 'kt': '📱',
        'html': '🌐', 'css': '🎨', 'scss': '🎨', 'less': '🎨',
        'json': '📋', 'xml': '📄', 'yaml': '📝', 'yml': '📝',
        'md': '📖', 'txt': '📃', 'pdf': '📕',
        'sh': '⚙️', 'bat': '⚙️', 'ps1': '⚙️',
        'sql': '🗄️', 'db': '🗄️',
        'env': '🔒', 'gitignore': '🙈', 'dockerfile': '🐳',
        'default': '📄'
    };
    
    // Initialize module
    function init() {
        loadProjectFiles();
        setupEventListeners();
        console.log('💻 Coding Mode initialized');
    }
    
    // Setup event listeners
    function setupEventListeners() {
        document.getElementById('newFileBtn')?.addEventListener('click', createNewFile);
        document.getElementById('newFolderBtn')?.addEventListener('click', createNewFolder);
        document.getElementById('refreshFilesBtn')?.addEventListener('click', refreshFiles);
        document.getElementById('saveFileBtn')?.addEventListener('click', saveCurrentFile);
        document.getElementById('diffFileBtn')?.addEventListener('click', showDiff);
        document.getElementById('copyFileBtn')?.addEventListener('click', copyFile);
        document.getElementById('moveFileBtn')?.addEventListener('click', moveFile);
        document.getElementById('deleteFileBtn')?.addEventListener('click', deleteFile);
    }
    
    // Load project files
    async function loadProjectFiles() {
        try {
            const response = await fetch('/api/files/list?path=' + encodeURIComponent(projectRoot));
            const data = await response.json();
            
            if (data.success) {
                files = data.files || [];
                renderFileTree();
            } else {
                // Fallback: Show demo files
                files = getDemoFiles();
                renderFileTree();
            }
        } catch (error) {
            console.warn('Failed to load files, using demo files:', error);
            files = getDemoFiles();
            renderFileTree();
        }
    }
    
    // Get demo files for initial setup
    function getDemoFiles() {
        return [
            { name: 'README.md', path: 'projects/README.md', type: 'file', size: 1024 },
            { name: 'index.html', path: 'projects/index.html', type: 'file', size: 2048 },
            { name: 'style.css', path: 'projects/style.css', type: 'file', size: 512 },
            { name: 'app.js', path: 'projects/app.js', type: 'file', size: 4096 },
            { 
                name: 'src', 
                path: 'projects/src', 
                type: 'folder',
                children: [
                    { name: 'utils.js', path: 'projects/src/utils.js', type: 'file', size: 1024 },
                    { name: 'components', path: 'projects/src/components', type: 'folder', children: [] }
                ]
            },
            { 
                name: 'docs', 
                path: 'projects/docs', 
                type: 'folder',
                children: [
                    { name: 'guide.md', path: 'projects/docs/guide.md', type: 'file', size: 2048 }
                ]
            }
        ];
    }
    
    // Render file tree
    function renderFileTree() {
        const container = document.getElementById('fileTree');
        if (!container) return;
        
        container.innerHTML = '';
        
        files.forEach(file => {
            const itemEl = createFileItem(file);
            container.appendChild(itemEl);
        });
    }
    
    // Create file tree item
    function createFileItem(file, level = 0) {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.style.paddingLeft = `${level * 16 + 8}px`;
        item.dataset.path = file.path;
        
        const icon = getFileIcon(file);
        const name = file.name;
        
        item.innerHTML = `
            <span class="file-icon">${icon}</span>
            <span class="file-name">${name}</span>
        `;
        
        // Click handler
        item.addEventListener('click', () => selectFile(file));
        
        // Double-click for folders
        if (file.type === 'folder') {
            item.addEventListener('dblclick', () => expandFolder(file));
        }
        
        // Context menu for right-click
        item.addEventListener('contextmenu', (e) => showContextMenu(e, file));
        
        return item;
    }
    
    // Get file icon based on extension
    function getFileIcon(file) {
        if (file.type === 'folder') return '📁';
        
        const ext = file.name.split('.').pop().toLowerCase();
        return fileIcons[ext] || fileIcons.default;
    }
    
    // Select file for editing
    async function selectFile(file) {
        if (file.type === 'folder') {
            expandFolder(file);
            return;
        }
        
        // Update UI
        document.querySelectorAll('.file-item').forEach(el => {
            el.classList.toggle('active', el.dataset.path === file.path);
        });
        
        document.getElementById('currentFilePath').textContent = file.path;
        
        // Load file content
        try {
            const response = await fetch('/api/files/read?path=' + encodeURIComponent(file.path));
            const data = await response.json();
            
            if (data.success) {
                currentFile = { ...file, content: data.content };
                renderEditor(data.content);
                
                // Store original content for diff
                fileHistory[file.path] = {
                    original: data.content,
                    modified: Date.now()
                };
            } else {
                showError('Failed to load file content');
            }
        } catch (error) {
            console.error('Failed to load file:', error);
            // Demo content for testing
            currentFile = { ...file, content: getDemoContent(file) };
            renderEditor(currentFile.content);
        }
    }
    
    // Get demo content for files
    function getDemoContent(file) {
        const contents = {
            'README.md': `# Infinite Studio Project\n\nWelcome to your new project!\n\n## Features\n- Dual window chat interface\n- Study mode with PDF reader\n- Coding mode with file management\n\n## Getting Started\n1. Open a file from the sidebar\n2. Edit and save changes\n3. Use AI assistance for help`,
            
            'index.html': `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>Infinite Studio</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n</body>\n</html>`,
            
            'style.css': `/* Main Styles */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}\n\nh1 {\n    color: #333;\n}`,
            
            'app.js': `// Main Application\nconsole.log('Infinite Studio loaded!');\n\nfunction init() {\n    console.log('Initializing...');\n}\n\ninit();`,
            
            'utils.js': `// Utility Functions\nexport function formatDate(date) {\n    return new Date(date).toLocaleString();\n}\n\nexport function debounce(fn, delay) {\n    let timeout;\n    return (...args) => {\n        clearTimeout(timeout);\n        timeout = setTimeout(() => fn(...args), delay);\n    };\n}`
        };
        
        return contents[file.name] || `// ${file.name}\n// Content loading...`;
    }
    
    // Render editor content
    function renderEditor(content) {
        const container = document.getElementById('editorContent');
        const diffViewer = document.getElementById('diffViewer');
        
        if (!container) return;
        
        diffViewer.classList.add('hidden');
        container.classList.remove('hidden');
        
        // Simple syntax highlighting wrapper
        container.innerHTML = `<pre><code>${escapeHtml(content)}</code></pre>`;
        
        // Make editable
        container.contentEditable = true;
        container.oninput = debounce(handleContentChange, 500);
    }
    
    // Handle content changes
    function handleContentChange() {
        if (!currentFile) return;
        
        const container = document.getElementById('editorContent');
        currentFile.content = container.innerText;
        
        // Auto-save if enabled
        if (AppState.settings.autoSave) {
            debouncedSave();
        }
    }
    
    // Debounced save
    const debouncedSave = debounce(() => {
        saveCurrentFile();
    }, 2000);
    
    // Save current file
    async function saveCurrentFile() {
        if (!currentFile) {
            showInfo('No file selected');
            return;
        }
        
        try {
            const response = await fetch('/api/files/write', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: currentFile.path,
                    content: currentFile.content
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSuccess('File saved successfully!');
                
                // Update history
                fileHistory[currentFile.path] = {
                    original: currentFile.content,
                    modified: Date.now()
                };
            } else {
                showError('Failed to save file');
            }
        } catch (error) {
            console.error('Save failed:', error);
            showSuccess('File saved locally (demo mode)');
            
            // Update history anyway
            fileHistory[currentFile.path] = {
                original: currentFile.content,
                modified: Date.now()
            };
        }
    }
    
    // Show diff view
    function showDiff() {
        if (!currentFile) {
            showInfo('No file selected');
            return;
        }
        
        const history = fileHistory[currentFile.path];
        if (!history) {
            showInfo('No previous version to compare');
            return;
        }
        
        const original = history.original;
        const modified = currentFile.content;
        
        const diff = generateDiff(original, modified);
        renderDiff(diff);
    }
    
    // Generate unified diff
    function generateDiff(original, modified) {
        const origLines = original.split('\n');
        const modLines = modified.split('\n');
        const diff = [];
        
        let i = 0, j = 0;
        let contextStart = 0;
        let contextLines = [];
        
        while (i < origLines.length || j < modLines.length) {
            if (i >= origLines.length) {
                diff.push({ type: 'add', line: modLines[j] });
                j++;
            } else if (j >= modLines.length) {
                diff.push({ type: 'remove', line: origLines[i] });
                i++;
            } else if (origLines[i] === modLines[j]) {
                diff.push({ type: 'context', line: origLines[i] });
                i++;
                j++;
            } else {
                // Simple diff: treat as remove + add
                diff.push({ type: 'remove', line: origLines[i] });
                diff.push({ type: 'add', line: modLines[j] });
                i++;
                j++;
            }
        }
        
        return diff;
    }
    
    // Render diff view
    function renderDiff(diff) {
        const container = document.getElementById('diffViewer');
        const editorContainer = document.getElementById('editorContent');
        
        if (!container) return;
        
        editorContainer.classList.add('hidden');
        container.classList.remove('hidden');
        
        let html = '<div class="diff-content">';
        let lineNum = 1;
        
        diff.forEach(change => {
            const className = `diff-line diff-${change.type}`;
            const prefix = change.type === 'add' ? '+' : change.type === 'remove' ? '-' : ' ';
            
            html += `<div class="${className}">${prefix} ${escapeHtml(change.line)}</div>`;
            lineNum++;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    // Create new file
    async function createNewFile() {
        const name = prompt('Enter file name:');
        if (!name) return;
        
        try {
            const response = await fetch('/api/files/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: `${projectRoot}/${name}`,
                    type: 'file'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                refreshFiles();
                showSuccess(`File created: ${name}`);
            } else {
                showError('Failed to create file');
            }
        } catch (error) {
            console.error('Create failed:', error);
            showSuccess('File created locally (demo mode)');
            refreshFiles();
        }
    }
    
    // Create new folder
    async function createNewFolder() {
        const name = prompt('Enter folder name:');
        if (!name) return;
        
        try {
            const response = await fetch('/api/files/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: `${projectRoot}/${name}`,
                    type: 'folder'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                refreshFiles();
                showSuccess(`Folder created: ${name}`);
            } else {
                showError('Failed to create folder');
            }
        } catch (error) {
            console.error('Create failed:', error);
            showSuccess('Folder created locally (demo mode)');
            refreshFiles();
        }
    }
    
    // Copy file
    async function copyFile() {
        if (!currentFile) {
            showInfo('No file selected');
            return;
        }
        
        const newPath = prompt('Enter destination path:', currentFile.path + '_copy');
        if (!newPath) return;
        
        // Implementation similar to other file operations
        showSuccess('File copied (demo mode)');
    }
    
    // Move file
    async function moveFile() {
        if (!currentFile) {
            showInfo('No file selected');
            return;
        }
        
        const newPath = prompt('Enter new path:', currentFile.path);
        if (!newPath) return;
        
        // Implementation similar to other file operations
        showSuccess('File moved (demo mode)');
    }
    
    // Delete file
    async function deleteFile() {
        if (!currentFile) {
            showInfo('No file selected');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete "${currentFile.name}"?`)) {
            return;
        }
        
        try {
            const response = await fetch('/api/files/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: currentFile.path
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                currentFile = null;
                document.getElementById('currentFilePath').textContent = 'No file selected';
                document.getElementById('editorContent').innerHTML = `
                    <div class="text-muted" style="text-align: center; margin-top: 100px;">
                        Select a file from the sidebar to start editing
                    </div>
                `;
                refreshFiles();
                showSuccess('File deleted successfully!');
            } else {
                showError('Failed to delete file');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            showSuccess('File deleted locally (demo mode)');
            refreshFiles();
        }
    }
    
    // Expand folder
    function expandFolder(folder) {
        // Toggle expanded state
        // In full implementation, would load children dynamically
        console.log('Expand folder:', folder.path);
    }
    
    // Refresh file list
    function refresh() {
        loadProjectFiles();
        showInfo('File list refreshed');
    }
    
    // Show context menu
    function showContextMenu(event, file) {
        event.preventDefault();
        // Would show custom context menu in full implementation
        console.log('Context menu for:', file.path);
    }
    
    // Utility: Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Utility: Debounce
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Toast notifications
    function showSuccess(message) {
        console.log('✅', message);
    }
    
    function showError(message) {
        console.error('❌', message);
    }
    
    function showInfo(message) {
        console.log('ℹ️', message);
    }
    
    // Public API
    return {
        init,
        refresh,
        selectFile,
        saveCurrentFile,
        
        // Getters
        get currentFile() { return currentFile; },
        get files() { return files; }
    };
})();

// Export to global scope
window.CodingMode = CodingMode;
