/**
 * 聊天消息组件
 * 专门管理聊天消息区域的渲染和更新
 */

import { escapeHtml } from '../utils/utils.js';
import { FeatureService } from '../services/feature_service.js';
import { weatherEffects } from '../utils/weather_effects.js';

export class ChatMessages {
    constructor() {
        // 获取聊天消息区域DOM元素
        this.chatMessagesElement = document.getElementById('chat-messages');
        // 初始化功能服务
        this.featureService = new FeatureService();
        // 检查是否在聊天页面
        this.isChatPage = !!this.chatMessagesElement;
    }

    /**
     * 处理消息渲染
     * @param {Object} data - 消息数据
     * @param {string} currentUser - 当前用户名
     */
    handleMessage(data, currentUser) {
        // 确保在聊天页面才执行渲染逻辑
        if (!this.isChatPage) return;
        
        // 滚动到底部逻辑
        const shouldScroll = this.chatMessagesElement.scrollTop + this.chatMessagesElement.clientHeight === this.chatMessagesElement.scrollHeight;

        if (data.type === 'system') {
            this.renderSystemMessage(data);
        } else if (data.type === 'ai_stream_update') {
            // 处理流式AI响应
            this.renderAIStreamUpdate(data);
        } else {
            this.renderUserMessage(data, currentUser);
        }

        // Auto scroll
        this.scrollToBottom();
    }

    /**
     * 渲染系统消息
     * @param {Object} data - 系统消息数据
     */
    renderSystemMessage(data) {
        const div = document.createElement('div');
        div.className = 'message system';
        div.innerHTML = `<div class="content">${escapeHtml(data.content)}</div>`;
        this.chatMessagesElement.appendChild(div);
    }

    /**
     * 渲染用户消息
     * @param {Object} data - 用户消息数据
     * @param {string} currentUser - 当前用户名
     */
    renderUserMessage(data, currentUser) {
        const isSelf = data.sender === currentUser;
        const div = document.createElement('div');
        div.className = `message ${isSelf ? 'self' : 'other'}`;
        
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        let contentHtml = '';
        
        if (data.type === 'movie') {
            // 使用FeatureService渲染电影播放器
            const movieContainer = document.createElement('div');
            this.featureService.renderMoviePlayer(data, movieContainer);
            contentHtml = movieContainer.innerHTML;
        } else if (data.type === 'ai_chat') {
            // 使用FeatureService渲染AI初始响应
            const aiContainer = document.createElement('div');
            this.featureService.renderAIInitResponse(data, aiContainer);
            contentHtml = aiContainer.innerHTML;
        } else if (data.type === 'news_image') {
            // 渲染新闻图片，并添加错误处理
            contentHtml = `<div class="content"><div class="news-image-container"><img src="${escapeHtml(data.content)}" alt="新闻图片" onerror="this.onerror=null; this.src='/static/images/news.jpg.html';"></div></div>`;
            div.classList.add('news-message');
        } else if (data.content && data.content.includes('<div class="weather-card">')) {
            // 天气卡片消息，直接渲染HTML
            contentHtml = data.content;
            
            // 从天气卡片中提取天气描述并启动对应的特效
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data.content;
            const weatherStatusElement = tempDiv.querySelector('.weather-status');
            if (weatherStatusElement) {
                const weatherDescription = weatherStatusElement.textContent;
                weatherEffects.startWeatherByDescription(weatherDescription);
            }
        } else {
            // 其他文本消息，使用HTML转义
            contentHtml = `<div class="content">${escapeHtml(data.content)}</div>`;
        }

        div.innerHTML = `
            <div class="meta">${escapeHtml(data.sender)} • ${time}</div>
            ${contentHtml}
        `;
        
        this.chatMessagesElement.appendChild(div);
    }

    /**
     * 渲染AI流式更新
     * @param {Object} data - AI流式更新数据
     */
    renderAIStreamUpdate(data) {
        // 使用FeatureService更新AI流式响应
        this.featureService.updateAIStreamResponse(data);
        
        // 如果接近底部则自动滚动
        this.scrollToBottom();
    }

    /**
     * 清空聊天消息
     */
    clearMessages() {
        if (this.isChatPage) {
            this.chatMessagesElement.innerHTML = '';
        }
    }

    /**
     * 滚动到底部
     */
    scrollToBottom() {
        if (this.isChatPage) {
            this.chatMessagesElement.scrollTop = this.chatMessagesElement.scrollHeight;
        }
    }

    /**
     * 添加欢迎消息
     */
    addWelcomeMessage() {
        if (this.isChatPage) {
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'message system';
            welcomeDiv.innerHTML = '<div class="content">欢迎加入聊天室！尝试发送 @电影 [url] 或 @川小农 [message]</div>';
            this.chatMessagesElement.appendChild(welcomeDiv);
        }
    }
}