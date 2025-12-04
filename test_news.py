import websocket
import json
import time

# WebSocket服务器地址
ws_url = "ws://localhost:8888/ws?nickname=test_user"

# 建立WebSocket连接
ws = websocket.WebSocket()
ws.connect(ws_url)

print("已连接到WebSocket服务器")

# 发送新闻请求消息
news_message = {
    "type": "text",
    "content": "@新闻",
    "timestamp": int(time.time())
}

ws.send(json.dumps(news_message))
print("已发送新闻请求")

# 接收并打印响应
print("等待响应...")
time.sleep(1)  # 等待1秒

while True:
    try:
        response = ws.recv()
        if not response:
            break
        print("收到响应:")
        print(json.dumps(json.loads(response), indent=2, ensure_ascii=False))
    except websocket.WebSocketTimeoutException:
        break
    except websocket.WebSocketConnectionClosedException:
        break
    except Exception as e:
        print(f"接收消息时出错: {e}")
        break

# 关闭连接
ws.close()
print("已关闭连接")