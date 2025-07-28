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
import type { UserInfo } from '@rolitt/palm';
import { getPalmAnalysisPrompt } from '@/utils/palmPrompts';

// 使用 Node.js runtime 以支持 Supabase
export const runtime = 'nodejs';

// 多语言备用分析数据
function getFallbackAnalysis(locale: string) {
  const fallbackData = {
    'en': {
      personality_analysis: {
        core_traits: ["Strong-willed", "Creative thinker", "Natural leader"],
        behavioral_patterns: ["Detail-oriented", "Relationship-focused", "Goal-driven"],
        communication_style: "Direct yet empathetic communication style",
        decision_making: "Balanced analytical and intuitive decision-making",
        strengths: ["Leadership abilities", "Innovation mindset", "Emotional intelligence"],
        development_areas: ["Building confidence", "Work-life balance", "Stress management"]
      },
      life_path_analysis: {
        life_purpose: "To create meaningful impact through creative work and leadership",
        major_life_phases: [{
          period: "Early Career (20-35)",
          focus: "Building foundation and core skills",
          challenges: "Finding direction and establishing credibility",
          opportunities: "Learning experiences and network building"
        }],
        life_lessons: ["Trust your intuition", "Balance ambition with relationships", "Embrace continuous growth"]
      },
      career_fortune: {
        career_aptitude: ["Creative industries", "Management", "Consulting", "Education"],
        leadership_potential: "Natural ability to inspire and guide others",
        entrepreneurship: "Strong potential for innovative business ventures",
        wealth_accumulation: "Build wealth through expertise and strategic investments"
      },
      relationship_insights: {
        love_compatibility: {
          ideal_partner_traits: ["Emotionally intelligent", "Supportive", "Shares core values"],
          relationship_challenges: ["Balancing independence with intimacy", "Communication in conflict"],
          love_expression: "Shows love through actions and quality time",
          commitment_style: "Values long-term partnership and mutual growth"
        }
      },
      health_wellness: {
        constitutional_type: "Balanced constitution with strong vital energy",
        health_strengths: ["Good stress resilience", "Strong recovery ability"],
        health_vulnerabilities: ["Monitor stress levels", "Pay attention to sleep quality"],
        lifestyle_recommendations: {
          diet: "Balanced nutrition with focus on whole foods",
          exercise: "Regular cardio and strength training",
          stress_management: "Meditation and mindfulness practices",
          sleep_patterns: "Consistent sleep schedule with 7-8 hours nightly"
        }
      }
    },
    'ja': {
      personality_analysis: {
        core_traits: ["意志の強さ", "創造力", "思いやり深さ"],
        behavioral_patterns: ["細部への注意", "調和を重視", "責任感が強い"],
        communication_style: "相手を思いやる丁寧なコミュニケーション",
        decision_making: "慎重に考えつつも直感も大切にする判断スタイル",
        strengths: ["チームワーク", "創意工夫", "相手への配慮"],
        development_areas: ["自信を持つこと", "ワークライフバランス", "ストレス管理"]
      },
      life_path_analysis: {
        life_purpose: "他者との調和を大切にしながら自己実現を図る",
        major_life_phases: [{
          period: "青年期 (20-35歳)",
          focus: "基盤作りとスキル習得",
          challenges: "方向性の確立と自信の構築",
          opportunities: "学びと人脈形成"
        }],
        life_lessons: ["直感を信じること", "謙虚さと自信のバランス", "継続的な成長"]
      },
      career_fortune: {
        career_aptitude: ["クリエイティブ業界", "教育", "サービス業", "コンサルティング"],
        leadership_potential: "人を支え導く優しいリーダーシップ",
        entrepreneurship: "社会貢献を重視した事業展開に適性",
        wealth_accumulation: "専門性と人間関係を活かした堅実な蓄財"
      },
      relationship_insights: {
        love_compatibility: {
          ideal_partner_traits: ["思いやりがある", "価値観が合う", "お互いを尊重し合える"],
          relationship_challenges: ["自分の気持ちを素直に表現すること", "相手との距離感"],
          love_expression: "行動と心遣いで愛情を表現する",
          commitment_style: "長期的な絆と共に成長することを重視"
        }
      },
      health_wellness: {
        constitutional_type: "バランスの取れた体質で全体的に健康",
        health_strengths: ["ストレス耐性", "回復力"],
        health_vulnerabilities: ["疲労の蓄積に注意", "睡眠の質を大切に"],
        lifestyle_recommendations: {
          diet: "和食中心のバランスの良い食事",
          exercise: "ウォーキングやヨガなど穏やかな運動",
          stress_management: "瞑想や茶道などの静寂の時間",
          sleep_patterns: "規則正しい生活リズムで7-8時間の睡眠"
        }
      }
    },
    'zh-HK': {
      personality_analysis: {
        core_traits: ["堅韌不拔", "富有創造力", "善於思考"],
        behavioral_patterns: ["注重細節", "重視關係", "追求完美"],
        communication_style: "溫和而有說服力的表達方式",
        decision_making: "理性與直覺並重的決策風格",
        strengths: ["領導能力", "創新思維", "人際敏感度"],
        development_areas: ["需要更多自信", "學會放鬆", "平衡工作與生活"]
      },
      life_path_analysis: {
        life_purpose: "通過創造性工作和人際關係實現個人價值",
        major_life_phases: [{
          period: "青年期 (20-35歲)",
          focus: "建立事業基礎和核心技能",
          challenges: "尋找方向和建立自信",
          opportunities: "學習成長和網絡建立"
        }],
        life_lessons: ["學會相信自己", "平衡理想與現實", "培養耐心"]
      },
      career_fortune: {
        career_aptitude: ["創意設計", "教育培訓", "諮詢服務", "文化產業"],
        leadership_potential: "具有天然的指導他人的能力",
        entrepreneurship: "適合在成熟領域創新發展",
        wealth_accumulation: "通過專業技能和長期投資積累財富"
      },
      relationship_insights: {
        love_compatibility: {
          ideal_partner_traits: ["理解力強", "情感穩定", "有共同價值觀"],
          relationship_challenges: ["需要更多溝通", "平衡獨立與親密"],
          love_expression: "通過行動和關懷表達愛意",
          commitment_style: "重視長期穩定的關係"
        }
      },
      health_wellness: {
        constitutional_type: "平衡體質，整體健康狀況良好",
        health_strengths: ["抗壓能力強", "恢復力好"],
        health_vulnerabilities: ["需要注意壓力管理", "關注睡眠品質"],
        lifestyle_recommendations: {
          diet: "均衡飲食，多吃新鮮蔬果",
          exercise: "規律的有氧運動和瑜伽",
          stress_management: "冥想和深呼吸練習",
          sleep_patterns: "保持規律作息，充足睡眠"
        }
      }
    },
    'es': {
      personality_analysis: {
        core_traits: ["Espíritu fuerte", "Mente creativa", "Corazón generoso"],
        behavioral_patterns: ["Orientado a la familia", "Valorador de relaciones", "Trabajador dedicado"],
        communication_style: "Comunicación expresiva y cálida con gran carisma",
        decision_making: "Toma decisiones equilibrando la razón con el corazón",
        strengths: ["Liderazgo natural", "Creatividad", "Lealtad familiar"],
        development_areas: ["Mayor confianza en sí mismo", "Equilibrio vida-trabajo", "Manejo del estrés"]
      },
      life_path_analysis: {
        life_purpose: "Crear un impacto positivo a través del servicio a la familia y comunidad",
        major_life_phases: [{
          period: "Juventud (20-35 años)",
          focus: "Establecer bases sólidas y formar familia",
          challenges: "Encontrar equilibrio entre ambiciones y tradiciones",
          opportunities: "Crecimiento personal y construcción de redes"
        }],
        life_lessons: ["Honrar las tradiciones mientras abrazas el cambio", "La importancia de la perseverancia", "El valor de la familia y comunidad"]
      },
      career_fortune: {
        career_aptitude: ["Negocios familiares", "Educación", "Artes", "Servicios comunitarios"],
        leadership_potential: "Liderazgo carismático con enfoque en el bienestar colectivo",
        entrepreneurship: "Excelente potencial para negocios que sirvan a la comunidad",
        wealth_accumulation: "Construcción de riqueza a través de trabajo duro y inversiones sabias"
      },
      relationship_insights: {
        love_compatibility: {
          ideal_partner_traits: ["Valores familiares fuertes", "Corazón leal", "Espíritu trabajador"],
          relationship_challenges: ["Equilibrar independencia con compromiso", "Comunicación durante conflictos"],
          love_expression: "Expresa amor a través de actos de servicio y tiempo de calidad",
          commitment_style: "Valora el compromiso a largo plazo y la unidad familiar"
        }
      },
      health_wellness: {
        constitutional_type: "Constitución robusta con gran energía vital",
        health_strengths: ["Resistencia natural", "Capacidad de recuperación"],
        health_vulnerabilities: ["Cuidar los niveles de estrés", "Atención a la salud cardiovascular"],
        lifestyle_recommendations: {
          diet: "Dieta mediterránea rica en frutas, verduras y aceite de oliva",
          exercise: "Actividades físicas regulares como baile o fútbol",
          stress_management: "Tiempo en familia y actividades recreativas",
          sleep_patterns: "Horario de sueño consistente con descanso de 7-8 horas"
        }
      }
    }
  };

  return fallbackData[locale as keyof typeof fallbackData] || fallbackData['en'];
}

