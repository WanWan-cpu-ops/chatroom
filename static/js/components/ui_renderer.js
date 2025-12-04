/**
 * UI渲染模块
 */

import { FeatureService } from '../services/feature_service.js';
import { SidebarService } from '../services/sidebar_service.js';
import { ChatMessages } from './chat_messages.js';

export class UIRenderer {
    constructor() {
        // 初始化功能服务
        this.featureService = new FeatureService();
        // 初始化侧边栏服务
        this.sidebarService = new SidebarService();
        // 初始化聊天消息组件
        this.chatMessagesComponent = new ChatMessages();
        
        // 获取DOM元素引用（使用可选链接和空值合并，避免在缺少元素的页面上出错）
        this.loginScreen = document.getElementById('login-screen');
        this.chatScreen = document.getElementById('chat-screen');
        this.loginError = document.getElementById('login-error');
        this.nicknameInput = document.getElementById('nickname-input');
        
        // 检查是否在登录页面
        this.isLoginPage = !!this.loginScreen;
    }

    // 处理消息渲染
    handleMessage(data, currentUser) {
        // 委托给ChatMessages组件处理
        this.chatMessagesComponent.handleMessage(data, currentUser);
        
        // 处理系统消息中的在线用户更新
        if (data.type === 'system' && data.online_users) {
            // 使用SidebarService更新在线用户
            this.sidebarService.updateOnlineUsers(data.online_users);
        }
    }

    // 更新在线用户列表 - 已移至SidebarService
    updateOnlineUsers(users) {
        this.sidebarService.updateOnlineUsers(users);
    }

    // 显示登录错误
    showError(msg) {
        this.loginError.textContent = msg;
    }

    // 进入聊天界面
    enterChat(nickname) {
        this.loginScreen.classList.remove('active');
        this.chatScreen.classList.add('active');
        
        // 初始化侧边栏服务
        this.sidebarService.init(nickname);
        
        // Focus input
        this.nicknameInput.focus();
    }

    // 退出聊天界面
    exitChat() {
        this.chatScreen.classList.remove('active');
        this.loginScreen.classList.add('active');
        // 清空聊天消息历史
        this.chatMessagesComponent.clearMessages();
        // 使用SidebarService清空在线用户列表
        this.sidebarService.updateOnlineUsers([]);
    }

    // 初始化表情选择器
    initEmojiPicker() {
        // 使用FeatureService初始化表情选择器
        this.featureService.initEmojiPicker();
    }

    // 初始化聊天输入
    initChatInput(sendMessageCallback) {
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');

        sendBtn.addEventListener('click', sendMessageCallback);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessageCallback();
            }
        });
    }

    // 初始化登录功能
    initLogin(performLoginCallback) {
        const loginBtn = document.getElementById('login-btn');
        const nicknameInput = document.getElementById('nickname-input');

        loginBtn.addEventListener('click', performLoginCallback);
        nicknameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performLoginCallback();
        });
    }

    // 初始化退出功能 - 使用SidebarService的事件机制
    initLogout(logoutCallback) {
        // 监听侧边栏的退出事件
        document.addEventListener('sidebar:logout', logoutCallback);
    }
}
