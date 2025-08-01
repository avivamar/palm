'use client'

import { usePalmStore } from '@/stores/palmStore'

export function PalmDebugPanel() {
  const store = usePalmStore()
  
  const clearState = () => {
    localStorage.removeItem('palm-store')
    window.location.reload()
  }
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  const debugInfo = {
    currentStep: store.currentStep,
    analyticsExists: !!store.analytics,
    eventsIsArray: Array.isArray(store.analytics?.events),
    eventsLength: store.analytics?.events?.length || 0,
    sessionId: store.analytics?.sessionId?.substring(0, 8) + '...'
  }
  
  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-[9999]">
      <div className="mb-2 font-bold">Palm Debug</div>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      <button 
        onClick={clearState}
        className="mt-2 px-2 py-1 bg-red-600 text-white rounded text-xs"
      >
        Clear State
      </button>
    </div>
  )
}