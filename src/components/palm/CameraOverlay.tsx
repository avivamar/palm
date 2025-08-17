'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

import { ProcessedHandData } from '@/libs/mediapipe/HandLandmarkerService';

interface CameraOverlayProps {
  isVisible: boolean
  onClose?: () => void
  stream?: MediaStream | null
  detectedHands?: ProcessedHandData[]
  showHandLandmarks?: boolean
}

type VideoState = 'loading' | 'ready' | 'playing' | 'error'

export default function CameraOverlay({ 
  isVisible, 
  onClose, 
  stream, 
  detectedHands = [],
  showHandLandmarks = true 
}: CameraOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoState, setVideoState] = useState<VideoState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isStreamAttached, setIsStreamAttached] = useState(false)
  
  // 重置状态函数
  const resetVideoState = useCallback(() => {
    setVideoState('loading')
    setErrorMessage(null)
    setIsStreamAttached(false)
  }, [])

  // 视频事件处理函数
  const handleVideoLoadedMetadata = useCallback(() => {
    console.log('CameraOverlay: 视频元数据已加载')
    setVideoState('ready')
  }, [])

  const handleVideoCanPlay = useCallback(() => {
    console.log('CameraOverlay: 视频可以播放')
    if (videoState === 'ready') {
      setVideoState('playing')
    }
  }, [videoState])

  const handleVideoPlaying = useCallback(() => {
    console.log('CameraOverlay: 视频正在播放')
    setVideoState('playing')
    setErrorMessage(null)
  }, [])

  const handleVideoError = useCallback((event: Event) => {
    const video = event.target as HTMLVideoElement
    const error = video.error
    const errorMsg = error ? `视频错误 (${error.code}): ${error.message}` : '视频播放失败'
    
    console.error('CameraOverlay: 视频错误', error)
    setVideoState('error')
    setErrorMessage(errorMsg)
  }, [])

  const handleVideoStalled = useCallback(() => {
    console.warn('CameraOverlay: 视频流停滞')
    if (videoState !== 'error') {
      setErrorMessage('视频流连接不稳定，正在重试...')
    }
  }, [videoState])

  const handleVideoWaiting = useCallback(() => {
    console.log('CameraOverlay: 视频等待数据')
  }, [])

  // 强制播放视频
  const playVideo = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    try {
      await video.play()
      console.log('CameraOverlay: 视频播放成功')
    } catch (playError) {
      console.warn('CameraOverlay: 自动播放失败，等待用户交互', playError)
      
      // 添加用户交互监听器
      const handleUserInteraction = async () => {
        try {
          await video.play()
          document.removeEventListener('click', handleUserInteraction)
          document.removeEventListener('touchstart', handleUserInteraction)
        } catch (retryError) {
          console.error('CameraOverlay: 用户交互后播放仍失败', retryError)
          setVideoState('error')
          setErrorMessage('无法播放视频，请检查设备权限')
        }
      }

      document.addEventListener('click', handleUserInteraction, { once: true })
      document.addEventListener('touchstart', handleUserInteraction, { once: true })
    }
  }, [])

  // 设置视频流
  const attachStreamToVideo = useCallback(async () => {
    const video = videoRef.current
    if (!video || !stream) {
      console.log('CameraOverlay: 无法设置视频流', { hasVideo: !!video, hasStream: !!stream })
      return
    }

    try {
      console.log('CameraOverlay: 开始设置视频流', {
        streamId: stream.id,
        streamActive: stream.active,
        videoTracks: stream.getVideoTracks().length
      })

      // 重置状态
      resetVideoState()

      // 清理旧的流
      if (video.srcObject && video.srcObject !== stream) {
        const oldStream = video.srcObject as MediaStream
        console.log('CameraOverlay: 清理旧的视频流')
        oldStream.getTracks().forEach(track => track.stop())
      }

      // 设置视频属性（在设置流之前）
      video.autoplay = true
      video.muted = true
      video.playsInline = true
      video.controls = false

      // 设置新的视频流
      video.srcObject = stream
      setIsStreamAttached(true)

      console.log('CameraOverlay: 视频流已设置，等待加载')

      // 检查视频轨道状态
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        console.log('CameraOverlay: 视频轨道信息', {
          label: videoTrack.label,
          enabled: videoTrack.enabled,
          readyState: videoTrack.readyState,
          settings: videoTrack.getSettings()
        })

        // 监听轨道结束
        videoTrack.onended = () => {
          console.warn('CameraOverlay: 视频轨道已结束')
          setVideoState('error')
          setErrorMessage('视频轨道已断开')
        }
      }

      // 短暂延迟后尝试播放
      setTimeout(() => {
        playVideo()
      }, 100)

    } catch (error) {
      console.error('CameraOverlay: 设置视频流失败', error)
      setVideoState('error')
      setErrorMessage(error instanceof Error ? error.message : '设置视频流失败')
    }
  }, [stream, resetVideoState, playVideo])

  // 清理函数
  const cleanup = useCallback(() => {
    const video = videoRef.current
    if (video) {
      video.removeEventListener('loadedmetadata', handleVideoLoadedMetadata)
      video.removeEventListener('canplay', handleVideoCanPlay)
      video.removeEventListener('playing', handleVideoPlaying)
      video.removeEventListener('error', handleVideoError)
      video.removeEventListener('stalled', handleVideoStalled)
      video.removeEventListener('waiting', handleVideoWaiting)

      // 清理视频流
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        video.srcObject = null
      }
    }
    resetVideoState()
  }, [handleVideoLoadedMetadata, handleVideoCanPlay, handleVideoPlaying, handleVideoError, handleVideoStalled, handleVideoWaiting, resetVideoState])

  // 重试函数
  const retryConnection = useCallback(() => {
    console.log('CameraOverlay: 重试视频连接')
    if (stream) {
      attachStreamToVideo()
    }
  }, [stream, attachStreamToVideo])

  // 主要的effect：处理视频流设置
  useEffect(() => {
    if (!isVisible) {
      cleanup()
      return
    }

    if (!stream) {
      console.log('CameraOverlay: 等待视频流...')
      resetVideoState()
      return
    }

    const video = videoRef.current
    if (!video) {
      console.error('CameraOverlay: 视频元素引用不存在')
      return
    }

    // 添加事件监听器
    video.addEventListener('loadedmetadata', handleVideoLoadedMetadata)
    video.addEventListener('canplay', handleVideoCanPlay)
    video.addEventListener('playing', handleVideoPlaying)
    video.addEventListener('error', handleVideoError)
    video.addEventListener('stalled', handleVideoStalled)
    video.addEventListener('waiting', handleVideoWaiting)

    // 设置视频流
    attachStreamToVideo()

    // 清理函数
    return cleanup
  }, [isVisible, stream, attachStreamToVideo, cleanup, handleVideoLoadedMetadata, handleVideoCanPlay, handleVideoPlaying, handleVideoError, handleVideoStalled, handleVideoWaiting])

  // 组件卸载时清理
  useEffect(() => {
    return cleanup
  }, [cleanup])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* 视频元素 */}
      <video 
        ref={videoRef}
        id="camera-stream"
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        controls={false}
      />
      
      {/* 加载状态覆盖层 */}
      {videoState === 'loading' && !errorMessage && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-white text-center">
            <motion.div
              className="w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-lg">正在连接相机...</p>
            <p className="text-sm text-gray-300 mt-2">
              {isStreamAttached ? '正在加载视频流...' : '请允许相机权限'}
            </p>
          </div>
        </div>
      )}
      
      {/* 错误状态覆盖层 */}
      {(videoState === 'error' || errorMessage) && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-white text-center p-6 max-w-sm">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-lg font-semibold mb-2">相机连接失败</p>
            <p className="text-sm text-gray-300 mb-4">
              {errorMessage || '无法显示相机画面'}
            </p>
            <div className="space-y-3">
              <button
                onClick={retryConnection}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                重试连接
              </button>
              <button
                onClick={onClose}
                className="block w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                关闭相机
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 视频就绪但需要用户交互时的提示 */}
      {videoState === 'ready' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white p-4 rounded-lg text-center">
          <p className="text-sm mb-2">点击屏幕开始相机预览</p>
          <button
            onClick={playVideo}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            开始预览
          </button>
        </div>
      )}
      
      {/* 只有在视频正常播放时才显示UI覆盖层 */}
      {videoState === 'playing' && (
        <>
          {/* 半透明遮罩层 */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
          
          {/* 手掌引导轮廓 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-[380px] h-[450px]"
            >
              {/* SVG手掌轮廓 */}
              <svg 
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 449 529" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <g filter="url(#palm-filter)">
                  <path 
                    d="M239.5 512.762C231.114 514.754 227 511 216 511C207.874 511.521 199.697 511.76 191.921 508.756C183 507 176.5 504.073 167.932 500.744C157.057 496.517 146.812 490.919 137.946 482.717C124.203 474.915 119.375 459.913 110.959 447.664C100.504 434.244 92.1983 419.542 81.4735 406.102C76.7857 399.843 69.7551 387.064 59.9838 372.552C51.5968 360.274 41.2048 338.291 38.4941 329.988C36.1432 324.861 29.9882 309.838 26.0001 300.444C21.7651 291.982 14.8154 279.152 10.0077 271.401C5.60684 264.31 6.00964 246.283 6.00964 239.353C7.17608 230.179 14.7325 230.129 16.5046 229.839C21.912 228.977 35.0687 227.355 39.9934 231.341C56.6934 236.649 64.2108 247.535 71.978 263.389C74.5168 268.486 78.9547 284.41 82.9728 288.426C96.7862 301.586 102.413 312.773 107.461 319.973C110.839 325.862 118.026 330.279 122.954 331.491C127.951 333.834 132.659 325.542 134.948 322.978C140.595 316.668 141.845 309.878 141.945 301.946C142.004 297.31 142.284 289.698 142.944 284.42C144.233 274.175 143.724 267.014 143.944 259.884C144.203 251.671 138.946 241.416 138.946 231.341C136.867 223.74 137.717 206.704 137.946 200.295C138.286 190.72 136.947 174.706 136.447 167.245C135.987 160.355 132.279 143.319 131.949 134.196C131.569 123.62 128.281 105.122 127.951 94.1359C127.741 87.2756 128.871 75.2595 129.451 69.1003C130.06 62.6256 130.5 51.2766 130.45 43.5621C130.42 38.797 133.798 31.1506 138.446 27.5382C145.103 20.3665 158.497 16.05 166.933 22.5307C178.237 30.7299 177.108 38.7489 179.427 43.5621C183.045 51.0523 182.095 60.4213 182.925 68.0988C183.555 76.0226 184.354 83.663 182.925 96.6396C182.925 102.348 183.465 114.727 183.924 122.178C184.424 130.27 186.863 146.324 187.922 152.223C189.512 161.056 191.421 176.659 190.921 184.771C190.261 195.507 193.08 207.105 193.92 214.315C194.799 221.907 200.716 233.304 205.914 237.851C209.912 241.346 217.408 232.573 217.408 220.825C216.379 203.74 220.447 191.912 219.907 184.771C219.427 178.432 219.907 163.58 219.907 162.238C219.098 159.003 219.907 155.568 219.907 152.223C219.907 144.972 217.268 135.668 217.908 126.184C218.298 120.355 217.318 104.531 216.909 96.1389C216.909 74.3231 216.349 86.194 216.409 76.6115C216.449 70.273 218.308 57.4809 219.407 53.0763C219.727 42.822 222.366 32.085 224.405 25.0344C227.653 16.0099 235.959 2.70906 247.894 2C264.456 2.8002 268.194 9.53526 268.884 19.5262C269.154 23.4471 270.213 35.8846 270.883 39.5561C271.143 45.0393 272.042 57.7353 272.382 64.5935C272.792 72.8148 274.901 84.8921 275.381 92.1329C275.66 96.3392 273.951 108.017 274.381 116.169C272.482 124.481 274.881 136.469 274.881 145.713V174.256C274.881 186.564 271.752 197.05 273.881 207.305C274.771 211.621 275.81 224.06 280.378 224.831C288.025 226.133 295.701 212.593 297.87 190.28C299.199 176.078 301.868 161.757 301.868 150.22C300.229 143.66 306.086 123.39 307.865 116.67C310.684 106.014 312.113 93.6452 314.862 85.6232C313.582 73.1083 318.15 60.4453 319.859 48.0688C322.358 38.9172 325.127 28.768 331.854 26.0359C338.35 20.3134 345.677 22.6979 349.845 24.5337C356.842 29.7925 359.41 37.2978 361.339 45.0644C362.929 51.4669 361.169 62.7578 360.34 68.5995C360.35 76.6405 360.95 86.4644 360.34 95.6381C359.74 104.662 357.341 115.448 357.341 122.679C357.451 132.673 355.842 147.996 355.842 159.734C353.613 174.476 352.843 188.707 349.845 203.299C347.786 213.014 342.418 226.574 342.348 237.35C342.348 246.634 337.751 258.692 349.845 260.384C356.842 268.767 366.187 243.048 370.335 235.347C375.143 223.91 381.75 206.314 384.328 198.292C387.177 190.53 393.524 179.634 395.823 172.253C401.84 160.185 404.489 149.829 406.818 141.707C410.786 133.765 418.332 127.055 423.809 126.184C431.136 125.022 437.153 131.081 441.801 138.202C444.809 146.194 441.401 158.542 439.802 170.25C436.753 185.442 432.825 198.882 429.377 207.615C426.898 213.875 420.641 227.635 417.812 235.888C414.464 244 410.596 254.826 407.407 260.805C403.899 267.365 397.522 276.709 395.323 285.422C392.185 298.011 391.825 308.767 391.825 318.471C391.825 324.69 389.826 330.239 389.826 338.501C390.595 348.766 386.587 358.301 387.827 368.546C388.476 371.14 388.326 378.901 387.327 385.571C388.147 395.376 383.439 408.165 381.83 414.615C379.89 422.376 374.833 439.782 374.833 443.157C365.877 459.612 364.998 471.38 359.34 479.211C354.493 485.421 349.525 494.474 343.848 498.741C339.17 502.256 334.142 506.612 329.854 508.756C321.848 513.152 322 518.77 298.869 518.77C289.264 517.899 284 514.356 271.882 512.762C258.5 511.001 249.865 513.332 239.5 512.762Z" 
                    stroke="#00ff88" 
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="10 5"
                    className="animate-pulse"
                  />
                </g>
                <defs>
                  <filter id="palm-filter">
                    <feGaussianBlur stdDeviation="2"/>
                    <feColorMatrix values="0 0 0 0 0 0 0 0 0 1 0 0 0 0 0.5 0 0 0 1 0"/>
                  </filter>
                </defs>
              </svg>
              
              {/* MediaPipe 实时手部检测可视化 */}
              {showHandLandmarks && detectedHands.length > 0 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {detectedHands.map((hand, handIndex) => {
                    const connections: [number, number][] = [
                      [0, 1], [1, 2], [2, 3], [3, 4],
                      [0, 5], [5, 6], [6, 7], [7, 8],
                      [5, 9], [9, 10], [10, 11], [11, 12],
                      [9, 13], [13, 14], [14, 15], [15, 16],
                      [13, 17], [17, 18], [18, 19], [19, 20],
                      [0, 17]
                    ];
                    
                    return (
                      <g key={`hand-${handIndex}`}>
                        {connections.map(([start, end], connectionIndex) => {
                          const startPoint = hand.landmarks[start as number];
                          const endPoint = hand.landmarks[end as number];
                          if (!startPoint || !endPoint) return null;
                          
                          return (
                            <line
                              key={`connection-${handIndex}-${connectionIndex}`}
                              x1={startPoint.x * 380}
                              y1={startPoint.y * 450}
                              x2={endPoint.x * 380}
                              y2={endPoint.y * 450}
                              stroke="#00ff00"
                              strokeWidth="2"
                              strokeOpacity="0.8"
                            />
                          );
                        })}
                        
                        {hand.landmarks.map((landmark, pointIndex) => (
                          <circle
                            key={`point-${handIndex}-${pointIndex}`}
                            cx={landmark.x * 380}
                            cy={landmark.y * 450}
                            r="4"
                            fill="#00ff00"
                            stroke="#ffffff"
                            strokeWidth="1"
                            fillOpacity="0.9"
                          />
                        ))}
                      </g>
                    );
                  })}
                </svg>
              )}
              
              {/* 中心提示信息 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    {detectedHands.length > 0 ? (
                      <>
                        <p className="text-lg font-semibold text-green-400">
                          ✅ 检测到 {detectedHands.length} 只手
                        </p>
                        <p className="text-sm text-gray-300">
                          {detectedHands[0]?.handedness} 手 | 置信度: {Math.round((detectedHands[0]?.confidence || 0) * 100)}%
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-semibold text-yellow-400">请将手掌放入框内</p>
                        <p className="text-sm text-gray-300">保持手掌平整，手指自然张开</p>
                      </>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* 顶部提示条 */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 pointer-events-none"
          >
            <div className="text-center">
              <h3 className="text-white text-lg font-medium mb-1">拍摄手掌照片</h3>
              <p className="text-gray-300 text-sm">将手掌对准绿色轮廓</p>
            </div>
          </motion.div>
          
          {/* 底部控制按钮 */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-between">
              {/* 取消按钮 */}
              <button
                onClick={onClose}
                className="w-14 h-14 rounded-full bg-gray-700/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-gray-600/80 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* 拍照按钮 - 居中 */}
              <button
                id="capture-button"
                disabled={videoState !== 'playing'}
                className={`w-20 h-20 rounded-full ring-4 ring-white/30 transition-all relative ${
                  videoState === 'playing'
                    ? 'bg-white hover:scale-105' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <div className={`absolute inset-2 rounded-full shadow-inner ${
                  videoState === 'playing' ? 'bg-white' : 'bg-gray-300'
                }`} />
                {videoState !== 'playing' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                )}
              </button>
              
              {/* 占位元素，保持拍照按钮居中 */}
              <div className="w-14 h-14"></div>
            </div>
            
            {/* 拍摄提示 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 text-center"
            >
              <p className="text-white/80 text-xs">提示：确保光线充足，避免阴影</p>
            </motion.div>
          </div>
          
          {/* 辅助线网格 */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </>
      )}
    </div>
  )
}