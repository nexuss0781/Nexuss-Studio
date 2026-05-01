/**
 * Keyboard Shortcuts Manager
 * Advanced keyboard shortcut system for power users
 * Part of Infinite Free Ready PHP/JS Studio
 */

class ShortcutManager {
    constructor() {
        this.shortcuts = new Map();
        this.activeContext = 'global';
        this.contexts = ['global', 'chat', 'study', 'coding', 'settings'];
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.registerDefaultShortcuts();
    }

    registerDefaultShortcuts() {
        // Global shortcuts
        this.register('ctrl+k', 'global', () => this.focusSearch(), 'Focus search bar');
        this.register('ctrl+/', 'global', () => this.toggleHelp(), 'Show/hide shortcuts help');
        this.register('ctrl+,', 'global', () => this.openSettings(), 'Open settings');
        this.register('ctrl+shift+l', 'global', () => this.toggleTheme(), 'Toggle dark/light theme');
        
        // Chat shortcuts
        this.register('ctrl+enter', 'chat', () => this.sendChatMessage(), 'Send chat message');
        this.register('escape', 'chat', () => this.clearChatInput(), 'Clear chat input');
        this.register('ctrl+shift+c', 'chat', () => this.copyLastResponse(), 'Copy last AI response');
        
        // Study mode shortcuts
        this.register('ctrl+o', 'study', () => this.openPdfFile(), 'Open PDF file');
        this.register('ctrl+n', 'study', () => this.nextPage(), 'Next page');
        this.register('ctrl+p', 'study', () => this.prevPage(), 'Previous page');
        this.register('ctrl+z', 'study', () => this.zoomIn(), 'Zoom in');
        this.register('ctrl+x', 'study', () => this.zoomOut(), 'Zoom out');
        this.register('ctrl+0', 'study', () => this.resetZoom(), 'Reset zoom');
        this.register('ctrl+f', 'study', () => this.searchInPdf(), 'Search in PDF');
        
        // Coding mode shortcuts
        this.register('ctrl+s', 'coding', () => this.saveFile(), 'Save current file');
        this.register('ctrl+shift+n', 'coding', () => this.newFile(), 'Create new file');
        this.register('ctrl+shift+d', 'coding', () => this.duplicateFile(), 'Duplicate file');
        this.register('ctrl+shift+m', 'coding', () => this.moveFile(), 'Move file/folder');
        this.register('ctrl+shift+r', 'coding', () => this.renameFile(), 'Rename file/folder');
        this.register('ctrl+delete', 'coding', () => this.deleteFile(), 'Delete file/folder');
        this.register('ctrl+shift+v', 'coding', () => this.viewDiff(), 'View file diff');
        this.register('ctrl+alt+f', 'coding', () => this.findInFiles(), 'Find in files');
        this.register('ctrl+alt+r', 'coding', () => this.replaceInFiles(), 'Replace in files');
        
        // Navigation shortcuts
        this.register('ctrl+1', 'global', () => this.switchToChat(), 'Switch to chat window');
        this.register('ctrl+2', 'global', () => this.switchToStudy(), 'Switch to study window');
        this.register('ctrl+3', 'global', () => this.switchToCoding(), 'Switch to coding window');
        this.register('ctrl+tab', 'global', () => this.nextWindow(), 'Next window');
        this.register('ctrl+shift+tab', 'global', () => this.prevWindow(), 'Previous window');
        
        // Voice shortcuts
        this.register('ctrl+shift+v', 'global', () => this.toggleVoiceInput(), 'Toggle voice input');
        this.register('ctrl+shift+s', 'global', () => this.toggleVoiceOutput(), 'Toggle voice output');
    }

    register(key, context, callback, description = '') {
        const shortcutKey = key.toLowerCase();
        if (!this.shortcuts.has(shortcutKey)) {
            this.shortcuts.set(shortcutKey, {});
        }
        this.shortcuts.get(shortcutKey)[context] = { callback, description };
    }

