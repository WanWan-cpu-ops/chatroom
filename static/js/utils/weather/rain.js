// 雨天特效
function createRainEffect(maxDrops, isHeavy, effectContainer, weatherElements, currentWeather, intervals) {
    console.log(`[${new Date().toISOString()}] 降雨效果初始化: 最大雨滴数 ${maxDrops}, 是否大雨 ${isHeavy}`);
    
    // 简化的雨滴创建函数
    const createRaindrop = () => {
        // 检查必要条件
        if (!effectContainer || !currentWeather) return;
        if (!(currentWeather === 'rain' || currentWeather === 'heavyRain')) return;
        if (weatherElements.length >= maxDrops) return;
        
        // 创建雨滴元素
        const raindrop = document.createElement('div');
        raindrop.className = 'raindrop';
        
        // 设置基本样式
        const x = Math.random() * window.innerWidth;
        const duration = isHeavy ? (1.0 + Math.random() * 1.6) : (1.6 + Math.random() * 2.4);
        
        raindrop.style.left = `${x}px`;
        raindrop.style.top = '-50px';
        raindrop.style.width = isHeavy ? '4px' : '3px';
        raindrop.style.height = isHeavy ? '30px' : '25px';
        raindrop.style.background = isHeavy ? 'rgba(135, 206, 250, 0.9)' : 'rgba(135, 206, 250, 0.8)';
        raindrop.style.animation = `fall ${duration}s linear forwards`;
        
        try {
            effectContainer.appendChild(raindrop);
            weatherElements.push(raindrop);
        } catch (error) {
            console.error('添加雨滴失败:', error);
            return;
        }
        
        // 雨滴动画结束后移除
        raindrop.addEventListener('animationend', () => {
            if (effectContainer && effectContainer.contains(raindrop)) {
                effectContainer.removeChild(raindrop);
                const index = weatherElements.indexOf(raindrop);
                if (index > -1) {
                    weatherElements.splice(index, 1);
                }
            }
            
            // 重新创建新雨滴
            if (currentWeather) {
                createRaindrop();
            }
        });
    };
    
    // 定时器创建雨滴
    const interval = setInterval(createRaindrop, 30);
    intervals.push(interval);
    
    // 初始化创建一批雨滴
    for (let i = 0; i < Math.min(20, maxDrops); i++) {
        setTimeout(createRaindrop, i * 50);
    }
}

export default createRainEffect;