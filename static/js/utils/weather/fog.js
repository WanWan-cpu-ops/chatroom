// 雾天特效
function createFogEffect(maxFogLayers, effectContainer, weatherElements) {
    for (let i = 0; i < maxFogLayers; i++) {
        const fog = document.createElement('div');
        fog.className = 'fog';
        
        // 分层雾效果
        fog.style.top = `${i * 20}%`;
        fog.style.height = '30%';
        fog.style.opacity = 0.1 + Math.random() * 0.2;
        fog.style.animationDelay = `${i * 4}s`;
        fog.style.animationDuration = `20s`;
        
        effectContainer.appendChild(fog);
        weatherElements.push(fog);
    }
}

export default createFogEffect;