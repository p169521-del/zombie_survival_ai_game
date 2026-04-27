# 尸潮二十日：末日生存文字游戏

包含：
- index.html：完整网页游戏，本地可玩
- netlify/functions/game-ai.js：可选 OpenAI AI 主持人接口
- netlify.toml：Netlify 配置
- package.json：项目配置

## 本地运行
直接打开 index.html。没有 API 也能玩，会自动使用本地模拟 AI。

## 部署到 Netlify 并启用真实 AI
1. 上传整个项目到 GitHub。
2. Netlify 选择 Import from GitHub。
3. Project configuration > Environment variables 添加：
   OPENAI_API_KEY=你的 OpenAI API Key
4. 可选添加：
   OPENAI_MODEL=gpt-4.1-mini
5. 重新 Deploy。

注意：API Key 必须放在 Netlify 环境变量，不能写进前端代码。
