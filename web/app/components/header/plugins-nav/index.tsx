'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import classNames from '@/utils/classnames'
import { Group } from '@/app/components/base/icons/src/vender/other'
import { useSelectedLayoutSegment } from 'next/navigation'
import DownloadingIcon from './downloading-icon'
import { usePluginTaskStatus } from '@/app/components/plugins/plugin-page/plugin-tasks/hooks'
import Indicator from '@/app/components/header/indicator'

type PluginsNavProps = {
  className?: string
  iconOnly?: boolean
}

const PluginsNav = ({
  className,
  iconOnly = false,
}: PluginsNavProps) => {
  const { t } = useTranslation()
  const selectedSegment = useSelectedLayoutSegment()
  const activated = selectedSegment === 'plugins'
  const {
    isInstalling,
    isInstallingWithError,
    isFailed,
  } = usePluginTaskStatus()

  return (
    <Link href="/plugins" className={classNames(
      className, 'group', 'plugins-nav-button', // used for use-fold-anim-into.ts
    )}>
      <div
        className={classNames(
          'relative flex items-center gap-2 rounded-[10px] border border-transparent text-lg font-medium transition-all',
          iconOnly ? 'h-[40px] w-[40px] justify-center' : 'h-[43px] w-[194px] justify-start px-4',
          activated && 'border-components-main-nav-nav-button-border text-components-main-nav-nav-button-text shadow-md',
          !activated && 'text-text-tertiary hover:text-text-secondary',
          (isInstallingWithError || isFailed) && !activated && 'border-components-panel-border-subtle',
        )}
        style={activated ? { backgroundColor: '#D7E6FF' } : undefined}
      >
        {
          (isFailed || isInstallingWithError) && !activated && (
            <Indicator
              color='red'
              className='absolute left-[-1px] top-[-1px]'
            />
          )
        }
        <div className='flex h-4 w-4 shrink-0 items-center justify-center'>
          {
            (!(isInstalling || isInstallingWithError) || activated) && (
              <Group className='h-4 w-4' />
            )
          }
          {
            (isInstalling || isInstallingWithError) && !activated && (
              <DownloadingIcon />
            )
          }
        </div>
        {!iconOnly && <span className='whitespace-nowrap'>{t('common.menus.plugins')}</span>}
      </div>
    </Link>
  )
}

export default PluginsNav
