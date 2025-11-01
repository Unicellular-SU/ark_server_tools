# ARK Server Manager Configuration Guide

本指南基于 [ark-server-tools](https://github.com/arkmanager/ark-server-tools) 官方文档。

## 环境变量配置

在项目根目录创建 `.env` 文件：

```bash
# ARK Server Tools 路径配置
ARK_TOOLS_PATH=arkmanager
ARK_SERVERS_PATH=/home/steam/ARK
ARK_INSTANCE_CONFIG_DIR=/etc/arkmanager/instances

# 集群数据目录
CLUSTER_DATA_PATH=/home/steam/cluster

# 应用配置
NODE_ENV=production
PORT=3000
```

## ark-server-tools 集成要点

### 1. 实例配置文件位置

根据文档，实例配置文件应位于：
- `/etc/arkmanager/instances/<instancename>.cfg`
- 或通过 `configfile_<instancename>` 在全局配置中指定

### 2. 默认端口号

根据 ark-server-tools 配置示例：

```bash
# 默认端口配置（与项目已同步）
ark_Port="7778"              # 游戏端口（UDP）
ark_QueryPort="27015"        # 查询端口（UDP）
ark_RCONPort="32330"         # RCON 端口（TCP）
```

**注意**：之前硬编码的 RCON 端口 27020 已修正为 32330

### 3. 服务器配置文件路径

配置文件位于：
```
${arkserverroot}/ShooterGame/Saved/Config/LinuxServer/
├── GameUserSettings.ini
└── Game.ini
```

其中 `arkserverroot` 从实例配置文件中读取。

### 4. arkmanager 命令使用

项目现在正确使用以下命令：

```bash
# 实例管理
arkmanager start @<instance>
arkmanager stop @<instance>
arkmanager restart @<instance>
arkmanager status @<instance>

# 安装和更新
arkmanager install @<instance>
arkmanager update @<instance>
arkmanager checkupdate @<instance>

# RCON 命令
arkmanager broadcast @<instance> "消息"
arkmanager saveworld @<instance>
arkmanager rconcmd @<instance> "RCON命令"

# 实例列表
arkmanager list-instances --brief

# 备份
arkmanager backup @<instance>
```

### 5. 实例配置示例

创建 `/etc/arkmanager/instances/main.cfg`：

```bash
# 服务器路径
arkserverroot="/home/steam/ARK"

# 地图设置
serverMap="TheIsland"

# RCON 配置
ark_RCONEnabled="True"
ark_RCONPort="32330"
ark_ServerAdminPassword="your-admin-password"

# 服务器设置
ark_SessionName="我的 ARK 服务器"
ark_Port="7778"
ark_QueryPort="27015"
ark_ServerPassword=""
ark_MaxPlayers="70"

# 游戏设置
ark_DifficultyOffset="0.5"
ark_XPMultiplier="1.0"
ark_TamingSpeedMultiplier="1.0"
ark_HarvestAmountMultiplier="1.0"

# 可选：MOD 配置
# ark_GameModIds="123456,789012"
```

**重要**：
- 所有 ARK 服务器参数必须使用 `ark_` 前缀
- 通过 Web UI 修改的配置会更新此文件中的 `ark_` 参数
- 修改后必须重启服务器才能生效
- 不要直接修改 `${arkserverroot}/ShooterGame/Saved/Config/LinuxServer/GameUserSettings.ini`，它会被覆盖

详细说明请参考 [CONFIG_UPDATE_GUIDE.md](CONFIG_UPDATE_GUIDE.md)

### 6. 集群配置

对于多服互通，在每个实例配置中添加：

```bash
# 集群 ID（所有互通服务器必须相同）
ark_ClusterId="mycluster"

# 集群数据目录
ark_AltSaveDirectoryName="MyCluster"
```

并在全局配置 `/etc/arkmanager/arkmanager.cfg` 中设置：

```bash
# 集群数据目录
clusterdir="/home/steam/cluster"
```

## 代码更新说明

### 修正的问题

1. **✅ RCON 端口**: 从 27020 改为 32330（符合 ark-server-tools 默认值）
2. **✅ 服务器端口**: 默认从 7777 改为 7778
3. **✅ 配置文件读取**: 现在从 `/etc/arkmanager/instances/` 读取实例配置
4. **✅ 命令格式**: 
   - 广播命令从 `rconcmd ... "broadcast ..."` 改为 `broadcast @instance "..."`
   - 保存世界从 `rconcmd ... "saveworld"` 改为 `saveworld @instance`
5. **✅ 状态解析**: 现在使用 `list-instances --brief` 获取实例列表
6. **✅ 环境变量**: 支持通过环境变量配置路径

### 新增功能

1. **实例配置读取**: `readInstanceConfig()` - 从 .cfg 文件读取实例配置
2. **RCON 命令执行**: `executeRconCommand()` - 通过 arkmanager 执行 RCON 命令
3. **实例列表**: `listAvailableInstances()` - 获取所有可用实例
4. **备份功能**: `backupServer()` - 备份服务器实例

## 部署前检查清单

- [ ] 确认 ark-server-tools 已安装：`which arkmanager`
- [ ] 确认至少有一个实例配置文件在 `/etc/arkmanager/instances/`
- [ ] 测试 arkmanager 命令：`arkmanager status`
- [ ] 配置正确的环境变量（.env 文件）
- [ ] 确认文件权限（steamcmd 用户需要访问权限）
- [ ] 测试 RCON 连接（确保 RCON 已启用且密码正确）

## 常见问题

### Q: Web 界面无法连接到服务器？
A: 检查：
1. arkmanager 是否在 PATH 中
2. 实例配置文件是否存在
3. 环境变量 `ARK_INSTANCE_CONFIG_DIR` 是否正确

### Q: RCON 命令失败？
A: 确认：
1. 服务器配置中 `ark_RCONEnabled="True"`
2. RCON 端口正确（默认 32330）
3. `ark_ServerAdminPassword` 已设置

### Q: 找不到服务器实例？
A: 运行 `arkmanager list-instances` 查看可用实例

### Q: 配置修改后不生效？
A: 确认：
1. 检查 `/etc/arkmanager/instances/<instance>.cfg` 文件是否已更新
2. 修改后必须重启服务器：`arkmanager restart @instance`
3. Web UI 会提示"重启服务器以应用更改"
4. 不要直接编辑 GameUserSettings.ini，它会被覆盖

详见 [CONFIG_UPDATE_GUIDE.md](CONFIG_UPDATE_GUIDE.md)

## 参考资源

- [ark-server-tools GitHub](https://github.com/arkmanager/ark-server-tools)
- [ark-server-tools Wiki](https://github.com/arkmanager/ark-server-tools/wiki)
- [ARK Server 官方文档](https://ark.wiki.gg/wiki/Dedicated_server_setup)

