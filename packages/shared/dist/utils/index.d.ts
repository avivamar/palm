import type { ClassValue } from 'clsx';
export declare function cn(...inputs: ClassValue[]): string;
export declare function formatNumber(num: number, locale?: string): string;
export declare function formatCurrency(amount: number, currency?: string, locale?: string): string;
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
export declare function generateId(prefix?: string): string;
export { Logger } from './logger';
//# sourceMappingURL=index.d.ts.map