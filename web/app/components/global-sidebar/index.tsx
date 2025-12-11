'use client'

import React from 'react'
import { useAppContext } from '@/context/app-context'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import AccountDropdown from '../header/account-dropdown'
import AppNav from '../header/app-nav'
import DatasetNav from '../header/dataset-nav'
import PluginsNav from '../header/plugins-nav'
import ExploreNav from '../header/explore-nav'
import ToolsNav from '../header/tools-nav'
import Divider from '../base/divider'
import NavItemWrapper from './nav-item-wrapper'

const GlobalSidebar = () => {
  const { isCurrentWorkspaceEditor, isCurrentWorkspaceDatasetOperator } = useAppContext()
  const media = useBreakpoints()
  const isMobile = media === MediaType.mobile

  // 移动端布局 - 暂时保持简单
  if (isMobile) {
    return (
      <div className="flex h-14 shrink-0 flex-col border-r border-divider-burn bg-background-default-subtle">
        <div className="flex h-14 items-center justify-between px-3">
          <AccountDropdown />
        </div>
      </div>
    )
  }

  // 桌面端垂直侧边栏
  return (
    <div
      className="flex w-[261px] shrink-0 flex-col border-r border-white/20 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
    >
      {/* 中部导航区域 */}
      <nav className="flex grow flex-col gap-y-[15px] overflow-y-auto overflow-x-hidden pb-[15px] pl-[30px] pr-[37px] pt-[24px]">
        {!isCurrentWorkspaceDatasetOperator && (
          <NavItemWrapper expand={true}>
            <ExploreNav className="flex h-[43px] w-[194px] items-center rounded-[10px] px-4 text-lg font-medium transition-all" />
          </NavItemWrapper>
        )}

        {!isCurrentWorkspaceDatasetOperator && (
          <NavItemWrapper expand={true}>
            <AppNav />
          </NavItemWrapper>
        )}

        {(isCurrentWorkspaceEditor || isCurrentWorkspaceDatasetOperator) && (
          <NavItemWrapper expand={true}>
            <DatasetNav />
          </NavItemWrapper>
        )}

        {!isCurrentWorkspaceDatasetOperator && (
          <NavItemWrapper expand={true}>
            <ToolsNav className="flex h-[43px] w-[194px] items-center rounded-[10px] px-4 text-lg font-medium transition-all" />
          </NavItemWrapper>
        )}

        {!isCurrentWorkspaceDatasetOperator && (
          <NavItemWrapper expand={true}>
            <PluginsNav className="flex h-[43px] w-[194px] items-center rounded-[10px] text-lg font-medium transition-all" />
          </NavItemWrapper>
        )}
      </nav>

      {/* 分割线 */}
      <div className="relative py-2 pl-[30px] pr-[37px]">
        <Divider
          type="horizontal"
          bgStyle="solid"
          className="my-0 h-px bg-white/20"
        />
      </div>

      {/* 底部区域: 账户 */}
      <div className="relative shrink-0 border-t border-white/20 py-3 pl-[30px] pr-[37px]">
        <div className="flex items-center justify-center">
          <AccountDropdown />
        </div>
      </div>
    </div>
  )
}

export default GlobalSidebar
