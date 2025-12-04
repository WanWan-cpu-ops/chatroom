import uuid
from datetime import datetime


class NewsService:
    def __init__(self):
        self.news_prefix = '@新闻'
        # 新闻图片的URL模板
        self.news_image_url_template = "https://blog.intelexe.cn/images/60秒_{YYYYMMDD}_帆船网络.png"
        # 本地备份的新闻图片URL
        self.local_backup_image = '/static/images/news.jpg'
    
    def is_news_message(self, content):
        """检查消息是否为新闻请求"""
        if content is None:
            return False
        return content.strip() == self.news_prefix
    
    def process_news_message(self, nickname, content, timestamp=None):
        """处理新闻消息，返回文本新闻"""
        # 模拟新闻文本内容
        news_text = "【今日要闻】\n1. 科技行业迎来重大突破，人工智能技术取得新进展\n2. 全球经济形势稳步回升，市场信心增强\n3. 环保政策持续推进，绿色发展成为共识\n4. 体育赛事精彩纷呈，各项记录被不断刷新"
        
        return {
            "type": "text",
            "content": news_text,
            "sender": "新闻服务",
            "timestamp": timestamp
        }
