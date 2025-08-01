'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

interface Step17Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

export default function Step17Storytelling({ 
  trackEvent, 
  goToNextStep
}: Step17Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentLocation, setCurrentLocation] = useState('定位中...')
  
  const messages = [
    '你的手掌正在<b class="text-yellow-300">诉说着独特的故事</b>',
    '每一条掌纹都蕴含着<span class="text-emerald-300">深刻的智慧</span>',
    '爱情线揭示了你的<b class="text-yellow-300">情感密码</b>',
    '事业线指引着你的<span class="text-emerald-300">人生方向</span>',
    '生命线展现了你的<b class="text-yellow-300">内在力量</b>',
    '智慧线解读着你的<span class="text-emerald-300">思维模式</span>',
    '<span class="text-rose-300">准备好了吗？</span>让我们一起<b class="text-yellow-300">探索你的未来</b>',
    '你的<span class="text-emerald-300">专属手相报告</span>即将为你<b class="text-yellow-300">揭晓答案</b>'
  ]
  
  useEffect(() => {
    trackEvent('palm_storytelling_view', { 
      timestamp: Date.now(),
      step: 17
    })
    
    // 获取地理位置
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          const lat = position.coords.latitude.toFixed(2)
          const lon = position.coords.longitude.toFixed(2)
          setCurrentLocation(`${lat}, ${lon}`)
        },
        function(_error) {
          setCurrentLocation('位置获取失败')
        }
      )
    } else {
      setCurrentLocation('不支持定位')
    }
    
    // 开始文字动画
    const messageTimer = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 1
        if (nextIndex >= messages.length) {
          clearInterval(messageTimer)
          trackEvent('palm_storytelling_complete', { 
            duration: nextIndex * 1000,
            messagesShown: nextIndex
          })
          setTimeout(() => {
            goToNextStep()
          }, 500)
          return prevIndex
        }
        
        trackEvent('palm_storytelling_message', { 
          messageIndex: nextIndex,
          message: messages[nextIndex]
        })
        
        return nextIndex
      })
    }, 1000)
    
    // 安全机制：8秒后强制跳转
    const safetyTimer = setTimeout(() => {
      clearInterval(messageTimer)
      trackEvent('palm_storytelling_timeout', { 
        currentIndex,
        timestamp: Date.now()
      })
      goToNextStep()
    }, 8000)
    
    return () => {
      clearInterval(messageTimer)
      clearTimeout(safetyTimer)
    }
  }, []) // 移除依赖，避免无限循环
  
  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-[#6C3BFF] to-[#3D0DA9] overflow-hidden">
      <div className="w-[390px] mx-auto">
        {/* 主容器 */}
        <div className="min-h-screen flex items-center justify-center p-4">
          {/* 文字显示区域 */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-lg sm:text-xl md:text-2xl font-medium text-white leading-relaxed">
              <AnimatePresence mode="wait">
                {currentIndex < messages.length && (
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ 
                      duration: 0.6,
                      ease: "easeInOut"
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: messages[currentIndex] || ''
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 地理位置显示 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="fixed bottom-4 left-4 text-white/60 text-xs"
        >
          {currentLocation}
        </motion.div>
      </div>
      
      {/* 自定义样式 */}
      <style jsx global>{`
        .text-yellow-300 {
          color: #fde047;
        }
        .text-emerald-300 {
          color: #6ee7b7;
        }
        .text-rose-300 {
          color: #fda4af;
        }
        html, body {
          height: 100%;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}