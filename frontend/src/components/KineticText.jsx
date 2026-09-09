export default function KineticText({ text = 'CONTINUITY' }) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full overflow-hidden pointer-events-none select-none flex justify-center opacity-10">
      <div 
        className="text-[295px] font-medium leading-none whitespace-nowrap text-[var(--color-platinum)]"
        style={{ letterSpacing: '-0.046em' }}
      >
        {text}
      </div>
    </div>
  );
}
