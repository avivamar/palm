import { ReportGenerator } from './report-generator';
import { getConfig } from '../config';

// 简单测试 ReportGenerator 类的实例化
try {
  const config = getConfig();
  const reportGenerator = new ReportGenerator(config);
  console.log('✅ ReportGenerator 实例化成功');
  console.log('✅ 健康状态:', reportGenerator.getHealthStatus());
} catch (error) {
  console.error('❌ ReportGenerator 实例化失败:', error);
}