/**
 * Analytics and Usage Tracking Module
 * Advanced analytics for user behavior and system performance
 * Part of Infinite Free Ready PHP/JS Studio
 */

class AnalyticsManager {
    constructor(options = {}) {
        this.userId = options.userId || this.generateUserId();
        this.sessionId = this.generateSessionId();
        this.events = [];
        this.metrics = {
            pageViews: 0,
            chatMessages: 0,
            filesCreated: 0,
            filesEdited: 0,
            pdfsOpened: 0,
            aiRequests: 0,
            errors: 0
        };
        this.performanceMetrics = {
            loadTime: 0,
            apiResponseTimes: [],
            renderTimes: []
        };
        this.startTime = Date.now();
        this.autoFlushInterval = null;
        this.flushThreshold = options.flushThreshold || 10;
        this.enabled = options.enabled !== false;
        
        this.init();
    }

    init() {
        if (!this.enabled) return;
        
        // Track page load time
        window.addEventListener('load', () => {
            this.performanceMetrics.loadTime = Date.now() - this.startTime;
            this.track('page_load', {
                loadTime: this.performanceMetrics.loadTime
            });
        });
        
        // Track before unload
        window.addEventListener('beforeunload', () => {
            this.trackSessionEnd();
            this.flush();
        });
        
        // Auto flush events
        this.autoFlushInterval = setInterval(() => {
            if (this.events.length >= this.flushThreshold) {
                this.flush();
            }
        }, 30000); // Every 30 seconds
        
        // Track initial session start
        this.trackSessionStart();
    }

    track(eventName, data = {}) {
        if (!this.enabled) return;
        
        const event = {
            eventId: this.generateEventId(),
            eventName,
            timestamp: Date.now(),
            userId: this.userId,
            sessionId: this.sessionId,
            data,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`
        };
        
        this.events.push(event);
        
        // Update metrics
        this.updateMetrics(eventName, data);
        
        // Auto flush if threshold reached
        if (this.events.length >= this.flushThreshold) {
            this.flush();
        }
        
        return event.eventId;
    }

    updateMetrics(eventName, data) {
        switch (eventName) {
            case 'page_view':
                this.metrics.pageViews++;
                break;
            case 'chat_message_sent':
                this.metrics.chatMessages++;
                break;
            case 'file_created':
                this.metrics.filesCreated++;
                break;
            case 'file_edited':
                this.metrics.filesEdited++;
                break;
            case 'pdf_opened':
                this.metrics.pdfsOpened++;
                break;
            case 'ai_request':
                this.metrics.aiRequests++;
                break;
            case 'error':
                this.metrics.errors++;
                break;
        }
    }

    trackApiCall(endpoint, method, duration, success = true) {
        this.performanceMetrics.apiResponseTimes.push({
            endpoint,
            method,
            duration,
            success,
            timestamp: Date.now()
        });
        
        // Keep only last 100 API calls
        if (this.performanceMetrics.apiResponseTimes.length > 100) {
            this.performanceMetrics.apiResponseTimes.shift();
        }
        
        this.track('api_call', {
            endpoint,
            method,
            duration,
            success
        });
    }

    trackRender(component, duration) {
        this.performanceMetrics.renderTimes.push({
            component,
            duration,
            timestamp: Date.now()
        });
        
        // Keep only last 100 renders
        if (this.performanceMetrics.renderTimes.length > 100) {
            this.performanceMetrics.renderTimes.shift();
        }
        
        this.track('render', {
            component,
            duration
        });
    }

    trackError(error, context = {}) {
        this.track('error', {
            message: error.message || String(error),
            stack: error.stack,
            ...context
        });
    }

    trackSessionStart() {
        this.track('session_start', {
            referrer: document.referrer,
            landingPage: window.location.pathname
        });
    }

    trackSessionEnd() {
        const sessionDuration = Date.now() - this.startTime;
        this.track('session_end', {
            duration: sessionDuration,
            eventsCount: this.events.length,
            metrics: { ...this.metrics }
        });
    }

    async flush() {
        if (!this.enabled || this.events.length === 0) return;
        
        const eventsToSend = [...this.events];
        this.events = [];
        
        try {
            // Send to backend
            await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    events: eventsToSend,
                    userId: this.userId,
                    sessionId: this.sessionId
                })
            });
            
            console.log(`Flushed ${eventsToSend.length} analytics events`);
        } catch (error) {
            console.error('Failed to flush analytics:', error);
            // Re-add events to queue for retry
            this.events.unshift(...eventsToSend);
        }
    }

    getMetrics() {
        return {
            ...this.metrics,
            sessionDuration: Date.now() - this.startTime,
            avgApiResponseTime: this.getAverageApiResponseTime(),
            avgRenderTime: this.getAverageRenderTime()
        };
    }

    getAverageApiResponseTime() {
        if (this.performanceMetrics.apiResponseTimes.length === 0) return 0;
        const sum = this.performanceMetrics.apiResponseTimes.reduce(
            (acc, curr) => acc + curr.duration, 0
        );
        return sum / this.performanceMetrics.apiResponseTimes.length;
    }

    getAverageRenderTime() {
        if (this.performanceMetrics.renderTimes.length === 0) return 0;
        const sum = this.performanceMetrics.renderTimes.reduce(
            (acc, curr) => acc + curr.duration, 0
        );
        return sum / this.performanceMetrics.renderTimes.length;
    }

    getPerformanceReport() {
        return {
            loadTime: this.performanceMetrics.loadTime,
            avgApiResponseTime: this.getAverageApiResponseTime(),
            avgRenderTime: this.getAverageRenderTime(),
            totalApiCalls: this.performanceMetrics.apiResponseTimes.length,
            totalRenders: this.performanceMetrics.renderTimes.length,
            successRate: this.calculateSuccessRate()
        };
    }

    calculateSuccessRate() {
        if (this.performanceMetrics.apiResponseTimes.length === 0) return 100;
        const successful = this.performanceMetrics.apiResponseTimes.filter(
            call => call.success
        ).length;
        return (successful / this.performanceMetrics.apiResponseTimes.length) * 100;
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    generateEventId() {
        return 'evt_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    setUserId(userId) {
        this.userId = userId;
        this.track('user_identified', { userId });
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    destroy() {
        if (this.autoFlushInterval) {
            clearInterval(this.autoFlushInterval);
        }
        this.trackSessionEnd();
        this.flush();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsManager;
}
