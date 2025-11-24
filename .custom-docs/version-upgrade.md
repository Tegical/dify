# Dify 版本升级指南

本文档记录 Tegical 团队如何将自定义的 Dify 从一个版本升级到另一个版本。

## 当前版本信息

- **当前基础版本**: release/1.10.0 (commit: a47276ac2)
- **自定义分支**: dev (commit: a0e901ed2)
- **最后更新时间**: 2025-11-24

## 分支依赖关系

```
Initial commit → release/1.10.0 → dev (自定义版本)
                      │
                      └── 包含 UI 定制修改
```

main 分支独立发展，不影响 dev 分支。

## 升级策略选择

根据不同场景选择合适的升级策略：

### 场景 1：基于新的 release 分支升级（推荐）✅

**适用情况**：Dify 官方发布新版本时创建了 `release/X.Y.Z` 分支

**优点**：
- 基于稳定的发布版本
- 避免 main 分支的不稳定更新
- 版本追踪清晰

**操作步骤**：

```bash
# 1. 获取最新的远程分支
git fetch origin

# 2. 确认新版本分支存在
git branch -r | grep release
# 应该能看到 origin/release/1.20.0 或更高版本

# 3. 备份当前 dev 分支（重要！）
git checkout dev
git branch dev-1.10.0-backup dev

# 4. 查看新版本的提交历史，确认是你想要的版本
git log origin/release/1.20.0 --oneline -10

# 5. 基于新版本重建 dev 分支
git checkout origin/release/1.20.0
git checkout -b dev-new

# 6. 应用自定义修改（从备份分支检出）
git checkout dev-1.10.0-backup -- \
  web/Dockerfile \
  web/app/components/header/index.tsx \
  web/app/components/apps/footer.tsx \
  web/app/components/share/text-generation/index.tsx \
  web/app/components/base/chat/embedded-chatbot/index.tsx \
  web/app/components/base/chat/embedded-chatbot/header/index.tsx \
  web/app/components/datasets/list/dataset-footer/index.tsx

# 7. 检查文件状态和可能的冲突
git status
git diff --cached

# 8. 手动检查并调整冲突文件（如果有）
# 可能需要打开文件手动合并冲突的部分

# 9. 提交自定义修改
git commit -m "chore: upgrade to 1.20.0 with UI customizations

- Base version: release/1.20.0
- Applied UI customizations from 1.10.0
- Resolved conflicts in: (列出解决冲突的文件)"

# 10. 替换旧的 dev 分支
git branch -M dev-new dev

# 11. 推送到远程（需要强制推送）
git push origin dev --force-with-lease

# 12. 验证分支状态
git branch -vv
```

### 场景 2：基于 main 的特定提交升级

**适用情况**：Dify 没有创建 release 分支，只在 main 上打标签

**操作步骤**：

```bash
# 1. 获取最新代码
git fetch origin

# 2. 查找 1.20.0 版本的标签或提交
git log origin/main --oneline --grep="1.20.0"
git tag | grep 1.20.0

# 3. 假设找到标签 v1.20.0，查看对应提交
git show v1.20.0 --quiet

# 4. 基于该提交创建临时 release 分支
git checkout -b release/1.20.0 v1.20.0

# 5. 后续步骤同场景 1 的步骤 3-12
```

### 场景 3：Rebase 方式升级

**适用情况**：希望保持提交历史连续性

**优点**：
- 提交历史更清晰
- 可以看到自定义修改的演进过程

**缺点**：
- 可能遇到多次冲突需要解决
- 需要强制推送

**操作步骤**：

```bash
# 1. 备份当前分支
git checkout dev
git branch dev-1.10.0-backup dev

# 2. Rebase 到新版本
git rebase origin/release/1.20.0

# 3. 如果遇到冲突
# 3.1 查看冲突文件
git status

# 3.2 手动解决冲突
# 编辑冲突文件，保留你的自定义修改

# 3.3 标记冲突已解决
git add <冲突文件>

# 3.4 继续 rebase
git rebase --continue

# 3.5 重复 3.1-3.4 直到 rebase 完成

# 4. 推送到远程（需要强制推送）
git push origin dev --force-with-lease
```

**如果 rebase 出错想放弃**：
```bash
git rebase --abort
git checkout dev-1.10.0-backup
```

