#!/usr/bin/env python3
"""
追番网站后端启动脚本
"""
import uvicorn
import os
import sys

# 添加backend目录到Python路径
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

if __name__ == "__main__":
    print("启动追番网站后端服务器...")
    print("API文档地址: http://localhost:8000/docs")
    print("前端地址: http://localhost:8000/frontend/index.html")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 