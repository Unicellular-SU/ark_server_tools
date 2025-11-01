# 新增功能 - v1.0

根据 ark-server-tools 官方文档，新增以下高级功能：

## 🎯 1. 端口配置管理

### 问题
> 每个服务器实例必须使用唯一的端口组合。共享端口会导致服务器崩溃或卡在 0/0 玩家。

### 实现
- ✅ **位置**：Configuration → Gameplay → Port Configuration
- ✅ **功能**：
  - 配置游戏端口 (Port)
  - 配置查询端口 (QueryPort)
  - 配置 RCON 端口 (RCONPort)
  - 端口范围验证（1024-65535）
  - 显著警告提示端口必须唯一

### 使用
```
1. 访问 /config/<instance>
2. 点击 Gameplay 标签
3. 在 "Port Configuration" 部分设置端口
4. 系统会验证端口范围
5. 保存并重启服务器
```

### 建议端口配置
```bash
# 实例 1
Port=7778, QueryPort=27015, RCONPort=32330

# 实例 2 (+2)
Port=7780, QueryPort=27017, RCONPort=32332

# 实例 3 (+2)
Port=7782, QueryPort=27019, RCONPort=32334
```

---

## 🏷️ 2. 会话名称特殊字符处理

### 问题
> 会话名称不能包含特殊字符（如 !![EU]!! Aw&some ARK），否则会破坏启动命令。建议在 GameUserSettings.ini 中定义。

### 实现
- ✅ **位置**：Configuration → Basic Settings → Server Name
- ✅ **功能**：
  - 特殊字符检测
  - 黄色警告提示框
  - 配置验证（拒绝特殊字符）
  - 建议使用简单名称或在 GameUserSettings.ini 中手动设置

### 使用
```
1. 访问 /config/<instance>
2. 在 Basic Settings 中看到警告提示
3. 输入简单名称（无特殊字符）
4. 或留空，手动在 GameUserSettings.ini 中设置复杂名称
```

---

## 🧩 3. Mod 管理功能

### 新页面：`/mods`

### 功能
- ✅ 安装 Steam Workshop Mod
- ✅ 批量安装（逗号分隔多个 ID）
- ✅ 卸载 Mod
- ✅ 检查 Mod 更新
- ✅ 列出已安装 Mod
- ✅ 链接到 Steam Workshop 页面

### arkmanager 命令集成
```bash
arkmanager installmod @instance 731604991
arkmanager uninstallmod @instance 731604991
arkmanager list-mods @instance
arkmanager checkmodupdate @instance
arkmanager installmods @instance  # 安装所有配置的 mod
```

### 完整使用流程

**步骤 1：安装 Mod**
```
页面: /mods
操作: 输入 Mod ID (如 731604991)
点击: Install
等待: 下载完成（可能需要几分钟）
```

**步骤 2：配置 Mod**
```
页面: /config/<instance>
标签: Gameplay
字段: Game Mod IDs
输入: 731604991,839162288 (逗号分隔)
保存: 配置
```

**步骤 3：重启服务器**
```
页面: /servers
操作: 点击 Restart
等待: 服务器启动
结果: Mod 加载完成！
```

### API 端点
- `GET /api/mods/[instance]` - 列出 Mod
- `POST /api/mods/[instance]` - 安装 Mod
- `DELETE /api/mods/[instance]` - 卸载 Mod
- `GET /api/mods/[instance]/check` - 检查更新

### 新增库文件
- `lib/mod-manager.ts` - Mod 管理器
- `app/mods/page.tsx` - Mod 管理页面

---

## 🔄 4. 自动更新和备份配置

### 新增配置选项

**位置**：Configuration → Gameplay → Auto-Update & Backup

### 三个新选项

#### ☑ Auto-update on server start
- 对应：`arkAutoUpdateOnStart="true"`
- 功能：服务器启动时自动检查并安装更新
- 建议：生产环境设为 false（避免意外停机）

#### ☑ Backup before update
- 对应：`arkBackupPreUpdate="true"`
- 功能：更新前自动备份服务器数据
- 建议：始终启用（安全第一）

