import {
  CloudRain,
  Clock,
  Package,
  Shirt,
  Users,
  MapPin,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';
import { useState } from 'react';

const categoryIcons = {
  weather: CloudRain,
  timeline: Clock,
  props: Package,
  wardrobe: Shirt,
  character: Users,
  location: MapPin,
  other: HelpCircle,
};

const categoryLabels = {
  weather: 'Weather',
  timeline: 'Timeline',
  props: 'Props',
  wardrobe: 'Wardrobe',
  character: 'Character',
  location: 'Location',
  other: 'Other',
};

export default function ContradictionCard({ contradiction, scenes }) {
  const [expanded, setExpanded] = useState(false);

  const Icon = categoryIcons[contradiction.category] || HelpCircle;
  const categoryLabel = categoryLabels[contradiction.category] || 'Other';
  const isMajor = contradiction.severity === 'major';

  const sceneA = scenes?.find((s) => s.scene_number === contradiction.scene_a);
  const sceneB = scenes?.find((s) => s.scene_number === contradiction.scene_b);

  return (
    <div className="card-hover bg-[#161616] animate-fade-up border border-white/10 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
            <Icon size={18} className={isMajor ? 'text-severity-major' : 'text-severity-minor'} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-category">{categoryLabel}</span>
              <span className={isMajor ? 'badge-major' : 'badge-minor'}>
                <span className={`w-1.5 h-1.5 rounded-full ${isMajor ? 'bg-severity-major' : 'bg-severity-minor'}`} />
                {isMajor ? 'Major' : 'Minor'}
              </span>
            </div>
            <p className="text-body-sm text-text-muted font-mono">
              [SCENE {contradiction.scene_a}] ↔ [SCENE {contradiction.scene_b}]
            </p>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-text-muted hover:text-white transition-colors flex-shrink-0"
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Description */}
      <p className="text-body text-text-primary leading-relaxed mb-4 font-sans">
        {contradiction.description}
      </p>

      {/* Suggested resolution */}
      {contradiction.suggested_resolution && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-accent/5 border border-accent/20 mb-4">
          <Lightbulb size={16} className="text-accent mt-0.5 flex-shrink-0 drop-shadow-[0_0_5px_rgba(1,179,159,0.5)]" />
          <p className="text-body-sm text-accent font-medium">
            {contradiction.suggested_resolution}
          </p>
        </div>
      )}

      {/* Expanded: side-by-side scene excerpts */}
      {expanded && (sceneA || sceneB) && (
        <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
          {sceneA && (
            <div className="p-4 rounded-xl bg-black border border-white/5 font-mono">
              <p className="text-xs text-text-muted mb-2 border-b border-white/5 pb-2">
                &gt; scene_{contradiction.scene_a}.txt
              </p>
              <p className="text-sm font-medium text-accent mb-1">
                {sceneA.raw_slugline}
              </p>
              <p className="text-xs text-text-secondary leading-relaxed line-clamp-4">
                {sceneA.raw_text?.slice(0, 300)}...
              </p>
              {sceneA.weather && (
                <p className="text-xs text-accent mt-3 opacity-80">
                  <span className="text-text-muted">weather:</span> {sceneA.weather}
                </p>
              )}
            </div>
          )}
          {sceneB && (
            <div className="p-4 rounded-xl bg-black border border-white/5 font-mono">
              <p className="text-xs text-text-muted mb-2 border-b border-white/5 pb-2">
                &gt; scene_{contradiction.scene_b}.txt
              </p>
              <p className="text-sm font-medium text-accent-purple mb-1">
                {sceneB.raw_slugline}
              </p>
              <p className="text-xs text-text-secondary leading-relaxed line-clamp-4">
                {sceneB.raw_text?.slice(0, 300)}...
              </p>
              {sceneB.weather && (
                <p className="text-xs text-accent-purple mt-3 opacity-80">
                  <span className="text-text-muted">weather:</span> {sceneB.weather}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
