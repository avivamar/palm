import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { PALM_STEPS_CONFIG, getExperimentVariant } from '@/libs/palm/config'

export interface PalmUserData {
  gender?: 'male' | 'female'
  energyType?: 'masculine' | 'feminine' | 'balanced'
  dominantHand?: 'right' | 'left' | 'both'
  motivations?: string[]
  selectedPrice?: number
  palmImage?: string
  palmCaptureImage?: string
  palmPhoto?: string
  birthDate?: string
  birthTime?: string
  birthLocation?: string
  fingerLength?: string
  palmLines?: string
  palmLinePriority?: string
  email?: string
  finalOfferAccepted?: boolean
  finalAmount?: number
  investmentPlan?: boolean
  investmentAmount?: number
  paymentInitiated?: boolean
}

export interface PalmAnalytics {
  sessionId: string
  startTime: number
  events: Array<{
    type: string
    step: number
    timestamp: number
    data?: any
  }>
  experiments: Record<string, string>
  conversionGoals: Record<string, boolean>
}

export interface PalmState {
  // 核心状态
  currentStep: number
  userData: PalmUserData
  analytics: PalmAnalytics
  isLoading: boolean
  error: string | null
  
  // 预加载状态
  preloadedSteps: Set<number>
  stepComponents: Record<number, any>
  
  // 动作方法
  setCurrentStep: (step: number) => void
  updateUserData: (data: Partial<PalmUserData>) => void
  preloadStep: (step: number) => void
  trackEvent: (type: string, data?: any) => void
  setExperiment: (key: string, variant: string) => void
  completeGoal: (goal: string) => void
  resetFlow: () => void
  
  // 计算属性
  getStepConfig: (step: number) => any
  isStepValid: (step: number) => boolean
  canProceed: () => boolean
}

