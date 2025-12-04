/**
 * Emoji选择器服务模块
 */

export class EmojiService {
    constructor() {
        // Emoji功能配置
        this.config = {
            emojiBtnId: 'emoji-btn',
            emojiPickerId: 'emoji-picker',
            messageInputId: 'message-input'
        };
    }

    /**
     * 初始化emoji选择器
     */
    initEmojiPicker() {
        const emojiBtn = document.getElementById(this.config.emojiBtnId);
        const emojiPicker = document.getElementById(this.config.emojiPickerId);
        const messageInput = document.getElementById(this.config.messageInputId);

        if (!emojiBtn || !emojiPicker || !messageInput) {
            console.warn('Emoji picker elements not found');
            return;
        }

        emojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            emojiPicker.classList.toggle('hidden');
        });
        
        document.addEventListener('click', (e) => {
            if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
                emojiPicker.classList.add('hidden');
            }
        });

        // 委托表情点击事件
        emojiPicker.addEventListener('click', (e) => {
            if (e.target.tagName === 'SPAN') {
                messageInput.value += e.target.textContent;
                messageInput.focus();
            }
        });
    }
}