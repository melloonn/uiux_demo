import { useState } from 'react';
import { CalendarDays, X } from 'lucide-react';

function buildDateStrip() {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesZh = ['日', '一', '二', '三', '四', '五', '六'];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      key: i === 0 ? 'today' : d.toISOString().slice(0, 10),
      dayEn: i === 0 ? 'Today' : dayNames[d.getDay()],
      dayZh: i === 0 ? '今天' : dayNamesZh[d.getDay()],
      dateNum: d.getDate(),
    });
  }
  return days;
}

export const DATE_STRIP = buildDateStrip();

export const TIME_SLOTS = [
  { k: 'morning',   en: '☀️ Morning',   zh: '☀️ 上午', sub: '9am – 12pm' },
  { k: 'afternoon', en: '🌤 Afternoon',  zh: '🌤 下午', sub: '12pm – 5pm' },
  { k: 'evening',   en: '🌆 Evening',    zh: '🌆 傍晚', sub: '5pm – 9pm' },
  { k: 'night',     en: '🌙 Night',      zh: '🌙 深夜', sub: '9pm+' },
];

export const TIME_SLOT_HOURS = {
  morning:   '09',
  afternoon: '12',
  evening:   '17',
  night:     '21',
};

export function PlanPicker({
  lang,
  initialDate = 'today',
  initialTime = 'afternoon',
  onConfirm,
  onClose,
  confirmLabel,
  zOffset = 50,
}) {
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);

  const label = confirmLabel ?? (lang === 'zh' ? '確認加入計畫' : 'Confirm & Add to Plan');

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, zIndex: zOffset, background: 'rgba(0,0,0,0.45)' }}
      />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: zOffset + 1,
        background: 'rgba(255,253,248,0.98)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '10px 0 32px',
        boxShadow: '0 -16px 40px rgba(26,15,10,0.18)',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(26,15,10,0.18)', margin: '6px auto 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarDays size={18} color="#D94F30" />
            <div>
              <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>
                {lang === 'zh' ? '選擇日期與時段' : 'Pick a date & time'}
              </div>
              <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, color: '#8A6F4A', marginTop: 1 }}>
                {lang === 'zh' ? '活動將加入你的計畫行程' : 'Event will be added to your plan'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(26,15,10,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={14} color="#1A1A1A" />
          </button>
        </div>

        {/* Date strip */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', padding: '4px 20px 12px' }}>
          {DATE_STRIP.map(d => {
            const isActive = date === d.key;
            return (
              <button key={d.key} onClick={() => setDate(d.key)} style={{
                flexShrink: 0, minWidth: 52, padding: '8px 12px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: isActive ? '#D94F30' : 'rgba(26,15,10,0.06)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'all 0.18s',
              }}>
                <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 10, fontWeight: 700, color: isActive ? 'rgba(255,255,255,0.8)' : '#8A6F4A', textTransform: 'uppercase' }}>
                  {lang === 'zh' ? d.dayZh : d.dayEn}
                </span>
                <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 18, fontWeight: 900, color: isActive ? '#fff' : '#1A1A1A', lineHeight: 1 }}>
                  {d.dateNum}
                </span>
              </button>
            );
          })}
        </div>

        {/* Time slots */}
        <div style={{ padding: '0 20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {TIME_SLOTS.map(ts => {
            const isActive = time === ts.k;
            return (
              <button key={ts.k} onClick={() => setTime(ts.k)} style={{
                padding: '10px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left',
                background: isActive ? '#1A1A1A' : 'rgba(26,15,10,0.05)',
                transition: 'all 0.18s',
              }}>
                <div style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC"', fontSize: 13, fontWeight: 700, color: isActive ? '#fff' : '#1A1A1A' }}>
                  {lang === 'zh' ? ts.zh : ts.en}
                </div>
                <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 11, color: isActive ? 'rgba(255,255,255,0.6)' : '#8A6F4A', marginTop: 2 }}>
                  {ts.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm */}
        <div style={{ padding: '0 20px' }}>
          <button
            onClick={() => onConfirm({ dateKey: date, timeSlot: time })}
            style={{
              width: '100%', height: 50, borderRadius: 14,
              background: '#D94F30', color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: '"Plus Jakarta Sans", "Noto Sans TC"', fontSize: 15, fontWeight: 800,
              boxShadow: '0 4px 20px rgba(217,79,48,0.4)',
            }}
          >
            {label}
          </button>
        </div>
      </div>
    </>
  );
}
