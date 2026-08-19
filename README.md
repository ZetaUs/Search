# Search
## 简易搜索引擎
基于 GitHub Pages + Cloudflare Workers 搭建的静态搜索站

### 在线地址
https://search.zztxorg.dpdns.org

### 部署教程
1. Fork 本仓库
2. 绑定 Cloudflare Pages
3. 创建 Workers 跨域代理

### 技术栈
- HTML/CSS/JS 前端
- Cloudflare Pages 静态托管
- Cloudflare Workers CORS中转
- DuckDuckGo 搜索API

### 文件说明
- index.html 首页
- style.css 样式
- main.js 搜索逻辑
- worker.js 跨域代理代码
