import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts';
import { toolWearChartData, wearAnalysis } from './data';
import { BarChart2 } from 'lucide-react';

const C = {
  card:      '#0c1326',
  panel:     '#080e1f',
  border:    '#1a2d50',
  text:      '#e2e8f0',
  textSec:   '#8b9cc8',
  textMuted: '#4a5578',
  blue:      '#3b82f6',
  green:     '#22c55e',
  red:       '#ef4444',
  amber:     '#f59e0b',
  purple:    '#a78bfa',
};

// Destructure once so template references stay clean
const { thresholds, currentWearPct, wearRatePerHour, etaToFailHours, modelConfidencePct, modelName } = wearAnalysis;
const FAIL_THRESHOLD = thresholds.failure;
const WARN_THRESHOLD = thresholds.warning;
const toThreshold    = FAIL_THRESHOLD - currentWearPct;

const thinData = toolWearChartData.filter((_, i) => i % 2 === 0);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload.find((p: any) => p.value !== null && p.value !== undefined);
  if (!point) return null;
  const val      = point.value as number;
  const isActual = point.dataKey === 'actual';
  const toFail   = FAIL_THRESHOLD - val;
  return (
    <div style={{ background: '#0a1428', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', minWidth: 180 }}>
      <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: isActual ? C.blue : C.purple }}>{val.toFixed(1)}</span>
        <span style={{ fontSize: 12, color: C.textSec }}>%</span>
      </div>
      <p style={{ fontSize: 11, color: C.textSec, marginBottom: 2 }}>{isActual ? 'Measured Wear' : 'Predicted Wear'}</p>
      {toFail > 0
        ? <p style={{ fontSize: 11, color: toFail < 10 ? C.red : toFail < 20 ? C.amber : C.green }}>▲ {toFail.toFixed(1)}% to failure threshold</p>
        : <p style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>⚠ Threshold exceeded</p>
      }
    </div>
  );
};

interface Props { onOpenRULModal: () => void; }

export function ToolWearChart({ onOpenRULModal }: Props) {
  const [, setHoveredRegion] = useState(false);

  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>Predictive Tool Wear Analysis</h2>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: C.blue, background: 'rgba(59,130,246,0.12)', border: `1px solid rgba(59,130,246,0.25)`, padding: '2px 8px', borderRadius: 4 }}>LIVE</span>
            </div>
            <p style={{ fontSize: 12, color: C.textSec, margin: 0 }}>Current Cutting vs. Failure Threshold — Taylor's Tool Life Model</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['1H', '6H', '12H', '24H'].map((t, i) => (
              <button key={t} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: `1px solid ${i === 1 ? C.blue : C.border}`, background: i === 1 ? 'rgba(59,130,246,0.15)' : 'transparent', color: i === 1 ? C.blue : C.textSec, cursor: 'pointer', fontWeight: i === 1 ? 600 : 400 }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 20 }}>
          {/* Main chart */}
          <div>
            <div style={{ display: 'flex', gap: 20, marginBottom: 12, fontSize: 12, color: C.textSec }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ display: 'inline-block', width: 20, height: 2, background: C.blue, borderRadius: 1 }} />Measured Wear</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ display: 'inline-block', width: 20, background: C.purple, borderRadius: 1, borderTop: `2px dashed ${C.purple}`, height: 0 }} />Predicted</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ display: 'inline-block', width: 20, height: 2, background: C.red, borderRadius: 1 }} />Failure Threshold ({FAIL_THRESHOLD}%)</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ display: 'inline-block', width: 20, background: C.amber, borderRadius: 1, borderTop: `2px dashed ${C.amber}`, height: 0 }} />Warning Zone ({WARN_THRESHOLD}%)</span>
            </div>

            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={thinData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" tick={{ fill: C.textMuted, fontSize: 10 }} axisLine={{ stroke: C.border }} tickLine={false} interval={19} />
                  <YAxis domain={[0, 100]} tick={{ fill: C.textMuted, fontSize: 10 }} axisLine={{ stroke: C.border }} tickLine={false} tickFormatter={v => `${v}%`} width={42} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceArea y1={WARN_THRESHOLD} y2={FAIL_THRESHOLD} fill="rgba(245,158,11,0.06)" />
                  <ReferenceArea y1={FAIL_THRESHOLD} y2={100}           fill="rgba(239,68,68,0.06)"   />
                  <ReferenceLine y={FAIL_THRESHOLD} stroke={C.red}   strokeDasharray="6 4" strokeWidth={1.5} label={{ value: 'Fail', position: 'right', fill: C.red,   fontSize: 11 }} />
                  <ReferenceLine y={WARN_THRESHOLD} stroke={C.amber} strokeDasharray="6 4" strokeWidth={1}   label={{ value: 'Warn', position: 'right', fill: C.amber, fontSize: 11 }} />
                  <ReferenceLine x={thinData.find(d => d.actual === null)?.time} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Now', position: 'insideTopLeft', fill: C.textMuted, fontSize: 10, offset: 4 }} />
                  <Line type="monotone" dataKey="actual"    stroke="url(#blueGrad)" strokeWidth={2.5} dot={false} isAnimationActive={false} connectNulls={false} name="Measured"  />
                  <Line type="monotone" dataKey="predicted" stroke={C.purple}       strokeWidth={2}   dot={false} isAnimationActive={false} connectNulls={false} name="Predicted" strokeDasharray="6 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Live Wear Metrics</div>
              {[
                { label: 'Current Wear', value: `${currentWearPct}%`,             color: C.blue   },
                { label: 'To Threshold', value: `${toThreshold.toFixed(1)}%`,     color: C.amber  },
                { label: 'ETA to Fail',  value: `~${etaToFailHours}h`,            color: C.red    },
                { label: 'Wear Rate',    value: wearRatePerHour,                   color: C.textSec},
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < 3 ? `1px solid ${C.border}30` : 'none' }}>
                  <span style={{ fontSize: 11, color: C.textSec }}>{m.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Model Confidence</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: C.green }}>{modelConfidencePct}</span>
                <span style={{ fontSize: 13, color: C.textSec }}>%</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${modelConfidencePct}%`, borderRadius: 2, background: C.green }} />
              </div>
              <span style={{ fontSize: 10, color: C.textMuted }}>{modelName}</span>
            </div>

            <button
              onClick={onOpenRULModal}
              style={{ padding: '12px 10px', borderRadius: 10, border: `1px solid rgba(59,130,246,0.35)`, background: 'rgba(59,130,246,0.08)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.08)'; }}
            >
              <BarChart2 size={18} color={C.blue} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.blue }}>View Historical</span>
              <span style={{ fontSize: 11, color: C.textSec }}>RUL Distribution</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}