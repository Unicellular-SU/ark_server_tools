# 验证清单 - ARK Server Manager

## 🔍 配置更新功能验证

### 测试场景：修改最大玩家数

#### 步骤 1：准备
```bash
# 查看当前配置
cat /etc/arkmanager/instances/main.cfg | grep MaxPlayers
# 输出示例: ark_MaxPlayers="70"

# 查看当前服务器状态
arkmanager status @main
# 记录当前玩家数上限
```

#### 步骤 2：通过 Web UI 修改
1. 访问 `http://localhost:3000/config/main`
2. 在 **Basic Settings** 标签中
3. 修改 **Max Players** 从 70 改为 8
4. 点击 **Save Configuration** 按钮
5. 应该看到提示：
   ```
   ✅ Success
   Configuration saved successfully. Restart the server for changes to take effect.
   ```

#### 步骤 3：验证文件已更新
```bash
cat /etc/arkmanager/instances/main.cfg | grep MaxPlayers
# 应该显示: ark_MaxPlayers="8"  ✅
```

#### 步骤 4：重启服务器
通过 Web UI：
1. 返回 Dashboard 或 Servers 页面
2. 点击 **Restart** 按钮
3. 确认对话框点击确认
4. 观察状态变化：Running → Stopping → Starting → Running

或通过命令行：
```bash
arkmanager restart @main
```

#### 步骤 5：等待启动完成
- 状态从 "Starting..." 变为 "Running"（约 30-60 秒）
- 可以在 Dashboard 查看实时状态更新

#### 步骤 6：验证配置已生效
```bash
arkmanager status @main
```

**期望输出**：
```
Running command 'status' for instance 'main'

 Server running:   Yes 
 Server PID:   673159 
 Server listening:   Yes 
Server Name: 8233 8233 - (v360.35)
Steam Players: 0 / 8  ← 应该显示 8，不是 70！
Active Steam Players: 0
 Server online:   No 
 Server build ID:   20411757
```

✅ **如果显示 "Steam Players: 0 / 8"，配置更新成功！**

---

## 🔍 服务器状态显示验证

### 测试 1：停止状态
```bash
arkmanager stop @main
```

**Web UI 应该显示**：
- 🔴 Badge: "Stopped"（红色）
- 按钮: 仅显示 "Start"

### 测试 2：启动过程
```bash
arkmanager start @main
```

**立即刷新 Web UI，应该经历以下状态变化**：

1. **阶段 1**（0-10 秒）：
   - 🟡 Badge: "Starting..."（黄色）
   - 按钮: 禁用的 "Starting..."（旋转图标）
   - arkmanager: `Server running: Yes, Server listening: No`

2. **阶段 2**（10-30 秒）：
   - 🟡 Badge: "Starting..."（黄色）
   - 按钮: 禁用的 "Starting..."（旋转图标）
   - arkmanager: `Server running: Yes, Server listening: Yes, Unable to query`

3. **完全启动**（30-60 秒后）：
   - 🟢 Badge: "Running"（绿色）
   - 按钮: "Stop" 和 "Restart"
   - arkmanager: 显示 `Steam Players: 0 / X`

### 测试 3：运行中有玩家
当有玩家在线时：
```
Steam Players: 1 / 8
```

**Web UI 应该显示**：
- Players: 1/8
- Player List 组件显示玩家名称

---

## 🔍 API 数据格式验证

### 测试：服务器列表 API
```bash
curl http://localhost:3000/api/servers
```

**期望输出**（JSON 格式化）：
```json
{
  "success": true,
  "data": [
    {
      "name": "main",
      "status": "running",
      "map": "TheIsland",         ← 无注释
      "port": 27030,
      "queryPort": 27015,
      "rconPort": 32330,
      "rconPassword": "keyboardcat",  ← 无注释
      "onlinePlayers": 0,
      "maxPlayers": 8,            ← 如果之前改为8
      "pid": 673159,
      "serverName": "8233 8233",
      "version": "360.35"
    }
  ]
}
```

✅ **检查点**：
- `map` 字段：应该是 "TheIsland"，不包含注释
- `rconPassword` 字段：应该是 "keyboardcat"，不包含注释
- `maxPlayers` 字段：应该反映配置文件中的值

---

## 🔍 配置读取验证

### 测试：读取配置 API
```bash
curl http://localhost:3000/api/servers/main/config
```

**期望输出**：
```json
{
  "success": true,
  "data": {
    "SessionName": "我的 ARK 服务器",
    "MaxPlayers": 8,
    "ServerPassword": "",
    "ServerAdminPassword": "keyboardcat",
    "RCONEnabled": true,
    "RCONPort": 32330,
    "Port": 7778,
    "QueryPort": 27015,
    "DifficultyOffset": 0.5,
    "XPMultiplier": 1,
    "TamingSpeedMultiplier": 1,
    "HarvestAmountMultiplier": 1
  }
}
```

