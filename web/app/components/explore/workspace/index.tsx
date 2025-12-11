'use client'
import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useContext } from 'use-context-selector'
import { useSelectedLayoutSegments } from 'next/navigation'
import cn from '@/utils/classnames'
import ExploreContext from '@/context/explore-context'
import AppIcon from '@/app/components/base/app-icon'
import s from './style.module.css'

export type IWorkspaceProps = {
  controlUpdateInstalledApps: number
}

const Workspace: FC<IWorkspaceProps> = () => {
  const { t } = useTranslation()
  const segments = useSelectedLayoutSegments()
  const lastSegment = segments.slice(-1)[0]
  const { installedApps } = useContext(ExploreContext)

  return (
    <div className='mx-auto w-full max-w-[1634px]'>
      <div className='rounded-[20px] bg-white' style={{ height: '260px' }}>
        <div className={cn('h-full overflow-y-auto p-5', s.scrollContainer)}>
          <p className='mb-4 text-xl font-semibold text-text-secondary'>{t('explore.sidebar.workspace')}</p>
          {installedApps.length === 0 ? (
            <div className='flex h-[180px] items-center justify-center text-text-tertiary'>
              {t('explore.sidebar.noInstalledApps') || '暂无已安装应用'}
            </div>
          ) : (
            <div className='flex flex-wrap gap-5'>
              {installedApps.map(({ id, app: { name, icon_type, icon, icon_url, icon_background } }) => {
                const isSelected = lastSegment?.toLowerCase() === id
                return (
                  <div
                    key={id}
                    className={cn(
                      'group relative flex h-[68px] w-[240px] cursor-pointer items-center gap-3 rounded-[10px] bg-[#F8F9FA] px-3 transition-all duration-200',
                      isSelected && 'ring-2 ring-blue-500',
                      'hover:shadow-md',
                    )}
                    onClick={() => window.open(`/installed-app/${id}`, '_blank')}
                    title={name}
                  >
                    <div className='shrink-0'>
                      <AppIcon
                        size='medium'
                        iconType={icon_type}
                        icon={icon}
                        background={icon_background}
                        imageUrl={icon_url}
                      />
                    </div>
                    <div className='w-0 grow overflow-hidden'>
                      <div className='truncate text-sm font-semibold text-text-secondary'>
                        {name}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(Workspace)
