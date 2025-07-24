/**
 * 🚀 转化优先 Redis 队列系统
 * 专门为支付流程优化，确保核心转化操作极速响应
 */

import { Redis } from 'ioredis';

// Redis连接 - 支持Upstash和本地Redis
let redis: Redis | null = null;

function getRedisConnection(): Redis | null {
  if (redis) {
    return redis;
  }

  try {
    if (process.env.REDIS_URL) {
      // 支持Upstash Redis URL格式
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        connectTimeout: 2000,
        lazyConnect: true,
      });

      redis.on('error', (error) => {
        console.error('[RedisQueue] Connection error:', error);
        redis = null; // 重置连接以便重试
      });

      console.log('[RedisQueue] ✅ Redis connected successfully');
      return redis;
    }
  } catch (error) {
    console.error('[RedisQueue] ❌ Failed to connect to Redis:', error);
  }

  return null;
}

// 队列任务类型
type QueueTaskType = 'marketing_event' | 'user_creation' | 'data_sync' | 'email_notification';

type QueueTask = {
  id: string;
  type: QueueTaskType;
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
};

type QueueOptions = {
  delay?: number; // 延迟执行时间(毫秒)
  maxRetries?: number; // 最大重试次数
  priority?: 'high' | 'normal' | 'low'; // 优先级
};

/**
 * 🚀 将任务添加到Redis队列，完全非阻塞
 */
export async function scheduleAsyncTask(
  type: QueueTaskType,
  data: any,
  options: QueueOptions = {},
): Promise<boolean> {
  const redisClient = getRedisConnection();

  if (!redisClient) {
    console.warn('[RedisQueue] ⚠️ Redis not available, task will be skipped');
    return false;
  }

  try {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const task: QueueTask = {
      id: taskId,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: options.maxRetries || 3,
    };

    const queueName = getQueueName(type, options.priority);
    const delayMs = options.delay || 0;

    if (delayMs > 0) {
      // 延迟任务
      const executeAt = Date.now() + delayMs;
      await redisClient.zadd('delayed_tasks', executeAt, JSON.stringify(task));
    } else {
      // 立即执行任务
      await redisClient.lpush(queueName, JSON.stringify(task));
    }

    console.log(`[RedisQueue] 📝 Task ${taskId} queued (${type})`);
    return true;
  } catch (error) {
    console.error('[RedisQueue] ❌ Failed to queue task:', error);
    return false;
  }
}

/**
 * 🔄 处理队列中的任务（由后台worker调用）
 */
export async function processQueueTasks(): Promise<void> {
  const redisClient = getRedisConnection();
  if (!redisClient) {
    return;
  }

  // 处理延迟任务
  await processDelayedTasks(redisClient);

  // 处理各个优先级队列
  const queues = [
    'queue:high:marketing_event',
    'queue:high:user_creation',
    'queue:normal:marketing_event',
    'queue:normal:user_creation',
    'queue:normal:data_sync',
    'queue:low:email_notification',
  ];

  for (const queueName of queues) {
    await processQueue(redisClient, queueName);
  }
}

/**
 * 处理延迟任务
 */
async function processDelayedTasks(redisClient: Redis): Promise<void> {
  try {
    const now = Date.now();
    const tasks = await redisClient.zrangebyscore('delayed_tasks', 0, now, 'LIMIT', 0, 10);

    for (const taskData of tasks) {
      const task: QueueTask = JSON.parse(taskData);
      const queueName = getQueueName(task.type, 'normal');

      // 移到正常队列
      await redisClient.lpush(queueName, taskData);
      await redisClient.zrem('delayed_tasks', taskData);
    }
  } catch (error) {
    console.error('[RedisQueue] ❌ Error processing delayed tasks:', error);
  }
}

/**
 * 处理特定队列
 */
