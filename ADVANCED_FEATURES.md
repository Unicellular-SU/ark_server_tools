# 高级功能说明

## 1. 端口配置管理

### ⚠️ 重要：每个实例必须使用唯一端口

根据 ark-server-tools 文档：

> Each server instance must have its own set of ports.
> If the QueryPort or Port settings are shared between multiple instances, 
> then the server will often either crash or hang without being able to be queried.
> If the RCONPort setting is shared between multiple instances, 
> the server will hang at 0/0 players.

### 端口配置

每个服务器实例需要三个端口：

| 端口类型 | 默认值 | 协议 | 用途 |
|---------|-------|------|------|
| Port | 7778 | UDP | 游戏连接端口 |
| QueryPort | 27015 | UDP | Steam 查询端口 |
| RCONPort | 32330 | TCP | RCON 管理端口 |

### 多实例端口示例

```bash
# Instance 1: main
ark_Port="7778"
ark_QueryPort="27015"
ark_RCONPort="32330"

# Instance 2: ragnarok
ark_Port="7780"      # +2
ark_QueryPort="27017" # +2
ark_RCONPort="32332"  # +2

# Instance 3: valguero
ark_Port="7782"      # +2
ark_QueryPort="27019" # +2
ark_RCONPort="32334"  # +2
```

### Web UI 端口配置

配置页面现已包含端口设置：
1. 导航到 `/config/<instance>`
2. 在 **Gameplay** 标签中找到 "Port Configuration"
3. 设置唯一的端口号
4. 保存并重启服务器

### 端口冲突检测

系统会验证：
- 端口范围（1024-65535）
- 配置保存时的基本验证

**建议**：手动确保每个实例的端口不冲突。

---

## 2. 会话名称（SessionName）配置

### ⚠️ 特殊字符问题

根据文档：

> Your session name may not contain special characters (eg. `!![EU]!! Aw&some ARK`) 
> as it could break the startup command.
> In this case you may want to comment out the `ark_SessionName` variable and 
> define it inside your **GameUserSettings.ini** file instead.

### 建议做法

#### 方法 1：简单名称（推荐）
在 Web UI 或 `.cfg` 文件中设置：
```bash
ark_SessionName="My ARK Server"  # 无特殊字符
```

#### 方法 2：复杂名称（带特殊字符）
1. 在 `.cfg` 文件中注释掉 `ark_SessionName`：
   ```bash
   # ark_SessionName="..."  # 注释掉
   ```

2. 直接在 `GameUserSettings.ini` 中设置：
   ```ini
   [SessionSettings]
   SessionName=!![EU]!! Aw&some ARK
   ```

### Web UI 提示

配置页面现已添加警告提示：
- 检测到特殊字符时显示警告
- 建议避免使用特殊字符
- 或在 GameUserSettings.ini 中手动设置

---

## 3. Mod 管理功能

### 新增页面：`/mods`

完整的 Mod 管理功能：

#### 功能列表
- ✅ 列出已安装的 Mod
- ✅ 安装新 Mod（支持批量）
- ✅ 卸载 Mod
- ✅ 检查 Mod 更新
- ✅ 链接到 Steam Workshop

#### 使用流程

**步骤 1：安装 Mod**
```
1. 访问 /mods 页面
2. 选择服务器实例
3. 输入 Steam Workshop Mod ID（例如：731604991）
4. 点击 Install
5. 等待安装完成（可能需要几分钟）
```

**步骤 2：配置 Mod**
```
1. 访问 /config/<instance> 页面
2. 在 Gameplay 标签中
3. 找到 "Game Mod IDs" 字段
4. 输入已安装的 Mod ID（逗号分隔）
5. 保存配置
```

**步骤 3：重启服务器**
```
1. 返回 Dashboard 或 Servers 页面
2. 点击 Restart 按钮
3. 等待服务器启动
4. Mod 加载完成！
```

### arkmanager Mod 命令

