// 云朵通用创建方法
function createClouds(maxClouds, cloudClass, effectContainer, weatherElements, currentWeather, weatherInstance) {
    // 创建云朵的内部函数
    const createCloud = () => {
        // 检查必要条件
        if (!effectContainer || !currentWeather) return;
        if (weatherElements.length >= maxClouds) return;
        if (!(currentWeather === 'cloudy' || currentWeather === 'overcast')) return;
        
        const cloud = document.createElement('div');
        cloud.className = cloudClass;
        
        // 随机位置和大小 - 云朵主要分布在屏幕上侧（0-30vh）
        const size = 80 + Math.random() * 80;
        const top = Math.random() * 30;
        const duration = 30 + Math.random() * 30;
        const delay = Math.random() * 10;
        
        cloud.style.width = `${size}px`;
        cloud.style.height = `${size * 0.4}px`;
        cloud.style.top = `${top}vh`;
        cloud.style.animationDuration = `${duration}s`;
        cloud.style.animationDelay = `${delay}s`;
        
        try {
            effectContainer.appendChild(cloud);
            weatherElements.push(cloud);
        } catch (error) {
            console.error('添加云朵失败:', error);
            return;
        }
        
        // 云朵动画结束后移除并重新创建
        cloud.addEventListener('animationend', () => {
            if (effectContainer && effectContainer.contains(cloud)) {
                effectContainer.removeChild(cloud);
                const index = weatherElements.indexOf(cloud);
                if (index > -1) {
                    weatherElements.splice(index, 1);
                }
            }
            // 使用setTimeout确保函数调用在正确的上下文中
            if (currentWeather) {
                setTimeout(() => createCloud.call(weatherInstance), 0);
            }
        });
    };
    
    // 确保createCloud使用正确的this上下文
    const boundCreateCloud = createCloud.bind(weatherInstance);
    
    // 逐渐创建云朵
    for (let i = 0; i < maxClouds; i++) {
        setTimeout(boundCreateCloud, i * 2000);
    }
}

export default createClouds;