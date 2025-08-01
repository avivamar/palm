'use client'

import { create } from 'zustand'

// 极简的Palm状态管理 - 只保留核心功能
interface SimplePalmStore {
  currentStep: number
  userData: Record<string, any>
  setStep: (step: number) => void
  updateData: (data: Record<string, any>) => void
  reset: () => void
}

export const useSimplePalmStore = create<SimplePalmStore>((set) => ({
  currentStep: 0,
  userData: {},
  
  setStep: (step) => set({ currentStep: step }),
  
  updateData: (data) => set((state) => ({
    userData: { ...state.userData, ...data }
  })),
  
  reset: () => set({ currentStep: 0, userData: {} })
}))