# ARK Server Manager - 快速参考

## 服务器状态对照表

| arkmanager status 输出 | Web UI 显示 | 可用操作 |
|----------------------|------------|---------|
| `Server running: No`<br/>`Server listening: No` | 🔴 **Stopped** | ✅ Start |
| `Server running: Yes`<br/>`Server listening: No` | 🟡 **Starting...** ⏳ | 🚫 等待启动完成 |
| `Server running: Yes`<br/>`Server listening: Yes`<br/>`Unable to query` | 🟡 **Starting...** ⏳ | 🚫 等待启动完成 |
| `Server running: Yes`<br/>`Server listening: Yes`<br/>`Steam Players: 0 / 70` | 🟢 **Running** | ✅ Stop, Restart |

## API 数据格式

### 正确的返回格式
```json
{
  "success": true,
  "data": [
    {
      "name": "main",
      "status": "running",
      "map": "TheIsland",
      "port": 27030,
      "queryPort": 27015,
      "rconPort": 32330,
      "rconPassword": "keyboardcat",
      "onlinePlayers": 1,
      "maxPlayers": 70,
      "pid": 673159,
      "serverName": "8233 8233",
      "version": "360.35"
    }
  ]
}
```

### 配置文件解析
```bash
# 配置文件格式（带注释）
arkserverroot="/home/steam/ARK"                    # 注释会被移除
serverMap="TheIsland"                              # 也会被移除
ark_RCONPort="32330"                               # 同样移除

# 解析后的值（干净）
arkserverroot = "/home/steam/ARK"
serverMap = "TheIsland"
ark_RCONPort = "32330"
```

## arkmanager 命令映射

| Web UI 操作 | arkmanager 命令 |
|------------|----------------|
| 列出所有服务器 | `arkmanager list-instances --brief` |
| 查看状态 | `arkmanager status @main` |
| 启动服务器 | `arkmanager start @main` |
| 停止服务器 | `arkmanager stop @main` |
| 重启服务器 | `arkmanager restart @main` |
| 安装服务器 | `arkmanager install @main` |
| 更新服务器 | `arkmanager update @main` |
| 检查更新 | `arkmanager checkupdate @main` |
| 广播消息 | `arkmanager broadcast @main "消息"` |
| 保存世界 | `arkmanager saveworld @main` |
| RCON 命令 | `arkmanager rconcmd @main "命令"` |
| 备份服务器 | `arkmanager backup @main` |

## 端口配置（ark-server-tools 官方默认）

| 端口类型 | 默认值 | 协议 | 说明 |
|---------|-------|------|------|
| Port | 7778 | UDP | 游戏连接端口 |
| QueryPort | 27015 | UDP | Steam 查询端口 |
| RCONPort | 32330 | TCP | RCON 管理端口 |

**注意**：每个服务器实例必须使用不同的端口！

## 环境变量

```bash
# .env 文件
ARK_TOOLS_PATH=arkmanager                           # arkmanager 可执行文件路径
ARK_SERVERS_PATH=/home/steam/ARK                    # ARK 服务器根目录
ARK_INSTANCE_CONFIG_DIR=/etc/arkmanager/instances  # 实例配置目录
CLUSTER_DATA_PATH=/home/steam/cluster               # 集群数据目录
PORT=3000                                            # Web 管理界面端口
```

## 常见问题快速解决

### 问题：服务器状态显示错误
**解决**：刷新页面，SSE 会在 5 秒内自动更新

### 问题：配置包含奇怪的注释文本
**解决**：已修复，配置解析器现在正确处理注释

### 问题：RCON 连接失败
**检查**：
1. 服务器状态是 `running`（不是 `starting`）
2. RCON 端口正确（默认 32330）
3. 管理员密码正确

### 问题：找不到服务器实例
**检查**：
1. `/etc/arkmanager/instances/` 下是否有 `.cfg` 文件
2. 运行 `arkmanager list-instances` 验证
3. 检查环境变量 `ARK_INSTANCE_CONFIG_DIR`

## 启动流程

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
nano .env

# 3. 启动开发服务器
npm run dev

# 4. 访问
浏览器打开 http://localhost:3000
```

## 生产部署

```bash
# 方式 1: Docker
docker-compose up -d

# 方式 2: PM2
npm run build
pm2 start ecosystem.config.js
```

## 测试命令

```bash
# 测试 arkmanager
arkmanager status @main
arkmanager list-instances

# 测试 API
curl http://localhost:3000/api/servers
curl http://localhost:3000/api/servers/main

# 测试 SSE
curl -N http://localhost:3000/api/events
```

## 配置更新说明

### ⚠️ 配置修改后必须重启服务器

**正确流程**：
1. Web UI 修改配置（如最大玩家数改为 8）
2. 点击"保存配置"
3. 配置写入 `/etc/arkmanager/instances/main.cfg`（更新 `ark_MaxPlayers="8"`）
4. **重启服务器**（通过 Web UI 或 `arkmanager restart @main`）
5. 配置生效

**为什么需要重启？**
- arkmanager 在启动服务器时读取 .cfg 文件
- 将 `ark_` 参数转换为启动命令行参数
- 运行中的服务器不会自动重新加载配置

**验证配置是否已保存**：
```bash
cat /etc/arkmanager/instances/main.cfg | grep MaxPlayers
# 应该显示: ark_MaxPlayers="8"
```

详见：[CONFIG_UPDATE_GUIDE.md](CONFIG_UPDATE_GUIDE.md)

---

## 更新日志

**2025-11-01**
- ✅ 修复配置文件注释解析
- ✅ 修复服务器状态判断逻辑（支持 4 种状态）
- ✅ 支持启动中状态（2个阶段）
- ✅ 正确提取玩家数量
- ✅ 添加服务器版本信息
- ✅ 修复 systeminformation 警告
- ✅ Next.js 15 params async 兼容
- ✅ **配置管理改为修改 .cfg 文件（ark_ 参数）**
- ✅ 添加配置保存提示（需要重启）

