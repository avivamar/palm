import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

'use client';
const __rest = (this && this.__rest) || function (s, e) {
  const t = {};
  for (var p in s) {
    if (Object.prototype.hasOwnProperty.call(s, p) && !e.includes(p)) {
      t[p] = s[p];
    }
  }
  if (s != null && typeof Object.getOwnPropertySymbols === 'function') {
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (!e.includes(p[i]) && Object.prototype.propertyIsEnumerable.call(s, p[i])) {
        t[p[i]] = s[p[i]];
      }
    }
  }
  return t;
};
function Label(_a) {
  const { className } = _a; const props = __rest(_a, ['className']);
  return (<LabelPrimitive.Root data-slot="label" className={cn('flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50', className)} {...props} />);
}
export { Label };
// # sourceMappingURL=label.jsx.map
