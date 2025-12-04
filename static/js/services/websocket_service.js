/**
 * WebSocket服务模块
 */

import { ApiService } from './api_service.js';
import { SessionService } from './session_service.js';

export class WebSocketService {
    constructor() {
        this.ws = null;
        this.currentUser = '';
        this.onMessageCallback = null;
        this.onCloseCallback = null;
        this.onErrorCallback = null;
    }

    connect(serverUrl, nickname, onMessageCallback, onCloseCallback = null, onErrorCallback = null) {
        return new Promise((resolve, reject) => {
            try {
                // 使用ApiService创建WebSocket连接
                this.ws = ApiService.createWebSocket(nickname, serverUrl);
                this.onMessageCallback = onMessageCallback;
                this.onCloseCallback = onCloseCallback;
                this.onErrorCallback = onErrorCallback;

                this.ws.onopen = () => {
                    this.currentUser = nickname;
                    // 保存会话
                    SessionService.createSession(nickname, serverUrl);
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (this.onMessageCallback) {
                        this.onMessageCallback(data);
                    }
                };

                this.ws.onclose = (event) => {
                    if (this.onCloseCallback) {
                        this.onCloseCallback(event);
                    }
                };

                this.ws.onerror = (error) => {
                    if (this.onErrorCallback) {
                        this.onErrorCallback(error);
                    }
                    reject(new Error('WebSocket连接错误'));
                };

            } catch (e) {
                reject(new Error('无法连接到服务器: ' + e.message));
            }
        });
    }

    sendMessage(message) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
        
        try {
            this.ws.send(JSON.stringify(message));
            return true;
        } catch (e) {
            console.error('发送消息失败:', e);
            return false;
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}
