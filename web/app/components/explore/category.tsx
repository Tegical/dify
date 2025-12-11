'use client'
import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import cn from '@/utils/classnames'
import exploreI18n from '@/i18n/en-US/explore'
import type { AppCategory } from '@/models/explore'
import { ThumbsUp } from '@/app/components/base/icons/src/vender/line/alertsAndFeedback'

const categoryI18n = exploreI18n.category

export type ICategoryProps = {
  className?: string
  list: AppCategory[]
  value: string
  onChange: (value: AppCategory | string) => void
  /**
   * default value for search param 'category' in en
   */
  allCategoriesEn: string
  apps?: any[]
}

const Category: FC<ICategoryProps> = ({
  className,
  list,
  value,
  onChange,
  allCategoriesEn,
  apps = [],
}) => {
  const { t } = useTranslation()
  const isAllCategories = !list.includes(value as AppCategory) || value === allCategoriesEn

  const getCategoryCount = (category: string) => {
    if (category === allCategoriesEn)
      return apps.length
    return apps.filter(app => app.category === category).length
  }

  const itemClassName = (isSelected: boolean) => cn(
    'flex h-[32px] w-full cursor-pointer items-center justify-between rounded-lg border-[0.5px] border-transparent px-3 py-[7px] font-medium leading-[18px] text-text-tertiary hover:bg-components-main-nav-nav-button-bg-active',
    isSelected && 'border-components-main-nav-nav-button-border bg-components-main-nav-nav-button-bg-active text-components-main-nav-nav-button-text-active shadow-xs',
  )

  return (
    <div className={cn('flex w-full gap-1 text-[13px]', className)}>
      <div
        className={itemClassName(isAllCategories)}
        onClick={() => onChange(allCategoriesEn)}
      >
        <div className='flex items-center'>
          <ThumbsUp className='mr-1 h-3.5 w-3.5' />
          {t('explore.apps.allCategories')}
        </div>
        <span className='text-xs text-text-tertiary'>{getCategoryCount(allCategoriesEn)}</span>
      </div>
      {list.filter(name => name !== allCategoriesEn).map(name => (
        <div
          key={name}
          className={itemClassName(name === value)}
          onClick={() => onChange(name)}
        >
          <span>{(categoryI18n as any)[name] ? t(`explore.category.${name}`) : name}</span>
          <span className='text-xs text-text-tertiary'>{getCategoryCount(name)}</span>
        </div>
      ))}
    </div>
  )
}

export default React.memo(Category)
