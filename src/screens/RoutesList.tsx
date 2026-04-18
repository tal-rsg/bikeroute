import React, { useState } from 'react';
import { C, font, fmt } from '../tokens';
import { Pill, Segmented, ElevationChart } from '../components/ui';
import Icon from '../components/Icon';
import { useRoutes } from '../store/routes';
import type { LocalRoute } from '../lib/db';

interface Props {
  onOpen: (r: LocalRoute) => void;
  onRecord: () => void;
}

export default function RoutesListScreen({ onOpen, onRecord }: Props) {
  const { routes, loading } = useRoutes();
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');

  const active = routes.filter(r => !r.deletedAt);
  const filtered = active.filter(r => filter === 'all' || r.type === filter);
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'longest') return b.distanceKm - a.distanceKm;
    if (sort === 'fastest') return b.avgSpeed - a.avgSpeed;
    return b.startedAt - a.startedAt;
  });

  const totalKm = active.reduce((s, r) => s + r.distanceKm, 0);

  return (
    <div style={{ flex:1, overflow:'auto', background:C.bg }}>
      <div style={{ padding:'18px 20px 8px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div>
            <div style={{ fontSize:24, fontWeight:800, color:C.ink, letterSpacing:-0.8 }}>Minhas rotas</div>
            <div style={{ fontSize:13, color:C.inkMute, marginTop:2 }}>{active.length} rotas · {totalKm.toFixed(1)} km no total</div>
          </div>
          <button onClick={onRecord} style={{ width:44, height:44, borderRadius:14, background:C.primary, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(232,85,58,.3)' }}>
            <Icon name="plus" size={20} color="#FFF"/>
          </button>
        </div>

        {/* Filter pills */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
          {[{id:'all',l:'Todas'},{id:'urbano',l:'Urbano'},{id:'trilha',l:'Trilha'},{id:'estrada',l:'Estrada'}].map(f => (
            <Pill key={f.id} active={filter===f.id} onClick={() => setFilter(f.id)}>
              {f.l} <span style={{ opacity:.6, fontWeight:500 }}>({active.filter(r=>f.id==='all'||r.type===f.id).length})</span>
            </Pill>
          ))}
        </div>
      </div>

      <div style={{ padding:'8px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Segmented
          options={[{value:'recent',label:'Recentes'},{value:'longest',label:'Mais longas'},{value:'fastest',label:'Rápidas'}]}
          value={sort} onChange={setSort}
        />
      </div>

      <div style={{ padding:'4px 18px 24px', display:'flex', flexDirection:'column', gap:10 }}>
        {loading && <div style={{ textAlign:'center', padding:'32px 0', color:C.inkMute }}>Carregando…</div>}
        {!loading && sorted.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 20px', color:C.inkMute }}>
            <Icon name="map" size={36} color={C.line}/><br/><br/>
            {filter==='all'?'Nenhuma rota ainda.':'Nenhuma rota neste filtro.'}
          </div>
        )}
        {sorted.map(r => <RouteCard key={r.id} route={r} onClick={() => onOpen(r)}/>)}
      </div>
    </div>
  );
}

function RouteCard({ route, onClick }: { route: LocalRoute; onClick: () => void }) {
  const typeColor = route.type==='trilha'?C.forest:route.type==='estrada'?C.sky:C.moss;
  const synced = route.syncedAt !== undefined;
  return (
    <button onClick={onClick} style={{ background:'#FFF', border:`1px solid ${C.line}`, borderRadius:18, padding:14, cursor:'pointer', textAlign:'left', display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
        <div style={{ width:72, height:72, borderRadius:14, background:C.forestSoft, overflow:'hidden', flexShrink:0, position:'relative' }}>
          <svg viewBox="0 0 72 72" style={{ width:'100%', height:'100%' }}>
            <rect width="72" height="72" fill={C.forestSoft}/>
            <path d={route.type==='trilha'?"M5 55 Q 20 30 35 40 T 65 20":route.type==='estrada'?"M5 38 L 65 35":"M5 55 Q 25 35 38 42 T 65 25"}
              stroke={C.primary} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <circle cx="5" cy={route.type==='estrada'?38:55} r="2.5" fill="#FFF" stroke={C.primary} strokeWidth="1.5"/>
          </svg>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.ink, letterSpacing:-0.3, lineHeight:1.2 }}>{route.name}</div>
            <div style={{ display:'flex', gap:4, alignItems:'center', flexShrink:0, paddingTop:2 }}>
              {!synced && <div title="Não sincronizado"><Icon name="sync" size={13} color={C.warn}/></div>}
              {route.privacy==='private' && <Icon name="lock2" size={13} color={C.inkMute}/>}
            </div>
          </div>
          <div style={{ fontSize:11, color:C.inkMute, marginTop:3, display:'flex', gap:6 }}>
            <span>{new Date(route.startedAt).toLocaleDateString('pt-BR')}</span>
            <span>·</span>
            <span style={{ color:typeColor, fontWeight:600, textTransform:'capitalize' }}>{route.type}</span>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:7, fontSize:12, color:C.inkSoft, fontFamily:font.mono }}>
            <span><b style={{ color:C.ink }}>{route.distanceKm.toFixed(1)}</b> km</span>
            <span style={{ color:C.line }}>|</span>
            <span>{fmt(route.durationSeconds)}</span>
            <span style={{ color:C.line }}>|</span>
            <span>↑{route.elevationGain}m</span>
          </div>
        </div>
      </div>
      <ElevationChart height={32} color={typeColor}/>
    </button>
  );
}
