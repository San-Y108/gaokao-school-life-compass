# 部署说明

## 项目概述
校感 Compass - 基于真实校园生活体验的高校选择工具

## 技术栈
- Next.js 16.2.1 (App Router)
- TypeScript
- Tailwind CSS 4
- React 19.2.4

## 本地开发

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:3000

### 代码检查
```bash
npm run lint
```

## 生产构建

### 构建项目
```bash
npm run build
```

### 启动生产服务器
```bash
npm start
```

## 部署到 Vercel

### 步骤 1: 准备代码
确保代码已推送到 Git 仓库（GitHub、GitLab 等）

### 步骤 2: 连接 Vercel
1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub/GitLab 账号登录
3. 点击 "New Project"
4. 导入你的仓库

### 步骤 3: 配置部署
- **Framework Preset**: Next.js
- **Root Directory**: 保持默认（根目录）
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 步骤 4: 环境变量
**当前版本不需要任何环境变量**

### 步骤 5: 部署
点击 "Deploy"，Vercel 会自动构建并部署你的应用

## 部署注意事项

### 当前版本特性
- ✅ 纯前端静态网站
- ✅ 无后端 API 依赖
- ✅ 无数据库连接
- ✅ 无环境变量需求
- ✅ 支持服务端渲染 (SSR)

### 技术细节
- 使用 Next.js App Router
- 支持静态生成 (SSG) 和服务端渲染 (SSR)
- 对比功能使用 localStorage 存储状态
- 完全兼容 Vercel 平台

### 已知限制
- 对比状态仅在当前浏览器会话中保存
- 学校数据为静态数据，需要手动更新
- 不支持用户登录和个性化数据

## 后续扩展建议

### 数据扩展
1. 增加更多学校数据
2. 添加数据更新机制
3. 考虑接入外部数据源

### 功能扩展
1. 用户账户系统
2. 个性化收藏功能
3. 数据导出功能
4. 移动端应用

### 技术升级
1. 添加单元测试
2. 集成 CI/CD 流程
3. 性能监控和分析
4. SEO 优化

## 故障排除

### 构建失败
- 检查 TypeScript 类型错误
- 确保所有依赖正确安装
- 验证 next.config.ts 配置

### 运行时错误
- 检查 localStorage 兼容性
- 验证客户端/服务端边界
- 查看浏览器控制台错误

### 部署问题
- 检查 Vercel 构建日志
- 验证环境变量配置
- 确认域名和 SSL 设置

---

**注意**: 本部署说明基于当前版本 (0.1.0)，后续版本可能会有变化。