/**
 * Infinite Studio - Main Application Entry Point
 * Initializes the application and coordinates all modules
 */

// ============================================================================
// Application State
// ============================================================================
const AppState = {
    currentMode: 'study',
    currentModel: 'gpt-4-turbo',
    theme: 'dark',
    sessionId: null,
    projects: [],
    settings: {
        autoSave: true,
        cacheEnabled: true,
        maxCacheSize: 100 * 1024 * 1024, // 100MB
    }
};

// ============================================================================
// Initialize Application
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Infinite Studio Initializing...');
    
    // Initialize session
    initializeSession();
    
    // Load saved settings
    loadSettings();
    
    // Initialize UI components
    initializeUI();
    
    // Initialize modules
    ChatModule.init();
    StudyMode.init();
    CodingMode.init();
    CacheModule.init();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load projects
    loadProjects();
    
    console.log('✅ Infinite Studio Ready!');
});

// ============================================================================
// Session Management
// ============================================================================
function initializeSession() {
    const savedSession = localStorage.getItem('infinite_studio_session');
    if (savedSession) {
        AppState.sessionId = JSON.parse(savedSession).sessionId;
    } else {
        AppState.sessionId = generateUUID();
        saveSession();
    }
}

function saveSession() {
    localStorage.setItem('infinite_studio_session', JSON.stringify({
        sessionId: AppState.sessionId,
        timestamp: Date.now()
    }));
}

// ============================================================================
// Settings Management
// ============================================================================
function loadSettings() {
    const savedSettings = localStorage.getItem('infinite_studio_settings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        AppState.theme = settings.theme || 'dark';
        AppState.currentModel = settings.model || 'gpt-4-turbo';
        AppState.settings = { ...AppState.settings, ...settings };
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', AppState.theme);
        
        // Apply model selection
        document.getElementById('modelSelector').value = AppState.currentModel;
    }
}

function saveSettings() {
    localStorage.setItem('infinite_studio_settings', JSON.stringify({
        theme: AppState.theme,
        model: AppState.currentModel,
        autoSave: AppState.settings.autoSave,
        cacheEnabled: AppState.settings.cacheEnabled
    }));
}

// ============================================================================
// UI Initialization
// ============================================================================
function initializeUI() {
    // Initialize resizable divider
    initResizableDivider();
    
    // Initialize auto-resize textarea
    initAutoResizeTextarea();
}

function initResizableDivider() {
    const divider = document.getElementById('windowDivider');
    const leftPanel = document.querySelector('.chat-panel');
    const rightPanel = document.querySelector('.workspace-panel');
    
    let isResizing = false;
    
    divider.addEventListener('mousedown', (e) => {
        isResizing = true;
        divider.classList.add('active');
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const containerWidth = document.querySelector('.main-content').offsetWidth;
        const percentage = (e.clientX / containerWidth) * 100;
        
        if (percentage > 20 && percentage < 80) {
            leftPanel.style.flex = `0 0 ${percentage}%`;
            rightPanel.style.flex = `0 0 ${100 - percentage}%`;
        }
    });
    
    document.addEventListener('mouseup', () => {
        isResizing = false;
        divider.classList.remove('active');
        document.body.style.cursor = '';
    });
}

function initAutoResizeTextarea() {
    const textarea = document.getElementById('chatInput');
    
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px';
    });
}

