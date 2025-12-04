/**
 * 侧边栏服务模块
 * 统一管理左侧信息栏的功能，包括用户信息、在线用户列表、退出登录等
 */

export class SidebarService {
    constructor() {
        // 初始化侧边栏元素引用
        this.elements = {
            myAvatar: document.getElementById('my-avatar'),
            myNickname: document.getElementById('my-nickname'),
            userCount: document.getElementById('user-count'),
            onlineUsersList: document.getElementById('online-users'),
            logoutBtn: document.getElementById('logout-btn')
        };
    }

    /**
     * 初始化侧边栏
     * @param {string} currentUser - 当前用户名
     * @param {Array} initialUsers - 初始在线用户列表
     */
    init(currentUser, initialUsers = []) {
        this.currentUser = currentUser;
        this.updateUserInfo();
        this.updateOnlineUsers(initialUsers);
        this.setupEventListeners();
    }

    /**
     * 更新当前用户信息
     */
    updateUserInfo() {
        if (!this.currentUser) return;

        // 更新用户头像
        if (this.elements && this.elements.myAvatar) {
            this.elements.myAvatar.textContent = this.currentUser.substring(0, 1).toUpperCase();
        }

        // 更新用户名
        if (this.elements && this.elements.myNickname) {
            this.elements.myNickname.textContent = this.currentUser;
        }
    }

    /**
     * 更新在线用户列表
     * @param {Array} users - 在线用户列表
     */
    updateOnlineUsers(users) {
        if (!this.elements.userCount || !this.elements.onlineUsersList) return;

        // 更新用户数量
        this.elements.userCount.textContent = users.length;

        // 清空当前用户列表
        this.elements.onlineUsersList.innerHTML = '';

        // 渲染每个用户
        users.forEach(user => {
            const userElement = this.createUserListItem(user);
            this.elements.onlineUsersList.appendChild(userElement);
        });
    }

    /**
     * 创建用户列表项
     * @param {string} user - 用户名
     * @returns {HTMLElement} - 用户列表项元素
     */
    createUserListItem(user) {
        const div = document.createElement('div');
        div.className = 'user-list-item';
        div.innerHTML = `
            <div class="avatar-small">${user.substring(0, 1).toUpperCase()}</div>
            <span>${escapeHtml(user)}</span>
        `;

        // 添加点击事件处理
        div.addEventListener('click', () => {
            this.handleUserClick(user);
        });

        return div;
    }

    /**
     * 设置侧边栏事件监听器
     */
    setupEventListeners() {
        // 设置退出登录按钮事件
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    /**
     * 处理用户点击事件
     * @param {string} user - 被点击的用户名
     */
    handleUserClick(user) {
        // 默认行为：可以扩展为私聊或其他功能
        console.log(`点击了用户: ${user}`);
    }

    /**
     * 处理退出登录事件
     */
    handleLogout() {
        // 触发全局退出登录事件
        const event = new CustomEvent('sidebar:logout', {
            detail: {
                user: this.currentUser
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 添加用户到在线列表
     * @param {string} user - 要添加的用户名
     */
    addUser(user) {
        if (!this.elements.userCount || !this.elements.onlineUsersList) return;

        // 更新用户数量
        const currentCount = parseInt(this.elements.userCount.textContent);
        this.elements.userCount.textContent = currentCount + 1;

        // 添加新用户
        const userElement = this.createUserListItem(user);
        this.elements.onlineUsersList.appendChild(userElement);
    }

    /**
     * 从在线列表中移除用户
     * @param {string} user - 要移除的用户名
     */
    removeUser(user) {
        if (!this.elements.userCount || !this.elements.onlineUsersList) return;

        // 更新用户数量
        const currentCount = parseInt(this.elements.userCount.textContent);
        this.elements.userCount.textContent = currentCount - 1;

        // 移除用户元素
        const userElements = this.elements.onlineUsersList.querySelectorAll('.user-list-item');
        userElements.forEach(element => {
            if (element.querySelector('span').textContent === user) {
                element.remove();
            }
        });
    }
}

/**
 * 转义HTML特殊字符
 * @param {string} text - 要转义的文本
 * @returns {string} - 转义后的文本
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}