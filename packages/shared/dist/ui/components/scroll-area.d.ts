import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as React from 'react';
declare const ScrollArea: {
    ({ ref, className, children, ...props }: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
        ref?: React.RefObject<React.ElementRef<typeof ScrollAreaPrimitive.Root> | null>;
    }): React.JSX.Element;
    displayName: string | undefined;
};
declare const ScrollBar: {
    ({ ref, className, orientation, ...props }: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> & {
        ref?: React.RefObject<React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> | null>;
    }): React.JSX.Element;
    displayName: string | undefined;
};
export { ScrollArea, ScrollBar };
//# sourceMappingURL=scroll-area.d.ts.map