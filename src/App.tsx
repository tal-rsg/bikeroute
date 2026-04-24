import React, { useEffect, useState } from 'react';
import { App as CapApp } from '@capacitor/app';
import { useAuth } from './store/auth';
import { useRoutes } from './store/routes';
import { initSync } from './lib/sync';
import { supabase } from './lib/supabase';
import { BottomNav } from './components/ui';
import { C } from './tokens';

import AuthScreen from './screens/Auth';
import HomeScreen from './screens/Home';
import RecordScreen from './screens/Record';
import RoutesListScreen from './screens/RoutesList';
import RouteDetailScreen from './screens/RouteDetail';
import RouteEditScreen from './screens/RouteEdit';
import StatsScreen from './screens/Stats';
import ProfileScreen from './screens/Profile';

import type { LocalRoute } from './lib/db';

type Tab = 'home' | 'routes' | 'stats' | 'profile';
type Screen = null | 'record' | 'detail' | 'edit';

export default function App() {
  const { user, loading, init } = useAuth();
  const { load, routes } = useRoutes();
  const [tab, setTab] = useState<Tab>('home');
  const [screen, setScreen] = useState<Screen>(null);
  const [activeRoute, setActiveRoute] = useState<LocalRoute | null>(null);

  // Bootstrap
  useEffect(() => {
    init();
    initSync();

    // Handle OAuth deep link callback (Google login)
    CapApp.addListener('appUrlOpen', async ({ url }) => {
      if (url.includes('auth/callback') || url.includes('access_token')) {
        const params = new URLSearchParams(url.split('#')[1] ?? url.split('?')[1] ?? '');
        const access_token  = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        }
      }
    });
  }, []);

  // Load routes when user logs in
  useEffect(() => {
    if (user) load(user.id);
  }, [user?.id]);

  if (loading) {
    return (
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:C.bg }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:C.primary, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5.5" cy="17" r="3.5"/><circle cx="18.5" cy="17" r="3.5"/>
              <path d="M9 17l3-7 4 7M12 10h4l-1-3M8 7h3"/>
            </svg>
          </div>
          <div style={{ fontSize:13, color:'#8B8478', fontFamily:"'Manrope',sans-serif" }}>BikeRoute</div>
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen/>;

  const handleNav = (id: string) => {
    if (id === 'record') { setScreen('record'); return; }
    setScreen(null);
    setTab(id as Tab);
  };

  // Always use the freshest copy from the store (fixes stale data after edit)
  const currentRoute = activeRoute
    ? (routes.find(r => r.id === activeRoute.id) ?? activeRoute)
    : null;

  const openRoute = (r: LocalRoute) => { setActiveRoute(r); setScreen('detail'); };

  const showTabs = !screen;

  let content: React.ReactNode;

  if (screen === 'record') {
    content = <RecordScreen onBack={() => setScreen(null)} onSaved={() => { setScreen(null); setTab('routes'); }}/>;
  } else if (screen === 'detail' && currentRoute) {
    content = <RouteDetailScreen route={currentRoute} onBack={() => setScreen(null)} onEdit={() => setScreen('edit')}/>;
  } else if (screen === 'edit' && currentRoute) {
    content = <RouteEditScreen route={currentRoute} onBack={() => setScreen('detail')} onSaved={() => setScreen('detail')}/>;
  } else if (tab === 'home') {
    content = <HomeScreen onRecord={() => setScreen('record')} onNav={handleNav} onOpenRoute={openRoute}/>;
  } else if (tab === 'routes') {
    content = <RoutesListScreen onOpen={openRoute} onRecord={() => setScreen('record')}/>;
  } else if (tab === 'stats') {
    content = <StatsScreen/>;
  } else {
    content = <ProfileScreen/>;
  }

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:C.bg, fontFamily:"'Manrope',system-ui,sans-serif", overflow:'hidden' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {content}
      </div>
      {showTabs && <BottomNav active={tab} onChange={handleNav}/>}
    </div>
  );
}
