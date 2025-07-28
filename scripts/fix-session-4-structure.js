const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { eq } = require('drizzle-orm');

// Database schema
const { pgTable, serial, varchar, timestamp, text, integer } = require('drizzle-orm/pg-core');

const palmAnalysisSessionsSchema = pgTable('palm_analysis_sessions', {
  id: serial('id').primaryKey(),
  analysisResult: text('analysis_result'),
});

async function fixSession4Structure() {
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable not set');
    }

    console.log('Connecting to database...');
    const sql = postgres(connectionString, { max: 1 });
    const db = drizzle(sql, { logger: false });
    
    // Get current session 4 data
    const [currentSession] = await db
      .select()
      .from(palmAnalysisSessionsSchema)
      .where(eq(palmAnalysisSessionsSchema.id, 4));
      
    if (!currentSession || !currentSession.analysisResult) {
      console.log('Session 4 not found or has no analysis result');
      return;
    }
    
    const oldResult = JSON.parse(currentSession.analysisResult);
    console.log('Current structure keys:', Object.keys(oldResult));
    
    // Transform to new structure
    const newResult = {
      report: {
        id: oldResult.report?.id || `analysis_${Date.now()}`,
        type: oldResult.report?.type || 'quick',
        imageAnalysis: oldResult.report?.imageAnalysis || {},
        // Transform to match component expectations
        personality: {
          summary: oldResult.report?.personality?.summary || "个性特征分析完成",
          traits: oldResult.report?.personality?.strengths || ["独特个性", "丰富内在"],
          strengths: oldResult.report?.personality?.strengths || ["坚韧不拔", "富有创造力"], 
          challenges: oldResult.report?.personality?.areas_for_growth || ["需要更多自信", "学会放松"]
        },
        health: {
          summary: oldResult.report?.health?.general || "整体健康状况良好",
          vitality: 85,
          areas: ["心血管健康", "消化系统"],
          recommendations: oldResult.report?.health?.suggestions || ["保持运动", "均衡饮食"]
        },
        career: {
          summary: oldResult.report?.career?.traits || "职业发展潜力巨大", 
          aptitudes: ["领导能力", "创新思维"],
          opportunities: oldResult.report?.career?.opportunities || ["管理职位", "创业机会"],
          challenges: oldResult.report?.career?.challenges || ["需要耐心", "持续学习"]
        },
        relationship: {
          summary: oldResult.report?.relationships?.style || "情感丰富，重视关系",
          compatibility: ["理解型伴侣", "共同成长"],
          communication: ["直接表达", "倾听理解"], 
          challenges: oldResult.report?.relationships?.advice || ["学会妥协", "保持独立"]
        },
        fortune: {
          summary: oldResult.report?.futureOutlook?.next_year || "财运稳步上升",
          financial: ["稳定收入", "投资机会"],
          opportunities: ["事业发展", "人际网络"],
          timing: ["春季有利", "秋季收获"]
        },
        metadata: {
          id: oldResult.report?.id || `analysis_${Date.now()}`,
          createdAt: oldResult.report?.generatedAt || new Date().toISOString(),
          language: 'zh',
          processingTime: 18450 // From our previous test
        },
        confidence: oldResult.report?.confidence || 0.85
      },
      conversionHints: oldResult.conversionHints || {
        urgency: "限时分析报告，把握当下机遇",
        personalization: "专属于您的个性化手相解读", 
        social_proof: "已有超过10万人获得专业分析"
      }
    };
    
    console.log('Updating session 4 with new structure...');
    
    await db
      .update(palmAnalysisSessionsSchema)
      .set({ analysisResult: JSON.stringify(newResult) })
      .where(eq(palmAnalysisSessionsSchema.id, 4));
    
    console.log('✅ Session 4 structure updated successfully');
    
    await sql.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error updating session structure:', error);
    process.exit(1);
  }
}

fixSession4Structure();