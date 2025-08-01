import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@rolitt/shared/utils';

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

const Switch = (_a) => {
  const { ref, className } = _a; const props = __rest(_a, ['ref', 'className']);
  return (
    <SwitchPrimitives.Root className={cn('peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input', className)} {...props} ref={ref}>
      <SwitchPrimitives.Thumb className={cn('pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0')} />
    </SwitchPrimitives.Root>
  );
};
Switch.displayName = SwitchPrimitives.Root.displayName;
export { Switch };
// # sourceMappingURL=switch.jsx.map
