'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'
import { useRouter } from 'next/navigation'

interface Step13Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  trackEvent: (type: string, data?: any) => void
  sessionId: string
}

export default function Step13Capture({ 
  updateUserData,
  trackEvent, 
  sessionId
}: Step13Props) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  
  useEffect(() => {
    trackEvent('palm_capture_view', { 
      timestamp: Date.now(),
      step: 13
    })
  }, []) // 移除trackEvent依赖
  
  const openCamera = async () => {
    trackEvent('palm_camera_capture_attempt', { 
      timestamp: Date.now()
    })
    
    if (navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop())
        
        trackEvent('palm_camera_capture_success', { 
          timestamp: Date.now()
        })
        
        // Navigate to scan progress
        router.push(`/${sessionId}/palm/scan-progress`)
        
      } catch (error) {
        trackEvent('palm_camera_capture_denied', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        })
        pickFile()
      }
    } else {
      pickFile()
    }
  }
  
  const pickFile = () => {
    trackEvent('palm_file_picker_attempt', { 
      timestamp: Date.now()
    })
    
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const selectedFile = files[0]
        if (selectedFile) {
          setIsUploading(true)
          
          trackEvent('palm_file_picker_success', { 
            fileSize: selectedFile.size,
            fileType: selectedFile.type,
            timestamp: Date.now()
          })
          
          // Simulate upload
          setTimeout(() => {
            updateUserData({ palmCaptureImage: selectedFile.name })
            router.push(`/${sessionId}/palm/scan-progress`)
          }, 1500)
        }
      }
    }
    input.click()
  }
  
  return (
    <div className="flex justify-center">
      <main className="w-full max-w-[412px] min-h-screen px-6 pt-6 pb-24 bg-white text-gray-900">
        {/* Logo & Progress */}
        <motion.img 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          src="/palm/img/logo.svg" 
          className="h-6 mx-auto mb-6 select-none" 
          alt="ThePalmistryLife" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full max-w-[340px] h-1.5 mx-auto bg-violet-100 rounded-full"
        >
          <div className="h-full w-[98%] bg-violet-500 rounded-full"></div>
          <span className="absolute right-0 -top-6 text-xs text-gray-500">Step 13 / 14</span>
        </motion.div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 text-2xl font-bold leading-snug"
        >
          按照说明拍摄左手掌照片
        </motion.h1>

        {/* Illustration */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6"
        >
          <div className="bg-green-50 rounded-2xl p-6 flex items-center gap-4">
            <img src="palm/img/pose-correct.png" className="w-28" alt="正确示范" />
            <div className="text-green-600 font-semibold text-lg">✅ 正确</div>
          </div>

          <div className="mt-4 bg-red-50 rounded-2xl p-4 flex justify-center gap-3">
            <img src="/palm/img/pose-wrong1.png" className="w-16 opacity-60" alt="错误姿势" />
            <img src="/palm/img/pose-wrong2.png" className="w-16 opacity-60" alt="错误姿势" />
            <img src="/palm/img/pose-wrong3.png" className="w-16 opacity-60" alt="错误姿势" />
          </div>
        </motion.section>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 space-y-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={pickFile}
            disabled={isUploading}
            className="w-full h-12 rounded-xl border border-violet-300 text-violet-600 font-medium transition"
          >
            {isUploading ? '上传中...' : '从相册上传'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCamera}
            disabled={isUploading}
            className="relative w-full h-14 flex items-center justify-center rounded-xl bg-violet-600 text-white text-lg font-semibold shadow-lg transition"
          >
            立即拍照
          </motion.button>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 flex gap-2 text-[12px] text-gray-500"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-green-500 shrink-0" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2"
              d="M12 11c1.38 0 2.5-1.12 2.5-2.5S13.38 6 12 6 9.5 7.12 9.5 8.5 10.62 11 12 11z"
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2"
              d="M12 11v9m-6 0h12a2 2 0 002-2v-5a7 7 0 10-14 0v5a2 2 0 002 2z"
            />
          </svg>
          <p>
            照片仅用于本次分析并经端到端加密。查看 
            <a href="/privacy" className="underline">隐私政策</a>。
          </p>
        </motion.div>
      </main>
    </div>
  )
}