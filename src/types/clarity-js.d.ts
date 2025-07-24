declare module 'clarity-js' {
  type ClarityAPI = {
    init: (projectId: string) => void;
    identify: (userId: string, properties?: Record<string, string>) => void;
    setTag: (key: string, value: string | string[]) => void;
    // 你可以根据需要在这里添加 Clarity SDK 的其他方法定义
  };
  export const clarity: ClarityAPI;
}
