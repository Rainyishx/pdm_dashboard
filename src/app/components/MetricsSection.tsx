import type { ReactNode, CSSProperties } from 'react';
import { Clock, TrendingUp, TrendingDown, Minus, Info, ChevronRight } from 'lucide-react';
import { ToolConditionGauge } from './ToolConditionGauge';
import { machineParams, qualityParams } from './data';

const C = {
  card:     '#0c1326',
  border:   '#1a2d50',
  text:     '#e2e8f0',
  textSec:  '#8b9cc8',
  textMuted:'#4a5578',
  blue:     '#3b82f6',
  green:    '#22c55e',
  red:      '#ef4444',
  amber:    '#f59e0b',
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ToolCondition {
  id:            string;
  label:         string;
  value:         number;
  status:        'good' | 'warning' | 'critical';
  // optional info-strip fields
  wearRate?:     string;   // e.g. "0.02 mm/h"
  lastChanged?:  string;   // e.g. "12h ago"
  estRemaining?: string;   // e.g. "36h"
  runCount?:     number;
}

interface CardProps { children: ReactNode; style?: CSSProperties; }

interface Props {
  onOpenRULDetail:  () => void;
  toolConditions?:  ToolCondition[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Card({ children, style }: CardProps) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px', ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
      {children}
    </div>
  );
}

function Delta({ value, unit }: { value: number; unit: string }) {
  const isFlat = value === 0;
  const isUp   = value > 0;
  const color  = isFlat ? C.textSec : isUp ? C.amber : C.green;
  const Icon   = isFlat ? Minus : isUp ? TrendingUp : TrendingDown;
  return (
    <span style={{ fontSize: 11, color, display: 'flex', alignItems: 'center', gap: 3 }}>
      <Icon size={11} />{isUp ? '+' : ''}{value} {unit}
    </span>
  );
}

function ParamRow({ label, value, unit, delta, nominal }: {
  label: string; value: number; unit: string; delta: number; nominal: number;
}) {
  const pct      = (value / nominal) * 100;
  const barColor = Math.abs(pct - 100) > 10 ? C.amber : C.green;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: C.textSec }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontVariantNumeric: 'tabular-nums' }}>
          {value} <span style={{ fontSize: 10, fontWeight: 400, color: C.textMuted }}>{unit}</span>
        </span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ height: '100%', borderRadius: 2, width: `${Math.min(100, pct)}%`, background: barColor, transition: 'width 0.4s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Delta value={delta} unit={unit} />
        <span style={{ fontSize: 10, color: C.textMuted }}>Nom: {nominal} {unit}</span>
      </div>
    </div>
  );
}

