import json
import uuid
import tornado.websocket
import tornado.ioloop
from services.feature_service import FeatureService
from tornado.web import RequestHandler

# 存储已连接的用户: {昵称: WebSocketHandler}
clients = {}


class NicknameCheckHandler(RequestHandler):
    """昵称检查API处理器"""
    def get(self):
        nickname = self.get_argument("nickname", None)
        if not nickname:
            self.write({"available": False, "message": "请输入昵称"})
            return
        
        if nickname in clients:
            self.write({"available": False, "message": "该昵称已被使用"})
        else:
            self.write({"available": True, "message": "昵称可用"})
        self.set_header('Content-Type', 'application/json')


class ChatWebSocket(tornado.websocket.WebSocketHandler):
    """聊天WebSocket处理器"""
    def check_origin(self, origin):
        return True

    def open(self):
        """新连接打开时的处理"""
        self.nickname = self.get_argument("nickname", None)
        if not self.nickname:
            self.close(code=1008, reason="请输入昵称")
            return
        
        if self.nickname in clients:
            self.close(code=1008, reason="该昵称已被使用")
            return
        
        clients[self.nickname] = self
        print(f"用户已连接: {self.nickname}")
        
        # 广播加入消息
        self.broadcast({
            "type": "system",
            "content": f"{self.nickname} 加入了聊天室",
            "online_users": list(clients.keys())
        })

    def on_message(self, message):
        """处理接收到的消息"""
        try:
            data = json.loads(message)
            msg_type = data.get("type", "text")
            content = data.get("content", "")
            
            # 检查是否为天气卡片消息（已经处理过的）
            if msg_type == "chat" and content and "<div class='weather-card'>" in content:
                # 直接广播天气卡片消息，不需要再次处理
                self.broadcast(data)
                return
            
            # 初始化FeatureService
            feature_service = FeatureService()
            
            # 检查是否为电影功能
            if feature_service.is_movie_message(content):
                response = feature_service.process_movie_message(self.nickname, content, data.get("timestamp"))
                self.broadcast(response)
            elif feature_service.is_news_request(content):
                response = feature_service.process_news_message(self.nickname, content, data.get("timestamp"))
                self.broadcast(response)
            elif feature_service.is_ai_request(content):
                # 准备AI回复
                user_msg, init_response, user_query, response_id = feature_service.prepare_ai_response(self.nickname, content, data.get("timestamp"))
                self.broadcast(user_msg)
                self.broadcast(init_response)
                
                # 生成异步任务来流式传输AI响应
                feature_service.stream_ai_response(self.broadcast, response_id, user_query)
                return # 在这里返回以避免双重广播
            else:
                # 处理普通消息
                response = feature_service.process_regular_message(self.nickname, content, data.get("timestamp"))
                self.broadcast(response)
            
        except Exception as e:
            print(f"Error handling message: {e}")

    # 不再需要这个方法，因为功能已经移到feature_service中

    def on_close(self):
        """连接关闭时的处理"""
        # 只有当这个特定连接是注册的连接时，才从客户端列表中移除
        if hasattr(self, 'nickname') and self.nickname in clients:
            if clients[self.nickname] == self:
                del clients[self.nickname]
                print(f"用户已断开连接: {self.nickname}")
                self.broadcast({
                    "type": "system",
                    "content": f"{self.nickname} 离开了聊天室",
                    "online_users": list(clients.keys())
                })
            else:
                print(f"{self.nickname}的重复连接已关闭，保留原始连接。")

    def broadcast(self, message_dict):
        """向所有客户端广播消息"""
        for nickname, client in clients.items():
            try:
                client.write_message(json.dumps(message_dict))
            except:
                print(f"发送消息给 {nickname} 失败")
