/**
 * 聊天页面入口文件
 */

import { ConfigService } from './services/config_service.js';
import { WebSocketService } from './services/websocket_service.js';
import { UIRenderer } from './components/ui_renderer.js';
import { escapeHtml } from './utils/utils.js';
import { SessionService } from './services/session_service.js';
import { ApiService } from './services/api_service.js';
import { WeatherModule } from './modules/weather_module.js';
import { weatherEffects } from './utils/weather_effects.js';

// 聊天应用类
class ChatApp {
    constructor() {
        this.currentUser = null;
        this.currentServer = null;
        this.websocket = null;
        this.connected = false;
        
        // 初始化组件
        this.uiRenderer = new UIRenderer();
        
        // 初始化天气模块
        this.weatherModule = new WeatherModule(this);
    }

    // 应用初始化
    async init() {
        // 检查会话
        await this.checkSession();
        
        // 初始化UI组件
        this.initUI();
    }

    // 检查会话
    async checkSession() {
        // 从会话中获取用户信息
        const session = SessionService.getCurrentSession();
        
        if (!session || !SessionService.validateSession(session)) {
            // 会话无效或不存在，重定向到登录页面
            window.location.href = '/login';
            return;
        }
        
        this.currentUser = session.nickname;
        this.currentServer = session.serverUrl;
        
        // 初始化WebSocket连接
        try {
            this.websocket = new WebSocketService();
            await this.websocket.connect(this.currentServer, this.currentUser, (message) => {
                this.handleIncomingMessage(message);
            });
            
            this.connected = true;
            
            // 初始化侧边栏
            this.uiRenderer.sidebarService.init(this.currentUser);
            
        } catch (error) {
            console.error('连接失败:', error);
            alert('连接服务器失败，请重新登录');
            SessionService.clearSession();
            window.location.href = '/login';
        }
    }

    // 更新用户信息 - 已移至SidebarService
    updateUserInfo() {
        // 已通过SidebarService处理
    }

    // 初始化UI
    initUI() {
        // 初始化表情选择器
        this.uiRenderer.initEmojiPicker();
        
        // 初始化聊天输入
        this.uiRenderer.initChatInput(() => this.sendMessage());
        
        // 初始化退出功能
        this.uiRenderer.initLogout(() => this.logout());
        
        // 初始化天气功能
        this.weatherModule.init();
        
        // 初始化天气特效测试功能
        this.initWeatherTest();
    }

    // 发送消息
    sendMessage() {
        const messageInput = document.getElementById('message-input');
        let message = messageInput.value.trim();
        
        if (!message) return;
        
        // 检查是否是天气查询命令
        if (message.startsWith('@天气')) {
            this.weatherModule.handleWeatherCommand(message);
            return;
        }
        
        // 检查是否是其他命令消息
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

    // 退出功能
    logout() {
        // 断开WebSocket连接
        if (this.websocket) {
            this.websocket.disconnect();
            this.websocket = null;
        }
        
        // 清除会话
        SessionService.clearSession();
        
        // 重定向到登录页面
        window.location.href = '/login';
    }
    
    // 初始化天气特效测试功能
    initWeatherTest() {
        const weatherTestBtn = document.getElementById('weather-test-btn');
        const weatherTestPicker = document.getElementById('weather-test-picker');
        const weatherButtons = weatherTestPicker.querySelectorAll('.weather-btn');
        
        // 天气特效测试按钮点击事件
        weatherTestBtn.addEventListener('click', () => {
            // 切换天气特效选择器显示
            weatherTestPicker.classList.toggle('hidden');
            
            // 隐藏表情选择器
            const emojiPicker = document.getElementById('emoji-picker');
            emojiPicker.classList.add('hidden');
        });
        
        // 天气特效按钮点击事件
        weatherButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const weatherType = btn.getAttribute('data-weather');
                
                if (weatherType === 'stop') {
                    weatherEffects.stopWeather();
                } else {
                    weatherEffects.startWeather(weatherType);
                }
                
                // 隐藏选择器
                weatherTestPicker.classList.add('hidden');
            });
        });
        
        // 点击页面其他地方关闭天气特效选择器
        document.addEventListener('click', (e) => {
            if (!weatherTestBtn.contains(e.target) && !weatherTestPicker.contains(e.target)) {
                weatherTestPicker.classList.add('hidden');
            }
        });
    }
}

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const chatApp = new ChatApp();
    chatApp.init();
});

// 全局函数：插入命令
window.insertCommand = function(command) {
    const messageInput = document.getElementById('message-input');
    messageInput.value += command;
    messageInput.focus();
};