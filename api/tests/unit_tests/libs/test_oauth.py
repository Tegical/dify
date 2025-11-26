from __future__ import annotations

from unittest.mock import MagicMock

import libs.oauth as oauth_module


def test_ruoyi_oauth_exchanges_code_and_normalizes_user_info(monkeypatch) -> None:
    provider_class = getattr(oauth_module, "RuoyiOAuth", None)
    assert provider_class is not None

    provider = provider_class(
        client_id="client-id",
        client_secret="client-secret",
        redirect_uri="https://console.example.com/console/api/oauth/authorize/ruoyi",
        base_url="https://ruoyi.example.com/",
    )
    client = MagicMock()
    client.post.return_value.json.return_value = {"code": 0, "data": {"accessToken": "access-token"}}
    client.get.return_value.json.return_value = {"code": 0, "data": {"userId": 42, "nickname": "Ruo Yi"}}
    monkeypatch.setattr(oauth_module, "_http_client", client)

    token = provider.get_access_token("authorization-code")
    user = provider.get_user_info(token)

    assert token == "access-token"
    assert user.id == "42"
    assert user.name == "Ruo Yi"
    assert user.email == "42@ruoyi.local"
    assert client.post.call_args.args[0] == "https://ruoyi.example.com/system/oauth2/token"
    assert client.get.call_args.args[0] == "https://ruoyi.example.com/system/user/profile/get"
