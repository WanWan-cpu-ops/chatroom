// 获取URL参数
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

const username = getUrlParameter('username');
const server = getUrlParameter('server');
let socket;

// 初始化WebSocket连接
function initSocket() {
    // 从当前URL构建WebSocket URL
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.host;
    socket = io(wsProtocol + '//' + wsHost);
    
    socket.on('connect', function() {
        console.log('Connected to server');
        // 发送加入事件
        socket.emit('join', { username: username });
    });
    
    socket.on('disconnect', function() {
        console.log('Disconnected from server');
        updateRoomStatus(false);
    });
    
    // 处理加入成功
    socket.on('join_success', function(data) {
        console.log('Join successful:', data);
    });
    
    // 处理昵称已存在
    socket.on('nickname_exists', function(data) {
        alert(data.message);
        window.location.href = '/login';
    });
    
    // 处理用户加入
    socket.on('user_joined', function(data) {
        addSystemMessage(`${data.username} 加入了聊天室`);
    });
    
    // 处理用户离开
    socket.on('user_left', function(data) {
        addSystemMessage(`${data.username} 离开了聊天室`);
    });
    
    // 更新在线用户列表
    socket.on('update_users', function(users) {
        updateUsersList(users);
        // 更新用户数量
        document.querySelector('.online-users h4').textContent = `在线用户 (${users.length})`;
    });
    
    // 接收消息
    socket.on('receive_message', function(data) {
        addMessage(data);
    });
}

