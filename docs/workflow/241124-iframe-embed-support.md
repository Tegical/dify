# iframe 嵌入支持方案

## 背景

当前 Dify 的 Cookie 设置使用 `SameSite=Lax`，导致第三方应用通过 iframe 嵌入 Dify 页面时无法完成登录（Cookie 无法跨站设置/发送）。

## 目标

通过配置开关支持全面的 iframe 嵌入，包括 Console、Web App 及所有系统界面。

## 技术方案

### 核心改动

新增 `COOKIE_SAMESITE` 环境变量，支持配置 Cookie 的 SameSite 策略：

| 值 | 说明 | 适用场景 |
|---|---|---|
| `Lax`（默认） | 标准安全策略 | 独立部署，不需要 iframe 嵌入 |
| `Strict` | 最严格策略 | 高安全要求场景 |
| `None` | 允许跨站 Cookie | 需要被第三方 iframe 嵌入 |

### 安全校验

**`SameSite=None` 必须配合 HTTPS 使用**，否则浏览器会拒绝设置 Cookie。

方案增加启动时校验：
- 当 `COOKIE_SAMESITE=None` 且 `is_secure()=False` 时，输出警告日志
- 提示用户配置 HTTPS 或调整 SameSite 策略

## 需要修改的文件

### 1. 配置定义

**文件**: `api/configs/feature/__init__.py`

**改动**: 在 `HttpConfig` 类中新增配置项

```python
class HttpConfig(BaseSettings):
    # 新增
    COOKIE_SAMESITE: str = Field(
        description="Cookie SameSite policy: Lax, Strict, or None. "
                    "Use 'None' for iframe embedding (requires HTTPS)",
        default="Lax",
    )
```

---

### 2. Cookie 核心逻辑

**文件**: `api/libs/token.py`

**改动内容**:

#### 2.1 新增获取默认 SameSite 的函数

```python
def get_samesite_policy() -> str:
    """获取配置的 SameSite 策略，并进行安全校验"""
    samesite = dify_config.COOKIE_SAMESITE

    # 安全校验：SameSite=None 必须配合 HTTPS
    if samesite == "None" and not is_secure():
        logger.warning(
            "COOKIE_SAMESITE=None requires HTTPS. "
            "Current configuration uses HTTP, which will cause cookies to be rejected by browsers. "
            "Please enable HTTPS or set COOKIE_SAMESITE=Lax"
        )

    return samesite
```

#### 2.2 修改 set_access_token_to_cookie

```python
def set_access_token_to_cookie(request: Request, response: Response, token: str, samesite: str | None = None):
    if samesite is None:
        samesite = get_samesite_policy()
    # ... 其余不变
```

#### 2.3 修改 set_refresh_token_to_cookie

```python
def set_refresh_token_to_cookie(request: Request, response: Response, token: str, samesite: str | None = None):
    if samesite is None:
        samesite = get_samesite_policy()
    response.set_cookie(
        _real_cookie_name(COOKIE_NAME_REFRESH_TOKEN),
        value=token,
        httponly=True,
        domain=_cookie_domain(),
        secure=is_secure(),
        samesite=samesite,  # 改为使用参数
        max_age=int(60 * 60 * 24 * dify_config.REFRESH_TOKEN_EXPIRE_DAYS),
        path="/",
    )
```

#### 2.4 修改 set_csrf_token_to_cookie

```python
def set_csrf_token_to_cookie(request: Request, response: Response, token: str, samesite: str | None = None):
    if samesite is None:
        samesite = get_samesite_policy()
    response.set_cookie(
        _real_cookie_name(COOKIE_NAME_CSRF_TOKEN),
        value=token,
        httponly=False,
        domain=_cookie_domain(),
        secure=is_secure(),
        samesite=samesite,  # 改为使用参数
        max_age=int(60 * dify_config.ACCESS_TOKEN_EXPIRE_MINUTES),
        path="/",
    )
```

---

### 3. OAuth 流程 Cookie（3 个文件）

这些文件中的 `context_id` Cookie 也需要统一使用配置的 SameSite 策略。

#### 3.1 tool_providers.py

**文件**: `api/controllers/console/workspace/tool_providers.py`

