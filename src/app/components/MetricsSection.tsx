import type { ReactNode, CSSProperties } from 'react';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ToolConditionGauge } from './ToolConditionGauge';
import { machineParams, ToolCondition, ToolQuality, ToolRUL } from './data';

const C = {
  card:      '#0c1326',
  border:    '#1a2d50',
  text:      '#e2e8f0',
  textSec:   '#8b9cc8',
  textMuted: '#4a5578',
  blue:      '#3b82f6',
  green:     '#22c55e',
  red:       '#ef4444',
  amber:     '#f59e0b',
};

type TriStatus = 'good' | 'warning' | 'critical';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, ...style }}>
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

function Divider() {
  return <div style={{ height: 1, background: C.border, margin: '10px 0' }} />;
}

// ─── Machine Parameters ───────────────────────────────────────────────────────

function Delta({ value, unit }: { value: number; unit: string }) {
  const isUp  = value > 0;
  const color = value === 0 ? C.textSec : isUp ? C.amber : C.green;
  const Icon  = value === 0 ? Minus : isUp ? TrendingUp : TrendingDown;
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

// ─── Per-tool RUL strip ───────────────────────────────────────────────────────

function RULStrip({ rul }: { rul: ToolRUL }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
        Remaining Useful Life
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 5 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: C.amber, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {rul.hoursRemaining}
        </span>
        <span style={{ fontSize: 12, color: C.textSec }}>hrs</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: C.textMuted }}>/ {rul.maxHours}h</span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.07)', marginBottom: 4 }}>
        <div style={{
          height: '100%', borderRadius: 2,
          width: `${rul.progressPct}%`,
          background: `linear-gradient(90deg, ${C.amber}, ${C.red})`,
          transition: 'width 0.4s',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textMuted, marginBottom: 7 }}>
        <span>0h</span><span>{rul.progressPct}% consumed</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 7, background: 'rgba(245,158,11,0.08)', border: `1px solid rgba(245,158,11,0.2)` }}>
        <Clock size={10} color={C.amber} />
        <span style={{ fontSize: 10, color: C.amber }}>
          Change in <strong>{rul.changeRecommendedIn}</strong>
        </span>
      </div>
    </div>
  );
}

// ─── Quality of Product column ────────────────────────────────────────────────

function triColor(s: TriStatus) {
  return s === 'good' ? C.green : s === 'warning' ? C.amber : C.red;
}

function QoPColumn({ quality }: { quality: ToolQuality }) {
  const statuses: TriStatus[] = [
    quality.qopScore.status,
    quality.defectRate.status,
    quality.cpk.status,
    quality.surfaceRoughness.status,
  ];
  const overall: TriStatus = statuses.includes('critical')
    ? 'critical'
    : statuses.includes('warning')
    ? 'warning'
    : 'good';
  const overallColor = triColor(overall);
  const overallLabel = overall === 'good' ? 'Normal' : overall === 'warning' ? 'Warning' : 'Critical';

  const details: { label: string; value: number; unit: string; status: TriStatus }[] = [
    { label: 'QoP',    ...quality.qopScore         },
    { label: 'Defect', ...quality.defectRate       },
    { label: 'Cpk',    ...quality.cpk              },
    { label: 'Ra',     ...quality.surfaceRoughness },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Quality
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 8px', borderRadius: 6, alignSelf: 'flex-start',
        background: `${overallColor}18`,
        border: `1px solid ${overallColor}40`,
      }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: overallColor, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: overallColor }}>{overallLabel}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {details.map((r, i) => {
          const color = triColor(r.status);
          return (
            <div
              key={r.label}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '4px 0',
                borderBottom: i < details.length - 1 ? `1px solid ${C.border}50` : 'none',
              }}
            >
              <span style={{ fontSize: 10, color: C.textMuted }}>{r.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>
                  {r.value}{r.unit}
                </span>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: color, flexShrink: 0 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Single tool tile ─────────────────────────────────────────────────────────

function ToolTile({ tool, style }: { tool: ToolCondition; style?: CSSProperties }) {
  const color = tool.status === 'good' ? C.green : tool.status === 'warning' ? C.amber : C.red;

  return (
    <div style={{
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255,255,255,0.022)',
      border: `1px solid ${C.border}`,
      borderTop: `2px solid ${color}`,
      borderRadius: 10,
      padding: '14px 14px 12px',
      ...style,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.textSec, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
        {tool.label}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <ToolConditionGauge value={tool.value} status={tool.status} compact />
        {tool.quality && <QoPColumn quality={tool.quality} />}
      </div>

      {tool.rul && (
        <>
          <Divider />
          <RULStrip rul={tool.rul} />
        </>
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onOpenRULDetail: () => void;
  toolConditions?: ToolCondition[];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function MetricsSection({ onOpenRULDetail, toolConditions = [] }: Props) {
  const count = toolConditions.length;

  const tileStyle: CSSProperties =
    count <= 2
      ? { flex: '1 1 0' }
      : { flex: '1 1 200px', minWidth: 300 };

  return (
    <section style={{ marginBottom: 24 }}>
      {/*
        alignItems: 'stretch' — both columns adopt the taller card's height.
        Since Machine Parameters is the height anchor, Tool Conditions card
        fills that height without pushing it taller.
      */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 14, alignItems: 'stretch' }}>

        {/* ── Tool Conditions ───────────────────────────────────────── */}
        <Card style={{ display: 'flex', flexDirection: 'column', minWidth: 0, boxSizing: 'border-box' }}>
          <SectionLabel>{`Tool Conditions`}</SectionLabel>

          {/*
            alignItems: 'flex-start' is critical — without it, tiles stretch
            vertically to fill the card height, which looks wrong.
            overflow: 'hidden' on Y prevents tile content from pushing the
            card (and thus Machine Parameters) taller.
          */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            overflowX: 'auto',
            overflowY: 'hidden',
            paddingBottom: 6,
            scrollbarWidth: 'thin',
            scrollbarColor: `${C.border} transparent`,
          }}>
            {toolConditions.map(tool => (
              <ToolTile key={tool.id} tool={tool} style={tileStyle} />
            ))}
          </div>
        </Card>

        {/* ── Machine Parameters ────────────────────────────────────── */}
        <Card>
          <SectionLabel>Machine Parameters</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ParamRow label="Spindle Speed" {...machineParams.spindleSpeed} />
            <ParamRow label="Feed Rate"     {...machineParams.feedRate}     />
            <ParamRow label="Temperature"   {...machineParams.temperature}  />
            <ParamRow label="Coolant Flow"  {...machineParams.coolantFlow}  />
            <ParamRow label="Cutting Force" {...machineParams.cuttingForce} />
            <ParamRow label="Vibration"     {...machineParams.vibration}    />
          </div>
        </Card>

      </div>
    </section>
  );
}