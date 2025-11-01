# 修复日志

## 更新日期
2025年11月1日

---

# 修复日志

## 问题 1: 配置文件路径包含注释

### 错误信息
```
ENOENT: no such file or directory, open '/home/steam/ARK"                                     # path of your ARK server files (default ~/ARK)/ShooterGame/Saved/Config/LinuxServer/GameUserSettings.ini'
```

### 原因
配置文件解析器没有正确处理行内注释。ark-server-tools 的配置文件使用 bash 风格：
```bash
arkserverroot="/home/steam/ARK"                                     # path of your ARK server files
```

### 解决方案
更新 `lib/ark-manager.ts` 中的 `readInstanceConfig` 方法：

1. **对于带引号的值**：提取引号之间的内容（忽略引号后的注释）
2. **对于不带引号的值**：移除 `#` 及其后的所有内容
3. **最终清理**：移除任何残留的引号

### 测试验证
```javascript
// 输入
arkserverroot="/home/steam/ARK"                                     # comment

// 输出
arkserverroot: "/home/steam/ARK"  (正确！)
```

---

## 问题 2: 服务器状态显示不正确

### 错误描述
服务器已停止（`arkmanager status` 显示 "Server running: No"），但前端仍显示为运行中。

### 原因
状态解析逻辑使用简单的字符串包含检查：
```typescript
const isRunning = statusOutput.toLowerCase().includes('running')
```

这会匹配到 "Server running: No" 中的 "running"，导致错误判断。

### 解决方案
更新 `parseInstanceStatus` 方法，正确解析 arkmanager 的输出格式：

```typescript
// 正确解析状态行
const runningMatch = statusOutput.match(/Server running:\s*(Yes|No)/i)
const listeningMatch = statusOutput.match(/Server listening:\s*(Yes|No)/i)

// 只有明确显示 "Yes" 时才认为服务器在运行
const isRunning = (runningMatch && runningMatch[1].toLowerCase() === 'yes') ||
                 (listeningMatch && listeningMatch[1].toLowerCase() === 'yes')
```

### arkmanager status 输出格式
```
Running command 'status' for instance 'main'

 Server running:   No       ← 检查这一行
 Server listening: No       ← 也检查这一行
 Server build ID:  20411757
```

---

## 问题 3: systeminformation 模块警告

### 警告信息
```
Module not found: Can't resolve 'osx-temperature-sensor' in 'node_modules/systeminformation/lib'
```

### 原因
`systeminformation` 包包含对 macOS 专用模块 `osx-temperature-sensor` 的可选依赖。在 Linux/Windows 系统上，这个模块不存在。

### 解决方案
在 `next.config.js` 中配置 webpack fallback，忽略这个可选依赖：

```javascript
webpack: (config, { isServer }) => {
  if (isServer) {
    config.resolve = config.resolve || {}
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'osx-temperature-sensor': false,
    }
  }
  return config
}
```

这告诉 webpack 在无法解析该模块时使用 `false`（即忽略它），而不是报错。

---

## 修复的文件

1. ✅ `lib/ark-manager.ts`
   - 改进配置文件解析（处理引号和注释）
   - 修正服务器状态判断逻辑
   - 优化 `getInstanceStatus` 方法

2. ✅ `next.config.js`
   - 添加 webpack 配置忽略可选依赖

---

## 验证步骤

### 1. 测试配置文件解析
```bash
# 检查 API 返回
curl http://localhost:3000/api/servers

# 应该返回干净的数据，无注释：
{
  "map": "TheIsland",
  "rconPassword": "keyboardcat"
}
```

### 2. 测试服务器状态
```bash
# 停止服务器
arkmanager stop @main

# 刷新前端，应显示 "Stopped" 状态
```

### 3. 验证警告消失
```bash
# 重启开发服务器
npm run dev

# 应该不再看到 osx-temperature-sensor 相关警告
```

---

## 额外改进

### Next.js 15 兼容性
所有动态路由 `params` 现在都正确使用 async/await：

```typescript
// 修复前
{ params }: { params: { instance: string } }

// 修复后  
{ params }: { params: Promise<{ instance: string }> }

// 使用
const { instance } = await params
```

### ark-server-tools 集成
- ✅ 默认端口修正为官方标准（RCON: 32330）
- ✅ 正确使用 arkmanager 命令（`broadcast @instance` 而非 `rconcmd`）
- ✅ 从实例配置文件读取服务器路径
- ✅ 支持环境变量配置

---

## 配置示例

### 环境变量 (.env)
```bash
ARK_TOOLS_PATH=arkmanager
ARK_SERVERS_PATH=/home/steam/ARK
ARK_INSTANCE_CONFIG_DIR=/etc/arkmanager/instances
CLUSTER_DATA_PATH=/home/steam/cluster
```

### 实例配置 (/etc/arkmanager/instances/main.cfg)
```bash
arkserverroot="/home/steam/ARK"                                     # 注释会被正确移除
serverMap="TheIsland"                                               # 这也没问题
ark_RCONEnabled="True"
ark_RCONPort="32330"
ark_Port="7778"
ark_QueryPort="27015"
ark_ServerAdminPassword="your-password"
ark_SessionName="My ARK Server"
ark_MaxPlayers="70"
```

所有这些配置现在都能正确解析！

---

## 状态详细说明

根据用户提供的实际 arkmanager 输出，现在正确支持以下状态：

### 1. 已停止 (stopped)
```
Server running: No
Server listening: No
```

### 2. 启动中 - 阶段 1 (starting)
```
Server running: Yes
Server listening: No
有 PID，但还未监听端口
```

### 3. 启动中 - 阶段 2 (starting)
```
Server running: Yes
Server listening: Yes
Unable to query server（无法查询）
```

### 4. 运行中 (running)
```
Server running: Yes
Server listening: Yes
Steam Players: 0 / 70（有玩家信息）
```

### UI 改进
- ✅ 启动中/停止中状态显示旋转动画 `animate-spin`
- ✅ 过渡状态禁用操作按钮
- ✅ 实时更新（每 5 秒通过 SSE）
- ✅ 正确提取玩家数量 "Steam Players: X / Y"
- ✅ 提取服务器名称和版本号

详细的状态解析说明请参考 [STATUS_PARSING.md](STATUS_PARSING.md)

