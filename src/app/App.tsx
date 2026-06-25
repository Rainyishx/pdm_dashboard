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
        <MetricsSection onOpenRULDetail={() => setShowRULModal(true)} />
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
