import { Link2, ShieldCheck, Sparkles } from 'lucide-react';
import StatsCounter from './StatsCounter';

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
    <section className="section bg-liquid-deep">
      <div className="container-main">
        
        <StatsCounter />

        {/* Section header */}
        <div className="text-center mb-16">
          <span className="section-eyebrow block mb-4">Integrity</span>
          <h2 className="text-heading text-platinum font-medium">
            Answers you can verify
          </h2>
          <p className="text-body text-silver-mist max-w-lg mx-auto mt-4">
            Every flagged contradiction links back to its exact source scenes and lines — because trust requires transparency.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-content mx-auto stagger-children">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="card-feature text-center md:text-left flex flex-col items-center md:items-start group">
                <div className="w-12 h-12 rounded-buttons bg-liquid-kelp flex items-center justify-center mb-6 transition-colors">
                  <Icon size={22} className="text-lavender-phosphor" />
                </div>
                <h3 className="text-subheading text-platinum mb-3">{feature.title}</h3>
                <p className="text-body text-silver-mist leading-relaxed">
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
