/**
 * Plugin System Module
 * Extensible plugin architecture for custom functionality
 * Part of Infinite Free Ready PHP/JS Studio
 */

class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.hooks = {
            beforeInit: [],
            afterInit: [],
            beforeRender: [],
            afterRender: [],
            beforeChat: [],
            afterChat: [],
            beforeFileOperation: [],
            afterFileOperation: [],
            onError: [],
            onShutdown: []
        };
        this.pluginOrder = [];
        this.initialized = false;
    }

    register(plugin) {
        if (!plugin.name || !plugin.version) {
            throw new Error('Plugin must have name and version');
        }

        if (this.plugins.has(plugin.name)) {
            console.warn(`Plugin ${plugin.name} is already registered`);
            return false;
        }

        // Validate plugin dependencies
        if (plugin.dependencies) {
            for (const dep of plugin.dependencies) {
                if (!this.plugins.has(dep.name)) {
                    throw new Error(`Plugin ${plugin.name} requires ${dep.name} v${dep.version}`);
                }
                
                const installedPlugin = this.plugins.get(dep.name);
                if (!this.satisfiesVersion(installedPlugin.version, dep.version)) {
                    throw new Error(`Plugin ${plugin.name} requires ${dep.name} v${dep.version}, got v${installedPlugin.version}`);
                }
            }
        }

        const pluginInstance = {
            ...plugin,
            enabled: true,
            registeredAt: Date.now()
        };

        this.plugins.set(plugin.name, pluginInstance);
        this.pluginOrder.push(plugin.name);

        // Register hooks
        if (plugin.hooks) {
            for (const [hookName, callback] of Object.entries(plugin.hooks)) {
                if (this.hooks.hasOwnProperty(hookName)) {
                    this.hooks[hookName].push({
                        pluginName: plugin.name,
                        callback
                    });
                }
            }
        }

        console.log(`Plugin ${plugin.name} v${plugin.version} registered`);
        return true;
    }

    unregister(pluginName) {
        if (!this.plugins.has(pluginName)) {
            return false;
        }

        const plugin = this.plugins.get(pluginName);
        
        // Call plugin shutdown
        if (plugin.shutdown) {
            try {
                plugin.shutdown();
            } catch (error) {
                console.error(`Error shutting down plugin ${pluginName}:`, error);
            }
        }

        // Remove hooks
        for (const hookName of Object.keys(this.hooks)) {
            this.hooks[hookName] = this.hooks[hookName].filter(
                hook => hook.pluginName !== pluginName
            );
        }

        // Remove from plugin order
        this.pluginOrder = this.pluginOrder.filter(name => name !== pluginName);
        this.plugins.delete(pluginName);

        console.log(`Plugin ${pluginName} unregistered`);
        return true;
    }

    enable(pluginName) {
        if (!this.plugins.has(pluginName)) {
            return false;
        }

        const plugin = this.plugins.get(pluginName);
        plugin.enabled = true;

        if (plugin.enable) {
            try {
                plugin.enable();
            } catch (error) {
                console.error(`Error enabling plugin ${pluginName}:`, error);
                plugin.enabled = false;
                return false;
            }
        }

        console.log(`Plugin ${pluginName} enabled`);
        return true;
    }

    disable(pluginName) {
        if (!this.plugins.has(pluginName)) {
            return false;
        }

        const plugin = this.plugins.get(pluginName);
        plugin.enabled = false;

        if (plugin.disable) {
            try {
                plugin.disable();
            } catch (error) {
                console.error(`Error disabling plugin ${pluginName}:`, error);
            }
        }

        console.log(`Plugin ${pluginName} disabled`);
        return true;
    }

    async init(context) {
        if (this.initialized) {
            return;
        }

        // Call beforeInit hooks
        await this.executeHooks('beforeInit', context);

        // Initialize plugins in order
        for (const pluginName of this.pluginOrder) {
            const plugin = this.plugins.get(pluginName);
            if (plugin.enabled && plugin.init) {
                try {
                    await plugin.init(context);
                    console.log(`Plugin ${pluginName} initialized`);
                } catch (error) {
                    console.error(`Error initializing plugin ${pluginName}:`, error);
                    plugin.enabled = false;
                }
            }
        }

        // Call afterInit hooks
        await this.executeHooks('afterInit', context);
        this.initialized = true;
    }

    async executeHooks(hookName, data) {
        if (!this.hooks.hasOwnProperty(hookName)) {
            return;
        }

        const hooks = this.hooks[hookName];
        for (const hook of hooks) {
            const plugin = this.plugins.get(hook.pluginName);
            if (plugin && plugin.enabled) {
                try {
                    await hook.callback(data);
                } catch (error) {
                    console.error(`Error in hook ${hookName} for plugin ${hook.pluginName}:`, error);
                    this.executeHooks('onError', { hookName, pluginName: hook.pluginName, error });
                }
            }
        }
    }

    satisfiesVersion(installed, required) {
        // Simple semver comparison
        const installedParts = installed.split('.').map(Number);
        const requiredParts = required.split('.').map(Number);

        for (let i = 0; i < Math.max(installedParts.length, requiredParts.length); i++) {
            const inst = installedParts[i] || 0;
            const req = requiredParts[i] || 0;
            
            if (inst > req) return true;
            if (inst < req) return false;
        }
        
        return true;
    }

    getPlugin(pluginName) {
        return this.plugins.get(pluginName);
    }

    getAllPlugins() {
        return Array.from(this.plugins.values());
    }

    getEnabledPlugins() {
        return Array.from(this.plugins.values()).filter(p => p.enabled);
    }

    hasPlugin(pluginName) {
        return this.plugins.has(pluginName);
    }

    // Convenience methods for common operations
    async beforeRender(context) {
        await this.executeHooks('beforeRender', context);
    }

    async afterRender(context) {
        await this.executeHooks('afterRender', context);
    }

    async beforeChat(message) {
        await this.executeHooks('beforeChat', message);
        return message;
    }

    async afterChat(response) {
        await this.executeHooks('afterChat', response);
        return response;
    }

    async beforeFileOperation(operation) {
        await this.executeHooks('beforeFileOperation', operation);
        return operation;
    }

    async afterFileOperation(result) {
        await this.executeHooks('afterFileOperation', result);
        return result;
    }

    async shutdown() {
        await this.executeHooks('onShutdown', {});
        
        for (const pluginName of this.pluginOrder.reverse()) {
            const plugin = this.plugins.get(pluginName);
            if (plugin.shutdown) {
                try {
                    await plugin.shutdown();
                } catch (error) {
                    console.error(`Error shutting down plugin ${pluginName}:`, error);
                }
            }
        }
        
        this.initialized = false;
    }

    // Plugin development helpers
    createPluginBase(name, version) {
        return {
            name,
            version,
            enabled: true,
            dependencies: [],
            hooks: {},
            
            init(context) {
                console.log(`${name} initialized`);
            },
            
            enable() {
                console.log(`${name} enabled`);
            },
            
            disable() {
                console.log(`${name} disabled`);
            },
            
            shutdown() {
                console.log(`${name} shutdown`);
            }
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PluginManager;
}
