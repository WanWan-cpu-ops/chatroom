import json
import uuid
import tornado.ioloop
from services.ai_service import AIService
from services.movie_service import MovieService
from services.news_service import NewsService


class FeatureService:
    def __init__(self):
        # 初始化各功能服务实例
        self.movie_service = MovieService()
        self.news_service = NewsService()
        self.ai_prefix = '@川小农 '

    # =================== 电影功能调用接口 ===================
    def is_movie_message(self, content):
        """检查消息是否为电影链接"""
        return self.movie_service.is_movie_message(content)

    def process_movie_message(self, nickname, content, timestamp=None):
        """处理电影消息"""
        return self.movie_service.process_movie_message(nickname, content, timestamp)
    
    # =================== 新闻功能调用接口 ===================
    def is_news_request(self, content):
        """检查消息是否为新闻请求"""
        return self.news_service.is_news_message(content)
    
    def process_news_message(self, nickname, content, timestamp=None):
        """处理新闻消息"""
        return self.news_service.process_news_message(nickname, content, timestamp)

    # =================== AI 功能调用接口 ===================
    def is_ai_request(self, content):
        """检查消息是否为AI请求"""
        if content is None:
            return False
        return content.startswith(self.ai_prefix)

    def extract_ai_query(self, content):
        """提取AI查询内容"""
        if content is None:
            return "你好"
        return content.replace(self.ai_prefix, "").strip() or "你好"

    def prepare_ai_response(self, nickname, content, timestamp=None):
        """准备AI响应"""
        # 先广播用户的消息，让每个人都能看到问题
        user_msg = {
            "type": "text",
            "sender": nickname,
            "content": content,
            "timestamp": timestamp
        }

        # 准备AI回复
        user_query = self.extract_ai_query(content)
        
        # 为这个AI回复会话生成一个唯一ID
        response_id = str(uuid.uuid4())
        
        # 发送初始"AI正在思考"占位符
        init_response = {
            "type": "ai_chat",
            "sender": "川小农",
            "content": user_query,  # 如果需要，传递原始查询以显示上下文
            "id": response_id,
            "timestamp": timestamp
        }

        return user_msg, init_response, user_query, response_id

    def stream_ai_response(self, broadcast_func, response_id, user_query):
        """流式传输AI响应"""
        async def ai_stream_task():
            try:
                stream = await AIService.generate_response(user_query)

                async for chunk in stream:
                    if chunk.choices[0].delta.content is not None:
                        content = chunk.choices[0].delta.content
                        # 向所有客户端广播消息块
                        update_msg = {
                            "type": "ai_stream_update",
                            "id": response_id,
                            "content": content
                        }
                        broadcast_func(update_msg)

            except Exception as e:
                print(f"AI错误: {e}")
                # 向UI发送错误消息
                error_msg = {
                    "type": "ai_stream_update",
                    "id": response_id,
                    "content": "\n[系统错误: AI连接失败]"
                }
                broadcast_func(error_msg)

        # 生成异步任务来流式传输AI响应
        tornado.ioloop.IOLoop.current().spawn_callback(ai_stream_task)

    # =================== 通用消息处理 ===================
    def process_regular_message(self, nickname, content, timestamp=None):
        """处理普通消息"""
        return {
            "type": "text",
            "sender": nickname,
            "content": content,
            "timestamp": timestamp
        }
