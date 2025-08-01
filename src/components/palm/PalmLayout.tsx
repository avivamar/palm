'use client'

import { PalmStepConfig } from '@/libs/palm/config'
import { PalmProgressBar } from './PalmProgressBar'
import { PalmHeader } from './PalmHeader'
import { ScarcityBanner } from './ScarcityBanner'
import { PalmDebugPanel } from './PalmDebugPanel'
import { ClientOnlyWrapper } from './ClientOnlyWrapper'

interface PalmLayoutProps {
  step: number
  config: PalmStepConfig
  children: React.ReactNode
}

export function PalmLayout({ step, config, children }: PalmLayoutProps) {
  return (
    <main className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <PalmHeader />
      
      {/* Progress Bar */}
      <PalmProgressBar 
        currentStep={step} 
        totalSteps={21}
        stepType={config.type}
      />
      
      {/* Main Content */}
      <div className="px-4 pb-16">
        {children}
      </div>
      
      {/* Background Elements */}
      {config.type === 'analysis' && (
        <div className="fixed inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 -z-10" />
      )}
      
      <ClientOnlyWrapper>
        {config.features.includes('scarcity') && (
          <ScarcityBanner />
        )}
        <PalmDebugPanel />
      </ClientOnlyWrapper>
    </main>
  )
}