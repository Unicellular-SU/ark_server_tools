# ARK Server Manager

基于 Next.js 15 的 ARK: Survival Evolved 服务器 Web 管理后台，集成 ark-server-tools。

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 功能特性

- 🎮 **服务器管理** - 启动/停止/重启/安装/更新
- 📊 **实时监控** - CPU、内存、玩家数量（SSE 实时更新）
- ⚙️ **配置管理** - 图形化配置界面，保存到 .cfg 文件
- 🧩 **Mod 管理** - 安装/卸载 Steam Workshop Mod
- 🌐 **集群配置** - 多服互通设置
- 🎯 **RCON 控制台** - Web 终端，快捷命令
- 📝 **日志查看** - 实时日志流

## 快速开始

### 前提条件

- Linux 系统（Ubuntu 20.04+）
- Node.js 20+
- ark-server-tools 已安装

### 安装 ark-server-tools

```bash
curl -sL https://raw.githubusercontent.com/arkmanager/ark-server-tools/master/netinstall.sh | sudo bash -s steam
```

### 安装项目

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd ark-server-manager

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
nano .env

# 4. 启动开发服务器
npm run dev

# 5. 访问
http://localhost:3000
```

## 配置说明

### 环境变量 (.env)

```bash
ARK_TOOLS_PATH=arkmanager
ARK_SERVERS_PATH=/home/steam/ARK
ARK_INSTANCE_CONFIG_DIR=/etc/arkmanager/instances
CLUSTER_DATA_PATH=/home/steam/cluster
PORT=3000
```

### 实例配置

创建 `/etc/arkmanager/instances/main.cfg`：

```bash
arkserverroot="/home/steam/ARK"
serverMap="TheIsland"

# 端口（每个实例必须唯一！）
ark_Port="7778"
ark_QueryPort="27015"
ark_RCONPort="32330"

# RCON
ark_RCONEnabled="True"
ark_ServerAdminPassword="your-password"

# 服务器设置
ark_SessionName="My Server"
ark_MaxPlayers="70"

