/**
 * API服务层 - 统一管理所有接口调用
 */

export class ApiService {
    /**
     * 发送POST请求
     * @param {string} url - 请求URL
     * @param {Object} data - 请求数据
     * @returns {Promise<Object>} 响应数据
     */
    static async post(url, data) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('POST请求失败:', error);
            throw error;
        }
    }
    /**
     * 获取服务器配置
     * @param {Function} onSuccess - 成功回调
     * @param {Function} onError - 错误回调
     */
    static async getServerConfig() {
        try {
            const response = await fetch('/api/config');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取服务器配置失败:', error);
            throw error;
        }
    }
    
    /**
     * 获取天气信息
     * @param {string} city - 城市名称
     * @returns {Promise<Object>} 天气信息
     */
    static async getWeather(city) {
        const apiKey = '3eb4d8a2c7f4de1a'; // 新的API密钥
        const url = `https://v2.xxapi.cn/api/weather?city=${encodeURIComponent(city)}&key=${apiKey}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP错误! 状态: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('获取天气信息失败:', error);
            throw error;
        }
    }

    /**
     * 检查昵称是否可用
     * @param {string} nickname - 要检查的昵称
     * @returns {Promise<Object>} 包含可用状态和消息的对象
     */
    static async checkNickname(nickname) {
        try {
            const response = await fetch(`/api/check-nickname?nickname=${encodeURIComponent(nickname)}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('检查昵称失败:', error);
            throw error;
        }
    }

    /**
     * 创建WebSocket连接
     * @param {string} nickname - 用户昵称
     * @param {string} serverUrl - 服务器URL
     * @returns {WebSocket} WebSocket连接实例
     */
    static createWebSocket(nickname, serverUrl) {
        try {
            let url;
            
            // 检查serverUrl是否已经包含/ws路径
            if (serverUrl.endsWith('/ws')) {
                url = new URL(serverUrl);
            } else {
                url = new URL('/ws', serverUrl);
            }
            
            url.searchParams.append('nickname', encodeURIComponent(nickname));
            return new WebSocket(url);
        } catch (error) {
            console.error('创建WebSocket连接失败:', error);
            throw error;
        }
    }
}