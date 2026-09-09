import { ArrowUpRight, CloudRain, ShieldAlert, AlertTriangle } from 'lucide-react';
import GeometricMolecule from './GeometricMolecule';

const examples = [
  {
    icon: CloudRain,
    category: 'Weather',
    severity: 'major',
    title: 'Scene 3 ↔ Scene 9',
    description: 'Scene 3 establishes a torrential downpour. Scene 9 is a "same day" continuous shot, but describes "blistering afternoon sun."',
    quoteA: 'EXT. ALLEY - DAY\nRain sheets down, washing the blood into the gutter.',
    quoteB: 'EXT. STREET - DAY (CONTINUOUS)\nThe blistering afternoon sun beats down on his face.',
  },
  {
    icon: ShieldAlert,
    category: 'Wardrobe',
    severity: 'major',
    title: 'Scene 11 ↔ Scene 12',
    description: 'Character enters the hallway wearing a heavy coat, but arrives in the kitchen wearing only a t-shirt (no time elapsed).',
    quoteA: 'INT. HALLWAY - NIGHT\nJack shakes the snow off his heavy wool coat.',
    quoteB: 'INT. KITCHEN - CONTINUOUS\nJack grabs a beer, his white t-shirt clinging to him.',
  },
  {
    icon: AlertTriangle,
    category: 'Props',
    severity: 'minor',
    title: 'Scene 4 ↔ Scene 8',
    description: 'The murder weapon (revolver) is left on the desk in Scene 4, but is mysteriously missing when the police arrive in Scene 8.',
    quoteA: 'INT. OFFICE - NIGHT\nHe leaves the revolver on the mahogany desk and walks out.',
    quoteB: 'INT. OFFICE - LATER\nThe detectives scan the empty mahogany desk. Nothing.',
  },
];

export default function ExampleCards() {
  return (
    <section className="section bg-liquid-abyss">
      <div className="container-main">
        {/* Header */}
        <div className="mb-12 md:mb-20 text-center md:text-left max-w-2xl">
          <span className="section-eyebrow block mb-4">Intelligence</span>
          <h2 className="text-[61px] leading-none tracking-[-2.44px] text-platinum mb-6 font-medium">
            The details you might miss
          </h2>
          <p className="text-[16px] leading-[1.4] text-silver-mist">
            It's impossible to hold an entire 120-page world state in your head. 
            The agent tracks every prop, character, and weather state to catch what slips through the cracks.
          </p>
        </div>

        {/* Asymmetric Layout */}
        <div className="grid md:grid-cols-12 gap-12 lg:gap-24 items-start">
          
          {/* Left Column: Feature Row Cards */}
          <div className="md:col-span-7 flex flex-col gap-4 stagger-children">
            {examples.map((ex, i) => {
              const isMajor = ex.severity === 'major';
              return (
                <div key={i} className="card-feature border-b border-white/5 last:border-b-0 rounded-none md:rounded-cards md:border-b-0 md:bg-[var(--color-liquid-kelp)]/0 hover:md:bg-[var(--color-liquid-kelp)]/50 transition-colors group flex items-start gap-6">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-[24px] text-platinum font-medium tracking-tight">
                        {ex.category}
                      </h3>
                      <span className={isMajor ? 'badge-major' : 'badge-minor'}>
                        {isMajor ? 'Major' : 'Minor'}
                      </span>
                    </div>
                    
                    <p className="text-[16px] leading-[1.4] text-silver-mist mb-6 max-w-md">
                      {ex.description}
                    </p>

                    <div className="space-y-3 font-matter text-[13px] text-silver-mist leading-[1.5] opacity-80 border-l border-white/10 pl-4">
                      {ex.quoteA.split('\n').map((line, j) => (
                        <p key={`a-${j}`} className={j === 0 ? 'text-[var(--color-lavender-phosphor)] uppercase tracking-wide' : ''}>{line}</p>
                      ))}
                      <div className="h-2"></div>
                      {ex.quoteB.split('\n').map((line, j) => (
                        <p key={`b-${j}`} className={j === 0 ? 'text-white uppercase tracking-wide' : ''}>{line}</p>
                      ))}
                    </div>
                  </div>

                  {/* Arrow Icon Button */}
                  <button className="w-[32px] h-[32px] rounded-[6px] bg-[rgba(3,81,75,0.5)] flex items-center justify-center flex-shrink-0 transition-colors hover:bg-[rgba(3,81,75,0.8)] mt-2">
                    <ArrowUpRight size={18} className="text-white" />
                  </button>

                </div>
              );
            })}
          </div>

          {/* Right Column: Geometric Molecule */}
          <div className="md:col-span-5 relative hidden md:block sticky top-32">
            <GeometricMolecule className="mx-auto" />
          </div>

        </div>
      </div>
    </section>
  );
}
