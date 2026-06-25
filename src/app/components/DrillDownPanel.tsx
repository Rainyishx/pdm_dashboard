import { useEffect, useState } from 'react';
import { X, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MotorData, getMotorDetailData, MotorStats, AlertEntry } from './data';

const C = {
  bg: '#050914',
  card: '#0c1326',
  panel: '#080e1f',
  border: '#1a2d50',
  borderLight: '#243654',
  text: '#e2e8f0',
  textSec: '#8b9cc8',
  textMuted: '#4a5578',
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  amber: '#f59e0b',
};

const STATUS_COLORS = { normal: C.green, warning: C.amber, critical: C.red };
const STATUS_LABELS = { normal: 'NORMAL', warning: 'WARNING', critical: 'CRITICAL' };

const WARN_THRESHOLD = 2.8;
const CRIT_THRESHOLD = 4.5;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a1428', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 700, color: C.blue }}>{payload[0].value.toFixed(3)} <span style={{ fontSize: 11, fontWeight: 400, color: C.textSec }}>mm/s</span></p>
    </div>
  );
};

interface StatBoxProps { label: string; value: string | number; sub?: string; }
function StatBox({ label, value, sub }: StatBoxProps) {
  return (
    <div style={{ background: '#080e1f', border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function AlertRow({ alert }: { alert: AlertEntry }) {
  const isC = alert.type === 'critical';
  const color = isC ? C.red : C.amber;
  const Icon = isC ? AlertCircle : AlertTriangle;
  return (
    <div style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: `1px solid ${C.border}30`, alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 6, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
        <Icon size={12} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color, textTransform: 'capitalize' }}>{alert.type}</span>
          <span style={{ fontSize: 10, color: C.textMuted, flexShrink: 0 }}>{alert.timestamp}</span>
        </div>
        <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{alert.message}</div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>
          {alert.value.toFixed(3)} mm/s → threshold {alert.threshold} mm/s
          <span style={{ color, marginLeft: 4 }}>({((alert.value / alert.threshold - 1) * 100).toFixed(0)}% over)</span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  motor: MotorData | null;
  onClose: () => void;
}

export function DrillDownPanel({ motor, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<{ chartData: { time: string; value: number }[]; stats: MotorStats; alerts: AlertEntry[] } | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'stats' | 'alerts'>('chart');

  useEffect(() => {
    if (motor) {
      setData(getMotorDetailData(motor));
      setActiveTab('chart');
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [motor]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  if (!motor) return null;

  const color = STATUS_COLORS[motor.status];
  const threshold = motor.status === 'critical' ? CRIT_THRESHOLD : WARN_THRESHOLD;
  const thinChartData = data?.chartData.filter((_, i) => i % 3 === 0) ?? [];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(5,9,26,0.6)', backdropFilter: 'blur(2px)', zIndex: 150, transition: 'opacity 0.3s', opacity: visible ? 1 : 0 }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 560, zIndex: 160,
        background: C.card, borderLeft: `1px solid ${C.border}`,
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-16px 0 48px rgba(0,0,0,0.5)',
      }}>
        {/* Panel header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
                <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0 }}>{motor.label} — Detailed Telemetry</h2>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: C.textMuted }}>ID: {motor.id}</span>
                <span style={{ fontSize: 11, color: C.textMuted }}>•</span>
                <span style={{ fontSize: 11, color: C.textMuted }}>Vibration Sensor</span>
                <span style={{ fontSize: 11, color: C.textMuted }}>•</span>
                <span style={{ padding: '2px 8px', borderRadius: 4, background: `${color}15`, border: `1px solid ${color}30`, fontSize: 10, fontWeight: 700, color, letterSpacing: '0.08em' }}>{STATUS_LABELS[motor.status]}</span>
              </div>
            </div>
            <button onClick={handleClose} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <X size={16} color={C.textSec} />
            </button>
          </div>

          {/* Live value bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, padding: '12px 16px', borderRadius: 10, background: '#080e1f', border: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 2 }}>Live Value</div>
              <div style={{ fontSize: 28, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{motor.value.toFixed(2)} <span style={{ fontSize: 13, fontWeight: 400, color: C.textSec }}>{motor.unit}</span></div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textMuted, marginBottom: 4 }}>
                <span>0</span><span>Warn: {WARN_THRESHOLD}</span><span>Crit: {CRIT_THRESHOLD}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (motor.value / (CRIT_THRESHOLD * 1.2)) * 100)}%`, borderRadius: 3, background: `linear-gradient(90deg, ${C.green}, ${C.amber}, ${C.red})`, transition: 'width 0.4s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          {(['chart', 'stats', 'alerts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '12px 0', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? C.blue : C.textSec,
                background: 'transparent', border: 'none',
                borderBottom: `2px solid ${activeTab === tab ? C.blue : 'transparent'}`,
                cursor: 'pointer', textTransform: 'capitalize', transition: 'color 0.15s',
              }}
            >
              {tab === 'chart' ? '24h Chart' : tab === 'stats' ? 'Statistics' : 'Alerts'}
              {tab === 'alerts' && data?.alerts.length ? ` (${data.alerts.length})` : ''}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* 24h Chart */}
          {activeTab === 'chart' && (
            <div>
              <div style={{ fontSize: 12, color: C.textSec, marginBottom: 14 }}>Raw sensor data — last 24 hours (5-min intervals)</div>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={thinChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" tick={{ fill: C.textMuted, fontSize: 10 }} axisLine={{ stroke: C.border }} tickLine={false} interval={23} />
                    <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} axisLine={{ stroke: C.border }} tickLine={false} tickFormatter={v => `${v.toFixed(1)}`} width={40} domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={WARN_THRESHOLD} stroke={C.amber} strokeDasharray="5 4" strokeWidth={1} label={{ value: 'Warn', position: 'right', fill: C.amber, fontSize: 10 }} />
                    <ReferenceLine y={CRIT_THRESHOLD} stroke={C.red} strokeDasharray="5 4" strokeWidth={1} label={{ value: 'Crit', position: 'right', fill: C.red, fontSize: 10 }} />
                    <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.8} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Statistics */}
          {activeTab === 'stats' && data && (
            <div>
              <div style={{ fontSize: 12, color: C.textSec, marginBottom: 14 }}>Summary statistics over the last 24-hour window</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <StatBox label="Mean" value={`${data.stats.mean} mm/s`} sub="Time-averaged RMS" />
                <StatBox label="Peak Value" value={`${data.stats.peak} mm/s`} sub="Maximum observed" />
                <StatBox label="Minimum" value={`${data.stats.min} mm/s`} sub="Minimum observed" />
                <StatBox label="Std Deviation" value={`±${data.stats.stdDev} mm/s`} sub="1σ spread" />
                <StatBox label="Variance" value={`${data.stats.variance}`} sub="σ² (mm/s)²" />
                <StatBox label="P-P Amplitude" value={`${(data.stats.peak - data.stats.min).toFixed(3)} mm/s`} sub="Peak-to-peak" />
              </div>
              <div style={{ padding: '14px 16px', borderRadius: 10, background: '#080e1f', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Threshold Assessment</div>
                {[
                  { label: 'ISO 10816-3 Class II', status: motor.value < 2.8 ? 'Pass' : 'Fail', ok: motor.value < 2.8 },
                  { label: 'Warning Band (2.8 mm/s)', status: motor.value >= WARN_THRESHOLD ? `Exceeded by ${(motor.value - WARN_THRESHOLD).toFixed(2)}` : 'Within range', ok: motor.value < WARN_THRESHOLD },
                  { label: 'Critical Band (4.5 mm/s)', status: motor.value >= CRIT_THRESHOLD ? `Exceeded by ${(motor.value - CRIT_THRESHOLD).toFixed(2)}` : 'Within range', ok: motor.value < CRIT_THRESHOLD },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 2 ? `1px solid ${C.border}30` : 'none' }}>
                    <span style={{ fontSize: 12, color: C.textSec }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: item.ok ? C.green : C.red }}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alert History */}
          {activeTab === 'alerts' && data && (
            <div>
              <div style={{ fontSize: 12, color: C.textSec, marginBottom: 14 }}>Recent anomalies and threshold crossings — last 24 hours</div>
              {data.alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <CheckCircle size={32} color={C.green} style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 13, color: C.textSec }}>No alerts in the last 24 hours</div>
                </div>
              ) : (
                <div>
                  {data.alerts.map(alert => <AlertRow key={alert.id} alert={alert} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
