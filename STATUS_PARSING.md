# ARK 服务器状态解析说明

## arkmanager status 输出格式

### 1. 已停止 (Stopped)
```
Running command 'status' for instance 'main'

 Server running:   No 
 Server listening:   No 
 Server build ID:   20411757
```
**状态判断**: `status = 'stopped'`

---

### 2. 启动中 - 阶段 1 (Starting - Phase 1)
```
Running command 'status' for instance 'main'

 Server running:   Yes 
 Server PID:   673159 
 Server listening:   No 
 Server build ID:   20411757
```
**状态判断**: `status = 'starting'`
- 进程已启动
- 但还未开始监听网络端口

---

### 3. 启动中 - 阶段 2 (Starting - Phase 2)
```
Running command 'status' for instance 'main'

 Server running:   Yes 
 Server PID:   673159 
 Server listening:   Yes 
Unable to query server
 Server online:   No 
 Server build ID:   20411757
```
**状态判断**: `status = 'starting'`
- 进程已启动
- 已开始监听端口
- 但无法查询服务器（未完全就绪）

---

### 4. 运行中 - 无玩家 (Running - No Players)
```
Running command 'status' for instance 'main'

 Server running:   Yes 
 Server PID:   673159 
 Server listening:   Yes 
Server Name: 8233 8233 - (v360.35)
Steam Players: 0 / 70
Active Steam Players: 0
 Server online:   No 
 Server build ID:   20411757
```
**状态判断**: `status = 'running'`
- 服务器完全在线
- 可以查询到服务器名称和版本
- 显示玩家数量: 0/70

---

### 5. 运行中 - 有玩家 (Running - With Players)
```
Running command 'status' for instance 'main'

 Server running:   Yes 
 Server PID:   673159 
 Server listening:   Yes 
Server Name: 8233 8233 - (v360.35)
Steam Players: 1 / 70
Active Steam Players: 1
 Server online:   No 
 Server build ID:   20411757
```
**状态判断**: `status = 'running'`
- 服务器完全在线
- 有玩家连接: 1/70

---

## 状态判断逻辑

```typescript
// 1. 检查服务器进程是否运行
const isServerRunning = runningMatch && runningMatch[1].toLowerCase() === 'yes'

// 2. 检查服务器是否监听
const isServerListening = listeningMatch && listeningMatch[1].toLowerCase() === 'yes'

// 3. 判断状态
if (!isServerRunning) {
  status = 'stopped'
} else if (!isServerListening) {
  status = 'starting'  // 进程运行但未监听
} else {
  // 服务器监听中，检查是否完全就绪
  const hasPlayerInfo = statusOutput.includes('Steam Players:')
  const unableToQuery = statusOutput.includes('Unable to query')
  
  if (unableToQuery || !hasPlayerInfo) {
    status = 'starting'  // 监听但无法查询
  } else {
    status = 'running'   // 完全在线
  }
}
```

## 数据提取

### PID
```typescript
const pidMatch = statusOutput.match(/Server PID:\s*(\d+)/i)
const pid = pidMatch ? parseInt(pidMatch[1]) : undefined
```

### 玩家数量
```typescript
const steamPlayersMatch = statusOutput.match(/Steam Players:\s*(\d+)\s*\/\s*(\d+)/i)
if (steamPlayersMatch) {
  onlinePlayers = parseInt(steamPlayersMatch[1])  // 当前玩家
  maxPlayers = parseInt(steamPlayersMatch[2])      // 最大玩家
}
```

### 服务器名称和版本
```typescript
const serverNameMatch = statusOutput.match(/Server Name:\s*(.+?)\s*-\s*\(v([\d.]+)\)/i)
const serverName = serverNameMatch ? serverNameMatch[1].trim() : undefined
const version = serverNameMatch ? serverNameMatch[2] : undefined
```

## UI 显示

### 状态徽章颜色
- `running`: 绿色 (success)
- `stopped`: 红色 (destructive)
- `starting`: 黄色 (warning) + "Starting..."
- `stopping`: 黄色 (warning) + "Stopping..."

### 按钮状态
- **停止时**: 显示 "Start" 按钮
- **启动中**: 显示禁用的 "Starting..." 按钮（带旋转动画）
- **运行中**: 显示 "Stop" 和 "Restart" 按钮
- **停止中**: 显示禁用的 "Stopping..." 按钮（带旋转动画）

## 刷新频率

仪表板通过 Server-Sent Events (SSE) 每 5 秒更新一次服务器状态：

```typescript
// app/api/events/route.ts
const interval = setInterval(sendUpdate, 5000)  // 5秒更新
```

这确保了启动中的服务器能及时更新到运行中状态。

