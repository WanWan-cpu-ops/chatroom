import json
import tornado.web
from services.excel_handler import ExcelHandler

class CityHandler(tornado.web.RequestHandler):
    """城市处理程序，提供城市名称到adcode的转换功能"""
    
    def initialize(self):
        # 初始化ExcelHandler，用于读取城市数据
        self.excel_handler = ExcelHandler()
    
    def get(self):
        # 获取城市名称参数
        city_name = self.get_argument("name", "")
        
        if not city_name:
            self.write({
                "success": False,
                "message": "缺少城市名称参数",
                "data": None
            })
            return
        
        try:
            # 根据城市名称查找匹配的城市
            matched_cities = self.excel_handler.find_by_city_name(city_name)
            
            if not matched_cities:
                self.write({
                    "success": False,
                    "message": f"未找到与'{city_name}'匹配的城市",
                    "data": None
                })
                return
            
            # 构建响应数据
            cities = []
            for city in matched_cities:
                cities.append({
                    "name": city["中文名"],
                    "adcode": city["adcode"],
                    "citycode": city["citycode"]
                })
            
            self.write({
                "success": True,
                "message": "城市查询成功",
                "data": cities
            })
            
        except Exception as e:
            self.write({
                "success": False,
                "message": f"城市查询失败: {str(e)}",
                "data": None
            })
        
        # 设置响应头为JSON格式
        self.set_header('Content-Type', 'application/json')
