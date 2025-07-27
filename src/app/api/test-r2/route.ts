/**
 * R2 Configuration Test API
 * 测试 Cloudflare R2 配置和连接
 */

import { NextRequest, NextResponse } from 'next/server';
import { createR2Client } from '@rolitt/image-upload';

export const runtime = 'nodejs';

export async function GET(_request: NextRequest) {
  try {
    console.log('=== R2 Configuration Test Started ===');
    
    // 1. 检查环境变量
    const envCheck = {
      CLOUDFLARE_R2_BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME ? 'SET' : 'MISSING',
      CLOUDFLARE_R2_REGION: process.env.CLOUDFLARE_R2_REGION ? 'SET' : 'MISSING',
      CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ? 'SET' : 'MISSING',
      CLOUDFLARE_R2_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ? 'SET' : 'MISSING',
      CLOUDFLARE_R2_ENDPOINT: process.env.CLOUDFLARE_R2_ENDPOINT ? 'SET' : 'MISSING',
    };
    
    console.log('Environment variables check:', envCheck);
    
    // 2. 显示实际配置值（安全的）
    const configValues = {
      bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      region: process.env.CLOUDFLARE_R2_REGION,
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.substring(0, 8) + '...',
      secretKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.substring(0, 8) + '...',
    };
    
    console.log('Configuration values:', configValues);
    
    // 3. 尝试创建 R2 客户端
    let clientCreated = false;
    let clientError = null;
    let r2Client = null;
    
    try {
      r2Client = createR2Client();
      clientCreated = true;
      console.log('✅ R2 Client created successfully');
    } catch (error) {
      clientError = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to create R2 client:', clientError);
    }
    
    // 4. 尝试生成预签名URL
    let presignedUrlGenerated = false;
    let presignedUrlError = null;
    let samplePresignedUrl = null;
    
    if (clientCreated && r2Client) {
      try {
        const testKey = `test-${Date.now()}.jpg`;
        const presignedData = await r2Client.generatePresignedUrl(
          testKey,
          'image/jpeg',
          3600
        );
        presignedUrlGenerated = true;
        samplePresignedUrl = presignedData.url.substring(0, 100) + '...';
        console.log('✅ Presigned URL generated successfully');
      } catch (error) {
        presignedUrlError = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Failed to generate presigned URL:', presignedUrlError);
      }
    }
    
    // 5. 测试公共URL格式
    let publicUrlFormat = null;
    if (r2Client && process.env.CLOUDFLARE_R2_BUCKET_NAME) {
      const testKey = 'sample-file.jpg';
      publicUrlFormat = r2Client.getPublicUrl(testKey);
      console.log('Public URL format:', publicUrlFormat);
    }
    
    console.log('=== R2 Configuration Test Completed ===');
    
    // 返回测试结果
    const testResults = {
      success: clientCreated && presignedUrlGenerated,
      timestamp: new Date().toISOString(),
      environment: {
        variables: envCheck,
        values: configValues,
      },
      tests: {
        clientCreation: {
          success: clientCreated,
          error: clientError,
        },
        presignedUrl: {
          success: presignedUrlGenerated,
          error: presignedUrlError,
          sampleUrl: samplePresignedUrl,
        },
        publicUrlFormat,
      },
      recommendations: [] as string[]
    };
    
    // 添加建议
    if (process.env.CLOUDFLARE_R2_ENDPOINT?.includes(process.env.CLOUDFLARE_R2_BUCKET_NAME || '')) {
      testResults.recommendations.push(
        'Consider removing the bucket name from your R2_ENDPOINT. The bucket should not be part of the endpoint URL.'
      );
    }
    
    if (!clientCreated) {
      testResults.recommendations.push(
        'Check your environment variables. All R2 configuration variables must be set correctly.'
      );
    }
    
    if (clientCreated && !presignedUrlGenerated) {
      testResults.recommendations.push(
        'Client creation succeeded but presigned URL generation failed. Check your credentials and permissions.'
      );
    }
    
    return NextResponse.json(testResults, {
      status: testResults.success ? 200 : 500,
    });
    
  } catch (error) {
    console.error('R2 test API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, {
      status: 500,
    });
  }
}