export const usePalmStore = create<PalmState>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentStep: 0,
      userData: {},
      analytics: {
        sessionId: `palm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startTime: Date.now(),
        events: [],
        experiments: {},
        conversionGoals: {}
      },
      isLoading: false,
      error: null,
      preloadedSteps: new Set(),
      stepComponents: {},
      
      // 核心方法
      setCurrentStep: (step: number) => {
        set((state) => {
          // 记录步骤切换事件
          const event = {
            type: 'step_change',
            step,
            timestamp: Date.now(),
            data: { 
              from: state.currentStep,
              userData: state.userData 
            }
          }
          
          return {
            currentStep: step,
            analytics: {
              ...state.analytics,
              events: [...(Array.isArray(state.analytics?.events) ? state.analytics.events : []), event]
            }
          }
        })
        
        // 异步预加载下一步
        if (step < 20) {
          get().preloadStep(step + 1)
        }
        
        // 异步更新URL（不阻塞状态更新）
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname
            const newPath = currentPath.replace(/\/palm\/\d+/, `/palm/${step}`)
            window.history.replaceState({}, '', newPath)
          }
        }, 0)
      },
      
      updateUserData: (data: Partial<PalmUserData>) => {
        set((state) => ({
          userData: { ...state.userData, ...data },
          analytics: {
            ...state.analytics,
            events: [
              ...(Array.isArray(state.analytics?.events) ? state.analytics.events : []),
              {
                type: 'data_update',
                step: state.currentStep,
                timestamp: Date.now(),
                data
              }
            ]
          }
        }))
      },
      
      preloadStep: async (step: number) => {
        const state = get()
        if (state.preloadedSteps.has(step) || step > 20) return
        
        try {
          // 预加载步骤组件
          const component = await import(`@/components/palm/steps/Step${step}`)
          
          set((state) => ({
            preloadedSteps: new Set([...state.preloadedSteps, step]),
            stepComponents: {
              ...state.stepComponents,
              [step]: component.default
            }
          }))
          
          // 预加载下一个页面路由
          if (typeof window !== 'undefined' && 'next' in window) {
            const router = (window as any).next?.router
            if (router?.prefetch) {
              router.prefetch(`/palm/${step}`)
            }
          }
        } catch (error) {
          console.warn(`Failed to preload step ${step}:`, error)
        }
      },
      
      trackEvent: (type: string, data?: any) => {
        set((state) => {
          // 确保 analytics 和 events 存在且是数组
          const currentEvents = Array.isArray(state.analytics?.events) ? state.analytics.events : []
          
          return {
            analytics: {
              ...state.analytics,
              events: [
                ...currentEvents,
                {
                  type,
                  step: state.currentStep,
                  timestamp: Date.now(),
                  data
                }
              ]
            }
          }
        })
        
        // 异步发送到分析服务
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            // PostHog
            if ('posthog' in window) {
              (window as any).posthog?.capture(type, {
                step: get().currentStep,
                sessionId: get().analytics.sessionId,
                ...data
              })
            }
            
            // Google Analytics
            if ('gtag' in window) {
              (window as any).gtag?.('event', type, {
                event_category: 'palm_flow',
                event_label: `step_${get().currentStep}`,
                custom_parameter_1: get().analytics.sessionId,
                ...data
              })
            }
          }
        }, 0)
      },
      
      setExperiment: (key: string, variant: string) => {
        set((state) => ({
          analytics: {
            ...state.analytics,
            experiments: {
              ...state.analytics.experiments,
              [key]: variant
            }
          }
        }))
      },
      
      completeGoal: (goal: string) => {
        set((state) => ({
          analytics: {
            ...state.analytics,
            conversionGoals: {
              ...state.analytics.conversionGoals,
              [goal]: true
            }
          }
        }))
        
        get().trackEvent('goal_completed', { goal })
      },
      
      resetFlow: () => {
        set((state) => ({
          currentStep: 0,
          userData: {},
          analytics: {
            sessionId: `palm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            startTime: Date.now(),
            events: [{
              type: 'flow_reset',
              step: 0,
              timestamp: Date.now(),
              data: { previousSession: state.analytics.sessionId }
            }],
            experiments: {},
            conversionGoals: {}
          },
          error: null,
          isLoading: false
        }))
      },
      
      // 计算方法
      getStepConfig: (step: number) => {
        return PALM_STEPS_CONFIG[step] || null
      },
      
      isStepValid: (step: number) => {
        return step >= 0 && step <= 20 && PALM_STEPS_CONFIG[step] !== undefined
      },
      
      canProceed: () => {
        const state = get()
        const config = state.getStepConfig(state.currentStep)
        
        if (!config?.requiredFields) return true
        
        return config.requiredFields.every((field: string) => {
          return state.userData[field as keyof PalmUserData] !== undefined
        })
      }
    }),
    {
      name: 'palm-store',
      version: 1, // Add version to force reset on changes
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        userData: state.userData,
        analytics: {
          sessionId: state.analytics.sessionId,
          startTime: state.analytics.startTime,
          events: Array.isArray(state.analytics.events) ? state.analytics.events : [],
          experiments: state.analytics.experiments || {},
          conversionGoals: state.analytics.conversionGoals || {}
        }
      }),
      onRehydrateStorage: () => (state) => {
        // Ensure analytics structure is valid
        if (state && state.analytics) {
          if (!Array.isArray(state.analytics.events)) {
            state.analytics.events = []
          }
          if (!state.analytics.experiments) {
            state.analytics.experiments = {}
          }
          if (!state.analytics.conversionGoals) {
            state.analytics.conversionGoals = {}
          }
        }
      },
      migrate: (persistedState: any, version: number) => {
        // Always return a clean state structure to ensure consistency
        const defaultState = {
          currentStep: 0,
          userData: {},
          analytics: {
            sessionId: `palm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            startTime: Date.now(),
            events: [],
            experiments: {},
            conversionGoals: {}
          }
        }
        
        // Force reset if version doesn't match or state is corrupted
        if (version !== 1 || !persistedState || !persistedState.analytics) {
          console.log('Palm Store: Migrating to new version')
          return defaultState
        }
        
        // Validate and fix analytics structure
        try {
          const validatedState = {
            currentStep: persistedState.currentStep || 0,
            userData: persistedState.userData || {},
            analytics: {
              sessionId: persistedState.analytics.sessionId || defaultState.analytics.sessionId,
              startTime: persistedState.analytics.startTime || defaultState.analytics.startTime,
              events: Array.isArray(persistedState.analytics.events) ? persistedState.analytics.events : [],
              experiments: persistedState.analytics.experiments || {},
              conversionGoals: persistedState.analytics.conversionGoals || {}
            }
          }
          return validatedState
        } catch (error) {
          console.warn('Palm Store: State validation failed, using defaults', error)
          return defaultState
        }
      }
    }
  )
)

// 初始化实验分配
if (typeof window !== 'undefined') {
  const store = usePalmStore.getState()
  
  // 为新会话分配实验变体
  if (Object.keys(store.analytics.experiments).length === 0) {
    const experiments = {
      'landing-version': getExperimentVariant('landing-version', store.analytics.sessionId),
      'pricing-strategy': getExperimentVariant('pricing-strategy', store.analytics.sessionId),
      'psychology-intensity': getExperimentVariant('psychology-intensity', store.analytics.sessionId)
    }
    
    Object.entries(experiments).forEach(([key, variant]) => {
      store.setExperiment(key, variant)
    })
  }
}