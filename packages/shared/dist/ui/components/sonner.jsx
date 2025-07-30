'use client';
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { useTheme } from 'next-themes';
import * as React from 'react';
import { Toaster as Sonner } from 'sonner';
const Toaster = (_a) => {
    var props = __rest(_a, []);
    const { theme = 'system' } = useTheme();
    return (<Sonner theme={theme} className="toaster group" style={{
            '--normal-bg': 'var(--popover)',
            '--normal-text': 'var(--popover-foreground)',
            '--normal-border': 'var(--border)',
            '--success-bg': 'var(--popover)',
            '--success-text': 'hsl(142.1 76.2% 36.3%)',
            '--success-border': 'hsl(142.1 76.2% 36.3%)',
            '--error-bg': 'var(--popover)',
            '--error-text': 'var(--destructive)',
            '--error-border': 'var(--destructive)',
            '--warning-bg': 'var(--popover)',
            '--warning-text': 'hsl(32.5 94.6% 43.7%)',
            '--warning-border': 'hsl(32.5 94.6% 43.7%)',
            '--info-bg': 'var(--popover)',
            '--info-text': 'hsl(221.2 83.2% 53.3%)',
            '--info-border': 'hsl(221.2 83.2% 53.3%)',
        }} toastOptions={{
            style: {
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                color: 'var(--popover-foreground)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow)',
                fontSize: '14px',
                fontWeight: '500',
                padding: '16px',
            },
            className: 'group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
        }} {...props}/>);
};
export { Toaster };
//# sourceMappingURL=sonner.jsx.map