#!/usr/bin/env tsx

/**
 * Supabase 数据库恢复脚本
 * 从JSON备份文件恢复数据到Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';

// 配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
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

async function listBackups() {
  if (!existsSync(BACKUP_DIR)) {
    log('error', '备份目录不存在');
    return [];
  }
  
  const files = readdirSync(BACKUP_DIR)
    .filter(file => file.endsWith('.json') && file.startsWith('supabase_backup_'))
    .sort()
    .reverse(); // 最新的在前面
  
  log('info', '可用的备份文件:');
  console.log('');
  
  files.forEach((file, index) => {
    const metaFile = join(BACKUP_DIR, `${file}.meta`);
    let metadata = null;
    
    if (existsSync(metaFile)) {
      try {
        metadata = JSON.parse(readFileSync(metaFile, 'utf8'));
      } catch (e) {
        // 忽略元数据读取错误
      }
    }
    
    const stats = require('fs').statSync(join(BACKUP_DIR, file));
    console.log(`${colors.blue}[${index + 1}]${colors.reset} ${file}`);
    console.log(`    时间: ${stats.mtime.toISOString()}`);
    console.log(`    大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    if (metadata) {
      console.log(`    记录数: ${metadata.total_records}`);
      console.log(`    表数量: ${metadata.tables_count}`);
    }
    console.log('');
  });
  
  return files;
}

async function selectBackup(): Promise<string | null> {
  const files = await listBackups();
  
  if (files.length === 0) {
    log('error', '没有找到备份文件');
    return null;
  }
  
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise<string | null>((resolve) => {
    rl.question('请选择要恢复的备份编号: ', (answer) => {
      rl.close();
      
      const selection = parseInt(answer.trim());
      if (selection >= 1 && selection <= files.length) {
        resolve(files[selection - 1] || null);
      } else {
        log('error', '无效的选择');
        resolve(null);
      }
    });
  });
}

async function confirmRestore(): Promise<boolean> {
  log('warning', '警告: 恢复数据库将覆盖当前所有数据!');
  console.log('');
  
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('是否确定要继续? (输入 "yes" 确认): ', (answer) => {
      rl.close();
      resolve(answer.trim() === 'yes');
    });
  });
}

async function performRestore(backupFile: string) {
  try {
    log('info', `开始恢复备份文件: ${backupFile}`);
    
    // 读取备份文件
    const backupPath = join(BACKUP_DIR, backupFile);
    const backupData = JSON.parse(readFileSync(backupPath, 'utf8'));
    
    // 创建 Supabase 客户端
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const results = {
      success: 0,
      failed: 0,
      details: [] as Array<{table: string, status: string, records?: number, error?: string}>
    };
    
    // 恢复每个表的数据
    for (const [tableName, tableData] of Object.entries(backupData.tables)) {
      try {
        log('info', `恢复表: ${tableName}`);
        
        const { data } = tableData as any;
        
        if (!data || data.length === 0) {
          log('warning', `表 ${tableName} 没有数据，跳过`);
          results.details.push({
            table: tableName,
            status: 'skipped',
            records: 0
          });
          continue;
        }
        
        // 删除现有数据（可选，根据需求调整）
        log('info', `清空表 ${tableName}...`);
        await supabase.from(tableName).delete().neq('id', 0);
        
        // 批量插入数据
        log('info', `插入 ${data.length} 条记录到 ${tableName}...`);
        
        // 分批插入以避免超时
        const batchSize = 100;
        let insertedCount = 0;
        
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          
          const { error } = await supabase
            .from(tableName)
            .insert(batch);
          
          if (error) {
            throw error;
          }
          
          insertedCount += batch.length;
          log('info', `${tableName}: ${insertedCount}/${data.length} 已插入`);
        }
        
        results.success++;
        results.details.push({
          table: tableName,
          status: 'success',
          records: insertedCount
        });
        
        log('info', `表 ${tableName} 恢复成功: ${insertedCount} 条记录`);
        
      } catch (tableError) {
        results.failed++;
        results.details.push({
          table: tableName,
          status: 'failed',
          error: tableError instanceof Error ? tableError.message : 'Unknown error'
        });
        
        log('error', `表 ${tableName} 恢复失败: ${tableError}`);
      }
    }
    
    // 输出恢复结果
    log('info', '=== 数据库恢复完成 ===');
    log('info', `成功恢复: ${results.success} 个表`);
    if (results.failed > 0) {
      log('warning', `恢复失败: ${results.failed} 个表`);
    }
    
    console.log('\\n详细结果:');
    results.details.forEach(detail => {
      const status = detail.status === 'success' ? 
        `${colors.green}✓${colors.reset}` : 
        detail.status === 'failed' ? 
        `${colors.red}✗${colors.reset}` : 
        `${colors.yellow}−${colors.reset}`;
      
      console.log(`${status} ${detail.table}: ${detail.records || 0} 条记录`);
      if (detail.error) {
        console.log(`    错误: ${detail.error}`);
      }
    });
    
    return results;
    
  } catch (error) {
    log('error', `恢复过程中发生错误: ${error}`);
    throw error;
  }
}

async function main() {
  try {
    log('info', '=== Supabase 数据库恢复工具 ===');
    
    // 选择备份文件
    const selectedFile = await selectBackup();
    if (!selectedFile) {
      return;
    }
    
    // 确认恢复
    const confirmed = await confirmRestore();
    if (!confirmed) {
      log('info', '恢复操作已取消');
      return;
    }
    
    // 执行恢复
    await performRestore(selectedFile);
    
  } catch (error) {
    log('error', `恢复工具执行失败: ${error}`);
    process.exit(1);
  }
}

// 如果直接运行脚本
if (require.main === module) {
  main();
}

export { performRestore, listBackups };