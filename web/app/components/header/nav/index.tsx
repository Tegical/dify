'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams, useSelectedLayoutSegment } from 'next/navigation'
import classNames from '@/utils/classnames'
import { ArrowNarrowLeft } from '@/app/components/base/icons/src/vender/line/arrows'
import { useStore as useAppStore } from '@/app/components/app/store'

type INavProps = {
  icon: React.ReactNode
  activeIcon?: React.ReactNode
  text: string
  activeSegment: string | string[]
  link: string
  isApp?: boolean
  iconOnly?: boolean
  curNav?: any
  navigationItems?: any[]
  createText?: string
  onCreate?: (state: string) => void
  onLoadMore?: () => void
}

const Nav = ({
  icon,
  activeIcon,
  text,
  activeSegment,
  link,
  curNav,
  iconOnly = false,
}: INavProps) => {
  const setAppDetail = useAppStore(state => state.setAppDetail)
  const [hovered, setHovered] = useState(false)
  const segment = useSelectedLayoutSegment()
  const isActivated = Array.isArray(activeSegment) ? activeSegment.includes(segment!) : segment === activeSegment
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [linkLastSearchParams, setLinkLastSearchParams] = useState('')

  useEffect(() => {
    if (pathname === link)
      setLinkLastSearchParams(searchParams.toString())
  }, [pathname, searchParams])

  return (
    <div className="flex items-center">
      <Link href={link + (linkLastSearchParams && `?${linkLastSearchParams}`)}>
        <div
          onClick={() => setAppDetail()}
          className={classNames(
            'flex cursor-pointer items-center rounded-[10px] text-lg font-medium transition-all',
            iconOnly ? 'h-[40px] w-[40px] justify-center' : 'h-[43px] w-[194px] px-4',
            isActivated && 'font-semibold shadow-md',
            isActivated ? 'text-components-main-nav-nav-button-text-active' : 'text-components-main-nav-nav-button-text',
          )}
          style={isActivated ? { backgroundColor: '#D7E6FF' } : undefined}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className='shrink-0'>
            {(hovered && curNav && !iconOnly) && <ArrowNarrowLeft className='h-4 w-4' />}
            {!(hovered && curNav && !iconOnly) && isActivated && activeIcon}
            {!(hovered && curNav && !iconOnly) && !isActivated && icon}
          </div>
          {!iconOnly && (
            <div className='ml-2 whitespace-nowrap'>
              {text}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}

export default Nav
