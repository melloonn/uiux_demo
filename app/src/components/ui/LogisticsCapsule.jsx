import { Train } from 'lucide-react';

export function LogisticsCapsule({ dist, stops, price, priceZh, free, lang = 'en' }) {
  const km = lang === 'zh' ? `${dist.toFixed(1)} 公里` : `${dist.toFixed(1)} km`;
  const stopsLabel = stops != null
    ? (lang === 'zh'
      ? (stops === 1 ? '1 站' : `${stops} 站`)
      : (stops === 1 ? '1 stop' : `${stops} stops`))
    : null;
  const priceLabel = lang === 'zh' ? priceZh : price;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {/* distance */}
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 9px 3px 6px', borderRadius: 9999,
        background: '#F4EDDF',
        fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700, color: '#6B5335',
      }}>
        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#D94F30' }} />
        {km}
      </span>
      {/* MRT stops — only shown when accessible */}
      {stopsLabel != null && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 9px', borderRadius: 9999,
          background: '#1A1A1A', color: '#fff',
          fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700,
        }}>
          <Train size={12} color="#fff" />
          {stopsLabel}
        </span>
      )}
      {/* price */}
      <span style={{
        padding: '3px 9px', borderRadius: 9999,
        background: free ? '#7FA491' : '#E8B04B',
        color: '#fff',
        fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 800, letterSpacing: 0.1,
      }}>
        {priceLabel}
      </span>
    </div>
  );
}
