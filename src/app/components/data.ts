// ─────────────────────────────────────────────────────────────────────────────
// data.ts  —  single source of truth for all dashboard data
// ─────────────────────────────────────────────────────────────────────────────

// ─── Interfaces ──────────────────────────────────────────────────────────────

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

export type TriStatus = 'good' | 'warning' | 'critical';

export interface ToolQualityMetric {
  value: number;
  unit: string;
  status: TriStatus;
}

export interface ToolRUL {
  hoursRemaining:      number;
  progressPct:         number;
  maxHours:            number;
  changeRecommendedIn: string;
}

export interface ToolQuality {
  qopScore:         ToolQualityMetric;
  defectRate:       ToolQualityMetric;
  cpk:              ToolQualityMetric;
  surfaceRoughness: ToolQualityMetric;
  shiftDelta?:      string;
}

export interface ToolCondition {
  id:      string;
  label:   string;
  value:   number;
  status:  TriStatus;
  rul?:    ToolRUL;
  quality?: ToolQuality;
}

// ─── Raw Sensor Interfaces ────────────────────────────────────────────────────

export interface WaveformPoint {
  t: number;   // time in ms
  v: number;   // value
}

export interface FFTPoint {
  freq: number;  // Hz
  mag: number;   // magnitude dB
}

export interface SensorChannel {
  id: string;
  label: string;
  unit: string;
  color: string;
  waveform: WaveformPoint[];
  fft: FFTPoint[];
  rms: number;
  peak: number;
  dominantFreq: number;
}

