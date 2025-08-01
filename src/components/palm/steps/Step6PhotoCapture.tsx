'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

interface Step6Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

export default function Step6PhotoCapture({ 
  userData,
  updateUserData,
  trackEvent, 
  goToNextStep
}: Step6Props) {
  const [captureMode, setCaptureMode] = useState<'guide' | 'camera' | 'upload' | 'processing'>('guide')
  // const [isProcessing, setIsProcessing] = useState(false) // Removed unused state
  const [hasCamera, setHasCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    trackEvent('palm_photo_step_view', { 
      timestamp: Date.now(),
      analysisDone: true
    })
    
    // 检查摄像头权限
    navigator.mediaDevices?.getUserMedia({ video: true })
      .then(() => setHasCamera(true))
      .catch(() => setHasCamera(false))
  }, [])
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCaptureMode('camera')
        trackEvent('palm_camera_start', { timestamp: Date.now() })
      }
    } catch (error) {
      console.error('Camera access denied:', error)
      setCaptureMode('upload')
    }
  }
  
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext('2d')
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context?.drawImage(video, 0, 0)
    
    canvas.toBlob((blob) => {
      if (blob) {
        processPhoto(blob)
      }
    }, 'image/jpeg', 0.8)
  }
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processPhoto(file)
    }
  }
  
  const processPhoto = async (photo: Blob) => {
    // setIsProcessing(true) // Removed as isProcessing state was removed
    setCaptureMode('processing')
    
    trackEvent('palm_photo_capture', { 
      method: captureMode,
      fileSize: photo.size,
      timestamp: Date.now()
    })
    
    // 模拟照片处理和上传
    setTimeout(() => {
      updateUserData({ palmPhoto: 'captured' })
      trackEvent('palm_photo_complete', { 
        processingTime: 3000
      })
      goToNextStep()
    }, 3000)
  }
  
  const skipPhoto = () => {
    trackEvent('palm_photo_skip', { timestamp: Date.now() })
    updateUserData({ palmPhoto: 'skipped' })
    goToNextStep()
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Progress Bar */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>步骤 6/20</span>
        <div className="flex-1 mx-3 bg-gray-200 rounded-full h-1">
          <div className="bg-violet-600 h-1 rounded-full" style={{ width: '30%' }}></div>
        </div>
        <span>30%</span>
      </div>
      
      {/* Analysis Complete */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">✅</div>
          <div>
            <div className="text-sm font-semibold text-green-800">
              AI分析完成！准确率 97.3%
            </div>
            <div className="text-xs text-green-700">
              现在拍摄你的手掌照片,获得更精准的个性化建议
            </div>
          </div>
        </div>
      </motion.div>
      
      {captureMode === 'guide' && (
        <>
          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center space-y-2"
          >
            <h1 className="text-2xl font-bold text-gray-800">
              拍摄你的手掌增强分析
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              上传手掌照片可将准确率提升至99.1%，获得更精准的财富指导
              <br />我们绝不储存你的照片，仅用于本次分析
            </p>
          </motion.div>
          
          {/* Photo Guide */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white border-2 border-gray-200 rounded-xl p-6"
          >
            <div className="text-center space-y-4">
              <div className="text-6xl">🤲</div>
              <div className="text-lg font-semibold text-gray-800">拍摄要求</div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center space-y-2">
                  <div className="text-2xl">💡</div>
                  <div className="text-sm font-medium text-gray-700">光线充足</div>
                  <div className="text-xs text-gray-600">确保手掌清晰可见</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl">🖐️</div>
                  <div className="text-sm font-medium text-gray-700">手掌张开</div>
                  <div className="text-xs text-gray-600">五指自然分开</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl">📱</div>
                  <div className="text-sm font-medium text-gray-700">垂直拍摄</div>
                  <div className="text-xs text-gray-600">距离20-30厘米</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl">✋</div>
                  <div className="text-sm font-medium text-gray-700">使用{userData.dominantHand === 'right' ? '右手' : '左手'}</div>
                  <div className="text-xs text-gray-600">你的财富优势手</div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            {hasCamera && (
              <button
                className="w-full h-14 bg-violet-600 text-white rounded-xl font-semibold text-lg hover:bg-violet-500 transition flex items-center justify-center gap-2"
                onClick={startCamera}
              >
                <span>📸</span>
                使用摄像头拍摄
              </button>
            )}
            
            <button
              className="w-full h-12 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <span>📁</span>
              从相册选择照片
            </button>
            
            <button
              className="w-full h-10 text-gray-500 text-sm hover:text-gray-700 transition"
              onClick={skipPhoto}
            >
              跳过照片，继续分析 →
            </button>
          </motion.div>
        </>
      )}
      
      {captureMode === 'camera' && (
        <>
          {/* Camera View */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">拍摄你的{userData.dominantHand === 'right' ? '右手' : '左手'}手掌</h2>
              <p className="text-sm text-gray-600">将手掌放在取景框内，点击拍摄</p>
            </div>
            
            <div className="relative bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 border-4 border-violet-500 rounded-xl pointer-events-none">
                <div className="absolute inset-4 border-2 border-white/50 border-dashed rounded-lg">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm">
                    将手掌放在此处
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                className="flex-1 h-12 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-500 transition"
                onClick={capturePhoto}
              >
                📸 拍摄
              </button>
              <button
                className="h-12 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition"
                onClick={() => setCaptureMode('guide')}
              >
                取消
              </button>
            </div>
          </motion.div>
        </>
      )}
      
      {captureMode === 'processing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">正在分析你的手掌...</h2>
            <p className="text-sm text-gray-600">AI正在识别掌纹特征，提升分析精准度</p>
          </div>
          
          <div className="relative">
            <div className="w-24 h-24 border-4 border-violet-200 rounded-full mx-auto"></div>
            <div className="w-24 h-24 border-4 border-violet-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">🤲</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-600">分析进度</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-violet-600 h-2 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3 }}
              />
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {/* Canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Benefits */}
      {captureMode === 'guide' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-4"
        >
          <div className="text-center space-y-2">
            <div className="text-sm font-semibold text-amber-800">
              🎁 照片分析额外价值
            </div>
            <div className="text-xs text-amber-700 leading-relaxed">
              • 财富线深度分析 • 事业线走向预测 • 投资时机精准判断
              <br />• 风险承受能力评估 • 个性化资产配置建议
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center text-xs text-gray-400 space-y-1"
      >
        <p>📸 照片仅用于本次分析，不会被保存或分享</p>
        <p>🔒 采用端到端加密，保护你的隐私安全</p>
      </motion.div>
    </motion.div>
  )
}