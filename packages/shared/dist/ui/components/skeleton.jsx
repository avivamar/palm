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
import { cn } from '@rolitt/shared/utils';
function Skeleton(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div className={cn('animate-pulse rounded-md bg-muted', className)} {...props}/>);
}
export { Skeleton };
//# sourceMappingURL=skeleton.jsx.map