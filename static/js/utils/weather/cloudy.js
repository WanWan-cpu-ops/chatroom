// 多云特效
import createClouds from './clouds.js';

function createCloudyEffect(maxClouds, effectContainer, weatherElements, currentWeather, weatherInstance) {
    // 使用createClouds函数创建多个小白云
    createClouds(maxClouds, 'cloud', effectContainer, weatherElements, currentWeather, weatherInstance);
}

export default createCloudyEffect;