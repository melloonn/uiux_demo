import { PIN_COLOR } from '../../data/events.js';

export function MapPin({ pin, selected, lang, onTap }) {
  const color = PIN_COLOR[pin.category] ?? '#D94F30';
  const label = lang === 'zh' ? pin.labelZh : pin.labelEn?.slice(0, 1) ?? '?';
  const size = 36;

  return (
    <g
      data-pin
      transform={`translate(${pin.mapX ?? pin.x}, ${pin.mapY ?? pin.y})`}
      style={{ cursor: 'pointer' }}
      onClick={(e) => { e.stopPropagation(); onTap?.(pin.id); }}
    >
      {selected && (
        <circle r="32" fill={color} opacity="0.2">
          <animate attributeName="r" from="22" to="36" dur="1.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.28" to="0" dur="1.4s" repeatCount="indefinite" />
        </circle>
      )}
      <g style={{ transform: selected ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s' }}>
        <path
          d={`M ${-size / 2} ${-size / 2}
              L ${size / 2} ${-size / 2}
              Q ${size / 2 + 4} ${-size / 2} ${size / 2 + 4} ${-size / 2 + 4}
              L ${size / 2 + 4} ${size / 2 - 4}
              Q ${size / 2 + 4} ${size / 2} ${size / 2} ${size / 2}
              L 4 ${size / 2} L 0 ${size / 2 + 8} L -4 ${size / 2}
              L ${-size / 2} ${size / 2}
              Q ${-size / 2 - 4} ${size / 2} ${-size / 2 - 4} ${size / 2 - 4}
              L ${-size / 2 - 4} ${-size / 2 + 4}
              Q ${-size / 2 - 4} ${-size / 2} ${-size / 2} ${-size / 2} Z`}
          fill={color}
          stroke="#fff"
          strokeWidth="2.5"
        />
        <text
          y="5" textAnchor="middle"
          fontFamily="'Plus Jakarta Sans','Noto Sans TC',system-ui"
          fontSize={lang === 'zh' ? 16 : 13}
          fontWeight="800"
          fill="#fff"
        >
          {label}
        </text>
      </g>
    </g>
  );
}
