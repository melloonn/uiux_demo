import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';

const INTERESTS = [
  { k: 'festivals',        icon: '🏮', en: 'Festivals',    zh: '節慶活動', color: '#D94F30' },
  { k: 'night-markets',    icon: '🍜', en: 'Night Markets', zh: '夜市美食', color: '#E8B04B' },
  { k: 'live-music',       icon: '🎵', en: 'Live Music',   zh: '現場音樂', color: '#5B4B8A' },
  { k: 'temples-heritage', icon: '⛩️', en: 'Heritage',     zh: '廟宇古蹟', color: '#8B4A2F' },
  { k: 'art-markets',      icon: '🎨', en: 'Art Markets',  zh: '藝術市集', color: '#7FA491' },
  { k: 'exhibitions',      icon: '🖼️', en: 'Exhibitions',  zh: '展覽藝術', color: '#6B6B6B' },
];

const BUDGETS = [
  { k: 'free',  en: '🤩 Free only',   zh: '🤩 只要免費',  sub: { en: 'Zero cost events', zh: '零費用活動' } },
  { k: '$',     en: '😊 Budget',       zh: '😊 平價',      sub: { en: 'Under NT$300',      zh: '300元以下' } },
  { k: '$$',    en: '😎 Mid-range',    zh: '😎 中價位',    sub: { en: 'NT$300–800',        zh: '300–800元' } },
  { k: '$$$',   en: '🤑 Any budget',   zh: '🤑 不限預算',  sub: { en: 'No limit',          zh: '不限金額' } },
];

