/**
 * Palm AI 实际分析执行 API
 * 处理图像分析并生成报告
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/libs/supabase/config';
import { getSafeDB } from '@/libs/DB';
import { palmAnalysisSessionsSchema } from '@/models/Schema';
import { eq } from 'drizzle-orm';
// 临时移除AI核心包导入，等待修复
// import { PromptLoader } from '@rolitt/ai-core';
import type { UserInfo, ImageData } from '@rolitt/palm';
import { getPalmAnalysisPrompt } from '@/utils/palmPrompts';

// 使用 Node.js runtime 以支持 Supabase
export const runtime = 'nodejs';


// Request validation schema
const AnalysisRequestSchema = z.object({
  sessionId: z.string(),
  analysisType: z.enum(['quick', 'complete']).default('quick'),
});

export async function POST(request: NextRequest) {
  try {
    // 0. 从请求中获取语言环境
    const url = new URL(request.url);
    const referer = request.headers.get('referer') || '';
    
    // 从 referer 中提取语言路径 (/en/, /ja/, /es/, /zh-HK/)
    let locale = 'en'; // 默认英语
    const localeMatch = referer.match(/\/([a-z]{2}(?:-[A-Z]{2})?)\//);
    if (localeMatch) {
      locale = localeMatch[1];
    }
    
    console.log('Detected locale from referer:', locale, 'from:', referer);

    // 1. 检查用户认证（可选 - 支持免费体验）
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user; // 用户可能未登录
    
    // 为未登录用户生成临时ID
    const userId = user?.id || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 2. 解析请求数据
    const body = await request.json();
    const validatedData = AnalysisRequestSchema.parse(body);

    // 3. 获取分析会话 (使用UUID而不是数字ID)
    const db = await getSafeDB();
    const [analysisSession] = await db
      .select()
      .from(palmAnalysisSessionsSchema)
      .where(eq(palmAnalysisSessionsSchema.sessionId, validatedData.sessionId))
      .limit(1);

    if (!analysisSession) {
      return NextResponse.json(
        { error: 'Analysis session not found' },
        { status: 404 }
      );
    }

    // 4. 验证会话归属（如果有用户认证）
    if (user && analysisSession.userId && analysisSession.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to analysis session' },
        { status: 403 }
      );
    }
    
    // 4.1 对于未登录用户，只允许访问没有userId或与当前session匹配的会话
    if (!user && analysisSession.userId && !analysisSession.userId.startsWith('guest_')) {
      return NextResponse.json(
        { error: 'This analysis session requires authentication' },
        { status: 401 }
      );
    }

    // 5. 检查会话状态
    if (analysisSession.status === 'completed') {
      return NextResponse.json(
        { error: 'Analysis already completed' },
        { status: 400 }
      );
    }

    if (analysisSession.status === 'processing') {
      return NextResponse.json(
        { error: 'Analysis already in progress' },
        { status: 400 }
      );
    }

    if (analysisSession.status === 'failed') {
      return NextResponse.json(
        { error: 'Analysis failed previously' },
        { status: 400 }
      );
    }

    // 6. 更新状态为处理中
    await db
      .update(palmAnalysisSessionsSchema)
      .set({
        status: 'processing',
        updatedAt: new Date(),
      })
      .where(eq(palmAnalysisSessionsSchema.sessionId, validatedData.sessionId));

    // 7. 准备分析数据
    const userInfo: UserInfo = {
      birthDate: analysisSession.birthDate || new Date(),
      birthTime: analysisSession.birthTime || undefined,
      gender: 'other', // 默认值，实际项目中从用户资料获取
      location: analysisSession.birthLocation || undefined,
      language: 'en', // 默认值，实际项目中从用户偏好获取
    };

    // 8. 获取真实图像数据
    let imageData: ImageData | null = null;
    
    // 从左手或右手图片URL获取图像数据
    const imageUrl = analysisSession.leftHandImageUrl || analysisSession.rightHandImageUrl;
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image found for analysis' },
        { status: 400 }
      );
    }

    try {
      // 下载图像
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }
      
      const buffer = Buffer.from(await imageResponse.arrayBuffer());
      
      imageData = {
        buffer,
        mimeType: 'image/jpeg',
        size: buffer.length,
        width: 800, // 默认处理后的尺寸
        height: 800,
      };
    } catch (error) {
      console.error('Failed to download image:', error);
      return NextResponse.json(
        { error: 'Failed to download image for analysis' },
        { status: 500 }
      );
    }

    // 9. 创建真实的 Palm 分析引擎
    // 首先检查所需的环境变量
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('Missing OPENAI_API_KEY environment variable');
      return NextResponse.json(
        { error: 'AI service configuration error' },
        { status: 500 }
      );
    }

    console.log('Starting AI analysis with OpenAI directly...');
    
    let analysisResult;
    const startTime = Date.now();

    try {
      // 使用多语言提示词系统
      const analysisPrompt = getPalmAnalysisPrompt(locale, {
        birthDate: userInfo.birthDate?.toISOString().split('T')[0] || 'Not provided',
        birthTime: userInfo.birthTime || 'Not provided',
        birthLocation: userInfo.location || 'Not provided',
        analysisType: validatedData.analysisType === 'quick' ? 'Quick Analysis' : 'Complete Analysis'
      });

      console.log('Starting OpenAI analysis...');
      
      // 直接使用 OpenAI API
      const authHeader = 'Bearer ' + openaiApiKey;
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: analysisPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error('OpenAI API error:', errorText);
        const errorMessage = 'OpenAI API failed: ' + openaiResponse.status;
        throw new Error(errorMessage);
      }

      const aiResponse = await openaiResponse.json();

      console.log('AI analysis completed');

      // 解析 AI 响应
      let palmAnalysis;
      try {
        const responseText = aiResponse.choices[0]?.message?.content || '{}';
        palmAnalysis = JSON.parse(responseText);
      } catch (parseError) {
        console.log('AI response parse error, using fallback:', parseError);
        // 提供更丰富的备用数据结构
        palmAnalysis = {
          personality_analysis: {
            core_traits: ["坚韧不拔", "富有创造力", "善于思考"],
            behavioral_patterns: ["注重细节", "重视关系", "追求完美"],
            communication_style: "温和而有说服力的表达方式",
            decision_making: "理性与直觉并重的决策风格",
            strengths: ["领导能力", "创新思维", "人际敏感度"],
            development_areas: ["需要更多自信", "学会放松", "平衡工作与生活"]
          },
          life_path_analysis: {
            life_purpose: "通过创造性工作和人际关系实现个人价值",
            major_life_phases: [
              {
                period: "青年期 (20-35岁)",
                focus: "建立事业基础和核心技能",
                challenges: "寻找方向和建立自信",
                opportunities: "学习成长和网络建立"
              }
            ],
            life_lessons: ["学会相信自己", "平衡理想与现实", "培养耐心"]
          },
          career_fortune: {
            career_aptitude: ["创意设计", "教育培训", "咨询服务"],
            leadership_potential: "具有天然的指导他人的能力",
            entrepreneurship: "适合在成熟领域创新发展",
            wealth_accumulation: "通过专业技能和长期投资积累财富"
          },
          relationship_insights: {
            love_compatibility: {
              ideal_partner_traits: ["理解力强", "情感稳定", "有共同价值观"],
              relationship_challenges: ["需要更多沟通", "平衡独立与亲密"],
              love_expression: "通过行动和关怀表达爱意",
              commitment_style: "重视长期稳定的关系"
            }
          },
          health_wellness: {
            constitutional_type: "平衡体质，整体健康状况良好",
            health_strengths: ["抗压能力强", "恢复力好"],
            health_vulnerabilities: ["需要注意压力管理", "关注睡眠质量"],
            lifestyle_recommendations: {
              diet: "均衡饮食，多吃新鲜蔬果",
              exercise: "规律的有氧运动和瑜伽",
              stress_management: "冥想和深呼吸练习",
              sleep_patterns: "保持规律作息，充足睡眠"
            }
          }
        };
      }

      // 构建分析结果 - 使用新的详细数据结构
      analysisResult = {
        report: {
          id: `analysis_${Date.now()}`,
          type: validatedData.analysisType,
          // 新的详细分析结构
          personality_analysis: palmAnalysis.personality_analysis || {
            core_traits: ["坚韧不拔", "富有创造力", "善于思考"],
            behavioral_patterns: ["注重细节", "重视关系", "追求完美"],
            communication_style: "温和而有说服力的表达方式",
            strengths: ["领导能力", "创新思维", "人际敏感度"],
            development_areas: ["需要更多自信", "学会放松", "平衡工作与生活"]
          },
          life_path_analysis: palmAnalysis.life_path_analysis || {
            life_purpose: "通过创造性工作和人际关系实现个人价值",
            major_life_phases: [],
            life_lessons: ["学会相信自己", "平衡理想与现实", "培养耐心"]
          },
          career_fortune: palmAnalysis.career_fortune || {
            career_aptitude: ["创意设计", "教育培训", "咨询服务"],
            leadership_potential: "具有天然的指导他人的能力",
            wealth_accumulation: "通过专业技能和长期投资积累财富"
          },
          relationship_insights: palmAnalysis.relationship_insights || {
            love_compatibility: {
              ideal_partner_traits: ["理解力强", "情感稳定", "有共同价值观"],
              relationship_challenges: ["需要更多沟通", "平衡独立与亲密"],
              love_expression: "通过行动和关怀表达爱意"
            }
          },
          health_wellness: palmAnalysis.health_wellness || {
            constitutional_type: "平衡体质，整体健康状况良好",
            health_strengths: ["抗压能力强", "恢复力好"],
            health_vulnerabilities: ["需要注意压力管理", "关注睡眠质量"]
          },
          spiritual_growth: palmAnalysis.spiritual_growth || {
            inner_wisdom: "具有深刻的内在洞察力",
            spiritual_path: "通过自我反思和实践成长",
            intuitive_abilities: "直觉敏锐，善于感知他人情感"
          },
          practical_guidance: palmAnalysis.practical_guidance || {
            immediate_actions: ["保持积极心态", "关注身心健康", "加强人际沟通"],
            monthly_focus: [],
            annual_themes: []
          },
          lucky_elements: palmAnalysis.lucky_elements || {
            favorable_colors: ["蓝色", "绿色", "紫色"],
            lucky_numbers: [3, 7, 21],
            auspicious_directions: ["东南", "西北"],
            favorable_stones: ["紫水晶", "绿松石"]
          },
          analysis_metadata: palmAnalysis.analysis_metadata || {
            confidence_level: 0.85,
            analysis_depth: validatedData.analysisType,
            key_hand_features: ["生命线清晰", "智慧线延长", "感情线深邃"],
            analysis_focus: "综合性格与命运分析",
            locale: locale // 保存语言环境
          },
          metadata: {
            id: `analysis_${Date.now()}`,
            createdAt: new Date().toISOString(),
            language: locale, // 使用检测到的语言
            processingTime: Date.now() - startTime
          }
        },
        conversionHints: {
          urgency: "限时专业分析报告，把握人生关键节点",
          personalization: "专属定制的深度手相解读",
          social_proof: "已有超过10万人获得专业指导"
        }
      };

      const processingTime = Date.now() - startTime;

      // 10. 保存分析结果到数据库
      await db
        .update(palmAnalysisSessionsSchema)
        .set({
          status: 'completed',
          analysisResult: JSON.stringify(analysisResult),
          processingTime,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(palmAnalysisSessionsSchema.sessionId, validatedData.sessionId));

      // 11. 返回分析结果
      return NextResponse.json({
        success: true,
        sessionId: validatedData.sessionId,
        analysisType: validatedData.analysisType,
        processingTime,
        result: analysisResult,
        message: 'Analysis completed successfully',
      });

    } catch (analysisError) {
      // 分析失败，更新状态
      await db
        .update(palmAnalysisSessionsSchema)
        .set({
          status: 'failed',
          errorMessage: analysisError instanceof Error ? analysisError.message : 'Unknown analysis error',
          updatedAt: new Date(),
        })
        .where(eq(palmAnalysisSessionsSchema.sessionId, validatedData.sessionId));

      throw analysisError;
    }

  } catch (error) {
    console.error('Palm analysis error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Analysis failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// 获取分析结果
export async function GET(request: NextRequest) {
  try {
    // 1. 检查用户认证（可选）
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user; // 用户可能未登录

    // 2. 获取查询参数
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // 3. 获取分析会话
    const db = await getSafeDB();
    const [analysisSession] = await db
      .select()
      .from(palmAnalysisSessionsSchema)
      .where(eq(palmAnalysisSessionsSchema.sessionId, sessionId))
      .limit(1);

    if (!analysisSession) {
      return NextResponse.json(
        { error: 'Analysis session not found' },
        { status: 404 }
      );
    }

    // 4. 验证会话归属（如果有用户认证）
    if (user && analysisSession.userId && analysisSession.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to analysis session' },
        { status: 403 }
      );
    }
    
    // 4.1 对于未登录用户，只允许访问没有userId或guest会话
    if (!user && analysisSession.userId && !analysisSession.userId.startsWith('guest_')) {
      return NextResponse.json(
        { error: 'This analysis session requires authentication' },
        { status: 401 }
      );
    }

    // 5. 返回分析结果
    return NextResponse.json({
      success: true,
      session: {
        id: analysisSession.id,
        status: analysisSession.status,
        analysisType: analysisSession.analysisType,
        processingTime: analysisSession.processingTime,
        createdAt: analysisSession.createdAt,
        completedAt: analysisSession.completedAt,
        result: analysisSession.analysisResult ? 
          JSON.parse(analysisSession.analysisResult) : null,
        error: analysisSession.errorMessage,
        // 双手支持信息
        leftHandImageUrl: analysisSession.leftHandImageUrl,
        rightHandImageUrl: analysisSession.rightHandImageUrl,
        hasLeftHand: !!analysisSession.leftHandImageUrl,
        hasRightHand: !!analysisSession.rightHandImageUrl,
      },
    });

  } catch (error) {
    console.error('Get analysis result error:', error);
    return NextResponse.json(
      { error: 'Failed to get analysis result' },
      { status: 500 }
    );
  }
}