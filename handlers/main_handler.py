from handlers.base_handler import BaseHandler


class MainHandler(BaseHandler):
    """主页面处理器，重定向到登录页面"""
    def get(self):
        # 默认重定向到登录页面
        self.redirect("/login")
