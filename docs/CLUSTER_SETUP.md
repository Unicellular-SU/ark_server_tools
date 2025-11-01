# ARK 互通服（Cluster）配置指南

本指南介绍如何使用 ARK Server Manager 配置和管理 ARK 互通服集群。

## 什么是互通服？

互通服（Cluster）允许玩家在多个 ARK 服务器之间传输角色、恐龙和物品。所有在同一集群中的服务器共享相同的集群 ID 和数据目录。

## 前置要求

1. 至少已安装 2 个 ARK 服务器实例
2. 所有服务器可以访问共享的集群数据目录
3. 每个服务器必须有唯一的端口号

## 配置方法

### 方法 1：通过 Web 界面配置现有服务器

#### 步骤 1：访问集群配置页面

导航到 `Cluster Configuration` 页面。

#### 步骤 2：配置集群设置

1. **Cluster ID**：输入唯一的集群标识符（例如：`mycluster`）
   - 只能包含字母、数字和下划线
   - 所有互通的服务器必须使用相同的 Cluster ID

2. **Cluster Directory**：输入共享数据目录路径
   - 默认：`/home/steam/cluster`
   - 确保所有服务器都能访问此目录
   - 系统会自动创建目录（如果不存在）

#### 步骤 3：选择服务器实例

在 "Server Instances" 部分，点击要加入集群的服务器实例。被选中的实例会显示 "Selected" 标签。

#### 步骤 4：保存并应用配置

1. 点击 **"Save Config"** 按钮保存集群元数据
2. 点击 **"Apply to Servers"** 按钮将配置应用到选中的实例

系统会：
- 验证配置有效性
- 检查并创建集群目录（如果需要）
- 更新每个实例的配置文件，添加：
  - `ark_ClusterId`
  - `ark_ClusterDirOverride`
  - `ark_AltSaveDirectoryName`（使用实例名称作为唯一存档目录）

#### 步骤 5：重启服务器

如果有正在运行的服务器，系统会显示警告卡片：

```
⚠️ Restart Required
以下实例需要重启才能生效：
- island1
- center1

[Restart 2 Instance(s)]
```

点击 **"Restart Instance(s)"** 按钮重启所有需要更新的服务器。

### 方法 2：创建新服务器时加入集群

#### 步骤 1：打开安装对话框

在服务器管理页面，点击 **"+ Install Server"** 按钮。

#### 步骤 2：配置基本设置

在 "Basic Settings" 标签页：
- 输入实例名称
- 选择地图
- 设置服务器名称
- 设置管理员密码等

#### 步骤 3：配置网络端口

在 "Network & Ports" 标签页：
- 设置游戏端口、查询端口、RCON 端口
- 确保端口号不与其他实例冲突

#### 步骤 4：配置集群（可选）

切换到 **"Cluster (Optional)"** 标签页：

1. 勾选 **"Join Existing Cluster"**
2. 输入 **Cluster ID**（必须与其他集群服务器相同）
3. 输入 **Cluster Directory**（必须与其他集群服务器相同）

#### 步骤 5：安装服务器

点击 **"Install Server"** 按钮。系统会：
- 创建包含集群配置的实例配置文件
- 开始下载和安装 ARK 服务器

## 集群状态监控

配置页面会显示 **Cluster Status** 卡片，包含：

### 集群信息
- 当前 Cluster ID
- Cluster Directory 路径

### 实例统计
- **Configured**：已配置集群的实例数量
- **Running**：正在运行的集群实例数量  
- **Stopped**：已停止的集群实例数量

### 实例列表
- **Configured Instances**：显示所有已配置集群的实例及其运行状态
- **Not in Cluster**：显示未加入集群的实例

## 配置结果

应用配置后，会显示详细的结果：

```
✅ Configuration Results
✓ island1 - Applied
✓ center1 - Applied
✗ ragnarok1 - Failed: Permission denied
```

## 技术细节

### 配置文件变更

对于每个加入集群的实例，系统会在 `/etc/arkmanager/instances/<instance>.cfg` 中添加：

```bash
ark_ClusterId="mycluster"
ark_ClusterDirOverride="/home/steam/cluster"
ark_AltSaveDirectoryName="island1"  # 使用实例名称
```

### 目录结构

集群数据目录结构示例：

```
/home/steam/cluster/
├── <steamid>/
│   ├── <profile_name>.arkprofile
│   └── ...
└── <clusterid>/
    ├── DinoTransfers/
    └── ItemTransfers/
```

### 端口要求

每个实例必须使用唯一的端口组合：

| 实例 | Game Port | Query Port | RCON Port |
|------|-----------|------------|-----------|
| island1 | 7778 | 27015 | 32330 |
| center1 | 7779 | 27016 | 32331 |
| ragnarok1 | 7780 | 27017 | 32332 |

## 常见问题

### Q: 配置应用失败，提示权限错误

**A:** 确保运行 ARK Server Manager 的用户有权限写入：
- `/etc/arkmanager/instances/` 目录
- 集群数据目录

解决方案：
```bash
# 方法 1：以 steam 用户运行应用
sudo -u steam npm start

# 方法 2：修改权限
sudo chown -R steam:steam /etc/arkmanager
sudo chown -R steam:steam /home/steam/cluster
```

### Q: 服务器重启后集群不生效

**A:** 检查：
1. 配置文件是否正确写入
2. 服务器是否真的重启了（而不是重载）
3. 集群目录是否存在且可访问

### Q: 玩家无法跨服传输

**A:** 确认：
1. 所有服务器的 Cluster ID 完全一致
2. 所有服务器的 Cluster Directory 路径相同
3. 集群目录权限正确（steam 用户可读写）
4. 所有服务器都已重启并应用了配置

### Q: 如何移除实例的集群配置？

**A:** 在集群配置页面：
1. 取消选择要移除的实例
2. 点击 "Apply to Servers"
3. 系统会移除该实例的集群配置
4. 重启该实例

## API 端点

### 保存集群配置
```
POST /api/cluster
Body: { clusterId, clusterDir, instances[], ... }
```

### 应用配置到服务器
```
POST /api/cluster/apply
Body: { clusterId, clusterDir, instances[] }
```

### 获取集群状态
```
GET /api/cluster/status?clusterId=<id>
```

## 最佳实践

1. **使用描述性的 Cluster ID**：如 `pvp_cluster_2025` 而不是 `cluster1`
2. **定期备份集群数据目录**：防止玩家数据丢失
3. **监控集群目录大小**：及时清理过期的传输数据
4. **测试配置**：先在测试服务器上验证集群配置
5. **文档化配置**：记录每个实例的端口和集群设置

## 相关文档

- [ARK Server Tools 官方文档](https://github.com/arkmanager/ark-server-tools)
- [服务器配置指南](./CONFIGURATION.md)
- [故障排除](./TROUBLESHOOTING.md)

