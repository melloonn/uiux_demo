// Gradient scrims used on the feed cards and hero images
export function BottomScrim({ intensity = 1 }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: '58%',
      background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10,5,3,${0.45 * intensity}) 45%, rgba(10,5,3,${0.88 * intensity}) 100%)`,
      pointerEvents: 'none',
    }} />
  );
}

export function TopScrim({ intensity = 1 }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 160,
      background: `linear-gradient(180deg, rgba(0,0,0,${0.55 * intensity}) 0%, rgba(0,0,0,0) 100%)`,
      pointerEvents: 'none',
    }} />
  );
}
