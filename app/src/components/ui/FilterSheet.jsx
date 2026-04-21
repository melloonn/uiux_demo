import { X } from 'lucide-react';

const ALL_PRICES = ['free', '$', '$$', '$$$'];

const TIME_OPTIONS = [
  { k: 'all',     en: 'Any time',      zh: '任何時間' },
  { k: 'today',   en: 'Today',         zh: '今天' },
  { k: 'weekend', en: 'This weekend',  zh: '本週末' },
  { k: 'week',    en: 'Next 7 days',   zh: '未來7天' },
  { k: 'month',   en: 'This month',    zh: '本月' },
];

const CATS = [
  { k: 'festivals',        color: '#D94F30' },
  { k: 'night-markets',    color: '#E8B04B' },
  { k: 'live-music',       color: '#5B4B8A' },
  { k: 'temples-heritage', color: '#8B4A2F' },
  { k: 'art-markets',      color: '#7FA491' },
  { k: 'exhibitions',      color: '#6B6B6B' },
];

const SHOW_OPTIONS = [
  { k: 'all',     en: 'All',            zh: '全部' },
  { k: 'saved',   en: '❤️ Saved only',  zh: '❤️ 只看收藏' },
  { k: 'unsaved', en: 'Not yet saved',  zh: '未收藏' },
];

export const DEFAULT_MAP_FILTERS    = { distance: 10,  prices: [...ALL_PRICES], categories: [], time: 'all' };
export const DEFAULT_HOME_FILTERS   = { distance: 30,  prices: [...ALL_PRICES], categories: [], time: 'all', show: 'all' };

/**
 * Shared filter bottom sheet.
 *
 * Props:
 *   open            – boolean, controls visibility
 *   lang            – 'en' | 'zh'
 *   draft           – current draft filter state
 *   setDraft        – setter for draft state
 *   onApply         – called when "Apply" pressed
 *   onClose         – called when overlay/close tapped
 *   onReset         – called when "Reset all" pressed
 *   maxDistance     – slider max (default 30, Map passes 10)
 *   showSavedFilter – shows the "Show" row; Home uses true, Map false
 */