#### ☑ Always restart on crash
- 对应：`arkAlwaysRestartOnCrash="true"`
- 功能：服务器崩溃时自动重启
- 建议：谨慎使用（避免循环崩溃）

### 配置文件示例
```bash
# /etc/arkmanager/instances/main.cfg

arkAutoUpdateOnStart="false"       # 生产环境建议关闭
arkBackupPreUpdate="true"          # 推荐启用
arkAlwaysRestartOnCrash="false"    # 谨慎使用
```

### 手动备份
虽然可以配置自动备份，但也可以手动触发：
```bash
arkmanager backup @main
```

备份存储位置（默认）：
```bash
/home/steam/ARK-Backups/
```

---

## 📁 5. 日志文件位置

### arkmanager 日志
根据文档，位于：
```bash
/var/log/arktools/
├── main.log           # 实例日志
├── ragnarok.log       # 另一个实例
└── arkmanager.log     # 工具日志
```

### ARK 服务器日志
位于：
```bash
${arkserverroot}/ShooterGame/Saved/Logs/ShooterGame.log
```

### Web UI 实现
- **日志查看器** (`/logs`) 读取服务器游戏日志
- 实时流式传输（每 2 秒更新）
- 支持暂停/恢复/清空

### 代码更新
```typescript
// app/api/logs/[instance]/route.ts
const arkserverRoot = process.env.ARK_SERVERS_PATH || '/home/steam/ARK'
const logPath = `${arkserverRoot}/ShooterGame/Saved/Logs/ShooterGame.log`
const arkToolsLog = '/var/log/arktools/main.log'
```

---

## 📊 配置管理改进

### 完整的配置文件支持

现在支持读写所有重要的 ark-server-tools 配置：

#### 基础参数 (ark_)
```bash
ark_SessionName="Server Name"
ark_MaxPlayers="70"
ark_ServerPassword=""
ark_ServerAdminPassword="password"
ark_Port="7778"
ark_QueryPort="27015"
ark_RCONPort="32330"
ark_RCONEnabled="True"
```

#### 游戏参数 (ark_)
```bash
ark_DifficultyOffset="0.5"
ark_XPMultiplier="1.0"
ark_TamingSpeedMultiplier="1.0"
ark_HarvestAmountMultiplier="1.0"
ark_ResourcesRespawnPeriodMultiplier="1.0"
ark_ServerPVE="True"
ark_AllowThirdPersonPlayer="True"
ark_ShowMapPlayerLocation="True"
```

#### Mod 参数 (ark_)
```bash
ark_GameModIds="731604991,839162288"
ark_MapModId="123456"
ark_TotalConversionId="123456"
```

#### 自动化参数 (不带 ark_ 前缀)
```bash
arkAutoUpdateOnStart="true"
arkBackupPreUpdate="true"
arkAlwaysRestartOnCrash="false"
```

#### 集群参数 (ark_)
```bash
ark_ClusterId="mycluster"
ark_AltSaveDirectoryName="MyCluster"
```

---

## 🎨 UI 改进

### 配置页面增强
- ✅ 端口配置部分（带警告）
- ✅ 自动更新/备份选项
- ✅ Mod ID 输入字段
- ✅ 特殊字符警告
- ✅ 重启提示（蓝色提示框）

### 新增 Mods 页面
- ✅ 现代化界面
- ✅ Mod 列表展示
- ✅ Steam Workshop 链接
- ✅ 安装/卸载按钮
- ✅ 使用说明

### 导航更新
- ✅ 新增 "Mods" 导航项（拼图图标）
- ✅ 7 个主要页面

---

## 📚 文档更新

### 新增文档
1. **ADVANCED_FEATURES.md** - 高级功能详解
   - 端口配置管理
   - 会话名称最佳实践
   - Mod 管理完整指南
   - 自动更新/备份配置
   - 日志文件位置
   - 集群配置详解

2. **CONFIG_UPDATE_GUIDE.md** - 配置更新工作流
   - 配置不生效的原因分析
   - 正确的配置修改方式
   - 完整的测试流程

3. **VERIFICATION_CHECKLIST.md** - 验证清单
   - 配置功能验证步骤
   - 状态显示验证
   - API 数据验证
   - RCON 功能验证

