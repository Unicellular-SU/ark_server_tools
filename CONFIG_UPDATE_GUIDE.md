# ARK 服务器配置更新指南

## 问题：配置修改后不生效

### 原因分析

根据 ark-server-tools 文档，服务器配置有两种方式：

#### 方式 1：实例配置文件 `.cfg`（推荐）
位置：`/etc/arkmanager/instances/<instance>.cfg`

```bash
# 在 .cfg 文件中使用 ark_ 前缀的参数
ark_SessionName="My ARK server"
ark_MaxPlayers=50
ark_ServerPVE=False
ark_DifficultyOffset=1
```

**工作原理**：
- arkmanager 在启动服务器时读取这些参数
- 将它们转换为命令行参数传递给服务器
- **每次启动都会应用这些配置**

#### 方式 2：GameUserSettings.ini 覆盖文件
位置：`/etc/arkmanager/instances/<instance>.GameUserSettings.ini`

文档说明：
```
arkGameUserSettingsIniFile::
    Set to the path to an ini file that, if it exists, will overwrite 
    ${arkserverroot}/ShooterGame/Saved/Config/LinuxServer/GameUserSettings.ini on startup
```

**工作原理**：
- 在 .cfg 中设置 `arkGameUserSettingsIniFile="/path/to/custom/GameUserSettings.ini"`
- arkmanager 在启动时会用这个文件覆盖服务器目录下的配置
- **每次启动都会覆盖**

### 之前的实现问题

❌ **错误做法**：直接修改服务器目录下的 `GameUserSettings.ini`
```
${arkserverroot}/ShooterGame/Saved/Config/LinuxServer/GameUserSettings.ini
```

**为什么不生效？**
- arkmanager 启动服务器时，会从 .cfg 文件中的 `ark_` 参数重新生成配置
- 或者用 `arkGameUserSettingsIniFile` 指定的文件覆盖
- 所以直接修改服务器目录下的文件会被覆盖

### 正确的实现

✅ **正确做法**：修改实例配置文件 `.cfg`

现在的实现：
1. 读取配置：从 `/etc/arkmanager/instances/<instance>.cfg` 读取 `ark_` 参数
2. 修改配置：更新 `.cfg` 文件中的 `ark_` 参数
3. 应用配置：重启服务器

## 配置更新流程

### 前端操作
1. 打开配置页面 `/config/main`
2. 修改设置（如最大玩家数 → 8）
3. 点击"保存配置"
4. 系统提示："配置已保存，重启服务器以应用更改"

### 后端处理
```typescript
// 1. 读取当前 .cfg 文件
const config = await readInstanceConfigFile('/etc/arkmanager/instances/main.cfg')

// 2. 更新配置值
config.MaxPlayers = 8

// 3. 写回 .cfg 文件（更新 ark_MaxPlayers=8）
await writeInstanceConfigFile('/etc/arkmanager/instances/main.cfg', config)
```

### 配置文件变化
```diff
# /etc/arkmanager/instances/main.cfg

arkserverroot="/home/steam/ARK"
serverMap="TheIsland"
- ark_MaxPlayers="70"
+ ark_MaxPlayers="8"
ark_RCONEnabled="True"
```

### 应用配置
```bash
# 重启服务器以应用新配置
arkmanager restart @main
```

## 配置项映射

### Web UI 配置 → .cfg 文件参数

