'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  useRouter,
} from 'next/navigation'
import useSWRInfinite from 'swr/infinite'
import { useTranslation } from 'react-i18next'
import { useDebounceFn } from 'ahooks'
import {
  RiApps2Line,
  RiExchange2Line,
  RiFile4Line,
  RiMessage3Line,
  RiRobot3Line,
} from '@remixicon/react'
import AppCard from './app-card'
import NewAppCard from './new-app-card'
import useAppsQueryState from './hooks/use-apps-query-state'
import { useDSLDragDrop } from './hooks/use-dsl-drag-drop'
import s from './list.module.css'
import type { AppListResponse } from '@/models/app'
import { fetchAppList } from '@/service/apps'
import { useAppContext } from '@/context/app-context'
import { NEED_REFRESH_APP_LIST_KEY } from '@/config'
import { CheckModal } from '@/hooks/use-pay'
import { useTabSearchParams } from '@/hooks/use-tab-searchparams'
import Input from '@/app/components/base/input'
import cn from '@/utils/classnames'
import { useStore as useTagStore } from '@/app/components/base/tag-management/store'
import TagFilter from '@/app/components/base/tag-management/filter'
import CheckboxWithLabel from '@/app/components/datasets/create/website/base/checkbox-with-label'
import dynamic from 'next/dynamic'
import { AppModeEnum } from '@/types/app'

const TagManagementModal = dynamic(() => import('@/app/components/base/tag-management'), {
  ssr: false,
})
const CreateFromDSLModal = dynamic(() => import('@/app/components/app/create-from-dsl-modal'), {
  ssr: false,
})

const getKey = (
  pageIndex: number,
  previousPageData: AppListResponse,
  activeTab: string,
  isCreatedByMe: boolean,
  tags: string[],
  keywords: string,
) => {
  if (!pageIndex || previousPageData.has_more) {
    const params: any = { url: 'apps', params: { page: pageIndex + 1, limit: 30, name: keywords, is_created_by_me: isCreatedByMe } }

    if (activeTab !== 'all')
      params.params.mode = activeTab
    else
      delete params.params.mode

    if (tags.length)
      params.params.tag_ids = tags

    return params
  }
  return null
}

