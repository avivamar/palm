'use client';

import { motion } from 'framer-motion';
import { Award, Star, TrendingUp, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const socialProofData = {
  stats: [
    {
      icon: Users,
      number: '10,000+',
      label: 'Pre-orders Placed',
      description: 'Join thousands who have already secured their AI companion',
    },
    {
      icon: Star,
      number: '4.9/5',
      label: 'Customer Rating',
      description: 'Based on early access feedback and demos',
    },
    {
      icon: Award,
      number: '15+',
      label: 'Industry Awards',
      description: 'Recognition from leading tech publications',
    },
    {
      icon: TrendingUp,
      number: '95%',
      label: 'Satisfaction Rate',
      description: 'From beta testers and early adopters',
    },
  ],
  testimonials: [
    {
      quote: 'This is the future of AI companionship. The pre-order was a no-brainer!',
      author: 'Sarah Chen',
      role: 'Tech Enthusiast',
      avatar: 'SC',
    },
    {
      quote: 'Amazing technology! Can\'t wait to receive my Rolitt AI companion.',
      author: 'Michael Rodriguez',
      role: 'Early Adopter',
      avatar: 'MR',
    },
    {
      quote: 'The demo blew my mind. This will change how we interact with AI.',
      author: 'Emily Johnson',
      role: 'AI Researcher',
      avatar: 'EJ',
    },
  ],
  pressLogos: [
    {
      name: 'TechCrunch',
      width: 120,
      logo: (
        <svg viewBox="0 0 180 36" className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity duration-200">
          <text x="0" y="26" className="fill-current text-2xl font-bold" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fill: '#00D084' }}>TechCrunch</text>
        </svg>
      ),
    },
    {
      name: 'Wired',
      width: 80,
      logo: (
        <svg viewBox="0 0 100 36" className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity duration-200">
          <text x="0" y="26" className="fill-current text-2xl font-bold" style={{ fontFamily: 'Helvetica, Arial, sans-serif', letterSpacing: '0.1em' }}>WIRED</text>
        </svg>
      ),
    },
    {
      name: 'The Verge',
      width: 100,
      logo: (
        <svg viewBox="0 0 140 36" className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity duration-200">
          <polygon points="0,8 12,8 8,20 4,20" fill="#FF6B35" />
          <text x="20" y="26" className="fill-current text-xl font-medium" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>The Verge</text>
        </svg>
      ),
    },
    {
      name: 'Ars Technica',
      width: 110,
      logo: (
        <svg viewBox="0 0 160 36" className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity duration-200">
          <circle cx="8" cy="18" r="6" fill="#FF4500" />
          <text x="20" y="26" className="fill-current text-xl font-medium" style={{ fontFamily: 'Georgia, serif' }}>Ars Technica</text>
        </svg>
      ),
    },
    {
      name: 'MIT Technology Review',
      width: 140,
      logo: (
        <svg viewBox="0 0 240 36" className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity duration-200">
          <rect x="0" y="6" width="24" height="20" fill="#8B0000" />
          <text x="4" y="22" className="fill-white text-sm font-bold" style={{ fontFamily: 'Times, serif' }}>MIT</text>
          <text x="32" y="22" className="fill-current text-lg font-light" style={{ fontFamily: 'Times, serif' }}>Technology Review</text>
        </svg>
      ),
    },
  ],
};

