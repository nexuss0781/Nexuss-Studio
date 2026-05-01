/**
 * Security Module
 * Advanced security features including XSS protection, CSRF tokens, and input sanitization
 * Part of Infinite Free Ready PHP/JS Studio
 */

class SecurityManager {
    constructor(options = {}) {
        this.csrfToken = options.csrfToken || this.generateCsrfToken();
        this.allowedTags = options.allowedTags || [
            'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img'
        ];
        this.allowedAttributes = options.allowedAttributes || {
            'a': ['href', 'title', 'target'],
            'img': ['src', 'alt', 'title', 'width', 'height']
        };
        this.maxInputLength = options.maxInputLength || 10000;
        this.rateLimitStore = new Map();
        this.rateLimitWindow = options.rateLimitWindow || 60000; // 1 minute
        this.rateLimitMaxRequests = options.rateLimitMaxRequests || 100;
        
        this.init();
    }

    init() {
        // Set up CSP if not already set
        this.setContentSecurityPolicy();
        
        // Store CSRF token in meta tag for form submissions
        this.storeCsrfToken();
    }

    // ==================== XSS PROTECTION ====================

    sanitizeHtml(input, options = {}) {
        if (!input) return '';
        
        const allowedTags = options.allowedTags || this.allowedTags;
        const allowedAttributes = options.allowedAttributes || this.allowedAttributes;
        
        // Create a temporary element
        const temp = document.createElement('div');
        temp.innerHTML = input;
        
        // Remove script tags and event handlers
        this.removeDangerousElements(temp);
        
        // Filter allowed tags and attributes
        this.filterElements(temp, allowedTags, allowedAttributes);
        
        return temp.innerHTML;
    }

    removeDangerousElements(element) {
        // Remove script tags
        const scripts = element.getElementsByTagName('script');
        while (scripts.length > 0) {
            scripts[0].remove();
        }
        
        // Remove style tags
        const styles = element.getElementsByTagName('style');
        while (styles.length > 0) {
            styles[0].remove();
        }
        
        // Remove iframe tags
        const iframes = element.getElementsByTagName('iframe');
        while (iframes.length > 0) {
            iframes[0].remove();
        }
        
        // Remove object and embed tags
        const objects = element.getElementsByTagName('object');
        while (objects.length > 0) {
            objects[0].remove();
        }
        
        const embeds = element.getElementsByTagName('embed');
        while (embeds.length > 0) {
            embeds[0].remove();
        }
        
        // Remove all event handlers
        const allElements = element.getElementsByTagName('*');
        for (const el of allElements) {
            const attributes = Array.from(el.attributes);
            for (const attr of attributes) {
                if (attr.name.startsWith('on')) {
                    el.removeAttribute(attr.name);
                }
            }
        }
    }

    filterElements(element, allowedTags, allowedAttributes) {
        const allElements = element.getElementsByTagName('*');
        
        // Process in reverse to avoid index issues when removing
        for (let i = allElements.length - 1; i >= 0; i--) {
            const el = allElements[i];
            const tagName = el.tagName.toLowerCase();
            
            // Remove disallowed tags
            if (!allowedTags.includes(tagName)) {
                // Replace with text content
                const textNode = document.createTextNode(el.textContent);
                el.parentNode.replaceChild(textNode, el);
                continue;
            }
            
            // Filter attributes
            const attributes = Array.from(el.attributes);
            for (const attr of attributes) {
                const allowedAttrs = allowedAttributes[tagName] || [];
                
                // Remove disallowed attributes
                if (!allowedAttrs.includes(attr.name)) {
                    el.removeAttribute(attr.name);
                    continue;
                }
                
                // Validate specific attributes
                if (attr.name === 'href' || attr.name === 'src') {
                    const value = attr.value.toLowerCase().trim();
                    if (!this.isSafeUrl(value)) {
                        el.removeAttribute(attr.name);
                    }
                }
            }
        }
    }

    isSafeUrl(url) {
        const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:', '#'];
        
        try {
            const parsed = new URL(url, window.location.origin);
            return safeProtocols.includes(parsed.protocol);
        } catch (e) {
            // Relative URLs are safe
            return url.startsWith('/') || url.startsWith('#');
        }
    }

