/**
 * 配置加载服务模块
 */

import { ApiService } from './api_service.js';
import { SessionService } from './session_service.js';

export class ConfigService {
    static async loadServerConfig(refreshServerBtn, serverSelect) {
        // 添加加载动画或视觉反馈（如果需要）
        refreshServerBtn.classList.add('rotating'); // Assuming we might add a rotation class later
        serverSelect.innerHTML = '<option value="" disabled selected>加载中...</option>';
        serverSelect.disabled = true;

        try {
            const data = await ApiService.getServerConfig();
            
            serverSelect.innerHTML = '';
            if (data.servers && data.servers.length > 0) {
                data.servers.forEach(server => {
                    const option = document.createElement('option');
                    option.value = server.address; // Use 'address' from JSON
                    option.textContent = server.name;
                    serverSelect.appendChild(option);
                });

                // 自动登录检查
                const session = SessionService.getCurrentSession();
                if (session && SessionService.validateSession(session)) {
                    // 尝试设置服务器选择
                    const option = Array.from(serverSelect.options).find(opt => opt.value === session.serverUrl);
                    if (option) {
                        serverSelect.value = session.serverUrl;
                    } else {
                        // Fallback: clear session if server is not available
                        SessionService.clearSession();
                    }
                }

            } else {
                const option = document.createElement('option');
                option.text = "无法加载服务器列表";
                serverSelect.appendChild(option);
            }
        } catch (err) {
            console.error('加载配置错误:', err);
            serverSelect.innerHTML = '<option>加载失败</option>';
        } finally {
            serverSelect.disabled = false;
            refreshServerBtn.classList.remove('rotating');
        }
    }

    static getSession() {
        return SessionService.getCurrentSession();
    }

    static clearSession() {
        SessionService.clearSession();
    }
}
