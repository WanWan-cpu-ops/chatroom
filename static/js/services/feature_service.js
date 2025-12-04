/**
 * 功能管理服务模块
 * 统一管理emoji选择、电影、AI等功能的调用接口
 */

import { EmojiService } from './emoji_service.js';
import { MovieService } from './movie_service.js';
import { AIService } from './ai_service.js';

export class FeatureService {
    constructor() {
        // 初始化各功能服务实例
        this.emojiService = new EmojiService();
        this.movieService = new MovieService();
        this.aiService = new AIService();
    }

    // =================== Emoji 功能调用接口 ===================
    /**
     * 初始化emoji选择器
     */
    initEmojiPicker() {
        return this.emojiService.initEmojiPicker();
    }

    // =================== 电影功能调用接口 ===================
    /**
     * 检查消息是否为电影链接
     * @param {string} content - 消息内容
     * @returns {boolean} - 是否为电影链接
     */
    isMovieMessage(content) {
        return this.movieService.isMovieMessage(content);
    }

    /**
     * 解析电影链接
     * @param {string} content - 消息内容
     * @returns {string} - 电影URL
     */
    parseMovieUrl(content) {
        return this.movieService.parseMovieUrl(content);
    }

    /**
     * 渲染电影播放器
     * @param {Object} data - 消息数据
     * @param {HTMLElement} container - 容器元素
     */
    renderMoviePlayer(data, container) {
        return this.movieService.renderMoviePlayer(data, container);
    }

    // =================== AI 功能调用接口 ===================
    /**
     * 检查消息是否为AI请求
     * @param {string} content - 消息内容
     * @returns {boolean} - 是否为AI请求
     */
    isAIRequest(content) {
        return this.aiService.isAIRequest(content);
    }

    /**
     * 解析AI请求
     * @param {string} content - 消息内容
     * @returns {string} - AI请求内容
     */
    parseAIRequest(content) {
        return this.aiService.parseAIRequest(content);
    }

    /**
     * 渲染AI初始响应
     * @param {Object} data - 消息数据
     * @param {HTMLElement} container - 容器元素
     */
    renderAIInitResponse(data, container) {
        return this.aiService.renderAIInitResponse(data, container);
    }

    /**
     * 更新AI流式响应
     * @param {Object} data - 消息数据
     */
    updateAIStreamResponse(data) {
        return this.aiService.updateAIStreamResponse(data);
    }

    // =================== 工具方法 ===================
    /**
     * 在输入框中插入命令
     * @param {string} command - 命令内容
     */
    insertCommand(command) {
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.value += command;
            messageInput.focus();
        }
    }
}
