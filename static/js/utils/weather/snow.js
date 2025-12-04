// 雪天特效
function createSnowEffect(maxSnowflakes, effectContainer, weatherElements, currentWeather, intervals) {
    const createSnowflake = () => {
        // 检查必要条件
        if (!effectContainer || !currentWeather) return;
        if (currentWeather !== 'snow') return;
        if (weatherElements.length >= maxSnowflakes) return;
        
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        // 随机位置和动画
        const x = Math.random() * window.innerWidth;
        const size = 4 + Math.random() * 8;
        const duration = 10 + Math.random() * 10;
        const delay = Math.random() * 2;
        
        snowflake.style.left = `${x}px`;
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.animationDuration = `${duration}s`;
        snowflake.style.animationDelay = `${delay}s`;
        // 设置雪花为完全不透明
        snowflake.style.opacity = 1.0;
        
        try {
            effectContainer.appendChild(snowflake);
            weatherElements.push(snowflake);
        } catch (error) {
            console.error('添加雪花失败:', error);
            return;
        }
        
        // 使用setTimeout模拟雪花动画结束事件
        setTimeout(() => {
            // 检查容器是否存在
            if (effectContainer && effectContainer.contains(snowflake)) {
                try {
                    effectContainer.removeChild(snowflake);
                    const index = weatherElements.indexOf(snowflake);
                    if (index > -1) {
                        weatherElements.splice(index, 1);
                    }
                } catch (error) {
                    console.error('移除雪花失败:', error);
                }
            }
            // 重新创建雪花
            if (currentWeather) {
                createSnowflake();
            }
        }, (duration + delay) * 1000);
    };
    
    // 持续创建雪花的定时器
    const interval = setInterval(createSnowflake, 100);
    intervals.push(interval);
    
    console.log(`[${new Date().toISOString()}] 雪花创建定时器启动: 每100ms创建一个雪花，持续运行`);
}

export default createSnowEffect;