4. **CHANGELOG.md** - 详细的版本历史

### 更新的文档
- ✅ README.md - 添加新功能说明
- ✅ CONFIGURATION.md - 添加配置最佳实践
- ✅ QUICK_REFERENCE.md - 添加配置更新说明
- ✅ SUMMARY.md - 更新项目总结

---

## 🔧 技术实现

### 新增库文件
1. **lib/mod-manager.ts** (157 lines)
   - ModManager 类
   - 完整的 mod 管理方法
   - arkmanager mod 命令集成

2. **lib/port-validator.ts** (114 lines)
   - PortValidator 类
   - 端口冲突检测
   - 端口建议生成

### 新增 API 路由
1. **app/api/mods/[instance]/route.ts**
   - GET, POST, DELETE 方法
   - Mod 列表、安装、卸载

2. **app/api/mods/[instance]/check/route.ts**
   - GET 方法
   - 检查 Mod 更新

### 更新的文件
- ✅ lib/config-manager.ts - 支持更多配置参数
- ✅ app/config/[instance]/page.tsx - 新增 UI 部分
- ✅ components/common/nav-sidebar.tsx - 新增 Mods 链接
- ✅ types/ark.d.ts - 新增 Mod 相关类型

---

## 📖 完整功能对照表

| ark-server-tools 文档功能 | Web UI 实现 | 状态 |
|--------------------------|-----------|------|
| 端口必须唯一 | ✅ 端口配置 + 警告提示 | 完成 |
| 会话名称避免特殊字符 | ✅ 特殊字符检测 + 警告 | 完成 |
| arkmanager installmod | ✅ /mods 页面 + API | 完成 |
| arkmanager uninstallmod | ✅ Uninstall 按钮 | 完成 |
| arkmanager checkmodupdate | ✅ Check Updates 按钮 | 完成 |
| arkAutoUpdateOnStart | ✅ Auto-update 复选框 | 完成 |
| arkBackupPreUpdate | ✅ Backup 复选框 | 完成 |
| arkAlwaysRestartOnCrash | ✅ Restart 复选框 | 完成 |
| /var/log/arktools 日志 | ✅ 日志路径更新 | 完成 |
| ark_GameModIds 配置 | ✅ Mod IDs 输入字段 | 完成 |

---

## 🚀 快速测试新功能

### 测试 1：端口配置
```bash
# 1. 打开配置页面
http://localhost:3000/config/main

# 2. 点击 Gameplay 标签
# 3. 看到 "Port Configuration" 部分和警告
# 4. 修改端口（如 Port = 7780）
# 5. 保存并重启
# 6. 验证
arkmanager status @main  # 应该显示新端口
```

### 测试 2：Mod 安装
```bash
# 1. 打开 Mod 管理页面
http://localhost:3000/mods

# 2. 输入 Mod ID（例如：731604991 - Awesome Spyglass）
# 3. 点击 Install
# 4. 等待安装完成
# 5. 在 Configuration → Gameplay 中添加 Mod ID
# 6. 重启服务器
# 7. Mod 生效！
```

### 测试 3：自动更新配置
```bash
# 1. 打开配置页面
http://localhost:3000/config/main

# 2. Gameplay 标签
# 3. 勾选 "Auto-update on server start"
# 4. 勾选 "Backup before update"
# 5. 保存配置
# 6. 验证文件
cat /etc/arkmanager/instances/main.cfg | grep -E "arkAutoUpdate|arkBackup"
```

### 测试 4：会话名称验证
```bash
# 1. 打开配置页面
# 2. Basic Settings 标签
# 3. 尝试输入 "!![EU]!! Server"
# 4. 保存时应该看到错误：
#    "SessionName contains special characters..."
# 5. 改为 "EU Server"
# 6. 保存成功
```

---

## 📦 新增文件列表

### 核心代码 (3 个文件)
1. `lib/mod-manager.ts` - Mod 管理器
2. `lib/port-validator.ts` - 端口验证器
3. `app/mods/page.tsx` - Mod 管理页面

