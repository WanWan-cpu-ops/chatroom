/**
 * 工具函数模块
 */

// 工具函数
export function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 全局命令辅助函数
export function insertCommand(cmd) {
    const messageInput = document.getElementById('message-input');
    messageInput.value = cmd;
    messageInput.focus();
}