**位置**: 第 767-773 行

**改动**: 导入并使用 `get_samesite_policy()`

```python
# 在文件头部添加导入
from libs.token import get_samesite_policy, is_secure

# 修改第 767-773 行
response.set_cookie(
    "context_id",
    context_id,
    httponly=True,
    secure=is_secure(),
    samesite=get_samesite_policy(),
    max_age=OAuthProxyService.__MAX_AGE__,
)
```

#### 3.2 trigger_providers.py

**文件**: `api/controllers/console/workspace/trigger_providers.py`

**位置**: 第 367-373 行

**改动**: 同上

```python
# 在文件头部添加导入
from libs.token import get_samesite_policy, is_secure

# 修改第 367-373 行
response.set_cookie(
    "context_id",
    context_id,
    httponly=True,
    secure=is_secure(),
    samesite=get_samesite_policy(),
    max_age=OAuthProxyService.__MAX_AGE__,
)
```

#### 3.3 datasource_auth.py

**文件**: `api/controllers/console/datasets/rag_pipeline/datasource_auth.py`

**位置**: 第 58-64 行

**改动**: 同上

```python
# 在文件头部添加导入
from libs.token import get_samesite_policy, is_secure

# 修改第 58-64 行
response.set_cookie(
    "context_id",
    context_id,
    httponly=True,
    secure=is_secure(),
    samesite=get_samesite_policy(),
    max_age=OAuthProxyService.__MAX_AGE__,
)
```

---

## 部署配置

### 启用 iframe 嵌入

```bash
# 后端 .env
COOKIE_SAMESITE=None
CONSOLE_WEB_URL=https://dify.example.com
CONSOLE_API_URL=https://api.dify.example.com

# 前端 .env
NEXT_PUBLIC_ALLOW_EMBED=true
```

### 前置条件

1. **必须使用 HTTPS** - `SameSite=None` 要求 `Secure=true`
2. **CORS 配置** - 确保 `CONSOLE_CORS_ALLOW_ORIGINS` 和 `WEB_API_CORS_ALLOW_ORIGINS` 包含嵌入方域名

---

## 文件修改清单

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `api/configs/feature/__init__.py` | 新增配置 | 添加 `COOKIE_SAMESITE` 字段 |
| `api/libs/token.py` | 核心改动 | 新增 `_default_samesite()`，修改 3 个 set cookie 函数 |
| `api/controllers/console/workspace/tool_providers.py` | 统一 SameSite | OAuth context_id Cookie |
| `api/controllers/console/workspace/trigger_providers.py` | 统一 SameSite | OAuth context_id Cookie |
| `api/controllers/console/datasets/rag_pipeline/datasource_auth.py` | 统一 SameSite | OAuth context_id Cookie |

---

## 测试验证

### 功能测试

1. **默认配置（Lax）**
   - 正常登录/登出
   - OAuth 流程正常
   - 同站 iframe 嵌入正常

2. **启用 iframe 模式（None + HTTPS）**
   - 跨站 iframe 登录成功
   - Cookie 正常设置和发送
   - OAuth 流程在 iframe 中正常

3. **错误配置检测（None + HTTP）**
   - 日志中出现警告信息
   - 登录功能异常（预期行为）

### 安全测试

1. CSRF 保护仍然有效
2. Cookie 只在 HTTPS 下设置 Secure 标志

---

## 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 误配置导致登录失效 | 高 | 启动时输出警告日志 |
| 第三方 Cookie 被浏览器阻止 | 中 | Safari ITP 等可能阻止，需用户调整浏览器设置 |
| CSRF 攻击风险增加 | 低 | 保留 CSRF Token 双重验证机制 |

---

## TODO

- [x] 编写实施文档
- [x] 修改 `api/configs/feature/__init__.py`
- [x] 修改 `api/libs/token.py`
- [x] 修改 `api/controllers/console/workspace/tool_providers.py`
- [x] 修改 `api/controllers/console/workspace/trigger_providers.py`
- [x] 修改 `api/controllers/console/datasets/rag_pipeline/datasource_auth.py`
- [x] 代码检查（lint/type-check）
- [ ] 本地测试验证
- [ ] 用户验收确认