# 可选：Mod
# ark_GameModIds="731604991,839162288"
```

**详细配置**：查看 [docs/CONFIGURATION.md](docs/CONFIGURATION.md)

## 使用指南

### 仪表盘
- 查看所有服务器状态
- 实时资源监控
- 快速启动/停止操作

### 服务器管理
- 安装新服务器实例（选择地图）
- 启动/停止/重启（带确认对话框）
- 检查并应用更新

### 配置管理
1. 访问 `/config/<instance>`
2. 修改设置（Basic / Gameplay / Advanced）
3. 保存配置（写入 .cfg 文件）
4. **重启服务器**以应用更改

**重要**：配置修改后必须重启服务器才能生效！

### Mod 管理
1. 访问 `/mods` 页面
2. 输入 Steam Workshop Mod ID（如：731604991）
3. 点击 Install 安装
4. 在 Configuration → Gameplay 中添加 Mod ID
5. 重启服务器加载 Mod

### RCON 控制台
- 选择运行中的服务器
- 使用快捷命令或输入自定义命令
- 查看命令历史

## 部署

### Docker（推荐）

```bash
docker-compose up -d
```

### PM2

```bash
npm run build
pm2 start ecosystem.config.js
```

## 重要注意事项

### ⚠️ 端口配置
每个服务器实例必须使用唯一的端口：
- **共享端口** → 服务器崩溃
- **共享 RCON 端口** → 卡在 0/0 玩家

建议端口配置：
```bash
# 实例 1: Port=7778, QueryPort=27015, RCONPort=32330
# 实例 2: Port=7780, QueryPort=27017, RCONPort=32332
# 实例 3: Port=7782, QueryPort=27019, RCONPort=32334
```

### ⚠️ 配置生效
- 配置保存到 `/etc/arkmanager/instances/<instance>.cfg`
- 参数格式：`ark_MaxPlayers="70"`
- 必须重启服务器才能生效

### ⚠️ 会话名称
- 避免特殊字符（!、&、[ 等）
- 或在 GameUserSettings.ini 中手动设置

## 故障排除

### 权限问题：无法保存配置

**快速解决**：
```bash
# 方法 1：使用用户级配置（推荐）
mkdir -p ~/.config/arkmanager/instances
cp /etc/arkmanager/instances/*.cfg ~/.config/arkmanager/instances/
# 更新 .env: ARK_INSTANCE_CONFIG_DIR=$HOME/.config/arkmanager/instances

# 方法 2：修改权限
sudo chown -R $USER:$USER /etc/arkmanager/instances

# 方法 3：以 steam 用户运行
sudo -u steam npm run dev
```

详见：[docs/PERMISSION_SETUP.md](docs/PERMISSION_SETUP.md)

### 配置修改不生效
1. 检查 .cfg 文件是否已更新
2. 确认已重启服务器
3. 等待服务器完全启动（状态：Running）

### 端口冲突
```bash
# 检查端口配置
grep "ark_.*Port" /etc/arkmanager/instances/*.cfg
```

### RCON 连接失败
- 确保服务器状态为 "Running"
- 检查 `ark_RCONEnabled="True"`
- 验证 RCON 端口（默认 32330）

## 项目结构

```
ark_server_tools/
├── app/                # Next.js App Router
│   ├── api/           # API 路由（21 个端点）
│   ├── dashboard/     # 仪表盘
│   ├── servers/       # 服务器管理
│   ├── config/        # 配置
│   ├── mods/          # Mod 管理
│   ├── cluster/       # 集群
│   ├── rcon/          # RCON
│   └── logs/          # 日志
├── components/        # React 组件
├── lib/               # 核心库
│   ├── ark-manager.ts
│   ├── config-manager.ts
│   ├── mod-manager.ts
│   ├── rcon-client.ts
│   └── system-monitor.ts
├── docs/              # 文档
│   └── CONFIGURATION.md
├── Dockerfile
├── docker-compose.yml
└── ecosystem.config.js
```

## 技术栈

- **前端**: Next.js 15, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **后端**: Next.js API Routes, ark-server-tools
- **实时通信**: Server-Sent Events (SSE)
- **部署**: Docker, PM2

## API 端点

<details>
<summary>查看所有 API 端点</summary>

### 服务器管理
- `GET /api/servers` - 列出所有服务器
- `GET /api/servers/[instance]` - 获取服务器状态
- `POST /api/servers/[instance]` - 启动服务器
- `PUT /api/servers/[instance]` - 重启服务器
- `DELETE /api/servers/[instance]` - 停止服务器
- `POST /api/servers/[instance]/install` - 安装服务器
- `PUT /api/servers/[instance]/install` - 更新服务器
- `GET /api/servers/[instance]/install` - 检查更新

### 配置管理
- `GET /api/servers/[instance]/config` - 读取配置
- `POST /api/servers/[instance]/config` - 保存配置

### Mod 管理
- `GET /api/mods/[instance]` - 列出 Mod
- `POST /api/mods/[instance]` - 安装 Mod
- `DELETE /api/mods/[instance]` - 卸载 Mod
- `GET /api/mods/[instance]/check` - 检查 Mod 更新

### RCON
- `POST /api/rcon/[instance]` - 执行 RCON 命令
- `GET /api/rcon/[instance]` - 获取命令历史
- `DELETE /api/rcon/[instance]` - 断开 RCON

### 实时监控
- `GET /api/events` - SSE 服务器状态流
- `GET /api/logs/[instance]` - SSE 日志流

### 集群
- `GET /api/cluster` - 获取集群配置
- `POST /api/cluster` - 保存集群配置

</details>

## 安全建议

- 无内置认证，建议部署在反向代理（nginx + 认证）后
- 或使用 VPN 限制访问
- 使用强 RCON 密码
- 配置防火墙规则

## License

MIT License - 详见 [LICENSE](LICENSE)

## 参考资源

- [ark-server-tools](https://github.com/arkmanager/ark-server-tools)
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**版本**: 1.0.0  
**快速开始**: [docs/QUICK_START.md](docs/QUICK_START.md)  
**配置指南**: [docs/CONFIGURATION.md](docs/CONFIGURATION.md)  
**故障排除**: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
