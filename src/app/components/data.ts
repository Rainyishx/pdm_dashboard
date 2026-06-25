export interface MotorData {
  id: string;
  label: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  sparkline: number[];
  baseValue: number;
}

export interface WearPoint {
  time: string;
  ts: number;
  actual: number | null;
  predicted: number | null;
}

export interface AlertEntry {
  id: string;
  timestamp: string;
  type: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
}

export interface MotorStats {
  mean: number;
  peak: number;
  min: number;
  variance: number;
  stdDev: number;
}

function sr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export const toolWearChartData: WearPoint[] = (() => {
  const data: WearPoint[] = [];
  const now = Date.now();
  const start = now - 6 * 3600 * 1000;
  const end = now + 2 * 3600 * 1000;
  const totalPoints = 200;

  for (let i = 0; i < totalPoints; i++) {
    const ts = start + (i / (totalPoints - 1)) * (end - start);
    const isActual = ts <= now;
    const d = new Date(ts);
    const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    if (isActual) {
      const t = (ts - start) / (6 * 3600 * 1000);
      const baseWear = 20 + Math.pow(t, 1.05) * 48;
      const noise = Math.sin(i * 0.71) * 1.8 + Math.sin(i * 2.3) * 0.7 + (sr(i * 3.7) - 0.5) * 1.2;
      data.push({ time, ts, actual: parseFloat(Math.max(0, baseWear + noise).toFixed(2)), predicted: null });
    } else {
      const t = (ts - now) / (2 * 3600 * 1000);
      const predictedWear = 67.4 + t * 18.2;
      data.push({ time, ts, actual: null, predicted: parseFloat(predictedWear.toFixed(2)) });
    }
  }

  const lastActualIdx = [...data].reverse().findIndex(d => d.actual !== null);
  const trueIdx = data.length - 1 - lastActualIdx;
  if (trueIdx >= 0) data[trueIdx].predicted = data[trueIdx].actual;

  return data;
})();

const WARNING_STATUSES = new Set([10, 22, 37, 43, 50, 54, 60, 66, 70]);
const CRITICAL_STATUSES = new Set([4, 28, 62]);

export const motors: MotorData[] = Array.from({ length: 72 }, (_, i) => {
  const id = (i + 1).toString().padStart(2, '0');
  const seed = i * 13.7;

  let status: 'normal' | 'warning' | 'critical';
  let baseValue: number;

  if (CRITICAL_STATUSES.has(i)) {
    status = 'critical';
    baseValue = 4.6 + sr(seed) * 0.9;
  } else if (WARNING_STATUSES.has(i)) {
    status = 'warning';
    baseValue = 2.9 + sr(seed) * 1.4;
  } else {
    status = 'normal';
    baseValue = 0.4 + sr(seed) * 2.2;
  }

  const sparkline = Array.from({ length: 60 }, (_, j) => {
    const noise = (sr(seed + j * 0.17 + 1) - 0.5) * baseValue * 0.3;
    const trend = status === 'critical' ? j * 0.003 : status === 'warning' ? j * 0.001 : 0;
    return Math.max(0.05, parseFloat((baseValue + noise + trend).toFixed(3)));
  });

  return { id: `MTR-${id}`, label: `Motor ${id}`, value: parseFloat(baseValue.toFixed(2)), unit: 'mm/s', status, sparkline, baseValue };
});

export function getMotorDetailData(motor: MotorData): { chartData: { time: string; value: number }[]; stats: MotorStats; alerts: AlertEntry[] } {
  const now = Date.now();
  const start = now - 24 * 3600 * 1000;
  const seed = motor.baseValue * 100;

  const chartData = Array.from({ length: 288 }, (_, i) => {
    const ts = start + i * 5 * 60 * 1000;
    const noise = (sr(seed + i * 0.23) - 0.5) * motor.baseValue * 0.35;
    const trend = motor.status === 'critical' ? i * 0.004 : motor.status === 'warning' ? i * 0.0015 : 0;
    const spike = sr(seed + i * 1.7) > 0.96 ? motor.baseValue * 0.4 : 0;
    const value = Math.max(0.05, motor.baseValue + noise + trend + spike);
    const d = new Date(ts);
    const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    return { time, value: parseFloat(value.toFixed(3)) };
  });

  const values = chartData.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const peak = Math.max(...values);
  const min = Math.min(...values);
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const warnThreshold = motor.status === 'critical' ? 4.5 : motor.status === 'warning' ? 2.8 : 2.8;
  const alerts: AlertEntry[] = [];

  chartData.forEach((point, i) => {
    if (point.value > warnThreshold && sr(seed + i * 1.3) < 0.08) {
      const ts = start + i * 5 * 60 * 1000;
      const d = new Date(ts);
      alerts.push({
        id: `ALT-${i}`,
        timestamp: d.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        type: point.value > 4.5 ? 'critical' : 'warning',
        message: `Vibration exceeded ${point.value > 4.5 ? 'critical' : 'warning'} threshold`,
        value: point.value,
        threshold: warnThreshold,
      });
    }
  });

  return {
    chartData,
    stats: { mean: parseFloat(mean.toFixed(3)), peak: parseFloat(peak.toFixed(3)), min: parseFloat(min.toFixed(3)), variance: parseFloat(variance.toFixed(4)), stdDev: parseFloat(stdDev.toFixed(4)) },
    alerts: alerts.slice(0, 8),
  };
}

export const rulDistributionData = [
  { range: '0–5h', count: 3 },
  { range: '5–10h', count: 7 },
  { range: '10–20h', count: 14 },
  { range: '20–30h', count: 21 },
  { range: '30–40h', count: 18 },
  { range: '40–50h', count: 11 },
  { range: '50–60h', count: 8 },
  { range: '60–80h', count: 5 },
  { range: '80h+', count: 2 },
];

export const machineParams = {
  spindleSpeed: { value: 4850, unit: 'RPM', delta: +23, nominal: 5000 },
  feedRate: { value: 0.23, unit: 'mm/rev', delta: -0.01, nominal: 0.25 },
  temperature: { value: 72.4, unit: '°C', delta: +3.1, nominal: 65 },
  coolantFlow: { value: 8.7, unit: 'L/min', delta: -0.4, nominal: 9.5 },
  cuttingForce: { value: 312, unit: 'N', delta: +18, nominal: 280 },
  vibration: { value: 1.82, unit: 'mm/s', delta: +0.21, nominal: 1.5 },
};

export const qualityParams = {
  qopScore: { value: 94.2, unit: '%', status: 'good' as const },
  defectRate: { value: 1.4, unit: '%', status: 'good' as const },
  cpk: { value: 1.31, unit: '', status: 'good' as const },
  surfaceRoughness: { value: 0.82, unit: 'Ra μm', status: 'warning' as const },
};
