import { FileText, Sparkles, LayoutList } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: FileText,
    color: 'text-accent',
    bgGlow: 'shadow-[0_0_40px_rgba(1,179,159,0.15)]',
    title: 'Upload your script',
    description:
      'Drop your screenplay PDF. Our parser automatically detects scene boundaries, handles non-standard sluglines, and breaks the script down into processable units.',
  },
  {
    number: '02',
    icon: Sparkles,
    color: 'text-accent-purple',
    bgGlow: 'shadow-[0_0_40px_rgba(169,125,231,0.15)]',
    title: 'Agent analysis',
    description:
      'Our LLM agent reads each scene, extracting characters, props, wardrobe, weather, and time of day, building a stateful continuity database as it goes.',
  },
  {
    number: '03',
    icon: LayoutList,
    color: 'text-accent-green',
    bgGlow: 'shadow-[0_0_40px_rgba(74,179,90,0.15)]',
    title: 'Review the report',
    description:
      'Get a prioritized list of contradictions. See exactly where a character changes clothes mid-scene or when a prop disappears, complete with source scene quotes.',
  },
];

export default function HowItWorks() {
  return (
    <section className="section bg-bg-alt relative border-y border-white/10">
      <div className="container-main">
        {/* Header */}
        <div className="mb-16">
          <h2 className="text-h2 text-text-primary mb-4">How it works</h2>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6 stagger-children">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className={`relative flex flex-col h-full overflow-hidden p-8 rounded-2xl bg-[#161616] border border-white/10 transition-colors hover:border-white/20 ${step.bgGlow}`}
              >
                <div className="flex items-start justify-between mb-8">
                  <span className={`font-mono text-5xl font-[350] opacity-50 ${step.color}`}>
                    {step.number}
                  </span>
                  <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center`}>
                    <Icon size={20} className={step.color} />
                  </div>
                </div>

                <div className="mt-auto">
                  <h3 className="text-h3 text-text-primary mb-3 font-mono">
                    {step.title}
                  </h3>
                  <p className="text-body text-text-secondary">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
