import React from 'react';
import { C, font, fmt } from '../tokens';
import { SyncBadge } from '../components/ui';
import Icon from '../components/Icon';
import { useAuth } from '../store/auth';
import { useRoutes } from '../store/routes';
import { useSyncStatus } from '../hooks/useSyncStatus';
import type { LocalRoute } from '../lib/db';

interface Props {
  onRecord: () => void;
  onNav: (tab: string) => void;
  onOpenRoute: (r: LocalRoute) => void;
}

export default function HomeScreen({ onRecord, onNav, onOpenRoute }: Props) {
  const { profile } = useAuth();
  const { routes } = useRoutes();
  const { status, pending } = useSyncStatus();

  const weekGoal = profile?.weekly_goal_km ?? 80;
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 3600 * 1000;
  const weekRoutes = routes.filter(r => r.startedAt >= weekAgo && !r.deletedAt);
  const weekDist = weekRoutes.reduce((s, r) => s + r.distanceKm, 0);
  const weekTime = weekRoutes.reduce((s, r) => s + r.durationSeconds, 0);
  const weekElev = weekRoutes.reduce((s, r) => s + r.elevationGain, 0);
  const pct = Math.min(100, (weekDist / weekGoal) * 100);

  const recent = [...routes].filter(r => !r.deletedAt).slice(0, 3);
  const firstName = (profile?.name ?? 'Ciclista').split(' ')[0];
  const initial = firstName[0].toUpperCase();

  const quickActions = [
    { id:'record',  icon:'record',  label:'Gravar',      color:C.primary, onClick:onRecord },
    { id:'routes',  icon:'map',     label:'Rotas',       color:C.forest,  onClick:()=>onNav('routes') },
    { id:'stats',   icon:'trending',label:'Stats',       color:C.moss,    onClick:()=>onNav('stats') },
    { id:'profile', icon:'user',    label:'Perfil',      color:C.sky,     onClick:()=>onNav('profile') },
  ];

  return (
    <div style={{ flex:1, overflow:'auto', background:C.bg }}>
      {/* Header */}
      <div style={{ padding:'16px 20px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:'50%', background:`linear-gradient(135deg,${C.moss},${C.forest})`, display:'flex', alignItems:'center', justifyContent:'center', color:'#FFF', fontWeight:700, fontSize:16 }}>{initial}</div>
          <div>
            <div style={{ fontSize:12, color:C.inkMute, fontWeight:500 }}>Bem-vindo de volta</div>
            <div style={{ fontSize:16, fontWeight:700, color:C.ink, letterSpacing:-0.3 }}>{firstName}</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <SyncBadge status={status} pending={pending}/>
        </div>
      </div>

      {/* Weekly goal card */}
      <div style={{ margin:'6px 18px 16px', padding:20, background:C.forest, borderRadius:24, color:'#FFF', position:'relative', overflow:'hidden' }}>
        <svg viewBox="0 0 300 200" style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.1 }}>
          <path d="M-10 160 Q 80 130 160 150 T 320 120" stroke="#FFF" strokeWidth="1.5" fill="none"/>
        </svg>
        <div style={{ position:'relative', display:'flex', alignItems:'center', gap:20 }}>
          {/* Ring */}
          <div style={{ position:'relative', width:100, height:100, flexShrink:0 }}>
            <svg viewBox="0 0 100 100" style={{ transform:'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,.15)" strokeWidth="7" fill="none"/>
              <circle cx="50" cy="50" r="44" stroke={C.primary} strokeWidth="7" fill="none"
                strokeDasharray={Math.PI*88} strokeDashoffset={Math.PI*88*(1-pct/100)} strokeLinecap="round"/>
            </svg>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <div style={{ fontSize:20, fontWeight:700, fontFamily:font.mono }}>{Math.round(pct)}%</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,.6)', fontWeight:600, letterSpacing:0.5 }}>META</div>
            </div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.65)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.6, marginBottom:4 }}>Meta semanal</div>
            <div style={{ fontSize:20, fontWeight:700, letterSpacing:-0.4, marginBottom:6 }}>
              <span style={{ fontFamily:font.mono }}>{weekDist.toFixed(1)}</span>
              <span style={{ color:'rgba(255,255,255,.5)', fontSize:15 }}> / {weekGoal} km</span>
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.8)' }}>
              Faltam <b style={{ color:'#FFF' }}>{Math.max(0, weekGoal - weekDist).toFixed(1)} km</b>
            </div>
          </div>
        </div>
        <div style={{ position:'relative', marginTop:16, paddingTop:14, borderTop:'1px solid rgba(255,255,255,.12)', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          <div><div style={{ fontSize:15, fontWeight:600, fontFamily:font.mono }}>{weekRoutes.length}</div><div style={{ fontSize:11, color:'rgba(255,255,255,.6)' }}>Pedaladas</div></div>
          <div><div style={{ fontSize:15, fontWeight:600, fontFamily:font.mono }}>{fmt(weekTime)}</div><div style={{ fontSize:11, color:'rgba(255,255,255,.6)' }}>Tempo</div></div>
          <div><div style={{ fontSize:15, fontWeight:600, fontFamily:font.mono }}>{weekElev}m</div><div style={{ fontSize:11, color:'rgba(255,255,255,.6)' }}>Elevação</div></div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding:'4px 18px 14px' }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:10 }}>Menu rápido</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8 }}>
          {quickActions.map(a => (
            <button key={a.id} onClick={a.onClick} style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:16, padding:'14px 8px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
              <div style={{ width:38, height:38, borderRadius:11, background:a.color+'15', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name={a.icon} size={20} color={a.color}/>
              </div>
              <div style={{ fontSize:11, fontWeight:600, color:C.ink, textAlign:'center', lineHeight:1.2 }}>{a.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ padding:'4px 18px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>Atividade recente</div>
          <button onClick={() => onNav('routes')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, color:C.primaryDark, display:'flex', alignItems:'center', gap:2 }}>
            Ver tudo <Icon name="chevronRight" size={14}/>
          </button>
        </div>
        {recent.length === 0 ? (
          <div style={{ textAlign:'center', padding:'32px 20px', color:C.inkMute, fontSize:14 }}>
            <Icon name="bike" size={32} color={C.line}/><br/><br/>
            Nenhuma rota ainda.<br/>Toque em <b>Gravar</b> para começar!
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {recent.map(r => <RouteRow key={r.id} route={r} onClick={() => onOpenRoute(r)}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

function RouteRow({ route, onClick }: { route: LocalRoute; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:16, padding:12, cursor:'pointer', display:'flex', alignItems:'center', gap:12, textAlign:'left' }}>
      <div style={{ width:60, height:60, borderRadius:12, background:C.bgAlt, position:'relative', overflow:'hidden', flexShrink:0 }}>
        <svg viewBox="0 0 60 60" style={{ width:'100%', height:'100%' }}>
          <rect width="60" height="60" fill={C.forestSoft}/>
          <path d={route.type==='trilha'?"M5 45 Q 15 25 25 35 T 45 20 T 58 30":route.type==='estrada'?"M5 30 L 58 28":"M5 45 Q 20 30 30 35 T 55 20"}
            stroke={C.primary} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.ink, letterSpacing:-0.2, marginBottom:3 }}>{route.name}</div>
        <div style={{ fontSize:11, color:C.inkMute, marginBottom:5 }}>{new Date(route.startedAt).toLocaleDateString('pt-BR')} · {route.type}</div>
        <div style={{ display:'flex', gap:8, fontSize:11, color:C.inkSoft, fontFamily:font.mono }}>
          <span><b style={{ color:C.ink }}>{route.distanceKm.toFixed(1)} km</b></span>
          <span>·</span><span>{fmt(route.durationSeconds)}</span>
          <span>·</span><span>↑{route.elevationGain}m</span>
        </div>
      </div>
      <Icon name="chevronRight" size={16} color={C.inkMute}/>
    </button>
  );
}
