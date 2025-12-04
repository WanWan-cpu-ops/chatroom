/**
 * 天气功能模块
 */
import { WeatherService } from '../services/weather_service.js';
import { weatherEffects } from '../utils/weather_effects.js';

export class WeatherModule {
    constructor(chatApp) {
        this.chatApp = chatApp;
        this.weatherEffects = weatherEffects;
    }
    
    // 初始化天气功能
    init() {
        this.initWeatherButton();
    }
    
    // 初始化天气按钮
    initWeatherButton() {
        const toolbar = document.querySelector('.toolbar');
        
        // 创建天气按钮
        const weatherBtn = document.createElement('button');
        weatherBtn.className = 'tool-btn';
        weatherBtn.title = '天气查询';
        weatherBtn.innerHTML = '☁️'; // 云朵图标
        
        // 点击按钮时向输入框中输入"@天气"
        weatherBtn.onclick = () => {
            const messageInput = document.getElementById('message-input');
            messageInput.value += '@天气 ';
            messageInput.focus();
        };
        
        // 添加到工具栏
        toolbar.appendChild(weatherBtn);
    }
    
    // 处理天气查询命令
    async handleWeatherCommand(command) {
        const messageInput = document.getElementById('message-input');
        
        try {
            // 使用WeatherService处理天气查询命令
            const weatherData = await WeatherService.handleWeatherCommand(command);
            
            // 天气数据获取成功，通过WebSocket发送到服务器
            if (this.chatApp.connected && this.chatApp.websocket) {
                const weatherMessage = WeatherService.generateSuccessMessage(weatherData, this.chatApp.currentUser);
                this.chatApp.websocket.sendMessage(weatherMessage);
            }
            
            // 根据天气启动对应的特效
            const todayForecast = weatherData.data.data[0];
            this.weatherEffects.startWeatherByDescription(todayForecast.weather);
            
        } catch (error) {
            console.error('天气查询失败:', error);
            
            // 发送错误消息到聊天界面
            const errorMessage = WeatherService.generateErrorMessage();
            this.chatApp.handleIncomingMessage(errorMessage);
        }
        
        // 清空输入框
        messageInput.value = '';
        messageInput.focus();
    }
}