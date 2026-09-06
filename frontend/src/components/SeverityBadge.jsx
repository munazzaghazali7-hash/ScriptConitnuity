export default function SeverityBadge({ severity }) {
  if (severity === 'major') {
    return (
      <span className="badge-major">
        <span className="w-1.5 h-1.5 rounded-full bg-severity-major" />
        Major
      </span>
    );
  }

  return (
    <span className="badge-minor">
      <span className="w-1.5 h-1.5 rounded-full bg-severity-minor" />
      Minor
    </span>
  );
}