// 添加系统消息
function addSystemMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const msgElement = document.createElement('div');
    msgElement.className = 'system-message';
    msgElement.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(msgElement);
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 添加用户消息
function addMessage(data) {
    const chatMessages = document.getElementById('chat-messages');
    const isOwn = data.username === username;
    
    const msgElement = document.createElement('div');
    msgElement.className = `message ${isOwn ? 'own' : ''} ${data.type}`;
    
    const avatar = data.username.charAt(0).toUpperCase();
    
    let messageHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-username">${data.username}</span>
                <span class="message-timestamp">${data.timestamp}</span>
            </div>
            <div class="message-text">${escapeHtml(data.message)}</div>
    `;
    
    // 如果是电影类型，添加简单的视频播放器
    if (data.type === 'movie' && data.url) {
        messageHTML += `
            <div class="movie-preview">
                <a href="${escapeHtml(data.url)}" target="_blank">点击观看电影</a>
            </div>
        `;
    }
    
    messageHTML += `</div>`;
    msgElement.innerHTML = messageHTML;
    
    chatMessages.appendChild(msgElement);
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 如果消息包含@当前用户，高亮显示
    if (!isOwn && data.message.includes('@' + username)) {
        msgElement.classList.add('highlight');
        // 可以添加声音提示或其他提醒方式
    }
}

// 更新用户列表
function updateUsersList(users) {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';
    
    users.forEach(user => {
        const li = document.createElement('li');
        const avatar = user.charAt(0).toUpperCase();
        
        li.innerHTML = `
            <div class="user-avatar">${avatar}</div>
            <span>${escapeHtml(user)}</span>
        `;
        
        // 如果是当前用户，添加标识
        if (user === username) {
            li.innerHTML += '<span class="current-user"> (我)</span>';
            li.classList.add('current');
        }
        
        // 点击用户可以@该用户
        li.addEventListener('click', function() {
            const messageInput = document.getElementById('message-input');
            messageInput.value = '@' + user + ' ' + messageInput.value;
            messageInput.focus();
        });
        
        usersList.appendChild(li);
    });
}

// 更新房间状态
function updateRoomStatus(online) {
    const roomStatus = document.getElementById('room-status');
    const dot = roomStatus.querySelector('.dot');
    
    if (online) {
        roomStatus.textContent = '房间在线';
        roomStatus.prepend(dot);
        dot.className = 'dot online';
    } else {
        roomStatus.textContent = '房间离线';
        roomStatus.prepend(dot);
        dot.className = 'dot offline';
    }
}

// HTML转义，防止XSS攻击
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 发送消息
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (message) {
        socket.emit('send_message', { message: message });
        messageInput.value = '';
    }
}

// 初始化Emoji选择器
function initEmojiPicker() {
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPicker = document.getElementById('emoji-picker');
    const messageInput = document.getElementById('message-input');
    
    emojiBtn.addEventListener('click', function() {
        emojiPicker.classList.toggle('show');
    });
    
    // 点击emoji添加到输入框 - 修改后的处理逻辑
    const emojiGrid = emojiPicker.querySelector('.emoji-grid');
    emojiGrid.addEventListener('click', function(e) {
        // 获取点击位置的单个emoji字符
        const textNode = emojiGrid.firstChild;
        if (textNode && textNode.nodeType === 3) {
            // 创建一个临时的span来辅助计算字符位置
            const tempSpan = document.createElement('span');
            tempSpan.style.position = 'absolute';
            tempSpan.style.visibility = 'hidden';
            tempSpan.style.font = window.getComputedStyle(emojiGrid).font;
            tempSpan.style.fontSize = window.getComputedStyle(emojiGrid).fontSize;
            tempSpan.style.letterSpacing = '0.2em'; // 假设emoji之间有间距
            document.body.appendChild(tempSpan);
            
            // 获取所有emoji字符
            const emojiText = textNode.textContent;
            const emojiChars = emojiText.match(/[\u{1F000}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || [];
            
            // 获取emojiGrid的位置
            const rect = emojiGrid.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            
            // 计算点击的是哪个emoji（假设每个emoji宽度大致相等）
            const emojiSize = rect.width / Math.ceil(emojiChars.length / 9); // 基于9列布局
            const emojiIndex = Math.floor(clickX / emojiSize);
            
            // 确保索引在有效范围内
            if (emojiIndex >= 0 && emojiIndex < emojiChars.length) {
                const emoji = emojiChars[emojiIndex];
                
                if (emoji) {
                    // 获取当前光标位置
                    const startPos = messageInput.selectionStart;
                    const endPos = messageInput.selectionEnd;
                    const currentValue = messageInput.value;
                    
                    // 在光标位置插入emoji
                    messageInput.value = currentValue.substring(0, startPos) + emoji + currentValue.substring(endPos);
                    
                    // 移动光标到emoji后面
                    const newPos = startPos + emoji.length;
                    messageInput.setSelectionRange(newPos, newPos);
                    
                    messageInput.focus();
                    emojiPicker.classList.remove('show');
                }
            }
            
            // 清理临时元素
            document.body.removeChild(tempSpan);
        }
    });
    
    // 点击其他区域关闭emoji选择器
    document.addEventListener('click', function(e) {
        if (!emojiBtn.contains(e.target) && !emojiPicker.contains(e.target)) {
            emojiPicker.classList.remove('show');
        }
    });
}

// 初始化帮助模态框
function initHelpModal() {
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeHelp = document.getElementById('close-help');
    
    helpBtn.addEventListener('click', function() {
        helpModal.classList.add('show');
    });
    
    closeHelp.addEventListener('click', function() {
        helpModal.classList.remove('show');
    });
    
    // 点击模态框外部关闭
    helpModal.addEventListener('click', function(e) {
        if (e.target === helpModal) {
            helpModal.classList.remove('show');
        }
    });
}

// 初始化事件监听
function initEventListeners() {
    // 发送按钮点击事件
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    
    // 回车键发送消息
    document.getElementById('message-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // 退出登录按钮
    document.getElementById('logout-btn').addEventListener('click', function() {
        if (socket) {
            socket.disconnect();
        }
        window.location.href = '/login';
    });
    
    // 侧边栏导航切换
    const navItems = document.querySelectorAll('.sidebar-nav li');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // 可以添加切换不同视图的逻辑
        });
    });
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', function() {
    if (!username) {
        window.location.href = '/login';
        return;
    }
    
    // 初始化WebSocket
    initSocket();
    
    // 初始化功能
    initEmojiPicker();
    initHelpModal();
    initEventListeners();
    
    // 设置当前用户信息
    const userAvatar = document.querySelector('.user-info .avatar span');
    const userName = document.querySelector('.user-info h3');
    
    userAvatar.textContent = username.charAt(0).toUpperCase();
    userName.textContent = username;
    
    // 显示欢迎消息
    addSystemMessage(`欢迎 ${username} 加入聊天室！`);
    
    // 聚焦消息输入框
    document.getElementById('message-input').focus();
});

// 页面卸载前断开连接
window.addEventListener('beforeunload', function() {
    if (socket) {
        socket.disconnect();
    }
});