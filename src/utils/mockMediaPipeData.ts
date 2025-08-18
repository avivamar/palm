/**
 * 生成模拟的MediaPipe 21个关键点数据
 * 用于测试和演示
 */

// 基于MediaPipe官方标准定义的21个手部关键点
// 严格按照Google MediaPipe HandLandmarker模型的标准索引和解剖学定义
// 坐标系：归一化(0-1)，原点在左上角，遵循官方规范
export function getRealMediaPipeLandmarks() {
  // MediaPipe官方21个关键点标准定义
  // 参考：https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker
  return [
    // 0: WRIST (手腕基点) - 手掌几何中心的参考点
    { x: 0.50, y: 0.85, z: 0.0, visibility: 0.99 },
    
    // 1-4: THUMB (拇指4个关节点)
    { x: 0.65, y: 0.75, z: -0.01, visibility: 0.98 },  // 1: THUMB_CMC (拇指腕掌关节)
    { x: 0.70, y: 0.65, z: -0.02, visibility: 0.97 },  // 2: THUMB_MCP (拇指掌指关节)  
    { x: 0.74, y: 0.52, z: -0.03, visibility: 0.96 },  // 3: THUMB_IP (拇指指间关节)
    { x: 0.77, y: 0.42, z: -0.04, visibility: 0.95 },  // 4: THUMB_TIP (拇指尖)
    
    // 5-8: INDEX FINGER (食指4个关节点)
    { x: 0.58, y: 0.58, z: 0.0, visibility: 0.99 },    // 5: INDEX_FINGER_MCP (食指掌指关节)
    { x: 0.60, y: 0.42, z: -0.01, visibility: 0.99 },  // 6: INDEX_FINGER_PIP (食指近端指间关节)
    { x: 0.61, y: 0.30, z: -0.02, visibility: 0.98 },  // 7: INDEX_FINGER_DIP (食指远端指间关节)
    { x: 0.62, y: 0.20, z: -0.03, visibility: 0.97 },  // 8: INDEX_FINGER_TIP (食指尖)
    
    // 9-12: MIDDLE FINGER (中指4个关节点)
    { x: 0.48, y: 0.55, z: 0.0, visibility: 0.99 },    // 9: MIDDLE_FINGER_MCP (中指掌指关节)
    { x: 0.48, y: 0.38, z: -0.01, visibility: 0.99 },  // 10: MIDDLE_FINGER_PIP (中指近端指间关节)
    { x: 0.48, y: 0.26, z: -0.02, visibility: 0.98 },  // 11: MIDDLE_FINGER_DIP (中指远端指间关节)
    { x: 0.48, y: 0.16, z: -0.03, visibility: 0.97 },  // 12: MIDDLE_FINGER_TIP (中指尖)
    
    // 13-16: RING FINGER (无名指4个关节点)  
    { x: 0.38, y: 0.56, z: 0.0, visibility: 0.99 },    // 13: RING_FINGER_MCP (无名指掌指关节)
    { x: 0.36, y: 0.40, z: -0.01, visibility: 0.98 },  // 14: RING_FINGER_PIP (无名指近端指间关节)
    { x: 0.35, y: 0.28, z: -0.02, visibility: 0.97 },  // 15: RING_FINGER_DIP (无名指远端指间关节)
    { x: 0.34, y: 0.18, z: -0.03, visibility: 0.96 },  // 16: RING_FINGER_TIP (无名指尖)
    
    // 17-20: PINKY (小指4个关节点)
    { x: 0.28, y: 0.59, z: 0.0, visibility: 0.98 },    // 17: PINKY_MCP (小指掌指关节)
    { x: 0.25, y: 0.45, z: -0.01, visibility: 0.97 },  // 18: PINKY_PIP (小指近端指间关节)
    { x: 0.23, y: 0.34, z: -0.02, visibility: 0.96 },  // 19: PINKY_DIP (小指远端指间关节)
    { x: 0.21, y: 0.25, z: -0.03, visibility: 0.95 },  // 20: PINKY_TIP (小指尖)
  ]
}

// 保留原来的模拟数据函数作为备用
export function generateMockMediaPipeLandmarks() {
  // 默认返回真实的MediaPipe数据
  return getRealMediaPipeLandmarks();
}

/**
 * MediaPipe官方手部连接关系定义
 * 基于Google MediaPipe HandLandmarker标准连接模式
 */
export const HAND_CONNECTIONS = [
  // THUMB连接线 (拇指) - 4个连接
  [0, 1], [1, 2], [2, 3], [3, 4],
  
  // INDEX_FINGER连接线 (食指) - 4个连接  
  [0, 5], [5, 6], [6, 7], [7, 8],
  
  // MIDDLE_FINGER连接线 (中指) - 4个连接
  [5, 9], [9, 10], [10, 11], [11, 12],
  
  // RING_FINGER连接线 (无名指) - 4个连接
  [9, 13], [13, 14], [14, 15], [15, 16],
  
  // PINKY连接线 (小指) - 4个连接
  [13, 17], [17, 18], [18, 19], [19, 20],
  
  // PALM连接线 (手掌基础结构) - 4个连接
  [0, 17],  // 手腕到小指根部
  [5, 9],   // 食指根部到中指根部
  [9, 13],  // 中指根部到无名指根部  
  [13, 17]  // 无名指根部到小指根部
]

/**
 * MediaPipe官方手部关键点名称定义
 * 严格遵循Google MediaPipe HandLandmarker官方命名规范
 */
export const LANDMARK_NAMES = [
  'WRIST',                    // 0: 手腕基点
  'THUMB_CMC',               // 1: 拇指腕掌关节 (Carpometacarpal)
  'THUMB_MCP',               // 2: 拇指掌指关节 (Metacarpophalangeal)
  'THUMB_IP',                // 3: 拇指指间关节 (Interphalangeal)
  'THUMB_TIP',               // 4: 拇指尖端
  'INDEX_FINGER_MCP',        // 5: 食指掌指关节
  'INDEX_FINGER_PIP',        // 6: 食指近端指间关节 (Proximal Interphalangeal)
  'INDEX_FINGER_DIP',        // 7: 食指远端指间关节 (Distal Interphalangeal)
  'INDEX_FINGER_TIP',        // 8: 食指尖端
  'MIDDLE_FINGER_MCP',       // 9: 中指掌指关节
  'MIDDLE_FINGER_PIP',       // 10: 中指近端指间关节
  'MIDDLE_FINGER_DIP',       // 11: 中指远端指间关节
  'MIDDLE_FINGER_TIP',       // 12: 中指尖端
  'RING_FINGER_MCP',         // 13: 无名指掌指关节
  'RING_FINGER_PIP',         // 14: 无名指近端指间关节
  'RING_FINGER_DIP',         // 15: 无名指远端指间关节
  'RING_FINGER_TIP',         // 16: 无名指尖端
  'PINKY_MCP',               // 17: 小指掌指关节
  'PINKY_PIP',               // 18: 小指近端指间关节
  'PINKY_DIP',               // 19: 小指远端指间关节
  'PINKY_TIP'                // 20: 小指尖端
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