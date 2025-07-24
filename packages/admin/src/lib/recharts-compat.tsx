/**
 * Recharts compatibility layer for React 19
 * Handles type compatibility issues between React 19 and recharts
 */

import {
  Area as OriginalArea,
  AreaChart as OriginalAreaChart,
  Bar as OriginalBar,
  BarChart as OriginalBarChart,
  CartesianGrid as OriginalCartesianGrid,
  Cell as OriginalCell,
  Legend as OriginalLegend,
  Line as OriginalLine,
  LineChart as OriginalLineChart,
  Pie as OriginalPie,
  PieChart as OriginalPieChart,
  ResponsiveContainer as OriginalResponsiveContainer,
  Tooltip as OriginalTooltip,
  XAxis as OriginalXAxis,
  YAxis as OriginalYAxis,
} from 'recharts';

// Type-safe wrappers with proper type casting
export const ResponsiveContainer = OriginalResponsiveContainer as any;
export const AreaChart = OriginalAreaChart as any;
export const BarChart = OriginalBarChart as any;
export const LineChart = OriginalLineChart as any;
export const PieChart = OriginalPieChart as any;
export const XAxis = OriginalXAxis as any;
export const YAxis = OriginalYAxis as any;
export const CartesianGrid = OriginalCartesianGrid as any;
export const Tooltip = OriginalTooltip as any;
export const Legend = OriginalLegend as any;
export const Area = OriginalArea as any;
export const Bar = OriginalBar as any;
export const Line = OriginalLine as any;
export const Pie = OriginalPie as any;
export const Cell = OriginalCell as any;
