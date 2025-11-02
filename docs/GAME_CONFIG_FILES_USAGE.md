# Game Config Files 使用说明

## 配置文件管理机制

根据 ark-server-tools 的设计，游戏配置文件采用**方式 B**进行管理：

### 文件保存位置

配置文件保存在 instances 目录下：
```
/etc/arkmanager/instances/
├── main.cfg                          # 实例配置文件
├── main.GameUserSettings.ini         # GameUserSettings 配置
├── main.Game.ini                     # Game 配置
└── bak/                              # 备份目录
    ├── main.GameUserSettings.ini.bak-2025-11-02T15-30-45
    └── main.Game.ini.bak-2025-11-02T16-20-30
```

### arkmanager 的工作流程

1. **启动服务器时**，arkmanager 会自动执行：
   ```bash
   # 如果 /etc/arkmanager/instances/main.GameUserSettings.ini 存在
   # 则复制到服务器目录，覆盖原文件
   cp /etc/arkmanager/instances/main.GameUserSettings.ini \
      /home/steam/ARK/ShooterGame/Saved/Config/LinuxServer/GameUserSettings.ini
   
   # 同样处理 Game.ini
   cp /etc/arkmanager/instances/main.Game.ini \
      /home/steam/ARK/ShooterGame/Saved/Config/LinuxServer/Game.ini
   ```

2. **服务器运行时**，使用服务器目录下的配置文件

3. **下次启动时**，再次从 instances 目录复制，确保配置同步

### 优势

✅ **配置隔离** - 每个实例的配置文件独立，不会冲突  
✅ **集中管理** - 所有实例配置都在 `/etc/arkmanager/instances/` 目录  
✅ **版本控制** - 可以轻松备份和恢复整个 instances 目录  
✅ **防止覆盖** - 服务器更新不会覆盖你的配置文件  

## 使用步骤

### 1. 访问配置页面

在浏览器中打开：
```
http://localhost:3000/config/<instance-name>
```

### 2. 切换到 Game Config Files 标签页

点击页面顶部的 **"Game Config Files"** 标签。

### 3. 编辑配置文件

**GameUserSettings.ini 示例：**
```ini
[ServerSettings]
DifficultyOffset=1.0
XPMultiplier=2.0
TamingSpeedMultiplier=3.0
HarvestAmountMultiplier=2.0
ResourcesRespawnPeriodMultiplier=0.5

[SessionSettings]
SessionName=我的 ARK 服务器
MaxPlayers=70
ServerPassword=
ServerAdminPassword=admin123

[/Script/ShooterGame.ShooterGameMode]
bDisableFriendlyFire=True
bPvEAllowStructuresAtSupplyDrops=True
```

**Game.ini 示例：**
```ini
[/Script/ShooterGame.ShooterGameMode]
ConfigOverrideItemMaxQuantity=(ItemClassString="PrimalItemResource_Polymer_Organic_C",Quantity=(MaxItemQuantity=100))

[/Script/Engine.GameSession]
MaxPlayers=100
```

### 4. 保存更改

点击 **"Save Changes"** 按钮，系统会：
- ✅ 自动备份原文件到 `instances/bak/` 目录
- ✅ 保存新配置到 `/etc/arkmanager/instances/<instance>.<filename>`
- ✅ 显示成功提示

### 5. 重启服务器

**重要：必须重启服务器，配置才会生效！**

通过 Web UI：
1. 返回服务器列表页面
2. 点击 **"Restart"** 按钮

或通过命令行：
```bash
arkmanager restart @<instance>
```

重启时，arkmanager 会自动将 instances 目录下的配置文件复制到服务器目录。

## 文件路径说明

| 文件类型 | instances 目录（源文件） | 服务器目录（运行时文件） |
|---------|----------------------|-------------------|
| GameUserSettings.ini | `/etc/arkmanager/instances/main.GameUserSettings.ini` | `/home/steam/ARK/ShooterGame/Saved/Config/LinuxServer/GameUserSettings.ini` |
| Game.ini | `/etc/arkmanager/instances/main.Game.ini` | `/home/steam/ARK/ShooterGame/Saved/Config/LinuxServer/Game.ini` |
| 备份文件 | `/etc/arkmanager/instances/bak/main.GameUserSettings.ini.bak-<timestamp>` | - |

**注意：** 
- ✏️ 编辑 instances 目录下的文件（Web UI 或手动编辑）
- 🚫 **不要**直接编辑服务器目录下的文件（会被覆盖）

## 功能特性

### 📝 在线编辑
- 直接在浏览器中编辑配置文件
- 等宽字体，适合编辑 INI 文件
- 实时保存，无需 SSH 登录

### 📤 文件上传
- 上传本地配置文件
- 支持 .ini 和文本文件
- 自动验证文件类型

