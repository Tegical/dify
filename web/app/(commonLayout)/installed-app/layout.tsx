'use client'
import type { FC, PropsWithChildren } from 'react'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ExploreContext from '@/context/explore-context'
import { useAppContext } from '@/context/app-context'
import { fetchMembers } from '@/service/common'
import type { InstalledApp } from '@/models/explore'
import { useGetInstalledApps } from '@/service/use-explore'

const InstalledAppLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter()
  const [controlUpdateInstalledApps, setControlUpdateInstalledApps] = useState(0)
  const { userProfile, isCurrentWorkspaceDatasetOperator } = useAppContext()
  const [hasEditPermission, setHasEditPermission] = useState(false)
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([])
  const [isFetchingInstalledApps, setIsFetchingInstalledApps] = useState(false)
  const { isFetching: isFetchingInstalledAppsData, data: ret, refetch: fetchInstalledAppList } = useGetInstalledApps()

  useEffect(() => {
    (async () => {
      const { accounts } = await fetchMembers({ url: '/workspaces/current/members', params: {} })
      if (!accounts)
        return
      const currUser = accounts.find(account => account.id === userProfile.id)
      setHasEditPermission(currUser?.role !== 'normal')
    })()
  }, [])

  useEffect(() => {
    if (isCurrentWorkspaceDatasetOperator)
      return router.replace('/datasets')
  }, [isCurrentWorkspaceDatasetOperator])

  useEffect(() => {
    const installed_apps = (ret as any)?.installed_apps
    if (installed_apps && installed_apps.length > 0)
      setInstalledApps(installed_apps)
    else
      setInstalledApps([])
  }, [ret])

  useEffect(() => {
    setIsFetchingInstalledApps(isFetchingInstalledAppsData)
  }, [isFetchingInstalledAppsData])

  useEffect(() => {
    fetchInstalledAppList()
  }, [controlUpdateInstalledApps, fetchInstalledAppList])

  return (
    <ExploreContext.Provider
      value={
        {
          controlUpdateInstalledApps,
          setControlUpdateInstalledApps,
          hasEditPermission,
          installedApps,
          setInstalledApps,
          isFetchingInstalledApps,
          setIsFetchingInstalledApps,
        }
      }
    >
      {children}
    </ExploreContext.Provider>
  )
}

export default React.memo(InstalledAppLayout)
