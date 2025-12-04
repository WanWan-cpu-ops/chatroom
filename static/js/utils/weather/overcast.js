// 阴天特效
import createClouds from './clouds.js';

function createOvercastEffect(maxClouds, effectContainer, weatherElements, currentWeather, weatherInstance) {
    createClouds(maxClouds, 'overcast-cloud', effectContainer, weatherElements, currentWeather, weatherInstance);
}

export default createOvercastEffect;