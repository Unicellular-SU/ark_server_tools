# 权限配置指南

## 问题：Permission Denied

当尝试保存配置时出现：
```
Error: EACCES: permission denied, open '/etc/arkmanager/instances/main.cfg'
```

## 原因

Node.js 应用默认以当前用户运行，但 `/etc/arkmanager/` 目录通常归 root 或 steam 用户所有。

## 解决方案

### 方案 1：使用用户级配置（推荐）

ark-server-tools 支持用户级配置文件。

**步骤**：

1. 创建用户级配置目录：
```bash
mkdir -p ~/.config/arkmanager/instances
```

2. 复制现有配置：
```bash
sudo cp /etc/arkmanager/instances/main.cfg ~/.config/arkmanager/instances/
sudo chown $USER:$USER ~/.config/arkmanager/instances/main.cfg
```

3. 更新环境变量 `.env`：
```bash
ARK_INSTANCE_CONFIG_DIR=/home/steam/.config/arkmanager/instances
```

4. 在 `/etc/arkmanager/arkmanager.cfg` 中添加：
```bash
configfile_main="$HOME/.config/arkmanager/instances/main.cfg"
```

5. 重启 Web 应用

---

### 方案 2：以 steam 用户运行应用

**开发环境**：
```bash
# 切换到 steam 用户
sudo -u steam bash

# 启动应用
cd /path/to/ark-server-manager
npm run dev
```

**生产环境（PM2）**：
```bash
# 以 steam 用户启动
sudo -u steam pm2 start ecosystem.config.js

# 或修改 ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ark-web-manager',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    user: 'steam',  // ← 添加这行
    instances: 'max',
    exec_mode: 'cluster',
    ...
  }]
}
```

**Docker**：
```dockerfile
# 在 Dockerfile 中
USER steam  # 切换到 steam 用户

# 或在 docker-compose.yml 中
services:
  ark-web-manager:
    user: "1000:1000"  # steam 用户的 UID:GID
```

---

### 方案 3：修改目录权限

**选项 A：添加写权限**
```bash
# 让 steam 用户组可写
sudo chgrp -R steam /etc/arkmanager/instances
sudo chmod -R g+w /etc/arkmanager/instances

# 将当前用户添加到 steam 组
sudo usermod -a -G steam $USER

# 重新登录以应用组变更
```

**选项 B：更改所有权**
```bash
# 将整个目录改为 steam 用户
sudo chown -R steam:steam /etc/arkmanager

# 确保 arkmanager 仍能访问
```

**选项 C：使用 ACL**
```bash
# 安装 ACL 工具
sudo apt-get install acl

# 给当前用户写权限
sudo setfacl -R -m u:$USER:rwx /etc/arkmanager/instances
sudo setfacl -d -R -m u:$USER:rwx /etc/arkmanager/instances
```

---

### 方案 4：使用 sudo（不推荐）

⚠️ **安全风险**：允许 Web 应用执行 sudo 命令存在安全隐患。

如果必须使用：

1. 创建 sudo 规则：
```bash
sudo visudo -f /etc/sudoers.d/arkmanager-web
```

2. 添加内容：
```
# 允许当前用户无密码写入配置
your-user ALL=(ALL) NOPASSWD: /usr/bin/tee /etc/arkmanager/instances/*.cfg
```

3. 修改代码使用 sudo（不推荐）

---

## 推荐方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|-----|------|------|--------|
| 用户级配置 | ✅ 安全<br>✅ 简单 | 需要配置 configfile_ | ⭐⭐⭐⭐⭐ |
| steam 用户运行 | ✅ 符合标准<br>✅ 无需改权限 | 需要切换用户 | ⭐⭐⭐⭐ |
| 修改目录权限 | ✅ 简单快速 | ⚠️ 可能影响安全性 | ⭐⭐⭐ |
| 使用 sudo | ⚠️ 可行 | ❌ 安全风险大 | ⭐ |

## 快速解决（开发环境）

```bash
# 最简单的方法：修改目录权限
sudo chown -R $USER:$USER /etc/arkmanager/instances
```

## 快速解决（生产环境）

```bash
# 1. 使用用户级配置
mkdir -p ~/.config/arkmanager/instances
cp /etc/arkmanager/instances/*.cfg ~/.config/arkmanager/instances/
chmod -R u+w ~/.config/arkmanager/instances

# 2. 更新 .env
ARK_INSTANCE_CONFIG_DIR=/home/steam/.config/arkmanager/instances

# 3. 重启应用
```

## 验证

```bash
# 测试写权限
touch /etc/arkmanager/instances/test.txt
# 如果成功，说明有权限

# 删除测试文件
rm /etc/arkmanager/instances/test.txt
```

## Docker 部署注意事项

如果使用 Docker，确保：

```yaml
# docker-compose.yml
services:
  ark-web-manager:
    volumes:
      - /etc/arkmanager:/etc/arkmanager:rw  # ← 注意 :rw (读写权限)
    user: "1000:1000"  # ← steam 用户的 UID:GID
```

或使用用户级配置：
```yaml
volumes:
  - /home/steam/.config/arkmanager:/config:rw
environment:
  - ARK_INSTANCE_CONFIG_DIR=/config/instances
```