| 操作 | 命令 | Web UI |
|-----|------|--------|
| 安装 Mod | `arkmanager installmod @main 731604991` | Install 按钮 |
| 卸载 Mod | `arkmanager uninstallmod @main 731604991` | Uninstall 按钮 |
| 列出 Mod | `arkmanager list-mods @main` | 自动显示 |
| 检查更新 | `arkmanager checkmodupdate @main` | Check Updates 按钮 |
| 安装所有 | `arkmanager installmods @main` | 批量安装 |

### Mod 类型

根据文档，支持三种 Mod 类型：

1. **Game Mod** (game) - 普通游戏 Mod
   ```bash
   ark_GameModIds="123456,789012"
   ```

2. **Map Mod** (map) - 地图 Mod
   ```bash
   ark_MapModId="123456"
   ```

3. **Total Conversion** (tc) - 完全转换 Mod
   ```bash
   ark_TotalConversionId="123456"
   ```

### Mod 配置示例

```bash
# /etc/arkmanager/instances/main.cfg

# 普通 Mod（多个用逗号分隔）
ark_GameModIds="731604991,839162288,895711211"

# 地图 Mod（仅一个）
# ark_MapModId="469987622"  # Ragnarok

# 完全转换 Mod（仅一个）
# ark_TotalConversionId="496735411"  # Survival of the Fittest
```

---

## 4. 自动更新和备份配置

### 新增配置选项

在配置页面的 **Gameplay** 标签中，现已添加：

#### Auto-Update & Backup 选项

```
☑ Auto-update on server start
  启用后，服务器启动时自动检查并安装更新
  对应: arkAutoUpdateOnStart="true"

☑ Backup before update
  启用后，更新前自动备份服务器数据
  对应: arkBackupPreUpdate="true"

☑ Always restart on crash
  启用后，服务器崩溃时自动重启（即使未就绪）
  对应: arkAlwaysRestartOnCrash="true"
```

### 配置文件映射

**.cfg 文件**：
```bash
# 自动更新配置
arkAutoUpdateOnStart="true"          # 启动时自动更新
arkBackupPreUpdate="true"            # 更新前自动备份
arkAlwaysRestartOnCrash="true"       # 崩溃时自动重启

# 备份目录（在 arkmanager.cfg 中配置）
arkbackupdir="/home/steam/ARK-Backups"
arkMaxBackupSizeMB="500"             # 限制备份大小
```

### 手动备份

通过 arkmanager 命令：
```bash
# 备份指定实例
arkmanager backup @main

# 备份目录位置
ls /home/steam/ARK-Backups/
```

### 恢复备份

```bash
# 恢复最新备份
arkmanager restore @main

# 恢复指定备份
arkmanager restore @main "/path/to/backup.tar.bz2"
```

---

## 5. 日志文件位置

### arkmanager 日志

根据文档，arkmanager 的日志文件位于：
```bash
/var/log/arktools/
```

日志文件示例：
```bash
/var/log/arktools/
├── main.log           # main 实例的日志
├── ragnarok.log       # ragnarok 实例的日志
└── arkmanager.log     # arkmanager 工具日志
```

### ARK 服务器日志

服务器游戏日志位于：
```bash
${arkserverroot}/ShooterGame/Saved/Logs/ShooterGame.log
```

例如：
```bash
/home/steam/ARK/ShooterGame/Saved/Logs/ShooterGame.log
```

### Web UI 日志查看

当前实现：
- 日志查看器读取服务器日志：`${arkserverroot}/ShooterGame/Saved/Logs/ShooterGame.log`
- 实时流式传输（SSE）
- 支持暂停/恢复/清空

### 查看不同类型日志

**服务器游戏日志**（已实现）：
```
访问: /logs
选择: 服务器实例
查看: 游戏事件、玩家连接、错误等
```

**arkmanager 工具日志**（可通过命令行）：
```bash
# 查看 arkmanager 操作日志
tail -f /var/log/arktools/main.log

# 查看所有 arkmanager 日志
tail -f /var/log/arktools/*.log
```

---

## 6. 集群配置详解

### 集群 ID 配置