    sanitizeText(input) {
        if (!input) return '';
        
        // Limit length
        if (input.length > this.maxInputLength) {
            input = input.substring(0, this.maxInputLength);
        }
        
        // Escape HTML entities
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    escapeHtml(text) {
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        
        return String(text).replace(/[&<>"'/]/g, char => escapeMap[char]);
    }

    unescapeHtml(text) {
        const unescapeMap = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#x27;': "'",
            '&#x2F;': '/'
        };
        
        return String(text).replace(/&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;/g, match => unescapeMap[match]);
    }

    // ==================== CSRF PROTECTION ====================

    generateCsrfToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    getCsrfToken() {
        return this.csrfToken;
    }

    storeCsrfToken() {
        let metaTag = document.querySelector('meta[name="csrf-token"]');
        
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.name = 'csrf-token';
            metaTag.content = this.csrfToken;
            document.head.appendChild(metaTag);
        } else {
            metaTag.content = this.csrfToken;
        }
    }

    validateCsrfToken(token) {
        return token === this.csrfToken;
    }

    getCsrfHeader() {
        return {
            'X-CSRF-Token': this.csrfToken
        };
    }

    // ==================== INPUT VALIDATION ====================

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    validatePhoneNumber(phone) {
        const re = /^[\d\s\-\+\(\)]{10,}$/;
        return re.test(phone);
    }

    validatePassword(password, options = {}) {
        const minLength = options.minLength || 8;
        const requireUppercase = options.requireUppercase !== false;
        const requireLowercase = options.requireLowercase !== false;
        const requireNumber = options.requireNumber !== false;
        const requireSpecial = options.requireSpecial || false;
        
        if (password.length < minLength) {
            return { valid: false, error: `Password must be at least ${minLength} characters` };
        }
        
        if (requireUppercase && !/[A-Z]/.test(password)) {
            return { valid: false, error: 'Password must contain an uppercase letter' };
        }
        
        if (requireLowercase && !/[a-z]/.test(password)) {
            return { valid: false, error: 'Password must contain a lowercase letter' };
        }
        
        if (requireNumber && !/\d/.test(password)) {
            return { valid: false, error: 'Password must contain a number' };
        }
        
        if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return { valid: false, error: 'Password must contain a special character' };
        }
        
        return { valid: true };
    }

    sanitizeFilename(filename) {
        // Remove path traversal attempts
        filename = filename.replace(/[\/\\]/g, '');
        
        // Remove null bytes
        filename = filename.replace(/\0/g, '');
        
        // Remove dangerous characters
        filename = filename.replace(/[<>:"|?*]/g, '_');
        
        // Limit length
        if (filename.length > 255) {
            filename = filename.substring(0, 255);
        }
        
        return filename.trim();
    }

    // ==================== RATE LIMITING ====================

    checkRateLimit(identifier) {
        const now = Date.now();
        const userRequests = this.rateLimitStore.get(identifier) || [];
        
        // Remove old requests outside the window
        const recentRequests = userRequests.filter(timestamp => 
            now - timestamp < this.rateLimitWindow
        );
        
        if (recentRequests.length >= this.rateLimitMaxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: now + this.rateLimitWindow
            };
        }
        
        // Add current request
        recentRequests.push(now);
        this.rateLimitStore.set(identifier, recentRequests);
        
        return {
            allowed: true,
            remaining: this.rateLimitMaxRequests - recentRequests.length,
            resetTime: now + this.rateLimitWindow
        };
    }

    resetRateLimit(identifier) {
        this.rateLimitStore.delete(identifier);
    }

    // ==================== CONTENT SECURITY POLICY ====================

    setContentSecurityPolicy() {
        const cspDirectives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https:",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ];
        
        const csp = cspDirectives.join('; ');
        
        let metaCsp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        
        if (!metaCsp) {
            metaCsp = document.createElement('meta');
            metaCsp.httpEquiv = 'Content-Security-Policy';
            document.head.appendChild(metaCsp);
        }
        
        metaCsp.content = csp;
    }

    // ==================== ENCRYPTION UTILITIES ====================

    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    generateRandomString(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(36).padStart(2, '0')).join('');
    }

    generateApiKey() {
        return 'sk_' + this.generateRandomString(32);
    }

    // ==================== SESSION MANAGEMENT ====================

    setSecureCookie(name, value, options = {}) {
        const expires = options.expires ? 
            `; expires=${options.expires.toUTCString()}` : '';
        const path = options.path ? `; path=${options.path}` : '; path=/';
        const domain = options.domain ? `; domain=${options.domain}` : '';
        const secure = options.secure !== false ? '; secure' : '';
        const sameSite = options.sameSite || 'Strict';
        
        document.cookie = `${name}=${encodeURIComponent(value)}${expires}${path}${domain}${secure}; SameSite=${sameSite}`;
    }

    getCookie(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length));
            }
        }
        return null;
    }

    deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    }

    // ==================== SECURITY HEADERS (for server-side) ====================

    getSecurityHeaders() {
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
}
