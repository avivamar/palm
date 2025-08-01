'use client'

import { motion } from 'framer-motion'

export function PalmLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-sm text-gray-600"
      >
        正在加载...
      </motion.p>
    </div>
  )
}