### 场景 4：选择性合并更新

**适用情况**：只想要某些特定功能或修复，不升级整个版本

**操作步骤**：

```bash
# 1. 查看 main 或新版本的提交
git log origin/main --oneline -20

# 2. 挑选需要的提交（假设是 abc1234）
git cherry-pick abc1234

# 3. 如果有冲突，解决后继续
git add <冲突文件>
git cherry-pick --continue

# 4. 推送更新
git push origin dev
```

## 升级前检查清单

在执行升级前，请确认以下事项：

- [ ] 已备份当前 dev 分支
- [ ] 已确认新版本的 release 分支或标签存在
- [ ] 已查看新版本的 CHANGELOG，了解重大变更
- [ ] 本地环境无未提交的修改（`git status` 显示干净）
- [ ] 已通知团队成员即将进行升级操作

## 升级后验证清单

升级完成后，必须进行以下验证：

### 1. Git 状态检查
```bash
# 检查分支状态
git branch -vv

# 查看最近的提交
git log --oneline -5

# 确认远程同步
git status
```

### 2. 前端验证
```bash
cd web

# 安装依赖
pnpm install

# 运行 lint 检查
pnpm lint

# 运行类型检查
pnpm type-check

# 运行测试
pnpm test

# 本地启动验证
pnpm dev
```

### 3. 后端验证
```bash
cd api

# 同步依赖
uv sync

# 运行 lint 检查
make lint

# 运行类型检查
make type-check

# 运行单元测试
uv run --dev dev/pytest/pytest_unit_tests.sh
```

### 4. 功能验证

手动测试以下功能：
- [ ] UI 自定义是否生效（header、footer、branding）
- [ ] 应用创建和运行
- [ ] 数据集管理
- [ ] 工作流编辑
- [ ] 用户认证
- [ ] 核心业务功能

### 5. Docker 验证

```bash
# 构建镜像
docker build -t dify-custom:test .

# 检查镜像大小和层
docker images dify-custom:test
docker history dify-custom:test

# 运行容器测试
docker-compose up -d
```

## 常见问题处理

### Q1: cherry-pick 或 rebase 时遇到大量冲突怎么办？

**解决方案**：
```bash
# 1. 放弃当前操作
git cherry-pick --abort  # 或 git rebase --abort

# 2. 采用"重建方式"（场景1）
# 这种方式可以手动对比文件，更容易处理冲突
```

### Q2: 升级后发现新版本有 Bug 需要回退

**解决方案**：
```bash
# 1. 切回备份分支
git checkout dev-1.10.0-backup
git branch -M dev-1.10.0-backup dev

# 2. 强制推送回远程
git push origin dev --force-with-lease
```

### Q3: 自定义的文件在新版本中被重构了

**解决方案**：
1. 查看新版本的文件结构变化
2. 手动将自定义逻辑迁移到新的文件结构
3. 更新 `customizations.md` 文档记录新的自定义位置

### Q4: 忘记备份就强制推送了怎么办？

**解决方案**：
```bash
# 1. 查看 reflog 找到之前的提交
git reflog

# 2. 恢复到之前的提交（假设是 HEAD@{5}）
git reset --hard HEAD@{5}

# 3. 重新创建备份分支
git branch dev-backup
```

## 版本升级历史记录

| 时间 | 从版本 | 到版本 | 执行人 | 备注 |
|------|--------|--------|--------|------|
| 2025-11-24 | main (c74ebcd8d) | release/1.10.0 (a47276ac2) | Claude | 初始重建，建立基于 release 的开发流程 |

## 最佳实践建议

1. **小步快跑**：不要等待多个大版本才升级，尽量跟随官方节奏升级
2. **保持文档更新**：每次升级或修改后：
   - 在 `customizations/` 目录创建新的日期文件
   - 更新 `customizations/README.md` 的历史记录表格
   - 更新本文档的"版本升级历史记录"
3. **自动化测试**：编写自动化测试脚本验证自定义功能
4. **定期备份**：每个月至少创建一次备份分支
5. **使用 Git 标签**：重要节点打标签便于回退

## 相关文档

- [自定义修改记录](./customizations/)
- [Dify 官方 CHANGELOG](https://github.com/langgenius/dify/blob/main/CHANGELOG.md)
