import { Geolocation, type WatchPositionCallback } from '@capacitor/geolocation';
import type { LocalRoutePoint } from './db';

// ─── Cálculos geoespaciais ────────────────────────────────────────────────────

const R = 6371000; // raio da Terra em metros

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calcElevation(points: { altitude: number }[]): { gain: number; loss: number } {
  let gain = 0, loss = 0;
  for (let i = 1; i < points.length; i++) {
    const diff = points[i].altitude - points[i - 1].altitude;
    if (diff > 0) gain += diff;
    else loss += Math.abs(diff);
  }
  return { gain: Math.round(gain), loss: Math.round(loss) };
}

export function calcCalories(distanceKm: number, durationSeconds: number): number {
  // Estimativa: ~35 kcal/km para ciclismo moderado
  return Math.round(distanceKm * 35 + durationSeconds / 60 * 0.1);
}

// ─── GPS Tracker ──────────────────────────────────────────────────────────────

export type GpsStatus = 'idle' | 'acquiring' | 'tracking' | 'error';

export interface TrackStats {
  distanceKm: number;
  durationSeconds: number;
  avgSpeed: number;
  currentSpeed: number;
  elevationGain: number;
  elevationLoss: number;
  calories: number;
  pointCount: number;
}

type StatsCallback = (stats: TrackStats) => void;
type PointCallback = (point: LocalRoutePoint, stats: TrackStats) => void;

class GpsTracker {
  private watchId: string | null = null;
  private routeId: string | null = null;
  private startTime = 0;
  private points: LocalRoutePoint[] = [];
  private buffer: LocalRoutePoint[] = [];
  private onStats: StatsCallback | null = null;
  private onPoint: PointCallback | null = null;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private onFlush: ((points: LocalRoutePoint[]) => Promise<void>) | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const perm = await Geolocation.requestPermissions();
      return perm.location === 'granted';
    } catch {
      return false;
    }
  }

  async start(
    routeId: string,
    callbacks: {
      onStats: StatsCallback;
      onPoint: PointCallback;
      onFlush: (points: LocalRoutePoint[]) => Promise<void>;
    },
  ): Promise<boolean> {
    const ok = await this.requestPermissions();
    if (!ok) return false;

    this.routeId = routeId;
    this.startTime = Date.now();
    this.points = [];
    this.buffer = [];
    this.onStats = callbacks.onStats;
    this.onPoint = callbacks.onPoint;
    this.onFlush = callbacks.onFlush;

    // Flush ao banco local a cada 10 segundos
    this.flushTimer = setInterval(() => this.flush(), 10_000);

    const handler: WatchPositionCallback = (position, err) => {
      if (err || !position) return;
      const { latitude: lat, longitude: lng, altitude, speed, accuracy } = position.coords;
      const point: LocalRoutePoint = {
        routeId: routeId,
        lat,
        lng,
        altitude: altitude ?? 0,
        speed: speed ? speed * 3.6 : 0, // m/s → km/h
        accuracy: accuracy ?? 0,
        timestamp: position.timestamp,
      };
      this.addPoint(point);
    };

    this.watchId = (
      await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
        handler,
      )
    ) as unknown as string;

    return true;
  }

  private addPoint(point: LocalRoutePoint) {
    this.points.push(point);
    this.buffer.push(point);
    const stats = this.computeStats();
    this.onPoint?.(point, stats);
    this.onStats?.(stats);
  }

  private async flush() {
    if (this.buffer.length === 0 || !this.onFlush) return;
    const batch = [...this.buffer];
    this.buffer = [];
    try {
      await this.onFlush(batch);
    } catch {
      // Recoloca no buffer em caso de falha
      this.buffer = [...batch, ...this.buffer];
    }
  }

  async stop(): Promise<LocalRoutePoint[]> {
    if (this.watchId) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush(); // flush final
    const pts = [...this.points];
    this.points = [];
    this.buffer = [];
    this.routeId = null;
    return pts;
  }

  computeStats(): TrackStats {
    const pts = this.points;
    if (pts.length === 0) {
      return { distanceKm: 0, durationSeconds: 0, avgSpeed: 0, currentSpeed: 0, elevationGain: 0, elevationLoss: 0, calories: 0, pointCount: 0 };
    }
    let distM = 0;
    for (let i = 1; i < pts.length; i++) {
      distM += haversineDistance(pts[i - 1].lat, pts[i - 1].lng, pts[i].lat, pts[i].lng);
    }
    const distanceKm = distM / 1000;
    const durationSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const avgSpeed = durationSeconds > 0 ? (distanceKm / durationSeconds) * 3600 : 0;
    const currentSpeed = pts[pts.length - 1].speed;
    const { gain, loss } = calcElevation(pts);
    return {
      distanceKm: +distanceKm.toFixed(3),
      durationSeconds,
      avgSpeed: +avgSpeed.toFixed(1),
      currentSpeed: +currentSpeed.toFixed(1),
      elevationGain: gain,
      elevationLoss: loss,
      calories: calcCalories(distanceKm, durationSeconds),
      pointCount: pts.length,
    };
  }

  isTracking() {
    return this.watchId !== null;
  }
}

// Singleton — uma instância por app
export const gpsTracker = new GpsTracker();
