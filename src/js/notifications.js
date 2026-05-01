/**
 * Notification System Module
 * Advanced notification system with toast, banner, and badge notifications
 * Part of Infinite Free Ready PHP/JS Studio
 */

class NotificationManager {
    constructor(options = {}) {
        this.notifications = [];
        this.maxNotifications = options.maxNotifications || 5;
        this.defaultDuration = options.defaultDuration || 5000;
        this.position = options.position || 'top-right';
        this.container = null;
        this.audioEnabled = options.audioEnabled || false;
        this.soundUrl = options.soundUrl || null;
        this.permissionGranted = false;
        
        this.init();
    }

    init() {
        this.createContainer();
        this.requestPermission();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = `notification-container notification-${this.position}`;
        this.container.id = 'notification-container';
        
        // Add styles if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = this.getStyles();
            document.head.appendChild(style);
        }
        
        document.body.appendChild(this.container);
    }

    getStyles() {
        return `
            .notification-container {
                position: fixed;
                z-index: 9999;
                max-width: 400px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 20px;
            }
            .notification-top-right { top: 0; right: 0; }
            .notification-top-left { top: 0; left: 0; }
            .notification-bottom-right { bottom: 0; right: 0; }
            .notification-bottom-left { bottom: 0; left: 0; }
            
            .notification {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                padding: 16px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                animation: slideIn 0.3s ease-out;
                cursor: pointer;
                transition: transform 0.2s, opacity 0.2s;
            }
            .notification:hover {
                transform: translateY(-2px);
            }
            .notification.hiding {
                animation: slideOut 0.3s ease-in forwards;
            }
            
            .notification-icon {
                width: 24px;
                height: 24px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            .notification-content {
                flex: 1;
                min-width: 0;
            }
            .notification-title {
                font-weight: 600;
                margin-bottom: 4px;
                color: #1a1a1a;
            }
            .notification-message {
                color: #666;
                font-size: 14px;
                line-height: 1.4;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #999;
                padding: 0;
                line-height: 1;
            }
            .notification-close:hover {
                color: #333;
            }
            
            .notification-success .notification-icon { background: #d4edda; color: #28a745; }
            .notification-error .notification-icon { background: #f8d7da; color: #dc3545; }
            .notification-warning .notification-icon { background: #fff3cd; color: #ffc107; }
            .notification-info .notification-icon { background: #d1ecf1; color: #17a2b8; }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .notification-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #dc3545;
                color: white;
                border-radius: 10px;
                padding: 2px 6px;
                font-size: 12px;
                font-weight: bold;
            }
        `;
    }

    async requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                const permission = await Notification.requestPermission();
                this.permissionGranted = permission === 'granted';
            } catch (error) {
                console.error('Notification permission error:', error);
            }
        } else if ('Notification' in window && Notification.permission === 'granted') {
            this.permissionGranted = true;
        }
    }

    show(options) {
        const notification = {
            id: this.generateId(),
            type: options.type || 'info',
            title: options.title || '',
            message: options.message || '',
            duration: options.duration || this.defaultDuration,
            icon: options.icon || this.getDefaultIcon(options.type),
            onClick: options.onClick || (() => {}),
            onClose: options.onClose || (() => {}),
            persistent: options.persistent || false,
            createdAt: Date.now()
        };

        // Limit number of notifications
        if (this.notifications.length >= this.maxNotifications) {
            const oldest = this.notifications.shift();
            this.removeNotification(oldest.id);
        }

        this.notifications.push(notification);
        this.renderNotification(notification);

        if (!notification.persistent && notification.duration > 0) {
            setTimeout(() => {
                this.hide(notification.id);
            }, notification.duration);
        }

        // Play sound if enabled
        if (this.audioEnabled) {
            this.playSound();
        }

        // Show browser notification if permission granted
        if (this.permissionGranted && options.browserNotification) {
            this.showBrowserNotification(notification);
        }

        return notification.id;
    }

    renderNotification(notification) {
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.dataset.id = notification.id;
        element.innerHTML = `
            <div class="notification-icon">${notification.icon}</div>
            <div class="notification-content">
                ${notification.title ? `<div class="notification-title">${notification.title}</div>` : ''}
                <div class="notification-message">${notification.message}</div>
            </div>
            <button class="notification-close" aria-label="Close">&times;</button>
        `;

        // Click handlers
        element.addEventListener('click', (e) => {
            if (!e.target.classList.contains('notification-close')) {
                notification.onClick(notification);
            }
        });

        element.querySelector('.notification-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.hide(notification.id);
        });

        this.container.appendChild(element);
    }

    hide(id) {
        const element = this.container.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.add('hiding');
            setTimeout(() => {
                this.removeNotification(id);
            }, 300);
        }
    }

    removeNotification(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            const notification = this.notifications[index];
            notification.onClose(notification);
            this.notifications.splice(index, 1);
        }

        const element = this.container.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.remove();
        }
    }

    hideAll() {
        const ids = this.notifications.map(n => n.id);
        ids.forEach(id => this.hide(id));
    }

    success(message, title = 'Success', options = {}) {
        return this.show({ type: 'success', message, title, ...options });
    }

    error(message, title = 'Error', options = {}) {
        return this.show({ type: 'error', message, title, ...options });
    }

    warning(message, title = 'Warning', options = {}) {
        return this.show({ type: 'warning', message, title, ...options });
    }

    info(message, title = 'Info', options = {}) {
        return this.show({ type: 'info', message, title, ...options });
    }

    getDefaultIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    showBrowserNotification(notification) {
        if (!this.permissionGranted || !('Notification' in window)) return;

        new Notification(notification.title || 'Notification', {
            body: notification.message,
            icon: notification.icon,
            tag: notification.id,
            requireInteraction: notification.persistent
        });
    }

    playSound() {
        if (this.soundUrl) {
            const audio = new Audio(this.soundUrl);
            audio.play().catch(console.error);
        }
    }

    // Badge notifications
    setBadge(count) {
        let badge = document.getElementById('notification-badge');
        
        if (count <= 0) {
            if (badge) badge.remove();
            return;
        }

        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'notification-badge';
            badge.className = 'notification-badge';
            
            // Find a suitable parent (e.g., bell icon)
            const bellIcon = document.querySelector('.notification-bell');
            if (bellIcon) {
                bellIcon.style.position = 'relative';
                bellIcon.appendChild(badge);
            } else {
                badge.style.position = 'fixed';
                badge.style.top = '10px';
                badge.style.right = '10px';
                document.body.appendChild(badge);
            }
        }

        badge.textContent = count > 99 ? '99+' : count;
    }

    incrementBadge() {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            const count = parseInt(badge.textContent) || 0;
            this.setBadge(count + 1);
        }
    }

    clearBadge() {
        this.setBadge(0);
    }

    generateId() {
        return 'notif_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    getNotifications() {
        return [...this.notifications];
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
    }

    setPosition(position) {
        this.position = position;
        this.container.className = `notification-container notification-${position}`;
    }

    enableAudio(soundUrl = null) {
        this.audioEnabled = true;
        if (soundUrl) {
            this.soundUrl = soundUrl;
        }
    }

    disableAudio() {
        this.audioEnabled = false;
    }

    destroy() {
        this.hideAll();
        if (this.container) {
            this.container.remove();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}