export function FilterSheet({
  open,
  lang,
  draft,
  setDraft,
  onApply,
  onClose,
  onReset,
  maxDistance = 30,
  showSavedFilter = false,
}) {
  if (!open) return null;

  const t = (en, zh) => lang === 'zh' ? zh : en;

  const catLabels = {
    festivals:          t('Festivals', '節慶'),
    'night-markets':    t('Markets',   '夜市'),
    'live-music':       t('Live Music','演出'),
    'temples-heritage': t('Heritage',  '廟宇'),
    'art-markets':      t('Art',       '市集'),
    exhibitions:        t('Exhibits',  '展覽'),
  };

  const distLabel = draft.distance >= maxDistance
    ? t('Any', '任意')
    : `${draft.distance.toFixed(1)} km`;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(26,15,10,0.45)' }}
      />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 41,
        background: 'rgba(255,253,248,0.94)',
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '10px 18px 28px',
        boxShadow: '0 -24px 60px rgba(26,15,10,0.24)',
        maxHeight: '88vh', overflowY: 'auto',
      }}>
        {/* drag handle */}
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'rgba(26,15,10,0.2)', margin: '6px auto 14px' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontFamily: '"Plus Jakarta Sans"', fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: '#1A1A1A' }}>
            {t('Filters', '篩選')}
          </h3>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', background: 'rgba(26,15,10,0.08)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={14} color="#1A1A1A" />
          </button>
        </div>

        {/* Category */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ margin: '0 0 10px', fontFamily: '"Plus Jakarta Sans"', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>
            {t('Category', '活動類型')}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATS.map(c => {
              const active = draft.categories.includes(c.k);
              return (
                <button key={c.k} onClick={() => setDraft(d => ({
                  ...d,
                  categories: active
                    ? d.categories.filter(x => x !== c.k)
                    : [...d.categories, c.k],
                }))} style={{
                  height: 34, padding: '0 14px', borderRadius: 9999,
                  background: active ? c.color : 'rgba(26,15,10,0.06)',
                  color: active ? '#fff' : '#1A1A1A',
                  border: active ? `2px solid ${c.color}` : '2px solid transparent',
                  cursor: 'pointer',
                  fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
                  fontSize: 13, fontWeight: 700, transition: 'all 0.18s',
                }}>
                  {catLabels[c.k]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ margin: '0 0 10px', fontFamily: '"Plus Jakarta Sans"', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>
            {t('Price', '價格')}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {ALL_PRICES.map(p => {
              const active = draft.prices.includes(p);
              const label = p === 'free' ? t('Free', '免費') : p;
              return (
                <button key={p} onClick={() => setDraft(d => ({
                  ...d,
                  prices: active
                    ? d.prices.filter(x => x !== p)
                    : [...d.prices, p],
                }))} style={{
                  flex: 1, height: 36, borderRadius: 10,
                  background: active ? '#1A1A1A' : 'rgba(26,15,10,0.06)',
                  color: active ? '#fff' : '#1A1A1A',
                  border: 'none', cursor: 'pointer',
                  fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 700,
                  transition: 'all 0.18s',
                }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time */}
        <div style={{ marginBottom: 22 }}>
          <p style={{ margin: '0 0 10px', fontFamily: '"Plus Jakarta Sans"', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>
            {t('Time', '時間')}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TIME_OPTIONS.map(opt => {
              const active = draft.time === opt.k;
              return (
                <button key={opt.k} onClick={() => setDraft(d => ({ ...d, time: opt.k }))} style={{
                  height: 34, padding: '0 14px', borderRadius: 9999,
                  background: active ? '#1A1A1A' : 'rgba(26,15,10,0.06)',
                  color: active ? '#fff' : '#1A1A1A',
                  border: 'none', cursor: 'pointer',
                  fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui',
                  fontSize: 13, fontWeight: 700, transition: 'all 0.18s',
                }}>
                  {lang === 'zh' ? opt.zh : opt.en}
                </button>
              );
            })}
          </div>
        </div>

        {/* Distance */}
        <div style={{ marginBottom: showSavedFilter ? 22 : 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: '"Plus Jakarta Sans"', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>
            <span>{t('Distance', '距離')}</span>
            <span style={{ color: '#D94F30' }}>{distLabel}</span>
          </div>
          <input
            type="range" min="1" max={maxDistance} step="0.5"
            value={draft.distance}
            onChange={e => setDraft(d => ({ ...d, distance: parseFloat(e.target.value) }))}
            style={{ width: '100%', accentColor: '#D94F30' }}
          />
        </div>

        {/* Show (Home only) */}
        {showSavedFilter && (
          <div style={{ marginBottom: 8 }}>
            <p style={{ margin: '0 0 10px', fontFamily: '"Plus Jakarta Sans"', fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>
              {t('Show', '顯示')}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {SHOW_OPTIONS.map(opt => {
                const active = (draft.show ?? 'all') === opt.k;
                return (
                  <button key={opt.k} onClick={() => setDraft(d => ({ ...d, show: opt.k }))} style={{
                    flex: 1, height: 36, borderRadius: 10, padding: '0 6px',
                    background: active ? '#1A1A1A' : 'rgba(26,15,10,0.06)',
                    color: active ? '#fff' : '#1A1A1A',
                    border: 'none', cursor: 'pointer',
                    fontFamily: '"Plus Jakarta Sans"', fontSize: 11, fontWeight: 700,
                    transition: 'all 0.18s',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {lang === 'zh' ? opt.zh : opt.en}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={onReset} style={{
            flex: '0 0 32%', height: 48, borderRadius: 14,
            background: 'rgba(26,15,10,0.06)', border: 'none', cursor: 'pointer',
            fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 700, color: '#1A1A1A',
          }}>
            {t('Reset all', '重設全部')}
          </button>
          <button onClick={onApply} style={{
            flex: 1, height: 48, borderRadius: 14,
            background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: '"Plus Jakarta Sans"', fontSize: 14, fontWeight: 800,
          }}>
            {t('Apply filters', '套用篩選')}
          </button>
        </div>
      </div>
    </>
  );
}
