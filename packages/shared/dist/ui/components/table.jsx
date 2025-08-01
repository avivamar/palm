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
import * as React from 'react';
import { cn } from '@rolitt/shared/utils';
const Table = (_a) => {
    var { ref, className } = _a, props = __rest(_a, ["ref", "className"]);
    return (<div className="relative w-full overflow-auto">
    <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props}/>
  </div>);
};
Table.displayName = 'Table';
const TableHeader = (_a) => {
    var { ref, className } = _a, props = __rest(_a, ["ref", "className"]);
    return (<thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props}/>);
};
TableHeader.displayName = 'TableHeader';
const TableBody = (_a) => {
    var { ref, className } = _a, props = __rest(_a, ["ref", "className"]);
    return (<tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props}/>);
};
TableBody.displayName = 'TableBody';
const TableFooter = (_a) => {
    var { ref, className } = _a, props = __rest(_a, ["ref", "className"]);
    return (<tfoot ref={ref} className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)} {...props}/>);
};
TableFooter.displayName = 'TableFooter';
const TableRow = (_a) => {
    var { ref, className } = _a, props = __rest(_a, ["ref", "className"]);
    return (<tr ref={ref} className={cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className)} {...props}/>);
};
TableRow.displayName = 'TableRow';
const TableHead = (_a) => {
    var { ref, className } = _a, props = __rest(_a, ["ref", "className"]);
    return (<th ref={ref} className={cn('h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0', className)} {...props}/>);
};
TableHead.displayName = 'TableHead';
const TableCell = (_a) => {
    var { ref, className } = _a, props = __rest(_a, ["ref", "className"]);
    return (<td ref={ref} className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props}/>);
};
TableCell.displayName = 'TableCell';
const TableCaption = (_a) => {
    var { ref, className } = _a, props = __rest(_a, ["ref", "className"]);
    return (<caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props}/>);
};
TableCaption.displayName = 'TableCaption';
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow, };
//# sourceMappingURL=table.jsx.map