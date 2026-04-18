import Dexie, { type Table } from 'dexie';

// ─── Tipos locais ─────────────────────────────────────────────────────────────

export interface LocalRoute {
  id: string;              // UUID gerado localmente
  userId: string;
  name: string;
  description: string;
  type: 'urbano' | 'trilha' | 'estrada';
  difficulty: 'easy' | 'medium' | 'hard';
  privacy: 'public' | 'private';
  distanceKm: number;
  durationSeconds: number;
  elevationGain: number;
  elevationLoss: number;
  avgSpeed: number;
  calories: number;
  coverImage?: string;
  startedAt: number;       // Unix ms
  finishedAt: number;
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;       // undefined = ainda não sincronizado
  deletedAt?: number;      // soft delete
}

export interface LocalRoutePoint {
  id?: number;             // autoincrement local
  routeId: string;
  lat: number;
  lng: number;
  altitude: number;
  speed: number;
  accuracy: number;
  timestamp: number;       // Unix ms
  syncedAt?: number;
}

// ─── Banco Dexie (IndexedDB) ──────────────────────────────────────────────────

class BikeRouteDB extends Dexie {
  routes!: Table<LocalRoute, string>;
  routePoints!: Table<LocalRoutePoint, number>;

  constructor() {
    super('BikeRouteDB');
    this.version(1).stores({
      routes:      'id, userId, type, startedAt, updatedAt, syncedAt, deletedAt',
      routePoints: '++id, routeId, timestamp, syncedAt',
    });
  }
}

export const db = new BikeRouteDB();

// ─── Helpers de rota ─────────────────────────────────────────────────────────

export async function saveRoute(route: LocalRoute): Promise<void> {
  await db.routes.put(route);
}

export async function getRoutes(userId: string): Promise<LocalRoute[]> {
  return db.routes
    .where('userId').equals(userId)
    .filter(r => !r.deletedAt)
    .reverse()
    .sortBy('startedAt');
}

export async function getRoute(id: string): Promise<LocalRoute | undefined> {
  return db.routes.get(id);
}

export async function updateRoute(id: string, changes: Partial<LocalRoute>): Promise<void> {
  await db.routes.update(id, { ...changes, updatedAt: Date.now(), syncedAt: undefined });
}

export async function softDeleteRoute(id: string): Promise<void> {
  await db.routes.update(id, { deletedAt: Date.now(), updatedAt: Date.now(), syncedAt: undefined });
}

export async function getUnsyncedRoutes(userId: string): Promise<LocalRoute[]> {
  return db.routes
    .where('userId').equals(userId)
    .filter(r => r.syncedAt === undefined)
    .toArray();
}

// ─── Helpers de pontos GPS ────────────────────────────────────────────────────

export async function savePoints(points: LocalRoutePoint[]): Promise<void> {
  await db.routePoints.bulkAdd(points);
}

export async function getRoutePoints(routeId: string): Promise<LocalRoutePoint[]> {
  return db.routePoints
    .where('routeId').equals(routeId)
    .sortBy('timestamp');
}

export async function getUnsyncedPoints(routeId: string): Promise<LocalRoutePoint[]> {
  return db.routePoints
    .where('routeId').equals(routeId)
    .filter(p => p.syncedAt === undefined)
    .toArray();
}

export async function markPointsSynced(routeId: string): Promise<void> {
  const now = Date.now();
  await db.routePoints
    .where('routeId').equals(routeId)
    .modify({ syncedAt: now });
}

export async function markRouteSynced(id: string): Promise<void> {
  await db.routes.update(id, { syncedAt: Date.now() });
}

// ─── Export JSON ──────────────────────────────────────────────────────────────

export async function exportRoutesJSON(userId: string): Promise<string> {
  const routes = await getRoutes(userId);
  const payload = await Promise.all(
    routes.map(async (r) => {
      const points = await getRoutePoints(r.id);
      return {
        ...r,
        track: {
          type: 'LineString',
          coordinates: points.map(p => [p.lng, p.lat, p.altitude]),
        },
      };
    })
  );
  return JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString(), routes: payload }, null, 2);
}

// ─── Export GPX ───────────────────────────────────────────────────────────────

export async function exportRouteGPX(routeId: string): Promise<string> {
  const route = await getRoute(routeId);
  if (!route) throw new Error('Rota não encontrada');
  const points = await getRoutePoints(routeId);

  const trkpts = points
    .map(p => {
      const dt = new Date(p.timestamp).toISOString();
      return `    <trkpt lat="${p.lat}" lon="${p.lng}">
      <ele>${p.altitude.toFixed(1)}</ele>
      <time>${dt}</time>
      <extensions><speed>${p.speed.toFixed(1)}</speed></extensions>
    </trkpt>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="BikeRoute" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${route.name}</name><time>${new Date(route.startedAt).toISOString()}</time></metadata>
  <trk>
    <name>${route.name}</name>
    <type>${route.type}</type>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}