### API 路由 (2 个文件)
1. `app/api/mods/[instance]/route.ts`
2. `app/api/mods/[instance]/check/route.ts`

### 文档 (5 个文件)
1. `ADVANCED_FEATURES.md` - 高级功能指南
2. `CONFIG_UPDATE_GUIDE.md` - 配置更新指南
3. `VERIFICATION_CHECKLIST.md` - 验证清单
4. `CHANGELOG.md` - 版本历史
5. `NEW_FEATURES_V1.0.md` - 本文档

---

## 🎓 使用场景示例

### 场景 1：创建带 Mod 的 PVE 服务器

```bash
# 1. 创建实例配置
vi /etc/arkmanager/instances/pve-modded.cfg

# 内容：
arkserverroot="/home/steam/ARK"
serverMap="TheIsland"
ark_Port="7780"                        # 唯一端口
ark_QueryPort="27017"                  # 唯一端口
ark_RCONPort="32332"                   # 唯一端口
ark_RCONEnabled="True"
ark_ServerAdminPassword="mypassword"
ark_SessionName="PVE Modded Server"
ark_MaxPlayers="50"
ark_ServerPVE="True"                   # PVE 模式
arkAutoUpdateOnStart="false"
arkBackupPreUpdate="true"

# 2. 通过 Web UI 安装 Mod
访问: /mods
选择: pve-modded
安装: 731604991 (Awesome Spyglass)
安装: 839162288 (Structures Plus)

# 3. 配置 Mod
访问: /config/pve-modded
Gameplay → Game Mod IDs: 731604991,839162288
保存

# 4. 启动服务器
访问: /servers
点击 pve-modded 的 Start

# 5. 验证
等待启动，Mod 应该已加载
```

### 场景 2：配置生产环境服务器

```
1. 端口设置（唯一）
   Port: 7778
   QueryPort: 27015
   RCONPort: 32330

2. 服务器设置
   Name: "Production Server" (简单名称)
   Max Players: 70
   Admin Password: 强密码

3. 游戏设置
   Difficulty: 0.5
   XP: 1.0 (官方倍率)
   Taming: 1.0
   Harvest: 1.0

4. 自动化
   ☑ Backup before update
   ☐ Auto-update on start (避免意外停机)
   ☐ Always restart on crash

5. 保存并重启
```

---

## 🔍 验证所有新功能

```bash
# 1. 检查配置文件已更新
cat /etc/arkmanager/instances/main.cfg

# 应该包含：
# - ark_Port, ark_QueryPort, ark_RCONPort
# - arkAutoUpdateOnStart, arkBackupPreUpdate
# - ark_GameModIds (如果配置了 mod)

# 2. 验证 API 端点
curl http://localhost:3000/api/servers/main/config | jq
curl http://localhost:3000/api/mods/main | jq

# 3. 验证 Web UI
访问所有页面，确认新功能可用：
- /config/<instance> - 看到端口配置和自动化选项
- /mods - Mod 管理功能正常
```

---

## 🎯 功能完成度

### v1.0 计划功能
- [x] Dashboard 实时监控
- [x] 服务器管理（启动/停止/重启）
- [x] 配置管理（.cfg 文件）
- [x] RCON 控制台
- [x] 日志查看器
- [x] 集群配置
- [x] **端口配置管理** ← 新增
- [x] **Mod 管理** ← 新增
- [x] **自动更新/备份** ← 新增
- [x] **会话名称验证** ← 新增
- [x] Docker 部署
- [x] PM2 配置
- [x] 完整文档

### 文档完成度
- [x] 功能文档（9 个 .md 文件）
- [x] API 文档
- [x] 部署指南
- [x] 故障排除
- [x] 配置指南
- [x] 使用示例
- [x] 验证清单

**总完成度：100% + 额外功能** 🎉

---

## 📝 下一版本可能的改进

v1.1 可能包含：
- [ ] 自动端口冲突检测
- [ ] Mod 搜索和浏览
- [ ] 备份恢复 UI
- [ ] 定时任务管理
- [ ] Discord 通知集成
- [ ] 性能历史图表
- [ ] 批量服务器操作

但 v1.0 已经是一个功能完整、生产就绪的管理系统！