async function processQueue(redisClient: Redis, queueName: string): Promise<void> {
  try {
    const taskData = await redisClient.rpop(queueName);
    if (!taskData) {
      return;
    }

    const task: QueueTask = JSON.parse(taskData);

    try {
      await executeTask(task);
      console.log(`[RedisQueue] ✅ Task ${task.id} completed`);
    } catch (error) {
      console.error(`[RedisQueue] ❌ Task ${task.id} failed:`, error);

      // 重试逻辑
      if (task.retries < task.maxRetries) {
        task.retries++;
        const retryDelay = Math.min(1000 * 2 ** task.retries, 30000); // 指数退避，最大30秒
        const executeAt = Date.now() + retryDelay;
        await redisClient.zadd('delayed_tasks', executeAt, JSON.stringify(task));
        console.log(`[RedisQueue] 🔄 Task ${task.id} scheduled for retry ${task.retries}/${task.maxRetries}`);
      } else {
        console.error(`[RedisQueue] 💀 Task ${task.id} failed permanently after ${task.maxRetries} retries`);
      }
    }
  } catch (error) {
    console.error(`[RedisQueue] ❌ Error processing queue ${queueName}:`, error);
  }
}

/**
 * 执行具体任务
 */
async function executeTask(task: QueueTask): Promise<void> {
  switch (task.type) {
    case 'marketing_event':
      await executeMarketingEvent(task.data);
      break;
    case 'user_creation':
      await executeUserCreation(task.data);
      break;
    case 'data_sync':
      await executeDataSync(task.data);
      break;
    case 'email_notification':
      await executeEmailNotification(task.data);
      break;
    default:
      throw new Error(`Unknown task type: ${task.type}`);
  }
}

/**
 * 执行营销事件任务
 */
async function executeMarketingEvent(data: any): Promise<void> {
  const { preorderId, email, color, locale, priceId } = data;

  try {
    // 导入营销处理函数
    const { processPreorderMarketingAsync } = await import('../app/actions/preorderActions');
    await processPreorderMarketingAsync(preorderId, { email, color, locale, priceId: priceId || 'unknown' });
  } catch (error) {
    console.error('[RedisQueue] ❌ Marketing event execution failed:', error);
    throw error;
  }
}

/**
 * 执行用户创建任务
 */
async function executeUserCreation(data: any): Promise<void> {
  // 这里可以实现用户创建逻辑
  console.log('[RedisQueue] 👤 User creation task:', data);
}

/**
 * 执行数据同步任务
 */
async function executeDataSync(data: any): Promise<void> {
  // 这里可以实现数据同步逻辑
  console.log('[RedisQueue] 🔄 Data sync task:', data);
}

/**
 * 执行邮件通知任务
 */
async function executeEmailNotification(data: any): Promise<void> {
  // 这里可以实现邮件通知逻辑
  console.log('[RedisQueue] 📧 Email notification task:', data);
}

/**
 * 获取队列名称
 */
function getQueueName(type: QueueTaskType, priority: 'high' | 'normal' | 'low' = 'normal'): string {
  return `queue:${priority}:${type}`;
}

/**
 * 获取队列统计信息
 */
export async function getQueueStats(): Promise<any> {
  const redisClient = getRedisConnection();
  if (!redisClient) {
    return null;
  }

  try {
    const stats = {
      delayedTasks: await redisClient.zcard('delayed_tasks'),
      highPriorityMarketing: await redisClient.llen('queue:high:marketing_event'),
      normalPriorityMarketing: await redisClient.llen('queue:normal:marketing_event'),
      lowPriorityEmail: await redisClient.llen('queue:low:email_notification'),
    };

    return stats;
  } catch (error) {
    console.error('[RedisQueue] ❌ Error getting queue stats:', error);
    return null;
  }
}

/**
 * 清理所有队列（仅用于开发/测试）
 */
export async function clearAllQueues(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot clear queues in production');
  }

  const redisClient = getRedisConnection();
  if (!redisClient) {
    return;
  }

  const keys = await redisClient.keys('queue:*');
  if (keys.length > 0) {
    await redisClient.del(...keys);
  }
  await redisClient.del('delayed_tasks');

  console.log('[RedisQueue] 🧹 All queues cleared');
}
