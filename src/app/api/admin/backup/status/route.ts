/**
 * 备份状态监控API
 * 提供备份文件状态和健康检查
 */

import { NextResponse } from 'next/server';
import { readdirSync, statSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';

export async function GET() {
  try {
    // 检查备份目录是否存在
    if (!existsSync(BACKUP_DIR)) {
      return NextResponse.json({
        status: 'error',
        message: 'Backup directory does not exist',
        directory: BACKUP_DIR
      }, { status: 404 });
    }

    // 获取备份文件列表
    const files = readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.json') && file.startsWith('supabase_backup_'))
      .sort()
      .reverse(); // 最新的在前面

    const backupInfo = files.map(file => {
      const filePath = join(BACKUP_DIR, file);
      const stats = statSync(filePath);
      const metaFilePath = join(BACKUP_DIR, `${file}.meta`);
      
      let metadata = null;
      if (existsSync(metaFilePath)) {
        try {
          metadata = JSON.parse(readFileSync(metaFilePath, 'utf8'));
        } catch (e) {
          // 忽略元数据读取错误
        }
      }

      return {
        filename: file,
        size: stats.size,
        sizeFormatted: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        metadata
      };
    });

    // 计算统计信息
    const totalSize = backupInfo.reduce((sum, backup) => sum + backup.size, 0);
    const latestBackup = backupInfo[0];
    const oldestBackup = backupInfo[backupInfo.length - 1];

    // 检查备份健康状态
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const hasRecentBackup = latestBackup && new Date(latestBackup.createdAt) > oneDayAgo;

    const healthStatus = {
      status: hasRecentBackup ? 'healthy' : 'warning',
      message: hasRecentBackup ? 
        'Recent backup available' : 
        'No backup within the last 24 hours',
      checks: {
        hasBackups: backupInfo.length > 0,
        recentBackup: hasRecentBackup,
        backupCount: backupInfo.length,
        totalSizeWithinLimit: totalSize < 1024 * 1024 * 1024 // 1GB limit
      }
    };

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      directory: BACKUP_DIR,
      health: healthStatus,
      summary: {
        totalBackups: backupInfo.length,
        totalSize,
        totalSizeFormatted: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
        latestBackup: latestBackup ? {
          filename: latestBackup.filename,
          date: latestBackup.createdAt,
          size: latestBackup.sizeFormatted
        } : null,
        oldestBackup: oldestBackup ? {
          filename: oldestBackup.filename,
          date: oldestBackup.createdAt,
          size: oldestBackup.sizeFormatted
        } : null
      },
      backups: backupInfo
    });

  } catch (error) {
    console.error('Backup status check error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check backup status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 清理旧备份
export async function DELETE() {
  try {
    const retentionDays = 7; // 保留7天
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    if (!existsSync(BACKUP_DIR)) {
      return NextResponse.json({
        status: 'error',
        message: 'Backup directory does not exist'
      }, { status: 404 });
    }

    const files = readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.json') && file.startsWith('supabase_backup_'));

    let deletedCount = 0;
    const deletedFiles: string[] = [];

    for (const file of files) {
      const filePath = join(BACKUP_DIR, file);
      const stats = statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        try {
          require('fs').unlinkSync(filePath);
          
          // 同时删除对应的元数据文件
          const metaFile = join(BACKUP_DIR, `${file}.meta`);
          if (existsSync(metaFile)) {
            require('fs').unlinkSync(metaFile);
          }
          
          deletedCount++;
          deletedFiles.push(file);
        } catch (deleteError) {
          console.error(`Failed to delete backup file ${file}:`, deleteError);
        }
      }
    }

    return NextResponse.json({
      status: 'success',
      message: `Cleaned up ${deletedCount} old backup files`,
      deletedFiles,
      retentionDays
    });

  } catch (error) {
    console.error('Backup cleanup error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to cleanup backups',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}