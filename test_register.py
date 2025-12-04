import requests
import json

try:
    # 测试注册功能
    print("测试注册功能...")
    register_data = {
        "username": "testuser",
        "password": "password123",
        "confirm_password": "password123"
    }
    register_response = requests.post(
        "http://localhost:12345/api/register",
        json=register_data,
        timeout=5
    )
    print(f"注册状态码: {register_response.status_code}")
    print(f"注册响应: {register_response.text}")
    
    # 测试登录功能
    print("\n测试登录功能...")
    login_data = {
        "username": "testuser",
        "password": "password123"
    }
    login_response = requests.post(
        "http://localhost:12345/api/login",
        json=login_data,
        timeout=5
    )
    print(f"登录状态码: {login_response.status_code}")
    print(f"登录响应: {login_response.text}")
    
except Exception as e:
    print(f"错误: {e}")
