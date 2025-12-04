import os
import socket
import uuid
from openai import AsyncOpenAI

# 服务器配置
SERVER_PORT = 8888
SERVER_HOST = "0.0.0.0"

# 安全配置
COOKIE_SECRET = "__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__"
DEBUG = True

# 模板和静态文件路径
TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), "templates")
STATIC_PATH = os.path.join(os.path.dirname(__file__), "static")

# AI配置
AI_API_KEY = "sk-orxlsmelhexcosqumhchsiabeasxhwkmvcfzqqjakwhqoaqv"
AI_BASE_URL = "https://api.siliconflow.cn/v1"
AI_MODEL = "Qwen/Qwen2.5-7B-Instruct"

# 初始化AsyncOpenAI客户端
ai_client = AsyncOpenAI(
    api_key=AI_API_KEY,
    base_url=AI_BASE_URL
)