// ============================================================================
// Event Listeners Setup
// ============================================================================
function setupEventListeners() {
    // Theme Toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Model Selector
    document.getElementById('modelSelector').addEventListener('change', (e) => {
        AppState.currentModel = e.target.value;
        saveSettings();
    });
    
    // Mode Switcher
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.target.dataset.mode;
            switchMode(mode);
        });
    });
    
    // Send Button
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    
    // Chat Input Enter Key
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Clear Chat
    document.getElementById('clearChatBtn').addEventListener('click', clearChat);
    
    // Export Chat
    document.getElementById('exportChatBtn').addEventListener('click', exportChat);
    
    // PDF Upload
    document.getElementById('uploadPdfBtn').addEventListener('click', () => {
        document.getElementById('pdfFileInput').click();
    });
    
    document.getElementById('pdfFileInput').addEventListener('change', handlePdfUpload);
    
    // PDF Navigation
    document.getElementById('prevPageBtn').addEventListener('click', () => {
        StudyMode.navigateToPage(StudyMode.currentPage - 1);
    });
    
    document.getElementById('nextPageBtn').addEventListener('click', () => {
        StudyMode.navigateToPage(StudyMode.currentPage + 1);
    });
    
    // Analyze Page
    document.getElementById('analyzePageBtn').addEventListener('click', analyzeCurrentPage);
}

// ============================================================================
// Theme Management
// ============================================================================
function toggleTheme() {
    AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', AppState.theme);
    
    const toggleBtn = document.getElementById('themeToggle');
    toggleBtn.textContent = AppState.theme === 'dark' ? '🌙' : '☀️';
    
    saveSettings();
}

// ============================================================================
// Mode Switching
// ============================================================================
function switchMode(mode) {
    AppState.currentMode = mode;
    
    // Update button states
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Show/hide mode containers
    const studyMode = document.getElementById('studyMode');
    const codingMode = document.getElementById('codingMode');
    
    if (mode === 'study') {
        studyMode.classList.remove('hidden');
        codingMode.classList.add('hidden');
    } else {
        studyMode.classList.add('hidden');
        codingMode.classList.remove('hidden');
        CodingMode.refresh();
    }
}

// ============================================================================
// Message Handling
// ============================================================================
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    ChatModule.addMessage('user', message);
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Get context from workspace if available
    const context = getWorkspaceContext();
    
    // Send to AI
    await ChatModule.sendToAI(message, context);
}

function getWorkspaceContext() {
    const context = {
        mode: AppState.currentMode,
        data: null
    };
    
    if (AppState.currentMode === 'study' && StudyMode.currentPdf) {
        context.data = {
            type: 'pdf',
            page: StudyMode.currentPage,
            totalPages: StudyMode.totalPages
        };
    } else if (AppState.currentMode === 'coding' && CodingMode.currentFile) {
        context.data = {
            type: 'file',
            path: CodingMode.currentFile.path,
            content: CodingMode.currentFile.content
        };
    }
    
    return context;
}

async function analyzeCurrentPage() {
    if (!StudyMode.currentPdf) {
        alert('Please upload a PDF first');
        return;
    }
    
    const pageContent = await StudyMode.extractPageText(StudyMode.currentPage);
    
    const message = `Please analyze this PDF page content:\n\n${pageContent}`;
    ChatModule.addMessage('user', message);
    
    await ChatModule.sendToAI(message, {
        type: 'pdf_analysis',
        page: StudyMode.currentPage,
        content: pageContent
    });
}

// ============================================================================
// Chat Management
// ============================================================================
function clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = '';
        
        // Add welcome message back
        ChatModule.addWelcomeMessage();
        
        // Clear from storage
        ChatModule.clearHistory();
    }
}

function exportChat() {
    const history = ChatModule.getHistory();
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

// ============================================================================
// Project Management
// ============================================================================
function loadProjects() {
    const savedProjects = localStorage.getItem('infinite_studio_projects');
    if (savedProjects) {
        AppState.projects = JSON.parse(savedProjects);
    }
}

function saveProjects() {
    localStorage.setItem('infinite_studio_projects', JSON.stringify(AppState.projects));
}

// ============================================================================
// Utility Functions
// ============================================================================
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
}

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

// ============================================================================
// PDF Upload Handler
// ============================================================================
async function handlePdfUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
        alert('Please select a valid PDF file');
        return;
    }
    
    await StudyMode.loadPdf(file);
}

// Export for use in other modules
window.AppState = AppState;
window.switchMode = switchMode;
window.sendMessage = sendMessage;
window.toggleTheme = toggleTheme;
