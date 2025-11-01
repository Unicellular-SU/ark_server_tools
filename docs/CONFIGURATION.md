# ARK Server Manager 配置指南

## 环境变量配置

创建 `.env` 文件：

```bash
ARK_TOOLS_PATH=arkmanager
ARK_SERVERS_PATH=/home/steam/ARK
ARK_INSTANCE_CONFIG_DIR=/etc/arkmanager/instances
CLUSTER_DATA_PATH=/home/steam/cluster
PORT=3000
```

## ark-server-tools 集成

### 1. 安装 ark-server-tools
```bash
curl -sL https://raw.githubusercontent.com/arkmanager/ark-server-tools/master/netinstall.sh | sudo bash -s steam
```

### 2. 创建实例配置

文件：`/etc/arkmanager/instances/main.cfg`

```bash
# 服务器路径
arkserverroot="/home/steam/ARK"
serverMap="TheIsland"

# 端口配置（每个实例必须唯一！）
ark_Port="7778"
ark_QueryPort="27015"
ark_RCONPort="32330"

# RCON 配置
ark_RCONEnabled="True"
ark_ServerAdminPassword="your-password"

# 服务器设置
ark_SessionName="My ARK Server"
ark_MaxPlayers="70"
ark_ServerPassword=""

# 游戏设置
ark_DifficultyOffset="0.5"
ark_XPMultiplier="1.0"
ark_TamingSpeedMultiplier="1.0"
ark_HarvestAmountMultiplier="1.0"

# 自动化（可选）
arkAutoUpdateOnStart="false"
arkBackupPreUpdate="true"
arkAlwaysRestartOnCrash="false"

# Mod 配置（可选）
# ark_GameModIds="731604991,839162288"
```

## 配置更新工作流

### ⚠️ 重要：配置修改后必须重启服务器

**正确流程**：
1. Web UI 修改配置
2. 配置保存到 `/etc/arkmanager/instances/<instance>.cfg`
3. **重启服务器**（配置才会生效）
4. 验证配置

**为什么需要重启？**
- arkmanager 在启动服务器时读取 .cfg 文件
- 将 `ark_` 参数转换为启动命令行参数
- 运行中的服务器不会自动重新加载配置

### 验证配置
```bash
# 检查配置文件
cat /etc/arkmanager/instances/main.cfg | grep MaxPlayers

# 重启后验证
arkmanager status @main
# 应该显示新的配置值
```

## 多实例端口配置

### ⚠️ 每个实例必须使用唯一端口

**错误示例**（会导致崩溃）：
```bash
# Instance 1
ark_Port="7778"
ark_QueryPort="27015"

# Instance 2 - ❌ 端口冲突！
ark_Port="7778"      # 与 Instance 1 相同
ark_QueryPort="27015" # 与 Instance 1 相同
```

**正确示例**：
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

## 集群配置

对于多服互通：

```bash
# 在每个实例的 .cfg 文件中添加相同的 Cluster ID
ark_ClusterId="mycluster"
ark_AltSaveDirectoryName="MyCluster"

# 在全局配置 /etc/arkmanager/arkmanager.cfg 中
clusterdir="/home/steam/cluster"
```

## Mod 管理

### 安装 Mod

**方法 1：通过 Web UI**
1. 访问 `/mods` 页面
2. 输入 Steam Workshop Mod ID
3. 点击 Install

**方法 2：通过命令行**
```bash
arkmanager installmod @main 731604991
```

### 配置 Mod

在 `/config/<instance>` → Gameplay 标签中：
```
Game Mod IDs: 731604991,839162288,895711211
```

或在 .cfg 文件中：
```bash
ark_GameModIds="731604991,839162288,895711211"
```

### Mod 类型

- **Game Mod**: `ark_GameModIds`
- **Map Mod**: `ark_MapModId`
- **Total Conversion**: `ark_TotalConversionId`

## 常见问题

### Q: 配置修改后不生效？
**A**: 必须重启服务器。配置保存到 .cfg 文件，重启时才会应用。

### Q: 端口冲突导致服务器崩溃？
**A**: 确保每个实例使用唯一的 Port, QueryPort, RCONPort。

### Q: 会话名称包含特殊字符？
**A**: 避免在 .cfg 中设置，直接在 GameUserSettings.ini 中定义。

### Q: Mod 不生效？
**A**: 
1. 确认 Mod 已安装（/mods 页面）
2. 确认 Mod ID 已添加到配置（Game Mod IDs）
3. 重启服务器

### Q: 如何找到 Mod ID？
**A**: Steam Workshop 页面 URL：`steamcommunity.com/sharedfiles/filedetails/?id=MODID`

## arkmanager 常用命令

```bash
# 服务器管理
arkmanager start @main
arkmanager stop @main
arkmanager restart @main
arkmanager status @main

# 安装和更新
arkmanager install @main
arkmanager update @main
arkmanager checkupdate @main

# Mod 管理
arkmanager installmod @main 731604991
arkmanager uninstallmod @main 731604991
arkmanager checkmodupdate @main

# RCON 命令
arkmanager broadcast @main "消息"
arkmanager saveworld @main
arkmanager rconcmd @main "命令"

# 备份
arkmanager backup @main

# 列出实例
arkmanager list-instances
```

## 参考资源

- [ark-server-tools GitHub](https://github.com/arkmanager/ark-server-tools)
- [ARK 官方 Wiki](https://ark.wiki.gg/)
- [Steam Workshop](https://steamcommunity.com/app/346110/workshop/)

