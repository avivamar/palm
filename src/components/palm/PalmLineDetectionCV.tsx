'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { detectPalmLines } from '@/utils/palmLineDetectionCV'
import { loadOpenCV, isOpenCVReady } from '@/utils/opencvLoader'

interface PalmLineDetectionCVProps {
  imageFile: File | null
  landmarks?: any[]
  onDetectionComplete?: (lines: any[]) => void
}

export default function PalmLineDetectionCV({
  imageFile,
  landmarks,
  onDetectionComplete
}: PalmLineDetectionCVProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [detectionResult, setDetectionResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [openCVStatus, setOpenCVStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [processStage, setProcessStage] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const processedCanvasRef = useRef<HTMLCanvasElement>(null)

  // 加载OpenCV.js
  useEffect(() => {
    const loadCV = async () => {
      try {
        setOpenCVStatus('loading')
        await loadOpenCV()
        setOpenCVStatus('ready')
      } catch (error) {
        console.error('Failed to load OpenCV:', error)
        setOpenCVStatus('error')
        setError('无法加载图像处理库')
      }
    }
    
    if (!isOpenCVReady()) {
      loadCV()
    } else {
      setOpenCVStatus('ready')
    }
  }, [])

  // 处理图像
  useEffect(() => {
    if (imageFile && openCVStatus === 'ready' && !isProcessing) {
      processImage()
    }
  }, [imageFile, openCVStatus])

  const processImage = async () => {
    if (!imageFile) return
    
    setIsProcessing(true)
    setError(null)
    setProcessStage('准备处理图像...')
    
    try {
      // 显示原始图像
      const imageUrl = URL.createObjectURL(imageFile)
      const img = new Image()
      img.onload = () => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d')
          if (ctx) {
            canvasRef.current.width = img.width
            canvasRef.current.height = img.height
            ctx.drawImage(img, 0, 0)
          }
        }
        URL.revokeObjectURL(imageUrl)
      }
      img.src = imageUrl
      
      // 执行掌纹检测
      setProcessStage('提取手掌区域...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setProcessStage('图像预处理...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setProcessStage('检测掌纹线...')
      const result = await detectPalmLines(imageFile, landmarks)
      
      if (result.success) {
        setProcessStage('分析完成!')
        setDetectionResult(result)
        
        // 显示处理后的图像
        if (result.processedImage && processedCanvasRef.current) {
          const processedImg = new Image()
          processedImg.onload = () => {
            if (processedCanvasRef.current) {
              const ctx = processedCanvasRef.current.getContext('2d')
              if (ctx) {
                processedCanvasRef.current.width = processedImg.width
                processedCanvasRef.current.height = processedImg.height
                ctx.drawImage(processedImg, 0, 0)
              }
            }
          }
          processedImg.src = result.processedImage
        }
        
        // 在原图上绘制检测到的线条
        drawDetectedLines(result.lines)
        
        // 回调
        if (onDetectionComplete) {
          onDetectionComplete(result.lines)
        }
      } else {
        setError(result.error || '检测失败')
      }
    } catch (error) {
      console.error('Processing error:', error)
      setError('图像处理出错')
    } finally {
      setIsProcessing(false)
      setTimeout(() => setProcessStage(''), 3000)
    }
  }

  const drawDetectedLines = (lines: any[]) => {
    if (!canvasRef.current) return
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    
    // 线条类型对应的颜色
    const lineColors: Record<string, string> = {
      life: '#10B981',   // 绿色
      heart: '#EF4444',  // 红色
      head: '#3B82F6',   // 蓝色
      fate: '#8B5CF6',   // 紫色
      unknown: '#6B7280' // 灰色
    }
    
    // 绘制每条检测到的线
    lines.forEach(line => {
      ctx.strokeStyle = lineColors[line.type] || '#6B7280'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.globalAlpha = 0.8
      
      ctx.beginPath()
      ctx.moveTo(
        line.startPoint.x * canvasRef.current!.width,
        line.startPoint.y * canvasRef.current!.height
      )
      ctx.lineTo(
        line.endPoint.x * canvasRef.current!.width,
        line.endPoint.y * canvasRef.current!.height
      )
      ctx.stroke()
      
      // 绘制标签
      const midX = (line.startPoint.x + line.endPoint.x) / 2 * canvasRef.current!.width
      const midY = (line.startPoint.y + line.endPoint.y) / 2 * canvasRef.current!.height
      
      ctx.fillStyle = lineColors[line.type] || '#6B7280'
      ctx.font = 'bold 14px sans-serif'
      ctx.globalAlpha = 1
      
      const labels: Record<string, string> = {
        life: '生命线',
        heart: '感情线',
        head: '智慧线',
        fate: '命运线',
        unknown: '未知'
      }
      
      // 背景
      const text = labels[line.type] || '未知'
      const metrics = ctx.measureText(text)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.fillRect(
        midX - metrics.width / 2 - 4,
        midY - 10,
        metrics.width + 8,
        20
      )
      
      // 文字
      ctx.fillStyle = lineColors[line.type] || '#6B7280'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, midX, midY)
    })
    
    ctx.globalAlpha = 1
  }

  return (
    <div className="space-y-6">
      {/* OpenCV加载状态 */}
      <AnimatePresence>
        {openCVStatus === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-blue-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-blue-700">正在加载图像处理库...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 处理状态 */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-purple-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="animate-pulse">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-purple-700">{processStage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 错误提示 */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-50 rounded-lg border border-red-200"
        >
          <p className="text-red-700">{error}</p>
        </motion.div>
      )}

      {/* 图像显示区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 原图 + 检测结果 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">检测结果</h3>
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* 处理后的图像 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">边缘检测图</h3>
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <canvas
              ref={processedCanvasRef}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* 检测结果统计 */}
      {detectionResult && detectionResult.lines.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 rounded-lg"
        >
          <h3 className="font-medium text-green-900 mb-3">检测到的掌纹线</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['life', 'heart', 'head', 'fate'].map(type => {
              const count = detectionResult.lines.filter((l: any) => l.type === type).length
              const labels: any = {
                life: '生命线',
                heart: '感情线',
                head: '智慧线',
                fate: '命运线'
              }
              const colors: any = {
                life: 'text-green-600',
                heart: 'text-red-600',
                head: 'text-blue-600',
                fate: 'text-purple-600'
              }
              
              return (
                <div key={type} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${colors[type].replace('text', 'bg')}`}></div>
                  <span className={`${colors[type]} font-medium`}>
                    {labels[type]}: {count}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* 技术说明 */}
      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-medium mb-2">技术说明：</p>
        <ul className="space-y-1">
          <li>• 使用OpenCV.js进行图像处理</li>
          <li>• 结合MediaPipe手部关键点提取ROI</li>
          <li>• Canny边缘检测 + HoughLines线条检测</li>
          <li>• 基于位置和角度的掌纹线分类</li>
        </ul>
      </div>
    </div>
  )
}