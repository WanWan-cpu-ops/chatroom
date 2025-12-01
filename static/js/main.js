document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const loginScreen = document.getElementById('login-screen');
    const registerScreen = document.getElementById('register-screen');
    const chatScreen = document.getElementById('chat-screen');
    const serverSelect = document.getElementById('server-select');
    const refreshServerBtn = document.getElementById('refresh-server-btn');
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const loginError = document.getElementById('login-error');
    
    const registerBtn = document.getElementById('register-btn');
    const regUsernameInput = document.getElementById('register-username-input');
    const regPasswordInput = document.getElementById('register-password-input');
    const regConfirmPasswordInput = document.getElementById('register-confirm-password-input');
    const registerError = document.getElementById('register-error');
    
    const toRegisterBtn = document.getElementById('switch-to-register');
    const toLoginBtn = document.getElementById('switch-to-login');
    
    const onlineUsersList = document.getElementById('online-users');
    const userCount = document.getElementById('user-count');
    const logoutBtn = document.getElementById('logout-btn');
    
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPicker = document.getElementById('emoji-picker');
    
    let ws = null;
    let currentUser = '';

    // 1. Load Config
    function loadServerConfig() {
        // Add loading animation or visual feedback if needed
        refreshServerBtn.classList.add('rotating'); // Assuming we might add a rotation class later
        serverSelect.innerHTML = '<option value="" disabled selected>加载中...</option>';
        serverSelect.disabled = true;

        fetch('/api/config')
            .then(response => response.json())
            .then(data => {
                serverSelect.innerHTML = '';
                if (data.servers && data.servers.length > 0) {
                    data.servers.forEach(server => {
                        const option = document.createElement('option');
                        option.value = server.address; // Use 'address' from JSON
                        option.textContent = server.name;
                        serverSelect.appendChild(option);
                    });

                    // Auto Login Check
                    const session = localStorage.getItem('chat_session');
                    if (session) {
                        try {
                            const { username, serverUrl } = JSON.parse(session);
                            if (username && serverUrl) {
                                usernameInput.value = username;
                                // Server selection is now hardcoded to localhost:8888
                                // We can keep this for future use if we support multiple servers again
                            }
                        } catch (e) {
                            localStorage.removeItem('chat_session');
                        }
                    }

                } else {
                    const option = document.createElement('option');
                    option.text = "无法加载服务器列表";
                    serverSelect.appendChild(option);
                }
            })
            .catch(err => {
                console.error('Error loading config:', err);
                serverSelect.innerHTML = '<option>加载失败</option>';
            })
            .finally(() => {
                serverSelect.disabled = false;
                refreshServerBtn.classList.remove('rotating');
                
                // Try to restore session if we are on the login screen
                const session = localStorage.getItem('chat_session');
                if (session && !ws) {
                     try {
                        const { username, serverUrl } = JSON.parse(session);
                        if (username) {
                            usernameInput.value = username;
                        }
                    } catch (e) {
                        localStorage.removeItem('chat_session');
                    }
                }
            });
    }

    // Initial Load
    loadServerConfig();

    // Switch between login and register screens
    toRegisterBtn.addEventListener('click', () => {
        loginScreen.classList.remove('active');
        registerScreen.classList.add('active');
        loginError.textContent = '';
    });
    
    toLoginBtn.addEventListener('click', () => {
        registerScreen.classList.remove('active');
        loginScreen.classList.add('active');
        registerError.textContent = '';
    });
    
    // Refresh Button Event
    refreshServerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loadServerConfig();
    });

    // 2. Login Logic
    loginBtn.addEventListener('click', performLogin);
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performLogin();
    });
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performLogin();
    });
    
    // Register Logic
    registerBtn.addEventListener('click', performRegister);
    regUsernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performRegister();
    });
    regPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performRegister();
    });
    regConfirmPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performRegister();
    });
    
    function performRegister() {
        const username = regUsernameInput.value.trim();
        const password = regPasswordInput.value;
        const confirmPassword = regConfirmPasswordInput.value;
        
        if (!username) {
            registerError.textContent = '请输入用户名';
            return;
        }
        if (!password) {
            registerError.textContent = '请输入密码';
            return;
        }
        if (password !== confirmPassword) {
            registerError.textContent = '两次输入的密码不一致';
            return;
        }
        
        registerError.textContent = '正在注册...';
        
        // Send register request
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                registerError.textContent = '注册成功，即将跳转登录页面...';
                setTimeout(() => {
                    registerScreen.classList.remove('active');
                    loginScreen.classList.add('active');
                    registerError.textContent = '';
                    usernameInput.value = username;
                    passwordInput.value = '';
                    regUsernameInput.value = '';
                    regPasswordInput.value = '';
                    regConfirmPasswordInput.value = '';
                }, 1500);
            } else {
                registerError.textContent = data.message;
            }
        })
        .catch(error => {
            registerError.textContent = '注册失败，请稍后重试';
            console.error('Register error:', error);
        });
    }

    function performLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username) {
            loginError.textContent = '请输入用户名';
            return;
        }
        if (!password) {
            loginError.textContent = '请输入密码';
            return;
        }

        loginError.textContent = '正在登录...';
        
        // Send login request
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Login successful, now connect to WebSocket
                const serverUrl = 'ws://localhost:8888/ws';
                const url = new URL(serverUrl);
                url.searchParams.append('nickname', username);
                
                ws = new WebSocket(url.toString());

                ws.onopen = () => {
                    currentUser = username;
                    // Save session
                    localStorage.setItem('chat_session', JSON.stringify({
                        username: username,
                        serverUrl: serverUrl
                    }));
                    loginError.textContent = '';
                    enterChat();
                };

                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    handleMessage(data);
                };

                ws.onclose = (event) => {
                    if (!event.wasClean) {
                        showError('连接已断开，正在尝试重连...');
                    }
                    // TODO: Implement reconnection logic
                };

                ws.onerror = (error) => {
                    showError('连接错误: ' + error.message);
                };
            }
        })
        .catch(error => {
            loginError.textContent = '登录失败: ' + error.message;
            console.error('Login error:', error);
        });
    }

    function showError(msg) {
        loginError.textContent = msg;
    }

    function enterChat() {
        loginScreen.classList.remove('active');
        chatScreen.classList.add('active');
        
        // Focus input
        messageInput.focus();
    }

    function exitChat() {
        if (ws) {
            ws.close();
            ws = null;
        }
        chatScreen.classList.remove('active');
        loginScreen.classList.add('active');
        chatMessages.innerHTML = ''; // Clear history
        onlineUsersList.innerHTML = '';
        currentUser = '';
    }

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('chat_session');
        exitChat();
    });

    // 3. Chat Logic
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    function sendMessage() {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        
        const content = messageInput.value.trim();
        if (!content) return;

        const message = {
            type: 'chat',
            content: content,
            sender: currentUser,
            timestamp: new Date().toISOString()
        };

        ws.send(JSON.stringify(message));
        messageInput.value = '';
        
        // Hide emoji picker if open
        emojiPicker.classList.add('hidden');
    }

    function handleMessage(data) {
        // Scroll to bottom logic
        const shouldScroll = chatMessages.scrollTop + chatMessages.clientHeight === chatMessages.scrollHeight;

        if (data.type === 'system') {
            renderSystemMessage(data);
            if (data.online_users) {
                updateOnlineUsers(data.online_users);
            }
        } else if (data.type === 'ai_stream_update') {
            // Handle streaming AI response
            const contentDiv = document.getElementById(`ai-content-${data.id}`);
            if (contentDiv) {
                // Check if it's the first chunk (still has "AI thinking" text)
                if (contentDiv.dataset.streaming === "false") {
                    contentDiv.textContent = ""; // Clear "Thinking..."
                    contentDiv.dataset.streaming = "true";
                    contentDiv.style.color = "#2d3436"; // Reset color to normal text
                    contentDiv.style.borderTop = "none";
                    contentDiv.style.paddingTop = "0";
                }
                // Append chunk
                // Simple text append. For markdown, we'd need a parser.
                // We'll preserve whitespace by using textContent + style="white-space: pre-wrap" in CSS or inline
                contentDiv.textContent += data.content;
                
                // Auto scroll if near bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        } else {
            renderUserMessage(data);
        }

        // Auto scroll
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function renderSystemMessage(data) {
        const div = document.createElement('div');
        div.className = 'message system';
        div.innerHTML = `<div class="content">${escapeHtml(data.content)}</div>`;
        chatMessages.appendChild(div);
    }

    function renderUserMessage(data) {
        const isSelf = data.sender === currentUser;
        const isSpecial = data.type === 'ai_chat' || data.sender === '系统' || data.sender === '川小农';
        const div = document.createElement('div');
        div.className = `message ${isSpecial ? 'special' : ''} ${isSelf ? 'self' : 'other'}`;
        
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const avatarText = data.sender.substring(0, 1).toUpperCase();
        
        let contentHtml = '';
        
        if (data.type === 'movie') {
            // Video Player with Iframe
            const parseUrl = "https://jx.playerjy.com/?url=" + data.content;
            contentHtml = `
                <div class="message-card" style="width: 400px; max-width: 100%;">
                    <div style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 5px;">
                        <span>🎬</span> 电影分享
                    </div>
                    <div style="position: relative; width: 100%; height: 400px;">
                        <iframe 
                            src="${escapeHtml(parseUrl)}" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
                            allowfullscreen
                            allow="autoplay; encrypted-media"
                        ></iframe>
                    </div>
                    <div style="padding: 8px; font-size: 0.8rem; color: ${isSpecial ? '#ffffff' : '#666666'}; word-break: break-all;">
                        源地址: ${escapeHtml(data.content)}
                    </div>
                </div>
            `;
        } else if (data.type === 'music') {
            // Music query result
            contentHtml = `
                <div class="message-card" style="width: 400px; max-width: 100%;">
                    <div style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 5px;">
                        <span>🎵</span> 音乐查询
                    </div>
                    <div style="padding: 15px; font-size: 0.95rem; line-height: 1.6;">
                        <p>关键词: ${escapeHtml(data.keyword || data.content)}</p>
                    </div>
                </div>
            `;
        } else if (data.type === 'weather') {
            // Weather query result
            contentHtml = `
                <div class="message-card" style="width: 400px; max-width: 100%;">
                    <div style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 5px;">
                        <span>🌤️</span> 天气查询
                    </div>
                    <div style="padding: 15px; font-size: 0.95rem; line-height: 1.6;">
                        <p>地点: ${escapeHtml(data.location || data.content)}</p>
                    </div>
                </div>
            `;
        } else if (data.type === 'ai_chat') {
            // AI Message Style - Initial State
            // data.content here is the original user query, or empty
            // data.id is the unique ID for this session
            contentHtml = `
                <div class="content">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <div class="avatar-small" style="background: #00cec9;">AI</div>
                        <span style="color: #00cec9; font-weight: bold;">川小农</span>
                    </div>
                    <div id="ai-content-${data.id}" data-streaming="false" style="font-size: 0.95rem; line-height: 1.6; color: #666; white-space: pre-wrap;">
                        🤖 AI 正在思考中...
                    </div>
                </div>
            `;
        } else {
            // Text message with @mention support
            let processedContent = escapeHtml(data.content);
            // Replace @mentions with styled spans
            processedContent = processedContent.replace(/@([\w\u4e00-\u9fa5]+)/g, '<span class="mention">@$1</span>');
            contentHtml = `<div class="content">${processedContent}</div>`;
        }

        div.innerHTML = `
            <div class="avatar">${avatarText}</div>
            <div class="message-content">
                <div class="sender-info">
                    <span class="sender">${escapeHtml(data.sender)}</span>
                    <span class="timestamp">${time}</span>
                </div>
                ${contentHtml}
            </div>
        `;
        
        chatMessages.appendChild(div);
    }

    function updateOnlineUsers(users) {
        userCount.textContent = users.length;
        onlineUsersList.innerHTML = '';
        
        users.forEach(user => {
            const div = document.createElement('div');
            div.className = 'user-list-item';
            div.innerHTML = `
                <div class="avatar-small">${user.substring(0,1).toUpperCase()}</div>
                <span>${escapeHtml(user)}</span>
            `;
            onlineUsersList.appendChild(div);
        });
    }

    // Utility
    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Emoji Picker
    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.classList.toggle('hidden');
    });
    
    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
            emojiPicker.classList.add('hidden');
        }
    });

    // Delegate emoji clicks
    emojiPicker.addEventListener('click', (e) => {
        const emojiSpan = e.target.closest('span');
        if (emojiSpan) {
            messageInput.value += emojiSpan.textContent;
            messageInput.focus();
        }
    });

    // Global command helper
    window.insertCommand = function(cmd) {
        messageInput.value = cmd;
        messageInput.focus();
    };
});
