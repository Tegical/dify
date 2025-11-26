import base64
import urllib.parse
from dataclasses import dataclass

import httpx


@dataclass
class OAuthUserInfo:
    id: str
    name: str
    email: str


class OAuth:
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri

    def get_authorization_url(self):
        raise NotImplementedError()

    def get_access_token(self, code: str):
        raise NotImplementedError()

    def get_raw_user_info(self, token: str):
        raise NotImplementedError()

    def get_user_info(self, token: str) -> OAuthUserInfo:
        raw_info = self.get_raw_user_info(token)
        return self._transform_user_info(raw_info)

    def _transform_user_info(self, raw_info: dict) -> OAuthUserInfo:
        raise NotImplementedError()


class GitHubOAuth(OAuth):
    _AUTH_URL = "https://github.com/login/oauth/authorize"
    _TOKEN_URL = "https://github.com/login/oauth/access_token"
    _USER_INFO_URL = "https://api.github.com/user"
    _EMAIL_INFO_URL = "https://api.github.com/user/emails"

    def get_authorization_url(self, invite_token: str | None = None):
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "user:email",  # Request only basic user information
        }
        if invite_token:
            params["state"] = invite_token
        return f"{self._AUTH_URL}?{urllib.parse.urlencode(params)}"

    def get_access_token(self, code: str):
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "redirect_uri": self.redirect_uri,
        }
        headers = {"Accept": "application/json"}
        response = httpx.post(self._TOKEN_URL, data=data, headers=headers)

        response_json = response.json()
        access_token = response_json.get("access_token")

        if not access_token:
            raise ValueError(f"Error in GitHub OAuth: {response_json}")

        return access_token

    def get_raw_user_info(self, token: str):
        headers = {"Authorization": f"token {token}"}
        response = httpx.get(self._USER_INFO_URL, headers=headers)
        response.raise_for_status()
        user_info = response.json()

        email_response = httpx.get(self._EMAIL_INFO_URL, headers=headers)
        email_info = email_response.json()
        primary_email: dict = next((email for email in email_info if email["primary"] == True), {})

        return {**user_info, "email": primary_email.get("email", "")}

    def _transform_user_info(self, raw_info: dict) -> OAuthUserInfo:
        email = raw_info.get("email")
        if not email:
            email = f"{raw_info['id']}+{raw_info['login']}@users.noreply.github.com"
        return OAuthUserInfo(id=str(raw_info["id"]), name=raw_info["name"], email=email)


class GoogleOAuth(OAuth):
    _AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    _TOKEN_URL = "https://oauth2.googleapis.com/token"
    _USER_INFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

    def get_authorization_url(self, invite_token: str | None = None):
        params = {
            "client_id": self.client_id,
            "response_type": "code",
            "redirect_uri": self.redirect_uri,
            "scope": "openid email",
        }
        if invite_token:
            params["state"] = invite_token
        return f"{self._AUTH_URL}?{urllib.parse.urlencode(params)}"

    def get_access_token(self, code: str):
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": self.redirect_uri,
        }
        headers = {"Accept": "application/json"}
        response = httpx.post(self._TOKEN_URL, data=data, headers=headers)

        response_json = response.json()
        access_token = response_json.get("access_token")

        if not access_token:
            raise ValueError(f"Error in Google OAuth: {response_json}")

        return access_token

    def get_raw_user_info(self, token: str):
        headers = {"Authorization": f"Bearer {token}"}
        response = httpx.get(self._USER_INFO_URL, headers=headers)
        response.raise_for_status()
        return response.json()

    def _transform_user_info(self, raw_info: dict) -> OAuthUserInfo:
        return OAuthUserInfo(id=str(raw_info["sub"]), name="", email=raw_info["email"])


class RuoyiOAuth(OAuth):
    """RuoyiVuePro OAuth 集成实现"""

    def __init__(self, client_id: str, client_secret: str, redirect_uri: str, base_url: str):
        """
        初始化 RuoyiVuePro OAuth 客户端

        Args:
            client_id: OAuth 客户端 ID
            client_secret: OAuth 客户端密钥
            redirect_uri: 回调地址
            base_url: RuoyiVuePro 系统的基础 URL（例如：http://localhost:48080）
        """
        super().__init__(client_id, client_secret, redirect_uri)
        self.base_url = base_url.rstrip("/")  # 移除末尾的斜杠
        self._AUTH_URL = f"{self.base_url}/system/oauth2/authorize"
        self._TOKEN_URL = f"{self.base_url}/system/oauth2/token"
        self._USER_INFO_URL = f"{self.base_url}/system/user/profile/get"

    def get_authorization_url(self, invite_token: str | None = None):
        """获取授权 URL"""
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "user.read",  # RuoyiVuePro 的用户信息读取权限
        }
        if invite_token:
            params["state"] = invite_token
        return f"{self._AUTH_URL}?{urllib.parse.urlencode(params)}"

    def get_access_token(self, code: str):
        """
        使用授权码换取访问令牌

        RuoyiVuePro 要求使用 Basic Auth 传递 client_id 和 client_secret
        """
        # 构造 Basic Auth 凭证
        credentials = f"{self.client_id}:{self.client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()

        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": self.redirect_uri,
        }
        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        }

        response = httpx.post(self._TOKEN_URL, data=data, headers=headers, timeout=30.0)

        # 处理响应
        if response.status_code != 200:
            raise ValueError(f"Error in RuoyiVuePro OAuth token request: {response.text}")

        response_json = response.json()

        # RuoyiVuePro 使用统一响应格式 CommonResult
        if response_json.get("code") != 0:
            raise ValueError(f"Error in RuoyiVuePro OAuth: {response_json.get('msg', 'Unknown error')}")

        data_obj = response_json.get("data", {})
        access_token = data_obj.get("accessToken") or data_obj.get("access_token")

        if not access_token:
            raise ValueError(f"No access token in RuoyiVuePro OAuth response: {response_json}")

        return access_token

    def get_raw_user_info(self, token: str):
        """获取用户信息"""
        headers = {
            "Authorization": f"Bearer {token}",
        }
        response = httpx.get(self._USER_INFO_URL, headers=headers, timeout=30.0)

        if response.status_code != 200:
            raise ValueError(f"Error fetching user info from RuoyiVuePro: {response.text}")

        response_json = response.json()

        # 处理 RuoyiVuePro 的 CommonResult 响应格式
        if response_json.get("code") != 0:
            raise ValueError(f"Error in RuoyiVuePro user info: {response_json.get('msg', 'Unknown error')}")

        user_data = response_json.get("data", {})
        return user_data

    def _transform_user_info(self, raw_info: dict) -> OAuthUserInfo:
        """
        转换 RuoyiVuePro 用户信息为标准格式

        RuoyiVuePro 返回的用户信息字段：
        - id / userId: 用户 ID
        - username / nickname: 用户名/昵称
        - email: 邮箱
        """
        # 兼容不同的字段名称
        user_id = raw_info.get("id") or raw_info.get("userId") or raw_info.get("user_id")
        username = raw_info.get("nickname") or raw_info.get("username") or raw_info.get("name")
        email = raw_info.get("email")

        if not user_id:
            raise ValueError("User ID not found in RuoyiVuePro user info")

        # 如果没有邮箱，生成一个默认邮箱
        if not email:
            email = f"{user_id}@ruoyi.local"

        # 如果没有用户名，使用用户 ID
        if not username:
            username = f"User{user_id}"

        return OAuthUserInfo(id=str(user_id), name=username, email=email)
