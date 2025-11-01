# 快速开始指南

## 5 分钟启动

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env
```

编辑 `.env`：
```bash
ARK_TOOLS_PATH=arkmanager
ARK_SERVERS_PATH=/home/steam/ARK
ARK_INSTANCE_CONFIG_DIR=/etc/arkmanager/instances
```

### 3. 确保 ark-server-tools 已安装
```bash
which arkmanager
# 应该显示路径，如：/usr/local/bin/arkmanager
```

### 4. 确保至少有一个服务器实例
```bash
ls /etc/arkmanager/instances/
# 应该有至少一个 .cfg 文件，如：main.cfg
```

### 5. 启动
```bash
npm run dev
```

### 6. 访问
```
http://localhost:3000
```

## 第一次使用

### 查看服务器
访问 Dashboard，看到所有配置的服务器实例。

### 启动服务器
1. 点击 "Start" 按钮
2. 观察状态变化：Stopped → Starting... → Running
3. 等待约 30-60 秒完全启动

### 修改配置
1. 访问 Configuration → 选择实例
2. 修改设置（如最大玩家数）
3. 点击 "Save Configuration"
4. **重启服务器**以应用更改

### 安装 Mod
1. 访问 Mods 页面
2. 输入 Mod ID（Steam Workshop）
3. 点击 Install
4. 在 Configuration 中添加 Mod ID
5. 重启服务器

## 常见命令

```bash
# 开发
npm run dev

# 生产构建
npm run build
npm start

# Docker 部署
docker-compose up -d

# PM2 部署
pm2 start ecosystem.config.js
```

## 问题？

查看 [CONFIGURATION.md](CONFIGURATION.md) 获取详细配置说明。

