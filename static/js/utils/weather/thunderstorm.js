// 雷阵雨特效
import createRainEffect from './rain.js';

function createThunderstormEffect(maxElements, effectContainer, weatherElements, currentWeather, intervals, weatherInstance) {
    // 创建雷阵雨效果（结合降雨和闪电）
    createRainEffect(maxElements * 0.8, true, effectContainer, weatherElements, currentWeather, intervals);
    
    // 随机生成闪电
    const createLightning = () => {
        if (!currentWeather || !effectContainer) return;
        
        const lightning = document.createElement('div');
        lightning.className = 'lightning';
        
        // 随机位置和长度
        const x = Math.random() * 80 + 10;
        const length = 100 + Math.random() * 100;
        const rotation = -10 + Math.random() * 20;
        
        lightning.style.left = `${x}vw`;
        lightning.style.height = `${length}px`;
        lightning.style.transform = `rotate(${rotation}deg)`;
        
        try {
            effectContainer.appendChild(lightning);
            weatherElements.push(lightning);
        } catch (error) {
            console.error('添加闪电失败:', error);
            return;
        }
        
        // 闪电动画结束后移除
        lightning.addEventListener('animationend', () => {
            // 检查容器是否存在
            if (effectContainer && effectContainer.contains(lightning)) {
                try {
                    effectContainer.removeChild(lightning);
                    const index = weatherElements.indexOf(lightning);
                    if (index > -1) {
                        weatherElements.splice(index, 1);
                    }
                } catch (error) {
                    console.error('移除闪电失败:', error);
                }
            }
        });
    };
    
    // 定期生成闪电
    const lightningInterval = setInterval(createLightning, 10000 + Math.random() * 20000);
    intervals.push(lightningInterval);
    
    // 立即生成一次闪电
    createLightning();
}

export default createThunderstormEffect;