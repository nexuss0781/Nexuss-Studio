/**
 * Cache Module - Aggressive Multi-Level Caching System
 * Implements LRU cache with memory, disk, and browser storage
 */

const CacheModule = (function() {
    // Private state
    let memoryCache = new Map();
    let cacheStats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        size: 0
    };
    
    // Configuration
    const config = {
        maxMemoryItems: 1000,
        maxMemorySize: 100 * 1024 * 1024, // 100MB
        maxDiskSize: 1024 * 1024 * 1024,   // 1GB
        defaultTTL: 3600,                   // 1 hour
        cleanupInterval: 300000             // 5 minutes
    };
    
    // Access order for LRU (most recently used at end)
    let accessOrder = [];
    
    // Initialize module
    function init() {
        loadFromStorage();
        startCleanupTimer();
        console.log('📦 Cache Module initialized');
    }
    
    // Set value in cache
    async function set(key, value, ttl = config.defaultTTL) {
        const entry = {
            key,
            value,
            ttl,
            timestamp: Date.now(),
            expiresAt: Date.now() + (ttl * 1000),
            size: estimateSize(value)
        };
        
        // Add to memory cache
        if (memoryCache.has(key)) {
            // Update existing entry
            updateAccessOrder(key);
        } else {
            // Check if we need to evict
            while (memoryCache.size >= config.maxMemoryItems || getTotalMemorySize() >= config.maxMemorySize) {
                evictOldest();
            }
            
            accessOrder.push(key);
        }
        
        memoryCache.set(key, entry);
        cacheStats.size = memoryCache.size;
        
        // Persist to storage asynchronously
        persistToStorage(key, entry);
        
        return true;
    }
    
    // Get value from cache
    async function get(key) {
        const entry = memoryCache.get(key);
        
        if (!entry) {
            cacheStats.misses++;
            
            // Try to load from storage
            const stored = await loadFromStorageKey(key);
            if (stored && !isExpired(stored)) {
                // Re-cache it
                await set(key, stored.value, stored.ttl);
                cacheStats.hits++;
                return stored.value;
            }
            
            return null;
        }
        
        // Check expiration
        if (isExpired(entry)) {
            memoryCache.delete(key);
            removeFromAccessOrder(key);
            cacheStats.evictions++;
            cacheStats.misses++;
            return null;
        }
        
        // Update access order (LRU)
        updateAccessOrder(key);
        cacheStats.hits++;
        
        return entry.value;
    }
    
    // Delete from cache
    async function del(key) {
        memoryCache.delete(key);
        removeFromAccessOrder(key);
        
        // Remove from storage
        await removeFromStorage(key);
        
        cacheStats.size = memoryCache.size;
        return true;
    }
    
    // Clear all cache
    async function clear() {
        memoryCache.clear();
        accessOrder = [];
        cacheStats = { hits: 0, misses: 0, evictions: 0, size: 0 };
        
        await clearStorage();
        
        console.log('Cache cleared');
    }
    
    // Check if key exists
    async function has(key) {
        const value = await get(key);
        return value !== null;
    }
    
    // Get cache stats
    function getStats() {
        const hitRate = cacheStats.hits + cacheStats.misses > 0 
            ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100).toFixed(2)
            : 0;
        
        return {
            ...cacheStats,
            hitRate: `${hitRate}%`,
            memorySize: formatBytes(getTotalMemorySize()),
            items: memoryCache.size
        };
    }
    
    // Update access order for LRU
    function updateAccessOrder(key) {
        removeFromAccessOrder(key);
        accessOrder.push(key);
    }
    
    // Remove from access order
    function removeFromAccessOrder(key) {
        const index = accessOrder.indexOf(key);
        if (index > -1) {
            accessOrder.splice(index, 1);
        }
    }
    
    // Evict oldest (least recently used) entry
    function evictOldest() {
        if (accessOrder.length === 0) return;
        
        const oldestKey = accessOrder.shift();
        memoryCache.delete(oldestKey);
        cacheStats.evictions++;
        
        console.log(`Evicted: ${oldestKey}`);
    }
    
    // Check if entry is expired
    function isExpired(entry) {
        return Date.now() > entry.expiresAt;
    }
    
    // Estimate size of value
    function estimateSize(value) {
        if (typeof value === 'string') {
            return value.length * 2; // UTF-16
        }
        if (typeof value === 'object') {
            return JSON.stringify(value).length * 2;
        }
        return 64; // Default estimate
    }
    
    // Get total memory size
    function getTotalMemorySize() {
        let total = 0;
        memoryCache.forEach(entry => {
            total += entry.size;
        });
        return total;
    }
    
    // Format bytes
    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Persist to storage
    async function persistToStorage(key, entry) {
        try {
            // Use IndexedDB for larger values
            if (entry.size > 1024 * 1024) { // > 1MB
                await saveToIndexedDB(key, entry);
            } else {
                // Use localStorage for smaller values
                const storageKey = `cache_${key}`;
                localStorage.setItem(storageKey, JSON.stringify(entry));
            }
        } catch (error) {
            console.warn('Failed to persist cache:', error);
        }
    }
    
    // Load all from storage
    async function loadFromStorage() {
        try {
            // Load from localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cache_')) {
                    try {
                        const entry = JSON.parse(localStorage.getItem(key));
                        if (!isExpired(entry)) {
                            const cacheKey = key.replace('cache_', '');
                            memoryCache.set(cacheKey, entry);
                            accessOrder.push(cacheKey);
                        } else {
                            localStorage.removeItem(key);
                        }
                    } catch (e) {
                        // Invalid entry, remove it
                        localStorage.removeItem(key);
                    }
                }
            }
            
            cacheStats.size = memoryCache.size;
            
            // Load metadata from IndexedDB
            await loadFromIndexedDB();
            
        } catch (error) {
            console.warn('Failed to load from storage:', error);
        }
    }
    
    // Load specific key from storage
    async function loadFromStorageKey(key) {
        try {
            const storageKey = `cache_${key}`;
            const data = localStorage.getItem(storageKey);
            
            if (data) {
                return JSON.parse(data);
            }
            
            // Try IndexedDB
            return await loadFromIndexedDBKey(key);
            
        } catch (error) {
            console.warn('Failed to load key from storage:', error);
            return null;
        }
    }
    
    // Remove from storage
    async function removeFromStorage(key) {
        try {
            localStorage.removeItem(`cache_${key}`);
            await deleteFromIndexedDB(key);
        } catch (error) {
            console.warn('Failed to remove from storage:', error);
        }
    }
    
    // Clear storage
    async function clearStorage() {
        try {
            // Clear localStorage cache entries
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cache_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // Clear IndexedDB
            await clearIndexedDB();
            
        } catch (error) {
            console.warn('Failed to clear storage:', error);
        }
    }
    
    // IndexedDB helpers for large values
    let db = null;
    
    async function openDB() {
        if (db) return db;
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('InfiniteStudioCache', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                db = request.result;
                resolve(db);
            };
            
            request.onupgradeneeded = (event) => {
                const database = event.target.result;
                if (!database.objectStoreNames.contains('cache')) {
                    database.createObjectStore('cache', { keyPath: 'key' });
                }
            };
        });
    }
    
    async function saveToIndexedDB(key, entry) {
        try {
            const database = await openDB();
            const tx = database.transaction('cache', 'readwrite');
            const store = tx.objectStore('cache');
            store.put({ key, ...entry });
            await tx.complete;
        } catch (error) {
            console.warn('IndexedDB save failed:', error);
        }
    }
    
    async function loadFromIndexedDB() {
        try {
            const database = await openDB();
            const tx = database.transaction('cache', 'readonly');
            const store = tx.objectStore('cache');
            const request = store.getAll();
            
            return new Promise((resolve) => {
                request.onsuccess = () => {
                    const entries = request.result;
                    entries.forEach(entry => {
                        if (!isExpired(entry)) {
                            memoryCache.set(entry.key, entry);
                            accessOrder.push(entry.key);
                        }
                    });
                    resolve(entries);
                };
                request.onerror = () => resolve([]);
            });
        } catch (error) {
            console.warn('IndexedDB load failed:', error);
            return [];
        }
    }
    
    async function loadFromIndexedDBKey(key) {
        try {
            const database = await openDB();
            const tx = database.transaction('cache', 'readonly');
            const store = tx.objectStore('cache');
            const request = store.get(key);
            
            return new Promise((resolve) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(null);
            });
        } catch (error) {
            console.warn('IndexedDB load key failed:', error);
            return null;
        }
    }
    
    async function deleteFromIndexedDB(key) {
        try {
            const database = await openDB();
            const tx = database.transaction('cache', 'readwrite');
            const store = tx.objectStore('cache');
            store.delete(key);
            await tx.complete;
        } catch (error) {
            console.warn('IndexedDB delete failed:', error);
        }
    }
    
    async function clearIndexedDB() {
        try {
            const database = await openDB();
            const tx = database.transaction('cache', 'readwrite');
            const store = tx.objectStore('cache');
            store.clear();
            await tx.complete;
        } catch (error) {
            console.warn('IndexedDB clear failed:', error);
        }
    }
    
    // Start periodic cleanup
    function startCleanupTimer() {
        setInterval(() => {
            cleanup();
        }, config.cleanupInterval);
    }
    
    // Cleanup expired entries
    function cleanup() {
        const now = Date.now();
        let cleaned = 0;
        
        memoryCache.forEach((entry, key) => {
            if (now > entry.expiresAt) {
                memoryCache.delete(key);
                removeFromAccessOrder(key);
                cleaned++;
            }
        });
        
        if (cleaned > 0) {
            cacheStats.size = memoryCache.size;
            cacheStats.evictions += cleaned;
            console.log(`Cleaned up ${cleaned} expired cache entries`);
        }
    }
    
    // Pre-fetch and cache data
    async function prefetch(key, fetchFn, ttl = config.defaultTTL) {
        const cached = await get(key);
        if (cached !== null) {
            return cached;
        }
        
        try {
            const data = await fetchFn();
            await set(key, data, ttl);
            return data;
        } catch (error) {
            console.error('Prefetch failed:', error);
            throw error;
        }
    }
    
    // Cache wrapper for functions
    function memoize(fn, ttl = config.defaultTTL) {
        return async function(...args) {
            const key = 'fn_' + simpleHash(JSON.stringify(args));
            return await prefetch(key, () => fn(...args), ttl);
        };
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
    
    // Public API
    return {
        init,
        set,
        get,
        del,
        clear,
        has,
        getStats,
        prefetch,
        memoize,
        cleanup
    };
})();

// Export to global scope
window.CacheModule = CacheModule;
