document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const loginScreen = document.getElementById('login-screen');
    const chatScreen = document.getElementById('chat-screen');
    const serverSelect = document.getElementById('server-select');
    const refreshServerBtn = document.getElementById('refresh-server-btn');
    
    // Login Form Elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const loginBtn = document.getElementById('login-btn');
    
    // Register Form Elements
    const registerUsernameInput = document.getElementById('register-username');
    const registerPasswordInput = document.getElementById('register-password');
    const registerConfirmPasswordInput = document.getElementById('register-confirm-password');
    const registerBtn = document.getElementById('register-btn');
    
    const formError = document.getElementById('form-error');
    
    // Toggle between login and register forms
    window.toggleForm = function(formType) {
        if (formType === 'login') {
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        } else {
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        }
        formError.textContent = '';
    }
    
    const myAvatar = document.getElementById('my-avatar');
    const myNickname = document.getElementById('my-nickname');
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
                        const { nickname, serverUrl } = JSON.parse(session);
                        if (nickname && serverUrl) {
                            loginUsernameInput.value = nickname;
                            serverSelect.value = serverUrl;
                            // If server not in list (e.g. IP changed), value might be empty, so check
                            if (!serverSelect.value) {
                                // Fallback: add option or just clear session
                                // For now, clear session if server unavailable
                                localStorage.removeItem('chat_session');
                            } else {
                                // Only auto-login on initial load, not on manual refresh
                                // We can distinguish if needed, but for now keep it simple
                                // Or maybe we shouldn't auto-login on refresh? 
                                // Let's just restore selection.
                            }
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
                        const { nickname, serverUrl } = JSON.parse(session);
                        if (serverUrl && Array.from(serverSelect.options).some(opt => opt.value === serverUrl)) {
                             serverSelect.value = serverUrl;
                             if (nickname) loginUsernameInput.value = nickname;
                        }
                     } catch(e) {}
                }
            });
    }

    // Initial Load
    loadServerConfig();

    // Refresh Button Event
    refreshServerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loadServerConfig();
    });

    // 2. Form Toggle Logic
    window.toggleForm = function(formType) {
        if (formType === 'login') {
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        } else {
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        }
        showError('');
    };
    
    // 3. Register Logic
    registerBtn.addEventListener('click', performRegister);
    
    // Add enter key listeners for register form
    registerUsernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performRegister();
    });
    registerPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performRegister();
    });
    registerConfirmPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performRegister();
    });
    
    function performRegister() {
        const username = registerUsernameInput.value.trim();
        const password = registerPasswordInput.value;
        const confirmPassword = registerConfirmPasswordInput.value;
        
        if (!username) {
            showError('请输入用户名');
            return;
        }
        if (!password) {
            showError('请输入密码');
            return;
        }
        if (password !== confirmPassword) {
            showError('两次输入的密码不一致');
            return;
        }
        
        showError('正在注册...');
        
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
                showError('注册成功，请登录');
                toggleForm('login');
                // Clear register form
                registerUsernameInput.value = '';
                registerPasswordInput.value = '';
                registerConfirmPasswordInput.value = '';
            } else {
                showError(data.message);
            }
        })
        .catch(error => {
            showError('注册失败: ' + error.message);
        });
    }
    
    // 4. Login Logic
    loginBtn.addEventListener('click', performLogin);
    
    // Add enter key listeners for login form
    loginUsernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performLogin();
    });
    loginPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performLogin();
    });

    function performLogin() {
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value;
        const serverUrl = serverSelect.value;

        if (!username) {
            showError('请输入用户名');
            return;
        }
        if (!password) {
            showError('请输入密码');
            return;
        }
        if (!serverUrl) {
            showError('请选择服务器');
            return;
        }

        showError('正在登录...');
        
        // 1. 先验证用户名和密码
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
                // 2. 登录成功后，连接WebSocket
                const nickname = data.username;
                
                // Connect to WebSocket
                try {
                    // Append nickname to URL
                    const url = new URL(serverUrl);
                    url.searchParams.append('nickname', nickname);
                    
                    ws = new WebSocket(url.toString());

                    ws.onopen = () => {
                        currentUser = nickname;
                        // Save session
                        localStorage.setItem('chat_session', JSON.stringify({
                            nickname: nickname,
                            serverUrl: serverUrl
                        }));
                        showError(''); // Clear error
                        enterChat();
                    };

                    ws.onmessage = (event) => {
                        const data = JSON.parse(event.data);
                        handleMessage(data);
                    };

                    ws.onclose = (event) => {
                        if (event.code === 1008) {
                            showError('连接断开: ' + event.reason);
                            exitChat();
                        } else {
                            // Normal close or unexpected
                            console.log('Disconnected', event);
                            // Only show error if we were in chat
                            if (loginScreen.style.display === 'none') {
                                alert('与服务器断开连接');
                                exitChat();
                            }
                        }
                    };

                    ws.onerror = (error) => {
                        console.error('WebSocket Error:', error);
                        showError('连接发生错误，请检查服务器地址');
                    };

                } catch (e) {
                    showError('无法连接到服务器: ' + e.message);
                }
            } else {
                showError(data.message);
            }
        })
        .catch(error => {
            showError('登录失败: ' + error.message);
        });
    }

    function showError(msg) {
        formError.textContent = msg;
    }

    function enterChat() {
        loginScreen.classList.remove('active');
        chatScreen.classList.add('active');
        myNickname.textContent = currentUser;
        myAvatar.textContent = currentUser.substring(0, 1).toUpperCase();
        
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
        console.log('sendMessage called, ws:', ws, 'readyState:', ws ? ws.readyState : 'null');
        if (!ws) {
            console.error('WebSocket not initialized');
            alert('WebSocket连接未初始化，请重新登录');
            return;
        }
        if (ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not open, readyState:', ws.readyState);
            alert('WebSocket连接未打开，请重新登录');
            return;
        }
        
        const content = messageInput.value.trim();
        if (!content) {
            console.error('Empty message content');
            return;
        }

        const message = {
            type: 'text', // Server will re-classify if command
            content: content,
            timestamp: new Date().toISOString()
        };

        try {
            ws.send(JSON.stringify(message));
            console.log('Message sent:', message);
            messageInput.value = '';
            
            // Hide emoji picker if open
            emojiPicker.classList.add('hidden');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('发送消息失败: ' + error.message);
        }
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
                        contentDiv.innerHTML = ""; // Clear "Thinking..."
                        contentDiv.dataset.streaming = "true";
                        contentDiv.style.color = "#2d3436"; // Reset color to normal text
                        contentDiv.style.borderTop = "none";
                        contentDiv.style.paddingTop = "0";
                    }
                    // Append chunk with HTML formatting support
                    // Use innerHTML to preserve formatting (e.g., line breaks, lists)
                    contentDiv.innerHTML += data.content;
                    
                    // Auto scroll if near bottom
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
        } else if (data.type === 'music_control') {
            // Handle music control message from server
            // When one user controls music, all users get this message
            const { action, song_id } = data;
            const iframe = document.getElementById(`music-iframe-${song_id}`);
            if (iframe) {
                if (action === 'play') {
                    // Try to play the music
                    iframe.contentWindow.location.reload();
                } else if (action === 'pause') {
                    // Try to pause (limited by CORS)
                    console.log('Received pause command for song:', song_id);
                }
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
        const div = document.createElement('div');
        div.className = `message ${isSelf ? 'self' : 'other'}`;
        
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        let contentHtml = '';
        
        if (data.type === 'movie') {
            // Video Player with Iframe
            const parseUrl = "https://jx.m3u8.tv/jiexi/?url=" + data.content;
            contentHtml = `
                <div class="message-card" style="width: 420px; max-width: 100%;">
                    <div style="padding: 10px; font-weight: bold; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 5px;">
                        <span>🎬</span> 电影分享
                    </div>
                    <div style="position: relative; width: 100%; padding-top: 100%;">
                        <iframe 
                            src="${escapeHtml(parseUrl)}" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
                            allowfullscreen
                            allow="autoplay; encrypted-media"
                        ></iframe>
                    </div>
                    <div style="padding: 8px; font-size: 0.8rem; color: #666; word-break: break-all;">
                        源地址: ${escapeHtml(data.content)}
                    </div>
                </div>
            `;
        } else if (data.type === 'music') {
            // Music Player with direct MP3 link
            const songName = data.song_name || "未知歌曲";
            const artist = data.artist || "未知歌手";
            const songUrl = data.song_url || "";
            
            // 生成带HTML5 audio播放器的音乐卡片
            contentHtml = `
                <div class="message-card" style="width: 400px; height: 400px; background: #ffd6e0; color: #333; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 0 auto; display: flex; flex-direction: column;">
                    <!-- 音乐信息区域 -->
                    <div style="padding: 16px; display: flex; flex-direction: column; align-items: center; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                        <div style="font-size: 32px; margin-bottom: 8px;">🎵</div>
                        <h3 style="margin: 0; font-size: 18px; margin-bottom: 6px; font-weight: bold; line-height: 1.2; word-break: break-word;">${escapeHtml(songName)}</h3>
                        <p style="margin: 0; font-size: 14px; opacity: 0.9;">${escapeHtml(artist)}</p>
                    </div>
                    
                    <!-- HTML5 Audio Player - 400px正方形 -->
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: #f8f9fa; padding: 20px;">
                        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <audio 
                                controls 
                                style="width: 100%; margin-bottom: 20px;"
                                preload="metadata"
                            >
                                <source src="${escapeHtml(songUrl)}" type="audio/mpeg">
                                您的浏览器不支持音频播放。
                            </audio>
                            <div style="text-align: center; font-size: 14px; color: #666;">
                                <p style="margin: 0;">点击播放按钮开始播放音乐</p>
                                <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.8;">支持播放进度拖动和音量调节</p>
                            </div>
                        </div>
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
            // Default text message with formatting support
            // Ensure proper formatting for line breaks and indentation
            let formattedContent = escapeHtml(data.content)
                .replace(/\n/g, '<br>')
                .replace(/  /g, '&nbsp;&nbsp;'); // Preserve double spaces for indentation
            
            contentHtml = `<div class="content" style="white-space: pre-wrap;">${formattedContent}</div>`;
        }

        div.innerHTML = `
            <div class="meta">${escapeHtml(data.sender)} • ${time}</div>
            ${contentHtml}
        `;
        
        // 添加消息到聊天容器
        chatMessages.appendChild(div);
    }
    
    // 控制音乐播放/暂停的函数
    window.controlMusic = function(songId, action) {
        // 控制当前歌曲的iframe
        const iframe = document.getElementById(`music-iframe-${songId}`);
        if (iframe) {
            // 由于跨域限制，直接控制iframe内部可能不行
            // 这里我们通过重新加载iframe或发送消息来模拟控制
            // 实际项目中可能需要更复杂的实现
            if (action === 'play') {
                // 尝试让iframe重新加载以播放
                iframe.contentWindow.location.reload();
            } else if (action === 'pause') {
                // 尝试暂停（由于跨域限制，可能无法直接控制）
                // 这里我们可以将iframe隐藏或替换为暂停状态
                // 实际项目中可能需要后端支持或更复杂的前端实现
                alert('由于浏览器安全限制，无法直接控制跨域iframe的播放状态。\n建议使用支持跨域通信的音乐API或服务。');
            }
        }
        
        // 向服务器发送控制指令，让所有用户同步执行
        if (ws && ws.readyState === WebSocket.OPEN) {
            const controlMsg = {
                type: 'music_control',
                action: action,
                song_id: songId,
                timestamp: new Date().toISOString()
            };
            ws.send(JSON.stringify(controlMsg));
        }
    }
    
    // 时间格式化函数
    window.formatTime = function(seconds) {
        if (isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    // 播放/暂停切换函数
    window.togglePlay = function(songId) {
        const audio = document.getElementById(`audio-${songId}`);
        const playBtn = document.getElementById(`play-btn-${songId}`);
        
        if (audio) {
            if (audio.paused) {
                audio.play().catch(error => {
                    console.error('播放失败:', error);
                    alert('播放失败，请检查网络或歌曲链接');
                });
                playBtn.textContent = '⏸';
            } else {
                audio.pause();
                playBtn.textContent = '▶';
            }
        }
    };
    
    // 静音切换函数
    window.toggleMute = function(songId) {
        const audio = document.getElementById(`audio-${songId}`);
        const muteBtn = document.getElementById(`mute-btn-${songId}`);
        
        if (audio) {
            if (audio.muted) {
                audio.muted = false;
                muteBtn.textContent = '🔊';
            } else {
                audio.muted = true;
                muteBtn.textContent = '🔇';
            }
        }
    };
    
    // 上一首/下一首函数
    window.playMusic = function(songId, action) {
        // 这里可以根据需要实现上一首/下一首逻辑
        console.log(`${action} song for ID:`, songId);
        alert(`当前功能尚未实现：${action === 'prev' ? '上一首' : '下一首'}`);
    };
    
    // 直接播放音乐的函数
    window.playMusicDirectly = function(songId, songUrl) {
        try {
            // 创建或获取音频元素
            let audio = document.getElementById(`direct-audio-${songId}`);
            if (!audio) {
                audio = document.createElement('audio');
                audio.id = `direct-audio-${songId}`;
                audio.src = songUrl || `https://y.qq.com/n/ryqq/songDetail/${songId}`;
                audio.controls = true;
                audio.style.display = 'none';
                document.body.appendChild(audio);
            }
            
            // 播放音乐
            audio.play().then(() => {
                console.log('音乐播放成功');
                // 显示音频控件（可选）
                audio.style.display = 'block';
                audio.style.width = '100%';
                audio.style.marginTop = '10px';
            }).catch(error => {
                console.error('音乐播放失败:', error);
                alert('音乐播放失败，请检查网络连接或浏览器设置。\n' + error.message);
            });
            
            // 向服务器发送播放指令，让所有用户同步播放
            if (ws && ws.readyState === WebSocket.OPEN) {
                const controlMsg = {
                    type: 'music_control',
                    action: 'play',
                    song_id: songId,
                    timestamp: new Date().toISOString()
                };
                ws.send(JSON.stringify(controlMsg));
            }
        } catch (error) {
            console.error('播放音乐时发生错误:', error);
            alert('播放音乐时发生错误: ' + error.message);
        }
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
            .replace(/'/g, "&#039;")
            // Convert line breaks to <br> tags
            .replace(/\n/g, "<br>")
            // Convert double spaces to non-breaking spaces for indentation
            .replace(/  /g, "&nbsp;");
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
        if (e.target.tagName === 'SPAN') {
            messageInput.value += e.target.textContent;
            messageInput.focus();
        }
    });

    // Global command helper
    window.insertCommand = function(cmd) {
        messageInput.value = cmd;
        messageInput.focus();
    };
});
