import * as React from 'react';
type RainbowButtonProps = {
    children: React.ReactNode;
    className?: string;
    href?: string;
    target?: string;
    rel?: string;
    variant?: 'default' | 'enhanced';
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
export declare function RainbowButton({ children, className, href, target, rel, variant, ...props }: RainbowButtonProps): React.JSX.Element;
export {};
//# sourceMappingURL=rainbow-button.d.ts.map