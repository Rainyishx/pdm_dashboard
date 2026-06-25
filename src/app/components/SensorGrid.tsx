import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { motors, MotorData } from './data';

const C = {
  card: '#0c1326',
  cardHover: '#101c35',
  border: '#1a2d50',
  borderHover: '#2a4070',
  text: '#e2e8f0',
  textSec: '#8b9cc8',
  textMuted: '#4a5578',
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  amber: '#f59e0b',
};

const STATUS_COLORS = { normal: C.green, warning: C.amber, critical: C.red };
const STATUS_ICONS = {
  normal: <CheckCircle size={11} />,
  warning: <AlertTriangle size={11} />,
  critical: <AlertCircle size={11} />,
};

interface SensorCardProps {
  motor: MotorData;
  onClick: () => void;
}

function SensorCard({ motor, onClick }: SensorCardProps) {
  const [hovered, setHovered] = useState(false);
  const color = STATUS_COLORS[motor.status];
  const sparkData = motor.sparkline.map((v, i) => ({ i, v }));

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.cardHover : C.card,
        border: `1px solid ${hovered ? C.borderHover : C.border}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 10,
        padding: '10px 12px',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        boxShadow: hovered ? `0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px ${color}20` : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{motor.label}</div>
          <div style={{ fontSize: 10, color: C.textMuted }}>Vibration</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color, opacity: 0.9 }}>{STATUS_ICONS[motor.status]}</span>
          <ChevronRight size={13} color={hovered ? C.blue : C.textMuted} style={{ transition: 'color 0.18s' }} />
        </div>
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{motor.value.toFixed(2)}</span>
        <span style={{ fontSize: 10, color: C.textMuted }}>{motor.unit}</span>
      </div>

      {/* Sparkline */}
      <div style={{ height: 28 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
            <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} strokeOpacity={0.85} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface Props {
  onSelectMotor: (motor: MotorData) => void;
}

type SortKey = 'id' | 'value-asc' | 'value-desc' | 'status';

export function SensorGrid({ onSelectMotor }: Props) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('id');
  const [filterStatus, setFilterStatus] = useState<'all' | 'normal' | 'warning' | 'critical'>('all');

  const counts = useMemo(() => ({
    all: motors.length,
    normal: motors.filter(m => m.status === 'normal').length,
    warning: motors.filter(m => m.status === 'warning').length,
    critical: motors.filter(m => m.status === 'critical').length,
  }), []);

  const filtered = useMemo(() => {
    let list = motors.filter(m => {
      const matchSearch = m.label.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || m.status === filterStatus;
      return matchSearch && matchStatus;
    });

    switch (sort) {
      case 'value-asc': list = [...list].sort((a, b) => a.value - b.value); break;
      case 'value-desc': list = [...list].sort((a, b) => b.value - a.value); break;
      case 'status': list = [...list].sort((a, b) => {
        const order = { critical: 0, warning: 1, normal: 2 };
        return order[a.status] - order[b.status];
      }); break;
    }
    return list;
  }, [search, sort, filterStatus]);

  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>Real-Time Sensor Raw Data</h2>
            <p style={{ fontSize: 12, color: C.textSec, margin: 0 }}>Live vibration telemetry — {motors.length} channels monitored</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={13} color={C.textMuted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search motor..."
                style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7, borderRadius: 8, border: `1px solid ${C.border}`, background: '#080e1f', color: C.text, fontSize: 12, width: 180, outline: 'none' }}
              />
            </div>
            {/* Sort */}
            <div style={{ position: 'relative' }}>
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortKey)}
                style={{ appearance: 'none', paddingLeft: 12, paddingRight: 32, paddingTop: 7, paddingBottom: 7, borderRadius: 8, border: `1px solid ${C.border}`, background: '#080e1f', color: C.text, fontSize: 12, cursor: 'pointer', outline: 'none' }}
              >
                <option value="id">Sort: Motor ID</option>
                <option value="value-desc">Sort: Value ↓</option>
                <option value="value-asc">Sort: Value ↑</option>
                <option value="status">Sort: Status</option>
              </select>
              <ChevronDown size={12} color={C.textMuted} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {([
            { key: 'all', label: 'All', color: C.textSec },
            { key: 'normal', label: 'Normal', color: C.green },
            { key: 'warning', label: 'Warning', color: C.amber },
            { key: 'critical', label: 'Critical', color: C.red },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              style={{
                padding: '5px 14px',
                borderRadius: 20,
                border: `1px solid ${filterStatus === tab.key ? tab.color + '60' : C.border}`,
                background: filterStatus === tab.key ? `${tab.color}12` : 'transparent',
                color: filterStatus === tab.key ? tab.color : C.textSec,
                fontSize: 12,
                fontWeight: filterStatus === tab.key ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label} <span style={{ opacity: 0.7 }}>({counts[tab.key]})</span>
            </button>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 12, color: C.textMuted, display: 'flex', alignItems: 'center' }}>
            Showing {filtered.length} of {motors.length}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(152px, 1fr))', gap: 10, maxHeight: 520, overflowY: 'auto', paddingRight: 4 }}>
          {filtered.map(motor => (
            <SensorCard key={motor.id} motor={motor} onClick={() => onSelectMotor(motor)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: C.textMuted, fontSize: 13 }}>
            No motors match your search or filter.
          </div>
        )}
      </div>
    </section>
  );
}
