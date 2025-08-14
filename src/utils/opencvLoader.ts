/**
 * OpenCV.js Loader
 * 动态加载OpenCV.js库用于图像处理
 */

declare global {
  interface Window {
    cv: any;
    cvReady: Promise<void>;
  }
}

let isOpenCVLoading = false;
let openCVLoadPromise: Promise<void> | null = null;

/**
 * 加载OpenCV.js库
 */
export async function loadOpenCV(): Promise<void> {
  // 如果已经加载，直接返回
  if (window.cv && window.cv.imread) {
    return Promise.resolve();
  }

  // 如果正在加载，等待加载完成
  if (isOpenCVLoading && openCVLoadPromise) {
    return openCVLoadPromise;
  }

  isOpenCVLoading = true;

  openCVLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://docs.opencv.org/4.5.4/opencv.js';
    
    script.onload = () => {
      // 等待OpenCV初始化完成
      const checkCV = setInterval(() => {
        if (window.cv && window.cv.imread) {
          clearInterval(checkCV);
          console.log('OpenCV.js loaded successfully');
          isOpenCVLoading = false;
          resolve();
        }
      }, 100);

      // 超时处理
      setTimeout(() => {
        clearInterval(checkCV);
        if (!window.cv || !window.cv.imread) {
          isOpenCVLoading = false;
          reject(new Error('OpenCV.js initialization timeout'));
        }
      }, 10000); // 10秒超时
    };

    script.onerror = () => {
      isOpenCVLoading = false;
      reject(new Error('Failed to load OpenCV.js'));
    };

    document.head.appendChild(script);
  });

  return openCVLoadPromise;
}

/**
 * 检查OpenCV是否已加载
 */
export function isOpenCVReady(): boolean {
  return !!(window.cv && window.cv.imread);
}

/**
 * 获取OpenCV实例
 */
export async function getOpenCV(): Promise<any> {
  await loadOpenCV();
  return window.cv;
}