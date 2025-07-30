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
import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { cn } from '@rolitt/shared/utils';
const StaticAccordionItem = (_a) => {
    var { className, children } = _a, props = __rest(_a, ["className", "children"]);
    return (<div className={cn('border-b', className)} {...props}>
    {children}
  </div>);
};
StaticAccordionItem.displayName = 'StaticAccordionItem';
const StaticAccordionTrigger = (_a) => {
    var { className, children } = _a, props = __rest(_a, ["className", "children"]);
    return (<div className="flex">
    <button type="button" className={cn('flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline', className)} {...props}>
      {children}
      <ChevronDown className="h-4 w-4 shrink-0"/>
    </button>
  </div>);
};
StaticAccordionTrigger.displayName = 'StaticAccordionTrigger';
const StaticAccordionContent = (_a) => {
    var { className, children } = _a, props = __rest(_a, ["className", "children"]);
    return (<div className="overflow-hidden text-sm" {...props}>
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </div>);
};
StaticAccordionContent.displayName = 'StaticAccordionContent';
const StaticAccordion = (_a) => {
    var { className, children } = _a, props = __rest(_a, ["className", "children"]);
    return (<div className={cn('w-full', className)} {...props}>
    {children}
  </div>);
};
export { StaticAccordion, StaticAccordionContent, StaticAccordionItem, StaticAccordionTrigger, };
//# sourceMappingURL=static-accordion.jsx.map