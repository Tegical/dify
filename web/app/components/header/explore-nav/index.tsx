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
}

const ExploreNav = ({
  className,
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
          ? <RiPlanetFill className='h-4 w-4' />
          : <RiPlanetLine className='h-4 w-4' />
      }
      <div className='ml-2 max-[1024px]:hidden'>
        {t('common.menus.explore')}
      </div>
    </Link>
  )
}

export default ExploreNav
