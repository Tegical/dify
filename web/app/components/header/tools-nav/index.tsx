'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import {
  RiHammerFill,
  RiHammerLine,
} from '@remixicon/react'
import classNames from '@/utils/classnames'
type ToolsNavProps = {
  className?: string
  iconOnly?: boolean
}

const ToolsNav = ({
  className,
  iconOnly = false,
}: ToolsNavProps) => {
  const { t } = useTranslation()
  const selectedSegment = useSelectedLayoutSegment()
  const activated = selectedSegment === 'tools'

  return (
    <Link href="/tools" className={classNames(
      'group text-lg font-medium',
      activated && 'font-semibold shadow-md',
      activated ? 'text-components-main-nav-nav-button-text-active' : 'text-components-main-nav-nav-button-text',
      className,
    )}
    style={activated ? { backgroundColor: '#D7E6FF' } : undefined}
    >
      {
        activated
          ? <RiHammerFill className='h-4 w-4 shrink-0' />
          : <RiHammerLine className='h-4 w-4 shrink-0' />
      }
      {!iconOnly && (
        <div className='ml-2 whitespace-nowrap max-[1024px]:hidden'>
          {t('common.menus.tools')}
        </div>
      )}
    </Link>
  )
}

export default ToolsNav
