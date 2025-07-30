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
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as React from 'react';
import { cn } from '@rolitt/shared/utils';
const ScrollArea = (_a) => {
    var { ref, className, children } = _a, props = __rest(_a, ["ref", "className", "children"]);
    return (<ScrollAreaPrimitive.Root ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>);
};
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
const ScrollBar = (_a) => {
    var { ref, className, orientation = 'vertical' } = _a, props = __rest(_a, ["ref", "className", "orientation"]);
    return (<ScrollAreaPrimitive.ScrollAreaScrollbar ref={ref} orientation={orientation} className={cn('flex touch-none select-none transition-colors', orientation === 'vertical'
            && 'h-full w-2.5 border-l border-l-transparent p-[1px]', orientation === 'horizontal'
            && 'h-2.5 flex-col border-t border-t-transparent p-[1px]', className)} {...props}>
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border"/>
  </ScrollAreaPrimitive.ScrollAreaScrollbar>);
};
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;
export { ScrollArea, ScrollBar };
//# sourceMappingURL=scroll-area.jsx.map