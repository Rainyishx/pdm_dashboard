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

// ─── Tooltips ─────────────────────────────────────────────────────────────────
function WaveTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a1428', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px' }}>
      <p style={{ fontSize: 10, color: C.textMuted, margin: '0 0 3px' }}>{label} ms</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: payload[0].color || C.blue, margin: 0 }}>
        {Number(payload[0].value).toFixed(4)} <span style={{ fontSize: 10, fontWeight: 400, color: C.textSec }}>{unit}</span>
      </p>
    </div>
  );
}

function FFTTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a1428', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px' }}>
      <p style={{ fontSize: 10, color: C.textMuted, margin: '0 0 3px' }}>{label} Hz</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: payload[0].color || C.blue, margin: 0 }}>
        {Number(payload[0].value).toFixed(1)} <span style={{ fontSize: 10, fontWeight: 400, color: C.textSec }}>dB</span>
      </p>
    </div>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '8px 14px', borderRadius: 8,
      background: `${color}10`, border: `1px solid ${color}25`,
    }}>
      <span style={{ fontSize: 9, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

// ─── Channel Icon ─────────────────────────────────────────────────────────────
const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  x:    <Activity size={13} />,
  y:    <Waves size={13} />,
  z:    <ZapOff size={13} />,
  temp: <Thermometer size={13} />,
};

// ─── Single Channel Row (Waveform + FFT side by side) ────────────────────────
interface ChannelRowProps {
  channel: SensorChannel;
  waveDecimate: number;
  fftDecimate: number;
}

function ChannelRow({ channel, waveDecimate, fftDecimate }: ChannelRowProps) {
  const [hoveredChart, setHoveredChart] = useState<'wave' | 'fft' | null>(null);

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
      padding: '14px 16px',
      marginBottom: 10,
    }}>
      {/* Channel header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: col, opacity: 0.9 }}>{CHANNEL_ICONS[channel.id]}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{channel.label}</span>
          <span style={{ fontSize: 10, color: C.textMuted, padding: '1px 6px', background: `${col}15`, border: `1px solid ${col}25`, borderRadius: 4 }}>{channel.unit}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <StatPill label="RMS"   value={`${channel.rms.toFixed(isTemp ? 2 : 4)}`}         color={col} />
          <StatPill label="Peak"  value={`${channel.peak.toFixed(isTemp ? 2 : 4)}`}        color={col} />
          {!isTemp && <StatPill label="Dom. Freq" value={`${channel.dominantFreq} Hz`} color={col} />}
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Waveform */}
        <div>
          <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
            Time Domain — Raw Waveform
          </div>
          <div
            style={{ height: 140, borderRadius: 8, background: '#06090f', padding: '4px 0', outline: hoveredChart === 'wave' ? `1px solid ${col}30` : 'none' }}
            onMouseEnter={() => setHoveredChart('wave')}
            onMouseLeave={() => setHoveredChart(null)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waveData} margin={{ top: 4, right: 10, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="t"
                  tick={{ fill: C.textMuted, fontSize: 9 }}
                  axisLine={{ stroke: C.border }}
                  tickLine={false}
                  interval="preserveStartEnd"
                  tickFormatter={v => `${v}`}
                  label={{ value: 'ms', position: 'insideBottomRight', offset: -4, style: { fill: C.textMuted, fontSize: 9 } }}
                />
                <YAxis
                  tick={{ fill: C.textMuted, fontSize: 9 }}
                  axisLine={{ stroke: C.border }}
                  tickLine={false}
                  tickFormatter={v => v.toFixed(1)}
                  width={36}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<WaveTooltip unit={channel.unit} />} />
                {!isTemp && <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />}
                <Line
                  type="monotone" dataKey="v"
                  stroke={col} strokeWidth={1.4}
                  dot={false} isAnimationActive={false}
                  strokeOpacity={0.9}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FFT */}
        <div>
          <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
            Frequency Domain — FFT Spectrum
          </div>
          <div
            style={{ height: 140, borderRadius: 8, background: '#06090f', padding: '4px 0', outline: hoveredChart === 'fft' ? `1px solid ${col}30` : 'none' }}
            onMouseEnter={() => setHoveredChart('fft')}
            onMouseLeave={() => setHoveredChart(null)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fftData} margin={{ top: 4, right: 10, left: 0, bottom: 4 }} barCategoryGap={0}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="freq"
                  tick={{ fill: C.textMuted, fontSize: 9 }}
                  axisLine={{ stroke: C.border }}
                  tickLine={false}
                  interval="preserveStartEnd"
                  tickFormatter={v => `${v}`}
                  label={{ value: 'Hz', position: 'insideBottomRight', offset: -4, style: { fill: C.textMuted, fontSize: 9 } }}
                />
                <YAxis
                  tick={{ fill: C.textMuted, fontSize: 9 }}
                  axisLine={{ stroke: C.border }}
                  tickLine={false}
                  tickFormatter={v => `${v.toFixed(0)}`}
                  width={36}
                  domain={['auto', 'auto']}
                  label={{ value: 'dB', angle: -90, position: 'insideLeft', offset: 8, style: { fill: C.textMuted, fontSize: 9 } }}
                />
                <Tooltip content={<FFTTooltip />} />
                <Bar dataKey="mag" fill={col} fillOpacity={0.75} isAnimationActive={false} radius={[1, 1, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tool Panel ───────────────────────────────────────────────────────────────
function ToolPanel({ toolData }: { toolData: ToolSensorData }) {
  const dot = STATUS_DOT[toolData.status];
  const channelOrder: Array<keyof typeof toolData.channels> = ['x', 'y', 'z', 'temp'];

  return (
    <div>
      {/* Tool header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', marginBottom: 12,
        background: C.cardInner, border: `1px solid ${C.border}`, borderRadius: 10,
      }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: dot, boxShadow: `0 0 7px ${dot}` }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{toolData.toolLabel}</span>
        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${dot}15`, border: `1px solid ${dot}30`, color: dot, fontWeight: 600, letterSpacing: '0.07em' }}>
          {toolData.status.toUpperCase()}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: C.textMuted }}>
          {toolData.sampleRateHz.toLocaleString()} Hz · 200 ms window · 1024 samples
        </span>
      </div>

      {/* Channel rows */}
      {channelOrder.map(chKey => (
        <ChannelRow
          key={chKey}
          channel={toolData.channels[chKey]}
          waveDecimate={2}
          fftDecimate={1}
        />
      ))}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function SensorGrid() {
  const [activeToolIdx, setActiveToolIdx] = useState(0);
  const toolData = allToolSensorData[activeToolIdx];

  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>Raw Sensor Data</h2>
            <p style={{ fontSize: 12, color: C.textSec, margin: 0 }}>
              Live waveform capture &amp; FFT spectrum — X, Y, Z vibration + temperature
            </p>
          </div>

          {/* Tool selector tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {allToolSensorData.map((td, idx) => {
              const active = idx === activeToolIdx;
              const dot    = STATUS_DOT[td.status];
              return (
                <button
                  key={td.toolId}
                  onClick={() => setActiveToolIdx(idx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${active ? dot + '60' : C.border}`,
                    background: active ? `${dot}12` : 'transparent',
                    color: active ? dot : C.textSec,
                    fontSize: 12, fontWeight: active ? 700 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: dot, flexShrink: 0,
                    boxShadow: active ? `0 0 6px ${dot}` : 'none',
                  }} />
                  {td.toolLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          {(['x', 'y', 'z', 'temp'] as const).map(ch => {
            const channel = toolData.channels[ch];
            return (
              <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 2, borderRadius: 1, background: channel.color }} />
                <span style={{ fontSize: 11, color: C.textSec }}>{channel.label}</span>
              </div>
            );
          })}
          <div style={{ marginLeft: 'auto', fontSize: 11, color: C.textMuted }}>
            Waveform decimated 2× for render · FFT 512-point DFT · magnitudes in dBFS
          </div>
        </div>

        {/* Tool Panel */}
        <ToolPanel toolData={toolData} />
      </div>
    </section>
  );
}