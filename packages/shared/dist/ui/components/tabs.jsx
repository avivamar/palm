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
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';
import { cn } from '@rolitt/shared/utils';
const Tabs = TabsPrimitive.Root;
const TabsList = (_a) => {
    var { ref, className } = _a, props = __rest(_a, ["ref", "className"]);
    return (<TabsPrimitive.List ref={ref} className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)} {...props}/>);
};
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = (_a) => {
    var { ref, className } = _a, props = __rest(_a, ["ref", "className"]);
    return (<TabsPrimitive.Trigger ref={ref} className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm', className)} {...props}/>);
};
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = (_a) => {
    var { ref, className } = _a, props = __rest(_a, ["ref", "className"]);
    return (<TabsPrimitive.Content ref={ref} className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)} {...props}/>);
};
TabsContent.displayName = TabsPrimitive.Content.displayName;
export { Tabs, TabsContent, TabsList, TabsTrigger };
//# sourceMappingURL=tabs.jsx.map