export interface ToolSensorData {
  toolId: string;
  toolLabel: string;
  status: TriStatus;
  sampleRateHz: number;
  channels: {
    x: SensorChannel;
    y: SensorChannel;
    z: SensorChannel;
    temp: SensorChannel;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1.  TOOL CONDITIONS
// ─────────────────────────────────────────────────────────────────────────────

export const toolConditions: ToolCondition[] = [
  {
    id:     't1',
    label:  'Tool 301',
    value:  72,
    status: 'warning',
    rul: {
      hoursRemaining:      42,
      progressPct:         35,
      maxHours:            120,
      changeRecommendedIn: '36h',
    },
    quality: {
      qopScore:         { value: 94.2, unit: '%',     status: 'good'    },
      defectRate:       { value: 1.4,  unit: '%',     status: 'good'    },
      cpk:              { value: 1.31, unit: '',      status: 'good'    },
      surfaceRoughness: { value: 0.82, unit: 'Ra μm', status: 'warning' },
      shiftDelta: '+2.1% vs last shift',
    },
  },
  {
    id:     't2',
    label:  'Tool 502',
    value:  91,
    status: 'good',
    rul: {
      hoursRemaining:      78,
      progressPct:         18,
      maxHours:            120,
      changeRecommendedIn: '72h',
    },
    quality: {
      qopScore:         { value: 97.1, unit: '%',     status: 'good' },
      defectRate:       { value: 0.8,  unit: '%',     status: 'good' },
      cpk:              { value: 1.52, unit: '',      status: 'good' },
      surfaceRoughness: { value: 0.61, unit: 'Ra μm', status: 'good' },
      shiftDelta: '+1.3% vs last shift',
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2.  VIBRATION THRESHOLDS
// ─────────────────────────────────────────────────────────────────────────────

export const vibrationThresholds = {
  warning:  2.8,
  critical: 4.5,
};

// ─────────────────────────────────────────────────────────────────────────────
// 3.  TOOL WEAR ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

export const wearAnalysis = {
  thresholds: { failure: 85, warning: 70 },
  currentWearPct:      67.4,
  wearRatePerHour:     '8.0%/hr',
  etaToFailHours:      2.0,
  modelConfidencePct:  91,
  modelName:           'XGBoost ensemble model',
};

// ─────────────────────────────────────────────────────────────────────────────
// 4.  RUL DISTRIBUTION MODAL
// ─────────────────────────────────────────────────────────────────────────────

export const rulDistributionData = [
  { range: '0–5h',   count: 3  },
  { range: '5–10h',  count: 7  },
  { range: '10–20h', count: 14 },
  { range: '20–30h', count: 21 },
  { range: '30–40h', count: 18 },
  { range: '40–50h', count: 11 },
  { range: '50–60h', count: 8  },
  { range: '60–80h', count: 5  },
  { range: '80h+',   count: 2  },
];

export const rulSummaryStats = [
  { label: 'Median RUL',            value: '28h',    color: '#3b82f6' as const },
  { label: 'Std Deviation',         value: '±12.4h', color: '#8b9cc8' as const },
  { label: 'Early Failures (<10h)', value: '10%',    color: '#f59e0b' as const },
  { label: 'Avg Tool Life',         value: '31.2h',  color: '#22c55e' as const },
];

export const rulToolChangeCount = 89;

// ─────────────────────────────────────────────────────────────────────────────
// 5.  MACHINE PARAMETERS
// ─────────────────────────────────────────────────────────────────────────────

export const machineParams = {
  spindleSpeed: { value: 4850, unit: 'RPM',    delta: +23,   nominal: 5000 },
  feedRate:     { value: 0.23, unit: 'mm/rev', delta: -0.01, nominal: 0.25 },
  temperature:  { value: 72.4, unit: '°C',     delta: +3.1,  nominal: 65   },
  coolantFlow:  { value: 8.7,  unit: 'L/min',  delta: -0.4,  nominal: 9.5  },
  cuttingForce: { value: 312,  unit: 'N',       delta: +18,   nominal: 280  },
  vibration:    { value: 1.82, unit: 'mm/s',   delta: +0.21, nominal: 1.5  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 6.  RAW SENSOR DATA  (waveform + FFT per axis + temperature)
// ─────────────────────────────────────────────────────────────────────────────

// Deterministic pseudo-random helper
function sr(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// Simple DFT for computing FFT magnitudes from a real signal
function computeFFT(signal: number[], sampleRateHz: number): FFTPoint[] {
  const N = signal.length;
  const freqResolution = sampleRateHz / N;
  const result: FFTPoint[] = [];
  const halfN = Math.floor(N / 2);

  for (let k = 1; k < halfN; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      re += signal[n] * Math.cos(angle);
      im -= signal[n] * Math.sin(angle);
    }
    const magnitude = Math.sqrt(re * re + im * im) / N;
    const magDb = magnitude > 1e-10 ? 20 * Math.log10(magnitude) : -120;
    result.push({
      freq: parseFloat((k * freqResolution).toFixed(2)),
      mag: parseFloat(magDb.toFixed(2)),
    });
  }
  return result;
}

// Generate a realistic vibration waveform with dominant frequency components
function generateVibrationWaveform(
  seed: number,
  sampleRateHz: number,
  durationMs: number,
  baseAmplitude: number,
  fundamentalHz: number,
  harmonics: number[],
  noiseLevel: number,
  wearFactor: number   // 0–1, higher = more harmonic distortion
): { waveform: WaveformPoint[]; fft: FFTPoint[] } {
  const N = Math.floor((sampleRateHz * durationMs) / 1000);
  const dt = 1000 / sampleRateHz; // ms per sample
  const rawSignal: number[] = [];

  for (let i = 0; i < N; i++) {
    const t = i * dt;
    let v = 0;

    // Fundamental
    v += baseAmplitude * Math.sin(2 * Math.PI * fundamentalHz * t / 1000);

    // Harmonics with wear-induced growth
    harmonics.forEach((harmMult, hi) => {
      const harmAmp = baseAmplitude * (0.3 + wearFactor * 0.4) / (hi + 2);
      v += harmAmp * Math.sin(2 * Math.PI * (fundamentalHz * harmMult) * t / 1000 + sr(seed + hi) * Math.PI);
    });

    // Side-band modulation (bearing defect signature)
    const modFreq = fundamentalHz * 0.43;
    v += baseAmplitude * 0.15 * wearFactor * Math.sin(2 * Math.PI * modFreq * t / 1000);

    // Broadband noise
    v += (sr(seed + i * 0.37) - 0.5) * noiseLevel;

    rawSignal.push(v);
  }

  const waveform: WaveformPoint[] = rawSignal.map((v, i) => ({
    t: parseFloat((i * dt).toFixed(3)),
    v: parseFloat(v.toFixed(4)),
  }));

  // Use a 512-point window for FFT (power of 2 for efficiency feel, pure DFT here)
  const fftWindow = rawSignal.slice(0, Math.min(512, rawSignal.length));
  const fft = computeFFT(fftWindow, sampleRateHz);

  return { waveform, fft };
}

// Generate temperature waveform (much lower frequency, thermal drift)
function generateTempWaveform(
  seed: number,
  sampleRateHz: number,
  durationMs: number,
  baseTemp: number,
  wearFactor: number
): { waveform: WaveformPoint[]; fft: FFTPoint[] } {
  const N = Math.floor((sampleRateHz * durationMs) / 1000);
  const dt = 1000 / sampleRateHz;
  const rawSignal: number[] = [];

  for (let i = 0; i < N; i++) {
    const t = i * dt;
    // Slow thermal oscillation + wear-induced rise
    const drift = wearFactor * 8 * (i / N);
    const thermal = 1.2 * Math.sin(2 * Math.PI * 0.8 * t / 1000);
    const noise = (sr(seed + i * 0.19) - 0.5) * 0.4;
    rawSignal.push(baseTemp + drift + thermal + noise);
  }

  const waveform: WaveformPoint[] = rawSignal.map((v, i) => ({
    t: parseFloat((i * dt).toFixed(3)),
    v: parseFloat(v.toFixed(3)),
  }));

  const fftWindow = rawSignal.slice(0, Math.min(512, rawSignal.length));
  const fft = computeFFT(fftWindow, sampleRateHz);

  return { waveform, fft };
}

function buildToolSensorData(
  toolId: string,
  toolLabel: string,
  status: TriStatus,
  seed: number,
  spindleHz: number,         // fundamental vibration frequency
  wearFactor: number         // 0 = new, 1 = near end of life
): ToolSensorData {
  const SAMPLE_RATE = 5120;  // Hz  (typical for vibration DAQ)
  const DURATION_MS = 200;   // 200ms capture window → 1024 samples @5120Hz

  const xData = generateVibrationWaveform(seed + 1,  SAMPLE_RATE, DURATION_MS, 1.8 + wearFactor * 1.4, spindleHz,      [2, 3, 4, 5], 0.25, wearFactor);
  const yData = generateVibrationWaveform(seed + 50, SAMPLE_RATE, DURATION_MS, 1.4 + wearFactor * 1.1, spindleHz,      [2, 3, 4],    0.20, wearFactor);
  const zData = generateVibrationWaveform(seed + 99, SAMPLE_RATE, DURATION_MS, 2.1 + wearFactor * 1.8, spindleHz * 1.5,[2, 3],       0.30, wearFactor);
  const tData = generateTempWaveform(seed + 200, 64, DURATION_MS * 20, 68 + wearFactor * 8, wearFactor); // lower SR for temp

  const rms = (data: number[]) => parseFloat(Math.sqrt(data.reduce((s, v) => s + v * v, 0) / data.length).toFixed(4));
  const domFreq = (fft: FFTPoint[]) => fft.reduce((best, p) => p.mag > best.mag ? p : best, fft[0]).freq;

  const xVals  = xData.waveform.map(p => p.v);
  const yVals  = yData.waveform.map(p => p.v);
  const zVals  = zData.waveform.map(p => p.v);
  const tVals  = tData.waveform.map(p => p.v);

  return {
    toolId,
    toolLabel,
    status,
    sampleRateHz: SAMPLE_RATE,
    channels: {
      x: {
        id: 'x', label: 'X-Axis Vibration', unit: 'mm/s', color: '#3b82f6',
        waveform: xData.waveform, fft: xData.fft,
        rms: rms(xVals), peak: parseFloat(Math.max(...xVals.map(Math.abs)).toFixed(4)),
        dominantFreq: domFreq(xData.fft),
      },
      y: {
        id: 'y', label: 'Y-Axis Vibration', unit: 'mm/s', color: '#a855f7',
        waveform: yData.waveform, fft: yData.fft,
        rms: rms(yVals), peak: parseFloat(Math.max(...yVals.map(Math.abs)).toFixed(4)),
        dominantFreq: domFreq(yData.fft),
      },
      z: {
        id: 'z', label: 'Z-Axis Vibration', unit: 'mm/s', color: '#f59e0b',
        waveform: zData.waveform, fft: zData.fft,
        rms: rms(zVals), peak: parseFloat(Math.max(...zVals.map(Math.abs)).toFixed(4)),
        dominantFreq: domFreq(zData.fft),
      },
      temp: {
        id: 'temp', label: 'Temperature', unit: '°C', color: '#ef4444',
        waveform: tData.waveform, fft: tData.fft,
        rms: rms(tVals), peak: parseFloat(Math.max(...tVals).toFixed(3)),
        dominantFreq: domFreq(tData.fft),
      },
    },
  };
}

// Tool 301 — worn, warning state, higher wear factor
export const tool301SensorData: ToolSensorData = buildToolSensorData(
  't1', 'Tool 301', 'warning', 1337, 80.83, 0.62   // 4850 RPM → ~80.83 Hz
);

// Tool 502 — healthy, lower wear factor
export const tool502SensorData: ToolSensorData = buildToolSensorData(
  't2', 'Tool 502', 'good', 9871, 80.83, 0.18
);

export const allToolSensorData: ToolSensorData[] = [tool301SensorData, tool502SensorData];

// ─────────────────────────────────────────────────────────────────────────────
// 7.  TOOL WEAR CHART  (time-series)
// ─────────────────────────────────────────────────────────────────────────────

export const toolWearChartData: WearPoint[] = (() => {
  const data: WearPoint[] = [];
  const now   = Date.now();
  const start = now - 6 * 3600 * 1000;
  const end   = now + 2 * 3600 * 1000;
  const N     = 200;

  for (let i = 0; i < N; i++) {
    const ts       = start + (i / (N - 1)) * (end - start);
    const isActual = ts <= now;
    const d        = new Date(ts);
    const time     = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    if (isActual) {
      const t        = (ts - start) / (6 * 3600 * 1000);
      const baseWear = 20 + Math.pow(t, 1.05) * 48;
      const noise    = Math.sin(i * 0.71) * 1.8 + Math.sin(i * 2.3) * 0.7 + (sr(i * 3.7) - 0.5) * 1.2;
      data.push({ time, ts, actual: parseFloat(Math.max(0, baseWear + noise).toFixed(2)), predicted: null });
    } else {
      const t             = (ts - now) / (2 * 3600 * 1000);
      const predictedWear = wearAnalysis.currentWearPct + t * 18.2;
      data.push({ time, ts, actual: null, predicted: parseFloat(predictedWear.toFixed(2)) });
    }
  }

  const lastActualIdx = [...data].reverse().findIndex(d => d.actual !== null);
  const trueIdx       = data.length - 1 - lastActualIdx;
  if (trueIdx >= 0) data[trueIdx].predicted = data[trueIdx].actual;
  return data;
})();