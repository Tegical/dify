# Dify 自定义修改清单

本文档记录 Tegical 团队对 Dify 项目所做的所有自定义修改。

## 当前版本信息

- **基础版本**: release/1.10.0 (commit: a47276ac2)
- **自定义版本**: dev (commit: a0e901ed2)
- **最后更新时间**: 2025-11-24

## 自定义修改列表

### 1. Header 组件修改

**文件**: `web/app/components/header/index.tsx`

**修改内容**:
- 注释掉 Dify Logo 显示
- 注释掉 Workspace 选择器
- 注释掉工作区导航
- 注释掉账户下拉菜单（Account Dropdown）

**修改原因**: 移除官方品牌元素，准备自定义品牌展示

**影响范围**: 所有页面的顶部 Header

**代码位置**:
```typescript
// 第 48-64 行：注释掉 Logo 和 Workspace 导航
{/*<Link href="/apps" className='flex h-8 shrink-0 items-center justify-center px-0.5'>*/}
{/*  {systemFeatures.branding.enabled && systemFeatures.branding.workspace_logo*/}
{/*    ? <img*/}
{/*      src={systemFeatures.branding.workspace_logo}*/}
{/*      className='block h-[22px] w-auto object-contain'*/}
{/*      alt='logo'*/}
{/*    />*/}
{/*    : <DifyLogo />}*/}
{/*</Link>*/}
{/*<div className='mx-1.5 shrink-0 font-light text-divider-deep'>/</div>*/}
{/*<WorkspaceProvider>*/}
{/*  <WorkplaceSelector />*/}
{/*</WorkspaceProvider>*/}
{/*{enableBilling ? <PlanBadge allowHover sandboxAsUpgrade plan={plan.type} onClick={handlePlanClick} /> : <LicenseNav />}*/}

// 第 69 行：注释掉账户下拉菜单
{/*<AccountDropdown />*/}
```

### 2. Footer 组件修改

**文件**: `web/app/components/apps/footer.tsx`

**修改内容**:
- 注释掉 "Join our community" 标题
- 注释掉社区介绍文字
- 注释掉 GitHub、Discord、Forum 链接
- 注释掉所有未使用的导入和组件定义

**修改原因**: 移除官方社区推广内容

**影响范围**: 应用列表页面底部

**代码位置**:
```typescript
// 第 2-4 行：注释掉未使用的导入
// import Link from 'next/link'
// import { RiDiscordFill, RiGithubFill } from '@remixicon/react'
// import { useTranslation } from 'react-i18next'

// 第 6-25 行：注释掉 CustomLink 组件定义

// 第 28 行：注释掉 useTranslation
// const { t } = useTranslation()

// 第 32-44 行：注释掉整个 footer 内容
{/*<h3 className='text-gradient text-xl font-semibold leading-tight'>{t('app.join')}</h3>*/}
{/*<p className='system-sm-regular mt-1 text-text-tertiary'>{t('app.communityIntro')}</p>*/}
{/*<div className='mt-3 flex items-center gap-2'>*/}
{/*  <CustomLink href='https://github.com/langgenius/dify'>*/}
{/*    <RiGithubFill className='h-5 w-5 text-text-tertiary' />*/}
{/*  </CustomLink>*/}
{/*  <CustomLink href='https://discord.gg/FngNHpbcY7'>*/}
{/*    <RiDiscordFill className='h-5 w-5 text-text-tertiary' />*/}
{/*  </CustomLink>*/}
{/*  <CustomLink href='https://forum.dify.ai'>*/}
{/*    <RiDiscussLine className='h-5 w-5 text-text-tertiary' />*/}
{/*  </CustomLink>*/}
{/*</div>*/}
```

### 3. 聊天组件 "Powered by" 品牌移除

**文件**: `web/app/components/share/text-generation/index.tsx`

**修改内容**:
- 注释掉 "Powered by Dify" 品牌显示

**修改原因**: 移除官方品牌标识

**影响范围**: 文本生成分享页面

