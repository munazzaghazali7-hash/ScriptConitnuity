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
    <div className="card-surface animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-buttons bg-liquid-deep flex items-center justify-center flex-shrink-0">
            <Icon size={18} className={isMajor ? 'text-severity-major' : 'text-severity-minor'} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-category">{categoryLabel}</span>
              <span className={isMajor ? 'badge-major' : 'badge-minor'}>
                {isMajor ? 'Major' : 'Minor'}
              </span>
            </div>
            <p className="text-[12px] text-silver-mist font-sans uppercase tracking-wide">
              Scene {contradiction.scene_a} ↔ Scene {contradiction.scene_b}
            </p>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-buttons bg-liquid-deep hover:bg-[#004d49] text-silver-mist hover:text-white transition-colors flex-shrink-0"
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Description */}
      <p className="text-body text-platinum leading-relaxed mb-6">
        {contradiction.description}
      </p>

      {/* Suggested resolution */}
      {contradiction.suggested_resolution && (
        <div className="flex items-start gap-3 p-4 rounded-cards bg-liquid-deep mb-4">
          <Lightbulb size={16} className="text-lavender-phosphor mt-0.5 flex-shrink-0" />
          <p className="text-sm text-silver-mist">
            {contradiction.suggested_resolution}
          </p>
        </div>
      )}

      {/* Expanded: side-by-side scene excerpts */}
      {expanded && (sceneA || sceneB) && (
        <div className="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
          {sceneA && (
            <div className="p-4 rounded-cards bg-liquid-deep font-sans">
              <p className="text-[10px] uppercase tracking-[1.5px] text-silver-mist mb-3 border-b border-white/5 pb-2">
                scene_{contradiction.scene_a}.txt
              </p>
              <p className="text-[14px] font-medium text-lavender-phosphor mb-2">
                {sceneA.raw_slugline}
              </p>
              <p className="text-[13px] text-silver-mist leading-relaxed line-clamp-4">
                {sceneA.raw_text?.slice(0, 300)}...
              </p>
            </div>
          )}
          {sceneB && (
            <div className="p-4 rounded-cards bg-liquid-deep font-sans">
              <p className="text-[10px] uppercase tracking-[1.5px] text-silver-mist mb-3 border-b border-white/5 pb-2">
                scene_{contradiction.scene_b}.txt
              </p>
              <p className="text-[14px] font-medium text-white mb-2">
                {sceneB.raw_slugline}
              </p>
              <p className="text-[13px] text-silver-mist leading-relaxed line-clamp-4">
                {sceneB.raw_text?.slice(0, 300)}...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
