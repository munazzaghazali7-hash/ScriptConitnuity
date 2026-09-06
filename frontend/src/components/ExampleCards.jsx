import { AlertTriangle, CloudRain, ShieldAlert } from 'lucide-react';

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
    <section className="section bg-bg">
      <div className="container-main">
        {/* Header */}
        <div className="mb-16">
          <h2 className="text-h2 text-text-primary mb-4 font-mono text-center md:text-left">
            The details you might miss
          </h2>
          <p className="text-body-lg text-text-secondary max-w-2xl text-center md:text-left font-sans">
            It's impossible to hold an entire 120-page world state in your head. 
            The agent tracks every prop, character, and weather state to catch what slips through the cracks.
          </p>
        </div>

        {/* Masonry-ish grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {examples.map((ex, i) => {
            const Icon = ex.icon;
            const isMajor = ex.severity === 'major';
            return (
              <div key={i} className="card bg-[#161616] flex flex-col hover:border-white/20 transition-colors group">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors`}>
                    <Icon size={18} className={isMajor ? 'text-severity-major' : 'text-severity-minor'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge-category border-white/10">{ex.category}</span>
                      <span className={isMajor ? 'badge-major' : 'badge-minor'}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isMajor ? 'bg-severity-major' : 'bg-severity-minor'}`} />
                        {isMajor ? 'Major' : 'Minor'}
                      </span>
                    </div>
                    <p className="text-body-sm font-mono text-text-muted">{ex.title}</p>
                  </div>
                </div>

                <p className="text-body text-text-primary mb-6 font-sans">
                  {ex.description}
                </p>

                <div className="mt-auto space-y-3 pt-4 border-t border-white/10">
                  <div className="p-3 rounded-lg bg-bg font-mono text-xs text-text-secondary border border-white/5">
                    {ex.quoteA.split('\n').map((line, j) => (
                      <p key={j} className={j === 0 ? 'text-accent font-medium mb-1' : ''}>{line}</p>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg bg-bg font-mono text-xs text-text-secondary border border-white/5">
                    {ex.quoteB.split('\n').map((line, j) => (
                      <p key={j} className={j === 0 ? 'text-accent-purple font-medium mb-1' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
