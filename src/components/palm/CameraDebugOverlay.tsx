'use client'

import React, { useEffect, useRef, useState } from 'react'

interface CameraDebugOverlayProps {
  isVisible: boolean
  onClose?: () => void
}

export default function CameraDebugOverlay({ isVisible, onClose }: CameraDebugOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [stream, setStream] = useState<MediaStream | null>(null)

  const addDebugInfo = (message: string) => {
    console.log('[CAMERA DEBUG]', message)
    setDebugInfo(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testCamera = async () => {
    try {
      addDebugInfo('开始相机测试...')
      
      // 检查基础API支持
      if (!navigator.mediaDevices) {
        addDebugInfo('❌ navigator.mediaDevices 不支持')
        return
      }
      
      if (!navigator.mediaDevices.getUserMedia) {
        addDebugInfo('❌ getUserMedia 不支持')
        return
      }
      
      addDebugInfo('✅ MediaDevices API 支持')
      
      // 检查设备
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(d => d.kind === 'videoinput')
        addDebugInfo(`✅ 找到 ${videoDevices.length} 个视频设备`)
      } catch (e) {
        addDebugInfo('⚠️ 无法枚举设备')
      }
      
      // 尝试获取相机
      addDebugInfo('正在请求相机权限...')
      
      const constraints = { video: true }
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      addDebugInfo('✅ 获取相机流成功')
      addDebugInfo(`流ID: ${mediaStream.id}`)
      addDebugInfo(`流状态: ${mediaStream.active}`)
      addDebugInfo(`视频轨道数: ${mediaStream.getVideoTracks().length}`)
      
      setStream(mediaStream)
      
      // 设置视频元素
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        addDebugInfo('✅ 视频流已设置到video元素')
      }
      
    } catch (error) {
      const err = error as Error
      addDebugInfo(`❌ 相机测试失败: ${err.name} - ${err.message}`)
    }
  }

  useEffect(() => {
    if (isVisible) {
      addDebugInfo('=== 相机调试开始 ===')
      addDebugInfo(`当前URL: ${window.location.href}`)
      addDebugInfo(`协议: ${window.location.protocol}`)
      addDebugInfo(`主机: ${window.location.hostname}`)
      
      // 延迟启动测试
      setTimeout(testCamera, 500)
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        addDebugInfo('🔄 清理相机流')
      }
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* 视频预览 */}
      <video 
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        onLoadedMetadata={() => addDebugInfo('✅ 视频元数据加载完成')}
        onCanPlay={() => addDebugInfo('✅ 视频可以播放')}
        onPlaying={() => addDebugInfo('✅ 视频开始播放')}
        onError={(e) => addDebugInfo(`❌ 视频错误: ${e.type}`)}
      />
      
      {/* 调试信息覆盖层 */}
      <div className="absolute top-0 left-0 right-0 bg-black/80 text-white p-4 text-xs max-h-80 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">📹 相机调试模式</h3>
          <button 
            onClick={onClose}
            className="bg-red-600 px-3 py-1 rounded text-sm"
          >
            关闭
          </button>
        </div>
        
        <div className="space-y-1">
          {debugInfo.map((info, index) => (
            <div key={index} className="font-mono">
              {info}
            </div>
          ))}
        </div>
        
        <button 
          onClick={testCamera}
          className="mt-4 bg-blue-600 px-4 py-2 rounded text-sm"
        >
          🔄 重新测试相机
        </button>
      </div>
    </div>
  )
}