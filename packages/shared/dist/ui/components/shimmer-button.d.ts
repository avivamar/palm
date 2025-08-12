import React from 'react';
interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    shimmerColor?: string;
    shimmerSize?: string;
    borderRadius?: string;
    shimmerDuration?: string;
    background?: string;
    children: React.ReactNode;
}
declare const ShimmerButton: React.ForwardRefExoticComponent<ShimmerButtonProps & React.RefAttributes<HTMLButtonElement>>;
export { ShimmerButton };
//# sourceMappingURL=shimmer-button.d.ts.map