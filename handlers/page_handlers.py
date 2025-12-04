import time
import json
from handlers.base_handler import BaseHandler
from services.db_service import db_service


class LoginHandler(BaseHandler):
    """登录页面处理器"""
    def get(self):
        # 使用当前时间戳作为版本号，确保每次请求都生成新的版本号
        version = str(int(time.time()))
        self.render("login.html", version=version)
    
    def post(self):
        """处理登录请求"""
        try:
            # 获取请求参数（支持JSON格式）
            if self.request.headers.get("Content-Type") == "application/json":
                data = json.loads(self.request.body)
                username = data.get("username", "").strip()
                password = data.get("password", "").strip()
            else:
                username = self.get_argument("username", "").strip()
                password = self.get_argument("password", "").strip()
            
            if not username or not password:
                self.write(json.dumps({"success": False, "message": "用户名和密码不能为空"}))
                return
            
            # 验证用户
            if db_service.login_user(username, password):
                # 登录成功，设置用户会话
                self.set_secure_cookie("username", username)
                self.write(json.dumps({"success": True, "message": "登录成功"}))
            else:
                self.write(json.dumps({"success": False, "message": "用户名或密码错误"}))
        except Exception as e:
            self.write(json.dumps({"success": False, "message": f"登录失败: {str(e)}"}))


class RegisterHandler(BaseHandler):
    """注册页面处理器"""
    def post(self):
        """处理注册请求"""
        try:
            # 获取请求参数（支持JSON格式）
            if self.request.headers.get("Content-Type") == "application/json":
                data = json.loads(self.request.body)
                username = data.get("username", "").strip()
                password = data.get("password", "").strip()
                confirm_password = data.get("confirm_password", "").strip()
            else:
                username = self.get_argument("username", "").strip()
                password = self.get_argument("password", "").strip()
                confirm_password = self.get_argument("confirm_password", "").strip()
            
            # 验证输入
            if not username or not password or not confirm_password:
                self.write(json.dumps({"success": False, "message": "请填写完整的注册信息"}))
                return
            
            if password != confirm_password:
                self.write(json.dumps({"success": False, "message": "两次输入的密码不一致"}))
                return
            
            if len(username) < 2 or len(username) > 15:
                self.write(json.dumps({"success": False, "message": "用户名长度必须在2-15个字符之间"}))
                return
            
            if len(password) < 6:
                self.write(json.dumps({"success": False, "message": "密码长度不能少于6个字符"}))
                return
            
            # 注册用户
            if db_service.register_user(username, password):
                self.write(json.dumps({"success": True, "message": "注册成功"}))
            else:
                self.write(json.dumps({"success": False, "message": "用户名已存在"}))
        except Exception as e:
            self.write(json.dumps({"success": False, "message": f"注册失败: {str(e)}"}))


class UsernameCheckHandler(BaseHandler):
    """检查用户名是否存在的API处理器"""
    def post(self):
        """处理用户名检查请求"""
        try:
            # 获取请求参数（支持JSON格式）
            if self.request.headers.get("Content-Type") == "application/json":
                data = json.loads(self.request.body)
                username = data.get("username", "").strip()
            else:
                username = self.get_argument("username", "").strip()
            if db_service.check_username_exists(username):
                self.write(json.dumps({"available": False, "message": "该用户名已被使用"}))
            else:
                self.write(json.dumps({"available": True, "message": "该用户名可用"}))
        except Exception as e:
            self.write(json.dumps({"available": False, "message": f"检查失败: {str(e)}"}))


class ChatHandler(BaseHandler):
    """聊天页面处理器"""
    def get(self):
        # 检查用户是否已登录
        username = self.get_secure_cookie("username")
        if not username:
            # 未登录，重定向到登录页面
            self.redirect("/login")
            return
        
        # 使用当前时间戳作为版本号，确保每次请求都生成新的版本号
        version = str(int(time.time()))
        self.render("chat.html", version=version, username=username.decode())