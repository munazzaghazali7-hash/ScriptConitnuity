import { Link2, ShieldCheck, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Link2,
    title: 'Every flag links to its source',
    description:
      'Every contradiction shows the exact conflicting scenes side-by-side with quoted text, so you can verify any flag in one click — no hunting through pages.',
  },
  {
    icon: ShieldCheck,
    title: 'Human-in-the-loop by design',
    description:
      'The agent flags and suggests — it never silently fixes. You stay in control. Each issue includes a plain-English explanation for the script supervisor.',
  },
  {
    icon: Sparkles,
    title: 'Catches what humans miss',
    description:
      'From weather mismatches across 80 pages to a prop that quietly disappears between scenes — the agent tracks the entire continuity state across every scene.',
  },
];

export default function TrustSection() {
  return (
    <section className="section bg-bg-alt border-t border-white/10">
      <div className="container-main">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-h2 text-text-primary mb-4 font-mono">
            Answers you can verify
          </h2>
          <p className="text-body-lg text-text-secondary max-w-lg mx-auto font-sans">
            Every flagged contradiction links back to its exact source scenes and lines — because trust requires transparency.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-content mx-auto stagger-children">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="text-center md:text-left flex flex-col items-center md:items-start group">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:bg-white/10 transition-colors">
                  <Icon size={22} className="text-accent" />
                </div>
                <h3 className="text-h3 text-text-primary mb-3 font-mono">{feature.title}</h3>
                <p className="text-body text-text-secondary leading-relaxed font-sans">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
