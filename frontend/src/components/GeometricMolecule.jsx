export default function GeometricMolecule({ className = '' }) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full max-w-[400px] h-auto ${className}`}
    >
      <g stroke="var(--color-silver-mist)" strokeWidth="1" opacity="0.3">
        {/* Connection Lines */}
        <line x1="200" y1="50" x2="100" y2="150" />
        <line x1="200" y1="50" x2="300" y2="150" />
        <line x1="100" y1="150" x2="100" y2="250" />
        <line x1="300" y1="150" x2="300" y2="250" />
        <line x1="100" y1="250" x2="200" y2="350" />
        <line x1="300" y1="250" x2="200" y2="350" />
        <line x1="100" y1="150" x2="200" y2="200" />
        <line x1="300" y1="150" x2="200" y2="200" />
        <line x1="100" y1="250" x2="200" y2="200" />
        <line x1="300" y1="250" x2="200" y2="200" />
        <line x1="200" y1="50" x2="200" y2="200" />
        <line x1="200" y1="350" x2="200" y2="200" />
      </g>

      <g fill="var(--color-platinum)">
        {/* Nodes */}
        <circle cx="200" cy="50" r="4" />
        <circle cx="100" cy="150" r="4" />
        <circle cx="300" cy="150" r="4" />
        <circle cx="100" cy="250" r="4" />
        <circle cx="300" cy="250" r="4" />
        <circle cx="200" cy="350" r="4" />
        <circle cx="200" cy="200" r="6" fill="var(--color-lavender-phosphor)" />
      </g>
    </svg>
  );
}
