/**
 * 天气服务层 - 处理天气查询相关的业务逻辑
 */
import { ApiService } from './api_service.js';

export class WeatherService {
    /**
     * 处理天气查询命令
     * @param {string} command - 天气查询命令字符串
     * @returns {Promise<Object|null>} 天气信息对象或null（如果查询失败）
     */
    static async handleWeatherCommand(command) {
        // 解析命令格式: @天气 [城市名]
        const parts = command.split(' ');
        const cityName = parts[1] || '';
        
        // 检查是否有城市参数
        if (!cityName) {
            throw new Error('缺少城市参数');
        }
        
        // 调用天气API
        const weatherData = await this.fetchWeatherData(cityName);
        
        // 检查天气数据是否有效
        if (!weatherData || weatherData.code !== 200 || !weatherData.data || !weatherData.data.data) {
            throw new Error('天气数据获取失败');
        }
        
        return weatherData;
    }
    
    /**
     * 获取城市编码
     * @param {string} cityName - 城市名称
     * @returns {Promise<Object>} 包含adcode的城市数据对象
     */
    static async fetchCityCode(cityName) {
        return new Promise((resolve, reject) => {
            fetch(`/api/city?name=${encodeURIComponent(cityName)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.data && data.data.length > 0) {
                        // 返回第一个匹配的城市
                        resolve(data.data[0]);
                    } else {
                        reject(new Error(data.message || '未找到匹配的城市'));
                    }
                })
                .catch(error => {
                    console.error('城市编码查询失败:', error);
                    reject(new Error('城市编码查询失败'));
                });
        });
    }
    
    /**
     * 获取天气数据
     * @param {string} cityName - 城市名称
     * @returns {Promise<Object>} 天气信息对象
     */
    static async fetchWeatherData(cityName) {
        return await ApiService.getWeather(cityName);
    }
    
    /**
     * 生成天气查询错误消息
     * @returns {Object} 错误消息对象
     */
    static generateErrorMessage() {
        return {
            type: 'chat',
            sender: '天气',
            content: '查询失败！<br>使用格式为@天气 城市<br>如：@天气 雅安市',
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * 生成天气查询成功消息
     * @param {Object} weatherData - 天气信息对象
     * @param {string} sender - 发送者名称（默认当前用户）
     * @returns {Object} 成功消息对象
     */
    static generateSuccessMessage(weatherData, sender) {
        // 确保天气数据结构有效
        if (!weatherData || weatherData.code !== 200 || !weatherData.data || !weatherData.data.data) {
            throw new Error('无效的天气数据');
        }
        
        const city = weatherData.data.city;
        const dailyForecasts = weatherData.data.data;
        
        // 使用今天的预报数据作为当前天气
        const todayForecast = dailyForecasts[0];
        if (!todayForecast || !todayForecast.weather || !todayForecast.temperature) {
            throw new Error('天气数据不完整');
        }
        
        // 生成天气图标
        let weatherIcon = '☀️';
        if (todayForecast.weather.includes('雨')) {
            weatherIcon = '🌧️';
        } else if (todayForecast.weather.includes('雪')) {
            weatherIcon = '❄️';
        } else if (todayForecast.weather.includes('云')) {
            weatherIcon = '⛅';
        } else if (todayForecast.weather.includes('阴')) {
            weatherIcon = '☁️';
        } else if (todayForecast.weather.includes('雾') || todayForecast.weather.includes('霾')) {
            weatherIcon = '🌫️';
        } else if (todayForecast.weather.includes('雷')) {
            weatherIcon = '⛈️';
        }
        
        // 生成预报HTML
        let forecastHtml = '';
        if (dailyForecasts.length >= 2) {
            // 确保只显示今明两天的预报
            const nextTwoDays = dailyForecasts.slice(0, 2);
            
            forecastHtml = `
                <div class="weather-forecast">
                    ${nextTwoDays.map((day, index) => {
                        // 生成预报天气图标
                        let dayIcon = '☀️';
                        if (day.weather.includes('雨')) {
                            dayIcon = '🌧️';
                        } else if (day.weather.includes('雪')) {
                            dayIcon = '❄️';
                        } else if (day.weather.includes('云')) {
                            dayIcon = '⛅';
                        } else if (day.weather.includes('阴')) {
                            dayIcon = '☁️';
                        } else if (day.weather.includes('雾') || day.weather.includes('霾')) {
                            dayIcon = '🌫️';
                        } else if (day.weather.includes('雷')) {
                            dayIcon = '⛈️';
                        }
                        
                        // 解析温度范围
                        const tempParts = day.temperature.split('-');
                        const dayTemp = tempParts[0];
                        const nightTemp = tempParts[1] ? tempParts[1].replace('℃', '') : '';
                        
                        return `
                            <div class="forecast-item">
                                <div class="forecast-day">${day.date}</div>
                                <div class="forecast-icon">${dayIcon}</div>
                                <div class="forecast-weather">${day.weather}</div>
                                <div class="forecast-temp">${day.temperature}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
        
        // 生成美观的天气卡片HTML
        const weatherCard = `
            <div class="weather-card">
                <div class="weather-header">
                    <h3>${city}</h3>
                    <span class="weather-icon">${weatherIcon}</span>
                </div>
                <div class="weather-main">
                    <span class="temperature">${todayForecast.temperature.split('-')[0]}℃</span>
                    <span class="weather-status">${todayForecast.weather}</span>
                </div>
                ${forecastHtml}
            </div>
        `;
        
        return {
            type: 'chat',
            sender: sender,
            content: weatherCard,
            timestamp: new Date().toISOString()
        };
    }
}
