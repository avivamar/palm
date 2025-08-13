/**
 * Palm Image Validation Utilities
 * Validates uploaded images to ensure they contain palm/hand features
 */

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  message: string;
  issues?: string[];
}

/**
 * Validates if an image is likely a palm/hand photo
 * Uses multiple heuristics for validation
 */
export async function validatePalmImage(file: File): Promise<ValidationResult> {
  // Step 1: Basic file validation
  const basicValidation = validateBasicRequirements(file);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  // Step 2: Image dimension validation
  const dimensionValidation = await validateImageDimensions(file);
  if (!dimensionValidation.isValid) {
    return dimensionValidation;
  }

  // Step 3: Skin tone detection (basic heuristic)
  const skinToneValidation = await validateSkinTones(file);
  if (!skinToneValidation.isValid) {
    return skinToneValidation;
  }

  // Step 4: Shape analysis (looking for hand-like contours)
  const shapeValidation = await validateHandShape(file);
  
  // Combine all validations
  const overallConfidence = (
    basicValidation.confidence * 0.1 +
    dimensionValidation.confidence * 0.2 +
    skinToneValidation.confidence * 0.35 +
    shapeValidation.confidence * 0.35
  );

  return {
    isValid: overallConfidence > 0.6,
    confidence: overallConfidence,
    message: overallConfidence > 0.6 
      ? '图片验证通过，检测到手掌特征' 
      : '请上传清晰的手掌照片',
    issues: collectIssues([basicValidation, dimensionValidation, skinToneValidation, shapeValidation])
  };
}

/**
 * Basic file requirements validation
 */
function validateBasicRequirements(file: File): ValidationResult {
  const issues: string[] = [];
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    issues.push('文件类型不是图片');
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    issues.push('文件大小超过10MB限制');
  }

  // Check minimum size (at least 50KB to ensure quality)
  const minSize = 50 * 1024;
  if (file.size < minSize) {
    issues.push('图片文件过小，可能质量不足');
  }

  return {
    isValid: issues.length === 0,
    confidence: issues.length === 0 ? 1 : 0,
    message: issues.length === 0 ? '文件格式正确' : '文件格式检查失败',
    issues
  };
}

/**
 * Validates image dimensions
 */
async function validateImageDimensions(file: File): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const issues: string[] = [];
      
      // Check minimum dimensions
      if (img.width < 300 || img.height < 300) {
        issues.push('图片分辨率过低（最小300x300像素）');
      }
      
      // Check aspect ratio (hand photos are usually portrait or square)
      const aspectRatio = img.width / img.height;
      if (aspectRatio > 2 || aspectRatio < 0.5) {
        issues.push('图片比例异常，请确保手掌完整在画面中');
      }
      
      // Calculate confidence based on ideal dimensions
      const idealSize = 800;
      const sizeScore = Math.min(img.width, img.height) / idealSize;
      const confidence = Math.min(sizeScore, 1);
      
      resolve({
        isValid: issues.length === 0,
        confidence: issues.length === 0 ? confidence : confidence * 0.5,
        message: issues.length === 0 ? '图片尺寸合适' : '图片尺寸检查未通过',
        issues
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: false,
        confidence: 0,
        message: '无法读取图片',
        issues: ['图片文件损坏或格式不支持']
      });
    };
    
    img.src = url;
  });
}

/**
 * Basic skin tone detection using canvas
 */
async function validateSkinTones(file: File): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Create canvas for pixel analysis
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve({
          isValid: true,
          confidence: 0.5,
          message: '无法进行颜色分析',
          issues: []
        });
        return;
      }
      
      // Resize for faster processing
      const maxDim = 200;
      const scale = Math.min(maxDim / img.width, maxDim / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      let skinPixels = 0;
      let totalPixels = 0;
      
      // Sample every 4th pixel for speed
      for (let i = 0; i < pixels.length; i += 16) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        totalPixels++;
        
        // Basic skin tone detection (simplified HSV range)
        if (r !== undefined && g !== undefined && b !== undefined && isSkinTone(r, g, b)) {
          skinPixels++;
        }
      }
      
      const skinRatio = skinPixels / totalPixels;
      const issues: string[] = [];
      
      // Hand photos should have 20-80% skin pixels
      if (skinRatio < 0.15) {
        issues.push('未检测到足够的皮肤色调，请确保手掌清晰可见');
      } else if (skinRatio > 0.85) {
        issues.push('图片可能过度曝光或模糊');
      }
      
      resolve({
        isValid: skinRatio >= 0.15 && skinRatio <= 0.85,
        confidence: Math.min(skinRatio * 2, 1) * (skinRatio < 0.85 ? 1 : 0.7),
        message: issues.length === 0 ? '检测到手掌特征' : '手掌特征检测异常',
        issues
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: true,
        confidence: 0.5,
        message: '无法进行颜色分析',
        issues: []
      });
    };
    
    img.src = url;
  });
}

/**
 * Simple skin tone detection
 */
function isSkinTone(r: number, g: number, b: number): boolean {
  // Convert to normalized RGB
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  // Basic skin tone rules
  // 1. Red channel should be prominent
  // 2. Green should be less than red
  // 3. Blue should be the least
  // 4. Not too dark or too bright
  
  const brightness = (r + g + b) / 3;
  
  return (
    r > 60 && r < 240 &&  // Not too dark or bright
    g > 40 && g < 220 &&
    b > 20 && b < 200 &&
    r > g &&              // Red > Green
    g > b &&              // Green > Blue
    r - b > 15 &&         // Significant red-blue difference
    max - min > 15 &&     // Some color variation
    brightness > 50 &&    // Not too dark
    brightness < 200      // Not too bright
  );
}

