/**
 * 聊天应用主模块
 * 整合所有前端模块，处理应用初始化和主要逻辑流程
 */

import { ConfigService } from '../services/config_service.js';
import { WebSocketService } from '../services/websocket_service.js';
import { UIRenderer } from '../components/ui_renderer.js';
import { escapeHtml } from '../utils/utils.js';

class ChatApp {
    constructor() {
        this.currentUser = null;
        this.currentServer = null;
        this.sessionId = null;
        this.websocket = null;
        this.connected = false;
        
        // 初始化组件
        this.uiRenderer = new UIRenderer();
    }

    // 应用初始化
    async init() {
        // 初始化表情选择器
        this.uiRenderer.initEmojiPicker();
        
        // 初始化服务器配置
        await this.loadServerConfig();
        
        // 初始化登录功能
        this.uiRenderer.initLogin(() => this.login());
        
        // 检查是否有保存的会话
        this.checkSavedSession();
    }

    // 加载服务器配置
    async loadServerConfig() {
        const refreshServerBtn = document.getElementById('refresh-server-btn');
        const serverSelect = document.getElementById('server-select');
        
        // 初始加载配置
        await ConfigService.loadServerConfig(refreshServerBtn, serverSelect);
        
        // 绑定刷新按钮事件
        refreshServerBtn.addEventListener('click', () => {
            ConfigService.loadServerConfig(refreshServerBtn, serverSelect);
        });
    }

    // 检查保存的会话
    checkSavedSession() {
        const session = ConfigService.getSession();
        if (session) {
            try {
                const { nickname, serverUrl } = session;
                if (nickname && serverUrl) {
                    const serverSelect = document.getElementById('server-select');
                    
                    // 等待DOM加载完成后尝试自动登录
                    setTimeout(() => {
                        // 设置服务器选择
                        const option = Array.from(serverSelect.options).find(opt => opt.value === serverUrl);
                        if (option) {
                            serverSelect.value = serverUrl;
                            document.getElementById('nickname-input').value = nickname;
                            this.login();
                        }
                    }, 100);
                }
            } catch (e) {
                // 解析错误，清除会话
                ConfigService.clearSession();
            }
        }
    }

    // 登录功能
    async login() {
        const nicknameInput = document.getElementById('nickname-input');
        const serverSelect = document.getElementById('server-select');
        const nickname = nicknameInput.value.trim();
        const serverAddress = serverSelect.value.trim();

        // 验证输入
        if (!nickname) {
            this.uiRenderer.showError('请输入昵称');
            return;
        }
        
        if (nickname.length < 2 || nickname.length > 15) {
            this.uiRenderer.showError('昵称长度必须在2-15个字符之间');
            return;
        }

        if (!serverAddress) {
            this.uiRenderer.showError('请选择服务器');
            return;
        }

        // 尝试连接服务器
        try {
            this.uiRenderer.showError('正在连接服务器...');
            
            // 创建WebSocket连接
            this.websocket = new WebSocketService();
            await this.websocket.connect(serverAddress, nickname, (message) => {
                this.handleIncomingMessage(message);
            });
            
            this.connected = true;
            this.currentUser = nickname;
            this.currentServer = serverAddress;
            
            // 保存会话
            localStorage.setItem('chat_session', JSON.stringify({
                nickname: this.currentUser,
                serverUrl: this.currentServer
            }));
            
            // 进入聊天界面
            this.uiRenderer.enterChat(this.currentUser);
            
            // 初始化聊天输入
            this.uiRenderer.initChatInput(() => this.sendMessage());
            
            // 初始化退出功能
            this.uiRenderer.initLogout(() => this.logout());
            
        } catch (error) {
            console.error('登录失败:', error);
            this.uiRenderer.showError(error.message || '登录失败，请检查网络连接和服务器地址');
        }
    }

    // 退出功能
    logout() {
        // 断开WebSocket连接
        if (this.websocket) {
            this.websocket.disconnect();
            this.websocket = null;
        }
        
        // 清除会话
        ConfigService.clearSession();
        
        // 重置状态
        this.currentUser = null;
        this.currentServer = null;
        this.connected = false;
        
        // 返回登录界面
        this.uiRenderer.exitChat();
    }

    // 发送消息
    sendMessage() {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        if (!message) return;
        
        // 检查是否是命令消息
        const isCommand = message.startsWith('/');
        
        // 发送消息
        if (this.connected && this.websocket) {
            const messageData = {
                type: isCommand ? 'command' : 'chat',
                content: message
            };
            
            this.websocket.sendMessage(messageData);
        }
        
        // 清空输入框
        messageInput.value = '';
        messageInput.focus();
    }

    // 处理收到的消息
    handleIncomingMessage(message) {
        this.uiRenderer.handleMessage(message, this.currentUser);
    }
}

// 导出模块
export { ChatApp };