每个参与集群的服务器需要：

```bash
# 在每个实例的 .cfg 文件中
ark_ClusterId="mycluster"                    # 所有服务器使用相同的 ID
ark_AltSaveDirectoryName="MyCluster"         # 可选，使用独立的保存目录
```

### 集群数据目录

在全局配置 `/etc/arkmanager/arkmanager.cfg` 中：
```bash
clusterdir="/home/steam/cluster"
```

或在实例配置中：
```bash
ark_ClusterDirOverride="/home/steam/cluster"
```

### Web UI 集群配置

访问 `/cluster` 页面：
1. 设置 Cluster ID（所有服务器相同）
2. 设置 Cluster Directory（共享目录）
3. 选择要加入集群的服务器
4. 可选：启用跨服聊天
5. 保存配置

---

## API 端点更新

### 新增 Mod 管理 API

```
GET    /api/mods/[instance]        - 列出已安装的 Mod
POST   /api/mods/[instance]        - 安装 Mod
DELETE /api/mods/[instance]        - 卸载 Mod
GET    /api/mods/[instance]/check  - 检查 Mod 更新
```

---

## 配置最佳实践

### 1. 新服务器配置清单

```bash
# /etc/arkmanager/instances/newserver.cfg

# 基础配置
arkserverroot="/home/steam/ARK"
serverMap="TheIsland"

# 唯一端口（重要！）
ark_Port="7780"          # 确保不与其他实例冲突
ark_QueryPort="27017"    # 确保不与其他实例冲突
ark_RCONPort="32332"     # 确保不与其他实例冲突

# RCON 配置
ark_RCONEnabled="True"
ark_ServerAdminPassword="strong-password-here"

# 服务器设置
ark_SessionName="Simple Server Name"  # 避免特殊字符
ark_MaxPlayers="70"
ark_ServerPassword=""

# 自动化
arkAutoUpdateOnStart="false"          # 生产环境建议 false
arkBackupPreUpdate="true"             # 建议启用
arkAlwaysRestartOnCrash="false"       # 谨慎使用

# Mod 配置（可选）
# ark_GameModIds="731604991,839162288"
```

### 2. 配置修改工作流

```
1. 通过 Web UI 修改配置
   ↓
2. 配置保存到 .cfg 文件（ark_ 参数）
   ↓
3. 查看提示："重启服务器以应用更改"
   ↓
4. 重启服务器（Web UI 或命令行）
   ↓
5. 配置生效！
```

### 3. 验证配置

```bash
# 1. 检查配置文件
cat /etc/arkmanager/instances/main.cfg

# 2. 检查端口设置
grep "ark_.*Port" /etc/arkmanager/instances/main.cfg

# 3. 检查端口冲突（手动）
grep -r "ark_Port=" /etc/arkmanager/instances/*.cfg
grep -r "ark_QueryPort=" /etc/arkmanager/instances/*.cfg
grep -r "ark_RCONPort=" /etc/arkmanager/instances/*.cfg

# 4. 启动后验证
arkmanager status @main
```

---

## 功能对照表

| 功能 | ark-server-tools 文档 | Web UI 实现 | 状态 |
|-----|----------------------|-----------|------|
| 端口配置 | 必须唯一 | ✅ Gameplay 标签中配置 | 已实现 |
| 会话名称 | 避免特殊字符 | ✅ 带警告提示 | 已实现 |
| Mod 安装 | installmod 命令 | ✅ /mods 页面 | 已实现 |
| 自动更新 | arkAutoUpdateOnStart | ✅ Gameplay 标签中配置 | 已实现 |
| 自动备份 | arkBackupPreUpdate | ✅ Gameplay 标签中配置 | 已实现 |
| 崩溃重启 | arkAlwaysRestartOnCrash | ✅ Gameplay 标签中配置 | 已实现 |
| 日志查看 | /var/log/arktools | ✅ /logs 页面 | 已实现 |
| 集群配置 | ClusterId | ✅ /cluster 页面 | 已实现 |

