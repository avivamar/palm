'use client'

import { motion } from 'framer-motion'
import { usePalm } from './PalmProvider'

export function PalmHeader() {
  const { currentStep, resetFlow } = usePalm()
  
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="py-4 flex justify-center items-center relative"
    >
      {/* Back Button (only show after step 0) */}
      {currentStep > 0 && (
        <button
          onClick={() => window.history.back()}
          className="absolute left-4 p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="返回上一步"
        >
          <svg 
            className="w-5 h-5 text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
        </button>
      )}
      
      {/* Logo */}
      <img 
        src="/palm/img/logo.svg" 
        alt="ThePalmistryLife" 
        className="h-7"
        onClick={resetFlow}
      />
      
      {/* Menu Button (optional) */}
      <button
        className="absolute right-4 p-2 rounded-full hover:bg-gray-100 transition opacity-0"
        aria-label="菜单"
      >
        <svg 
          className="w-5 h-5 text-gray-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" 
          />
        </svg>
      </button>
    </motion.header>
  )
}