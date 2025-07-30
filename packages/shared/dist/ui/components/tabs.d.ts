import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';
declare const Tabs: import("react").ForwardRefExoticComponent<TabsPrimitive.TabsProps & import("react").RefAttributes<HTMLDivElement>>;
declare const TabsList: {
    ({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
        ref?: React.RefObject<React.ElementRef<typeof TabsPrimitive.List> | null>;
    }): React.JSX.Element;
    displayName: string | undefined;
};
declare const TabsTrigger: {
    ({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
        ref?: React.RefObject<React.ElementRef<typeof TabsPrimitive.Trigger> | null>;
    }): React.JSX.Element;
    displayName: string | undefined;
};
declare const TabsContent: {
    ({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
        ref?: React.RefObject<React.ElementRef<typeof TabsPrimitive.Content> | null>;
    }): React.JSX.Element;
    displayName: string | undefined;
};
export { Tabs, TabsContent, TabsList, TabsTrigger };
//# sourceMappingURL=tabs.d.ts.map