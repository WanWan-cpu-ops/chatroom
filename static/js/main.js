/**
 * 聊天应用入口文件
 */

// 导入聊天应用主模块
import { ChatApp } from './modules/chat_app.js';

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    const chatApp = new ChatApp();
    await chatApp.init();
});
