export default function StatsCounter() {
  const stats = [
    { label: 'SCENES ANALYZED', value: '1M+' },
    { label: 'CONTRADICTIONS FOUND', value: '820K' },
    { label: 'HOURS SAVED', value: '50K+' },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-12 max-w-[1000px] mx-auto text-center md:text-left my-24 border-y border-white/5 py-16">
      {stats.map((stat, index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="text-[86px] leading-none font-medium text-[var(--color-lavender-phosphor)] tracking-[-0.046em]">
            {stat.value}
          </div>
          <div className="text-[13px] font-matter uppercase tracking-[0.055em] text-[var(--color-liquid-mist)]">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
