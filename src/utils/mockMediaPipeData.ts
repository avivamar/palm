/**
 * 生成模拟的MediaPipe 21个关键点数据
 * 用于测试和演示
 */

// 基于 image copy 5.png 的真实MediaPipe识别结果
// 这些坐标是从实际标注图片中提取的
// 图片显示了一只左手，手掌朝上，手指向上伸展
export function getRealMediaPipeLandmarks() {
  // 这些坐标是根据 image copy 5.png 中的绿色标注点估算的
  // 归一化坐标 (0-1)
  return [
    // 0: WRIST (手腕) - 图片底部中心
    { x: 0.45, y: 0.92, z: 0 },
    
    // 1-4: THUMB (拇指) - 左侧
    { x: 0.28, y: 0.82, z: -0.03 },  // CMC
    { x: 0.20, y: 0.70, z: -0.06 },  // MCP
    { x: 0.15, y: 0.58, z: -0.08 },  // IP
    { x: 0.12, y: 0.48, z: -0.10 },  // TIP
    
    // 5-8: INDEX FINGER (食指) - 左二
    { x: 0.32, y: 0.65, z: 0 },      // MCP
    { x: 0.28, y: 0.48, z: -0.02 },  // PIP
    { x: 0.26, y: 0.35, z: -0.04 },  // DIP
    { x: 0.24, y: 0.25, z: -0.06 },  // TIP
    
    // 9-12: MIDDLE FINGER (中指) - 中间
    { x: 0.42, y: 0.62, z: 0 },      // MCP
    { x: 0.40, y: 0.43, z: -0.02 },  // PIP
    { x: 0.39, y: 0.28, z: -0.04 },  // DIP
    { x: 0.38, y: 0.16, z: -0.06 },  // TIP
    
    // 13-16: RING FINGER (无名指) - 右二
    { x: 0.52, y: 0.63, z: 0 },      // MCP
    { x: 0.52, y: 0.45, z: -0.02 },  // PIP
    { x: 0.52, y: 0.31, z: -0.04 },  // DIP
    { x: 0.52, y: 0.20, z: -0.06 },  // TIP
    
    // 17-20: PINKY (小指) - 右侧
    { x: 0.62, y: 0.67, z: 0 },      // MCP
    { x: 0.64, y: 0.52, z: -0.02 },  // PIP
    { x: 0.66, y: 0.40, z: -0.04 },  // DIP
    { x: 0.68, y: 0.30, z: -0.06 },  // TIP
  ]
}

// 保留原来的模拟数据函数作为备用
export function generateMockMediaPipeLandmarks() {
  // 默认返回真实的MediaPipe数据
  return getRealMediaPipeLandmarks();
}

/**
 * MediaPipe手部连接关系
 */
export const HAND_CONNECTIONS = [
  // 拇指
  [0, 1], [1, 2], [2, 3], [3, 4],
  // 食指
  [0, 5], [5, 6], [6, 7], [7, 8],
  // 中指
  [5, 9], [9, 10], [10, 11], [11, 12],
  // 无名指
  [9, 13], [13, 14], [14, 15], [15, 16],
  // 小指
  [13, 17], [17, 18], [18, 19], [19, 20],
  // 手掌连接
  [0, 17], [5, 9], [9, 13], [13, 17]
]

/**
 * MediaPipe关键点名称
 */
export const LANDMARK_NAMES = [
  'WRIST',
  'THUMB_CMC', 'THUMB_MCP', 'THUMB_IP', 'THUMB_TIP',
  'INDEX_MCP', 'INDEX_PIP', 'INDEX_DIP', 'INDEX_TIP',
  'MIDDLE_MCP', 'MIDDLE_PIP', 'MIDDLE_DIP', 'MIDDLE_TIP',
  'RING_MCP', 'RING_PIP', 'RING_DIP', 'RING_TIP',
  'PINKY_MCP', 'PINKY_PIP', 'PINKY_DIP', 'PINKY_TIP'
]