/**
 * MediaPipe 手部检测 React Hook
 * 提供简单的接口来使用 MediaPipe Hand Landmarker
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import HandLandmarkerService, { 
  ProcessedHandData, 
  HandDetectionConfig
} from '@/libs/mediapipe/HandLandmarkerService';

export interface UseMediaPipeHandDetectionOptions extends HandDetectionConfig {
  autoStart?: boolean;  // 是否自动开始检测
  fps?: number;         // 视频检测的帧率
}

export interface UseMediaPipeHandDetectionReturn {
  // 状态
  isInitialized: boolean;
  isDetecting: boolean;
  error: Error | null;
  
  // 检测结果
  hands: ProcessedHandData[];
  lastDetectionTime: number | null;
  
  // 方法
  initialize: () => Promise<void>;
  detectImage: (image: HTMLImageElement | HTMLCanvasElement) => Promise<ProcessedHandData[]>;
  startVideoDetection: (video: HTMLVideoElement) => void;
  stopVideoDetection: () => void;
  updateConfig: (config: Partial<HandDetectionConfig>) => Promise<void>;
  reset: () => void;
}

export function useMediaPipeHandDetection(
  options: UseMediaPipeHandDetectionOptions = {}
): UseMediaPipeHandDetectionReturn {
  const {
    autoStart = false,
    fps = 30,
    onResults,
    onError,
    ...config
  } = options;
  
  // 状态管理
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hands, setHands] = useState<ProcessedHandData[]>([]);
  const [lastDetectionTime, setLastDetectionTime] = useState<number | null>(null);
  
  // Refs
  const serviceRef = useRef<HandLandmarkerService | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // 初始化服务
  const initialize = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      setError(null);
      console.log('🚀 初始化 MediaPipe Hand Detection...');
      
      // 创建新的服务实例或使用全局实例
      if (!serviceRef.current) {
        serviceRef.current = new HandLandmarkerService({
          ...config,
          onResults: (result) => {
            // 处理结果
            const processedHands = serviceRef.current 
              ? result.landmarks?.map((landmarks, index) => ({
                  landmarks,
                  worldLandmarks: result.worldLandmarks?.[index] || [],
                  handedness: result.handednesses?.[index]?.[0]?.categoryName === 'Left' ? 'Left' as const : 'Right' as const,
                  confidence: result.handednesses?.[index]?.[0]?.score || 0
                })).filter((hand): hand is ProcessedHandData => 
                  hand.landmarks.length === 21
                ) || []
              : [];
            
            setHands(processedHands);
            setLastDetectionTime(Date.now());
            
            if (onResults) {
              onResults(result);
            }
          },
          onError: (err) => {
            setError(err);
            if (onError) {
              onError(err);
            }
          }
        });
      }
      
      await serviceRef.current.initialize();
      setIsInitialized(true);
      console.log('✅ MediaPipe 初始化成功');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsInitialized(false);
      console.error('❌ MediaPipe 初始化失败:', error);
      throw error;
    }
  }, [config, onResults, onError, isInitialized]);
  
  // 检测图片
  const detectImage = useCallback(async (
    image: HTMLImageElement | HTMLCanvasElement
  ): Promise<ProcessedHandData[]> => {
    if (!serviceRef.current) {
      throw new Error('MediaPipe 服务未初始化');
    }
    
    try {
      setError(null);
      const detectedHands = await serviceRef.current.detectFromImage(image);
      setHands(detectedHands);
      setLastDetectionTime(Date.now());
      return detectedHands;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);
  
  // 视频检测循环
  const detectVideoFrame = useCallback(async () => {
    if (!serviceRef.current || !videoRef.current || !isDetecting) {
      return;
    }
    
    const video = videoRef.current;
    
    // 检查视频是否准备好
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(detectVideoFrame);
      return;
    }
    
    const currentTime = performance.now();
    const frameInterval = 1000 / fps;
    
    // 控制帧率
    if (currentTime - lastFrameTimeRef.current >= frameInterval) {
      try {
        const detectedHands = await serviceRef.current.detectFromVideoFrame(
          video,
          currentTime
        );
        setHands(detectedHands);
        setLastDetectionTime(Date.now());
        lastFrameTimeRef.current = currentTime;
      } catch (err) {
        console.error('视频检测错误:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }
    
    if (isDetecting) {
      animationFrameRef.current = requestAnimationFrame(detectVideoFrame);
    }
  }, [fps, isDetecting]);
  
  // 开始视频检测
  const startVideoDetection = useCallback((video: HTMLVideoElement) => {
    if (!isInitialized) {
      console.error('MediaPipe 未初始化，请先调用 initialize()');
      return;
    }
    
    videoRef.current = video;
    setIsDetecting(true);
    setError(null);
    
    // 开始检测循环
    detectVideoFrame();
  }, [isInitialized, detectVideoFrame]);
  
  // 停止视频检测
  const stopVideoDetection = useCallback(() => {
    setIsDetecting(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    videoRef.current = null;
  }, []);
  
  // 更新配置
  const updateConfig = useCallback(async (newConfig: Partial<HandDetectionConfig>) => {
    if (!serviceRef.current) {
      throw new Error('MediaPipe 服务未初始化');
    }
    
    try {
      await serviceRef.current.updateConfig(newConfig);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);
  
  // 重置状态
  const reset = useCallback(() => {
    stopVideoDetection();
    setHands([]);
    setLastDetectionTime(null);
    setError(null);
  }, [stopVideoDetection]);
  
  // 自动初始化
  useEffect(() => {
    if (autoStart && !isInitialized) {
      initialize().catch(console.error);
    }
  }, [autoStart, initialize, isInitialized]);
  
  // 清理
  useEffect(() => {
    return () => {
      stopVideoDetection();
      if (serviceRef.current) {
        serviceRef.current.dispose().catch(console.error);
      }
    };
  }, [stopVideoDetection]);
  
  return {
    // 状态
    isInitialized,
    isDetecting,
    error,
    
    // 检测结果
    hands,
    lastDetectionTime,
    
    // 方法
    initialize,
    detectImage,
    startVideoDetection,
    stopVideoDetection,
    updateConfig,
    reset
  };
}