// 天气特效 JavaScript
// 导入各个天气特效模块
import createSunnyEffect from './weather/sunny.js';
import createCloudyEffect from './weather/cloudy.js';
import createOvercastEffect from './weather/overcast.js';
import createRainEffect from './weather/rain.js';
import createSnowEffect from './weather/snow.js';
import createFogEffect from './weather/fog.js';
import createThunderstormEffect from './weather/thunderstorm.js';

class WeatherEffects {
    constructor() {
        this.effectContainer = null;
        this.currentWeather = null;
        this.weatherElements = [];
        this.intervals = [];
        this.effectTimer = null;
        
        // 不同天气的配置参数
        this.weatherConfig = {
            sunny: { maxElements: 1, intensity: 0.8 },
            cloudy: { maxElements: 8, intensity: 0.7 },
            overcast: { maxElements: 12, intensity: 0.6 },
            rain: { maxElements: 300, intensity: 0.6 },
            heavyRain: { maxElements: 450, intensity: 0.8 },
            snow: { maxElements: 150, intensity: 0.6 },
            fog: { maxElements: 5, intensity: 0.4 },
            thunderstorm: { maxElements: 350, intensity: 0.7 }
        };
    }

    // 初始化特效容器
    initContainer() {
        if (this.effectContainer) return;
        
        this.effectContainer = document.createElement('div');
        this.effectContainer.id = 'weather-effects';
        document.body.appendChild(this.effectContainer);
    }

    // 启动指定类型的天气特效
    startWeather(weatherType) {
        // 清除之前的计时器
        if (this.effectTimer) {
            clearTimeout(this.effectTimer);
            this.effectTimer = null;
        }
        
        // 先停止当前天气特效，如果当前有效果正在运行
        if (this.currentWeather) {
            // 立即移除旧容器和元素，不等待淡出动画
            if (this.effectContainer && document.body.contains(this.effectContainer)) {
                document.body.removeChild(this.effectContainer);
                this.effectContainer = null;
            }
            
            // 清除所有定时器
            this.intervals.forEach(interval => clearInterval(interval));
            this.intervals = [];
            
            // 清空元素数组
            this.weatherElements = [];
            this.currentWeather = null;
        }
        
        // 创建新容器并启动新效果
        this.initContainer();
        this.currentWeather = weatherType;
        
        const config = this.weatherConfig[weatherType] || this.weatherConfig.sunny;
        this.effectContainer.style.opacity = config.intensity;
        
        console.log(`[${new Date().toISOString()}] 天气特效启动: ${weatherType}, 强度: ${config.intensity}`);
        
        // 根据天气类型启动对应的特效
        switch (weatherType) {
            case 'sunny':
                createSunnyEffect(this.effectContainer, this.weatherElements);
                break;
            case 'cloudy':
                createCloudyEffect(config.maxElements, this.effectContainer, this.weatherElements, this.currentWeather, this);
                break;
            case 'overcast':
                createOvercastEffect(config.maxElements, this.effectContainer, this.weatherElements, this.currentWeather, this);
                break;
            case 'rain':
                createRainEffect(config.maxElements, false, this.effectContainer, this.weatherElements, this.currentWeather, this.intervals);
                break;
            case 'heavyRain':
                createRainEffect(config.maxElements, true, this.effectContainer, this.weatherElements, this.currentWeather, this.intervals);
                break;
            case 'snow':
                createSnowEffect(config.maxElements, this.effectContainer, this.weatherElements, this.currentWeather, this.intervals);
                break;
            case 'fog':
                createFogEffect(config.maxElements, this.effectContainer, this.weatherElements);
                break;
            case 'thunderstorm':
                createThunderstormEffect(config.maxElements, this.effectContainer, this.weatherElements, this.currentWeather, this.intervals, this);
                break;
            default:
                console.warn(`未知的天气类型: ${weatherType}`);
        }
        
        // 设置10秒后自动停止特效
        this.effectTimer = setTimeout(() => {
            this.stopWeather();
        }, 10000);
    }

    // 停止当前天气特效
    stopWeather() {
        // 清除特效计时器
        if (this.effectTimer) {
            clearTimeout(this.effectTimer);
            this.effectTimer = null;
        }
        
        console.log(`[${new Date().toISOString()}] 天气特效停止: 当前天气 ${this.currentWeather}, 元素数量 ${this.weatherElements.length}`);
        
        // 清除所有定时器
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
        
        // 移除所有天气元素
        this.weatherElements.forEach(element => {
            if (this.effectContainer && this.effectContainer.contains(element)) {
                element.classList.add('fade-out');
                setTimeout(() => {
                    if (this.effectContainer && this.effectContainer.contains(element)) {
                        this.effectContainer.removeChild(element);
                    }
                }, 1000);
            }
        });
        this.weatherElements = [];
        
        this.currentWeather = null;
        
        // 标记当前的容器引用，防止快速切换时容器被重复移除
        const containerToRemove = this.effectContainer;
        
        // 移除容器
        setTimeout(() => {
            // 只有当当前容器仍然是要移除的容器时才执行移除操作
            if (containerToRemove && this.effectContainer === containerToRemove && document.body.contains(containerToRemove)) {
                document.body.removeChild(containerToRemove);
                // 只有当当前容器确实被移除时才清空引用
                if (this.effectContainer === containerToRemove) {
                    this.effectContainer = null;
                }
            }
        }, 1000);
    }

    // 根据天气描述获取对应的天气类型
    getWeatherTypeFromDescription(description) {
        // 按优先级从高到低检查天气描述
        
        // 1. 雷阵雨（最高优先级）：含有"雷"字
        if (description.includes('雷')) {
            return 'thunderstorm';
        }
        
        // 2. 雪天：含有"雪"字，优先级大于雨天，低于雷阵雨
        if (description.includes('雪')) {
            return 'snow';
        }
        
        // 3. 雾霾天：含有"雾"或"霾"字
        if (description.includes('雾') || description.includes('霾')) {
            return 'fog';
        }
        
        // 4. 晴天：天气为"晴"
        if (description === '晴') {
            return 'sunny';
        }
        
        // 5. 多云：天气含有"云"字
        if (description.includes('云')) {
            return 'cloudy';
        }
        
        // 6. 阴天：天气为"阴"
        if (description === '阴') {
            return 'overcast';
        }
        
        // 7. 雨天（最低优先级）：含有"雨"字
        if (description.includes('雨')) {
            return 'rain';
        }
        
        // 默认返回晴天
        return 'sunny';
    }

    // 根据天气描述启动对应的特效
    startWeatherByDescription(description) {
        const weatherType = this.getWeatherTypeFromDescription(description);
        this.startWeather(weatherType);
    }

    // 获取当前天气类型
    getCurrentWeather() {
        return this.currentWeather;
    }
}

// 导出单例实例
export const weatherEffects = new WeatherEffects();
