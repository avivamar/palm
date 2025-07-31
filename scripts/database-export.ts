#!/usr/bin/env tsx

/**
 * 数据库数据导出脚本
 * 使用Drizzle ORM直接导出数据库表内容
 */

import { config } from 'dotenv';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getSafeDB } from '../src/libs/DB';
import { 
  usersSchema, 
  preordersSchema, 
  palmAnalysisSessionsSchema,
  userImagesSchema,
  webhookLogsSchema
} from '../src/models/Schema';

// 加载环境变量
config({ path: '.env.local' });

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(level: 'info' | 'error' | 'warning', message: string) {
  const color = {
    info: colors.green,
    error: colors.red,
    warning: colors.yellow
  }[level];
  
  console.log(`${color}[${level.toUpperCase()}]${colors.reset} ${message}`);
}

async function exportDatabaseData() {
  try {
    log('info', '=== 数据库数据导出开始 ===');
    
    // 创建备份目录
    if (!existsSync(BACKUP_DIR)) {
      mkdirSync(BACKUP_DIR, { recursive: true });
      log('info', `创建备份目录: ${BACKUP_DIR}`);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData: any = {
      timestamp,
      export_type: 'drizzle_orm_export',
      database_url: process.env.DATABASE_URL?.split('@')[0] + '@***', // 隐藏密码
      tables: {}
    };
    
    // 定义需要导出的表和对应的schema
    const tables = [
      { name: 'users', schema: usersSchema },
      { name: 'preorders', schema: preordersSchema },
      { name: 'palm_analysis_sessions', schema: palmAnalysisSessionsSchema },
      { name: 'user_images', schema: userImagesSchema },
      { name: 'webhook_logs', schema: webhookLogsSchema }
    ];
    
    log('info', `开始导出 ${tables.length} 个表...`);
    
    let totalRecords = 0;
    
    // 获取数据库连接
    const db = await getSafeDB();
    log('info', '数据库连接成功');
    
    // 导出每个表的数据
    for (const table of tables) {
      try {
        log('info', `导出表: ${table.name}`);
        
        const data = await db.select().from(table.schema);
        
        backupData.tables[table.name] = {
          data: data || [],
          count: data?.length || 0,
          exported_at: new Date().toISOString()
        };
        
        totalRecords += data?.length || 0;
        log('info', `表 ${table.name}: ${data?.length || 0} 条记录已导出`);
        
      } catch (tableError) {
        log('error', `导出表 ${table.name} 时出错: ${tableError}`);
        backupData.tables[table.name] = {
          data: [],
          count: 0,
          error: tableError instanceof Error ? tableError.message : 'Unknown error',
          exported_at: new Date().toISOString()
        };
      }
    }
    
    // 保存导出文件
    const exportFileName = `database_export_${timestamp}.json`;
    const exportFilePath = join(BACKUP_DIR, exportFileName);
    
    writeFileSync(exportFilePath, JSON.stringify(backupData, null, 2));
    log('info', `导出文件已保存: ${exportFileName}`);
    
    // 创建导出元数据
    const metadataFile = join(BACKUP_DIR, `${exportFileName}.meta`);
    const fileStats = require('fs').statSync(exportFilePath);
    const metadata = {
      filename: exportFileName,
      timestamp,
      export_type: 'drizzle_orm_export',
      tables_count: tables.length,
      total_records: totalRecords,
      file_size: fileStats.size,
      file_size_mb: (fileStats.size / 1024 / 1024).toFixed(2)
    };
    
    writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
    
    log('info', '=== 数据库数据导出完成 ===');
    log('info', `总计导出 ${totalRecords} 条记录`);
    log('info', `导出文件大小: ${metadata.file_size_mb} MB`);
    
    return {
      success: true,
      filename: exportFileName,
      totalRecords,
      metadata
    };
    
  } catch (error) {
    log('error', `导出过程中发生错误: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 如果直接运行脚本
if (require.main === module) {
  exportDatabaseData()
    .then(result => {
      if (result.success) {
        log('info', '数据导出成功完成');
        process.exit(0);
      } else {
        log('error', '数据导出失败');
        process.exit(1);
      }
    })
    .catch(error => {
      log('error', `脚本执行失败: ${error}`);
      process.exit(1);
    });
}

export { exportDatabaseData };