/**
 * AI背景消除API端点
 * 支持U2-Net, SAM等多种背景消除模型
 */

import { NextRequest, NextResponse } from 'next/server'

interface RemoveBackgroundRequest {
  image: string // base64 encoded image
  model?: 'u2net' | 'u2net_hand' | 'silueta' | 'sam'
}

interface RemoveBackgroundResponse {
  processedImage: string // base64 encoded image with background removed
  processingTime: number
  model: string
  success: boolean
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RemoveBackgroundRequest = await request.json()
    const { image, model = 'u2net_hand' } = body
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided', success: false },
        { status: 400 }
      )
    }
    
    console.log(`🎯 Starting background removal with model: ${model}`)
    const startTime = performance.now()
    
    // 选择背景消除策略
    let processedImage: string
    
    switch (model) {
      case 'u2net_hand':
        processedImage = await removeBackgroundWithU2NetHand(image)
        break
      case 'u2net':
        processedImage = await removeBackgroundWithU2Net(image)
        break
      case 'sam':
        processedImage = await removeBackgroundWithSAM(image)
        break
      default:
        processedImage = await removeBackgroundWithU2NetHand(image)
    }
    
    const processingTime = performance.now() - startTime
    
    console.log(`✅ Background removal completed in ${processingTime.toFixed(2)}ms`)
    
    const response: RemoveBackgroundResponse = {
      processedImage,
      processingTime,
      model,
      success: true
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Background removal failed:', error)
    
    const response: RemoveBackgroundResponse = {
      processedImage: '',
      processingTime: 0,
      model: 'error',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * U2-Net Hand专门模型 - 针对手部优化
 */
async function removeBackgroundWithU2NetHand(imageBase64: string): Promise<string> {
  try {
    // 使用Replicate API的U2-Net手部专门模型
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
        input: {
          image: imageBase64,
          model: 'u2net_hand',
          return_mask: false
        }
      })
    })
    
    if (!response.ok) {
      throw new Error(`U2-Net API error: ${response.status}`)
    }
    
    const prediction = await response.json()
    
    // 轮询结果
    let result = prediction
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      })
      
      result = await statusResponse.json()
    }
    
    if (result.status === 'succeeded' && result.output) {
      // 将输出URL转换为base64
      return await urlToBase64(result.output)
    }
    
    throw new Error('U2-Net processing failed')
    
  } catch (error) {
    console.error('❌ U2-Net Hand failed:', error)
    throw error
  }
}

/**
 * 通用U2-Net模型
 */
async function removeBackgroundWithU2Net(imageBase64: string): Promise<string> {
  try {
    // 使用免费的remove.bg API替代
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_file_b64: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
        size: 'auto'
      })
    })
    
    if (!response.ok) {
      throw new Error(`Remove.bg API error: ${response.status}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    return `data:image/png;base64,${base64}`
    
  } catch (error) {
    console.error('❌ U2-Net failed:', error)
    throw error
  }
}

/**
 * SAM背景消除
 */
async function removeBackgroundWithSAM(imageBase64: string): Promise<string> {
  try {
    // 使用Hugging Face的SAM模型
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/sam-vit-huge', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: imageBase64,
        parameters: {
          threshold: 0.5,
          mask_threshold: 0.5
        }
      })
    })
    
    if (!response.ok) {
      throw new Error(`SAM API error: ${response.status}`)
    }
    
    const result = await response.arrayBuffer()
    const base64 = Buffer.from(result).toString('base64')
    return `data:image/png;base64,${base64}`
    
  } catch (error) {
    console.error('❌ SAM failed:', error)
    throw error
  }
}

/**
 * 将URL转换为base64
 */
async function urlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    
    // 检测图片类型
    const contentType = response.headers.get('content-type') || 'image/png'
    return `data:${contentType};base64,${base64}`
    
  } catch (error) {
    console.error('❌ URL to base64 conversion failed:', error)
    throw error
  }
}

/**
 * 客户端简单背景消除（备用方案）
 */
async function removeBackgroundClientSide(imageBase64: string): Promise<string> {
  try {
    // 使用Canvas API进行简单的背景消除
    // 这是一个基本的实现，主要用作备用方案
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        canvas.width = img.width
        canvas.height = img.height
        
        ctx.drawImage(img, 0, 0)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // 简单的背景消除算法 - 基于颜色差异
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          
          // 检测皮肤色调
          const isSkinTone = (
            r > 100 && r < 255 &&
            g > 80 && g < 220 &&
            b > 60 && b < 200 &&
            Math.abs(r - g) < 50 &&
            Math.abs(r - b) < 50
          )
          
          if (!isSkinTone) {
            data[i + 3] = 0 // 设置透明
          }
        }
        
        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL())
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imageBase64
    })
    
  } catch (error) {
    console.error('❌ Client-side background removal failed:', error)
    throw error
  }
}