✅ **检查点**：
- 所有值都是干净的（无引号、无注释）
- 数字类型正确（8 不是 "8"）
- 布尔类型正确（true 不是 "True"）

---

## 🔍 RCON 功能验证

### 前提条件
- 服务器状态必须是 "Running"（不是 "Starting"）
- RCON 已启用：`ark_RCONEnabled="True"`
- RCON 密码已设置：`ark_ServerAdminPassword`

### 测试：广播消息
1. 访问 `/rcon` 页面
2. 选择运行中的服务器
3. 点击 "Broadcast" 按钮
4. 输入消息："测试广播"
5. 点击 Send

**期望结果**：
- Terminal 显示执行的命令和响应
- 如果有玩家在线，他们应该收到消息

### 测试：列出玩家
1. 点击 "List Players" 快捷按钮
2. Terminal 显示玩家列表（如果有）

---

## 🔍 日志查看器验证

### 测试：实时日志
1. 访问 `/logs` 页面
2. 选择一个服务器实例
3. 日志应该开始显示

**期望行为**：
- ✅ 自动滚动到最新日志
- ✅ 时间戳显示
- ✅ 日志内容实时更新（每 2 秒）

### 测试：暂停/恢复
1. 点击 "Pause" 按钮
2. 日志停止更新
3. 显示黄色提示："Log streaming is paused"
4. 点击 "Resume"
5. 日志继续更新

---

## 🔍 SSE 实时更新验证

### 测试：Dashboard 实时更新
1. 打开 Dashboard
2. 在另一个终端执行：
   ```bash
   arkmanager stop @main
   ```
3. 观察 Dashboard

**期望行为**：
- 5 秒内，服务器状态应从 "Running" 变为 "Stopped"
- 无需手动刷新页面

### 测试：启动过程实时监控
1. Dashboard 中点击 "Start"
2. 观察状态变化（无需刷新）

**期望状态流转**：
```
Stopped → Starting... → Starting... → Running
（0秒）   （5秒）        （30秒）      （60秒）
```

---

## 📋 完整功能检查清单

### 基础功能
- [ ] Dashboard 显示所有服务器
- [ ] 服务器状态正确（stopped/starting/running）
- [ ] 启动/停止/重启功能正常
- [ ] 确认对话框正常工作
- [ ] Toast 通知正常显示

### 配置管理
- [ ] 读取配置显示正确（无注释）
- [ ] 修改配置后保存成功
- [ ] 配置文件 .cfg 已更新
- [ ] 重启后配置生效
- [ ] 显示重启提示

### 状态监控
- [ ] 状态实时更新（SSE）
- [ ] CPU/内存显示正确
- [ ] 玩家数量正确
- [ ] Starting 状态正常显示
- [ ] 过渡状态按钮禁用

### RCON 功能
- [ ] 服务器选择正常
- [ ] 命令执行成功
- [ ] 快捷命令工作
- [ ] Terminal 显示正确
- [ ] 命令历史保存

### 日志功能
- [ ] 日志实时显示
- [ ] 暂停/恢复功能
- [ ] 清空功能
- [ ] 自动滚动

### 集群配置
- [ ] 读取配置正常
- [ ] 保存配置成功
- [ ] 服务器选择功能

---

## 🎯 关键验证点

### ✅ 配置文件正确性
```bash
# 检查配置文件格式
cat /etc/arkmanager/instances/main.cfg

# 应该看到干净的 ark_ 参数，例如：
ark_MaxPlayers="8"                               # Maximum players
ark_SessionName="My Server"
ark_RCONEnabled="True"                            # Enable RCON Protocol
```

### ✅ API 返回数据正确性
```bash
# 服务器列表
curl http://localhost:3000/api/servers | jq

# 配置数据
curl http://localhost:3000/api/servers/main/config | jq

# 检查：
# - map 值无注释
# - rconPassword 值无注释
# - 数字类型正确
```

### ✅ 状态显示准确性
```bash
# 停止服务器
arkmanager stop @main

# Web UI 应该显示 "Stopped"（5秒内）

# 启动服务器
arkmanager start @main

# Web UI 应该显示状态变化：
# Stopped → Starting... → Running
```

### ✅ 配置更新生效
```bash
# 1. 通过 Web UI 修改 MaxPlayers = 8
# 2. 验证文件
cat /etc/arkmanager/instances/main.cfg | grep MaxPlayers
# 应该: ark_MaxPlayers="8"

# 3. 重启
arkmanager restart @main

# 4. 等待启动完成

# 5. 验证
arkmanager status @main | grep "Steam Players"
# 应该: Steam Players: 0 / 8
```

---

## ✅ 全部通过表示系统正常工作

如果所有验证点都通过，说明：
1. ✅ arkmanager 集成正常
2. ✅ 配置管理正常
3. ✅ 状态监控准确
4. ✅ 实时更新工作
5. ✅ RCON 功能正常
6. ✅ 所有 API 正常

系统可以投入生产使用！🎉

