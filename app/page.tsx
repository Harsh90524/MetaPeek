'use client'

import Header from './components/Header'
import TabBar from './components/TabBar'
import ViewerPane from './components/ViewerPane'
import EditorPane from './components/EditorPane'
import AboutPane from './components/AboutPane'
import { useState } from 'react'
import { MetaStore } from './components/types'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'viewer' | 'editor' | 'about'>('viewer')
  const [store, setStore] = useState<MetaStore | null>(null)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface-0)' }}>
      <Header />
      <TabBar active={activeTab} onChange={setActiveTab} />
      <main className="flex-1">
        {activeTab === 'viewer' && (
          <div className="tab-pane">
            <ViewerPane
              store={store}
              setStore={setStore}
              onEdit={() => setActiveTab('editor')}
            />
          </div>
        )}
        {activeTab === 'editor' && (
          <div className="tab-pane">
            <EditorPane store={store} setStore={setStore} />
          </div>
        )}
        {activeTab === 'about' && (
          <div className="tab-pane">
            <AboutPane />
          </div>
        )}
      </main>
      <footer className="text-center py-4 text-xs" style={{ color: 'var(--text-muted)', borderTop: '0.5px solid var(--border)' }}>
        MetaPeek — All processing happens in your browser. Your files never leave your device.
      </footer>
    </div>
  )
}
