import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, ReferenceLine,
} from 'recharts';
import { Activity, Thermometer, Waves, ZapOff } from 'lucide-react';
import { allToolSensorData, ToolSensorData, SensorChannel } from './data';

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:          '#050914',
  card:        '#0c1326',
  cardInner:   '#080e1f',
  border:      '#1a2d50',
  borderLight: '#243654',
  text:        '#e2e8f0',
  textSec:     '#8b9cc8',
  textMuted:   '#4a5578',
  blue:        '#3b82f6',
  purple:      '#a855f7',
  amber:       '#f59e0b',
  red:         '#ef4444',
  green:       '#22c55e',
  teal:        '#14b8a6',
};

const STATUS_DOT: Record<string, string> = { good: C.green, warning: C.amber, critical: C.red };

type ViewMode = 'wave' | 'fft';

// ─── Tooltips ─────────────────────────────────────────────────────────────────
function WaveTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a1428', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px' }}>
      <p style={{ fontSize: 9, color: C.textMuted, margin: '0 0 2px' }}>{label} ms</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: payload[0].color || C.blue, margin: 0 }}>
        {Number(payload[0].value).toFixed(4)}{' '}
        <span style={{ fontSize: 9, fontWeight: 400, color: C.textSec }}>{unit}</span>
      </p>
    </div>
  );
}

function FFTTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a1428', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px' }}>
      <p style={{ fontSize: 9, color: C.textMuted, margin: '0 0 2px' }}>{label} Hz</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: payload[0].color || C.blue, margin: 0 }}>
        {Number(payload[0].value).toFixed(1)}{' '}
        <span style={{ fontSize: 9, fontWeight: 400, color: C.textSec }}>dB</span>
      </p>
    </div>
  );
}

// ─── Channel Icon ─────────────────────────────────────────────────────────────
const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  x:    <Activity size={12} />,
  y:    <Waves size={12} />,
  z:    <ZapOff size={12} />,
  temp: <Thermometer size={12} />,
};

// ─── Channel Card (2×2 grid cell) ────────────────────────────────────────────
interface ChannelCardProps {
  channel: SensorChannel;
  viewMode: ViewMode;
  waveDecimate: number;
  fftDecimate: number;
}

