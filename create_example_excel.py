#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
创建示例Excel文件用于测试ExcelHandler模块
"""

import pandas as pd
import os

# 创建示例数据
data = [
    {'中文名': '北京市', 'adcode': '110000', 'citycode': '110000'},
    {'中文名': '北京市东城区', 'adcode': '110101', 'citycode': '110000'},
    {'中文名': '北京市西城区', 'adcode': '110102', 'citycode': '110000'},
    {'中文名': '上海市', 'adcode': '310000', 'citycode': '310000'},
    {'中文名': '上海市黄浦区', 'adcode': '310101', 'citycode': '310000'},
    {'中文名': '上海市徐汇区', 'adcode': '310104', 'citycode': '310000'},
    {'中文名': '广东省', 'adcode': '440000', 'citycode': ''},
    {'中文名': '广州市', 'adcode': '440100', 'citycode': '020'},
    {'中文名': '深圳市', 'adcode': '440300', 'citycode': '0755'},
    {'中文名': '珠海市', 'adcode': '440400', 'citycode': '0756'},
    {'中文名': '天津市', 'adcode': '120000', 'citycode': '120000'},
    {'中文名': '重庆市', 'adcode': '500000', 'citycode': '23'},
    {'中文名': '江苏省南京市', 'adcode': '320100', 'citycode': '25'},
    {'中文名': '浙江省杭州市', 'adcode': '330100', 'citycode': '571'},
    {'中文名': '浙江省宁波市', 'adcode': '330200', 'citycode': '574'},
]

# 创建DataFrame
df = pd.DataFrame(data)

# 设置文件名
file_name = 'AMap_adcode_citycode.xlsx'
file_path = os.path.join(os.path.dirname(__file__), file_name)

# 导出到Excel
with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
    df.to_excel(writer, index=False, sheet_name='Sheet1')

print(f"示例Excel文件已创建：{file_path}")
print(f"共包含 {len(df)} 条记录")
print("\n数据内容：")
print(df)
