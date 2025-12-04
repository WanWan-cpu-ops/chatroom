// 晴天特效
function createSunnyEffect(effectContainer, weatherElements) {
    // 创建太阳
    const sun = document.createElement('div');
    sun.className = 'sun';
    
    try {
        effectContainer.appendChild(sun);
        weatherElements.push(sun);
    } catch (error) {
        console.error('添加太阳失败:', error);
        return;
    }
    
    // 创建太阳光线（重新设计的光芒效果）
    const rayCount = 12;
    const angleStep = 360 / rayCount;
    
    for (let i = 0; i < rayCount; i++) {
        const ray = document.createElement('div');
        ray.className = 'sun-ray';
        ray.style.left = '50%';
        ray.style.top = '-10px';
        const angle = i * angleStep;
        ray.style.setProperty('--ray-angle', `${angle}deg`);
        ray.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        
        // 为光线添加交错动画
        const delay = (i * 0.15) % 2;
        const opacity = 0.6 + (Math.sin(i) * 0.3);
        
        ray.style.animation = `sunRayPulse 6s ease-in-out ${delay}s infinite`;
        ray.style.opacity = opacity;
        
        try {
            sun.appendChild(ray);
        } catch (error) {
            console.error('添加太阳光线失败:', error);
        }
    }
    
    // 添加太阳旋转动画，增强光芒动态效果
    const rotateContainer = document.createElement('div');
    rotateContainer.style.position = 'absolute';
    rotateContainer.style.width = '100%';
    rotateContainer.style.height = '100%';
    rotateContainer.style.animation = 'sunRotate 60s linear infinite';
    sun.appendChild(rotateContainer);
}

export default createSunnyEffect;