### 4. 嵌入式聊天组件品牌移除

**文件**:
- `web/app/components/base/chat/embedded-chatbot/index.tsx`
- `web/app/components/base/chat/embedded-chatbot/header/index.tsx`

**修改内容**:
- 注释掉聊天机器人组件中的 "Powered by" 品牌显示
- 注释掉 header 中的品牌元素

**修改原因**: 移除官方品牌标识

**影响范围**: 嵌入式聊天机器人组件

### 5. 数据集 Footer 修改

**文件**: `web/app/components/datasets/list/dataset-footer/index.tsx`

**修改内容**:
- 注释掉数据集页面底部的介绍文字和社区链接

**修改原因**: 移除官方社区推广内容

**影响范围**: 数据集列表页面底部

### 6. Docker 镜像源修改

**文件**: `web/Dockerfile`

**修改内容**:
- 将 Node.js 基础镜像从 Docker Hub 改为 Harbor 私有仓库

**修改前**:
```dockerfile
FROM node:20.18-alpine AS base
```

**修改后**:
```dockerfile
FROM harbor.tegic.com/dockerhub/library/node:20.18-alpine AS base
```

**修改原因**:
- 使用内部 Harbor 镜像仓库
- 避免 Docker Hub 拉取限制
- 提高构建速度和稳定性

**影响范围**: Docker 构建过程

## 未修改的功能

以下功能保持 Dify 官方原版，未做修改：

- 后端 API 全部功能
- 数据库结构
- 核心业务逻辑
- 工作流引擎
- RAG 管道
- 模型管理
- 权限系统
- 多语言支持

## 技术债务和待优化项

### 1. ESLint 警告

部分注释掉的代码可能导致 ESLint 警告：
- 未使用的变量
- 未使用的导入
- 注释代码块（sonarjs/no-commented-code）

**解决方案**：
- 方案 A：完全删除注释的代码和导入（推荐，但升级时需要重新添加）
- 方案 B：保持注释，使用 ESLint 禁用特定规则（便于升级对比）
- 方案 C：添加 ESLint 配置排除这些文件

**当前采用**：方案 B，便于未来版本升级时对比差异

### 2. 品牌定制待完善

当前只是移除了官方品牌，但未添加自定义品牌：
- [ ] 添加 Tegical Logo
- [ ] 自定义 Workspace 名称
- [ ] 自定义 Footer 内容
- [ ] 自定义社区链接（如果需要）

### 3. 测试覆盖

自定义修改后需要补充的测试：
- [ ] Header 组件的集成测试
- [ ] Footer 组件的集成测试
- [ ] 嵌入式聊天组件测试

## 升级注意事项

在升级 Dify 版本时，需要特别关注以下文件的变更：

| 文件 | 关注点 | 升级难度 |
|------|--------|---------|
| `web/app/components/header/index.tsx` | 组件结构变化、Props 变化 | 中等 |
| `web/app/components/apps/footer.tsx` | 社区链接更新 | 低 |
| `web/Dockerfile` | Node.js 版本更新 | 低 |
| 其他聊天组件 | 品牌显示位置变化 | 低 |

**升级策略**：
1. 对比新旧版本文件差异
2. 手动合并自定义修改
3. 运行测试验证功能
4. 更新本文档记录变更

## 相关配置文件

除了代码修改，以下配置可能也需要自定义：

- [ ] `.env` 环境变量配置
- [ ] `docker-compose.yaml` 容器配置
- [ ] 品牌资源文件（Logo、图标等）

## 变更历史

| 日期 | 变更内容 | 提交哈希 | 变更人 |
|------|---------|---------|--------|
| 2025-11-24 | 初始自定义：移除官方品牌元素，修改 Docker 镜像源 | a0e901ed2 | Claude |

## 参考文档

- [版本升级指南](./version-upgrade.md)
- [Dify 官方文档](https://docs.dify.ai/)
- [Dify GitHub 仓库](https://github.com/langgenius/dify)
