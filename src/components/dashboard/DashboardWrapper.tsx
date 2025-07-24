import type React from 'react';

import type { DashboardContentOptimizedProps } from './DashboardContentOptimized';

type DashboardWrapperProps = {
  children: React.ReactElement<DashboardContentOptimizedProps>;
};

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  return children;
}
