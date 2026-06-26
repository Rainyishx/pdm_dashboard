import { Activity, Bell, Settings, Wifi, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

const C = {
  bg: '#080e1f',
  border: '#1a2d50',
  text: '#e2e8f0',
  textSec: '#8b9cc8',
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  amber: '#f59e0b',
};

export function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img 
              src="src\Images\images.png" 
              alt="Custom Logo" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }} 
            />
          </div>
          <div>
            <div style={{ color: C.text, fontSize: 15, fontWeight: 600, lineHeight: 1.2 }}>Predict</div>
            <div style={{ color: C.textSec, fontSize: 11, lineHeight: 1.2 }}>Predictive Maintenance Platform</div>
          </div>
        </div>
        <div style={{ width: 1, height: 32, background: C.border, margin: '0 8px' }} />

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, color: C.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{timeStr}</div>
          <div style={{ fontSize: 11, color: C.textSec }}>{dateStr}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: C.textSec }}>Machine:</span>
          <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>CNC-Haas-VF4 #12</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
          <span style={{ fontSize: 12, color: C.green, fontWeight: 500 }}>LIVE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: `1px solid rgba(239,68,68,0.3)` }}>
          <AlertTriangle size={13} color={C.red} />
          <span style={{ fontSize: 12, color: C.red, fontWeight: 500 }}>3 Active Alerts</span>
        </div>



        <div style={{ display: 'flex', gap: 4 }}>
          <button style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={16} color={C.textSec} />
          </button>
        </div>
      </div>
    </header>
  );
}
