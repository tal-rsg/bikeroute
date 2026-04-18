import { create } from 'zustand';
import { v4 as uuid } from '../lib/uuid';
import { gpsTracker, type TrackStats } from '../lib/gps';
import { savePoints, saveRoute } from '../lib/db';
import { syncRouteNow } from '../lib/sync';
import type { LocalRoute } from '../lib/db';

type RecordState = 'idle' | 'recording' | 'paused' | 'summary';

interface RecordingStore {
  state: RecordState;
  routeId: string | null;
  stats: TrackStats;
  activityType: 'urbano' | 'trilha' | 'estrada';
  gpsError: string | null;

  setActivityType: (t: 'urbano' | 'trilha' | 'estrada') => void;
  start: (userId: string) => Promise<boolean>;
  pause: () => Promise<void>;
  resume: (userId: string) => Promise<void>;
  stop: () => void;
  save: (userId: string, name: string) => Promise<LocalRoute>;
  discard: () => void;
}

const emptyStats: TrackStats = {
  distanceKm: 0, durationSeconds: 0, avgSpeed: 0, currentSpeed: 0,
  elevationGain: 0, elevationLoss: 0, calories: 0, pointCount: 0,
};

export const useRecording = create<RecordingStore>((set, get) => ({
  state: 'idle',
  routeId: null,
  stats: emptyStats,
  activityType: 'urbano',
  gpsError: null,

  setActivityType: (t) => set({ activityType: t }),

  start: async (userId) => {
    const routeId = uuid();
    set({ routeId, gpsError: null });

    const ok = await gpsTracker.start(routeId, {
      onStats: (stats) => set({ stats }),
      onPoint: (_point, stats) => set({ stats }),
      onFlush: async (points) => {
        await savePoints(points);
      },
    });

    if (!ok) {
      set({ gpsError: 'Permissão de GPS negada. Habilite nas configurações.', state: 'idle' });
      return false;
    }

    set({ state: 'recording' });
    return true;
  },

  pause: async () => {
    // Mantemos o watchPosition ativo mas sinalizamos pausa na UI
    // (os pontos gravados durante a pausa são descartados na exibição mas o GPS continua)
    set({ state: 'paused' });
  },

  resume: async (userId) => {
    set({ state: 'recording' });
  },

  stop: () => {
    set({ state: 'summary' });
    gpsTracker.stop();
  },

  save: async (userId, name) => {
    const { routeId, stats, activityType } = get();
    const id = routeId ?? uuid();
    const now = Date.now();

    const route: LocalRoute = {
      id,
      userId,
      name,
      description: '',
      type: activityType,
      difficulty: 'easy',
      privacy: 'public',
      distanceKm: stats.distanceKm,
      durationSeconds: stats.durationSeconds,
      elevationGain: stats.elevationGain,
      elevationLoss: stats.elevationLoss,
      avgSpeed: stats.avgSpeed,
      calories: stats.calories,
      startedAt: now - stats.durationSeconds * 1000,
      finishedAt: now,
      createdAt: now,
      updatedAt: now,
      syncedAt: undefined,
    };

    await saveRoute(route);
    await syncRouteNow(id); // tenta sync imediato se houver rede

    set({ state: 'idle', routeId: null, stats: emptyStats });
    return route;
  },

  discard: () => {
    gpsTracker.stop();
    set({ state: 'idle', routeId: null, stats: emptyStats });
  },
}));
