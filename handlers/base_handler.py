import tornado.web
import time  # 新增：用于生成版本号

class BaseHandler(tornado.web.RequestHandler):
    """基础处理器类，提供通用功能"""
    def get_current_user(self):
        return self.get_secure_cookie("user")
    
    # 新增：通用版本号生成方法（消除页面处理器的代码冗余）
    def get_version_timestamp(self):
        """生成当前时间戳作为版本号（避免静态资源缓存）"""
        return str(int(time.time()))

class NoCacheStaticFileHandler(tornado.web.StaticFileHandler):
    """无缓存静态文件处理器"""
    def set_extra_headers(self, path):
        # 设置缓存控制头，告诉浏览器不要缓存静态文件
        self.set_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.set_header("Pragma", "no-cache")
        self.set_header("Expires", "0")