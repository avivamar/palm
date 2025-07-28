/**
 * Palm AI 图片上传和会话创建 API
 * 处理双手图片上传并创建分析会话
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createServerClient } from '@/libs/supabase/config';
import { getSafeDB } from '@/libs/DB';
import { palmAnalysisSessionsSchema } from '@/models/Schema';
import sharp from 'sharp';
import { eq } from 'drizzle-orm';
import { createR2Client } from '@rolitt/image-upload';
import { nanoid } from 'nanoid';

// 使用 Node.js runtime 以支持 Supabase
export const runtime = 'nodejs';

// Request validation schema
const UploadDataSchema = z.object({
  analysisType: z.enum(['quick', 'complete']).default('quick'),
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  birthLocation: z.string().optional(),
  hasLeftHand: z.boolean().default(false),
  hasRightHand: z.boolean().default(false),
});

// 图片验证函数
async function validateAndProcessImage(file: File, handType: 'left' | 'right') {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    throw new Error(`${handType === 'left' ? '左手' : '右手'}图片格式不支持`);
  }

  // 验证文件大小 (最大 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error(`${handType === 'left' ? '左手' : '右手'}图片大小不能超过 10MB`);
  }

  // 读取并处理图片
  const buffer = Buffer.from(await file.arrayBuffer());
  
  try {
    // 使用 Sharp 获取图片信息并进行基本处理
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new Error(`无法读取${handType === 'left' ? '左手' : '右手'}图片信息`);
    }

    // 图片尺寸验证
    if (metadata.width < 200 || metadata.height < 200) {
      throw new Error(`${handType === 'left' ? '左手' : '右手'}图片分辨率过低，请上传至少 200x200 像素的图片`);
    }

    // 处理图片：调整大小和优化
    const processedBuffer = await image
      .resize(800, 800, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85, 
        progressive: true 
      })
      .toBuffer();

    return {
      buffer: processedBuffer,
      width: metadata.width,
      height: metadata.height,
      size: processedBuffer.length,
      mimeType: 'image/jpeg'
    };
  } catch (error) {
    throw new Error(`处理${handType === 'left' ? '左手' : '右手'}图片时出错: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 上传图片到 Cloudflare R2
async function uploadImageToR2(buffer: Buffer, handType: 'left' | 'right', sessionId: string) {
  try {
    console.log('Starting R2 upload for', handType, 'hand, session:', sessionId);
    console.log('Environment variables check:', {
      bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME ? 'SET' : 'MISSING',
      region: process.env.CLOUDFLARE_R2_REGION ? 'SET' : 'MISSING',
      accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ? 'SET' : 'MISSING',
      secretKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ? 'SET' : 'MISSING',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT ? 'SET' : 'MISSING',
    });

    const r2Client = createR2Client();
    const filename = `palm-sessions/${sessionId}/${handType}-hand-${Date.now()}.jpg`;
    
    console.log('R2 Upload Config:', {
      bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      region: process.env.CLOUDFLARE_R2_REGION,
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      filename,
      bufferSize: buffer.length,
    });
    
    // 生成预签名URL
    console.log('Generating presigned URL...');
    const presignedData = await r2Client.generatePresignedUrl(
      filename,
      'image/jpeg',
      3600 // 1小时过期
    );
    
    console.log('Generated presigned URL data:', {
      url: presignedData.url,
      key: presignedData.key,
    });
    
    // 使用预签名URL上传
    console.log('Starting upload to presigned URL...');
    const uploadResponse = await fetch(presignedData.url, {
      method: 'PUT',
      body: buffer,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
    
    console.log('Upload response details:', {
      status: uploadResponse.status,
      statusText: uploadResponse.statusText,
      headers: Object.fromEntries(uploadResponse.headers.entries()),
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Upload error response:', errorText);
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
    }
    
    // 构建公共访问URL
    const publicUrl = r2Client.getPublicUrl(filename);
    console.log('Generated public URL using R2Client:', publicUrl);
    
    // Test the public URL
    try {
      const testResponse = await fetch(publicUrl, { method: 'HEAD' });
      console.log('Public URL test:', {
        status: testResponse.status,
        accessible: testResponse.ok,
      });
    } catch (testError) {
      console.log('Public URL test failed:', testError);
    }
    
    return publicUrl;
  } catch (error) {
    console.error(`R2 upload error for ${handType} hand:`, error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    throw new Error(`上传${handType === 'left' ? '左手' : '右手'}图片失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. 检查用户认证（可选）
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user; // 用户可能未登录

    // 2. 生成安全的会话ID (UUID)
    const sessionId = uuidv4();

    // 3. 解析 FormData
    const formData = await request.formData();
    const leftHandFile = formData.get('leftHandImage') as File | null;
    const rightHandFile = formData.get('rightHandImage') as File | null;
    const dataString = formData.get('data') as string;

    if (!leftHandFile && !rightHandFile) {
      return NextResponse.json(
        { error: '请至少上传一只手的照片' },
        { status: 400 }
      );
    }

    if (!dataString) {
      return NextResponse.json(
        { error: '缺少分析配置数据' },
        { status: 400 }
      );
    }

    // 3. 验证配置数据
    let configData;
    try {
      configData = JSON.parse(dataString);
    } catch (error) {
      return NextResponse.json(
        { error: '分析配置数据格式错误' },
        { status: 400 }
      );
    }

    const validatedData = UploadDataSchema.parse(configData);

    // 4. 处理图片
    const processedImages: {
      leftHand?: { buffer: Buffer; url: string; metadata: any };
      rightHand?: { buffer: Buffer; url: string; metadata: any };
    } = {};

    try {
      // 处理左手图片
      if (leftHandFile) {
        const processed = await validateAndProcessImage(leftHandFile, 'left');
        const url = await uploadImageToR2(processed.buffer, 'left', sessionId);
        processedImages.leftHand = {
          buffer: processed.buffer,
          url,
          metadata: {
            width: processed.width,
            height: processed.height,
            size: processed.size,
            mimeType: processed.mimeType
          }
        };
      }

      // 处理右手图片
      if (rightHandFile) {
        const processed = await validateAndProcessImage(rightHandFile, 'right');
        const url = await uploadImageToR2(processed.buffer, 'right', sessionId);
        processedImages.rightHand = {
          buffer: processed.buffer,
          url,
          metadata: {
            width: processed.width,
            height: processed.height,
            size: processed.size,
            mimeType: processed.mimeType
          }
        };
      }
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : '图片处理失败' },
        { status: 400 }
      );
    }

    // 5. 创建分析会话
    const db = await getSafeDB();
    
    const sessionData = {
      sessionId, // 使用之前生成的UUID会话ID
      userId: user?.id || null, // 用户ID可选
      status: 'pending' as const,
      analysisType: validatedData.analysisType,
      birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
      birthTime: validatedData.birthTime || null,
      birthLocation: validatedData.birthLocation || null,
      leftHandImageUrl: processedImages.leftHand?.url || null,
      rightHandImageUrl: processedImages.rightHand?.url || null,
      imageMetadata: JSON.stringify({
        leftHand: processedImages.leftHand?.metadata || null,
        rightHand: processedImages.rightHand?.metadata || null,
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [createdSession] = await db
      .insert(palmAnalysisSessionsSchema)
      .values(sessionData)
      .returning();

    if (!createdSession) {
      return NextResponse.json(
        { error: '创建分析会话失败' },
        { status: 500 }
      );
    }

    // 6. 立即启动分析处理（异步）
    // 这里可以触发后台分析任务
    fetch(`${request.nextUrl.origin}/api/palm/analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify({
        sessionId: createdSession.sessionId, // 使用UUID而不是数字ID
        analysisType: validatedData.analysisType,
      }),
    }).catch(error => {
      console.error('Failed to start analysis:', error);
    });

    // 7. 返回会话信息
    return NextResponse.json({
      success: true,
      sessionId: createdSession.sessionId, // 返回UUID而不是数字ID
      status: createdSession.status,
      analysisType: createdSession.analysisType,
      hasLeftHand: !!processedImages.leftHand,
      hasRightHand: !!processedImages.rightHand,
      estimatedTime: validatedData.analysisType === 'quick' ? 60 : 300, // 秒
      message: '图片上传成功，分析已开始',
    });

  } catch (error) {
    console.error('Palm upload error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '请求数据验证失败', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '上传处理失败，请重试' },
      { status: 500 }
    );
  }
}

// GET: 获取用户的分析会话列表
export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户认证
    const supabase = await createServerClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const user = session.user;

    // 2. 获取查询参数
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || 'all';

    // 3. 查询用户的分析会话
    const db = await getSafeDB();
    let query = db
      .select({
        id: palmAnalysisSessionsSchema.id,
        status: palmAnalysisSessionsSchema.status,
        analysisType: palmAnalysisSessionsSchema.analysisType,
        hasLeftHand: palmAnalysisSessionsSchema.leftHandImageUrl,
        hasRightHand: palmAnalysisSessionsSchema.rightHandImageUrl,
        createdAt: palmAnalysisSessionsSchema.createdAt,
        completedAt: palmAnalysisSessionsSchema.completedAt,
      })
      .from(palmAnalysisSessionsSchema)
      .where(eq(palmAnalysisSessionsSchema.userId, user.id))
      .limit(limit)
      .offset(offset);

    const sessions = await query;

    // 4. 过滤和格式化结果
    const filteredSessions = sessions
      .filter((session: any) => status === 'all' || session.status === status)
      .map((session: any) => ({
        ...session,
        hasLeftHand: !!session.hasLeftHand,
        hasRightHand: !!session.hasRightHand,
      }));

    return NextResponse.json({
      success: true,
      sessions: filteredSessions,
      pagination: {
        limit,
        offset,
        total: filteredSessions.length,
        hasMore: filteredSessions.length === limit,
      },
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: '获取会话列表失败' },
      { status: 500 }
    );
  }
}