'use client'

import React from 'react'
import cn from '@/utils/classnames'

type NavItemWrapperProps = {
  children: React.ReactNode
  expand: boolean
  className?: string
}

/**
 * 侧边栏导航项统一包装器
 * 应用统一的样式规范：
 * - 展开时宽度 194px，高度 43px
 * - 圆角 10px
 * - 选中状态背景色 #D7E6FF
 * - 垂直 padding 15px
 */
const NavItemWrapper: React.FC<NavItemWrapperProps> = ({
  children,
  expand,
  className,
}) => {
  return (
    <div
      className={cn(
        'nav-item-wrapper',
        expand ? 'w-[194px]' : 'w-10',
        className,
      )}
      style={{
        minHeight: expand ? '43px' : '40px',
      }}
    >
      {children}
    </div>
  )
}

export default NavItemWrapper
