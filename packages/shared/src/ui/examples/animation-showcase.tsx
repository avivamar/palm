'use client';

import React, { useRef } from 'react';
import { 
  ShimmerButton, 
  AnimatedBeam, 
  SparklesText, 
  OrbitingCircles, 
  Ripple, 
  Meteors 
} from '../components';
import { Card } from '../components/card';

/**
 * Animation Components Showcase
 * Demonstrates all available animation components from the UI library
 */
export const AnimationShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-black p-8 space-y-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Animation Components Showcase</h1>
        <p className="text-gray-400">Explore our collection of animated UI components</p>
      </div>

      {/* Sparkles Text */}
      <Card className="p-8 bg-gray-900 text-center">
        <h2 className="text-2xl font-semibold text-white mb-6">Sparkles Text</h2>
        <div className="space-y-4">
          <SparklesText 
            text="✨ Magical Text Effect ✨" 
            className="text-3xl text-white"
            colors={{ first: '#9FE2BF', second: '#FFBF9F' }}
            sparklesCount={15}
          />
          <SparklesText 
            text="Premium Experience" 
            className="text-xl text-purple-300"
            colors={{ first: '#A855F7', second: '#EC4899' }}
            sparklesCount={8}
          />
        </div>
      </Card>

      {/* Shimmer Buttons */}
      <Card className="p-8 bg-gray-900 text-center">
        <h2 className="text-2xl font-semibold text-white mb-6">Shimmer Buttons</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <ShimmerButton
            shimmerColor="#ffffff"
            background="linear-gradient(45deg, #6366f1, #8b5cf6)"
            className="text-white"
          >
            Get Started
          </ShimmerButton>
          
          <ShimmerButton
            shimmerColor="#fbbf24"
            background="linear-gradient(45deg, #f59e0b, #d97706)"
            className="text-white"
            shimmerDuration="2s"
          >
            Premium Plan
          </ShimmerButton>
          
          <ShimmerButton
            shimmerColor="#10b981"
            background="linear-gradient(45deg, #059669, #047857)"
            className="text-white"
            borderRadius="12px"
          >
            Success Action
          </ShimmerButton>
        </div>
      </Card>

      {/* Animated Beam */}
      <Card className="p-8 bg-gray-900">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Animated Beam</h2>
        <div 
          ref={containerRef} 
          className="relative h-64 w-full border border-gray-700 rounded-lg overflow-hidden"
        >
          {/* Source */}
          <div
            ref={div1Ref}
            className="absolute top-12 left-12 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
          >
            <span className="text-white font-bold">A</span>
          </div>
          
          {/* Target */}
          <div
            ref={div2Ref}
            className="absolute bottom-12 right-12 w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center"
          >
            <span className="text-white font-bold">B</span>
          </div>
          
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div1Ref}
            toRef={div2Ref}
            curvature={50}
            gradientStartColor="#a855f7"
            gradientStopColor="#06b6d4"
            duration={3}
          />
        </div>
      </Card>

      {/* Orbiting Circles */}
      <Card className="p-8 bg-gray-900">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Orbiting Circles</h2>
        <div className="relative h-64 w-full flex items-center justify-center">
          {/* Central element */}
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-gray-600 bg-gray-800">
            <span className="text-white font-semibold">Center</span>
            
            {/* Multiple orbiting elements */}
            <OrbitingCircles className="h-6 w-6 border-none bg-purple-500" radius={60} duration={15}>
              <span className="text-xs text-white">1</span>
            </OrbitingCircles>
            
            <OrbitingCircles className="h-8 w-8 border-none bg-blue-500" radius={80} duration={20} reverse>
              <span className="text-xs text-white">2</span>
            </OrbitingCircles>
            
            <OrbitingCircles className="h-4 w-4 border-none bg-green-500" radius={100} duration={25} delay={5}>
              <span className="text-xs text-white">3</span>
            </OrbitingCircles>
          </div>
        </div>
      </Card>

      {/* Ripple Effect */}
      <Card className="p-8 bg-gray-900">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Ripple Effect</h2>
        <div className="relative h-64 w-full flex items-center justify-center">
          <div className="relative w-48 h-48 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg z-10">Ripple Source</span>
            <Ripple 
              mainCircleSize={100}
              mainCircleOpacity={0.15}
              numCircles={6}
              className="text-purple-300"
            />
          </div>
        </div>
      </Card>

      {/* Meteors */}
      <Card className="p-8 bg-gray-900 relative overflow-hidden">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Meteor Shower</h2>
        <div className="relative h-64 w-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xl font-semibold z-10">Night Sky Effect</span>
          </div>
          <Meteors number={30} className="bg-gradient-to-r from-yellow-400 to-orange-500" />
        </div>
      </Card>

      {/* Usage Examples */}
      <Card className="p-8 bg-gray-900">
        <h2 className="text-2xl font-semibold text-white mb-6">Usage Examples</h2>
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="text-lg font-semibold text-white">Import Components:</h3>
            <pre className="bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`import { 
  ShimmerButton, 
  AnimatedBeam, 
  SparklesText, 
  OrbitingCircles, 
  Ripple, 
  Meteors 
} from '@rolitt/shared/ui';`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white">Basic Usage:</h3>
            <pre className="bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`// Sparkles Text
<SparklesText text="Hello World" />

// Shimmer Button
<ShimmerButton>Click Me</ShimmerButton>

// Ripple Effect
<div className="relative">
  <Ripple />
  Your content here
</div>`}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
};