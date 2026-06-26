import { useState } from 'react';
import { Header } from './components/Header';
import { MetricsSection } from './components/MetricsSection';
import { ToolWearChart } from './components/ToolWearChart';
import { SensorGrid } from './components/SensorGrid';
import { DrillDownPanel } from './components/DrillDownPanel';
import { RULModal } from './components/RULModal';
import { MotorData } from './components/data';

export default function App() {
  const [selectedMotor, setSelectedMotor] = useState<MotorData | null>(null);
  const [showRULModal, setShowRULModal] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050914',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: '#e2e8f0',
      }}
    >
      <Header />
      <main style={{ padding: '24px 28px', maxWidth: 1920, margin: '0 auto' }}>
        <MetricsSection onOpenRULDetail={() => setShowRULModal(true)}
          toolConditions={[
          { id: 't1', label: 'Tool 1 — Spindle',  value: 72, status: 'warning'  },
          { id: 't2', label: 'Tool 2 — Drill',    value: 91, status: 'good'     },
          { id: 't3', label: 'Tool 3 — Mill',     value: 38, status: 'critical' },
        ]} />
        <ToolWearChart onOpenRULModal={() => setShowRULModal(true)} />
        <SensorGrid onSelectMotor={setSelectedMotor} />
      </main>

      <DrillDownPanel
        motor={selectedMotor}
        onClose={() => setSelectedMotor(null)}
      />
      <RULModal open={showRULModal} onClose={() => setShowRULModal(false)} />
    </div>
  );
}
