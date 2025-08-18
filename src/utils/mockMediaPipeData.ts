/**
 * 生成模拟的MediaPipe 21个关键点数据
 * 用于测试和演示
 */

// 基于实际MediaPipe识别结果精确映射
// 根据用户提供的截图，精确对应21个关键点的位置
// 坐标系：归一化 (0-1)，原点在左上角
export function getRealMediaPipeLandmarks() {
  // 根据截图中的实际标注点精确定位
  // 这是一个右手手掌朝向相机的标准姿势
  return [
    // 0: WRIST (手腕) - 底部中心
    { x: 0.50, y: 0.85, z: 0, visibility: 0.99 },
    
    // 1-4: THUMB (拇指) - 右侧（从手掌角度看）
    { x: 0.65, y: 0.72, z: -0.02, visibility: 0.98 },  // CMC - 腕掌关节
    { x: 0.72, y: 0.60, z: -0.04, visibility: 0.97 },  // MCP - 掌指关节
    { x: 0.76, y: 0.48, z: -0.06, visibility: 0.96 },  // IP - 指间关节
    { x: 0.78, y: 0.38, z: -0.08, visibility: 0.95 },  // TIP - 指尖
    
    // 5-8: INDEX FINGER (食指) - 从右数第二个
    { x: 0.58, y: 0.55, z: 0, visibility: 0.99 },      // MCP - 掌指关节
    { x: 0.60, y: 0.40, z: -0.02, visibility: 0.99 },  // PIP - 近端指间关节
    { x: 0.61, y: 0.28, z: -0.04, visibility: 0.98 },  // DIP - 远端指间关节
    { x: 0.62, y: 0.18, z: -0.06, visibility: 0.97 },  // TIP - 指尖
    
    // 9-12: MIDDLE FINGER (中指) - 中间
    { x: 0.48, y: 0.52, z: 0, visibility: 0.99 },      // MCP - 掌指关节
    { x: 0.48, y: 0.36, z: -0.02, visibility: 0.99 },  // PIP - 近端指间关节
    { x: 0.48, y: 0.24, z: -0.04, visibility: 0.98 },  // DIP - 远端指间关节
    { x: 0.48, y: 0.14, z: -0.06, visibility: 0.97 },  // TIP - 指尖
    
    // 13-16: RING FINGER (无名指) - 从左数第二个
    { x: 0.38, y: 0.53, z: 0, visibility: 0.99 },      // MCP - 掌指关节
    { x: 0.36, y: 0.38, z: -0.02, visibility: 0.98 },  // PIP - 近端指间关节
    { x: 0.35, y: 0.26, z: -0.04, visibility: 0.97 },  // DIP - 远端指间关节
    { x: 0.34, y: 0.16, z: -0.06, visibility: 0.96 },  // TIP - 指尖
    
    // 17-20: PINKY (小指) - 左侧
    { x: 0.28, y: 0.56, z: 0, visibility: 0.98 },      // MCP - 掌指关节
    { x: 0.24, y: 0.42, z: -0.02, visibility: 0.97 },  // PIP - 近端指间关节
    { x: 0.22, y: 0.32, z: -0.04, visibility: 0.96 },  // DIP - 远端指间关节
    { x: 0.20, y: 0.22, z: -0.06, visibility: 0.95 },  // TIP - 指尖
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
 * MediaPipe关键点名称和解剖学位置对照
 */
export const LANDMARK_NAMES = [
  'WRIST',           // 0: 手腕
  'THUMB_CMC',       // 1: 拇指腕掌关节
  'THUMB_MCP',       // 2: 拇指掌指关节
  'THUMB_IP',        // 3: 拇指指间关节
  'THUMB_TIP',       // 4: 拇指尖
  'INDEX_MCP',       // 5: 食指掌指关节
  'INDEX_PIP',       // 6: 食指近端指间关节
  'INDEX_DIP',       // 7: 食指远端指间关节
  'INDEX_TIP',       // 8: 食指尖
  'MIDDLE_MCP',      // 9: 中指掌指关节
  'MIDDLE_PIP',      // 10: 中指近端指间关节
  'MIDDLE_DIP',      // 11: 中指远端指间关节
  'MIDDLE_TIP',      // 12: 中指尖
  'RING_MCP',        // 13: 无名指掌指关节
  'RING_PIP',        // 14: 无名指近端指间关节
  'RING_DIP',        // 15: 无名指远端指间关节
  'RING_TIP',        // 16: 无名指尖
  'PINKY_MCP',       // 17: 小指掌指关节
  'PINKY_PIP',       // 18: 小指近端指间关节
  'PINKY_DIP',       // 19: 小指远端指间关节
  'PINKY_TIP'        // 20: 小指尖
]

/**
 * MediaPipe关键点中文名称映射
 */
export const LANDMARK_NAMES_CN = {
  0: '手腕',
  1: '拇指腕掌关节',
  2: '拇指掌指关节',
  3: '拇指指间关节',
  4: '拇指尖',
  5: '食指掌指关节',
  6: '食指近端指间关节',
  7: '食指远端指间关节',
  8: '食指尖',
  9: '中指掌指关节',
  10: '中指近端指间关节',
  11: '中指远端指间关节',
  12: '中指尖',
  13: '无名指掌指关节',
  14: '无名指近端指间关节',
  15: '无名指远端指间关节',
  16: '无名指尖',
  17: '小指掌指关节',
  18: '小指近端指间关节',
  19: '小指远端指间关节',
  20: '小指尖'
}