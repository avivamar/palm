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
  const imageRef = useRef<HTMLImageElement>(null)

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
    // Draw hand landmarks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 1

    // Draw connections between landmarks
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [5, 9], [9, 10], [10, 11], [11, 12], // Middle
      [9, 13], [13, 14], [14, 15], [15, 16], // Ring
      [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [0, 17] // Wrist to pinky base
    ]

    connections.forEach(([start, end]) => {
      if (landmarks[start] && landmarks[end]) {
        ctx.beginPath()
        ctx.moveTo(landmarks[start].x * width, landmarks[start].y * height)
        ctx.lineTo(landmarks[end].x * width, landmarks[end].y * height)
        ctx.stroke()
      }
    })

    // Draw landmark points
    landmarks.forEach((landmark, index) => {
      ctx.beginPath()
      ctx.arc(landmark.x * width, landmark.y * height, 3, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  const drawPalmLines = (ctx: CanvasRenderingContext2D, lines: PalmLines, width: number, height: number) => {
    // 生命线 - 绿色
    if (lines.lifeLine) {
      drawCurvedLine(ctx, lines.lifeLine, width, height, '#4ADE80', '生命线')
    }

    // 心线（感情线） - 红色
    if (lines.heartLine) {
      drawCurvedLine(ctx, lines.heartLine, width, height, '#F87171', '感情线')
    }

    // 头线（智慧线） - 蓝色
    if (lines.headLine) {
      drawCurvedLine(ctx, lines.headLine, width, height, '#60A5FA', '智慧线')
    }

    // 命运线 - 紫色
    if (lines.fateLine) {
      drawCurvedLine(ctx, lines.fateLine, width, height, '#C084FC', '命运线')
    }
  }

  const drawCurvedLine = (
    ctx: CanvasRenderingContext2D,
    line: { start: Point2D; end: Point2D; curve: Point2D[] },
    width: number,
    height: number,
    color: string,
    label: string
  ) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    // Draw bezier curve through points
    ctx.beginPath()
    ctx.moveTo(line.start.x * width, line.start.y * height)
    
    if (line.curve && line.curve.length > 0) {
      // Use quadratic bezier curves for smooth lines
      for (let i = 0; i < line.curve.length; i++) {
        const cp = line.curve[i]
        const next = i < line.curve.length - 1 ? line.curve[i + 1] : line.end
        
        ctx.quadraticCurveTo(
          cp.x * width,
          cp.y * height,
          next.x * width,
          next.y * height
        )
      }
    } else {
      // Direct line if no curve points
      ctx.lineTo(line.end.x * width, line.end.y * height)
    }
    
    ctx.stroke()
    
    // Draw label
    ctx.fillStyle = color
    ctx.font = 'bold 12px sans-serif'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 3
    ctx.fillText(label, line.start.x * width, line.start.y * height - 5)
    ctx.shadowBlur = 0
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