---

## 使用示例

### 示例 1：创建带 Mod 的新服务器

```bash
# 1. 创建实例配置
/etc/arkmanager/instances/modded.cfg:

arkserverroot="/home/steam/ARK"
serverMap="TheIsland"
ark_Port="7780"
ark_QueryPort="27017"
ark_RCONPort="32332"
ark_RCONEnabled="True"
ark_ServerAdminPassword="password"
ark_SessionName="Modded Server"
ark_MaxPlayers="50"
ark_GameModIds="731604991,839162288"  # Awesome Spyglass, Structures Plus

# 2. 通过 Web UI 安装 Mod
访问: /mods
选择: modded
输入: 731604991,839162288
点击: Install

# 3. 等待安装完成

# 4. 启动服务器
访问: /servers
点击: modded 的 Start 按钮

# 5. 验证
等待启动完成，Mod 应该已加载
```

### 示例 2：配置集群服务器

```bash
# 服务器 1: island
/etc/arkmanager/instances/island.cfg:
ark_ClusterId="mycluster"
ark_Port="7778"
ark_QueryPort="27015"
ark_RCONPort="32330"

# 服务器 2: ragnarok
/etc/arkmanager/instances/ragnarok.cfg:
ark_ClusterId="mycluster"        # 相同的 Cluster ID
ark_Port="7780"                  # 不同的端口
ark_QueryPort="27017"
ark_RCONPort="32332"

# 通过 Web UI:
访问: /cluster
设置: Cluster ID = "mycluster"
设置: Cluster Directory = "/home/steam/cluster"
选择: island, ragnarok
保存并重启两个服务器
```

---

## 文件位置汇总

| 文件类型 | 位置 | 用途 |
|---------|------|------|
| 全局配置 | `/etc/arkmanager/arkmanager.cfg` | arkmanager 全局设置 |
| 实例配置 | `/etc/arkmanager/instances/<instance>.cfg` | 实例特定设置（**Web UI 修改此文件**） |
| 服务器文件 | `${arkserverroot}/` | ARK 服务器安装目录 |
| 游戏配置 | `${arkserverroot}/ShooterGame/Saved/Config/LinuxServer/` | GameUserSettings.ini, Game.ini |
| 存档文件 | `${arkserverroot}/ShooterGame/Saved/SavedArks/` | 世界存档 |
| 日志文件 | `/var/log/arktools/` | arkmanager 日志 |
| 游戏日志 | `${arkserverroot}/ShooterGame/Saved/Logs/` | 服务器游戏日志 |
| 备份文件 | `/home/steam/ARK-Backups/` | 自动备份（可配置） |
| 集群数据 | `/home/steam/cluster/` | 跨服传送数据 |

---

## 生产环境建议配置

```bash
# /etc/arkmanager/instances/production.cfg

# 基础配置
arkserverroot="/home/steam/ARK"
serverMap="TheIsland"

# 端口（确保唯一）
ark_Port="7778"
ark_QueryPort="27015"
ark_RCONPort="32330"

# 安全
ark_RCONEnabled="True"
ark_ServerAdminPassword="strong-random-password"
ark_ServerPassword=""  # 或设置密码

# 服务器设置
ark_SessionName="Production Server"  # 简单名称
ark_MaxPlayers="70"

# 自动化（生产环境推荐）
arkAutoUpdateOnStart="false"         # 避免意外停机
arkBackupPreUpdate="true"            # 安全第一
arkAlwaysRestartOnCrash="false"      # 避免循环崩溃

# 性能优化
ark_DifficultyOffset="0.5"
ark_XPMultiplier="1.0"
ark_TamingSpeedMultiplier="1.0"
ark_HarvestAmountMultiplier="1.0"

# 游戏规则
ark_ServerPVE="True"                 # PVE 模式
ark_AllowThirdPersonPlayer="True"
ark_ShowMapPlayerLocation="True"

# Mod 配置（根据需要）
# ark_GameModIds="731604991"
```

所有高级功能现已实现并文档化！