const STEPS = ['welcome', 'interests', 'budget', 'done'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { lang, setLang } = useContext(AppContext);
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState(new Set());
  const [selectedBudget, setBudget] = useState(null);

  const t = (en, zh) => lang === 'zh' ? zh : en;

  const toggleInterest = (k) => {
    setSelectedInterests(prev => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  };

  const finish = () => {
    try {
      localStorage.setItem('cf_onboarded', '1');
      localStorage.setItem('cf_interests', JSON.stringify([...selectedInterests]));
      if (selectedBudget) localStorage.setItem('cf_budget', selectedBudget);
    } catch (_) {}
    navigate('/', { replace: true });
  };

  const canAdvance = () => {
    if (step === 1) return selectedInterests.size > 0;
    if (step === 2) return selectedBudget !== null;
    return true;
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FAF7F2', display: 'flex', flexDirection: 'column' }}>

      {/* Progress bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'rgba(26,15,10,0.08)', zIndex: 10 }}>
        <div style={{ height: '100%', background: '#D94F30', width: `${((step + 1) / STEPS.length) * 100}%`, transition: 'width 0.4s ease', borderRadius: '0 2px 2px 0' }} />
      </div>

      {/* Lang toggle top-right */}
      <div style={{ position: 'absolute', top: 54, right: 20, zIndex: 10 }}>
        <button
          onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
          style={{ padding: '5px 12px', borderRadius: 9999, background: 'rgba(26,15,10,0.07)', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}
        >
          {lang === 'zh' ? '🇹🇼 中文' : '🇬🇧 EN'}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 100, paddingBottom: 120, paddingLeft: 24, paddingRight: 24 }}>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 52, textAlign: 'center', marginBottom: 8 }}>🌊</div>
            <h1 style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 30, fontWeight: 900, letterSpacing: -0.8, color: '#1A1A1A', textAlign: 'center', margin: 0 }}>
              {t('Welcome to CultureFlow', '歡迎使用 CultureFlow')}
            </h1>
            <p style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 15, fontWeight: 500, color: '#5A4A35', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
              {t(
                'Discover the best cultural events in Taipei — tailored to your taste from the very first tap.',
                '探索台北最精彩的文化活動 — 從第一次點擊就為你量身推薦。'
              )}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              {[
                { icon: '🎯', en: 'Personalised picks based on your interests', zh: '根據興趣精選推薦' },
                { icon: '🗺', en: 'Plan routes and discover nearby events', zh: '規劃路線，探索附近活動' },
                { icon: '📲', en: 'Share plans to LINE and social apps', zh: '一鍵分享到 LINE 與社群' },
              ].map(item => (
                <div key={item.en} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 14, background: '#fff', boxShadow: '0 2px 10px rgba(26,15,10,0.06)' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{lang === 'zh' ? item.zh : item.en}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Interests */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 24, fontWeight: 900, letterSpacing: -0.5, color: '#1A1A1A', margin: '0 0 6px' }}>
              {t('What do you love?', '你喜歡什麼？')}
            </h2>
            <p style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 13, color: '#8A6F4A', margin: '0 0 20px' }}>
              {t('Pick everything that interests you', '選擇所有你感興趣的類型')}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {INTERESTS.map(item => {
                const active = selectedInterests.has(item.k);
                return (
                  <button key={item.k} onClick={() => toggleInterest(item.k)} style={{
                    padding: '18px 14px', borderRadius: 16, border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: active ? item.color : '#fff',
                    boxShadow: active ? `0 4px 16px ${item.color}44` : '0 2px 10px rgba(26,15,10,0.07)',
                    transition: 'all 0.18s',
                  }}>
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{item.icon}</div>
                    <div style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 13, fontWeight: 800, color: active ? '#fff' : '#1A1A1A' }}>
                      {lang === 'zh' ? item.zh : item.en}
                    </div>
                    {active && <div style={{ marginTop: 4, fontFamily: '"Plus Jakarta Sans"', fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>✓ {t('Selected', '已選')}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Budget */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 24, fontWeight: 900, letterSpacing: -0.5, color: '#1A1A1A', margin: '0 0 6px' }}>
              {t('What\'s your budget?', '預算範圍？')}
            </h2>
            <p style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 13, color: '#8A6F4A', margin: '0 0 20px' }}>
              {t('We\'ll filter out events outside your range', '我們會優先顯示符合預算的活動')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {BUDGETS.map(b => {
                const active = selectedBudget === b.k;
                return (
                  <button key={b.k} onClick={() => setBudget(b.k)} style={{
                    padding: '16px 18px', borderRadius: 16, border: active ? '2px solid #D94F30' : '2px solid transparent', cursor: 'pointer', textAlign: 'left',
                    background: active ? 'rgba(217,79,48,0.06)' : '#fff',
                    boxShadow: active ? '0 4px 14px rgba(217,79,48,0.15)' : '0 2px 10px rgba(26,15,10,0.07)',
                    display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.18s',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 15, fontWeight: 800, color: active ? '#D94F30' : '#1A1A1A' }}>
                        {lang === 'zh' ? b.zh : b.en}
                      </div>
                      <div style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 12, color: '#8A6F4A', marginTop: 2 }}>
                        {lang === 'zh' ? b.sub.zh : b.sub.en}
                      </div>
                    </div>
                    {active && <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#D94F30', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: '#fff' }}>✓</span>
                    </div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', paddingTop: 20 }}>
            <div style={{ fontSize: 64 }}>🎉</div>
            <h2 style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 26, fontWeight: 900, letterSpacing: -0.6, color: '#1A1A1A', margin: 0 }}>
              {t("You're all set!", '設定完成！')}
            </h2>
            <p style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 14, color: '#5A4A35', margin: 0, lineHeight: 1.6 }}>
              {t(
                'Your feed is personalised and ready. Explore cultural events tailored just for you.',
                '你的推薦已根據偏好客製化。開始探索專屬於你的文化活動吧！'
              )}
            </p>
            {selectedInterests.size > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 }}>
                {[...selectedInterests].map(k => {
                  const item = INTERESTS.find(i => i.k === k);
                  return item ? (
                    <span key={k} style={{ padding: '4px 12px', borderRadius: 9999, background: item.color, fontFamily: '"Plus Jakarta Sans"', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                      {item.icon} {lang === 'zh' ? item.zh : item.en}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 24px 40px', background: 'rgba(250,247,242,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(26,15,10,0.06)' }}>
        {step < STEPS.length - 1 ? (
          <div style={{ display: 'flex', gap: 10 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{ width: 50, height: 52, borderRadius: 14, background: 'rgba(26,15,10,0.07)', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans"', fontSize: 20, color: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ←
              </button>
            )}
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
              style={{
                flex: 1, height: 52, borderRadius: 14, border: 'none', cursor: canAdvance() ? 'pointer' : 'not-allowed',
                background: canAdvance() ? '#1A1A1A' : 'rgba(26,15,10,0.12)',
                color: canAdvance() ? '#fff' : 'rgba(26,15,10,0.3)',
                fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 15, fontWeight: 800,
                transition: 'all 0.2s',
              }}
            >
              {step === 0 ? t("Let's go →", '開始 →') : step === STEPS.length - 2 ? t('Almost there →', '快完成了 →') : t('Next →', '下一步 →')}
            </button>
          </div>
        ) : (
          <button onClick={finish} style={{ width: '100%', height: 52, borderRadius: 14, border: 'none', cursor: 'pointer', background: '#D94F30', color: '#fff', fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 15, fontWeight: 800, boxShadow: '0 4px 20px rgba(217,79,48,0.4)' }}>
            {t('Start Exploring 🌊', '開始探索 🌊')}
          </button>
        )}

        {/* Skip (only on interest/budget steps) */}
        {step > 0 && step < STEPS.length - 1 && (
          <button onClick={() => setStep(s => s + 1)} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Plus Jakarta Sans", "Noto Sans TC", system-ui', fontSize: 13, color: '#B09070', fontWeight: 600 }}>
            {t('Skip', '略過')}
          </button>
        )}
      </div>
    </div>
  );
}
