/**
 * 电影功能服务模块
 */

export class MovieService {
    constructor() {
        // 电影功能配置
        this.config = {
            moviePrefix: '@电影 ',
            playerUrl: 'https://jx.m3u8.tv/jiexi/?url='
        };
    }

    /**
     * 检查消息是否为电影链接
     * @param {string} content - 消息内容
     * @returns {boolean} - 是否为电影链接
     */
    isMovieMessage(content) {
        return content.startsWith(this.config.moviePrefix);
    }

    /**
     * 解析电影链接
     * @param {string} content - 消息内容
     * @returns {string} - 电影URL
     */
    parseMovieUrl(content) {
        return content.substring(this.config.moviePrefix.length).trim();
    }

    /**
     * 渲染电影播放器
     * @param {Object} data - 消息数据
     * @param {HTMLElement} container - 容器元素
     */
    renderMoviePlayer(data, container) {
        const parseUrl = `${this.config.playerUrl}${encodeURIComponent(data.content)}`;
        const contentHtml = `
            <div class="message-card" style="width: 420px; max-width: 100%;">
                <div style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 5px;">
                    <span>🎬</span> 电影分享
                </div>
                <div style="position: relative; width: 100%; padding-top: 100%;">
                    <iframe 
                        src="${parseUrl}" 
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
                        allowfullscreen
                        allow="autoplay; encrypted-media"
                    ></iframe>
                </div>
                <div style="padding: 8px; font-size: 0.8rem; color: #666; word-break: break-all;">
                    源地址: ${data.content}
                </div>
            </div>
        `;
        
        container.innerHTML = contentHtml;
    }
}