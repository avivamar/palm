'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface PalmLines {
  lifeLine: { start: Point2D; end: Point2D; curve: Point2D[] }
  heartLine: { start: Point2D; end: Point2D; curve: Point2D[] }
  headLine: { start: Point2D; end: Point2D; curve: Point2D[] }
  fateLine?: { start: Point2D; end: Point2D; curve: Point2D[] }
}

interface Point2D {
  x: number
  y: number
}

interface PalmLineVisualizationProps {
  imageUrl: string
  palmLines?: PalmLines
  landmarks?: any[]
  width?: number
  height?: number
}

export default function PalmLineVisualization({
  imageUrl,
  palmLines,
  landmarks,
  width = 400,
  height = 400
}: PalmLineVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const image = new Image()
    image.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw image
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      
      // Draw landmarks if available
      if (landmarks && landmarks.length > 0) {
        drawLandmarks(ctx, landmarks[0], canvas.width, canvas.height)
      }
      
      // Draw palm lines if available
      if (palmLines) {
        drawPalmLines(ctx, palmLines, canvas.width, canvas.height)
      }
    }
    image.src = imageUrl
  }, [imageUrl, palmLines, landmarks])

  const drawLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    // Draw hand landmarks with improved visibility
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.lineWidth = 1.5

    // MediaPipe hand landmark connections - anatomically correct
    const connections: [number, number][] = [
      // Thumb
      [0, 1], [1, 2], [2, 3], [3, 4],
      // Index finger
      [0, 5], [5, 6], [6, 7], [7, 8],
      // Middle finger  
      [5, 9], [9, 10], [10, 11], [11, 12],
      // Ring finger
      [9, 13], [13, 14], [14, 15], [15, 16],
      // Pinky finger
      [13, 17], [17, 18], [18, 19], [19, 20],
      // Palm connections
      [0, 17] // Wrist to pinky base
    ]

    // Draw connections with proper coordinate transformation
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start]
      const endPoint = landmarks[end]
      if (startPoint && endPoint) {
        ctx.beginPath()
        ctx.moveTo(transformX(startPoint.x, width), transformY(startPoint.y, height))
        ctx.lineTo(transformX(endPoint.x, width), transformY(endPoint.y, height))
        ctx.stroke()
      }
    })

    // Draw landmark points with labels for debugging
    landmarks.forEach((landmark) => {
      const x = transformX(landmark.x, width)
      const y = transformY(landmark.y, height)
      
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  // Coordinate transformation functions for accurate positioning
  const transformX = (normalizedX: number, canvasWidth: number): number => {
    return normalizedX * canvasWidth
  }

  const transformY = (normalizedY: number, canvasHeight: number): number => {
    return normalizedY * canvasHeight
  }

  const drawPalmLines = (ctx: CanvasRenderingContext2D, lines: PalmLines, width: number, height: number) => {
    // 设置阴影效果，让线条更清晰
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 2
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1

    // 生命线 - 绿色（Life Line）
    if (lines.lifeLine) {
      drawCurvedLine(ctx, lines.lifeLine, width, height, '#10B981', '生命线', 4)
    }

    // 感情线 - 红色（Heart Line）
    if (lines.heartLine) {
      drawCurvedLine(ctx, lines.heartLine, width, height, '#EF4444', '感情线', 4)
    }

    // 智慧线 - 蓝色（Head Line）
    if (lines.headLine) {
      drawCurvedLine(ctx, lines.headLine, width, height, '#3B82F6', '智慧线', 4)
    }

    // 命运线 - 紫色（Fate Line）
    if (lines.fateLine) {
      drawCurvedLine(ctx, lines.fateLine, width, height, '#8B5CF6', '命运线', 3)
    }

    // 重置阴影
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }

  const drawCurvedLine = (
    ctx: CanvasRenderingContext2D,
    line: { start: Point2D; end: Point2D; curve: Point2D[] },
    width: number,
    height: number,
    color: string,
    label: string,
    lineWidth: number = 3
  ) => {
    // 设置线条样式
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    // 使用变换后的坐标绘制贝塞尔曲线
    ctx.beginPath()
    const startX = transformX(line.start.x, width)
    const startY = transformY(line.start.y, height)
    ctx.moveTo(startX, startY)
    
    if (line.curve && line.curve.length > 0) {
      // 使用三次贝塞尔曲线创建更平滑的线条
      if (line.curve.length >= 2 && line.curve[0] && line.curve[1]) {
        const cp1X = transformX(line.curve[0].x, width)
        const cp1Y = transformY(line.curve[0].y, height)
        const cp2X = transformX(line.curve[1].x, width)
        const cp2Y = transformY(line.curve[1].y, height)
        const endX = transformX(line.end.x, width)
        const endY = transformY(line.end.y, height)
        
        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY)
      } else if (line.curve[0]) {
        // 单个控制点的二次贝塞尔曲线
        const cpX = transformX(line.curve[0].x, width)
        const cpY = transformY(line.curve[0].y, height)
        const endX = transformX(line.end.x, width)
        const endY = transformY(line.end.y, height)
        
        ctx.quadraticCurveTo(cpX, cpY, endX, endY)
      }
    } else {
      // 直线连接（无控制点）
      const endX = transformX(line.end.x, width)
      const endY = transformY(line.end.y, height)
      ctx.lineTo(endX, endY)
    }
    
    ctx.stroke()
    
    // 绘制标签，使用更好的定位
    ctx.fillStyle = color
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textAlign = 'start'
    ctx.textBaseline = 'bottom'
    
    // 在起点附近显示标签，但避免重叠
    const labelX = startX + 5
    const labelY = startY - 8
    
    // 添加文字背景，提高可读性
    const textMetrics = ctx.measureText(label)
    const padding = 4
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(
      labelX - padding, 
      labelY - textMetrics.actualBoundingBoxAscent - padding,
      textMetrics.width + padding * 2,
      textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent + padding * 2
    )
    
    // 绘制文字
    ctx.fillStyle = color
    ctx.fillText(label, labelX, labelY)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full rounded-lg shadow-lg"
      />
      
      {/* Legend */}
      <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
        <h3 className="text-sm font-semibold mb-2">掌纹线识别结果</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded mr-2"></div>
            <span>生命线</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-400 rounded mr-2"></div>
            <span>感情线</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-400 rounded mr-2"></div>
            <span>智慧线</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-400 rounded mr-2"></div>
            <span>命运线</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}