/**
 * Basic shape validation (checks for hand-like features)
 */
async function validateHandShape(file: File): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Create canvas for edge detection
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve({
          isValid: true,
          confidence: 0.5,
          message: '无法进行形状分析',
          issues: []
        });
        return;
      }
      
      // Resize for faster processing
      const maxDim = 150;
      const scale = Math.min(maxDim / img.width, maxDim / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert to grayscale and detect edges
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const edges = detectEdges(imageData);
      
      // Count edge pixels in different regions
      const regions = analyzeRegions(edges, canvas.width, canvas.height);
      
      // Hand should have edges distributed across the image
      // with higher concentration in the center
      const centerRatio = regions.center / (regions.total || 1);
      const distributionScore = calculateDistributionScore(regions);
      
      const issues: string[] = [];
      
      if (centerRatio < 0.2) {
        issues.push('手掌未在画面中央');
      }
      
      if (distributionScore < 0.3) {
        issues.push('未检测到清晰的手掌轮廓');
      }
      
      const confidence = (centerRatio + distributionScore) / 2;
      
      resolve({
        isValid: issues.length === 0,
        confidence: Math.min(confidence, 1),
        message: issues.length === 0 ? '手掌轮廓清晰' : '手掌轮廓检测异常',
        issues
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: true,
        confidence: 0.5,
        message: '无法进行形状分析',
        issues: []
      });
    };
    
    img.src = url;
  });
}

/**
 * Simple edge detection using Sobel operator
 */
function detectEdges(imageData: ImageData): Uint8ClampedArray {
  const pixels = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const edges = new Uint8ClampedArray(width * height);
  
  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let pixelX = 0;
      let pixelY = 0;
      
      // Apply Sobel operator
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const idx = ((y + j) * width + (x + i)) * 4;
          const r = pixels[idx] ?? 0;
          const g = pixels[idx + 1] ?? 0;
          const b = pixels[idx + 2] ?? 0;
          const gray = (r + g + b) / 3;
          const kernelIdx = (j + 1) * 3 + (i + 1);
          const sx = sobelX[kernelIdx] ?? 0;
          const sy = sobelY[kernelIdx] ?? 0;
          
          pixelX += gray * sx;
          pixelY += gray * sy;
        }
      }
      
      const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
      edges[y * width + x] = magnitude > 30 ? 255 : 0;
    }
  }
  
  return edges;
}

/**
 * Analyze edge distribution in image regions
 */
function analyzeRegions(edges: Uint8ClampedArray, width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  const centerRadius = Math.min(width, height) / 3;
  
  let totalEdges = 0;
  let centerEdges = 0;
  let topEdges = 0;
  let bottomEdges = 0;
  let leftEdges = 0;
  let rightEdges = 0;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const edgeValue = edges[y * width + x] ?? 0;
      if (edgeValue > 0) {
        totalEdges++;
        
        // Check if in center region
        const dx = x - centerX;
        const dy = y - centerY;
        if (Math.sqrt(dx * dx + dy * dy) < centerRadius) {
          centerEdges++;
        }
        
        // Count in quadrants
        if (y < height / 2) topEdges++;
        else bottomEdges++;
        
        if (x < width / 2) leftEdges++;
        else rightEdges++;
      }
    }
  }
  
  return {
    total: totalEdges,
    center: centerEdges,
    top: topEdges,
    bottom: bottomEdges,
    left: leftEdges,
    right: rightEdges
  };
}

/**
 * Calculate how well distributed the edges are (hand should have good distribution)
 */
function calculateDistributionScore(regions: any): number {
  const { total, top, bottom, left, right } = regions;
  
  if (total === 0) return 0;
  
  // Calculate balance between regions
  const verticalBalance = 1 - Math.abs(top - bottom) / total;
  const horizontalBalance = 1 - Math.abs(left - right) / total;
  
  // Hand should have some edges in all regions
  const coverage = Math.min(top, bottom, left, right) / (total / 4);
  
  return (verticalBalance + horizontalBalance + coverage) / 3;
}

/**
 * Collect all issues from validations
 */
function collectIssues(validations: ValidationResult[]): string[] {
  const allIssues: string[] = [];
  validations.forEach(v => {
    if (v.issues) {
      allIssues.push(...v.issues);
    }
  });
  return allIssues;
}

/**
 * Display validation result to user
 */
export function getValidationMessage(result: ValidationResult): {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'error';
} {
  if (result.confidence > 0.8) {
    return {
      title: '✅ 完美！',
      description: '手掌照片清晰，可以进行分析',
      type: 'success'
    };
  } else if (result.confidence > 0.6) {
    return {
      title: '✓ 照片可用',
      description: '照片质量尚可，建议光线充足时重拍以获得更准确的分析',
      type: 'warning'
    };
  } else {
    const mainIssue = result.issues?.[0] || '请上传清晰的手掌照片';
    return {
      title: '❌ 需要重新拍摄',
      description: mainIssue,
      type: 'error'
    };
  }
}