import { create } from 'zustand';
import {
  getRoutes, getRoute, updateRoute, softDeleteRoute,
  exportRoutesJSON, exportRouteGPX, type LocalRoute,
} from '../lib/db';
import { syncAll, hydrateFromCloud } from '../lib/sync';

interface RoutesStore {
  routes: LocalRoute[];
  loading: boolean;

  load: (userId: string) => Promise<void>;
  refresh: (userId: string) => Promise<void>;
  update: (id: string, changes: Partial<LocalRoute>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  exportJSON: (userId: string) => Promise<string>;
  exportGPX: (routeId: string) => Promise<string>;
}

export const useRoutes = create<RoutesStore>((set, get) => ({
  routes: [],
  loading: false,

  load: async (userId) => {
    set({ loading: true });
    // Primeiro mostra o que há localmente (resposta imediata)
    const local = await getRoutes(userId);
    set({ routes: local });
    // Depois hidrata do Supabase (recupera dados após reinstalação)
    await hydrateFromCloud(userId);
    const routes = await getRoutes(userId);
    set({ routes, loading: false });
  },

  refresh: async (userId) => {
    await syncAll();
    const routes = await getRoutes(userId);
    set({ routes });
  },

  update: async (id, changes) => {
    await updateRoute(id, changes);
    set(s => ({
      routes: s.routes.map(r => r.id === id ? { ...r, ...changes, updatedAt: Date.now() } : r),
    }));
  },

  remove: async (id) => {
    await softDeleteRoute(id);
    set(s => ({ routes: s.routes.filter(r => r.id !== id) }));
  },

  exportJSON: (userId) => exportRoutesJSON(userId),
  exportGPX: (routeId) => exportRouteGPX(routeId),
}));
