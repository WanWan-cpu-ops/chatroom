class MovieService:
    def __init__(self):
        self.movie_prefix = '@电影 '

    def is_movie_message(self, content):
        """检查消息是否为电影链接"""
        return content.startswith(self.movie_prefix)

    def process_movie_message(self, nickname, content, timestamp=None):
        """处理电影消息"""
        url = content.split(" ", 1)[1] if " " in content else ""
        return {
            "type": "movie",
            "sender": nickname,
            "content": url,
            "raw_content": content,
            "timestamp": timestamp
        }