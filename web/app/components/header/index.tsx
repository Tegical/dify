'use client'
import AccountDropdown from './account-dropdown'
import AppNav from './app-nav'
import DatasetNav from './dataset-nav'
import EnvNav from './env-nav'
import PluginsNav from './plugins-nav'
import ExploreNav from './explore-nav'
import ToolsNav from './tools-nav'
import { useAppContext } from '@/context/app-context'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'

const navClassName = `
  flex items-center relative px-3 h-8 rounded-xl
  font-medium text-sm
  cursor-pointer
`

const Header = () => {
  const { isCurrentWorkspaceEditor, isCurrentWorkspaceDatasetOperator } = useAppContext()
  const media = useBreakpoints()
  const isMobile = media === MediaType.mobile

  if (isMobile) {
    return (
      <div className=''>
        <div className='flex items-center justify-between px-2'>
          <div className='flex items-center' />
          <div className='flex items-center'>
            <div className='mr-2'>
              <PluginsNav />
            </div>
            <AccountDropdown />
          </div>
        </div>
        <div className='my-1 flex items-center justify-center space-x-1'>
          {!isCurrentWorkspaceDatasetOperator && <ExploreNav className={navClassName} />}
          {!isCurrentWorkspaceDatasetOperator && <AppNav />}
          {(isCurrentWorkspaceEditor || isCurrentWorkspaceDatasetOperator) && <DatasetNav />}
          {!isCurrentWorkspaceDatasetOperator && <ToolsNav className={navClassName} />}
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-[56px] items-center'>
      <div className='flex min-w-0 flex-[1]  items-center pl-3 pr-2 min-[1280px]:pr-3' />
      <div className='flex items-center space-x-2'>
        {!isCurrentWorkspaceDatasetOperator && <ExploreNav className={navClassName} />}
        {!isCurrentWorkspaceDatasetOperator && <AppNav />}
        {(isCurrentWorkspaceEditor || isCurrentWorkspaceDatasetOperator) && <DatasetNav />}
        {!isCurrentWorkspaceDatasetOperator && <ToolsNav className={navClassName} />}
      </div>
      <div className='flex min-w-0 flex-[1] items-center justify-end pl-2 pr-3 min-[1280px]:pl-3'>
        <EnvNav />
        <div className='mr-2'>
          <PluginsNav />
        </div>
        <AccountDropdown />
      </div>
    </div>
  )
}
export default Header
