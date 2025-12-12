'use client'

import React, { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAppContext } from '@/context/app-context'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import AppNav from '../header/app-nav'
import DatasetNav from '../header/dataset-nav'
import PluginsNav from '../header/plugins-nav'
import ExploreNav from '../header/explore-nav'
import ToolsNav from '../header/tools-nav'
import NavItemWrapper from './nav-item-wrapper'
import { useStore as useAppStore } from '@/app/components/app/store'
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react'
import cn from '@/utils/classnames'

const GlobalSidebar = () => {
  const { isCurrentWorkspaceEditor, isCurrentWorkspaceDatasetOperator } = useAppContext()
  const media = useBreakpoints()
  const isMobile = media === MediaType.mobile

  const { globalSidebarExpand, setGlobalSidebarExpand } = useAppStore(useShallow(state => ({
    globalSidebarExpand: state.globalSidebarExpand,
    setGlobalSidebarExpand: state.setGlobalSidebarExpand,
  })))

  const sidebarOpen = globalSidebarExpand === 'expand'

  const toggleSidebar = useCallback(() => {
    setGlobalSidebarExpand(sidebarOpen ? 'collapse' : 'expand')
  }, [sidebarOpen, setGlobalSidebarExpand])

  // 移动端布局 - 暂时保持简单
  if (isMobile) {
    return (
      <div className="flex h-14 shrink-0 flex-col border-r border-divider-burn bg-background-default-subtle">
        <div className="flex h-14 items-center justify-between px-3">
          {/* 移动端内容 */}
        </div>
      </div>
    )
  }

  // 桌面端垂直侧边栏
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col overflow-hidden border-r border-white/20 backdrop-blur-sm transition-all duration-300',
        sidebarOpen ? 'w-[261px]' : 'w-[70px]',
      )}
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
    >
      {/* 中部导航区域 */}
      <nav className={cn(
        'flex grow flex-col gap-y-[15px] overflow-y-auto overflow-x-hidden pb-[15px] pt-[24px]',
        sidebarOpen ? 'pl-[30px] pr-[37px]' : 'px-[15px]',
      )}>
        {!isCurrentWorkspaceDatasetOperator && (
          <NavItemWrapper expand={sidebarOpen}>
            <ExploreNav
              iconOnly={!sidebarOpen}
              className={cn(
                'flex items-center rounded-[10px] text-lg font-medium transition-all',
                sidebarOpen ? 'h-[43px] w-[194px] px-4' : 'h-[40px] w-[40px] justify-center',
              )}
            />
          </NavItemWrapper>
        )}

        {!isCurrentWorkspaceDatasetOperator && (
          <NavItemWrapper expand={sidebarOpen}>
            <AppNav iconOnly={!sidebarOpen} />
          </NavItemWrapper>
        )}

        {(isCurrentWorkspaceEditor || isCurrentWorkspaceDatasetOperator) && (
          <NavItemWrapper expand={sidebarOpen}>
            <DatasetNav iconOnly={!sidebarOpen} />
          </NavItemWrapper>
        )}

        {!isCurrentWorkspaceDatasetOperator && (
          <NavItemWrapper expand={sidebarOpen}>
            <ToolsNav
              iconOnly={!sidebarOpen}
              className={cn(
                'flex items-center rounded-[10px] text-lg font-medium transition-all',
                sidebarOpen ? 'h-[43px] w-[194px] px-4' : 'h-[40px] w-[40px] justify-center',
              )}
            />
          </NavItemWrapper>
        )}

        {!isCurrentWorkspaceDatasetOperator && (
          <NavItemWrapper expand={sidebarOpen}>
            <PluginsNav
              iconOnly={!sidebarOpen}
              className={cn(
                'flex items-center rounded-[10px] text-lg font-medium transition-all',
                sidebarOpen ? 'h-[43px] w-[194px]' : 'h-[40px] w-[40px] justify-center',
              )}
            />
          </NavItemWrapper>
        )}
      </nav>

      {/* 收起/展开按钮 */}
      <div className={cn(
        'border-t border-white/20',
        sidebarOpen ? 'px-4 py-4' : 'px-[15px] py-4',
      )}>
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            sidebarOpen ? 'space-x-3' : 'justify-center',
          )}
          style={{
            color: '#65748a',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#0e1422'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#65748a'
          }}
          aria-label={sidebarOpen ? '折叠侧边栏' : '展开侧边栏'}
        >
          {sidebarOpen ? (
            <>
              <RiArrowLeftSLine className="h-5 w-5 shrink-0" />
              <span>收起</span>
            </>
          ) : (
            <RiArrowRightSLine className="h-5 w-5 shrink-0" />
          )}
        </button>
      </div>
    </div>
  )
}

export default GlobalSidebar
