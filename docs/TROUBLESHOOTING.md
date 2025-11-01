# 故障排除指南

## 调试日志

项目已启用详细的命令执行日志，帮助诊断问题。

### 查看日志

启动开发服务器时，终端会显示：

```
[ARK Manager] Executing command: arkmanager status @main
[ARK Manager] Command output (first 300 chars): Running command 'status'...
[main] Parsing status output: Running command 'status'...
[main] DEBUG Line: " Server running:   Yes "
[main] Running match: Yes
[main] Listening match: Yes
[main] ✓ Status: RUNNING (fully online)
```

### 日志含义

- `[ARK Manager] Executing command:` - 显示执行的完整命令
- `[ARK Manager] Command output:` - arkmanager 的返回结果
- `[instance] DEBUG Line:` - 关键行的确切内容
- `[instance] Status:` - 最终判断的状态

## 常见问题

### 1. 配置修改不生效

**症状**：修改最大玩家数为 8，重启后仍显示 70

**检查**：
```bash
# 1. 配置文件是否已更新
cat /etc/arkmanager/instances/main.cfg | grep MaxPlayers
# 应该显示: ark_MaxPlayers="8"

# 2. 是否已重启服务器
# 必须重启！

# 3. 服务器是否完全启动
arkmanager status @main
# 状态应该是 "Running"（不是 "Starting"）

# 4. 验证生效
# 应该显示: Steam Players: 0 / 8
```

**解决**：
- 确认配置已保存到 .cfg 文件
- 重启服务器（不是刷新页面）
- 等待完全启动（30-60 秒）

---

### 2. 服务器状态显示错误

**症状**：服务器已启动但显示 stopped

**调试**：
```bash
# 查看终端日志，应该显示：
[main] Running match: Yes
[main] Listening match: Yes
[main] ✓ Status: RUNNING
```

**可能原因**：
- SSE 连接问题
- 浏览器缓存

**解决**：
- 强制刷新页面（Ctrl+F5）
- 检查终端日志确认状态解析正确
- 等待 5 秒让 SSE 更新

---

### 3. RCON 连接失败

**症状**：执行 RCON 命令时报错

**检查**：
```bash
# 1. 服务器是否完全启动
arkmanager status @main
# 必须显示 "Steam Players: X / Y"，不能是 "Unable to query"

# 2. RCON 是否启用
cat /etc/arkmanager/instances/main.cfg | grep RCON
# 应该有: ark_RCONEnabled="True"

# 3. RCON 端口
# 应该有: ark_RCONPort="32330"

# 4. 管理员密码
# 应该有: ark_ServerAdminPassword="..."
```

**解决**：
- 等待服务器完全启动
- 检查 RCON 配置
- 使用正确的密码

---

### 4. Mod 不生效

**症状**：安装了 Mod 但游戏中看不到

**检查**：
```bash
# 1. Mod 是否已安装
arkmanager list-mods @main

# 2. Mod ID 是否已配置
cat /etc/arkmanager/instances/main.cfg | grep GameModIds
# 应该有: ark_GameModIds="731604991,..."

# 3. 是否已重启
# 必须重启服务器才能加载 Mod！
```

**解决**：
1. 在 /mods 页面安装 Mod
2. 在 /config 页面添加 Mod ID
3. 重启服务器
4. 等待完全启动

---

### 5. 端口冲突

**症状**：服务器崩溃或卡在 0/0 玩家

**检查**：
```bash
# 检查所有实例的端口
grep -E "ark_(Port|QueryPort|RCONPort)" /etc/arkmanager/instances/*.cfg

# 查找重复
grep "ark_Port=" /etc/arkmanager/instances/*.cfg | sort
```

**解决**：
- 确保每个实例的 Port, QueryPort, RCONPort 都不同
- 建议递增方式：7778, 7780, 7782...
- 修改后重启服务器

---

### 6. arkmanager 命令不工作

**症状**：API 调用失败

**检查**：
```bash
# 1. arkmanager 是否已安装
which arkmanager

# 2. 手动测试命令
arkmanager status @main

# 3. 权限问题
ls -la /etc/arkmanager/instances/
```

**解决**：
- 安装 ark-server-tools
- 检查文件权限
- 确认实例配置文件存在

---

## 调试技巧

### 查看完整日志

在终端中，你会看到所有命令执行和状态解析过程：

```bash
npm run dev

# 然后访问 Dashboard，观察终端输出
```

### 手动测试 arkmanager

```bash
# 直接运行命令验证
arkmanager status @main
arkmanager list-instances
```

### 验证配置文件

```bash
# 查看配置
cat /etc/arkmanager/instances/main.cfg

# 检查语法
bash -n /etc/arkmanager/instances/main.cfg
```

### 检查 API 响应

```bash
# 测试 API
curl http://localhost:3000/api/servers
curl http://localhost:3000/api/servers/main/config
```

---

## 性能问题

### SSE 连接过多

如果同时打开多个页面，可能有多个 SSE 连接。

**解决**：关闭不需要的标签页。

### 启动慢

服务器启动需要 30-60 秒，这是正常的。观察状态变化：

```
Stopped → Starting... → Running
```

---

## 获取帮助

如果以上方法都无法解决：

1. 检查终端日志
2. 查看 arkmanager 日志：`/var/log/arktools/`
3. 查看服务器日志：`${arkserverroot}/ShooterGame/Saved/Logs/`
4. 提供完整的错误信息和日志

