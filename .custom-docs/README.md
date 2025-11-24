# Tegical Dify 自定义文档

本目录包含 Tegical 团队对 Dify 项目的自定义文档和操作指南。

## 📚 文档列表

- **[index.md](./index.md)** - 文档索引，快速了解文档结构
- **[version-upgrade.md](./version-upgrade.md)** - 版本升级完整指南 ⭐
- **[customizations.md](./customizations.md)** - 当前所有自定义修改的详细清单

## 🎯 使用场景

### 场景 1: 准备升级 Dify 版本
👉 阅读 [version-upgrade.md](./version-upgrade.md)，按照场景选择合适的升级策略

### 场景 2: 了解当前做了哪些自定义
👉 查看 [customizations.md](./customizations.md)，了解所有修改内容

### 场景 3: AI Agent 执行任务前
👉 先阅读 [index.md](./index.md)，了解项目当前状态

### 场景 4: 新团队成员入职
👉 按顺序阅读：index.md → customizations.md → version-upgrade.md

## 🔄 当前分支策略

```
Dify 官方仓库                     Tegical Fork
    │                                 │
    ├─── main                        ├─── main (跟踪官方)
    │                                 │
    ├─── release/1.10.0              ├─── release/1.10.0 (跟踪官方)
    │                                 │    │
    │                                 │    └─── dev (自定义开发)
    │                                 │
    └─── release/1.20.0 (未来)       └─── release/1.20.0 (未来)
                                           │
                                           └─── dev (升级后)
```

## ⚡ 快速命令参考

### 查看当前版本信息
```bash
git log --oneline -1
git branch -vv
```

### 备份当前分支
```bash
git branch dev-backup-$(date +%Y%m%d) dev
```

### 查看自定义修改的文件列表
```bash
git diff release/1.10.0 --name-only
```

### 查看远程分支
```bash
git fetch origin
git branch -r | grep release
```

## 📝 文档维护规则

1. **每次升级后必须更新**：
   - 更新 `version-upgrade.md` 中的"版本升级历史记录"表格
   - 更新 `customizations.md` 中的"当前版本信息"
   - 如有新的自定义修改，更新"自定义修改列表"

2. **遇到问题时补充文档**：
   - 在 `version-upgrade.md` 的"常见问题处理"部分添加新问题
   - 记录解决方案和参考链接

3. **技术债务追踪**：
   - 在 `customizations.md` 的"技术债务和待优化项"记录需要改进的地方
   - 标注优先级和预计工作量

## 🤝 团队协作

- **升级前**：通知团队成员，确认无人在 dev 分支上工作
- **升级中**：使用备份分支，避免影响其他人
- **升级后**：通知团队成员拉取最新代码，运行测试验证

## 📧 联系方式

如有问题或建议，请联系：
- 项目负责人：[待补充]
- 技术负责人：[待补充]

## 🔗 相关链接

- [Dify 官方文档](https://docs.dify.ai/)
- [Dify GitHub](https://github.com/langgenius/dify)
- [Dify 社区论坛](https://forum.dify.ai/)
- [Tegical 内部 Wiki](待补充)
