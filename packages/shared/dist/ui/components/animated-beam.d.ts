import React from 'react';
export interface AnimatedBeamProps {
    className?: string;
    containerRef: React.RefObject<HTMLElement | null>;
    fromRef: React.RefObject<HTMLElement | null>;
    toRef: React.RefObject<HTMLElement | null>;
    curvature?: number;
    reverse?: boolean;
    pathColor?: string;
    pathWidth?: number;
    pathOpacity?: number;
    gradientStartColor?: string;
    gradientStopColor?: string;
    delay?: number;
    duration?: number;
    startXOffset?: number;
    startYOffset?: number;
    endXOffset?: number;
    endYOffset?: number;
}
export declare const AnimatedBeam: React.ForwardRefExoticComponent<AnimatedBeamProps & React.RefAttributes<SVGSVGElement>>;
//# sourceMappingURL=animated-beam.d.ts.map