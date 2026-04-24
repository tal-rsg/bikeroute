import React, { useEffect, useState } from 'react';
import { C, font, fmt } from '../tokens';
import { Button, Stat, ElevationChart } from '../components/ui';
import Icon from '../components/Icon';
import { exportRouteGPX, getRoutePoints, type LocalRoutePoint } from '../lib/db';
import type { LocalRoute } from '../lib/db';

interface Props {
  route: LocalRoute;
  onBack: () => void;
  onEdit: () => void;
}

// ─── Mapa SVG da rota ────────────────────────────────────────────────────────

function RouteMapSVG({ routeId, height }: { routeId: string; height: number }) {
  const [points, setPoints] = useState<LocalRoutePoint[]>([]);

  useEffect(() => {
    getRoutePoints(routeId).then(setPoints);
  }, [routeId]);

  if (points.length < 2) {
    return (
      <div style={{ height, background: `linear-gradient(160deg,${C.forest},#1a3020)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.4)', fontSize: 13 }}>
          <Icon name="route" size={32} color="rgba(255,255,255,.3)"/>
          <div style={{ marginTop: 8 }}>Sem pontos GPS</div>
        </div>
      </div>
    );
  }

  const W = 400, H = height;
  const pad = 40;

  const lats = points.map(p => p.lat);
  const lngs = points.map(p => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;

  // Preserve aspect ratio, center within viewport
  const scaleX = (W - pad * 2) / lngRange;
  const scaleY = (H - pad * 2) / latRange;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (W - lngRange * scale) / 2;
  const offsetY = (H - latRange * scale) / 2;

  const toX = (lng: number) => offsetX + (lng - minLng) * scale;
  const toY = (lat: number) => H - offsetY - (lat - minLat) * scale;

  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.lng).toFixed(1)},${toY(p.lat).toFixed(1)}`)
    .join(' ');

  const start = points[0];
  const end = points[points.length - 1];

  return (
    <div style={{ height, background: `linear-gradient(160deg,${C.forest},#1a3020)`, position: 'relative', overflow: 'hidden' }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0 }}>
        {/* Shadow */}
        <path d={d} fill="none" stroke="rgba(0,0,0,.3)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Track */}
        <path d={d} fill="none" stroke={C.primary} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Start marker */}
        <circle cx={toX(start.lng)} cy={toY(start.lat)} r="7" fill={C.success} stroke="#FFF" strokeWidth="2.5"/>
        {/* End marker */}
        <circle cx={toX(end.lng)} cy={toY(end.lat)} r="7" fill={C.primary} stroke="#FFF" strokeWidth="2.5"/>
      </svg>
      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 10, fontSize: 10, fontWeight: 700, color: '#FFF' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: C.success, border: '1.5px solid #FFF' }}/>
          Início
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: C.primary, border: '1.5px solid #FFF' }}/>
          Fim
        </span>
      </div>
    </div>
  );
}

// ─── Tela de detalhe ─────────────────────────────────────────────────────────

export default function RouteDetailScreen({ route, onBack, onEdit }: Props) {
  async function handleExportGPX() {
    const gpx = await exportRouteGPX(route.id);
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${route.name.replace(/\s/g, '_')}.gpx`; a.click();
    URL.revokeObjectURL(url);
  }

  const difficulty = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }[route.difficulty];

  return (
    <div style={{ flex: 1, overflow: 'auto', background: C.bg }}>
      {/* Hero map */}
      <div style={{ position: 'relative' }}>
        <RouteMapSVG routeId={route.id} height={280}/>
        <button onClick={onBack} style={{ position: 'absolute', top: 14, left: 14, width: 40, height: 40, borderRadius: 12, background: 'rgba(0,0,0,.45)', border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevronLeft" size={20} color="#FFF"/>
        </button>
        <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 8 }}>
          <button style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,0,0,.45)', border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="share" size={18} color="#FFF"/>
          </button>
          <button onClick={onEdit} style={{ width: 40, height: 40, borderRadius: 12, background: C.primary, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="edit" size={18} color="#FFF"/>
          </button>
        </div>
      </div>

      {/* Title */}
      <div style={{ background: C.bg, borderRadius: '28px 28px 0 0', marginTop: -20, padding: '20px 22px 14px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: C.inkMute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
          <span style={{ color: C.primary }}>●</span> {route.type}
          <span>·</span> {new Date(route.startedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          {route.syncedAt ? <span style={{ color: C.success }}>· sincronizado</span> : <span style={{ color: C.warn }}>· pendente sync</span>}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: -0.6, lineHeight: 1.1 }}>{route.name}</div>
        {route.description && <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 8, lineHeight: 1.5 }}>{route.description}</div>}
      </div>

      {/* Stats */}
      <div style={{ padding: '0 18px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <Stat label="Distância" value={route.distanceKm.toFixed(1)} unit="km" icon={<Icon name="route" size={13}/>}/>
        <Stat label="Tempo" value={fmt(route.durationSeconds)} icon={<Icon name="clock" size={13}/>}/>
        <Stat label="Elevação" value={route.elevationGain} unit="m" icon={<Icon name="mountain" size={13}/>}/>
        <Stat label="Vel. méd." value={route.avgSpeed.toFixed(1)} unit="km/h" icon={<Icon name="speed" size={13}/>}/>
        <Stat label="Kcal" value={route.calories} icon={<Icon name="flame" size={13}/>}/>
        <Stat label="Nível" value={difficulty} icon={<Icon name="target" size={13}/>}/>
      </div>

      {/* Elevation */}
      <div style={{ margin: '0 18px 14px', background: '#FFF', border: `1px solid ${C.line}`, borderRadius: 16, padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, textTransform: 'uppercase', letterSpacing: 0.5 }}>Perfil de elevação</div>
          <div style={{ fontSize: 11, color: C.inkMute, fontFamily: font.mono }}>↑{route.elevationGain}m ↓{route.elevationLoss}m</div>
        </div>
        <ElevationChart height={72}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.inkMute, marginTop: 4, fontFamily: font.mono }}>
          <span>0 km</span><span>{(route.distanceKm / 2).toFixed(1)} km</span><span>{route.distanceKm.toFixed(1)} km</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '0 18px 32px', display: 'flex', gap: 8 }}>
        <Button variant="forest" size="md" full icon={<Icon name="play" size={16} color="#FFF"/>}>
          Refazer rota
        </Button>
        <Button variant="outline" size="md" onClick={handleExportGPX} icon={<Icon name="download" size={16}/>}/>
        <Button variant="outline" size="md" icon={<Icon name="heart" size={16}/>}/>
      </div>
    </div>
  );
}
