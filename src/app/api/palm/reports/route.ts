/**
 * Palm AI 报告 API
 * 处理报告生成、下载和分享
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/libs/supabase/config';
import { getSafeDB } from '@/libs/DB';
import { palmAnalysisSessionsSchema } from '@/models/Schema';
import { eq } from 'drizzle-orm';

// Add runtime declaration for Node.js compatibility
export const runtime = 'nodejs';

// Request validation schema
const ReportRequestSchema = z.object({
  sessionId: z.string(),
  format: z.enum(['json', 'pdf', 'html']).default('json'),
  language: z.enum(['en', 'zh', 'ja', 'es']).default('en'),
  includeImages: z.boolean().default(false),
});

// 生成报告
export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户认证
    const supabase = await createServerClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = session.user;

    // 2. 解析请求数据
    const body = await request.json();
    const validatedData = ReportRequestSchema.parse(body);

    // 3. 获取分析会话
    const db = await getSafeDB();
    const [analysisSession] = await db
      .select()
      .from(palmAnalysisSessionsSchema)
      .where(eq(palmAnalysisSessionsSchema.id, parseInt(validatedData.sessionId)))
      .limit(1);

    if (!analysisSession) {
      return NextResponse.json(
        { error: 'Analysis session not found' },
        { status: 404 }
      );
    }

    // 4. 验证会话归属
    if (analysisSession.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to analysis session' },
        { status: 403 }
      );
    }

    // 5. 检查分析状态
    if (analysisSession.status !== 'completed') {
      return NextResponse.json(
        { error: 'Analysis not completed yet' },
        { status: 400 }
      );
    }

    // 6. 解析分析结果
    let analysisResult = null;
    if (analysisSession.analysisResult) {
      try {
        analysisResult = JSON.parse(analysisSession.analysisResult);
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Invalid analysis result data' },
          { status: 500 }
        );
      }
    }

    if (!analysisResult) {
      return NextResponse.json(
        { error: 'No analysis result available' },
        { status: 404 }
      );
    }

    // 7. 根据格式生成报告
    switch (validatedData.format) {
      case 'json':
        return generateJSONReport(analysisResult, validatedData);
      
      case 'pdf':
        return await generatePDFReport(analysisResult, validatedData, analysisSession);
      
      case 'html':
        return generateHTMLReport(analysisResult, validatedData, analysisSession);
      
      default:
        return NextResponse.json(
          { error: 'Unsupported format' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Generate report error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// 获取报告列表
export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户认证
    const supabase = await createServerClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = session.user;

    // 2. 获取查询参数
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || 'completed';

    // 3. 查询用户的分析报告
    const db = await getSafeDB();
    const reports = await db
      .select({
        id: palmAnalysisSessionsSchema.id,
        status: palmAnalysisSessionsSchema.status,
        analysisType: palmAnalysisSessionsSchema.analysisType,
        processingTime: palmAnalysisSessionsSchema.processingTime,
        createdAt: palmAnalysisSessionsSchema.createdAt,
        completedAt: palmAnalysisSessionsSchema.completedAt,
        hasResult: palmAnalysisSessionsSchema.analysisResult,
      })
      .from(palmAnalysisSessionsSchema)
      .where(eq(palmAnalysisSessionsSchema.userId, user.id))
      .limit(limit)
      .offset(offset);

    // 4. 过滤和格式化结果
    const filteredReports = reports
      .filter((report: any) => status === 'all' || report.status === status)
      .map((report: any) => ({
        ...report,
        hasResult: !!report.hasResult,
        downloadable: report.status === 'completed' && !!report.hasResult,
      }));

    return NextResponse.json({
      success: true,
      reports: filteredReports,
      pagination: {
        limit,
        offset,
        total: filteredReports.length,
        hasMore: filteredReports.length === limit,
      },
    });

  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Failed to get reports' },
      { status: 500 }
    );
  }
}

// 辅助函数：生成 JSON 报告
function generateJSONReport(analysisResult: any, config: any) {
  const report = {
    version: '1.0',
    format: 'json',
    language: config.language,
    generatedAt: new Date().toISOString(),
    data: analysisResult,
  };

  return NextResponse.json({
    success: true,
    report,
    downloadUrl: null, // JSON 直接返回，不生成下载链接
  });
}

// 辅助函数：生成 PDF 报告
async function generatePDFReport(
  analysisResult: any, 
  config: any, 
  session: any
): Promise<NextResponse> {
  try {
    const { generatePalmPDFReport } = await import('@/libs/pdf-generator');
    
    // 准备报告数据
    const reportData = {
      title: '手相分析报告',
      subtitle: `${config.language.toUpperCase()} 分析 - ${new Date().toLocaleDateString()}`,
      session: {
        id: session.id,
        type: session.analysisType === 'quick' ? '快速分析' : '完整分析',
        handType: session.handType === 'left' ? '左手' : '右手',
        createdAt: new Date(session.createdAt).toLocaleDateString(),
      },
      content: analysisResult.report || analysisResult,
      language: config.language,
      metadata: {
        generatedAt: new Date(),
        version: '1.0.0',
        userId: session.userId,
      }
    };

    // 生成 PDF
    const pdfBuffer = await generatePalmPDFReport(reportData);
    
    // 上传到 Vercel Blob 或返回直接下载
    const fileName = `palm-report-${session.id}-${Date.now()}.pdf`;
    
    // 直接返回 PDF 文件
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 辅助函数：生成 HTML 报告
function generateHTMLReport(
  analysisResult: any, 
  config: any, 
  session: any
): NextResponse {
  try {
    const htmlContent = generateHTMLContent(analysisResult, config, session);
    
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="palm-report-${session.id}.html"`,
      },
    });

  } catch (error) {
    console.error('HTML generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate HTML report' },
      { status: 500 }
    );
  }
}

// 生成 HTML 内容
function generateHTMLContent(analysisResult: any, config: any, session: any): string {
  const report = analysisResult.report || analysisResult;
  
  return `
    <!DOCTYPE html>
    <html lang="${config.language}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Palm Reading Report - ${session.id}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                color: #333;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #4F46E5;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .section {
                margin-bottom: 30px;
                padding: 20px;
                border-radius: 8px;
                background-color: #f8fafc;
            }
            .section h2 {
                color: #4F46E5;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 10px;
            }
            .metadata {
                background-color: #f1f5f9;
                padding: 15px;
                border-radius: 6px;
                font-size: 0.9em;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 0.9em;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🖐️ Palm Reading Report</h1>
            <div class="metadata">
                <p><strong>Session ID:</strong> ${session.id}</p>
                <p><strong>Analysis Type:</strong> ${session.analysisType}</p>
                <p><strong>Hand Type:</strong> ${session.handType}</p>
                <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            </div>
        </div>

        ${report.personality ? `
        <div class="section">
            <h2>🧠 Personality Analysis</h2>
            <p><strong>Summary:</strong> ${report.personality.summary}</p>
            <h3>Traits:</h3>
            <ul>
                ${report.personality.traits?.map((trait: string) => `<li>${trait}</li>`).join('') || '<li>No traits data</li>'}
            </ul>
            <h3>Strengths:</h3>
            <ul>
                ${report.personality.strengths?.map((strength: string) => `<li>${strength}</li>`).join('') || '<li>No strengths data</li>'}
            </ul>
        </div>
        ` : ''}

        ${report.health ? `
        <div class="section">
            <h2>💚 Health Analysis</h2>
            <p><strong>Summary:</strong> ${report.health.summary}</p>
            <p><strong>Vitality Score:</strong> ${report.health.vitality || 'N/A'}/100</p>
            <h3>Areas of Focus:</h3>
            <ul>
                ${report.health.areas?.map((area: string) => `<li>${area}</li>`).join('') || '<li>No health areas data</li>'}
            </ul>
        </div>
        ` : ''}

        ${report.career ? `
        <div class="section">
            <h2>💼 Career Insights</h2>
            <p><strong>Summary:</strong> ${report.career.summary}</p>
            <h3>Aptitudes:</h3>
            <ul>
                ${report.career.aptitudes?.map((apt: string) => `<li>${apt}</li>`).join('') || '<li>No aptitudes data</li>'}
            </ul>
        </div>
        ` : ''}

        ${report.relationship ? `
        <div class="section">
            <h2>❤️ Relationship Analysis</h2>
            <p><strong>Summary:</strong> ${report.relationship.summary}</p>
            <h3>Compatibility:</h3>
            <ul>
                ${report.relationship.compatibility?.map((comp: string) => `<li>${comp}</li>`).join('') || '<li>No compatibility data</li>'}
            </ul>
        </div>
        ` : ''}

        ${report.fortune ? `
        <div class="section">
            <h2>🍀 Fortune Analysis</h2>
            <p><strong>Summary:</strong> ${report.fortune.summary}</p>
            <h3>Financial Outlook:</h3>
            <ul>
                ${report.fortune.financial?.map((fin: string) => `<li>${fin}</li>`).join('') || '<li>No financial data</li>'}
            </ul>
        </div>
        ` : ''}

        <div class="footer">
            <p>Generated by Palm AI - Powered by/* Thepalmistrylife</p>
            <p>This report is for entertainment purposes only.</p>
        </div>
    </body>
    </html>
  `;
}