const List = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { isCurrentWorkspaceEditor, isCurrentWorkspaceDatasetOperator } = useAppContext()
  const showTagManagementModal = useTagStore(s => s.showTagManagementModal)
  const [activeTab, setActiveTab] = useTabSearchParams({
    defaultTab: 'all',
  })
  const { query: { tagIDs = [], keywords = '', isCreatedByMe: queryIsCreatedByMe = false }, setQuery } = useAppsQueryState()
  const [isCreatedByMe, setIsCreatedByMe] = useState(queryIsCreatedByMe)
  const [tagFilterValue, setTagFilterValue] = useState<string[]>(tagIDs)
  const [searchKeywords, setSearchKeywords] = useState(keywords)
  const newAppCardRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showCreateFromDSLModal, setShowCreateFromDSLModal] = useState(false)
  const [droppedDSLFile, setDroppedDSLFile] = useState<File | undefined>()
  const setKeywords = useCallback((keywords: string) => {
    setQuery(prev => ({ ...prev, keywords }))
  }, [setQuery])
  const setTagIDs = useCallback((tagIDs: string[]) => {
    setQuery(prev => ({ ...prev, tagIDs }))
  }, [setQuery])

  const handleDSLFileDropped = useCallback((file: File) => {
    setDroppedDSLFile(file)
    setShowCreateFromDSLModal(true)
  }, [])

  const { dragging } = useDSLDragDrop({
    onDSLFileDropped: handleDSLFileDropped,
    containerRef,
    enabled: isCurrentWorkspaceEditor,
  })

  const { data, isLoading, error, setSize, mutate } = useSWRInfinite(
    (pageIndex: number, previousPageData: AppListResponse) => getKey(pageIndex, previousPageData, activeTab, isCreatedByMe, tagIDs, searchKeywords),
    fetchAppList,
    {
      revalidateFirstPage: true,
      shouldRetryOnError: false,
      dedupingInterval: 500,
      errorRetryCount: 3,
    },
  )

  const anchorRef = useRef<HTMLDivElement>(null)
  const options = [
    { value: 'all', text: t('app.types.all'), icon: <RiApps2Line className='mr-1 h-[14px] w-[14px]' /> },
    { value: AppModeEnum.WORKFLOW, text: t('app.types.workflow'), icon: <RiExchange2Line className='mr-1 h-[14px] w-[14px]' /> },
    { value: AppModeEnum.ADVANCED_CHAT, text: t('app.types.advanced'), icon: <RiMessage3Line className='mr-1 h-[14px] w-[14px]' /> },
    { value: AppModeEnum.CHAT, text: t('app.types.chatbot'), icon: <RiMessage3Line className='mr-1 h-[14px] w-[14px]' /> },
    { value: AppModeEnum.AGENT_CHAT, text: t('app.types.agent'), icon: <RiRobot3Line className='mr-1 h-[14px] w-[14px]' /> },
    { value: AppModeEnum.COMPLETION, text: t('app.types.completion'), icon: <RiFile4Line className='mr-1 h-[14px] w-[14px]' /> },
  ]

  useEffect(() => {
    if (localStorage.getItem(NEED_REFRESH_APP_LIST_KEY) === '1') {
      localStorage.removeItem(NEED_REFRESH_APP_LIST_KEY)
      mutate()
    }
  }, [mutate, t])

  useEffect(() => {
    if (isCurrentWorkspaceDatasetOperator)
      return router.replace('/datasets')
  }, [router, isCurrentWorkspaceDatasetOperator])

  useEffect(() => {
    const hasMore = data?.at(-1)?.has_more ?? true
    let observer: IntersectionObserver | undefined

    if (error) {
      if (observer)
        observer.disconnect()
      return
    }

    if (anchorRef.current && containerRef.current) {
      // Calculate dynamic rootMargin: clamps to 100-200px range, using 20% of container height as the base value for better responsiveness
      const containerHeight = containerRef.current.clientHeight
      const dynamicMargin = Math.max(100, Math.min(containerHeight * 0.2, 200)) // Clamps to 100-200px range, using 20% of container height as the base value

      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading && !error && hasMore)
          setSize((size: number) => size + 1)
      }, {
        root: containerRef.current,
        rootMargin: `${dynamicMargin}px`,
        threshold: 0.1, // Trigger when 10% of the anchor element is visible
      })
      observer.observe(anchorRef.current)
    }
    return () => observer?.disconnect()
  }, [isLoading, setSize, data, error])

  const { run: handleSearch } = useDebounceFn(() => {
    setSearchKeywords(keywords)
  }, { wait: 500 })
  const handleKeywordsChange = (value: string) => {
    setKeywords(value)
    handleSearch()
  }

  const { run: handleTagsUpdate } = useDebounceFn(() => {
    setTagIDs(tagFilterValue)
  }, { wait: 500 })
  const handleTagsChange = (value: string[]) => {
    setTagFilterValue(value)
    handleTagsUpdate()
  }

  const handleCreatedByMeChange = useCallback(() => {
    const newValue = !isCreatedByMe
    setIsCreatedByMe(newValue)
    setQuery(prev => ({ ...prev, isCreatedByMe: newValue }))
  }, [isCreatedByMe, setQuery])

  // 左侧Tab项的样式
  const itemClassName = (isSelected: boolean) => cn(
    'flex h-[32px] w-full cursor-pointer items-center gap-2 rounded-lg border-[0.5px] border-transparent px-3 py-[7px] text-[13px] font-medium leading-[18px] text-text-tertiary hover:bg-components-main-nav-nav-button-bg-active',
    isSelected && 'border-components-main-nav-nav-button-border bg-components-main-nav-nav-button-bg-active text-components-main-nav-nav-button-text-active shadow-xs',
  )

  // 计算当前 tab 筛选后的应用列表
  const filteredApps = data?.flatMap(({ data: apps }) => apps) || []
  const hasApps = filteredApps.length > 0 || isLoading

  return (
    <>
      <div className='mx-auto flex h-full w-full max-w-[1634px]'>
        <div ref={containerRef} className='relative flex flex-1 flex-col overflow-hidden rounded-[20px] bg-white'>
          {dragging && (
            <div className="absolute inset-0 z-50 m-0.5 rounded-2xl border-2 border-dashed border-components-dropzone-border-accent bg-[rgba(21,90,239,0.14)] p-2">
            </div>
          )}

          {/* 顶部标题和搜索区域 */}
          <div className='flex h-[71px] shrink-0 items-center justify-between border-b border-divider-subtle px-5'>
            <div>
              <div className='text-xl font-semibold text-gray-900'>{t('common.menus.apps')}</div>
              <div className='text-sm text-text-tertiary'>{t('app.newApp.startFromBlank')}</div>
            </div>
            <Input
              showLeftIcon
              showClearIcon
              wrapperClassName='w-[200px]'
              value={keywords}
              onChange={e => handleKeywordsChange(e.target.value)}
              onClear={() => handleKeywordsChange('')}
            />
          </div>

          {/* 下部分: 左侧Tab + 右侧应用区域 */}
          <div className='flex flex-1 overflow-hidden'>
            {/* 左侧Tab列表 */}
            <div
              className={cn('w-[250px] shrink-0 overflow-y-auto border-r border-divider-subtle p-5', s.scrollContainer)}
            >
              <div className='flex flex-col gap-2'>
                {options.map(option => (
                  <div
                    key={option.value}
                    className={itemClassName(activeTab === option.value)}
                    onClick={() => setActiveTab(option.value)}
                  >
                    {option.icon}
                    <span>{option.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 右侧应用区域 */}
            <div className='flex flex-1 justify-center'>
              <div
                className={cn('h-full w-full max-w-[1354px] overflow-auto rounded-lg bg-[#F8F9FA] py-5', s.scrollContainer)}
              >
                {/* 顶部过滤器 */}
                <div className='mb-4 flex items-center justify-end gap-2 pr-5'>
                  <CheckboxWithLabel
                    className='mr-2'
                    label={t('app.showMyCreatedAppsOnly')}
                    isChecked={isCreatedByMe}
                    onChange={handleCreatedByMeChange}
                  />
                  <TagFilter type='app' value={tagFilterValue} onChange={handleTagsChange} />
                </div>

                {/* 应用卡片网格 */}
                {hasApps
                  ? (
                    <div className='grid shrink-0 content-start gap-4' style={{ gridTemplateColumns: 'repeat(auto-fill, 420px)', justifyContent: 'center' }}>
                      {isCurrentWorkspaceEditor
                          && <NewAppCard ref={newAppCardRef} onSuccess={mutate} selectedAppType={activeTab} />}
                      {filteredApps.map(app => (
                        <AppCard key={app.id} app={app} onRefresh={mutate} />
                      ))}
                    </div>
                  )
                  : (
                    <div className='px-5'>
                      {isCurrentWorkspaceEditor && (
                        <div className='w-[420px]'>
                          <NewAppCard ref={newAppCardRef} onSuccess={mutate} selectedAppType={activeTab} />
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>

          <CheckModal />
          <div ref={anchorRef} className='h-0'> </div>
          {showTagManagementModal && (
            <TagManagementModal type='app' show={showTagManagementModal} />
          )}
        </div>
      </div>

      {showCreateFromDSLModal && (
        <CreateFromDSLModal
          show={showCreateFromDSLModal}
          onClose={() => {
            setShowCreateFromDSLModal(false)
            setDroppedDSLFile(undefined)
          }}
          onSuccess={() => {
            setShowCreateFromDSLModal(false)
            setDroppedDSLFile(undefined)
            mutate()
          }}
          droppedFile={droppedDSLFile}
        />
      )}
    </>
  )
}

export default List
