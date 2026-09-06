import { Link } from 'react-router-dom';
import { Terminal, Play } from 'lucide-react';

export default function Hero() {
  return (
    <section className="px-4 pt-24 pb-12 max-sm:pt-20">
      {/* Outer container mimicking Localcan's .lc-fill card */}
      <div className="overflow-hidden rounded-xl bg-[#0b1d0b]">
        <div className="grid border border-white/20 lg:grid-cols-2">
          
          {/* Left Column: Content */}
          <div className="px-12 py-12 max-sm:px-6 max-sm:py-8 flex flex-col justify-center">
            
            {/* Pill */}
            <div className="inline-flex">
              <button type="button" className="group inline-flex cursor-default items-center gap-2 rounded-lg py-1.5 pr-3 pl-3 font-mono text-sm border border-white/20 text-stone-300 hover:text-white transition-colors">
                <Terminal size={14} className="opacity-60 group-hover:opacity-100 transition-opacity text-accent" />
                <span>npm install -g continuity-agent</span>
              </button>
            </div>

            {/* Headline */}
            <h1 className="mt-8 font-mono text-[clamp(2rem,1.5rem+3vw,3.5rem)] font-[350] leading-[1.1] tracking-tighter text-white">
              Catch every continuity error.<br />
              Before you shoot.
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl leading-tight text-balance mt-6 max-w-[38ch] text-stone-300 font-sans">
              Upload your screenplay. Our AI reads it scene-by-scene, builds a continuity database, and flags every weather mismatch and disappearing prop.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link 
                to="/upload" 
                className="inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-stone-200 px-5 py-2.5 rounded-lg font-mono text-sm font-medium transition-colors border border-transparent shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Start building
                <kbd className="grid h-6 w-6 place-items-center rounded-md border-[0.5px] border-black/20 bg-black/5 font-sans text-xs font-semibold opacity-70 ml-2 max-sm:hidden">
                  B
                </kbd>
              </Link>
              
              <Link 
                to="/upload?demo=true" 
                className="inline-flex items-center justify-center gap-2 bg-transparent text-white hover:bg-white/5 px-5 py-2.5 rounded-lg font-mono text-sm font-medium transition-colors border border-white/20"
              >
                View demo
                <kbd className="grid h-6 w-6 place-items-center rounded-md border-[0.5px] border-white/20 bg-white/5 font-sans text-xs font-semibold opacity-70 ml-2 max-sm:hidden">
                  D
                </kbd>
              </Link>
            </div>

            <p className="mt-6 font-mono text-sm text-white/50">
              Free 14-day trial. No credit card required.
            </p>
          </div>

          {/* Right Column: Visual Grid (Mimicking Localcan's split grid visual) */}
          <div className="grid grid-cols-2 border-t border-white/20 max-lg:auto-rows-[minmax(8rem,1fr)] lg:grid-rows-4 lg:border-t-0 lg:border-l relative overflow-hidden">
            
            {/* Background glow graphic inside grid */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/30 rounded-full blur-[80px] pointer-events-none" />

            {/* Grid cells */}
            <div className="grid place-items-center overflow-hidden border-white/10" />
            <div className="grid place-items-center overflow-hidden border-white/10 border-l" />
            
            <div className="grid place-items-center overflow-hidden border-white/10 border-t">
              {/* Decorative element */}
              <div className="w-16 h-16 border border-accent/40 rounded-xl rotate-12 flex items-center justify-center bg-black/40 backdrop-blur-md">
                <Play size={20} className="text-accent ml-1" />
              </div>
            </div>
            <div className="grid place-items-center overflow-hidden border-white/10 border-l border-t" />
            
            <div className="grid place-items-center overflow-hidden border-white/10 border-t max-lg:hidden" />
            <div className="grid place-items-center overflow-hidden border-white/10 border-l border-t max-lg:hidden">
              {/* Decorative element */}
              <div className="w-20 h-20 rounded-full border border-accent-purple/30 bg-accent-purple/5 backdrop-blur-md" />
            </div>
            
            <div className="grid place-items-center overflow-hidden border-white/10 border-t max-lg:hidden" />
            <div className="grid place-items-center overflow-hidden border-white/10 border-l border-t max-lg:hidden" />
          </div>

        </div>
      </div>
    </section>
  );
}