    handleKeyDown(e) {
        const key = this.normalizeKey(e);
        
        // Check global shortcuts first
        if (this.shortcuts.has(key) && this.shortcuts.get(key)['global']) {
            e.preventDefault();
            this.shortcuts.get(key)['global'].callback();
            return;
        }
        
        // Then check context-specific shortcuts
        if (this.shortcuts.has(key) && this.shortcuts.get(key)[this.activeContext]) {
            e.preventDefault();
            this.shortcuts.get(key)[this.activeContext].callback();
            return;
        }
    }

    normalizeKey(e) {
        const parts = [];
        
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');
        
        const key = e.key.toLowerCase();
        if (key !== 'control' && key !== 'shift' && key !== 'alt' && key !== 'meta') {
            parts.push(key);
        }
        
        return parts.join('+');
    }

    setContext(context) {
        if (this.contexts.includes(context)) {
            this.activeContext = context;
        }
    }

    getShortcutsForContext(context) {
        const result = [];
        for (const [key, contexts] of this.shortcuts.entries()) {
            if (contexts[context]) {
                result.push({
                    key,
                    description: contexts[context].description
                });
            }
        }
        return result;
    }

    getAllShortcuts() {
        const result = {};
        for (const context of this.contexts) {
            result[context] = this.getShortcutsForContext(context);
        }
        return result;
    }

    // Action methods (to be connected to actual functionality)
    focusSearch() {
        console.log('Focusing search bar');
        const searchInput = document.querySelector('#search-input');
        if (searchInput) searchInput.focus();
    }

    toggleHelp() {
        console.log('Toggling shortcuts help');
        const helpModal = document.querySelector('#shortcuts-help');
        if (helpModal) {
            helpModal.style.display = helpModal.style.display === 'none' ? 'block' : 'none';
        }
    }

    openSettings() {
        console.log('Opening settings');
    }

    toggleTheme() {
        console.log('Toggling theme');
        document.body.classList.toggle('dark-theme');
    }

    sendChatMessage() {
        console.log('Sending chat message');
        const sendButton = document.querySelector('#send-message-btn');
        if (sendButton) sendButton.click();
    }

    clearChatInput() {
        console.log('Clearing chat input');
        const input = document.querySelector('#chat-input');
        if (input) input.value = '';
    }

    copyLastResponse() {
        console.log('Copying last response');
    }

    openPdfFile() {
        console.log('Opening PDF file');
    }

    nextPage() {
        console.log('Next page');
    }

    prevPage() {
        console.log('Previous page');
    }

    zoomIn() {
        console.log('Zoom in');
    }

    zoomOut() {
        console.log('Zoom out');
    }

    resetZoom() {
        console.log('Reset zoom');
    }

    searchInPdf() {
        console.log('Search in PDF');
    }

    saveFile() {
        console.log('Saving file');
    }

    newFile() {
        console.log('Creating new file');
    }

    duplicateFile() {
        console.log('Duplicating file');
    }

    moveFile() {
        console.log('Moving file');
    }

    renameFile() {
        console.log('Renaming file');
    }

    deleteFile() {
        console.log('Deleting file');
    }

    viewDiff() {
        console.log('Viewing diff');
    }

    findInFiles() {
        console.log('Finding in files');
    }

    replaceInFiles() {
        console.log('Replacing in files');
    }

    switchToChat() {
        console.log('Switching to chat');
    }

    switchToStudy() {
        console.log('Switching to study');
    }

    switchToCoding() {
        console.log('Switching to coding');
    }

    nextWindow() {
        console.log('Next window');
    }

    prevWindow() {
        console.log('Previous window');
    }

    toggleVoiceInput() {
        console.log('Toggling voice input');
    }

    toggleVoiceOutput() {
        console.log('Toggling voice output');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShortcutManager;
}
