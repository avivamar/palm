/**
 * 生成模拟的MediaPipe 21个关键点数据
 * 用于测试和演示
 */

export function generateMockMediaPipeLandmarks() {
  // MediaPipe返回的是归一化坐标 (0-1之间)
  // 这些坐标是基于标准手掌位置的比例
  return [
    // 0: WRIST (手腕中心)
    { x: 0.5, y: 0.85, z: 0 },
    
    // 1-4: THUMB (拇指 - 从根部到指尖)
    { x: 0.35, y: 0.75, z: -0.05 },  // CMC (腕掌关节)
    { x: 0.30, y: 0.65, z: -0.08 },  // MCP (掌指关节)
    { x: 0.28, y: 0.55, z: -0.10 },  // IP (指间关节)
    { x: 0.27, y: 0.48, z: -0.12 },  // TIP (指尖)
    
    // 5-8: INDEX FINGER (食指)
    { x: 0.40, y: 0.60, z: 0 },      // MCP
    { x: 0.38, y: 0.48, z: -0.02 },  // PIP
    { x: 0.37, y: 0.40, z: -0.03 },  // DIP
    { x: 0.36, y: 0.33, z: -0.05 },  // TIP
    
    // 9-12: MIDDLE FINGER (中指)
    { x: 0.48, y: 0.58, z: 0 },      // MCP
    { x: 0.48, y: 0.45, z: -0.02 },  // PIP
    { x: 0.48, y: 0.36, z: -0.03 },  // DIP
    { x: 0.48, y: 0.28, z: -0.05 },  // TIP
    
    // 13-16: RING FINGER (无名指)
    { x: 0.56, y: 0.59, z: 0 },      // MCP
    { x: 0.57, y: 0.47, z: -0.02 },  // PIP
    { x: 0.58, y: 0.39, z: -0.03 },  // DIP
    { x: 0.59, y: 0.32, z: -0.05 },  // TIP
    
    // 17-20: PINKY (小指)
    { x: 0.65, y: 0.62, z: 0 },      // MCP
    { x: 0.67, y: 0.52, z: -0.02 },  // PIP
    { x: 0.68, y: 0.45, z: -0.03 },  // DIP
    { x: 0.69, y: 0.39, z: -0.05 },  // TIP
  ]
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