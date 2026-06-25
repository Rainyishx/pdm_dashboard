import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const C = {
  bg: '#050914',
  card: '#0c1326',
  panel: '#0f1a2e',
  border: '#1a2d50',
  text: '#e2e8f0',
  textSec: '#8b9cc8',
  textMuted: '#4a5578',
  blue: '#3b82f6',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
};

// Dummy runs derived from RUL stats: avg=31.2h, median≈28h, std≈12.4h, 10% early failures
const RUN_CONFIGS = [
  { id: 1,  failureTime: 7,  color: '#60a5fa', strokeDasharray: undefined },
  { id: 2,  failureTime: 19, color: '#22d3ee', strokeDasharray: '5 3' },
  { id: 3,  failureTime: 23, color: '#34d399', strokeDasharray: undefined },
  { id: 4,  failureTime: 26, color: '#4ade80', strokeDasharray: '4 4' },
  { id: 5,  failureTime: 28, color: '#a3e635', strokeDasharray: undefined },
  { id: 6,  failureTime: 30, color: '#facc15', strokeDasharray: '5 3' },
  { id: 7,  failureTime: 34, color: '#fbbf24', strokeDasharray: undefined },
  { id: 8,  failureTime: 39, color: '#fb923c', strokeDasharray: '4 4' },
  { id: 9,  failureTime: 46, color: '#f97316', strokeDasharray: '8 4' },
  { id: 10, failureTime: 60, color: '#ef9a4a', strokeDasharray: undefined },
];

const MTTF = 31.2;
const FAILURE_THRESHOLD = 0.8;

function getWear(t: number, failureTime: number, runId: number): number | null {
  if (t > failureTime) return null;
  const base = FAILURE_THRESHOLD * Math.pow(t / failureTime, 1.3);
  const noise = 0.018 * Math.sin(t * 0.9 + runId * 2.1);
  return Math.max(0, parseFloat((base + noise).toFixed(3)));
}

const TIME_POINTS = Array.from({ length: 61 }, (_, i) => i);

const wearData = TIME_POINTS.map(t => {
  const point: Record<string, number | null> = { time: t };
  RUN_CONFIGS.forEach(run => {
    point[`run${run.id}`] = getWear(t, run.failureTime, run.id);
  });
  return point;
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const visible = payload.filter((p: any) => p.value != null);
  if (!visible.length) return null;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', minWidth: 160 }}>
      <p style={{ fontSize: 12, color: C.textSec, marginBottom: 6 }}>
        Time: <strong style={{ color: C.text }}>{label}h</strong>
      </p>
      {visible.map((p: any) => (
        <p key={p.dataKey} style={{ fontSize: 12, color: p.color, margin: '2px 0', fontWeight: 500 }}>
          {p.name}: {p.value.toFixed(3)} mm
        </p>
      ))}
    </div>
  );
};

export function WearTrendsChart() {
  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.15)', border: `1px solid rgba(59,130,246,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0 }}>Machine Run-to-Failure: Historical Wear Trends</h2>
          </div>
          <p style={{ fontSize: 13, color: C.textSec, margin: 0 }}>Tool wear progression per historical run — failure threshold 0.8 mm</p>
        </div>
        <div style={{ textAlign: 'right', background: '#080e1f', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 16px', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>AVG TOOL LIFE (MTTF)</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.blue }}>31.2 hrs</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={wearData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="time"
                type="number"
                domain={[0, 64]}
                ticks={[0, 10, 20, 30, 40, 50, 60]}
                tick={{ fill: C.textSec, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Time (Hours)', position: 'insideBottom', offset: -4, fill: C.textMuted, fontSize: 11 }}
              />
              <YAxis
                domain={[0, 1.0]}
                ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                tickFormatter={v => v.toFixed(1)}
                tick={{ fill: C.textSec, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Tool Wear (mm)', angle: -90, position: 'insideLeft', offset: 10, fill: C.textMuted, fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={FAILURE_THRESHOLD}
                stroke={C.red}
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{ value: 'Failure threshold (0.8 mm)', position: 'insideTopLeft', fill: C.red, fontSize: 11 }}
              />
              <ReferenceLine
                x={MTTF}
                stroke={C.blue}
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{ value: 'MTTF 31.2h', position: 'insideBottomRight', fill: C.blue, fontSize: 11 }}
              />
              {RUN_CONFIGS.map(run => (
                <Line
                  key={run.id}
                  dataKey={`run${run.id}`}
                  name={`Run ${run.id} (${run.failureTime}h)`}
                  stroke={run.color}
                  strokeWidth={1.8}
                  strokeDasharray={run.strokeDasharray}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingTop: 8, flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Historical Runs</div>
          {RUN_CONFIGS.map(run => (
            <div key={run.id} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: C.textSec }}>
              <svg width="20" height="8" style={{ flexShrink: 0 }}>
                <line x1="0" y1="4" x2="20" y2="4" stroke={run.color} strokeWidth="2" strokeDasharray={run.strokeDasharray} />
              </svg>
              <span>Run {run.id} <span style={{ color: C.textMuted }}>({run.failureTime}h)</span></span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.06)', border: `1px solid rgba(59,130,246,0.15)` }}>
        <p style={{ fontSize: 12, color: C.textSec, margin: 0 }}>
          <strong style={{ color: C.blue }}>Interpretation:</strong> Run 1 (7h) is an early failure event consistent with the 10% early-failure rate in the RUL distribution. The MTTF of 31.2h aligns with avg tool life, while the median failure at ~28–29h reflects the right-skewed distribution driven by the longer-lived runs.
        </p>
      </div>
    </div>
  );
}