#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Excel表格操作模块 - 用于处理AMap_adcode_citycode.xlsx文件
"""

import pandas as pd
import os

class ExcelHandler:
    """
    Excel表格操作类，用于处理AMap_adcode_citycode.xlsx文件
    """
    
    def __init__(self, file_path=None):
        """
        初始化ExcelHandler
        
        Args:
            file_path (str): Excel文件路径，如果不提供则使用默认路径
        """
        # 设置默认文件路径
        self.default_file_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            'AMap_adcode_citycode.xlsx'
        )
        
        self.file_path = file_path or self.default_file_path
        self.data = None
        self.loaded = False
        
        # 尝试自动加载文件
        self.load_file()
    
    def load_file(self):
        """
        加载Excel文件
        
        Returns:
            bool: 加载成功返回True，否则返回False
        """
        try:
            # 检查文件是否存在
            if not os.path.exists(self.file_path):
                print(f"错误：文件不存在 - {self.file_path}")
                return False
            
            # 读取Excel文件，指定表头
            self.data = pd.read_excel(
                self.file_path,
                usecols=['中文名', 'adcode', 'citycode'],  # 只读取需要的列
                dtype={'adcode': str, 'citycode': str}  # 将adcode和citycode读取为字符串
            )
            
            # 移除可能的重复行
            self.data = self.data.drop_duplicates()
            
            # 重置索引
            self.data = self.data.reset_index(drop=True)
            
            self.loaded = True
            print(f"成功加载Excel文件：{self.file_path}")
            print(f"共加载 {len(self.data)} 条记录")
            return True
            
        except Exception as e:
            print(f"加载Excel文件失败：{str(e)}")
            return False
    
    def get_all_data(self):
        """
        获取所有数据
        
        Returns:
            DataFrame or None: 所有数据，加载失败则返回None
        """
        if self.loaded:
            return self.data
        return None
    
    def get_data_as_dict(self):
        """
        获取所有数据为字典列表
        
        Returns:
            list or None: 字典列表，加载失败则返回None
        """
        if self.loaded:
            return self.data.to_dict('records')
        return None
    
    def find_by_city_name(self, city_name):
        """
        根据城市名称查找记录
        
        Args:
            city_name (str): 城市名称
            
        Returns:
            list or None: 匹配的记录列表，没有找到则返回空列表，加载失败则返回None
        """
        if not self.loaded:
            return None
        
        # 使用模糊匹配，忽略大小写
        result = self.data[self.data['中文名'].str.contains(city_name, case=False, na=False)]
        return result.to_dict('records')
    
    def find_by_adcode(self, adcode):
        """
        根据adcode查找记录
        
        Args:
            adcode (str): 城市编号（六位字符串）
            
        Returns:
            dict or None: 匹配的记录，没有找到则返回None，加载失败则返回None
        """
        if not self.loaded:
            return None
        
        # 精确匹配adcode
        result = self.data[self.data['adcode'] == str(adcode)]
        if len(result) > 0:
            return result.iloc[0].to_dict()
        return None
    
    def find_by_citycode(self, citycode):
        """
        根据citycode查找记录
        
        Args:
            citycode (str): 城市代码
            
        Returns:
            list or None: 匹配的记录列表，没有找到则返回空列表，加载失败则返回None
        """
        if not self.loaded:
            return None
        
        # 精确匹配citycode
        result = self.data[self.data['citycode'] == str(citycode)]
        return result.to_dict('records')
    
    def get_cities_by_province(self, province):
        """
        根据省份名称查找城市
        
        Args:
            province (str): 省份名称（如"北京"、"上海"）
            
        Returns:
            list or None: 匹配的城市列表，没有找到则返回空列表，加载失败则返回None
        """
        if not self.loaded:
            return None
        
        # 假设中文名格式为"省份 城市"，或者城市名包含省份名
        result = self.data[self.data['中文名'].str.startswith(province, na=False)]
        return result.to_dict('records')
    
    def export_to_json(self, output_path):
        """
        将数据导出为JSON文件
        
        Args:
            output_path (str): JSON输出路径
            
        Returns:
            bool: 导出成功返回True，否则返回False
        """
        if not self.loaded:
            return False
        
        try:
            # 将数据转换为JSON
            self.data.to_json(output_path, orient='records', force_ascii=False, indent=2)
            print(f"成功导出JSON文件：{output_path}")
            return True
        except Exception as e:
            print(f"导出JSON失败：{str(e)}")
            return False
    
    def count_records(self):
        """
        获取记录总数
        
        Returns:
            int or None: 记录总数，加载失败则返回None
        """
        if self.loaded:
            return len(self.data)
        return None
    
    def get_unique_provinces(self):
        """
        获取所有唯一的省份
        
        Returns:
            list or None: 省份列表，加载失败则返回None
        """
        if not self.loaded:
            return None
        
        # 提取所有中文名的第一个汉字作为省份（简化处理）
        provinces = []
        for name in self.data['中文名']:
            if pd.notna(name) and len(name) > 0:
                province = name[0]
                if province not in provinces:
                    provinces.append(province)
        
        return sorted(provinces)

# 测试代码
if __name__ == "__main__":
    # 创建ExcelHandler实例
    excel_handler = ExcelHandler()
    
    if excel_handler.loaded:
        print("\n=== 测试功能 ===")
        
        # 测试获取记录总数
        print(f"\n记录总数：{excel_handler.count_records()}")
        
        # 测试根据城市名查找
        print("\n查找包含'北京'的城市：")
        beijing_cities = excel_handler.find_by_city_name('北京')
        if beijing_cities:
            for city in beijing_cities[:5]:  # 只显示前5个
                print(city)
        
        # 测试根据adcode查找
        print("\n根据adcode查找（110000）：")
        city_by_adcode = excel_handler.find_by_adcode('110000')
        if city_by_adcode:
            print(city_by_adcode)
        
        # 测试获取所有省份
        print("\n所有省份：")
        provinces = excel_handler.get_unique_provinces()
        if provinces:
            print(provinces)
            
        # 测试导出为JSON
        print("\n导出为JSON文件...")
        excel_handler.export_to_json('city_data.json')
    else:
        print("ExcelHandler初始化失败")