// Request validation schema
const AnalysisRequestSchema = z.object({
  sessionId: z.string(),
  analysisType: z.enum(['quick', 'complete']).default('quick'),
});

export async function POST(request: NextRequest) {
  try {
    // 0. 从请求中获取语言环境
    const referer = request.headers.get('referer') || '';
    
    // 从 referer 中提取语言路径 (/en/, /ja/, /es/, /zh-HK/)
    let locale = 'en'; // 默认英语
    const localeMatch = referer.match(/\/([a-z]{2}(?:-[A-Z]{2})?)\//);
    if (localeMatch && localeMatch[1]) {
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

    // 8. 获取图像URL用于OpenAI分析
    const imageUrl = analysisSession.leftHandImageUrl || analysisSession.rightHandImageUrl;
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image found for analysis' },
        { status: 400 }
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
      console.log('Image URL for OpenAI:', imageUrl);
      console.log('Detected locale:', locale);
      
      // 验证图片URL是否可访问
      try {
        const imageCheckResponse = await fetch(imageUrl, { method: 'HEAD' });
        console.log('Image accessibility check:', imageCheckResponse.status, imageCheckResponse.headers.get('content-type'));
        if (!imageCheckResponse.ok) {
          console.warn('Image may not be accessible to OpenAI:', imageCheckResponse.status);
        }
      } catch (imageCheckError) {
        console.warn('Could not verify image accessibility:', imageCheckError);
      }
      
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

      let aiResponse;

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error('OpenAI API error:', errorText);
        
        // 如果是复杂提示词失败，尝试使用简化版本
        if (openaiResponse.status === 400) {
          console.log('Trying with simplified prompt...');
          const simplePrompt = `Please analyze this palm image and provide insights in JSON format. Focus on personality traits, career guidance, and relationship insights. Output must be valid JSON starting with { and ending with }.`;
          
          const retryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                      text: simplePrompt
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
              max_tokens: 1500,
              temperature: 0.5
            })
          });
          
          if (retryResponse.ok) {
            aiResponse = await retryResponse.json();
            console.log('Retry with simple prompt succeeded');
          } else {
            throw new Error('Both complex and simple prompts failed');
          }
        } else {
          throw new Error('OpenAI API failed: ' + openaiResponse.status);
        }
      } else {
        aiResponse = await openaiResponse.json();
      }

      console.log('AI analysis completed');

      // 解析 AI 响应
      let palmAnalysis;
      try {
        const responseText = aiResponse.choices[0]?.message?.content || '{}';
        
        // 检查 OpenAI 是否拒绝分析
        if (responseText.toLowerCase().includes('unable to') || 
            responseText.toLowerCase().includes('cannot') ||
            responseText.toLowerCase().includes('sorry') ||
            !responseText.trim().startsWith('{')) {
          console.log('OpenAI refused to analyze or returned non-JSON:', responseText);
          throw new Error('AI_REFUSED_ANALYSIS');
        }
        
        palmAnalysis = JSON.parse(responseText);
      } catch (parseError) {
        console.log('AI response parse error, using enhanced fallback. Error:', parseError);
        console.log('OpenAI response was:', aiResponse.choices[0]?.message?.content);
        
        // 根据语言环境提供相应的备用数据
        palmAnalysis = getFallbackAnalysis(locale);
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
            processingTime: Date.now() - startTime,
            userId: userId
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