# 文档索引

ARK Server Manager 完整文档列表和使用指南。

## 📚 核心文档

### 1. [README.md](README.md) - 主文档
**用途**：项目概览、快速开始、基本使用

**包含内容**：
- 功能列表
- 技术栈
- 安装方法（Docker/PM2/开发）
- 基本使用说明
- API 端点参考
- 故障排除

**适合**：首次使用、快速了解项目

---

### 2. [CONFIGURATION.md](CONFIGURATION.md) - 配置指南
**用途**：详细的配置说明

**包含内容**：
- 环境变量配置
- arkmanager 集成要点
- 实例配置示例
- 集群配置说明
- 端口配置
- 常见问题

**适合**：设置新服务器、配置集群

---

### 3. [CONFIG_UPDATE_GUIDE.md](CONFIG_UPDATE_GUIDE.md) - 配置更新工作流
**用途**：解决"配置修改后不生效"问题

**包含内容**：
- 配置方式详解（.cfg vs GameUserSettings.ini）
- 为什么直接修改 ini 文件不生效
- 正确的配置流程
- 配置项映射表
- 完整示例和验证步骤

**适合**：遇到配置问题、需要理解配置机制

---

### 4. [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md) - 高级功能
**用途**：深入了解高级功能

**包含内容**：
- 端口配置管理（唯一性要求）
- 会话名称特殊字符处理
- Mod 管理完整指南
- 自动更新和备份配置
- 日志文件位置
- 集群配置详解
- 生产环境配置建议

**适合**：高级用户、生产环境部署

---

## 🔍 参考文档

### 5. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 快速参考
**用途**：快速查找常用信息

**包含内容**：
- 服务器状态对照表
- API 数据格式
- arkmanager 命令映射
- 端口配置表
- 环境变量
- 常见问题快速解决
- 测试命令

**适合**：日常使用、快速查询

---

### 6. [STATUS_PARSING.md](STATUS_PARSING.md) - 状态解析详解
**用途**：理解服务器状态判断逻辑

**包含内容**：
- arkmanager status 输出格式（5 种）
- 状态判断逻辑
- 数据提取方法
- UI 显示映射
- 刷新频率

**适合**：开发者、调试状态问题

---

### 7. [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md) - 验证清单
**用途**：系统功能测试

**包含内容**：
- 配置更新功能验证
- 服务器状态验证
- API 数据格式验证
- RCON 功能验证
- 日志功能验证
- 完整功能检查清单

**适合**：部署后验证、功能测试

---

## 🐛 问题解决文档

### 8. [FIXES.md](FIXES.md) - 修复日志
**用途**：已知问题和解决方案

**包含内容**：
- 配置文件注释问题
- 服务器状态显示问题
- systeminformation 警告
- Next.js 15 兼容性
- 配置持久化问题

**适合**：遇到相似问题、了解已修复的 bug

---

### 9. [CHANGELOG.md](CHANGELOG.md) - 版本历史
**用途**：详细的版本更新记录

**包含内容**：
- v1.0.0 所有功能
- 新增功能列表
- 修复的问题
- 技术改进
- 已知限制

**适合**：了解项目演进、版本升级

---

## 📊 总结文档

### 10. [SUMMARY.md](SUMMARY.md) - 项目总结
**用途**：项目完整概览

**包含内容**：
- 已实现功能列表
- 技术实现细节
- 配置管理机制
- 已修复问题
- 项目结构
- 完整功能检查清单

**适合**：整体了解项目、技术评估

---

### 11. [NEW_FEATURES_V1.0.md](NEW_FEATURES_V1.0.md) - 新功能说明
**用途**：v1.0 新增功能详解

**包含内容**：
- 端口配置管理
- 会话名称处理
- Mod 管理功能
- 自动更新/备份
- 日志位置
- 使用场景示例

**适合**：了解新功能、学习使用方法

---

## 🎯 按需求查找文档

### 我想要...

#### 快速开始
→ [README.md](README.md) - Installation 部分

#### 配置新服务器
→ [CONFIGURATION.md](CONFIGURATION.md) - 实例配置示例

#### 修改服务器设置
→ [CONFIG_UPDATE_GUIDE.md](CONFIG_UPDATE_GUIDE.md) - 完整工作流

#### 安装 Mod
→ [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md) - Mod 管理部分
→ [NEW_FEATURES_V1.0.md](NEW_FEATURES_V1.0.md) - Mod 功能说明

#### 配置多个服务器（集群）
→ [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md) - 集群配置部分
→ [CONFIGURATION.md](CONFIGURATION.md) - 集群配置

#### 解决配置不生效问题
→ [CONFIG_UPDATE_GUIDE.md](CONFIG_UPDATE_GUIDE.md) - 问题分析
→ [FIXES.md](FIXES.md) - 相关修复

#### 理解服务器状态
→ [STATUS_PARSING.md](STATUS_PARSING.md) - 状态详解
→ [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 状态对照表

#### 测试系统功能
→ [VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md) - 完整清单

#### 查看版本历史
→ [CHANGELOG.md](CHANGELOG.md) - 版本更新

#### 快速查询命令
→ [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 命令映射表

#### 了解所有功能
→ [SUMMARY.md](SUMMARY.md) - 完整功能列表

---

## 📖 推荐阅读顺序

### 新用户
1. README.md - 了解项目
2. CONFIGURATION.md - 配置服务器
3. QUICK_REFERENCE.md - 快速参考

### 遇到配置问题
1. CONFIG_UPDATE_GUIDE.md - 理解配置机制
2. FIXES.md - 查看已知问题
3. VERIFICATION_CHECKLIST.md - 验证配置

### 高级功能
1. ADVANCED_FEATURES.md - 所有高级功能
2. NEW_FEATURES_V1.0.md - 最新功能
3. STATUS_PARSING.md - 深入理解

### 开发者
1. SUMMARY.md - 技术概览
2. STATUS_PARSING.md - 状态解析
3. CHANGELOG.md - 版本历史
4. 代码文件（lib/, app/api/）

---

## 📂 文档统计

| 文档类型 | 数量 | 总字数（估算） |
|---------|------|--------------|
| 核心文档 | 4 | ~8,000 |
| 参考文档 | 3 | ~4,000 |
| 问题解决 | 2 | ~3,000 |
| 总结文档 | 3 | ~4,000 |
| **总计** | **12** | **~19,000** |

---

## 🔗 外部资源

### ark-server-tools
- [GitHub 仓库](https://github.com/arkmanager/ark-server-tools)
- [官方文档](ark-server-tools-readme.asciidoc)
- [Wiki](https://github.com/arkmanager/ark-server-tools/wiki)

### ARK: Survival Evolved
- [官方 Wiki](https://ark.wiki.gg/)
- [Steam Workshop](https://steamcommunity.com/app/346110/workshop/)
- [服务器设置指南](https://ark.wiki.gg/wiki/Dedicated_server_setup)

### 技术栈
- [Next.js 15](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

---

## 💡 提示

### 快速搜索
使用 Ctrl+F 在文档中搜索关键词：
- "端口" - 端口配置相关
- "mod" - Mod 管理相关
- "config" - 配置相关
- "状态" - 服务器状态相关
- "api" - API 端点相关

### 文档更新
所有文档都与代码同步更新，版本号：v1.0.0

### 问题反馈
如果文档有不清楚的地方，请：
1. 检查相关的其他文档
2. 查看代码注释
3. 提交 issue

---

**文档最后更新**：2025年11月1日
**项目版本**：1.0.0
**文档语言**：中文/English

