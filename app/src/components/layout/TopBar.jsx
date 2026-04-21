import { GlobeToggle } from '../ui/GlobeToggle.jsx';

export function TopBar({ title, lang, setLang, right, style = {} }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      paddingTop: 58, paddingBottom: 12,
      paddingLeft: 20, paddingRight: 20,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      zIndex: 20,
      background: 'rgba(250,247,242,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(26,15,10,0.06)',
      ...style,
    }}>
      <h1 style={{
        margin: 0,
        fontFamily: '"Plus Jakarta Sans", system-ui',
        fontSize: 28, fontWeight: 800, letterSpacing: -0.6,
        color: '#1A1A1A', lineHeight: 1,
      }}>{title}</h1>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {right}
        {setLang && <GlobeToggle lang={lang} setLang={setLang} />}
      </div>
    </div>
  );
}
