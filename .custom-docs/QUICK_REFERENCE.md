# 快速参考手册

常用命令和操作的速查表。

## 📋 分支管理

### 查看分支状态
```bash
# 查看所有分支及跟踪关系
git branch -vv

# 查看远程分支
git fetch origin
git branch -r

# 查看分支图
git log --graph --oneline --all -20
```

### 创建备份
```bash
# 备份当前分支（带时间戳）
git branch dev-backup-$(date +%Y%m%d) dev

# 查看所有备份
git branch | grep backup
```

### 清理旧备份
```bash
# 列出所有备份分支
git branch | grep backup

# 删除特定备份
git branch -D dev-backup-20251124

# 批量删除30天前的备份（谨慎使用）
git for-each-ref --format='%(refname:short) %(creatordate:short)' refs/heads/ | \
  grep backup | \
  awk '$2 < "'$(date -v-30d +%Y-%m-%d)'" {print $1}' | \
  xargs -I {} git branch -D {}
```

## 🔄 版本升级

### 场景 1: 基于 release 分支升级（推荐）

```bash
# 1. 获取最新代码
git fetch origin

# 2. 确认新版本存在
git branch -r | grep release/1.20.0

# 3. 备份当前分支
git checkout dev
git branch dev-1.10.0-backup dev

# 4. 基于新版本重建
git checkout origin/release/1.20.0
git checkout -b dev-new

# 5. 应用自定义修改
git checkout dev-1.10.0-backup -- \
  web/Dockerfile \
  web/app/components/header/index.tsx \
  web/app/components/apps/footer.tsx \
  web/app/components/share/text-generation/index.tsx \
  web/app/components/base/chat/embedded-chatbot/index.tsx \
  web/app/components/base/chat/embedded-chatbot/header/index.tsx \
  web/app/components/datasets/list/dataset-footer/index.tsx

# 6. 检查和提交
git status
git diff --cached
git commit -m "chore: upgrade to 1.20.0 with UI customizations"

# 7. 替换并推送
git branch -M dev-new dev
git push origin dev --force-with-lease
```

### 场景 2: Rebase 升级

```bash
# 1. 备份
git checkout dev
git branch dev-1.10.0-backup dev

# 2. Rebase
git rebase origin/release/1.20.0

# 3. 如有冲突，解决后继续
git status  # 查看冲突文件
# 手动编辑冲突文件
git add <冲突文件>
git rebase --continue

# 4. 推送
git push origin dev --force-with-lease
```

### 紧急回退

```bash
# 方法 1: 使用备份分支
git checkout dev-1.10.0-backup
git branch -M dev-1.10.0-backup dev
git push origin dev --force-with-lease

# 方法 2: 使用 reflog
git reflog  # 找到之前的提交
git reset --hard HEAD@{5}  # 回退到特定提交
git push origin dev --force-with-lease
```

## 📝 文档管理

### 记录新的自定义修改

```bash
# 1. 创建新的自定义记录文件
DATE=$(date +%Y%m%d)
vim .custom-docs/customizations/${DATE}-your-change-description.md

# 2. 更新 customizations/README.md 的历史记录表格

# 3. 提交文档
git add .custom-docs/
git commit -m "docs: add customization record for [简要说明]"
git push origin dev
```

### 自定义记录模板

```markdown
# [修改标题]

## 修改信息

- **日期**: $(date +%Y-%m-%d)
- **版本**: release/1.10.0
- **提交**: $(git rev-parse --short HEAD)
- **执行人**: Your Name
- **影响范围**: [前端/后端/全栈]

## 修改原因

为什么要做这个修改。

## 修改内容

### 1. [修改项1]

**文件**: 文件路径

**修改说明**: ...

## 测试验证

- [ ] 功能测试通过
- [ ] Lint 检查通过
- [ ] 单元测试通过

## 升级注意事项

未来升级时需要注意的点。
```

## 🧪 测试验证

### 前端测试

