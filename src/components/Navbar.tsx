'use client';

import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import AuthStatus from '@/components/AuthStatus';
import { cn } from '@/lib/utils';

export function Navbar() {
  const tNav = useTranslations('Navbar.nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: '/', label: tNav('home') },
    { href: '/about', label: tNav('about') },
    { href: '/timeline', label: tNav('timeline') },
    { href: '/solution', label: tNav('solution') },
    { href: '/partner', label: tNav('partner') },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: tNav('contact') },
  ];

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-[1400px]">
        {/* Top Row: Logo centered, CTA/Mobile Toggle on the right */}
        <div className="relative h-20 w-full">

          {/* Center Logo */}
          <Link href="/" className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 hover:scale-105">
            <div className="relative w-32 h-12">
              <Image
                src="/palmlogo.svg"
                alt="Rolitt"
                width={480}
                height={165}
                className="w-full h-full"
                priority
              />
            </div>
          </Link>

          {/* Right Actions: CTA visible on desktop, Mobile menu toggle on mobile */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center space-x-4 pr-4 sm:pr-6 lg:pr-8">
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <AuthStatus />
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              className="p-2 md:hidden rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={toggleMobileMenu}
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Toggle menu</span>
              {mobileMenuOpen
                ? (
                    <X className="h-6 w-6" aria-hidden="true" />
                  )
                : (
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Links Section */}
      <nav className="hidden md:flex justify-center border-t">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-[1400px]">
          <div className="flex justify-center space-x-6 md:space-x-8 lg:space-x-12 xl:space-x-16 2xl:space-x-20">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="flex py-4 px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/20"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu (Collapsible) */}
      <div
        className={cn(
          'md:hidden border-t',
          mobileMenuOpen
            ? 'block'
            : 'hidden',
        )}
        id="mobile-menu"
      >
        <div className="px-4 py-3 space-y-2">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="block py-3 px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/20 rounded"
              onClick={toggleMobileMenu}
            >
              {link.label}
            </Link>
          ))}
          {/* Mobile Auth Buttons */}
          <div className="pt-3 border-t mt-2 space-y-2">
            <AuthStatus isMobile={true} onMobileMenuToggle={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      </div>
    </header>
  );
}
