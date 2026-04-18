import React, { useState } from 'react';
import { C, font, fmt } from '../tokens';
import { Segmented, Stat } from '../components/ui';
import Icon from '../components/Icon';
import { useRoutes } from '../store/routes';

export default function StatsScreen() {
  const { routes } = useRoutes();
  const [period, setPeriod] = useState('week');

  const now = Date.now();
  const cutoff: Record<string, number> = {
    week:  now - 7  * 24 * 3600 * 1000,
    month: now - 30 * 24 * 3600 * 1000,
    year:  now - 365 * 24 * 3600 * 1000,
    all:   0,
  };

  const filtered = routes.filter(r => !r.deletedAt && r.startedAt >= cutoff[period]);
  const totalKm   = filtered.reduce((s,r) => s + r.distanceKm, 0);
  const totalSecs = filtered.reduce((s,r) => s + r.durationSeconds, 0);
  const totalElev = filtered.reduce((s,r) => s + r.elevationGain, 0);
  const totalCal  = filtered.reduce((s,r) => s + r.calories, 0);
  const avgSpeed  = filtered.length ? filtered.reduce((s,r) => s + r.avgSpeed, 0) / filtered.length : 0;

  // Build bar chart data for the week view
  const bars = period === 'week'
    ? Array.from({ length: 7 }).map((_, i) => {
        const day = new Date(now - (6 - i) * 24 * 3600 * 1000);
        const label = day.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3);
        const dayRoutes = routes.filter(r => {
          const d = new Date(r.startedAt);
          return d.toDateString() === day.toDateString() && !r.deletedAt;
        });
        return { label, v: dayRoutes.reduce((s,r) => s + r.distanceKm, 0) };
      })
    : [];
  const maxBar = Math.max(...bars.map(b => b.v), 1);

  const periodLabel: Record<string, string> = { week:'semana', month:'mês', year:'ano', all:'histórico' };

  return (
    <div style={{ flex:1, overflow:'auto', background:C.bg }}>
      <div style={{ padding:'18px 20px 4px' }}>
        <div style={{ fontSize:24, fontWeight:800, color:C.ink, letterSpacing:-0.8 }}>Estatísticas</div>
      </div>
      <div style={{ padding:'14px 20px' }}>
        <Segmented
          options={[{value:'week',label:'Semana'},{value:'month',label:'Mês'},{value:'year',label:'Ano'},{value:'all',label:'Tudo'}]}
          value={period} onChange={setPeriod}
        />
      </div>

      {/* Big total */}
      <div style={{ padding:'4px 18px 14px' }}>
        <div style={{ background:C.forest, borderRadius:22, padding:20, color:'#FFF', position:'relative', overflow:'hidden' }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.65)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.8 }}>Distância · {periodLabel[period]}</div>
          <div style={{ fontSize:48, fontFamily:font.mono, fontWeight:500, letterSpacing:-1.5, marginTop:4, lineHeight:1 }}>
            {totalKm.toFixed(1)}<span style={{ fontSize:18, color:'rgba(255,255,255,.6)', fontWeight:400 }}> km</span>
          </div>
          {filtered.length > 0 && (
            <div style={{ fontSize:13, color:C.leaf, display:'flex', alignItems:'center', gap:4, marginTop:6 }}>
              <Icon name="trending" size={14} color={C.leaf}/> {filtered.length} atividades
            </div>
          )}
          {period === 'week' && bars.length > 0 && (
            <div style={{ marginTop:20, display:'flex', gap:6, alignItems:'flex-end', height:80 }}>
              {bars.map((b, i) => (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div style={{ width:'100%', height:`${Math.max(4, (b.v/maxBar)*60)}px`, background:b.v>0?C.primary:'rgba(255,255,255,.15)', borderRadius:6 }}/>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.6)', fontWeight:600 }}>{b.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metric grid */}
      <div style={{ padding:'4px 18px 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <Stat label="Tempo" value={fmt(totalSecs)} icon={<Icon name="clock" size={13}/>}/>
        <Stat label="Calorias" value={totalCal.toLocaleString('pt-BR')} unit="kcal" icon={<Icon name="flame" size={13}/>}/>
        <Stat label="Elevação" value={totalElev.toLocaleString('pt-BR')} unit="m" icon={<Icon name="mountain" size={13}/>}/>
        <Stat label="Vel. méd." value={avgSpeed.toFixed(1)} unit="km/h" icon={<Icon name="speed" size={13}/>}/>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'24px 20px', color:C.inkMute }}>
          <Icon name="trending" size={32} color={C.line}/><br/><br/>
          Nenhuma atividade neste período.
        </div>
      )}
    </div>
  );
}
