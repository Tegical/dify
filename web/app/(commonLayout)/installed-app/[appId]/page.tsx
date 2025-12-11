import React from 'react'
import Main from '@/app/components/explore/installed-app'

export type IInstalledAppProps = {
  params?: Promise<{
    appId: string
  }>
}

// 独立的已安装应用页面，不包含explore布局
async function InstalledAppPage({ params }: IInstalledAppProps) {
  const { appId } = await (params ?? Promise.reject(new Error('Missing params')))
  return (
    <div className='h-full'>
      <Main id={appId} />
    </div>
  )
}

export default InstalledAppPage
