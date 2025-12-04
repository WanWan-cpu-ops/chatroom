from handlers.base_handler import BaseHandler
from utils.config_utils import load_config, add_local_server_to_config


class ConfigHandler(BaseHandler):
    """配置处理器"""
    def get(self):
        # 加载配置并返回
        try:
            config = load_config()
            
            # 动态添加局域网IP
            config = add_local_server_to_config(config)

            self.write(config)
        except Exception as e:
            self.write({"servers": []})
