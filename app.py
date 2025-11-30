from flask import Flask, render_template, request, redirect, url_for
from flask_socketio import SocketIO, emit, join_room, leave_room
import json
import os
import random
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

# 在线用户字典 {socket_id: username}
online_users = {}
# 昵称到socket_id的映射，用于检测昵称唯一性和@功能
nickname_to_socket = {}
# 从配置文件加载服务器地址
with open('config.json', 'r', encoding='utf-8') as f:
    config = json.load(f)
    SERVERS = config.get('servers', ["http://localhost:5000"])

# 加载AI回复数据
try:
    with open('ai_responses.json', 'r', encoding='utf-8') as f:
        ai_responses = json.load(f)
except Exception as e:
    print(f"加载AI回复数据失败: {e}")
    ai_responses = {"川小农": {"default": ["抱歉，我暂时无法回答问题。"]}}

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login')
def login():
    return render_template('login.html', servers=SERVERS)

@app.route('/chat')
def chat():
    username = request.args.get('username')
    server = request.args.get('server', SERVERS[0])
    if not username:
        return redirect(url_for('login'))
    return render_template('chat.html', username=username, server=server)

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    username = online_users.pop(request.sid, None)
    if username:
        nickname_to_socket.pop(username, None)
        # 通知所有用户有人离开
        emit('user_left', {
            'username': username,
            'message': f'{username} 离开了聊天室',
            'timestamp': datetime.now().strftime('%H:%M:%S')
        }, broadcast=True)
        # 更新在线用户列表
        emit('update_users', list(online_users.values()), broadcast=True)
    print(f"Client disconnected: {request.sid}, username: {username}")

@socketio.on('join')
def handle_join(data):
    username = data['username']
    # 检查昵称是否已存在
    if username in nickname_to_socket:
        emit('nickname_exists', {'message': '该昵称已被使用，请选择其他昵称'})
        return
    
    online_users[request.sid] = username
    nickname_to_socket[username] = request.sid
    
    # 通知所有用户有人加入
    emit('user_joined', {
        'username': username,
        'message': f'{username} 加入了聊天室',
        'timestamp': datetime.now().strftime('%H:%M:%S')
    }, broadcast=True)
    
    # 发送在线用户列表
    emit('update_users', list(online_users.values()), broadcast=True)
    
    # 发送加入成功响应给当前用户
    emit('join_success', {'username': username})
    
    print(f"User joined: {username} (socket_id: {request.sid})")

@socketio.on('send_message')
def handle_message(data):
    username = online_users.get(request.sid)
    if not username:
        return
    
    message = data['message']
    # 检查是否包含@指令
    if message.startswith('@'):
        handle_at_command(username, message)
    else:
        # 处理普通消息
        emit('receive_message', {
            'username': username,
            'message': message,
            'timestamp': datetime.now().strftime('%H:%M:%S'),
            'type': 'normal'
        }, broadcast=True)

# 根据用户问题获取AI回复
def get_ai_response(user_message, username):
    message = user_message.lower()
    responses = ai_responses.get("川小农", {"default": ["抱歉，我暂时无法回答问题。"]})
    
    # 根据关键词匹配回复类型
    if any(word in message for word in ['你好', '嗨', '哈喽', 'hi', 'hello']):
        response_type = 'greeting'
    elif any(word in message for word in ['谁', '身份', '是']):
        response_type = 'identity'
    elif any(word in message for word in ['能', '可以', '功能', '做什么']):
        response_type = 'capability'
    elif any(word in message for word in ['名字', '叫什么']):
        response_type = 'name'
    elif any(word in message for word in ['谢谢', '感谢', 'thx']):
        response_type = 'thanks'
    elif any(word in message for word in ['再见', '拜拜', 'bye']):
        response_type = 'goodbye'
    else:
        response_type = 'default'
    
    # 随机选择一个回复
    available_responses = responses.get(response_type, responses.get('default', ["抱歉，我暂时无法回答问题。"]))
    selected_response = random.choice(available_responses)
    
    # 个性化回复，插入用户名
    if '{username}' in selected_response:
        selected_response = selected_response.format(username=username)
    
    return selected_response

# 处理@指令
def handle_at_command(username, message):
    parts = message.split(' ', 1)
    command = parts[0]
    
    # @电影 命令
    if command == '@电影' and len(parts) > 1:
        url = parts[1]
        # 使用解析地址包装电影URL
        parsed_url = f"https://jx.playerjy.com/?url={url}"
        emit('receive_message', {
            'username': username,
            'message': f'分享了电影链接: {url}',
            'timestamp': datetime.now().strftime('%H:%M:%S'),
            'type': 'movie',
            'url': url,
            'parsed_url': parsed_url
        }, broadcast=True)
    
    # @川小农 命令
    elif command == '@川小农':
        content = parts[1] if len(parts) > 1 else ''
        emit('receive_message', {
            'username': username,
            'message': f'@川小农 {content}',
            'timestamp': datetime.now().strftime('%H:%M:%S'),
            'type': 'ai'
        }, broadcast=True)
        
        # 获取智能回复
        ai_response = get_ai_response(content, username)
        emit('receive_message', {
            'username': '川小农',
            'message': ai_response,
            'timestamp': datetime.now().strftime('%H:%M:%S'),
            'type': 'ai_reply'
        }, broadcast=True)
    
    # @用户 命令
    elif command.startswith('@') and len(command) > 1:
        target_user = command[1:]
        if target_user in nickname_to_socket:
            content = parts[1] if len(parts) > 1 else ''
            emit('receive_message', {
                'username': username,
                'message': message,
                'timestamp': datetime.now().strftime('%H:%M:%S'),
                'type': 'mention',
                'target': target_user
            }, broadcast=True)
        else:
            emit('receive_message', {
                'username': username,
                'message': message,
                'timestamp': datetime.now().strftime('%H:%M:%S'),
                'type': 'normal'
            }, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)