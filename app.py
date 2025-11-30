from flask import Flask, render_template, request, redirect, url_for
from flask_socketio import SocketIO, emit, join_room, leave_room
import json
import os
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

# 处理@指令
def handle_at_command(username, message):
    parts = message.split(' ', 1)
    command = parts[0]
    
    # @电影 命令
    if command == '@电影' and len(parts) > 1:
        url = parts[1]
        emit('receive_message', {
            'username': username,
            'message': f'分享了电影链接: {url}',
            'timestamp': datetime.now().strftime('%H:%M:%S'),
            'type': 'movie',
            'url': url
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
        # 简单的AI回复模拟
        ai_response = f'您好{username}，这是AI助手川小农的模拟回复。'
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