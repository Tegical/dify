import React from 'react'
import type { ReactNode } from 'react'
import SwrInitializer from '@/app/components/swr-initializer'
import { AppContextProvider } from '@/context/app-context'
import GA, { GaType } from '@/app/components/base/ga'
import GlobalSidebar from '@/app/components/global-sidebar'
import { EventEmitterContextProvider } from '@/context/event-emitter'
import { ProviderContextProvider } from '@/context/provider-context'
import { ModalContextProvider } from '@/context/modal-context'
import GotoAnything from '@/app/components/goto-anything'
import Zendesk from '@/app/components/base/zendesk'
import ReadmePanel from '@/app/components/plugins/readme-panel'
import Splash from '../components/splash'

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <GA gaType={GaType.admin} />
      <SwrInitializer>
        <AppContextProvider>
          <EventEmitterContextProvider>
            <ProviderContextProvider>
              <ModalContextProvider>
                <div
                  className="flex h-screen overflow-hidden"
                  style={{
                    backgroundImage: 'url(/background/bg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  <GlobalSidebar />
                  <main className="flex flex-1 flex-col overflow-hidden">
                    {children}
                  </main>
                </div>
                <ReadmePanel />
                <GotoAnything />
                <Splash />
              </ModalContextProvider>
            </ProviderContextProvider>
          </EventEmitterContextProvider>
        </AppContextProvider>
        <Zendesk />
      </SwrInitializer>
    </>
  )
}
export default Layout
