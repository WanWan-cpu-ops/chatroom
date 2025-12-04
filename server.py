import tornado.web
from config import *
from handlers.base_handler import NoCacheStaticFileHandler
from handlers.main_handler import MainHandler
from handlers.config_handler import ConfigHandler
from handlers.websocket.chat_websocket import ChatWebSocket
from handlers.page_handlers import LoginHandler, ChatHandler, RegisterHandler, UsernameCheckHandler
from handlers.city_handler import CityHandler

def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),  # 默认重定向到登录页面
        (r"/login", LoginHandler),  # 登录页面
        (r"/chat", ChatHandler),  # 聊天页面
        (r"/api/config", ConfigHandler),
        (r"/api/check-nickname", UsernameCheckHandler),  # 用户名检查API
        (r"/api/register", RegisterHandler),  # 注册API
        (r"/api/login", LoginHandler),  # 登录API
        (r"/api/city", CityHandler),  # 城市查询API
        (r"/ws", ChatWebSocket),
        (r"/static/(.*)", NoCacheStaticFileHandler, {"path": STATIC_PATH}),
    ],
    template_path=TEMPLATES_PATH,
    cookie_secret=COOKIE_SECRET,
    debug=DEBUG)

if __name__ == "__main__":
    app = make_app()
    print(f"服务器已启动在 http://localhost:{SERVER_PORT}")
    app.listen(SERVER_PORT, SERVER_HOST)
    tornado.ioloop.IOLoop.current().start()