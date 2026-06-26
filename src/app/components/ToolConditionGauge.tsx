interface GaugeProps {
  value: number;               // 0–100
  status: 'good' | 'warning' | 'critical';
  label?: string;              // shown above arc, e.g. "Tool 1 — Spindle"
  compact?: boolean;
  // optional metadata shown in the info strip below the arc
  wearRate?: string;           // e.g. "0.02 mm/h"
  lastChanged?: string;        // e.g. "12h ago"
  estRemaining?: string;       // e.g. "36h"
  runCount?: number;
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
const STATUS_LABELS = { good: 'GOOD',    warning: 'WARNING', critical: 'CRITICAL' };
const STATUS_BG     = { good: 'rgba(34,197,94,0.12)', warning: 'rgba(245,158,11,0.12)', critical: 'rgba(239,68,68,0.12)' };

const GAP_START      = -135;
const GAP_TOTAL      = 270;
const TICK_POSITIONS = [0, 0.25, 0.5, 0.75, 1];
const TICK_LABELS    = ['0', '25', '50', '75', '100'];

const C = {
  border:   '#1a2d50',
  textSec:  '#8b9cc8',
  textMuted:'#4a5578',
};

export function ToolConditionGauge({
  value, status, label, compact = false,
  wearRate, lastChanged, estRemaining, runCount,
}: GaugeProps) {
  const color = STATUS_COLORS[status];

  // --- geometry ---
  const cx  = compact ? 80  : 110;
  const cy  = compact ? 68  : 100;   // shifted up vs before
  const r   = compact ? 54  : 76;
  const sw  = compact ? 9   : 12;
  const svgW = compact ? 160 : 220;
  // Height only needs to reach the bottom of the arc + small pad
  const svgH = compact ? 125 : 178;

  const valFontSize  = compact ? 22 : 30;
  const subFontSize  = compact ? 9  : 11;
  const tickFontSize = compact ? 7  : 9;

  // Text lifted UP into the centre of the arc (was cy+26/cy+42)
  const valOffsetY = compact ? 4  : 6;
  const subOffsetY = compact ? 20 : 24;

  const fillEnd     = GAP_START + (value / 100) * GAP_TOTAL;
  const nOuter      = toXY(cx, cy, r - 4, fillEnd);
  const nInner      = toXY(cx, cy, compact ? 14 : 20, fillEnd);
  const filterId    = `glow-${compact ? 'c' : 'f'}-${value}`;

  const hasInfo = wearRate || lastChanged || estRemaining || runCount !== undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', flex: 1 }}>

      {/* label above arc */}
      {label && (
        <span style={{
          fontSize: compact ? 10 : 12, color: '#8b9cc8', fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4,
        }}>
          {label}
        </span>
      )}

      {/* arc SVG — text is now centred inside the arc, not below it */}
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ overflow: 'visible' }}>
        <defs>
          <filter id={filterId}>
            <feDropShadow dx="0" dy="0" stdDeviation={compact ? 3 : 5} floodColor={color} floodOpacity="0.6" />
          </filter>
        </defs>

        {/* band segments */}
        <path d={arcPath(cx, cy, r, GAP_START, GAP_START + GAP_TOTAL * 0.45)}         fill="none" stroke="rgba(34,197,94,0.18)"  strokeWidth={sw} strokeLinecap="butt" />
        <path d={arcPath(cx, cy, r, GAP_START + GAP_TOTAL * 0.45, GAP_START + GAP_TOTAL * 0.75)} fill="none" stroke="rgba(245,158,11,0.18)" strokeWidth={sw} strokeLinecap="butt" />
        <path d={arcPath(cx, cy, r, GAP_START + GAP_TOTAL * 0.75, GAP_START + GAP_TOTAL)}        fill="none" stroke="rgba(239,68,68,0.18)"  strokeWidth={sw} strokeLinecap="round" />

        {/* ticks */}
        {TICK_POSITIONS.map((frac, i) => {
          const angle = GAP_START + frac * GAP_TOTAL;
          const t1 = toXY(cx, cy, r - sw / 2 - 2, angle);
          const t2 = toXY(cx, cy, r + sw / 2 + 2, angle);
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

        {/* fill arc */}
        {value > 0 && (
          <path d={arcPath(cx, cy, r, GAP_START, fillEnd)}
            fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
            filter={`url(#${filterId})`} />
        )}

        {/* needle */}
        {/* <line x1={nInner.x} y1={nInner.y} x2={nOuter.x} y2={nOuter.y}
          stroke={color} strokeWidth={compact ? 2 : 2.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={compact ? 6 : 8} fill="#0c1326" stroke={color} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={compact ? 2.5 : 3.5} fill={color} /> */}

        {/* value & subtitle — now inside the arc */}
        <text x={cx} y={cy + valOffsetY} textAnchor="middle" fill="#e2e8f0"
          style={{ fontSize: valFontSize, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
          {value}%
        </text>
        <text x={cx} y={cy + subOffsetY} textAnchor="middle" fill="rgba(139,156,200,0.7)"
          style={{ fontSize: subFontSize, fontFamily: 'Inter, sans-serif' }}>
          Tool Health Score
        </text>
      </svg>

      {/* status badge */}
      <div style={{
        padding: compact ? '3px 10px' : '5px 16px', borderRadius: 20,
        background: STATUS_BG[status], border: `1px solid ${color}50`,
        display: 'flex', alignItems: 'center', gap: 6, marginTop: 2,
      }}>
        <div style={{ width: compact ? 5 : 7, height: compact ? 5 : 7, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
        <span style={{ fontSize: compact ? 10 : 12, fontWeight: 700, color, letterSpacing: '0.07em' }}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      {/* ── info strip (only when metadata is provided) ── */}
      {hasInfo && (
        <div style={{
          width: '100%', marginTop: 12,
          borderTop: `1px solid ${C.border}`,
          paddingTop: 10,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px 4px',
        }}>
          {wearRate && (
            <InfoCell label="Wear Rate" value={wearRate} color={color} />
          )}
          {lastChanged && (
            <InfoCell label="Last Changed" value={lastChanged} />
          )}
          {estRemaining && (
            <InfoCell label="Est. Remaining" value={estRemaining} color={color} />
          )}
          {runCount !== undefined && (
            <InfoCell label="Run Count" value={String(runCount)} />
          )}
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 9, color: '#4a5578', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: color ?? '#e2e8f0' }}>{value}</span>
    </div>
  );
}