| Web UI 字段 | .cfg 参数 | 示例值 |
|------------|----------|--------|
| Session Name | `ark_SessionName` | `"My Server"` |
| Max Players | `ark_MaxPlayers` | `8` |
| Server Password | `ark_ServerPassword` | `"mypass"` |
| Admin Password | `ark_ServerAdminPassword` | `"adminpass"` |
| Difficulty Offset | `ark_DifficultyOffset` | `0.5` |
| XP Multiplier | `ark_XPMultiplier` | `2.0` |
| Taming Speed | `ark_TamingSpeedMultiplier` | `5.0` |
| Harvest Amount | `ark_HarvestAmountMultiplier` | `3.0` |
| Resource Respawn | `ark_ResourcesRespawnPeriodMultiplier` | `0.5` |
| Third Person | `ark_AllowThirdPersonPlayer` | `True` |
| Show Map Location | `ark_ShowMapPlayerLocation` | `True` |
| PVE Mode | `ark_ServerPVE` | `True` |
| Cluster ID | `ark_ClusterId` | `"mycluster"` |

## 完整示例

### 修改最大玩家数为 8

#### 1. Web UI 操作
```
导航到: /config/main
修改: Max Players = 8
点击: Save Configuration
```

#### 2. API 调用
```http
POST /api/servers/main/config
Content-Type: application/json

{
  "MaxPlayers": 8,
  "SessionName": "My ARK Server",
  "ServerAdminPassword": "mypassword",
  ...
}
```

#### 3. 文件更新
`/etc/arkmanager/instances/main.cfg` 变化：
```diff
- ark_MaxPlayers="70"
+ ark_MaxPlayers="8"
```

#### 4. 重启服务器
```bash
# 通过 Web UI 点击 Restart
# 或手动执行
arkmanager restart @main
```

#### 5. 验证
```bash
# 检查配置文件
cat /etc/arkmanager/instances/main.cfg | grep MaxPlayers

# 输出应该是：
ark_MaxPlayers="8"

# 启动后检查服务器
arkmanager status @main

# 应该显示：
Steam Players: 0 / 8  ← 最大玩家数已更新
```

## 注意事项

### ⚠️ 配置生效时机
- 配置保存后**不会立即生效**
- 必须**重启服务器**才能应用新配置
- Web UI 会提示："重启服务器以应用更改"

### ⚠️ 不要直接编辑 GameUserSettings.ini
- 服务器目录下的配置文件会被 arkmanager 覆盖
- 始终通过 Web UI 或编辑 `.cfg` 文件
- 特殊字符的会话名称可以直接在 GameUserSettings.ini 中定义

### ⚠️ 配置冲突
如果同时在 `.cfg` 和 `GameUserSettings.ini` 中定义了相同参数：
- `.cfg` 文件中的 `ark_` 参数优先
- 启动时会覆盖 ini 文件中的值

## 代码更新说明

### 修改的文件

1. **lib/config-manager.ts**
   - ✅ 新增 `readInstanceConfigFile()` - 从 .cfg 读取配置
   - ✅ 新增 `writeInstanceConfigFile()` - 写入 .cfg 文件
   - ✅ 保留原有方法用于兼容性

2. **app/api/servers/[instance]/config/route.ts**
   - ✅ GET: 从 .cfg 文件读取配置
   - ✅ POST: 写入 .cfg 文件
   - ✅ 返回提示消息要求重启

### 新功能

1. **保留文件结构**
   - 只更新修改的参数
   - 保留注释和空行
   - 保留其他非配置行

2. **智能参数处理**
   - 自动添加引号（字符串）
   - 正确处理布尔值（True/False）
   - 正确处理数字

3. **用户提示**
   - 保存后提示需要重启
   - 重启后配置才生效

## 测试流程

```bash
# 1. 修改配置
curl -X POST http://localhost:3000/api/servers/main/config \
  -H "Content-Type: application/json" \
  -d '{"MaxPlayers": 8}'

# 2. 验证文件已更新
cat /etc/arkmanager/instances/main.cfg | grep MaxPlayers
# 应该显示: ark_MaxPlayers="8"

# 3. 重启服务器
curl -X PUT http://localhost:3000/api/servers/main

# 4. 等待启动完成（30-60秒）
# 5. 检查状态
arkmanager status @main
# 应该显示: Steam Players: 0 / 8
```

现在配置修改会正确保存并在重启后生效！

