'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { API_PREFIX } from '@/config'
import { getPurifyHref } from '@/utils'
import Loading from '@/app/components/base/loading'

/**
 * SSO 自动登录页面
 * 访问此页面后自动跳转到 Ruoyi OAuth 登录
 */
const SSOSignIn = () => {
  const searchParams = useSearchParams()

  useEffect(() => {
    // 构建 OAuth 登录 URL
    const oauthUrl = getPurifyHref(`${API_PREFIX}/oauth/login/ruoyi`)

    // 如果有 invite_token，附加到 URL
    if (searchParams.has('invite_token'))
      window.location.href = `${oauthUrl}?${searchParams.toString()}`

    else
      window.location.href = oauthUrl
  }, [searchParams])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <Loading />
      <p className="system-sm-regular mt-4 text-text-secondary">
        正在跳转到 SSO 登录...
      </p>
    </div>
  )
}

export default SSOSignIn