function ChannelCard({ channel, viewMode, waveDecimate, fftDecimate }: ChannelCardProps) {
  const waveData = useMemo(
    () => channel.waveform.filter((_, i) => i % waveDecimate === 0),
    [channel.waveform, waveDecimate]
  );
  const fftData = useMemo(
    () => channel.fft.filter((_, i) => i % fftDecimate === 0),
    [channel.fft, fftDecimate]
  );

  const isTemp = channel.id === 'temp';
  const col    = channel.color;

  return (
    <div style={{
      background: C.cardInner,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${col}`,
      borderRadius: 10,
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: col, opacity: 0.9 }}>{CHANNEL_ICONS[channel.id]}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{channel.label}</span>
          <span style={{
            fontSize: 9, color: col, padding: '1px 5px',
            background: `${col}15`, border: `1px solid ${col}25`, borderRadius: 4,
          }}>{channel.unit}</span>
        </div>

        {/* Compact stats */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: 'RMS',  value: channel.rms.toFixed(isTemp ? 2 : 3) },
            { label: 'Peak', value: channel.peak.toFixed(isTemp ? 2 : 3) },
            ...(!isTemp ? [{ label: 'Dom', value: `${channel.dominantFreq}Hz` }] : []),
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '3px 8px', borderRadius: 6,
              background: `${col}0d`, border: `1px solid ${col}20`,
            }}>
              <span style={{ fontSize: 8, color: C.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: col, fontVariantNumeric: 'tabular-nums' }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 130, background: '#06090f', borderRadius: 7, padding: '3px 0' }}>
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'wave' ? (
            <LineChart data={waveData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="t"
                tick={{ fill: C.textMuted, fontSize: 8 }}
                axisLine={{ stroke: C.border }}
                tickLine={false}
                interval="preserveStartEnd"
                tickFormatter={v => `${v}`}
                label={{ value: 'ms', position: 'insideBottomRight', offset: -4, style: { fill: C.textMuted, fontSize: 8 } }}
              />
              <YAxis
                tick={{ fill: C.textMuted, fontSize: 8 }}
                axisLine={{ stroke: C.border }}
                tickLine={false}
                tickFormatter={v => v.toFixed(1)}
                width={32}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<WaveTooltip unit={channel.unit} />} />
              {!isTemp && <ReferenceLine y={0} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />}
              <Line
                type="monotone" dataKey="v"
                stroke={col} strokeWidth={1.3}
                dot={false} isAnimationActive={false}
                strokeOpacity={0.9}
              />
            </LineChart>
          ) : (
            <BarChart data={fftData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} barCategoryGap={0}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="freq"
                tick={{ fill: C.textMuted, fontSize: 8 }}
                axisLine={{ stroke: C.border }}
                tickLine={false}
                interval="preserveStartEnd"
                tickFormatter={v => `${v}`}
                label={{ value: 'Hz', position: 'insideBottomRight', offset: -4, style: { fill: C.textMuted, fontSize: 8 } }}
              />
              <YAxis
                tick={{ fill: C.textMuted, fontSize: 8 }}
                axisLine={{ stroke: C.border }}
                tickLine={false}
                tickFormatter={v => `${v.toFixed(0)}`}
                width={32}
                domain={['auto', 'auto']}
                label={{ value: 'dB', angle: -90, position: 'insideLeft', offset: 8, style: { fill: C.textMuted, fontSize: 8 } }}
              />
              <Tooltip content={<FFTTooltip />} />
              <Bar dataKey="mag" fill={col} fillOpacity={0.75} isAnimationActive={false} radius={[1, 1, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Tool Panel ───────────────────────────────────────────────────────────────
function ToolPanel({ toolData, viewMode }: { toolData: ToolSensorData; viewMode: ViewMode }) {
  const dot = STATUS_DOT[toolData.status];
  const channelOrder: Array<keyof typeof toolData.channels> = ['x', 'y', 'z', 'temp'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Tool meta strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 14px',
        background: C.cardInner, border: `1px solid ${C.border}`, borderRadius: 8,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, boxShadow: `0 0 6px ${dot}` }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{toolData.toolLabel}</span>
        <span style={{
          fontSize: 9, padding: '2px 7px', borderRadius: 4,
          background: `${dot}15`, border: `1px solid ${dot}30`, color: dot, fontWeight: 600, letterSpacing: '0.07em',
        }}>
          {toolData.status.toUpperCase()}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: C.textMuted }}>
          {toolData.sampleRateHz.toLocaleString()} Hz · 200 ms window · 1024 samples
        </span>
      </div>

      {/* 2×2 chart grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {channelOrder.map(chKey => (
          <ChannelCard
            key={chKey}
            channel={toolData.channels[chKey]}
            viewMode={viewMode}
            waveDecimate={2}
            fftDecimate={1}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Segmented Toggle ─────────────────────────────────────────────────────────
function SegmentedToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  const options: { id: ViewMode; label: string }[] = [
    { id: 'wave', label: 'Waveform' },
    { id: 'fft',  label: 'FFT Spectrum' },
  ];
  return (
    <div style={{
      display: 'flex', gap: 2, padding: 3,
      background: C.cardInner, border: `1px solid ${C.border}`, borderRadius: 9,
    }}>
      {options.map(opt => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              padding: '5px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: active ? C.blue : 'transparent',
              color: active ? '#fff' : C.textSec,
              fontSize: 12, fontWeight: active ? 700 : 400,
              transition: 'all 0.15s',
              letterSpacing: active ? '0.01em' : 0,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function SensorGrid() {
  const [activeToolIdx, setActiveToolIdx] = useState(0);
  const [viewMode, setViewMode]           = useState<ViewMode>('wave');
  const toolData = allToolSensorData[activeToolIdx];

  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 22px' }}>

        {/* ── Section header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 3px' }}>Real-time Raw Data</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* View mode toggle */}
            <SegmentedToggle value={viewMode} onChange={setViewMode} />

            {/* Divider */}
            <div style={{ width: 1, height: 32, background: C.border }} />

            {/* Tool selector tabs — larger */}
            <div style={{ display: 'flex', gap: 6 }}>
              {allToolSensorData.map((td, idx) => {
                const active = idx === activeToolIdx;
                const dot    = STATUS_DOT[td.status];
                return (
                  <button
                    key={td.toolId}
                    onClick={() => setActiveToolIdx(idx)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '8px 18px', borderRadius: 9, cursor: 'pointer',
                      border: `1px solid ${active ? dot + '70' : C.border}`,
                      background: active ? `${dot}18` : 'transparent',
                      color: active ? dot : C.textSec,
                      fontSize: 13, fontWeight: active ? 700 : 500,
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: dot,
                      boxShadow: active ? `0 0 8px ${dot}` : 'none',
                    }} />
                    {td.toolLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Channel legend ── */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {(['x', 'y', 'z', 'temp'] as const).map(ch => {
            const channel = toolData.channels[ch];
            return (
              <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 2, borderRadius: 1, background: channel.color }} />
                <span style={{ fontSize: 10, color: C.textSec }}>{channel.label}</span>
              </div>
            );
          })}
        </div>

        {/* ── Tool Panel ── */}
        <ToolPanel toolData={toolData} viewMode={viewMode} />
      </div>
    </section>
  );
}