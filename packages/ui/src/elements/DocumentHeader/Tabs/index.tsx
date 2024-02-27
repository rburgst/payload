import type { I18n } from '@payloadcms/translations'
import type {
  SanitizedCollectionConfig,
  SanitizedConfig,
  SanitizedGlobalConfig,
} from 'payload/types'

import React from 'react'

import { ShouldRenderTabs } from './ShouldRenderTabs'
import { DocumentTab } from './Tab'
import { getCustomViews } from './getCustomViews'
import { getViewConfig } from './getViewConfig'
import './index.scss'
import { tabs as defaultTabs } from './tabs'

const baseClass = 'doc-tabs'

export const DocumentTabs: React.FC<{
  collectionConfig: SanitizedCollectionConfig
  config: SanitizedConfig
  globalConfig: SanitizedGlobalConfig
  i18n: I18n
}> = (props) => {
  const { collectionConfig, config, globalConfig } = props

  const customViews = getCustomViews({ collectionConfig, globalConfig })

  return (
    <ShouldRenderTabs>
      <div className={baseClass}>
        <div className={`${baseClass}__tabs-container`}>
          <ul className={`${baseClass}__tabs`}>
            {Object.entries(defaultTabs)
              // sort `defaultViews` based on `order` property from smallest to largest
              // if no `order`, append the view to the end
              // TODO: open `order` to the config and merge `defaultViews` with `customViews`
              ?.sort(([, a], [, b]) => {
                if (a.order === undefined && b.order === undefined) return 0
                else if (a.order === undefined) return 1
                else if (b.order === undefined) return -1
                return a.order - b.order
              })
              ?.map(([name, tab], index) => {
                const viewConfig = getViewConfig({ name, collectionConfig, globalConfig })
                const tabFromConfig = viewConfig && 'Tab' in viewConfig ? viewConfig.Tab : undefined
                const tabConfig = typeof tabFromConfig === 'object' ? tabFromConfig : undefined

                const { condition } = tabConfig || {}

                const meetsCondition =
                  !condition ||
                  (condition && Boolean(condition({ collectionConfig, config, globalConfig })))

                if (meetsCondition) {
                  return (
                    <DocumentTab
                      key={`tab-${index}`}
                      {...{
                        ...props,
                        ...(tab || {}),
                        ...(tabFromConfig || {}),
                      }}
                    />
                  )
                }

                return null
              })}
            {customViews?.map((CustomView, index) => {
              if ('Tab' in CustomView) {
                const { Tab, path } = CustomView

                if (typeof Tab === 'function') {
                  return <Tab path={path} {...props} key={`tab-custom-${index}`} />
                }

                return (
                  <DocumentTab
                    key={`tab-custom-${index}`}
                    {...{
                      ...props,
                      ...Tab,
                    }}
                  />
                )
              }
              return null
            })}
          </ul>
        </div>
      </div>
    </ShouldRenderTabs>
  )
}