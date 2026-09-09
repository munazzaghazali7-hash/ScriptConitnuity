import { ArrowUpRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Upload your script',
    description:
      'Drop your screenplay PDF. Our parser automatically detects scene boundaries, handles non-standard sluglines, and breaks the script down into processable units.',
  },
  {
    number: '02',
    title: 'Agent analysis',
    description:
      'Our LLM agent reads each scene, extracting characters, props, wardrobe, weather, and time of day, building a stateful continuity database as it goes.',
  },
  {
    number: '03',
    title: 'Review the report',
    description:
      'Get a prioritized list of contradictions. See exactly where a character changes clothes mid-scene or when a prop disappears, complete with source scene quotes.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section relative">
      <div className="container-main">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-heading text-platinum mb-4 font-medium">How it works</h2>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6 stagger-children">
          {steps.map((step, i) => (
            <div
              key={i}
              className="card-surface flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-8">
                <span className="font-sans text-[48px] leading-none text-lavender-phosphor tracking-tight">
                  {step.number}
                </span>
                <div className="btn-icon">
                  <ArrowUpRight size={18} className="text-white" />
                </div>
              </div>

              <div className="mt-auto">
                <h3 className="text-subheading text-platinum mb-3 font-medium">
                  {step.title}
                </h3>
                <p className="text-body text-silver-mist">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
