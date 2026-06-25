import { X, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { rulDistributionData } from './data';

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
};

interface Props {
  open: boolean;
  onClose: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ fontSize: 12, color: C.textSec, marginBottom: 4 }}>RUL Range: <strong style={{ color: C.text }}>{label}</strong></p>
      <p style={{ fontSize: 13, color: C.blue, fontWeight: 600 }}>{payload[0].value} failure events</p>
    </div>
  );
};

export function RULModal({ open, onClose }: Props) {
  if (!open) return null;

  const maxCount = Math.max(...rulDistributionData.map(d => d.count));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(5,9,26,0.85)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', width: 720, maxWidth: '95vw', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, zIndex: 1, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.15)', border: `1px solid rgba(59,130,246,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={16} color={C.blue} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0 }}>Historical RUL Distribution</h2>
            </div>
            <p style={{ fontSize: 13, color: C.textSec, margin: 0 }}>Frequency of failure events by Remaining Useful Life window — last 89 tool changes</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color={C.textSec} />
          </button>
        </div>

        {/* Stats summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Median RUL', value: '28h', color: C.blue },
            { label: 'Std Deviation', value: '±12.4h', color: C.textSec },
            { label: 'Early Failures (<10h)', value: '10%', color: C.amber },
            { label: 'Avg Tool Life', value: '31.2h', color: C.green },
          ].map((s, i) => (
            <div key={i} style={{ background: '#080e1f', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rulDistributionData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="range" tick={{ fill: C.textSec, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textSec, fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Events', angle: -90, position: 'insideLeft', fill: C.textMuted, fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <ReferenceLine x="20–30h" stroke={C.blue} strokeDasharray="4 4" label={{ value: 'Median', fill: C.blue, fontSize: 11 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {rulDistributionData.map((entry, index) => (
                  <Cell key={index} fill={entry.count === maxCount ? C.blue : entry.range.startsWith('0') || entry.range.startsWith('5') ? C.amber : 'rgba(59,130,246,0.45)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.06)', border: `1px solid rgba(59,130,246,0.15)` }}>
          <p style={{ fontSize: 12, color: C.textSec, margin: 0 }}>
            <strong style={{ color: C.blue }}>Interpretation:</strong> The histogram shows the RUL at point of confirmed failure. Peaks in the 20–40h window represent the most common tool-life range. Early failure events (&lt;10h) may indicate aggressive cutting parameters or tool quality variance.
          </p>
        </div>
      </div>
    </div>
  );
}
