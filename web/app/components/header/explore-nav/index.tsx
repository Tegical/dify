'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import {
  RiPlanetFill,
  RiPlanetLine,
} from '@remixicon/react'
import classNames from '@/utils/classnames'
type ExploreNavProps = {
  className?: string
  iconOnly?: boolean
}

const ExploreNav = ({
  className,
  iconOnly = false,
}: ExploreNavProps) => {
  const { t } = useTranslation()
  const selectedSegment = useSelectedLayoutSegment()
  const activated = selectedSegment === 'explore'

  return (
    <Link href="/explore/apps" className={classNames(
      className, 'group',
      activated && 'shadow-md',
      activated ? 'text-components-main-nav-nav-button-text-active' : 'text-components-main-nav-nav-button-text',
    )}
    style={activated ? { backgroundColor: '#D7E6FF' } : undefined}
    >
      {
        activated
          ? <RiPlanetFill className='h-4 w-4 shrink-0' />
          : <RiPlanetLine className='h-4 w-4 shrink-0' />
      }
      {!iconOnly && (
        <div className='ml-2 whitespace-nowrap max-[1024px]:hidden'>
          {t('common.menus.explore')}
        </div>
      )}
    </Link>
  )
}

export default ExploreNav
