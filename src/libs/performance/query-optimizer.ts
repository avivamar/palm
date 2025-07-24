import { sql } from 'drizzle-orm';
import { getSafeDB } from '@/libs/DB';

// 查询性能指标接口
export type QueryPerformance = {
  query: string;
  executionTime: number;
  rowsAffected: number;
  planCost?: number;
  indexUsage?: string[];
  suggestions?: string[];
  timestamp: Date;
};

// 查询分析结果接口
export type QueryAnalysis = {
  query: string;
  executionPlan: any;
  performance: QueryPerformance;
  optimizationSuggestions: OptimizationSuggestion[];
  indexRecommendations: IndexRecommendation[];
};

// 优化建议接口
export type OptimizationSuggestion = {
  type: 'index' | 'query_rewrite' | 'schema_change' | 'configuration';
  priority: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  implementation: string;
};

// 索引建议接口
export type IndexRecommendation = {
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist';
  reason: string;
  estimatedImprovement: string;
  createStatement: string;
};

// 查询统计接口
export type QueryStats = {
  totalQueries: number;
  averageExecutionTime: number;
  slowQueries: QueryPerformance[];
  mostFrequentQueries: { query: string; count: number; avgTime: number }[];
  indexUsageStats: { [index: string]: number };
};

/**
 * 数据库查询优化器
 */
export class QueryOptimizer {
  private queryHistory: QueryPerformance[] = [];
  private maxHistorySize = 1000;
  private slowQueryThreshold = 1000; // 1秒

