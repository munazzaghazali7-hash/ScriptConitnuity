import React from 'react';
import { Link } from 'react-router-dom';
import ParticleSphere from './ParticleSphere';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-start overflow-hidden w-full bg-liquid-abyss pt-[120px]">
      
      {/* Content */}
      <div className="relative z-10 container-main flex flex-col items-center text-center px-4">
        
        {/* Eyebrow Label */}
        <div className="mb-6">
          <span className="section-eyebrow">ScriptContinuity</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-display max-sm:text-heading-lg max-md:text-[72px] font-medium text-platinum leading-none tracking-[-0.04em] max-w-[15ch] mb-8">
          Catch every error before you shoot.
        </h1>

        {/* Subtitle */}
        <p className="text-body text-silver-mist max-w-[46ch] mx-auto mb-12">
          Upload your screenplay. Our AI reads it scene-by-scene, builds a continuity database, and flags every weather mismatch and disappearing prop in seconds.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link to="/upload" className="btn-primary min-w-[200px]">
            Start building
          </Link>
          <Link to="/upload?demo=true" className="btn-ghost">
            View demo
          </Link>
        </div>

      </div>

      {/* Background Particle Sphere - Positioned below text */}
      <div className="w-full flex-grow relative mt-12 min-h-[400px]">
        <ParticleSphere />
      </div>
    </section>
  );
}
