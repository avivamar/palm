'use client';

import Link, { LinkProps } from 'next/link';
import { AnchorHTMLAttributes, forwardRef } from 'react';

// Compatible Link component that works around React 19 type issues
export const CompatLink = forwardRef<
  HTMLAnchorElement,
  LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>
>((props, ref) => {
  // @ts-ignore React 19 Link compatibility
  return <Link {...props} ref={ref} />;
});

CompatLink.displayName = 'CompatLink';