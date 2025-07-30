import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
declare const alertVariants: (props?: ({
    variant?: "default" | "destructive" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
declare const Alert: {
    ({ ref, className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants> & {
        ref?: React.RefObject<HTMLDivElement | null>;
    }): React.JSX.Element;
    displayName: string;
};
declare const AlertTitle: {
    ({ ref, className, ...props }: React.HTMLAttributes<HTMLHeadingElement> & {
        ref?: React.RefObject<HTMLParagraphElement | null>;
    }): React.JSX.Element;
    displayName: string;
};
declare const AlertDescription: {
    ({ ref, className, ...props }: React.HTMLAttributes<HTMLParagraphElement> & {
        ref?: React.RefObject<HTMLParagraphElement | null>;
    }): React.JSX.Element;
    displayName: string;
};
export { Alert, AlertDescription, AlertTitle };
//# sourceMappingURL=alert.d.ts.map