/**
 * Admin Layout components types
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

export type AdminHeaderProps = {
  className?: string;
  title?: string;
  description?: string;
  notificationCount?: number;
  onSignOut?: () => Promise<void>;
  onMenuClick?: () => void;
};

export type AdminSidebarProps = {
  className?: string;
  locale?: string;
};

export type SidebarItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

export type AdminLayoutTranslations = {
  title: string;
  header: {
    title: string;
    description: string;
    notifications: {
      label: string;
      unread: string;
    };
    settings: {
      label: string;
    };
    userMenu: {
      label: string;
      admin: string;
      myAccount: string;
      profile: string;
      settings: string;
      signOut: string;
    };
  };
  navigation: {
    title: string;
    dashboard: string;
    monitoring: string;
    users: string;
    scripts: string;
    shopify: string;
    ai: string;
    orders: string;
    products: string;
    analytics: string;
    settings: string;
    soon: string;
    version: string;
  };
};
