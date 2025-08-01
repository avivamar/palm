'use client'

import { motion } from 'framer-motion'

interface PalmProgressBarProps {
  currentStep: number
  totalSteps: number
  stepType: string
}

export function PalmProgressBar({ currentStep, totalSteps, stepType }: PalmProgressBarProps) {
  const progress = Math.round((currentStep / (totalSteps - 1)) * 100)
  
  // 不同步骤类型的进度条颜色
  const getProgressColor = () => {
    switch (stepType) {
      case 'analysis':
        return 'bg-yellow-400'
      case 'payment':
        return 'bg-green-500'
      case 'result':
        return 'bg-blue-500'
      default:
        return 'bg-violet-500'
    }
  }
  
  return (
    <div className="px-4 py-2">
      <div className="relative w-full h-2 bg-gray-200 rounded-full mb-2">
        <motion.div
          className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <span className="absolute right-0 -top-6 text-xs text-gray-500">
          Step {currentStep + 1} / {totalSteps}
        </span>
      </div>
      
      {/* 进度提示 */}
      {progress > 80 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-xs text-green-600 font-medium"
        >
          🎉 即将完成分析！
        </motion.div>
      )}
    </div>
  )
}