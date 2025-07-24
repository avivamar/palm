/**
 * 🚀 转化优先 - 简化异步任务处理
 * 不依赖Redis，使用内存队列和setImmediate的超简化版本
 * 确保支付流程绝对不被阻塞
 */

type AsyncTaskType = 'marketing_event' | 'user_creation' | 'data_sync';

type AsyncTask = {
  id: string;
  type: AsyncTaskType;
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
};

// 内存中的任务队列
const taskQueue: AsyncTask[] = [];
let isProcessing = false;

/**
 * 🚀 添加异步任务，立即返回，绝不阻塞
 */
export async function scheduleAsyncTask(
  type: AsyncTaskType,
  data: any,
  options: { maxRetries?: number } = {},
): Promise<void> {
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const task: AsyncTask = {
    id: taskId,
    type,
    data,
    timestamp: Date.now(),
    retries: 0,
    maxRetries: options.maxRetries || 2,
  };

  taskQueue.push(task);

  console.log(`[SimpleAsync] 📝 Task ${taskId} queued (${type})`);

  // 异步触发处理，但不等待
  setImmediate(() => {
    processTaskQueue().catch(console.error);
  });
}

/**
 * 🔄 处理任务队列
 */
async function processTaskQueue(): Promise<void> {
  if (isProcessing || taskQueue.length === 0) {
    return;
  }

  isProcessing = true;

  try {
    // 每次最多处理5个任务，避免过载
    const tasksToProcess = taskQueue.splice(0, 5);

    await Promise.allSettled(
      tasksToProcess.map(task => processTask(task)),
    );
  } catch (error) {
    console.error('[SimpleAsync] ❌ Error processing task queue:', error);
  } finally {
    isProcessing = false;

    // 如果还有任务，继续处理
    if (taskQueue.length > 0) {
      setImmediate(() => {
        processTaskQueue().catch(console.error);
      });
    }
  }
}

/**
 * 处理单个任务
 */
async function processTask(task: AsyncTask): Promise<void> {
  try {
    console.log(`[SimpleAsync] 🚀 Processing task ${task.id} (${task.type})`);

    switch (task.type) {
      case 'marketing_event':
        await processMarketingEvent(task.data);
        break;
      case 'user_creation':
        await processUserCreation(task.data);
        break;
      case 'data_sync':
        await processDataSync(task.data);
        break;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }

    console.log(`[SimpleAsync] ✅ Task ${task.id} completed`);
  } catch (error) {
    console.error(`[SimpleAsync] ❌ Task ${task.id} failed:`, error);

    // 重试逻辑
    if (task.retries < task.maxRetries) {
      task.retries++;
      console.log(`[SimpleAsync] 🔄 Retrying task ${task.id} (${task.retries}/${task.maxRetries})`);

      // 延迟重试
      setTimeout(() => {
        taskQueue.push(task);
        setImmediate(() => {
          processTaskQueue().catch(console.error);
        });
      }, 1000 * 2 ** task.retries); // 指数退避
    } else {
      console.error(`[SimpleAsync] 💀 Task ${task.id} failed permanently`);
    }
  }
}

/**
 * 处理营销事件任务
 */
async function processMarketingEvent(data: any): Promise<void> {
  const { preorderId, email, color, locale, priceId } = data;

  try {
    // 导入营销处理函数
    const { processPreorderMarketingAsync } = await import('../app/actions/preorderActions');
    await processPreorderMarketingAsync(preorderId, { email, color, locale, priceId: priceId || 'unknown' });
  } catch (error) {
    console.error('[SimpleAsync] ❌ Marketing event failed:', error);
    throw error;
  }
}

/**
 * 处理用户创建任务
 */
async function processUserCreation(data: any): Promise<void> {
  console.log('[SimpleAsync] 👤 User creation task:', data);
  // 实现用户创建逻辑
}

/**
 * 处理数据同步任务
 */
async function processDataSync(data: any): Promise<void> {
  console.log('[SimpleAsync] 🔄 Data sync task:', data);
  // 实现数据同步逻辑
}

/**
 * 获取队列状态
 */
export function getQueueStats() {
  return {
    queueLength: taskQueue.length,
    isProcessing,
    timestamp: Date.now(),
  };
}
