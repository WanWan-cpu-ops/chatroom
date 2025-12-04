import json
import socket


def load_config(file_path="config.json"):
    """加载配置文件"""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"servers": []}


def get_local_ip():
    """获取本地IP地址"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return None


def add_local_server_to_config(config, ip=None):
    """将局域网IP添加到配置中"""
    if not ip:
        ip = get_local_ip()
    
    if ip and config.get("servers"):
        has_ip = any(ip in srv["address"] for srv in config.get("servers", []))
        if not has_ip:
            config["servers"].append({
                "name": f"局域网 ({ip})",
                "address": f"ws://{ip}:8888/ws"
            })
    
    return config
