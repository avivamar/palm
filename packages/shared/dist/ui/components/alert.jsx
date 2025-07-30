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
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@rolitt/shared/utils';
const alertVariants = cva('relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground', {
    variants: {
        variant: {
            default: 'bg-background text-foreground',
            destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
const Alert = (_a) => {
    var { ref, className, variant } = _a, props = __rest(_a, ["ref", "className", "variant"]);
    return (<div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}/>);
};
Alert.displayName = 'Alert';
const AlertTitle = (_a) => {
    var { ref, className } = _a, props = __rest(_a, ["ref", "className"]);
    return (<h5 ref={ref} className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props}/>);
};
AlertTitle.displayName = 'AlertTitle';
const AlertDescription = (_a) => {
    var { ref, className } = _a, props = __rest(_a, ["ref", "className"]);
    return (<div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props}/>);
};
AlertDescription.displayName = 'AlertDescription';
export { Alert, AlertDescription, AlertTitle };
//# sourceMappingURL=alert.jsx.map