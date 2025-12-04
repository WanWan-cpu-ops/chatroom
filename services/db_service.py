import sqlite3
import os
from typing import Optional, Tuple

class DatabaseService:
    def __init__(self):
        # 数据库文件路径
        self.db_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'users.db')
        # 确保data目录存在
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        # 初始化数据库
        self._init_db()

    def _init_db(self):
        """初始化数据库，创建用户表"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            # 创建用户表，存储用户名和密码
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    username TEXT PRIMARY KEY,
                    password TEXT NOT NULL
                )
            ''')
            conn.commit()

    def register_user(self, username: str, password: str) -> bool:
        """注册新用户
        
        Args:
            username: 用户名
            password: 密码
            
        Returns:
            bool: 注册是否成功
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                # 插入新用户，使用用户名作为主键确保唯一性
                cursor.execute(
                    'INSERT INTO users (username, password) VALUES (?, ?)',
                    (username, password)
                )
                conn.commit()
                return True
        except sqlite3.IntegrityError:
            # 用户名已存在
            return False
        except Exception as e:
            print(f"注册用户时发生错误: {e}")
            return False

    def login_user(self, username: str, password: str) -> bool:
        """用户登录
        
        Args:
            username: 用户名
            password: 密码
            
        Returns:
            bool: 登录是否成功
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                # 查询用户
                cursor.execute(
                    'SELECT password FROM users WHERE username = ?',
                    (username,)
                )
                result = cursor.fetchone()
                if result and result[0] == password:
                    return True
                return False
        except Exception as e:
            print(f"用户登录时发生错误: {e}")
            return False

    def check_username_exists(self, username: str) -> bool:
        """检查用户名是否已存在
        
        Args:
            username: 用户名
            
        Returns:
            bool: 用户名是否已存在
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    'SELECT 1 FROM users WHERE username = ?',
                    (username,)
                )
                return cursor.fetchone() is not None
        except Exception as e:
            print(f"检查用户名时发生错误: {e}")
            return False

# 创建数据库服务实例
db_service = DatabaseService()