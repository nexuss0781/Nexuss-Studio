/**
 * Chat Module - Handles all chat-related functionality
 * Integrates with puter.js for AI communication
 */

const ChatModule = (function() {
    // Private state
    let messages = [];
    let isLoading = false;
    let conversationId = null;
    
    // Model configurations
    const models = {
        'gpt-4-turbo': { name: 'GPT-4 Turbo', provider: 'openai' },
        'claude-3-opus': { name: 'Claude 3 Opus', provider: 'anthropic' },
        'gemini-ultra': { name: 'Gemini Ultra', provider: 'google' },
        'llama-3-70b': { name: 'Llama 3 70B', provider: 'meta' },
        'mistral-large': { name: 'Mistral Large', provider: 'mistral' }
    };
    
    // Initialize module
    function init() {
        loadHistory();
        console.log('💬 Chat Module initialized');
    }
    
    // Load chat history from storage
    function loadHistory() {
        const saved = localStorage.getItem(`chat_history_${AppState.sessionId}`);
        if (saved) {
            messages = JSON.parse(saved);
            renderMessages();
        }
    }
    
    // Save chat history to storage
    function saveHistory() {
        localStorage.setItem(`chat_history_${AppState.sessionId}`, JSON.stringify(messages));
        
        // Also persist to history folder via API
        persistToServer();
    }
    
    // Persist to server
    async function persistToServer() {
        try {
            await fetch('/api/history/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: AppState.sessionId,
                    messages: messages
                })
            });
        } catch (error) {
            console.warn('Failed to persist chat to server:', error);
        }
    }
    
    // Add message to chat
    function addMessage(role, content) {
        const message = {
            id: generateUUID(),
            role: role,
            content: content,
            timestamp: Date.now(),
            model: role === 'assistant' ? AppState.currentModel : null
        };
        
        messages.push(message);
        saveHistory();
        renderMessage(message);
        scrollToBottom();
        
        return message;
    }
    
    // Render all messages
    function renderMessages() {
        const container = document.getElementById('chatMessages');
        container.innerHTML = '';
        
        messages.forEach(msg => renderMessage(msg));
        scrollToBottom();
    }
    
    // Render single message
    function renderMessage(message) {
        const container = document.getElementById('chatMessages');
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.role}`;
        messageEl.dataset.id = message.id;
        
        const avatar = message.role === 'user' ? 'You' : 'AI';
        const time = formatTime(message.timestamp);
        
        messageEl.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-text">${escapeHtml(message.content)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        container.appendChild(messageEl);
    }
    
    // Send message to AI
    async function sendToAI(userMessage, context = null) {
        if (isLoading) return;
        
        setIsLoading(true);
        showTypingIndicator();
        
        try {
            // Prepare request
            const requestData = {
                model: AppState.currentModel,
                messages: buildMessagePayload(context),
                stream: true
            };
            
            // Use puter.js if available
            if (window.puter && puter.ai) {
                const response = await callPuterAI(requestData);
                removeTypingIndicator();
                addMessage('assistant', response);
            } else {
                // Fallback to direct API call
                const response = await callDirectAPI(requestData);
                removeTypingIndicator();
                addMessage('assistant', response);
            }
            
        } catch (error) {
            console.error('AI request failed:', error);
            removeTypingIndicator();
            addMessage('assistant', `⚠️ Error: ${error.message}. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    }
    
    // Build message payload with context
    function buildMessagePayload(context) {
        const systemPrompt = getSystemPrompt();
        
        const payload = [
            { role: 'system', content: systemPrompt }
        ];
        
        // Add last 10 messages for context
        const recentMessages = messages.slice(-10);
        recentMessages.forEach(msg => {
            payload.push({
                role: msg.role,
                content: msg.content
            });
        });
        
        // Add workspace context if available
        if (context) {
            const contextMessage = buildContextMessage(context);
            if (contextMessage) {
                payload[payload.length - 1].content += `\n\n[Workspace Context]\n${contextMessage}`;
            }
        }
        
        return payload;
    }
    
    // Get appropriate system prompt
    function getSystemPrompt() {
        const basePrompt = `You are an advanced AI assistant in Infinite Studio, a modern development environment. 
Be helpful, concise, and accurate. Support both coding assistance and learning.`;
        
        if (AppState.currentMode === 'study') {
            return basePrompt + `\n\nCurrent Mode: Study Mode
When analyzing documents, provide clear explanations, summarize key points, and help the user understand complex concepts.`;
        } else {
            return basePrompt + `\n\nCurrent Mode: Coding Mode
When helping with code, provide working examples, explain your reasoning, and follow best practices.`;
        }
    }
    
    // Build context message from workspace
    function buildContextMessage(context) {
        if (!context) return null;
        
        switch (context.type) {
            case 'pdf':
                return `[PDF Document - Page ${context.page}/${context.totalPages}]`;
                
            case 'file':
                return `[File: ${context.path}]\n\`\`\`\n${context.content?.slice(0, 500)}${context.content?.length > 500 ? '...' : ''}\n\`\`\``;
                
            case 'pdf_analysis':
                return `[PDF Analysis Request - Page ${context.page}]\nContent:\n${context.content?.slice(0, 1000)}`;
                
            default:
                return null;
        }
    }
    
    // Call puter.js AI
    async function callPuterAI(requestData) {
        // Check cache first
        const cacheKey = generateCacheKey(requestData);
        const cached = await CacheModule.get(cacheKey);
        if (cached) {
            console.log('📦 Cache hit for AI response');
            return cached;
        }
        
        // Simple chat using puter.ai
        const lastMessage = requestData.messages[requestData.messages.length - 1];
        const response = await puter.ai.chat(lastMessage.content);
        
        // Cache the response
        await CacheModule.set(cacheKey, response.text || response, 3600); // 1 hour
        
        return response.text || response;
    }
    
    // Direct API fallback
    async function callDirectAPI(requestData) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices?.[0]?.message?.content || data.response || 'No response generated.';
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const container = document.getElementById('chatMessages');
        
        const indicator = document.createElement('div');
        indicator.className = 'message assistant typing-indicator';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = `
            <div class="message-avatar">AI</div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        
        container.appendChild(indicator);
        scrollToBottom();
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // Set loading state
    function setIsLoading(loading) {
        isLoading = loading;
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.disabled = loading;
            sendBtn.textContent = loading ? '⏳...' : 'Send ➤';
        }
    }
    
    // Scroll to bottom of chat
    function scrollToBottom() {
        const container = document.getElementById('chatMessages');
        container.scrollTop = container.scrollHeight;
    }
    
    // Get chat history
    function getHistory() {
        return messages;
    }
    
    // Clear chat history
    function clearHistory() {
        messages = [];
        saveHistory();
    }
    
    // Add welcome message
    function addWelcomeMessage() {
        addMessage('assistant', `Welcome to Infinite Studio! I'm your AI-powered development assistant. How can I help you today?`);
    }
    
    // Generate cache key
    function generateCacheKey(requestData) {
        const str = JSON.stringify(requestData);
        return 'chat_' + simpleHash(str);
    }
    
    // Simple hash function
    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
    
    // Utility: Format time
    function formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    // Utility: Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }
    
    // Utility: Generate UUID
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // Public API
    return {
        init,
        addMessage,
        sendToAI,
        getHistory,
        clearHistory,
        addWelcomeMessage
    };
})();

// Export to global scope
window.ChatModule = ChatModule;
