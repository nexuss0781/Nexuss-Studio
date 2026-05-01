/**
 * Real-time Collaboration Module
 * WebSocket-based real-time collaboration features
 * Part of Infinite Free Ready PHP/JS Studio
 */

class CollaborationManager {
    constructor(userId, roomId = null) {
        this.userId = userId;
        this.roomId = roomId;
        this.ws = null;
        this.isConnected = false;
        this.users = new Map();
        this.pendingOperations = [];
        this.operationQueue = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.heartbeatInterval = null;
        this.callbacks = {
            onUserJoin: () => {},
            onUserLeave: () => {},
            onOperation: () => {},
            onSync: () => {},
            onError: () => {}
        };
    }

    connect(serverUrl = 'ws://localhost:8000/ws') {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(serverUrl);
                
                this.ws.onopen = () => {
                    console.log('Connected to collaboration server');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.send({
                        type: 'join',
                        userId: this.userId,
                        roomId: this.roomId
                    });
                    this.startHeartbeat();
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                };

                this.ws.onclose = () => {
                    console.log('Disconnected from collaboration server');
                    this.isConnected = false;
                    this.stopHeartbeat();
                    this.attemptReconnect(serverUrl);
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.callbacks.onError(error);
                    reject(error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    handleMessage(message) {
        switch (message.type) {
            case 'user_join':
                this.users.set(message.user.id, message.user);
                this.callbacks.onUserJoin(message.user);
                break;
                
            case 'user_leave':
                this.users.delete(message.userId);
                this.callbacks.onUserLeave(message.userId);
                break;
                
            case 'operation':
                this.handleOperation(message.operation);
                break;
                
            case 'sync':
                this.syncState(message.state);
                break;
                
            case 'users_list':
                message.users.forEach(user => {
                    this.users.set(user.id, user);
                });
                break;
                
            case 'error':
                this.callbacks.onError(message.error);
                break;
        }
    }

    handleOperation(operation) {
        // Transform operation if needed (OT algorithm)
        const transformedOp = this.transformOperation(operation);
        
        // Apply operation locally
        this.applyOperation(transformedOp);
        
        // Notify callback
        this.callbacks.onOperation(transformedOp);
    }

    transformOperation(operation) {
        // Simple OT transformation - in production, use full OT library
        let transformedOp = { ...operation };
        
        for (const pending of this.pendingOperations) {
            if (pending.timestamp < operation.timestamp) {
                transformedOp = this.transformSingleOperation(transformedOp, pending);
            }
        }
        
        return transformedOp;
    }

    transformSingleOperation(op1, op2) {
        // Transform op1 against op2
        if (op1.type === 'insert' && op2.type === 'insert') {
            if (op1.position >= op2.position) {
                op1.position += op2.text.length;
            }
        } else if (op1.type === 'delete' && op2.type === 'insert') {
            if (op1.position >= op2.position) {
                op1.position += op2.text.length;
            }
        } else if (op1.type === 'insert' && op2.type === 'delete') {
            if (op1.position >= op2.position) {
                op1.position -= Math.min(op1.position - op2.position, op2.length);
            }
        } else if (op1.type === 'delete' && op2.type === 'delete') {
            if (op1.position >= op2.position) {
                const overlap = Math.min(op1.length, op2.position + op2.length - op1.position);
                op1.position -= op2.length;
                op1.length -= overlap;
            }
        }
        
        return op1;
    }

    applyOperation(operation) {
        // Apply operation to local state
        // This should be implemented based on your data structure
        console.log('Applying operation:', operation);
    }

    sendOperation(operation) {
        const op = {
            ...operation,
            userId: this.userId,
            timestamp: Date.now(),
            id: this.generateOperationId()
        };
        
        if (this.isConnected) {
            this.send({
                type: 'operation',
                operation: op
            });
            this.pendingOperations.push(op);
            
            // Keep only last 100 operations
            if (this.pendingOperations.length > 100) {
                this.pendingOperations.shift();
            }
        } else {
            this.operationQueue.push(op);
        }
        
        return op;
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.send({ type: 'heartbeat' });
        }, 30000); // 30 seconds
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    attemptReconnect(serverUrl) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            console.log(`Attempting reconnect ${this.reconnectAttempts} in ${delay}ms`);
            
            setTimeout(() => {
                this.connect(serverUrl).catch(console.error);
            }, delay);
        } else {
            console.error('Max reconnect attempts reached');
            this.callbacks.onError(new Error('Connection lost'));
        }
    }

    syncState(state) {
        // Sync local state with server state
        this.callbacks.onSync(state);
    }

    createRoom(roomId) {
        this.roomId = roomId;
        this.send({
            type: 'create_room',
            roomId: roomId
        });
    }

    joinRoom(roomId) {
        this.roomId = roomId;
        this.send({
            type: 'join_room',
            roomId: roomId
        });
    }

    leaveRoom() {
        this.send({
            type: 'leave_room',
            roomId: this.roomId
        });
        this.roomId = null;
    }

    getUsers() {
        return Array.from(this.users.values());
    }

    getUserCount() {
        return this.users.size;
    }

    generateOperationId() {
        return `${this.userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    on(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback;
        }
    }

    off(event) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = () => {};
        }
    }

    disconnect() {
        this.stopHeartbeat();
        if (this.ws) {
            this.send({
                type: 'leave',
                userId: this.userId
            });
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CollaborationManager;
}
