import { Network } from '@capacitor/network';
import { supabase } from './supabase';
import {
  getUnsyncedRoutes,
  getUnsyncedPoints,
  markRouteSynced,
  markPointsSynced,
  getUnsyncedBikes,
  markBikeSynced,
  db,
  type LocalRoute,
  type LocalRoutePoint,
} from './db';

// ─── Estado da sincronização ──────────────────────────────────────────────────

type SyncStatus = 'idle' | 'syncing' | 'error';
type SyncListener = (status: SyncStatus, pending: number) => void;

const listeners = new Set<SyncListener>();
let currentStatus: SyncStatus = 'idle';
let isOnline = false;
let syncInProgress = false;

function emit(status: SyncStatus, pending: number) {
  currentStatus = status;
  listeners.forEach(fn => fn(status, pending));
}

export function onSyncStatus(fn: SyncListener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function getSyncStatus() {
  return currentStatus;
}

// ─── Bootstrap — ouve mudanças de rede ───────────────────────────────────────

export async function initSync() {
  const status = await Network.getStatus();
  isOnline = status.connected;
  if (isOnline) syncAll().catch(console.error);

  Network.addListener('networkStatusChange', ({ connected }) => {
    isOnline = connected;
    if (connected) syncAll().catch(console.error);
  });
}

// ─── Sincronização principal ──────────────────────────────────────────────────

export async function syncAll(): Promise<void> {
  if (syncInProgress || !isOnline) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  syncInProgress = true;
  try {
    const [unsyncedRoutes, unsyncedBikes] = await Promise.all([
      getUnsyncedRoutes(user.id),
      getUnsyncedBikes(user.id),
    ]);
    const total = unsyncedRoutes.length + unsyncedBikes.length;
    if (total === 0) { emit('idle', 0); return; }

    emit('syncing', total);
    let done = 0;

    for (const bike of unsyncedBikes) {
      await syncBike(bike);
      done++;
      emit('syncing', total - done);
    }

    for (const route of unsyncedRoutes) {
      await syncRoute(route);
      done++;
      emit('syncing', total - done);
    }

    emit('idle', 0);
  } catch (err) {
    console.error('[sync] Erro:', err);
    emit('error', 0);
  } finally {
    syncInProgress = false;
  }
}

async function syncRoute(route: LocalRoute): Promise<void> {
  // Upsert da rota
  const { error: routeErr } = await supabase.from('routes').upsert({
    id: route.id,
    user_id: route.userId,
    name: route.name,
    description: route.description,
    type: route.type,
    difficulty: route.difficulty,
    privacy: route.privacy,
    distance_km: route.distanceKm,
    duration_seconds: route.durationSeconds,
    elevation_gain: route.elevationGain,
    elevation_loss: route.elevationLoss,
    avg_speed: route.avgSpeed,
    calories: route.calories,
    cover_image: route.coverImage ?? null,
    started_at: route.startedAt ? new Date(route.startedAt).toISOString() : null,
    finished_at: route.finishedAt ? new Date(route.finishedAt).toISOString() : null,
    updated_at: new Date(route.updatedAt).toISOString(),
    deleted_at: route.deletedAt ? new Date(route.deletedAt).toISOString() : null,
  }, { onConflict: 'id' });

  if (routeErr) throw routeErr;

  // Sync dos pontos GPS em chunks de 1000
  const points = await getUnsyncedPoints(route.id);
  if (points.length > 0) {
    for (let i = 0; i < points.length; i += 1000) {
      const chunk = points.slice(i, i + 1000);
      const rows = chunk.map((p: LocalRoutePoint) => ({
        route_id: p.routeId,
        lat: p.lat,
        lng: p.lng,
        altitude: p.altitude,
        speed: p.speed,
        accuracy: p.accuracy,
        recorded_at: new Date(p.timestamp).toISOString(),
      }));
      const { error: ptErr } = await supabase.from('route_points').insert(rows);
      if (ptErr) throw ptErr;
    }
    await markPointsSynced(route.id);
  }

  await markRouteSynced(route.id);
}

// ─── Sync de bike ─────────────────────────────────────────────────────────────

async function syncBike(bike: import('./db').LocalBike): Promise<void> {
  if (bike.deletedAt) {
    const { error } = await supabase.from('bikes')
      .update({ deleted_at: new Date(bike.deletedAt).toISOString() })
      .eq('id', bike.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('bikes').upsert({
      id: bike.id,
      user_id: bike.userId,
      name: bike.name,
      type: bike.type,
      brand: bike.brand ?? null,
      model: bike.model ?? null,
      year: bike.year ?? null,
      updated_at: new Date(bike.updatedAt).toISOString(),
    }, { onConflict: 'id' });
    if (error) throw error;
  }
  await markBikeSynced(bike.id);
}

// ─── Sync de uma rota específica (chamado após salvar) ────────────────────────

export async function syncRouteNow(routeId: string): Promise<void> {
  if (!isOnline) return;
  const route = await db.routes.get(routeId);
  if (!route || route.syncedAt) return;
  try {
    await syncRoute(route);
  } catch (err) {
    console.error('[sync] syncRouteNow falhou:', err);
  }
}

export function getOnlineStatus() {
  return isOnline;
}
