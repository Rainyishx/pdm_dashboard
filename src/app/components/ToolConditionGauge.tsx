interface GaugeProps {
  value: number; // 0-100
  status: 'good' | 'warning' | 'critical';
}

function toXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const s = toXY(cx, cy, r, startDeg);
  const e = toXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

const STATUS_COLORS = { good: '#22c55e', warning: '#f59e0b', critical: '#ef4444' };
const STATUS_LABELS = { good: 'GOOD', warning: 'WARNING', critical: 'CRITICAL' };
const STATUS_BG = { good: 'rgba(34,197,94,0.12)', warning: 'rgba(245,158,11,0.12)', critical: 'rgba(239,68,68,0.12)' };

const GAP_START = -135;
const GAP_TOTAL = 270;

const TICK_POSITIONS = [0, 0.25, 0.5, 0.75, 1];
const TICK_LABELS = ['0', '25', '50', '75', '100'];

export function ToolConditionGauge({ value, status }: GaugeProps) {
  const cx = 110;
  const cy = 105;
  const r = 76;
  const sw = 12;
  const color = STATUS_COLORS[status];
  const fillEnd = GAP_START + (value / 100) * GAP_TOTAL;
  const needleAngle = fillEnd;
  const nOuter = toXY(cx, cy, r - 4, needleAngle);
  const nInner = toXY(cx, cy, 20, needleAngle);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 6 }}>
      <svg width={220} height={200} viewBox="0 0 220 200" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="glow">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={color} floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Band segments (dimmed) */}
        <path d={arcPath(cx, cy, r, GAP_START, GAP_START + GAP_TOTAL * 0.45)} fill="none" stroke="rgba(34,197,94,0.18)" strokeWidth={sw} strokeLinecap="butt" />
        <path d={arcPath(cx, cy, r, GAP_START + GAP_TOTAL * 0.45, GAP_START + GAP_TOTAL * 0.75)} fill="none" stroke="rgba(245,158,11,0.18)" strokeWidth={sw} strokeLinecap="butt" />
        <path d={arcPath(cx, cy, r, GAP_START + GAP_TOTAL * 0.75, GAP_START + GAP_TOTAL)} fill="none" stroke="rgba(239,68,68,0.18)" strokeWidth={sw} strokeLinecap="round" />

        {/* Tick marks + labels */}
        {TICK_POSITIONS.map((frac, i) => {
          const angle = GAP_START + frac * GAP_TOTAL;
          const t1 = toXY(cx, cy, r - sw / 2 - 2, angle);
          const t2 = toXY(cx, cy, r + sw / 2 + 2, angle);
          const tl = toXY(cx, cy, r + sw / 2 + 14, angle);
          return (
            <g key={i}>
              <line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} />
              <text x={tl.x} y={tl.y} textAnchor="middle" dominantBaseline="middle" fill="rgba(139,156,200,0.65)" style={{ fontSize: 9, fontFamily: 'Inter, sans-serif' }}>
                {TICK_LABELS[i]}
              </text>
            </g>
          );
        })}

        {/* Value fill arc */}
        {value > 0 && (
          <path d={arcPath(cx, cy, r, GAP_START, fillEnd)} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" filter="url(#glow)" />
        )}

        {/* Needle */}
        <line x1={nInner.x} y1={nInner.y} x2={nOuter.x} y2={nOuter.y} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={8} fill="#0c1326" stroke={color} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={3.5} fill={color} />

        {/* Center value */}
        <text x={cx} y={cy + 32} textAnchor="middle" fill="#e2e8f0" style={{ fontSize: 30, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
          {value}%
        </text>
        <text x={cx} y={cy + 52} textAnchor="middle" fill="rgba(139,156,200,0.7)" style={{ fontSize: 11, fontFamily: 'Inter, sans-serif' }}>
          Tool Health Score
        </text>
      </svg>

      <div style={{ padding: '5px 16px', borderRadius: 20, background: STATUS_BG[status], border: `1px solid ${color}50`, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
        <span style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: '0.07em' }}>{STATUS_LABELS[status]}</span>
      </div>
    </div>
  );
}