export function SocialProofSection() {
  const t = useTranslations('PreOrderSocialProof');

  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          suppressHydrationWarning
        >
          {socialProofData.stats.map((stat, index) => {
            const IconComponent = stat.icon;
            const colors = ['#EFC699', '#C0C0C0', '#F3B9C0', '#CECFA0'];
            const bgColor = colors[index % colors.length];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -8, scale: 1.05 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
                suppressHydrationWarning
              >
                <Card className="text-center p-6 hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 group" suppressHydrationWarning>
                  <CardContent className="p-0" suppressHydrationWarning>
                    <motion.div
                      className="flex justify-center mb-4"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      suppressHydrationWarning
                    >
                      <div
                        className="p-4 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300"
                        style={{ backgroundColor: `${bgColor}40` }}
                      >
                        <IconComponent
                          className="h-8 w-8 transition-all duration-300 group-hover:scale-110"
                          style={{ color: bgColor }}
                        />
                      </div>
                    </motion.div>
                    <motion.div
                      className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                      suppressHydrationWarning
                    >
                      {stat.number}
                    </motion.div>
                    <div className="font-semibold mb-2 text-lg">{stat.label}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      {stat.description}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
          suppressHydrationWarning
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            {t('testimonialsTitle')}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {socialProofData.testimonials.map((testimonial, index) => {
              const colors = ['#EFC699', '#F3B9C0', '#CECFA0'];
              const bgColor = colors[index % colors.length];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40, rotateY: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  whileHover={{ y: -10, rotateY: 5, scale: 1.02 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.15,
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                  }}
                  suppressHydrationWarning
                >
                  <Card className="p-6 hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 group relative overflow-hidden" suppressHydrationWarning>
                    <div
                      className="absolute top-0 left-0 w-full h-1 transition-all duration-300 group-hover:h-2"
                      style={{ backgroundColor: bgColor }}
                    />
                    <CardContent className="p-0 relative z-10">
                      <motion.div
                        className="flex items-center mb-4"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: index * 0.15 + 0.3, type: 'spring', stiffness: 400 }}
                        suppressHydrationWarning
                      >
                        {[...Array.from({ length: 5 })].map((_, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.3, rotate: 180 }}
                            transition={{ duration: 0.3 }}
                            suppressHydrationWarning
                          >
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1 drop-shadow-sm" />
                          </motion.div>
                        ))}
                      </motion.div>
                      <motion.blockquote
                        className="text-muted-foreground mb-6 italic text-lg leading-relaxed relative"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        suppressHydrationWarning
                      >
                        <span className="text-4xl absolute -top-2 -left-2 opacity-20" style={{ color: bgColor }}>"</span>
                        {testimonial.quote}
                        <span className="text-4xl absolute -bottom-4 -right-2 opacity-20" style={{ color: bgColor }}>"</span>
                      </motion.blockquote>
                      <motion.div
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                        suppressHydrationWarning
                      >
                        <motion.div
                          className="w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-lg"
                          style={{ backgroundColor: `${bgColor}30` }}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                          suppressHydrationWarning
                        >
                          <span className="text-lg font-bold" style={{ color: bgColor }}>
                            {testimonial.avatar}
                          </span>
                        </motion.div>
                        <div>
                          <div className="font-semibold text-lg">{testimonial.author}</div>
                          <div className="text-sm font-medium" style={{ color: bgColor }}>{testimonial.role}</div>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Press Coverage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
          suppressHydrationWarning
        >
          <motion.h3
            className="text-xl font-semibold mb-8 text-muted-foreground"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            suppressHydrationWarning
          >
            {t('pressTitle')}
          </motion.h3>

          {/* Scrolling logos container */}
          <div className="relative overflow-hidden w-full">
            <div className="flex animate-scroll-left space-x-12 py-4">
              {/* First set of logos */}
              {socialProofData.pressLogos.map(logo => (
                <motion.div
                  key={`first-${logo.name}`}
                  className="flex items-center justify-center min-w-fit px-6"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="transform scale-150">
                    {logo.logo || (
                      <div className="text-2xl font-bold text-muted-foreground">
                        {logo.name}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {/* Duplicate set for seamless loop */}
              {socialProofData.pressLogos.map(logo => (
                <motion.div
                  key={`second-${logo.name}`}
                  className="flex items-center justify-center min-w-fit px-6"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="transform scale-150">
                    {logo.logo || (
                      <div className="text-2xl font-bold text-muted-foreground">
                        {logo.name}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Add CSS animation styles */}
        <style jsx>
          {`
            @keyframes scroll-left {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            
            .animate-scroll-left {
              animation: scroll-left 30s linear infinite;
            }
            
            .animate-scroll-left:hover {
              animation-play-state: paused;
            }
          `}
        </style>
      </div>
    </section>
  );
}

export default SocialProofSection;
