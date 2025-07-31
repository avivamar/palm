#!/usr/bin/env tsx

/**
 * Supabase 数据库备份脚本
 * 使用 Supabase API 和数据导出功能
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// 加载环境变量
config({ path: '.env.local' });

// 配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
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

async function createSupabaseBackup() {
  try {
    log('info', '=== Supabase 数据库备份开始 ===');
    
    // 验证环境变量
    if (!SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required');
    }
    
    if (!SUPABASE_SERVICE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required');
    }
    
    log('info', `Supabase URL: ${SUPABASE_URL}`);
    log('info', `Using key: ${SUPABASE_SERVICE_KEY.substring(0, 20)}...`);
    
    // 创建备份目录
    if (!existsSync(BACKUP_DIR)) {
      mkdirSync(BACKUP_DIR, { recursive: true });
      log('info', `创建备份目录: ${BACKUP_DIR}`);
    }
    
    // 创建 Supabase 客户端（使用服务密钥）
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData: any = {
      timestamp,
      metadata: {
        supabase_url: SUPABASE_URL,
        backup_type: 'data_export'
      },
      tables: {}
    };
    
    // 定义需要备份的表
    const tables = [
      'users',
      'preorders', 
      'palm_analysis_sessions',
      'user_images',
      'webhook_logs'
    ];
    
    log('info', `开始备份 ${tables.length} 个表...`);
    
    // 备份每个表的数据
    for (const tableName of tables) {
      try {
        log('info', `备份表: ${tableName}`);
        
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' });
        
        if (error) {
          log('error', `备份表 ${tableName} 失败: ${error.message}`);
          continue;
        }
        
        backupData.tables[tableName] = {
          data: data || [],
          count: count || 0,
          backed_up_at: new Date().toISOString()
        };
        
        log('info', `表 ${tableName}: ${count} 条记录已备份`);
      } catch (tableError) {
        log('error', `备份表 ${tableName} 时出错: ${tableError}`);
      }
    }
    
    // 保存备份文件
    const backupFileName = `supabase_backup_${timestamp}.json`;
    const backupFilePath = join(BACKUP_DIR, backupFileName);
    
    writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
    log('info', `备份文件已保存: ${backupFileName}`);
    
    // 创建备份元数据
    const metadataFile = join(BACKUP_DIR, `${backupFileName}.meta`);
    const metadata = {
      filename: backupFileName,
      timestamp,
      tables_count: tables.length,
      total_records: Object.values(backupData.tables).reduce((sum: number, table: any) => sum + table.count, 0),
      file_size: require('fs').statSync(backupFilePath).size
    };
    
    writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
    
    log('info', '=== Supabase 数据库备份完成 ===');
    log('info', `总计备份 ${metadata.total_records} 条记录`);
    log('info', `备份文件大小: ${(metadata.file_size / 1024 / 1024).toFixed(2)} MB`);
    
    return {
      success: true,
      filename: backupFileName,
      metadata
    };
    
  } catch (error) {
    log('error', `备份过程中发生错误: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 如果直接运行脚本
if (require.main === module) {
  createSupabaseBackup()
    .then(result => {
      if (result.success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch(error => {
      log('error', `脚本执行失败: ${error}`);
      process.exit(1);
    });
}

export { createSupabaseBackup };