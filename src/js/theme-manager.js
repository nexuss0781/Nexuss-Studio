/**
 * Theme Manager Module
 * Advanced theming system with custom CSS variables and preset themes
 * Part of Infinite Free Ready PHP/JS Studio
 */

class ThemeManager {
    constructor(options = {}) {
        this.currentTheme = options.defaultTheme || 'dark';
        this.themes = {
            dark: {
                name: 'Dark',
                colors: {
                    '--bg-primary': '#1a1a2e',
                    '--bg-secondary': '#16213e',
                    '--bg-tertiary': '#0f3460',
                    '--text-primary': '#ffffff',
                    '--text-secondary': '#b8b8b8',
                    '--accent-primary': '#e94560',
                    '--accent-secondary': '#533483',
                    '--border-color': '#2a2a4e',
                    '--success-color': '#00d26a',
                    '--warning-color': '#ffc107',
                    '--error-color': '#ff6b6b',
                    '--info-color': '#4dabf7'
                }
            },
            light: {
                name: 'Light',
                colors: {
                    '--bg-primary': '#ffffff',
                    '--bg-secondary': '#f8f9fa',
                    '--bg-tertiary': '#e9ecef',
                    '--text-primary': '#212529',
                    '--text-secondary': '#6c757d',
                    '--accent-primary': '#007bff',
                    '--accent-secondary': '#6c757d',
                    '--border-color': '#dee2e6',
                    '--success-color': '#28a745',
                    '--warning-color': '#ffc107',
                    '--error-color': '#dc3545',
                    '--info-color': '#17a2b8'
                }
            },
            ocean: {
                name: 'Ocean',
                colors: {
                    '--bg-primary': '#0a192f',
                    '--bg-secondary': '#112240',
                    '--bg-tertiary': '#233554',
                    '--text-primary': '#e6f1ff',
                    '--text-secondary': '#8892b0',
                    '--accent-primary': '#64ffda',
                    '--accent-secondary': '#00b4d8',
                    '--border-color': '#233554',
                    '--success-color': '#64ffda',
                    '--warning-color': '#ffd166',
                    '--error-color': '#ef476f',
                    '--info-color': '#00b4d8'
                }
            },
            forest: {
                name: 'Forest',
                colors: {
                    '--bg-primary': '#1a1f1a',
                    '--bg-secondary': '#232b23',
                    '--bg-tertiary': '#2d382d',
                    '--text-primary': '#e8f5e9',
                    '--text-secondary': '#a5b4a5',
                    '--accent-primary': '#4caf50',
                    '--accent-secondary': '#8bc34a',
                    '--border-color': '#384438',
                    '--success-color': '#66bb6a',
                    '--warning-color': '#ffa726',
                    '--error-color': '#ef5350',
                    '--info-color': '#42a5f5'
                }
            },
            sunset: {
                name: 'Sunset',
                colors: {
                    '--bg-primary': '#1a1a2e',
                    '--bg-secondary': '#16213e',
                    '--bg-tertiary': '#1a3a5c',
                    '--text-primary': '#fff5e6',
                    '--text-secondary': '#ccb380',
                    '--accent-primary': '#ff6b6b',
                    '--accent-secondary': '#feca57',
                    '--border-color': '#2d3a4a',
                    '--success-color': '#1dd1a1',
                    '--warning-color': '#feca57',
                    '--error-color': '#ff6b6b',
                    '--info-color': '#54a0ff'
                }
            }
        };
        this.customThemes = new Map();
        this.onThemeChange = options.onThemeChange || (() => {});
        
        this.init();
    }

    init() {
        // Load saved theme from localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && (this.themes[savedTheme] || this.customThemes.has(savedTheme))) {
            this.currentTheme = savedTheme;
        }
        
        // Apply initial theme
        this.applyTheme(this.currentTheme);
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName] || this.customThemes.get(themeName);
        
        if (!theme) {
            console.warn(`Theme "${themeName}" not found`);
            return false;
        }
        
        const root = document.documentElement;
        
        for (const [property, value] of Object.entries(theme.colors)) {
            root.style.setProperty(property, value);
        }
        
        // Add theme class to body
        document.body.classList.remove(...Object.keys(this.themes));
        document.body.classList.add(`theme-${themeName}`);
        
        this.currentTheme = themeName;
        localStorage.setItem('theme', themeName);
        
        this.onThemeChange(themeName, theme);
        
        return true;
    }

    getTheme(themeName) {
        return this.themes[themeName] || this.customThemes.get(themeName);
    }

    getAllThemes() {
        const builtIn = Object.keys(this.themes).map(key => ({
            id: key,
            name: this.themes[key].name,
            isCustom: false
        }));
        
        const custom = Array.from(this.customThemes.keys()).map(key => ({
            id: key,
            name: this.customThemes.get(key).name,
            isCustom: true
        }));
        
        return [...builtIn, ...custom];
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    createCustomTheme(name, config) {
        if (!name || !config.colors) {
            throw new Error('Theme name and colors are required');
        }
        
        const theme = {
            name: config.name || name,
            colors: config.colors
        };
        
        this.customThemes.set(name, theme);
        localStorage.setItem(`custom-theme-${name}`, JSON.stringify(theme));
        
        return theme;
    }

    loadCustomThemes() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('custom-theme-')) {
                const themeName = key.replace('custom-theme-', '');
                try {
                    const theme = JSON.parse(localStorage.getItem(key));
                    this.customThemes.set(themeName, theme);
                } catch (e) {
                    console.error('Failed to load custom theme:', themeName);
                }
            }
        }
    }

    deleteCustomTheme(name) {
        if (this.themes[name]) {
            throw new Error('Cannot delete built-in theme');
        }
        
        this.customThemes.delete(name);
        localStorage.removeItem(`custom-theme-${name}`);
        
        if (this.currentTheme === name) {
            this.applyTheme('dark');
        }
    }

    toggle() {
        const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(nextTheme);
        return nextTheme;
    }

    cycle() {
        const themeKeys = Object.keys(this.themes);
        const currentIndex = themeKeys.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        this.applyTheme(themeKeys[nextIndex]);
        return themeKeys[nextIndex];
    }

    // Color utilities
    adjustColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }

    getContrastColor(hexcolor) {
        const r = parseInt(hexcolor.substr(1, 2), 16);
        const g = parseInt(hexcolor.substr(3, 2), 16);
        const b = parseInt(hexcolor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
    }

    // Animation preferences
    setReducedMotion(reduced) {
        if (reduced) {
            document.documentElement.classList.add('reduce-motion');
        } else {
            document.documentElement.classList.remove('reduce-motion');
        }
        localStorage.setItem('reduce-motion', reduced.toString());
    }

    getReducedMotion() {
        return localStorage.getItem('reduce-motion') === 'true' ||
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Export/Import themes
    exportTheme(themeName) {
        const theme = this.getTheme(themeName);
        if (!theme) return null;
        
        return JSON.stringify({
            name: themeName,
            config: theme
        }, null, 2);
    }

    importTheme(jsonString) {
        try {
            const { name, config } = JSON.parse(jsonString);
            this.createCustomTheme(name, config);
            return true;
        } catch (e) {
            console.error('Failed to import theme:', e);
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
