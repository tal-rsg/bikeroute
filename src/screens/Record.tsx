import React, { useState, useEffect } from 'react';
import { C, font, fmt } from '../tokens';
import { Button, MapPlaceholder, ElevationChart, TextField, Stat } from '../components/ui';
import Icon from '../components/Icon';
import { useRecording } from '../store/recording';
import { useAuth } from '../store/auth';
import { useRoutes } from '../store/routes';

interface Props { onBack: () => void; onSaved: () => void; }

export default function RecordScreen({ onBack, onSaved }: Props) {
  const { user } = useAuth();
  const { state, stats, activityType, gpsError, setActivityType, start, pause, stop, save, discard } = useRecording();
  const { load } = useRoutes();
  const [routeName, setRouteName] = useState('');

  useEffect(() => {
    if (state === 'recording') {
      // Sugere nome baseado na hora
      const h = new Date().getHours();
      const period = h < 12 ? 'matinal' : h < 18 ? 'vespertina' : 'noturna';
      if (!routeName) setRouteName(`Pedalada ${period}`);
    }
  }, [state]);

  async function handleStart() {
    if (!user) return;
    await start(user.id);
  }

  async function handleSave() {
    if (!user) return;
    const name = routeName.trim() || 'Minha rota';
    await save(user.id, name);
    await load(user.id);
    onSaved();
  }

  if (state === 'summary') {
    return <SummaryView stats={stats} name={routeName} setName={setRouteName} onSave={handleSave} onDiscard={() => { discard(); onBack(); }}/>;
  }

  const progress = Math.min(1, stats.distanceKm / 10);

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg }}>
      {/* Top bar */}
      <div style={{ padding:'12px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', background:C.bg, zIndex:10 }}>
        <button onClick={onBack} style={{ width:40, height:40, borderRadius:12, border:`1px solid ${C.line}`, background:'#FFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon name="chevronLeft" size={20} color={C.ink}/>
        </button>
        <div style={{ fontSize:15, fontWeight:700, color:C.ink, letterSpacing:-0.3 }}>
          {state==='idle'?'Nova rota':state==='paused'?'Pausada':'Gravando'}
        </div>
        <div style={{ width:40 }}/>
      </div>

      {/* Map */}
      <div style={{ position:'relative', flex:1, overflow:'hidden' }}>
        <MapPlaceholder height="100%" progress={state==='idle'?0.1:progress} showMarkers={state!=='idle'}/>

        {/* Recording badge */}
        {state === 'recording' && (
          <div style={{ position:'absolute', top:12, left:12, display:'flex', alignItems:'center', gap:8, background:C.ink, color:'#FFF', padding:'8px 12px', borderRadius:999, fontSize:12, fontWeight:700 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:C.primary, animation:'pulse 1.2s ease-in-out infinite' }}/>
            GRAVANDO · {fmt(stats.durationSeconds)}
          </div>
        )}
        {state === 'paused' && (
          <div style={{ position:'absolute', top:12, left:12, display:'flex', alignItems:'center', gap:8, background:C.warn, color:'#FFF', padding:'8px 12px', borderRadius:999, fontSize:12, fontWeight:700 }}>
            <Icon name="pause" size={12} color="#FFF"/> PAUSADA · {fmt(stats.durationSeconds)}
          </div>
        )}

        {/* GPS indicator */}
        <div style={{ position:'absolute', top:12, right:56, background:'#FFF', border:`1px solid ${C.line}`, padding:'6px 10px', borderRadius:999, display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:600, color:C.ink }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:state!=='idle'?C.success:C.warn }}/>
          GPS {stats.pointCount > 0 ? `· ${stats.pointCount} pts` : ''}
        </div>

        {/* Start overlay */}
        {state === 'idle' && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
            <button onClick={handleStart} style={{ width:128, height:128, borderRadius:'50%', background:C.primary, color:'#FFF', border:'6px solid rgba(255,255,255,.9)', cursor:'pointer', boxShadow:'0 20px 40px rgba(232,85,58,.4),0 0 0 12px rgba(232,85,58,.15)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, fontFamily:font.sans }}>
              <Icon name="play" size={36} color="#FFF"/>
              <div style={{ fontSize:13, fontWeight:800, letterSpacing:1 }}>INICIAR</div>
            </button>
            {gpsError && (
              <div style={{ background:'rgba(196,69,54,.9)', color:'#FFF', padding:'10px 16px', borderRadius:12, fontSize:12, fontWeight:600, maxWidth:240, textAlign:'center' }}>{gpsError}</div>
            )}
            {!gpsError && (
              <div style={{ background:'rgba(31,27,22,.85)', color:'#FFF', padding:'8px 14px', borderRadius:999, fontSize:12, fontWeight:600 }}>Toque para começar</div>
            )}
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      <div style={{ background:'#FFF', borderRadius:'24px 24px 0 0', padding:'16px 18px 28px', boxShadow:'0 -8px 24px rgba(0,0,0,.06)', zIndex:20 }}>
        <div style={{ width:40, height:4, borderRadius:2, background:C.line, margin:'0 auto 16px' }}/>

        {state === 'idle' ? (
          <>
            <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:10 }}>Tipo de atividade</div>
            <div style={{ display:'flex', gap:8 }}>
              {[{id:'urbano',l:'Urbano',icon:'map'},{id:'trilha',l:'Trilha',icon:'mountain'},{id:'estrada',l:'Estrada',icon:'route'}].map(t => (
                <button key={t.id} onClick={() => setActivityType(t.id as any)} style={{
                  flex:1, padding:'12px 8px', borderRadius:14,
                  background:activityType===t.id?C.forestSoft:'#FFF',
                  border:`1.5px solid ${activityType===t.id?C.forest:C.line}`,
                  cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                  color:activityType===t.id?C.forest:C.inkSoft,
                }}>
                  <Icon name={t.icon} size={18} color={activityType===t.id?C.forest:C.inkSoft}/>
                  <div style={{ fontSize:12, fontWeight:600 }}>{t.l}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Live stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:C.inkMute, textTransform:'uppercase', letterSpacing:0.8 }}>Distância</div>
                <div style={{ fontSize:34, fontFamily:font.mono, fontWeight:500, color:C.ink, letterSpacing:-0.5, lineHeight:1 }}>
                  {stats.distanceKm.toFixed(2)}<span style={{ fontSize:14, color:C.inkMute }}> km</span>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:10, fontWeight:700, color:C.inkMute, textTransform:'uppercase', letterSpacing:0.8 }}>Tempo</div>
                <div style={{ fontSize:34, fontFamily:font.mono, fontWeight:500, color:C.ink, letterSpacing:-0.5, lineHeight:1 }}>
                  {fmt(stats.durationSeconds)}
                </div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginBottom:16, paddingTop:12, borderTop:`1px solid ${C.lineSoft}` }}>
              <div><div style={{ fontSize:10, color:C.inkMute, fontWeight:600, textTransform:'uppercase', letterSpacing:0.6 }}>Veloc.</div><div style={{ fontSize:16, fontFamily:font.mono, color:C.ink }}>{stats.currentSpeed.toFixed(1)}<span style={{ fontSize:10, color:C.inkMute }}> km/h</span></div></div>
              <div><div style={{ fontSize:10, color:C.inkMute, fontWeight:600, textTransform:'uppercase', letterSpacing:0.6 }}>Elevação</div><div style={{ fontSize:16, fontFamily:font.mono, color:C.ink }}>{stats.elevationGain}<span style={{ fontSize:10, color:C.inkMute }}>m</span></div></div>
              <div><div style={{ fontSize:10, color:C.inkMute, fontWeight:600, textTransform:'uppercase', letterSpacing:0.6 }}>Kcal</div><div style={{ fontSize:16, fontFamily:font.mono, color:C.ink }}>{stats.calories}</div></div>
            </div>
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              {state === 'recording' ? (
                <button onClick={pause} style={{ flex:1, height:56, borderRadius:16, background:C.warn, color:'#FFF', border:'none', cursor:'pointer', fontSize:15, fontWeight:700, fontFamily:font.sans, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <Icon name="pause" size={18} color="#FFF"/> Pausar
                </button>
              ) : (
                <>
                  <button onClick={() => user && handleStart()} style={{ flex:1, height:56, borderRadius:16, background:C.success, color:'#FFF', border:'none', cursor:'pointer', fontSize:15, fontWeight:700, fontFamily:font.sans, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    <Icon name="play" size={18} color="#FFF"/> Continuar
                  </button>
                  <button onClick={stop} style={{ width:56, height:56, borderRadius:16, background:C.danger, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon name="stop" size={18} color="#FFF"/>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}`}</style>
    </div>
  );
}

function SummaryView({ stats, name, setName, onSave, onDiscard }: { stats: any; name:string; setName:(v:string)=>void; onSave:()=>void; onDiscard:()=>void }) {
  const [saving, setSaving] = useState(false);
  async function handleSave() {
    setSaving(true);
    await onSave();
  }
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg, overflow:'auto' }}>
      <div style={{ background:`linear-gradient(160deg,${C.forest},#1F3328)`, padding:'20px 22px 28px', color:'#FFF', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:C.leaf, fontWeight:700, letterSpacing:0.8, marginBottom:8 }}>
            <Icon name="check" size={14} color={C.leaf}/> ROTA FINALIZADA
          </div>
          <div style={{ fontSize:30, fontWeight:800, letterSpacing:-0.8, lineHeight:1.05, marginBottom:4 }}>Boa pedalada!</div>
          <div style={{ fontSize:14, color:'rgba(255,255,255,.7)' }}>
            Você completou <b style={{ color:'#FFF', fontFamily:font.mono }}>{stats.distanceKm.toFixed(2)} km</b> em {fmt(stats.durationSeconds)}
          </div>
        </div>
      </div>
      <div style={{ margin:'-20px 18px 14px', background:'#FFF', borderRadius:18, overflow:'hidden', border:`1px solid ${C.line}` }}>
        <MapPlaceholder height={160}/>
      </div>
      <div style={{ padding:'0 18px 14px' }}>
        <TextField label="Nome da rota" value={name} onChange={setName} icon={<Icon name="edit" size={18}/>}/>
      </div>
      <div style={{ padding:'0 18px 14px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <Stat label="Distância" value={stats.distanceKm.toFixed(2)} unit="km" icon={<Icon name="route" size={14}/>} accent={C.forest}/>
        <Stat label="Tempo" value={fmt(stats.durationSeconds)} icon={<Icon name="clock" size={14}/>}/>
        <Stat label="Vel. méd." value={stats.avgSpeed.toFixed(1)} unit="km/h" icon={<Icon name="speed" size={14}/>}/>
        <Stat label="Elevação" value={stats.elevationGain} unit="m" icon={<Icon name="mountain" size={14}/>}/>
        <Stat label="Calorias" value={stats.calories} unit="kcal" icon={<Icon name="flame" size={14}/>}/>
        <Stat label="Pontos GPS" value={stats.pointCount} icon={<Icon name="target" size={14}/>}/>
      </div>
      <div style={{ margin:'0 18px 14px', background:'#FFF', border:`1px solid ${C.line}`, borderRadius:16, padding:'14px 16px' }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.ink, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>Elevação</div>
        <ElevationChart height={64}/>
      </div>
      <div style={{ padding:'4px 18px 32px', display:'flex', flexDirection:'column', gap:10 }}>
        <Button variant="primary" size="lg" full onClick={handleSave} disabled={saving}
          iconRight={<Icon name="check" size={18} color="#FFF"/>}>
          {saving ? 'Salvando…' : 'Salvar rota'}
        </Button>
        <Button variant="ghost" size="md" full onClick={onDiscard} style={{ color:C.danger }}>
          Descartar
        </Button>
      </div>
    </div>
  );
}
