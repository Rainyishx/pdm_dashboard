interface GaugeProps {
  value: number; // 0–100
  status: 'good' | 'warning' | 'critical';
  label?: string;   // e.g. "Tool 1 — Spindle"
  compact?: boolean; // smaller variant for multi-tool layout
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

const STATUS_COLORS  = { good: '#22c55e', warning: '#f59e0b', critical: '#ef4444' };
const STATUS_LABELS  = { good: 'GOOD',    warning: 'WARNING', critical: 'CRITICAL' };
const STATUS_BG      = { good: 'rgba(34,197,94,0.12)', warning: 'rgba(245,158,11,0.12)', critical: 'rgba(239,68,68,0.12)' };

const GAP_START = -135;
const GAP_TOTAL = 270;
const TICK_POSITIONS = [0, 0.25, 0.5, 0.75, 1];
const TICK_LABELS    = ['0', '25', '50', '75', '100'];

export function ToolConditionGauge({ value, status, label, compact = false }: GaugeProps) {
  const color = STATUS_COLORS[status];

  // --- geometry: full vs compact ---
  const cx  = compact ? 80  : 110;
  const cy  = compact ? 72  : 105;
  const r   = compact ? 54  : 76;
  const sw  = compact ? 9   : 12;
  const svgW = compact ? 160 : 220;
  const svgH = compact ? 138 : 200;
  const valFontSize  = compact ? 22 : 30;
  const subFontSize  = compact ? 9  : 11;
  const tickFontSize = compact ? 7  : 9;
  const valOffsetY   = compact ? 26 : 32;
  const subOffsetY   = compact ? 42 : 52;

  const fillEnd     = GAP_START + (value / 100) * GAP_TOTAL;
  const needleAngle = fillEnd;
  const nOuter      = toXY(cx, cy, r - 4,  needleAngle);
  const nInner      = toXY(cx, cy, compact ? 14 : 20, needleAngle);

  const filterId = `glow-${compact ? 'c' : 'f'}-${status}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: compact ? 4 : 6 }}>
      {/* optional per-tool label above */}
      {label && (
        <span style={{ fontSize: compact ? 10 : 12, color: '#8b9cc8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </span>
      )}

      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ overflow: 'visible' }}>
        <defs>
          <filter id={filterId}>
            <feDropShadow dx="0" dy="0" stdDeviation={compact ? 3 : 5} floodColor={color} floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Band segments (dimmed) */}
        <path d={arcPath(cx, cy, r, GAP_START, GAP_START + GAP_TOTAL * 0.45)} fill="none" stroke="rgba(34,197,94,0.18)"  strokeWidth={sw} strokeLinecap="butt" />
        <path d={arcPath(cx, cy, r, GAP_START + GAP_TOTAL * 0.45, GAP_START + GAP_TOTAL * 0.75)} fill="none" stroke="rgba(245,158,11,0.18)" strokeWidth={sw} strokeLinecap="butt" />
        <path d={arcPath(cx, cy, r, GAP_START + GAP_TOTAL * 0.75, GAP_START + GAP_TOTAL)} fill="none" stroke="rgba(239,68,68,0.18)" strokeWidth={sw} strokeLinecap="round" />

        {/* Tick marks + labels */}
        {TICK_POSITIONS.map((frac, i) => {
          const angle = GAP_START + frac * GAP_TOTAL;
          const t1 = toXY(cx, cy, r - sw / 2 - 2,  angle);
          const t2 = toXY(cx, cy, r + sw / 2 + 2,  angle);
          const tl = toXY(cx, cy, r + sw / 2 + (compact ? 10 : 14), angle);
          return (
            <g key={i}>
              <line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} />
              <text x={tl.x} y={tl.y} textAnchor="middle" dominantBaseline="middle"
                fill="rgba(139,156,200,0.65)"
                style={{ fontSize: tickFontSize, fontFamily: 'Inter, sans-serif' }}>
                {TICK_LABELS[i]}
              </text>
            </g>
          );
        })}

        {/* Value fill arc */}
        {value > 0 && (
          <path d={arcPath(cx, cy, r, GAP_START, fillEnd)}
            fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
            filter={`url(#${filterId})`} />
        )}

        {/* Needle */}
        <line x1={nInner.x} y1={nInner.y} x2={nOuter.x} y2={nOuter.y}
          stroke={color} strokeWidth={compact ? 2 : 2.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={compact ? 6 : 8} fill="#0c1326" stroke={color} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={compact ? 2.5 : 3.5} fill={color} />

        {/* Centre value */}
        <text x={cx} y={cy + valOffsetY} textAnchor="middle" fill="#e2e8f0"
          style={{ fontSize: valFontSize, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
          {value}%
        </text>
        <text x={cx} y={cy + subOffsetY} textAnchor="middle" fill="rgba(139,156,200,0.7)"
          style={{ fontSize: subFontSize, fontFamily: 'Inter, sans-serif' }}>
          Tool Health Score
        </text>
      </svg>

      {/* Status badge */}
      <div style={{
        padding: compact ? '3px 10px' : '5px 16px',
        borderRadius: 20,
        background: STATUS_BG[status],
        border: `1px solid ${color}50`,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{ width: compact ? 5 : 7, height: compact ? 5 : 7, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
        <span style={{ fontSize: compact ? 10 : 12, fontWeight: 700, color, letterSpacing: '0.07em' }}>
          {STATUS_LABELS[status]}
        </span>
      </div>
    </div>
  );
}