/**
 * 调试API - 检查手部检测相关环境变量
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    const envCheck = {
      // 客户端可访问的环境变量
      NEXT_PUBLIC_HUGGINGFACE_API_KEY: process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY ? '✅ 已设置' : '❌ 缺失',
      NEXT_PUBLIC_MEDIAPIPE_WASM_BASE: process.env.NEXT_PUBLIC_MEDIAPIPE_WASM_BASE || '使用默认CDN',
      NEXT_PUBLIC_HAND_LANDMARKER_MODEL: process.env.NEXT_PUBLIC_HAND_LANDMARKER_MODEL || '使用默认模型',
      
      // 服务端环境变量
      REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN ? '✅ 已设置' : '❌ 缺失',
      REMOVE_BG_API_KEY: process.env.REMOVE_BG_API_KEY ? '✅ 已设置' : '❌ 缺失',
      
      // 部署环境信息
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV || 'local',
      
      // AI检测逻辑状态
      canUseAdvancedAI: !!(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY && process.env.REPLICATE_API_TOKEN),
      canUseBackgroundRemoval: !!(process.env.REPLICATE_API_TOKEN || process.env.REMOVE_BG_API_KEY)
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      recommendations: generateRecommendations(envCheck)
    })
    
  } catch (error) {
    console.error('❌ Debug API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

function generateRecommendations(envCheck: any): string[] {
  const recommendations: string[] = []
  
  if (envCheck.NEXT_PUBLIC_HUGGINGFACE_API_KEY === '❌ 缺失') {
    recommendations.push('获取 Hugging Face API Key: https://huggingface.co/settings/tokens')
  }
  
  if (envCheck.REPLICATE_API_TOKEN === '❌ 缺失') {
    recommendations.push('获取 Replicate API Token: https://replicate.com/account/api-tokens')
  }
  
  if (envCheck.REMOVE_BG_API_KEY === '❌ 缺失') {
    recommendations.push('获取 Remove.bg API Key: https://www.remove.bg/api')
  }
  
  if (!envCheck.canUseAdvancedAI) {
    recommendations.push('配置 NEXT_PUBLIC_HUGGINGFACE_API_KEY 和 REPLICATE_API_TOKEN 以启用高级AI检测')
  }
  
  if (envCheck.NODE_ENV !== 'production') {
    recommendations.push('高级AI检测仅在生产环境启用，开发环境使用免费MediaPipe检测')
  }
  
  return recommendations
}