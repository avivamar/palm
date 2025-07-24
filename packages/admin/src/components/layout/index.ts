/**
 * Admin Layout components index file - Modernized
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

// Legacy components (for backward compatibility)
export { AdminHeader } from './AdminHeader';
// Modern layout components
export { AdminLayout, LayoutProvider, useLayout } from './AdminLayout';
export { AdminSidebar } from './AdminSidebar';
export { Card, ContentArea, EmptyState, Grid, PageHeader, Section } from './ContentArea';
export { MobileNavigation } from './MobileNavigation';

export { ResponsiveSidebar } from './ResponsiveSidebar';
export { TopNavigation } from './TopNavigation';

// Types
export type {
  AdminHeaderProps,
  AdminLayoutTranslations,
  AdminSidebarProps,
  SidebarItem,
} from './types';
