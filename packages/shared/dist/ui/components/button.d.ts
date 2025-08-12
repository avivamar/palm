import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
declare const buttonVariants: (props?: ({
    variant?: "link" | "default" | "destructive" | "secondary" | "outline" | "ghost" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type ButtonProps = React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
};
declare function Button({ className, variant, size, asChild, ...props }: ButtonProps): React.JSX.Element;
export { Button, buttonVariants };
//# sourceMappingURL=button.d.ts.map