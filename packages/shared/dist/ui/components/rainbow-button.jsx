'use client';
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from 'react';
import { cn } from '@rolitt/shared/utils';
export function RainbowButton(_a) {
    var { children, className, href, target, rel, variant = 'default' } = _a, props = __rest(_a, ["children", "className", "href", "target", "rel", "variant"]);
    const isEnhanced = variant === 'enhanced';
    return (<div className={cn('relative group inline-block', isEnhanced && 'transform-gpu')}>
      
      <div className={cn('absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200', isEnhanced
            ? 'animate-pulse-slow from-yellow-400 via-pink-500 to-purple-600 blur-md'
            : 'animate-tilt')}>
      </div>

      
      {isEnhanced && (<div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 to-pink-500 rounded-lg blur-xl opacity-30 group-hover:opacity-60 transition duration-500 group-hover:duration-200 animate-pulse-slow"></div>)}

      {href ? (<a href={href} target={target} rel={rel} className={cn('relative px-6 py-3 bg-black dark:bg-gray-900 rounded-lg leading-none flex justify-center items-center text-white font-medium', 'transform transition-all duration-300', isEnhanced && 'overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 border border-white/10', className)}>
          
          {isEnhanced && (<>
              <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent opacity-50"></span>
              <span className="absolute -bottom-1 left-2 right-2 h-1/3 rounded-b-lg bg-black/20 blur-md"></span>
            </>)}

          
          <span className="relative z-10 flex items-center">
            {children}

            
            {isEnhanced && (<div className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </div>)}
          </span>
        </a>) : (<button className={cn('relative px-6 py-3 bg-black dark:bg-gray-900 rounded-lg leading-none flex justify-center items-center text-white font-medium', 'transform transition-all duration-300', isEnhanced && 'overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 border border-white/10', className)} {...props}>
          
          {isEnhanced && (<>
              <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent opacity-50"></span>
              <span className="absolute -bottom-1 left-2 right-2 h-1/3 rounded-b-lg bg-black/20 blur-md"></span>
            </>)}

          
          <span className="relative z-10 flex items-center">
            {children}

            
            {isEnhanced && (<div className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </div>)}
          </span>
        </button>)}
    </div>);
}
//# sourceMappingURL=rainbow-button.jsx.map