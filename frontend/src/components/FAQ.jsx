import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What if the agent misses something?',
    a: 'The agent is designed to catch systematic continuity errors — weather mismatches, prop disappearances, wardrobe inconsistencies, and timeline conflicts. However, it works alongside your script supervisor, not as a replacement. Every flag links back to its source scenes so your team can verify. The agent catches the 80% of errors that come from tracking hundreds of details across dozens of scenes — but a human eye is always the final check.',
  },
  {
    q: 'Does it handle non-standard screenplay formats?',
    a: 'Yes. Our parser uses flexible slugline detection (INT./EXT. patterns) and handles variations in formatting — different dash styles, mixed capitalization, numbered scenes, and non-standard scene headers. If a screenplay follows any reasonable industry convention, the parser will find the scene boundaries.',
  },
  {
    q: 'How does the severity rating work?',
    a: 'Major issues are contradictions that would be visible on screen — a prop that should be there but isn\'t, weather that changes impossibly between connected scenes, or a costume that changes in a continuous take. Minor issues are logical inconsistencies that might go unnoticed but could cause problems — like ambiguous timelines or implicit assumptions about time of day.',
  },
  {
    q: 'Can I use this with my own AI model?',
    a: 'Absolutely. The LLM integration is abstracted behind a single function. You can swap in any provider — watsonx/Granite, OpenAI, Anthropic, local models — by changing one environment variable and implementing the provider function. The prompts and response parsing are fully decoupled from the provider.',
  },
  {
    q: 'What happens to my uploaded screenplay?',
    a: 'Your screenplay is processed locally and stored only for the duration of the analysis. It\'s never shared with third parties or used for training. You can delete your data at any time. The continuity database is created per-job and can be cleaned up after your review.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="section bg-liquid-abyss">
      <div className="container-narrow">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="section-eyebrow block mb-4">FAQ</span>
          <h2 className="text-heading text-platinum font-medium">Questions</h2>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="bg-liquid-deep rounded-cards overflow-hidden transition-colors">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-body font-medium text-platinum">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-white flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                  <div>
                    <p className="px-6 pb-6 text-body text-silver-mist leading-relaxed font-sans">
                      {faq.a}
                    </p>
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
