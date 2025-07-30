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
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';
import { cn } from '@rolitt/shared/utils';
const Avatar = (_a) => {
    var { ref, className } = _a, props = __rest(_a, ["ref", "className"]);
    return (<AvatarPrimitive.Root ref={ref} className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props}/>);
};
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarImage = (_a) => {
    var { ref, className } = _a, props = __rest(_a, ["ref", "className"]);
    return (<AvatarPrimitive.Image ref={ref} className={cn('aspect-square h-full w-full', className)} {...props}/>);
};
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
const AvatarFallback = (_a) => {
    var { ref, className } = _a, props = __rest(_a, ["ref", "className"]);
    return (<AvatarPrimitive.Fallback ref={ref} className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted', className)} {...props}/>);
};
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
export { Avatar, AvatarFallback, AvatarImage };
//# sourceMappingURL=avatar.jsx.map