```bash
cd web

# 安装依赖
pnpm install

# Lint 检查
pnpm lint

# 自动修复
pnpm lint:fix

# 类型检查
pnpm type-check

# 运行测试
pnpm test

# 本地启动
pnpm dev
```

### 后端测试

```bash
cd api

# 同步依赖
uv sync

# Lint 检查
make lint

# 类型检查
make type-check

# 运行单元测试
uv run --dev dev/pytest/pytest_unit_tests.sh

# 本地启动
uv run --dev python -m flask run
```

### Docker 验证

```bash
# 构建镜像
docker build -t dify-custom:test .

# 查看镜像信息
docker images dify-custom:test
docker history dify-custom:test

# 启动服务
cd docker
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 🔍 查看自定义内容

### 查看自定义文件列表

```bash
# 查看相对于 release/1.10.0 的所有修改文件
git diff release/1.10.0 --name-only

# 查看具体修改内容
git diff release/1.10.0 web/app/components/header/index.tsx

# 查看所有修改的统计
git diff release/1.10.0 --stat
```

### 查看提交历史

```bash
# 查看 dev 分支的提交历史
git log --oneline -10

# 查看自定义相关的提交
git log --oneline --grep="custom"

# 查看某个文件的修改历史
git log --oneline -- web/app/components/header/index.tsx
```

## 🏷️ 标签管理

### 创建标签

```bash
# 创建带注释的标签
git tag -a v1.10.0-custom -m "Tegical customized version based on Dify 1.10.0"

# 推送标签
git push origin v1.10.0-custom

# 推送所有标签
git push origin --tags
```

### 查看和使用标签

```bash
# 查看所有标签
git tag

# 查看标签详情
git show v1.10.0-custom

# 基于标签创建分支
git checkout -b dev-from-tag v1.10.0-custom
```

## 📊 项目信息

### 查看项目统计

```bash
# 代码行数统计
git ls-files | grep -E '\.(tsx?|py)$' | xargs wc -l

# 提交统计
git shortlog -sn --no-merges

# 查看最近活跃的文件
git log --pretty=format: --name-only | sort | uniq -c | sort -rg | head -20
```

### 检查依赖

```bash
# 前端依赖
cd web && pnpm list --depth=0

# 后端依赖
cd api && uv tree --depth=1

# 检查过期依赖
cd web && pnpm outdated
```

## 🚨 常见问题快速解决

### 合并冲突

```bash
# 查看冲突文件
git status

# 使用工具解决冲突
git mergetool

# 或手动编辑后
git add <冲突文件>

# 完成合并/rebase
git merge --continue
# 或
git rebase --continue
```

### 误操作恢复

```bash
# 撤销工作区修改
git restore <文件>

# 撤销暂存
git restore --staged <文件>

# 撤销最近的提交（保留修改）
git reset --soft HEAD^

# 撤销最近的提交（丢弃修改）
git reset --hard HEAD^

# 查找丢失的提交
git reflog
git reset --hard <commit-hash>
```

### 清理工作区

```bash
# 查看会被删除的文件
git clean -n

# 删除未跟踪的文件
git clean -f

# 删除未跟踪的文件和目录
git clean -fd

# 重置工作区到干净状态
git reset --hard HEAD
git clean -fd
```

## 📱 有用的别名

添加到 `~/.gitconfig`:

```ini
[alias]
    st = status
    co = checkout
    br = branch -vv
    ci = commit
    unstage = restore --staged
    last = log -1 HEAD
    lg = log --graph --oneline --decorate --all -20
    backup = "!git branch dev-backup-$(date +%Y%m%d) dev"
    diff-release = diff release/1.10.0
```

使用示例：
```bash
git st               # status
git co dev          # checkout dev
git br              # branch -vv
git backup          # 创建备份
git lg              # 查看分支图
git diff-release    # 查看相对release的修改
```

## 📞 获取帮助

- 查看完整文档: `cat .custom-docs/README.md`
- 版本升级指南: `cat .custom-docs/version-upgrade.md`
- 自定义记录: `ls .custom-docs/customizations/`
- Git 帮助: `git help <command>`
