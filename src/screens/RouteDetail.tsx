import React from 'react';
import { C, font, fmt } from '../tokens';
import { Button, Stat, ElevationChart, MapPlaceholder } from '../components/ui';
import Icon from '../components/Icon';
import { useRoutes } from '../store/routes';
import { exportRouteGPX } from '../lib/db';
import type { LocalRoute } from '../lib/db';

interface Props {
  route: LocalRoute;
  onBack: () => void;
  onEdit: () => void;
}

export default function RouteDetailScreen({ route, onBack, onEdit }: Props) {
  async function handleExportGPX() {
    const gpx = await exportRouteGPX(route.id);
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${route.name.replace(/\s/g,'_')}.gpx`; a.click();
    URL.revokeObjectURL(url);
  }

  const difficulty = { easy:'Fácil', medium:'Médio', hard:'Difícil' }[route.difficulty];

  return (
    <div style={{ flex:1, overflow:'auto', background:C.bg }}>
      {/* Hero map */}
      <div style={{ position:'relative' }}>
        <MapPlaceholder height={280}/>
        <button onClick={onBack} style={{ position:'absolute', top:14, left:14, width:40, height:40, borderRadius:12, background:'#FFF', border:`1px solid ${C.line}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon name="chevronLeft" size={20} color={C.ink}/>
        </button>
        <div style={{ position:'absolute', top:14, right:14, display:'flex', gap:8 }}>
          <button style={{ width:40, height:40, borderRadius:12, background:'#FFF', border:`1px solid ${C.line}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="share" size={18} color={C.ink}/>
          </button>
          <button onClick={onEdit} style={{ width:40, height:40, borderRadius:12, background:C.ink, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="edit" size={18} color="#FFF"/>
          </button>
        </div>
      </div>

      {/* Title */}
      <div style={{ background:C.bg, borderRadius:'28px 28px 0 0', marginTop:-20, padding:'20px 22px 14px', position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:C.inkMute, fontWeight:600, textTransform:'uppercase', letterSpacing:0.8, marginBottom:6 }}>
          <span style={{ color:C.primary }}>●</span> {route.type}
          <span>·</span> {new Date(route.startedAt).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })}
          {route.syncedAt ? <span style={{ color:C.success }}>· sincronizado</span> : <span style={{ color:C.warn }}>· pendente sync</span>}
        </div>
        <div style={{ fontSize:24, fontWeight:800, color:C.ink, letterSpacing:-0.6, lineHeight:1.1 }}>{route.name}</div>
        {route.description && <div style={{ fontSize:13, color:C.inkSoft, marginTop:8, lineHeight:1.5 }}>{route.description}</div>}
      </div>

      {/* Stats */}
      <div style={{ padding:'0 18px 14px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
        <Stat label="Distância" value={route.distanceKm.toFixed(1)} unit="km" icon={<Icon name="route" size={13}/>}/>
        <Stat label="Tempo" value={fmt(route.durationSeconds)} icon={<Icon name="clock" size={13}/>}/>
        <Stat label="Elevação" value={route.elevationGain} unit="m" icon={<Icon name="mountain" size={13}/>}/>
        <Stat label="Vel. méd." value={route.avgSpeed.toFixed(1)} unit="km/h" icon={<Icon name="speed" size={13}/>}/>
        <Stat label="Kcal" value={route.calories} icon={<Icon name="flame" size={13}/>}/>
        <Stat label="Nível" value={difficulty} icon={<Icon name="target" size={13}/>}/>
      </div>

      {/* Elevation */}
      <div style={{ margin:'0 18px 14px', background:'#FFF', border:`1px solid ${C.line}`, borderRadius:16, padding:'14px 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.ink, textTransform:'uppercase', letterSpacing:0.5 }}>Perfil de elevação</div>
          <div style={{ fontSize:11, color:C.inkMute, fontFamily:font.mono }}>↑{route.elevationGain}m ↓{route.elevationLoss}m</div>
        </div>
        <ElevationChart height={72}/>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:C.inkMute, marginTop:4, fontFamily:font.mono }}>
          <span>0 km</span><span>{(route.distanceKm/2).toFixed(1)} km</span><span>{route.distanceKm.toFixed(1)} km</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding:'0 18px 32px', display:'flex', gap:8 }}>
        <Button variant="forest" size="md" full icon={<Icon name="play" size={16} color="#FFF"/>}>
          Refazer rota
        </Button>
        <Button variant="outline" size="md" onClick={handleExportGPX} icon={<Icon name="download" size={16}/>}/>
        <Button variant="outline" size="md" icon={<Icon name="heart" size={16}/>}/>
      </div>
    </div>
  );
}
