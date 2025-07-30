'use client';
import React from 'react';
export const MagicCard = ({ children, className = '', gradientSize = 200, gradientColor = '#262626', gradientOpacity = 0.8, gradientFrom = '#EBFF7F', gradientTo = '#EBFF7F', }) => {
    return (<div className={`relative overflow-hidden rounded-xl border border-primary/20 bg-background p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 ${className}`} style={{
            background: `radial-gradient(${gradientSize}px circle at var(--x) var(--y), ${gradientColor}${Math.round(gradientOpacity * 255).toString(16)} 0%, transparent 100%)`,
        }} onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
        }}>
      <div className="relative z-10">{children}</div>
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{
            background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            padding: '1px',
        }}/>
    </div>);
};
export default MagicCard;
//# sourceMappingURL=magic-card.jsx.map