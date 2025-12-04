/**
 * AI功能服务模块
 */

export class AIService {
    constructor() {
        // AI功能配置
        this.config = {
            aiPrefix: '@川小农 ',
            thinkingMessage: '🤖 AI 正在思考中...',
            aiName: '川小农',
            aiAvatarColor: '#00cec9'
        };
    }

    /**
     * 检查消息是否为AI请求
     * @param {string} content - 消息内容
     * @returns {boolean} - 是否为AI请求
     */
    isAIRequest(content) {
        return content.startsWith(this.config.aiPrefix);
    }

    /**
     * 解析AI请求
     * @param {string} content - 消息内容
     * @returns {string} - AI请求内容
     */
    parseAIRequest(content) {
        return content.substring(this.config.aiPrefix.length).trim();
    }

    /**
     * 渲染AI初始响应
     * @param {Object} data - 消息数据
     * @param {HTMLElement} container - 容器元素
     */
    renderAIInitResponse(data, container) {
        const contentHtml = `
            <div class="content">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <div class="avatar-small" style="background: ${this.config.aiAvatarColor};">AI</div>
                    <span style="color: ${this.config.aiAvatarColor}; font-weight: bold;">${this.config.aiName}</span>
                </div>
                <div id="ai-content-${data.id}" data-streaming="false" style="font-size: 0.95rem; line-height: 1.6; color: #666; white-space: pre-wrap;">
                    ${this.config.thinkingMessage}
                </div>
            </div>
        `;
        
        container.innerHTML = contentHtml;
    }

    /**
     * 更新AI流式响应
     * @param {Object} data - 消息数据
     */
    updateAIStreamResponse(data) {
        const contentDiv = document.getElementById(`ai-content-${data.id}`);
        if (contentDiv) {
            // 检查是否是第一个块（仍然有"AI思考中"文本）
            if (contentDiv.dataset.streaming === "false") {
                contentDiv.textContent = ""; // 清除"思考中..."
                contentDiv.dataset.streaming = "true";
                contentDiv.style.color = "#2d3436"; // 重置颜色为正常文本
                contentDiv.style.borderTop = "none";
                contentDiv.style.paddingTop = "0";
            }
            // 追加块
            contentDiv.textContent += data.content;
        }
    }
}