### 📥 文件下载
- 下载当前配置到本地
- 文件名格式：`<instance>-GameUserSettings.ini`
- 方便备份和分享

### 💾 自动备份
- 每次保存/上传都自动备份
- 备份到 `/etc/arkmanager/instances/bak/` 目录
- 备份文件名包含时间戳，不会覆盖

## arkmanager 配置（可选）

默认情况下，arkmanager 会自动使用以下路径：
- `/etc/arkmanager/instances/<instance>.GameUserSettings.ini`
- `/etc/arkmanager/instances/<instance>.Game.ini`

**不需要**在实例配置文件中额外设置。

如果你想使用自定义路径，可以在 `/etc/arkmanager/instances/<instance>.cfg` 中添加：
```bash
arkGameUserSettingsIniFile="/custom/path/GameUserSettings.ini"
arkGameIniFile="/custom/path/Game.ini"
```

但**推荐使用默认路径**，这样更容易管理。

## 常见问题

### Q: 修改配置后服务器没有变化？
**A:** 确保已经重启服务器。arkmanager 只在启动时复制配置文件。

### Q: 可以直接编辑服务器目录下的文件吗？
**A:** 不推荐。服务器重启时会被 instances 目录下的文件覆盖。应该编辑 instances 目录下的文件。

### Q: 备份文件保存在哪里？
**A:** `/etc/arkmanager/instances/bak/` 目录。可以手动从这里恢复配置。

### Q: 如何恢复备份？
**A:** 
```bash
# 查看备份
ls -lht /etc/arkmanager/instances/bak/

# 恢复备份（替换时间戳）
cp /etc/arkmanager/instances/bak/main.GameUserSettings.ini.bak-2025-11-02T15-30-45 \
   /etc/arkmanager/instances/main.GameUserSettings.ini

# 重启服务器
arkmanager restart @main
```

### Q: 多个实例的配置会冲突吗？
**A:** 不会。每个实例的配置文件是独立的：
- `instance1.GameUserSettings.ini`
- `instance2.GameUserSettings.ini`

### Q: 配置文件的优先级是什么？
**A:** 
1. instances 目录下的文件（Web UI 管理）
2. 服务器目录下的文件（启动时被覆盖）
3. 命令行参数（arkmanager.cfg 中的 ark_ 参数，优先级最高）

推荐将详细游戏设置放在 GameUserSettings.ini，基础设置（端口等）放在 arkmanager.cfg。

## 配置示例

### 高倍率 PVE 服务器
```ini
[ServerSettings]
DifficultyOffset=1.0
XPMultiplier=5.0
TamingSpeedMultiplier=10.0
HarvestAmountMultiplier=5.0
ResourcesRespawnPeriodMultiplier=0.3

[SessionSettings]
ServerPVE=True

[/Script/ShooterGame.ShooterGameMode]
bDisableFriendlyFire=True
bPvEAllowStructuresAtSupplyDrops=True
```

### 快速驯服和繁殖
```ini
[ServerSettings]
TamingSpeedMultiplier=10.0
MatingIntervalMultiplier=0.1
BabyMatureSpeedMultiplier=10.0
EggHatchSpeedMultiplier=10.0
BabyFoodConsumptionSpeedMultiplier=2.0
```

### 延长白天时间
```ini
[ServerSettings]
DayTimeSpeedScale=0.5
NightTimeSpeedScale=2.0
```

## 最佳实践

1. ✅ **修改前下载备份** - 点击 Download 保存到本地
2. ✅ **小步修改** - 每次只改几个参数，容易排查问题
3. ✅ **重启生效** - 修改后必须重启服务器
4. ✅ **查看路径** - 确认文件保存在正确的位置
5. ✅ **定期清理备份** - 手动删除旧的备份文件

## 技术原理

### arkmanager 配置文件查找顺序

1. 检查实例配置中的 `arkGameUserSettingsIniFile` 设置
2. 如果未设置，使用默认路径：`<instance-config-path-without-extension>.GameUserSettings.ini`
3. 如果文件存在，复制到服务器目录
4. 如果文件不存在，使用服务器目录下的现有文件

### 文件复制时机

arkmanager 在以下时机复制配置文件：
- `arkmanager start` - 启动服务器
- `arkmanager restart` - 重启服务器
- 任何触发服务器启动的命令

### 为什么这样设计？

1. **防止更新覆盖** - 服务器更新不会影响你的配置
2. **便于管理** - 所有配置集中在一个目录
3. **支持多实例** - 每个实例独立配置
4. **版本控制友好** - 可以用 git 管理 instances 目录

## 参考资料

- [ark-server-tools 文档](../ark-server-tools-readme.asciidoc)
- [ARK Server Configuration (官方)](https://ark.fandom.com/wiki/Server_configuration)

---

**更新日期：** 2025-11-02  
**适用版本：** ARK Server Manager 1.0+