  /**
   * 分析查询性能
   */
  async analyzeQuery(query: string): Promise<QueryAnalysis> {
    try {
      // 获取查询执行计划
      const executionPlan = await this.getExecutionPlan(query);

      // 执行查询并测量性能
      const result = await this.executeWithTiming(query);

      const performance: QueryPerformance = {
        query,
        executionTime: result.executionTime,
        rowsAffected: result.rowsAffected,
        planCost: executionPlan.cost,
        indexUsage: this.extractIndexUsage(executionPlan),
        timestamp: new Date(),
      };

      // 记录到历史
      this.addToHistory(performance);

      // 生成优化建议
      const optimizationSuggestions = this.generateOptimizationSuggestions(executionPlan, performance);
      const indexRecommendations = this.generateIndexRecommendations(executionPlan, query);

      return {
        query,
        executionPlan,
        performance,
        optimizationSuggestions,
        indexRecommendations,
      };
    } catch (error) {
      throw new Error(`Query analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 获取查询执行计划
   */
  private async getExecutionPlan(query: string): Promise<any> {
    try {
      const db = await getSafeDB();
      const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
      const result = await db.execute(sql.raw(explainQuery));
      return result.rows[0]?.['QUERY PLAN']?.[0] || {};
    } catch (error) {
      console.warn('Failed to get execution plan:', error);
      return {};
    }
  }

  /**
   * 执行查询并测量时间
   */
  private async executeWithTiming(query: string): Promise<{
    executionTime: number;
    rowsAffected: number;
    result: any;
  }> {
    const startTime = Date.now();

    try {
      const db = await getSafeDB();
      const result = await db.execute(sql.raw(query));
      const executionTime = Date.now() - startTime;

      return {
        executionTime,
        rowsAffected: result.rowCount || 0,
        result,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      throw new Error(`Query execution failed after ${executionTime}ms: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 从执行计划中提取索引使用信息
   */
  private extractIndexUsage(plan: any): string[] {
    const indexes: string[] = [];

    const extractFromNode = (node: any) => {
      if (node['Index Name']) {
        indexes.push(node['Index Name']);
      }
      if (node['Index Scan']) {
        indexes.push(node['Index Scan']);
      }
      if (node.Plans) {
        node.Plans.forEach(extractFromNode);
      }
    };

    if (plan.Plan) {
      extractFromNode(plan.Plan);
    }

    return [...new Set(indexes)];
  }

  /**
   * 生成优化建议
   */
  private generateOptimizationSuggestions(
    plan: any,
    performance: QueryPerformance,
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 慢查询建议
    if (performance.executionTime > this.slowQueryThreshold) {
      suggestions.push({
        type: 'query_rewrite',
        priority: 'high',
        description: 'Query execution time exceeds threshold',
        impact: `Query takes ${performance.executionTime}ms, consider optimization`,
        implementation: 'Review query structure, add appropriate indexes, or consider query rewriting',
      });
    }

    // 全表扫描建议
    if (this.hasSequentialScan(plan)) {
      suggestions.push({
        type: 'index',
        priority: 'high',
        description: 'Sequential scan detected',
        impact: 'Full table scan can be slow for large tables',
        implementation: 'Add appropriate indexes on frequently queried columns',
      });
    }

    // 排序操作建议
    if (this.hasExpensiveSort(plan)) {
      suggestions.push({
        type: 'index',
        priority: 'medium',
        description: 'Expensive sort operation detected',
        impact: 'Sort operations can be optimized with proper indexing',
        implementation: 'Create indexes on columns used in ORDER BY clauses',
      });
    }

    // 连接操作建议
    if (this.hasInefficiientJoin(plan)) {
      suggestions.push({
        type: 'query_rewrite',
        priority: 'medium',
        description: 'Inefficient join operation detected',
        impact: 'Join operations can be optimized',
        implementation: 'Ensure proper indexes on join columns and consider join order',
      });
    }

    return suggestions;
  }

  /**
   * 生成索引建议
   */
  private generateIndexRecommendations(
    _plan: any,
    query: string,
  ): IndexRecommendation[] {
    const recommendations: IndexRecommendation[] = [];

    // 分析查询中的WHERE条件
    const whereColumns = this.extractWhereColumns(query);
    whereColumns.forEach(({ table, column }) => {
      recommendations.push({
        table,
        columns: [column],
        type: 'btree',
        reason: `Column '${column}' is used in WHERE clause`,
        estimatedImprovement: 'Significant improvement for equality and range queries',
        createStatement: `CREATE INDEX idx_${table}_${column} ON ${table} (${column});`,
      });
    });

    // 分析ORDER BY子句
    const orderByColumns = this.extractOrderByColumns(query);
    if (orderByColumns.length > 0 && orderByColumns[0]) {
      const table = orderByColumns[0].table;
      const columns = orderByColumns.map(col => col.column);
      recommendations.push({
        table,
        columns,
        type: 'btree',
        reason: 'Columns used in ORDER BY clause',
        estimatedImprovement: 'Eliminates sort operation',
        createStatement: `CREATE INDEX idx_${table}_${columns.join('_')} ON ${table} (${columns.join(', ')});`,
      });
    }

    // 分析JOIN条件
    const joinColumns = this.extractJoinColumns(query);
    joinColumns.forEach(({ table, column }) => {
      recommendations.push({
        table,
        columns: [column],
        type: 'btree',
        reason: `Column '${column}' is used in JOIN condition`,
        estimatedImprovement: 'Improves join performance significantly',
        createStatement: `CREATE INDEX idx_${table}_${column} ON ${table} (${column});`,
      });
    });

    return recommendations;
  }

  /**
   * 检查是否有顺序扫描
   */
  private hasSequentialScan(plan: any): boolean {
    const checkNode = (node: any): boolean => {
      if (node['Node Type'] === 'Seq Scan') {
        return true;
      }
      if (node.Plans) {
        return node.Plans.some(checkNode);
      }
      return false;
    };

    return plan.Plan ? checkNode(plan.Plan) : false;
  }

  /**
   * 检查是否有昂贵的排序操作
   */
  private hasExpensiveSort(plan: any): boolean {
    const checkNode = (node: any): boolean => {
      if (node['Node Type'] === 'Sort' && node['Total Cost'] > 1000) {
        return true;
      }
      if (node.Plans) {
        return node.Plans.some(checkNode);
      }
      return false;
    };

    return plan.Plan ? checkNode(plan.Plan) : false;
  }

  /**
   * 检查是否有低效的连接操作
   */
  private hasInefficiientJoin(plan: any): boolean {
    const checkNode = (node: any): boolean => {
      if (node['Node Type']?.includes('Nested Loop') && node['Total Cost'] > 10000) {
        return true;
      }
      if (node.Plans) {
        return node.Plans.some(checkNode);
      }
      return false;
    };

    return plan.Plan ? checkNode(plan.Plan) : false;
  }

  /**
   * 提取WHERE子句中的列
   */
  private extractWhereColumns(query: string): { table: string; column: string }[] {
    const columns: { table: string; column: string }[] = [];

    // 简单的正则表达式匹配（实际应用中可能需要更复杂的SQL解析）
    const whereMatch = query.match(/WHERE\s+(.+?)(?:ORDER BY|GROUP BY|HAVING|LIMIT|$)/i);
    if (whereMatch && whereMatch[1]) {
      const whereClause = whereMatch[1];
      const columnMatches = whereClause.match(/(\w+)\.(\w+)\s*[=<>!]/g);

      if (columnMatches) {
        columnMatches.forEach((match) => {
          const [, table, column] = match.match(/(\w+)\.(\w+)/) || [];
          if (table && column) {
            columns.push({ table, column });
          }
        });
      }
    }

    return columns;
  }

  /**
   * 提取ORDER BY子句中的列
   */
  private extractOrderByColumns(query: string): { table: string; column: string }[] {
    const columns: { table: string; column: string }[] = [];

    const orderByMatch = query.match(/ORDER BY\s+(.+?)(?:LIMIT|$)/i);
    if (orderByMatch && orderByMatch[1]) {
      const orderByClause = orderByMatch[1];
      const columnMatches = orderByClause.match(/(\w+)\.(\w+)/g);

      if (columnMatches) {
        columnMatches.forEach((match) => {
          const [, table, column] = match.match(/(\w+)\.(\w+)/) || [];
          if (table && column) {
            columns.push({ table, column });
          }
        });
      }
    }

    return columns;
  }

  /**
   * 提取JOIN条件中的列
   */
  private extractJoinColumns(query: string): { table: string; column: string }[] {
    const columns: { table: string; column: string }[] = [];

    const joinMatches = query.match(/JOIN\s+\w+\s+ON\s+(.+?)(?:WHERE|ORDER BY|GROUP BY|$)/gi);
    if (joinMatches) {
      joinMatches.forEach((joinMatch) => {
        const onClause = joinMatch.replace(/JOIN\s+\w+\s+ON\s+/i, '');
        const columnMatches = onClause.match(/(\w+)\.(\w+)/g);

        if (columnMatches) {
          columnMatches.forEach((match) => {
            const [, table, column] = match.match(/(\w+)\.(\w+)/) || [];
            if (table && column) {
              columns.push({ table, column });
            }
          });
        }
      });
    }

    return columns;
  }

  /**
   * 添加到查询历史
   */
  private addToHistory(performance: QueryPerformance): void {
    this.queryHistory.push(performance);

    // 保持历史记录大小限制
    if (this.queryHistory.length > this.maxHistorySize) {
      this.queryHistory.shift();
    }
  }

  /**
   * 获取查询统计信息
   */
  getQueryStats(): QueryStats {
    const totalQueries = this.queryHistory.length;
    const averageExecutionTime = totalQueries > 0
      ? this.queryHistory.reduce((sum, q) => sum + q.executionTime, 0) / totalQueries
      : 0;

    const slowQueries = this.queryHistory
      .filter(q => q.executionTime > this.slowQueryThreshold)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    // 统计最频繁的查询
    const queryFrequency = new Map<string, { count: number; totalTime: number }>();
    this.queryHistory.forEach((q) => {
      const normalized = this.normalizeQuery(q.query);
      const existing = queryFrequency.get(normalized) || { count: 0, totalTime: 0 };
      queryFrequency.set(normalized, {
        count: existing.count + 1,
        totalTime: existing.totalTime + q.executionTime,
      });
    });

    const mostFrequentQueries = Array.from(queryFrequency.entries())
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        avgTime: stats.totalTime / stats.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 统计索引使用情况
    const indexUsageStats: { [index: string]: number } = {};
    this.queryHistory.forEach((q) => {
      q.indexUsage?.forEach((index) => {
        indexUsageStats[index] = (indexUsageStats[index] || 0) + 1;
      });
    });

    return {
      totalQueries,
      averageExecutionTime,
      slowQueries,
      mostFrequentQueries,
      indexUsageStats,
    };
  }

  /**
   * 标准化查询（移除参数值）
   */
  private normalizeQuery(query: string): string {
    return query
      .replace(/\$\d+/g, '?') // 替换参数占位符
      .replace(/\s+/g, ' ') // 标准化空白字符
      .trim()
      .toLowerCase();
  }

  /**
   * 清除查询历史
   */
  clearHistory(): void {
    this.queryHistory = [];
  }

  /**
   * 设置慢查询阈值
   */
  setSlowQueryThreshold(threshold: number): void {
    this.slowQueryThreshold = threshold;
  }

  /**
   * 导出查询历史
   */
  exportHistory(): QueryPerformance[] {
    return [...this.queryHistory];
  }
}

// 全局查询优化器实例
export const globalQueryOptimizer = new QueryOptimizer();

/**
 * 查询性能监控装饰器
 */
export function monitorQuery(_target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now();

    try {
      const result = await method.apply(this, args);
      const executionTime = Date.now() - startTime;

      // 记录查询性能
      if (executionTime > 100) { // 只记录超过100ms的查询
        console.log(`Query ${propertyName} executed in ${executionTime}ms`);
      }

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`Query ${propertyName} failed after ${executionTime}ms:`, error);
      throw error;
    }
  };

  return descriptor;
}

/**
 * 便捷的查询分析函数
 */
export const queryAnalyzer = {
  analyze: (query: string, _params?: any[]) => globalQueryOptimizer.analyzeQuery(query),
  stats: () => globalQueryOptimizer.getQueryStats(),
  clearHistory: () => globalQueryOptimizer.clearHistory(),
  setThreshold: (threshold: number) => globalQueryOptimizer.setSlowQueryThreshold(threshold),
};