function QoPRow({ label, value, unit, status }: {
  label: string; value: number; unit: string; status: 'good' | 'warning' | 'critical';
}) {
  const color = status === 'good' ? C.green : status === 'warning' ? C.amber : C.red;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${C.border}40` }}>
      <span style={{ fontSize: 11, color: C.textSec }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}{unit}</span>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
      </div>
    </div>
  );
}

const DEFAULT_TOOLS: ToolCondition[] = [
  { id: 'default', label: '', value: 72, status: 'warning' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export function MetricsSection({ onOpenRULDetail, toolConditions = DEFAULT_TOOLS }: Props) {
  const multi    = toolConditions.length > 1;
  const compact  = multi;
  const scrollable = toolConditions.length > 3;

  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 210px 240px 200px', gap: 14, alignItems: 'stretch' }}>

        {/* ── Tool Conditions ───────────────────────────────────────── */}
        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <SectionLabel>Tool Condition{multi ? `s (${toolConditions.length})` : ''}</SectionLabel>

          <div style={{
            flex: 1,
            display: 'flex',
            flexWrap: scrollable ? 'nowrap' : 'wrap',
            overflowX: scrollable ? 'auto' : 'visible',
            gap: 10,
            alignItems: 'stretch',       // tiles stretch to fill card height
            paddingBottom: 4,
          }}>
            {toolConditions.map(tool => (
              <div
                key={tool.id}
                style={{
                  // Each tile grows equally and fills the full height of the row
                  flex: scrollable ? '0 0 auto' : '1 1 0',
                  minWidth: compact ? 170 : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: multi ? '12px 14px 14px' : 0,
                  borderRadius: 10,
                  background: multi ? 'rgba(255,255,255,0.025)' : 'transparent',
                  border: multi ? `1px solid ${C.border}` : 'none',
                }}
              >
                <ToolConditionGauge
                  value={tool.value}
                  status={tool.status}
                  label={multi ? tool.label : undefined}
                  compact={compact}
                  wearRate={tool.wearRate}
                  lastChanged={tool.lastChanged}
                  estRemaining={tool.estRemaining}
                  runCount={tool.runCount}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* ── RUL ───────────────────────────────────────────────────── */}
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <SectionLabel>Remaining Useful Life</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 40, fontWeight: 700, color: C.amber, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>42</span>
              <span style={{ fontSize: 15, color: C.textSec }}>hrs</span>
            </div>
            <div style={{ fontSize: 11, color: C.textSec, marginBottom: 14 }}>Estimated until failure threshold</div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', marginBottom: 6 }}>
              <div style={{ height: '100%', width: '35%', borderRadius: 2, background: `linear-gradient(90deg, ${C.amber}, ${C.red})` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textMuted, marginBottom: 14 }}>
              <span>0h</span><span>RUL Progress</span><span>120h</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: `1px solid rgba(245,158,11,0.2)` }}>
              <Clock size={12} color={C.amber} />
              <span style={{ fontSize: 11, color: C.amber }}>Change recommended in <strong>36h</strong></span>
            </div>
            <button onClick={onOpenRULDetail} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, color: C.blue, cursor: 'pointer', background: 'transparent', border: 'none', padding: '4px 0' }}>
              <Info size={12} />View Prediction Details<ChevronRight size={12} />
            </button>
          </div>
        </Card>

        {/* ── Machine Parameters ────────────────────────────────────── */}
        <Card>
          <SectionLabel>Machine Parameters</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ParamRow label="Spindle Speed" value={machineParams.spindleSpeed.value} unit={machineParams.spindleSpeed.unit} delta={machineParams.spindleSpeed.delta} nominal={machineParams.spindleSpeed.nominal} />
            <ParamRow label="Feed Rate"     value={machineParams.feedRate.value}     unit={machineParams.feedRate.unit}     delta={machineParams.feedRate.delta}     nominal={machineParams.feedRate.nominal} />
            <ParamRow label="Temperature"   value={machineParams.temperature.value}  unit={machineParams.temperature.unit}  delta={machineParams.temperature.delta}  nominal={machineParams.temperature.nominal} />
            <ParamRow label="Coolant Flow"  value={machineParams.coolantFlow.value}  unit={machineParams.coolantFlow.unit}  delta={machineParams.coolantFlow.delta}  nominal={machineParams.coolantFlow.nominal} />
            <ParamRow label="Cutting Force" value={machineParams.cuttingForce.value} unit={machineParams.cuttingForce.unit} delta={machineParams.cuttingForce.delta} nominal={machineParams.cuttingForce.nominal} />
            <ParamRow label="Vibration"     value={machineParams.vibration.value}    unit={machineParams.vibration.unit}    delta={machineParams.vibration.delta}    nominal={machineParams.vibration.nominal} />
          </div>
        </Card>

        {/* ── Quality of Product ────────────────────────────────────── */}
        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <SectionLabel>Quality of Product</SectionLabel>
          <div style={{ flex: 1 }}>
            <QoPRow label="QoP Score"   value={qualityParams.qopScore.value}         unit="%"   status={qualityParams.qopScore.status} />
            <QoPRow label="Defect Rate" value={qualityParams.defectRate.value}       unit="%"   status={qualityParams.defectRate.status} />
            <QoPRow label="Cpk Index"   value={qualityParams.cpk.value}              unit=""    status={qualityParams.cpk.status} />
            <QoPRow label="Surface Ra"  value={qualityParams.surfaceRoughness.value} unit=" μm" status={qualityParams.surfaceRoughness.status} />
          </div>
          <div style={{ marginTop: 14, padding: '9px', borderRadius: 8, background: 'rgba(34,197,94,0.07)', border: `1px solid rgba(34,197,94,0.2)`, textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: C.green }}>▲ 2.1% vs last shift</span>
          </div>
        </Card>

      </div>
    </section>
  );
}