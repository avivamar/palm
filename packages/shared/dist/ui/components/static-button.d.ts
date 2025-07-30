import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
declare const buttonVariants: (props?: ({
    variant?: "link" | "default" | "destructive" | "secondary" | "outline" | "ghost" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type StaticButtonProps = {
    href?: string;
    children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;
export declare function StaticButton({ className, variant, size, href, children, ...props }: StaticButtonProps): React.JSX.Element;
export { buttonVariants };
//# sourceMappingURL=static-button.d.ts.map