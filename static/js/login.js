/**
 * 登录和注册界面逻辑模块
 */

import { ApiService } from './services/api_service.js';
import { SessionService } from './services/session_service.js';

// 登录注册应用类
class AuthApp {
    constructor() {
        this.init();
    }

    // 初始化登录和注册页面
    init() {
        // 初始化页面切换
        this.initScreenSwitch();
        
        // 初始化登录功能
        this.initLogin();
        
        // 初始化注册功能
        this.initRegister();
    }

    // 初始化页面切换功能
    initScreenSwitch() {
        // 登录页面 -> 注册页面
        const switchToRegister = document.getElementById('switch-to-register');
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchScreen('login-screen', 'register-screen');
        });

        // 注册页面 -> 登录页面
        const switchToLogin = document.getElementById('switch-to-login');
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchScreen('register-screen', 'login-screen');
        });
    }

    // 切换页面
    switchScreen(fromScreenId, toScreenId) {
        const fromScreen = document.getElementById(fromScreenId);
        const toScreen = document.getElementById(toScreenId);
        
        fromScreen.classList.remove('active');
        toScreen.classList.add('active');
        
        // 清除错误消息
        this.clearErrors();
    }

    // 初始化登录功能
    initLogin() {
        const loginBtn = document.getElementById('login-btn');
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');

        // 登录按钮点击事件
        loginBtn.addEventListener('click', async () => {
            await this.handleLogin();
        });

        // 回车键登录
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });
    }

    // 处理登录请求
    async handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const errorElement = document.getElementById('login-error');

        // 验证输入
        if (!username || !password) {
            this.showError(errorElement, '用户名和密码不能为空');
            return;
        }

        try {
            // 显示加载状态
            this.showError(errorElement, '登录中...');
            
            // 发送登录请求
            const response = await ApiService.post('/api/login', {
                username: username,
                password: password
            });

            if (response.success) {
                // 登录成功，创建会话
                const serverUrl = 'ws://localhost:8888'; // 使用WebSocket默认地址
                SessionService.createSession(username, serverUrl);
                
                // 重定向到聊天页面
                window.location.href = '/chat';
            } else {
                // 登录失败，显示错误信息
                this.showError(errorElement, response.message);
            }
        } catch (error) {
            console.error('登录失败:', error);
            this.showError(errorElement, '登录失败，请检查网络连接');
        }
    }

    // 初始化注册功能
    initRegister() {
        const registerBtn = document.getElementById('register-btn');
        const usernameInput = document.getElementById('register-username');
        const passwordInput = document.getElementById('register-password');
        const confirmPasswordInput = document.getElementById('register-confirm-password');

        // 注册按钮点击事件
        registerBtn.addEventListener('click', async () => {
            await this.handleRegister();
        });

        // 回车键注册
        confirmPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleRegister();
            }
        });
    }

    // 处理注册请求
    async handleRegister() {
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value.trim();
        const confirmPassword = document.getElementById('register-confirm-password').value.trim();
        const errorElement = document.getElementById('register-error');

        // 验证输入
        if (!username || !password || !confirmPassword) {
            this.showError(errorElement, '请填写完整的注册信息');
            return;
        }

        if (password !== confirmPassword) {
            this.showError(errorElement, '两次输入的密码不一致');
            return;
        }

        if (username.length < 2 || username.length > 15) {
            this.showError(errorElement, '用户名长度必须在2-15个字符之间');
            return;
        }

        if (password.length < 6) {
            this.showError(errorElement, '密码长度不能少于6个字符');
            return;
        }

        try {
            // 显示加载状态
            this.showError(errorElement, '注册中...');
            
            // 检查用户名是否可用
            const checkResponse = await ApiService.post('/api/check-nickname', {
                username: username
            });

            if (!checkResponse.available) {
                this.showError(errorElement, checkResponse.message);
                return;
            }

            // 发送注册请求
            const registerResponse = await ApiService.post('/api/register', {
                username: username,
                password: password,
                confirm_password: confirmPassword
            });

            if (registerResponse.success) {
                // 注册成功，显示成功信息并切换到登录页面
                this.showError(errorElement, '注册成功，请登录', 'success');
                setTimeout(() => {
                    this.switchScreen('register-screen', 'login-screen');
                    // 自动填充用户名到登录表单
                    document.getElementById('login-username').value = username;
                    document.getElementById('login-password').focus();
                }, 1500);
            } else {
                // 注册失败，显示错误信息
                this.showError(errorElement, registerResponse.message);
            }
        } catch (error) {
            console.error('注册失败:', error);
            this.showError(errorElement, '注册失败，请检查网络连接');
        }
    }

    // 显示错误消息
    showError(element, message, type = 'error') {
        element.textContent = message;
        element.style.display = 'block';
        element.className = type === 'error' ? 'error-msg' : 'success-msg';
    }

    // 清除所有错误消息
    clearErrors() {
        const errorElements = document.querySelectorAll('.error-msg, .success-msg');
        errorElements.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }
}

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new AuthApp();
});