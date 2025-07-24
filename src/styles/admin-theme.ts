/**
 * 🎨 Enhanced Admin Design System
 * 基于当前 shadcn/ui 的增强设计系统
 */

// 1. 扩展色彩系统
export const adminTheme = {
  colors: {
    // 状态色彩语义化
    status: {
      success: 'hsl(142 71% 45%)', // green-600
      warning: 'hsl(38 92% 50%)', // yellow-500
      danger: 'hsl(0 84% 60%)', // red-500
      info: 'hsl(217 91% 60%)', // blue-500
      neutral: 'hsl(215 20% 65%)', // gray-500
    },
    // 功能模块主题色
    modules: {
      dashboard: 'hsl(217 91% 60%)', // 仪表板 - 蓝色
      monitoring: 'hsl(142 71% 45%)', // 监控 - 绿色
      scripts: 'hsl(262 83% 58%)', // 脚本 - 紫色
      shopify: 'hsl(158 64% 52%)', // Shopify - 青绿色
      users: 'hsl(38 92% 50%)', // 用户 - 黄色
      analytics: 'hsl(0 84% 60%)', // 分析 - 红色
    },
  },

  // 2. 组件尺寸标准化
  spacing: {
    section: '2rem', // 页面段落间距
    card: '1.5rem', // 卡片间距
    element: '1rem', // 元素间距
  },

  // 3. 交互状态定义
  interactions: {
    hover: 'transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15);',
    focus: 'outline: 2px solid hsl(217 91% 60%); outline-offset: 2px;',
    active: 'transform: translateY(0px);',
  },
};

// 4. 响应式断点标准
export const breakpoints = {
  'sm': '640px', // Mobile landscape
  'md': '768px', // Tablet
  'lg': '1024px', // Desktop
  'xl': '1280px', // Large desktop
  '2xl': '1536px', // Extra large
};

// 5. 组件样式库
export const componentStyles = {
  // Admin页面布局
  pageContainer: 'min-h-screen bg-gray-50/30',
  contentWrapper: 'container mx-auto px-4 py-6 space-y-6',

  // 卡片样式
  card: {
    base: 'bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200',
    hover: 'hover:shadow-md hover:border-gray-300',
    interactive: 'cursor-pointer hover:shadow-lg transform hover:-translate-y-1',
  },

  // 仪表板网格
  dashboard: {
    statsGrid: 'grid gap-4 md:grid-cols-2 lg:grid-cols-4',
    moduleGrid: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
    fullWidthSection: 'col-span-full',
  },

  // 状态徽章样式
  statusBadge: {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  },
};

// 6. 动画配置
export const animations = {
  // 页面过渡
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },

  // 卡片悬停效果
  cardHover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeOut' },
  },

  // 指标数字动画
  counterAnimation: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// 7. 模块主题映射
export const moduleThemes = {
  dashboard: {
    primary: adminTheme.colors.modules.dashboard,
    gradient: 'from-blue-500/10 to-blue-600/5',
    icon: 'text-blue-600',
  },
  monitoring: {
    primary: adminTheme.colors.modules.monitoring,
    gradient: 'from-green-500/10 to-green-600/5',
    icon: 'text-green-600',
  },
  scripts: {
    primary: adminTheme.colors.modules.scripts,
    gradient: 'from-purple-500/10 to-purple-600/5',
    icon: 'text-purple-600',
  },
  shopify: {
    primary: adminTheme.colors.modules.shopify,
    gradient: 'from-teal-500/10 to-teal-600/5',
    icon: 'text-teal-600',
  },
  users: {
    primary: adminTheme.colors.modules.users,
    gradient: 'from-yellow-500/10 to-yellow-600/5',
    icon: 'text-yellow-600',
  },
  analytics: {
    primary: adminTheme.colors.modules.analytics,
    gradient: 'from-red-500/10 to-red-600/5',
    icon: 'text-red-600',
  },
};

// 8. 工具函数
export const themeUtils = {
  // 获取模块主题色
  getModuleTheme: (module: keyof typeof moduleThemes) => moduleThemes[module],

  // 状态颜色映射
  getStatusColor: (status: 'healthy' | 'warning' | 'critical' | 'info' | 'neutral') => {
    const statusMap = {
      healthy: adminTheme.colors.status.success,
      warning: adminTheme.colors.status.warning,
      critical: adminTheme.colors.status.danger,
      info: adminTheme.colors.status.info,
      neutral: adminTheme.colors.status.neutral,
    };
    return statusMap[status];
  },

  // 响应式类名生成
  responsive: (classes: Record<keyof typeof breakpoints, string>) => {
    return Object.entries(classes)
      .map(([bp, className]) => bp === 'sm' ? className : `${bp}:${className}`)
      .join(' ');
  },
};
