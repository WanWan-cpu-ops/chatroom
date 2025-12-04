/**
 * 会话管理服务模块
 */

export class SessionService {
    /**
     * 生成会话ID
     * @returns {string} 唯一的会话ID
     */
    static generateSessionId() {
        return 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    /**
     * 创建会话
     * @param {string} nickname - 用户昵称
     * @param {string} serverUrl - 服务器URL
     * @returns {Object} 会话信息
     */
    static createSession(nickname, serverUrl) {
        const sessionId = this.generateSessionId();
        const session = {
            id: sessionId,
            nickname: nickname,
            serverUrl: serverUrl,
            createdAt: Date.now()
        };
        
        // 存储会话到localStorage
        localStorage.setItem('chat_session', JSON.stringify(session));
        return session;
    }

    /**
     * 获取当前会话
     * @returns {Object|null} 会话信息或null
     */
    static getCurrentSession() {
        const sessionStr = localStorage.getItem('chat_session');
        if (!sessionStr) return null;
        
        try {
            const session = JSON.parse(sessionStr);
            // 简单的会话有效期检查（可选）
            const now = Date.now();
            if (session.createdAt && (now - session.createdAt) > 24 * 60 * 60 * 1000) {
                // 会话超过24小时，自动过期
                this.clearSession();
                return null;
            }
            return session;
        } catch (e) {
            console.error('解析会话信息失败:', e);
            this.clearSession();
            return null;
        }
    }

    /**
     * 清除会话
     */
    static clearSession() {
        localStorage.removeItem('chat_session');
    }

    /**
     * 验证会话
     * @param {Object} session - 会话信息
     * @returns {boolean} 会话是否有效
     */
    static validateSession(session) {
        if (!session || !session.id || !session.nickname || !session.serverUrl) {
            return false;
        }
        
        // 可以在这里添加更多验证逻辑，如与服务器端验证会话ID
        return true;
    }
}