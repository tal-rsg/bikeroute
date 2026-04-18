// Recording screen — 4 states: idle, recording, paused, summary
window.RecordScreen = function RecordScreen({ onBack, onSave }) {
  const [state, setState] = React.useState('idle'); // idle | recording | paused | summary
  const [elapsed, setElapsed] = React.useState(0);
  const [distance, setDistance] = React.useState(0);
  const C = window.BR.colors;

  React.useEffect(() => {
    if (state !== 'recording') return;
    const id = setInterval(() => {
      setElapsed(e => e + 1);
      setDistance(d => +(d + 0.005 + Math.random()*0.004).toFixed(2));
    }, 100);
    return () => clearInterval(id);
  }, [state]);

  const fmt = s => {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const speed = state === 'recording' ? (18 + Math.sin(elapsed/10)*3).toFixed(1) : distance > 0 ? (distance / (elapsed/3600)).toFixed(1) : '0.0';
  const calories = Math.round(distance * 38);
  const elev = Math.round(distance * 14);
  const progress = Math.min(1, distance / 10);

  const reset = () => { setState('idle'); setElapsed(0); setDistance(0); };

  if (state === 'summary') {
    return <SummaryView distance={distance} time={fmt(elapsed)} elev={elev} cal={calories} speed={speed} onDiscard={reset} onSave={() => { onSave(); reset(); }}/>;
  }

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', background: C.bg, position:'relative'}}>
      {/* Top bar */}
      <div style={{
        padding: '12px 18px', display:'flex', alignItems:'center', justifyContent:'space-between',
        background: C.bg, zIndex: 10,
      }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 12, border: `1px solid ${C.line}`,
          background:'#FFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <window.Icon name="chevronLeft" size={20} color={C.ink}/>
        </button>
        <div style={{fontSize: 15, fontWeight: 700, color: C.ink, letterSpacing: -0.3}}>
          {state === 'idle' ? 'Nova rota' : state === 'paused' ? 'Pausada' : 'Gravando'}
        </div>
        <button style={{
          width: 40, height: 40, borderRadius: 12, border: `1px solid ${C.line}`,
          background:'#FFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <window.Icon name="more" size={20} color={C.ink}/>
        </button>
      </div>

      {/* Map */}
      <div style={{position:'relative', flex: 1, overflow:'hidden'}}>
        <window.MapView height="100%" progress={state === 'idle' ? 0.1 : progress} showMarkers={state !== 'idle'}/>

        {/* Recording indicator badge */}
        {state === 'recording' && (
          <div style={{
            position:'absolute', top: 12, left: 12,
            display:'flex', alignItems:'center', gap: 8,
            background: C.ink, color:'#FFF', padding: '8px 12px',
            borderRadius: 999, fontSize: 12, fontWeight: 700,
          }}>
            <div style={{width: 8, height: 8, borderRadius: '50%', background: C.primary,
              animation:'pulse 1.2s ease-in-out infinite'}}/>
            GRAVANDO · {fmt(elapsed)}
          </div>
        )}
        {state === 'paused' && (
          <div style={{
            position:'absolute', top: 12, left: 12,
            display:'flex', alignItems:'center', gap: 8,
            background: C.warn, color:'#FFF', padding: '8px 12px',
            borderRadius: 999, fontSize: 12, fontWeight: 700,
          }}>
            <window.Icon name="pause" size={12} color="#FFF"/>
            PAUSADA · {fmt(elapsed)}
          </div>
        )}

        {/* GPS signal */}
        <div style={{
          position:'absolute', top: 12, right: 58,
          background: '#FFF', border: `1px solid ${C.line}`,
          padding: '6px 10px', borderRadius: 999,
          display:'flex', alignItems:'center', gap: 6,
          fontSize: 11, fontWeight: 600, color: C.ink,
          fontFamily: window.BR.font.mono,
        }}>
          <div style={{width: 6, height: 6, borderRadius:'50%', background: C.success}}/>
          GPS
        </div>

        {/* Start button overlay for idle */}
        {state === 'idle' && (
          <div style={{
            position:'absolute', left: '50%', top: '50%',
            transform:'translate(-50%, -50%)',
            display:'flex', flexDirection:'column', alignItems:'center', gap: 16,
          }}>
            <button onClick={() => setState('recording')} style={{
              width: 128, height: 128, borderRadius: '50%',
              background: C.primary, color:'#FFF', border: '6px solid rgba(255,255,255,0.9)',
              cursor:'pointer', boxShadow: '0 20px 40px rgba(232,85,58,0.4), 0 0 0 12px rgba(232,85,58,0.15)',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap: 2, fontFamily: window.BR.font.sans,
            }}>
              <window.Icon name="play" size={36} color="#FFF"/>
              <div style={{fontSize: 13, fontWeight: 800, letterSpacing: 1}}>INICIAR</div>
            </button>
            <div style={{
              background: 'rgba(31,27,22,0.85)', color: '#FFF', padding: '8px 14px',
              borderRadius: 999, fontSize: 12, fontWeight: 600,
            }}>Toque para começar a gravar</div>
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      <div style={{
        background: '#FFF', borderRadius: '24px 24px 0 0',
        padding: '16px 18px 20px',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.06)',
        position: 'relative', zIndex: 20,
      }}>
        <div style={{width: 40, height: 4, borderRadius: 2, background: C.line, margin: '0 auto 16px'}}/>

        {state === 'idle' ? (
          <>
            <div style={{fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 10, letterSpacing: -0.2}}>
              Tipo de atividade
            </div>
            <div style={{display:'flex', gap: 8, marginBottom: 16}}>
              {[
                {id:'urbano', l:'Urbano', icon:'map'},
                {id:'trilha', l:'Trilha', icon:'mountain'},
                {id:'estrada', l:'Estrada', icon:'route'},
              ].map((t, i) => (
                <button key={t.id} style={{
                  flex: 1, padding: '12px 8px', borderRadius: 14,
                  background: i === 0 ? C.forestSoft : '#FFF',
                  border: `1.5px solid ${i === 0 ? C.forest : C.line}`,
                  cursor: 'pointer',
                  display:'flex', flexDirection:'column', alignItems:'center', gap: 4,
                  color: i === 0 ? C.forest : C.inkSoft,
                }}>
                  <window.Icon name={t.icon} size={18} color={i === 0 ? C.forest : C.inkSoft}/>
                  <div style={{fontSize: 12, fontWeight: 600}}>{t.l}</div>
                </button>
              ))}
            </div>
            <div style={{
              display:'flex', alignItems:'center', gap: 10,
              padding: '10px 12px', background: C.bgAlt, borderRadius: 12,
            }}>
              <window.Icon name="target" size={16} color={C.forest}/>
              <div style={{flex: 1, fontSize: 12, color: C.inkSoft}}>
                Meta de hoje: <b style={{color: C.ink}}>15 km</b>
              </div>
              <button style={{background:'none', border:'none', color: C.primaryDark, fontSize: 12, fontWeight: 600, cursor:'pointer'}}>Editar</button>
            </div>
          </>
        ) : (
          <>
            {/* Live stats */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, marginBottom: 12}}>
              <div style={{textAlign:'left'}}>
                <div style={{fontSize: 10, fontWeight: 700, color: C.inkMute, textTransform:'uppercase', letterSpacing: 0.8}}>Distância</div>
                <div style={{fontSize: 34, fontFamily: window.BR.font.mono, fontWeight: 500, color: C.ink, letterSpacing: -0.5, lineHeight: 1}}>
                  {distance.toFixed(2)}
                  <span style={{fontSize: 15, color: C.inkMute, fontWeight: 500}}> km</span>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize: 10, fontWeight: 700, color: C.inkMute, textTransform:'uppercase', letterSpacing: 0.8}}>Tempo</div>
                <div style={{fontSize: 34, fontFamily: window.BR.font.mono, fontWeight: 500, color: C.ink, letterSpacing: -0.5, lineHeight: 1}}>
                  {fmt(elapsed)}
                </div>
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 6, marginBottom: 16,
              paddingTop: 12, borderTop: `1px solid ${C.lineSoft}`}}>
              <div>
                <div style={{fontSize: 10, color: C.inkMute, fontWeight: 600, textTransform:'uppercase', letterSpacing: 0.6}}>Veloc.</div>
                <div style={{fontSize: 16, fontFamily: window.BR.font.mono, color: C.ink, fontWeight: 500}}>
                  {speed}<span style={{fontSize: 10, color: C.inkMute}}> km/h</span>
                </div>
              </div>
              <div>
                <div style={{fontSize: 10, color: C.inkMute, fontWeight: 600, textTransform:'uppercase', letterSpacing: 0.6}}>Elevação</div>
                <div style={{fontSize: 16, fontFamily: window.BR.font.mono, color: C.ink, fontWeight: 500}}>
                  {elev}<span style={{fontSize: 10, color: C.inkMute}}>m</span>
                </div>
              </div>
              <div>
                <div style={{fontSize: 10, color: C.inkMute, fontWeight: 600, textTransform:'uppercase', letterSpacing: 0.6}}>Kcal</div>
                <div style={{fontSize: 16, fontFamily: window.BR.font.mono, color: C.ink, fontWeight: 500}}>
                  {calories}
                </div>
              </div>
            </div>
            <div style={{display:'flex', gap: 10, alignItems:'center'}}>
              {state === 'recording' ? (
                <>
                  <button onClick={() => setState('paused')} style={{
                    flex: 1, height: 56, borderRadius: 16, background: C.warn,
                    color:'#FFF', border:'none', cursor:'pointer',
                    fontSize: 15, fontWeight: 700, fontFamily: window.BR.font.sans,
                    display:'flex', alignItems:'center', justifyContent:'center', gap: 8,
                  }}>
                    <window.Icon name="pause" size={18} color="#FFF"/> Pausar
                  </button>
                  <button style={{
                    width: 56, height: 56, borderRadius: 16, background: C.bgAlt,
                    border:`1px solid ${C.line}`, cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <window.Icon name="camera" size={20} color={C.ink}/>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setState('recording')} style={{
                    flex: 1, height: 56, borderRadius: 16, background: C.success,
                    color:'#FFF', border:'none', cursor:'pointer',
                    fontSize: 15, fontWeight: 700, fontFamily: window.BR.font.sans,
                    display:'flex', alignItems:'center', justifyContent:'center', gap: 8,
                  }}>
                    <window.Icon name="play" size={18} color="#FFF"/> Continuar
                  </button>
                  <button onClick={() => setState('summary')} style={{
                    width: 56, height: 56, borderRadius: 16, background: C.danger,
                    border:'none', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <window.Icon name="stop" size={18} color="#FFF"/>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100% { opacity:1; transform: scale(1); } 50% { opacity:0.4; transform: scale(0.8); } }`}</style>
    </div>
  );
};

function SummaryView({ distance, time, elev, cal, speed, onDiscard, onSave }) {
  const C = window.BR.colors;
  const [name, setName] = React.useState('Rota matinal · Ibirapuera');

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', background: C.bg, overflow:'auto'}}>
      {/* Header with celebration */}
      <div style={{
        background: `linear-gradient(160deg, ${C.forest}, #1F3328)`,
        padding: '20px 22px 28px', color:'#FFF', position:'relative', overflow:'hidden',
      }}>
        <svg viewBox="0 0 390 180" style={{position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.15}}>
          <path d="M-20 120 Q 80 80 180 100 T 420 70" stroke="#FFF" strokeWidth="2" fill="none"/>
          <path d="M-20 140 Q 100 110 200 130 T 420 100" stroke="#FFF" strokeWidth="1" fill="none"/>
        </svg>
        <div style={{position:'relative'}}>
          <div style={{display:'flex', alignItems:'center', gap: 6, fontSize: 12, color: C.leaf, fontWeight: 700, letterSpacing: 0.8, marginBottom: 8}}>
            <window.Icon name="check" size={14} color={C.leaf}/> ROTA FINALIZADA
          </div>
          <div style={{fontSize: 30, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.05, marginBottom: 4}}>Boa pedalada!</div>
          <div style={{fontSize: 14, color:'rgba(255,255,255,0.7)'}}>
            Você completou <b style={{color:'#FFF', fontFamily: window.BR.font.mono}}>{distance.toFixed(2)} km</b> em {time}
          </div>
        </div>
      </div>

      {/* Map preview */}
      <div style={{margin: '-20px 18px 14px', background:'#FFF', borderRadius: 18,
        overflow:'hidden', border: `1px solid ${C.line}`, boxShadow: window.BR.shadow.sm}}>
        <window.MapView height={160}/>
      </div>

      {/* Name field */}
      <div style={{padding: '0 18px 14px'}}>
        <window.TextField label="Nome da rota" value={name} onChange={e=>setName(e.target.value)}
          icon={<window.Icon name="edit" size={18}/>}/>
      </div>

      {/* Stats grid */}
      <div style={{padding: '0 18px 14px', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8}}>
        <window.Stat label="Distância" value={distance.toFixed(2)} unit="km" icon={<window.Icon name="route" size={14}/>} accent={C.forest}/>
        <window.Stat label="Tempo" value={time} icon={<window.Icon name="clock" size={14}/>}/>
        <window.Stat label="Vel. méd." value={speed} unit="km/h" icon={<window.Icon name="speed" size={14}/>}/>
        <window.Stat label="Elevação" value={elev} unit="m" icon={<window.Icon name="mountain" size={14}/>}/>
        <window.Stat label="Calorias" value={cal} unit="kcal" icon={<window.Icon name="flame" size={14}/>}/>
        <window.Stat label="Ritmo" value="3:12" unit="/km" icon={<window.Icon name="trending" size={14}/>}/>
      </div>

      {/* Elevation */}
      <div style={{margin: '0 18px 14px', background:'#FFF', border:`1px solid ${C.line}`, borderRadius: 16, padding: '14px 16px'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 8}}>
          <div style={{fontSize: 12, fontWeight: 700, color: C.ink, textTransform:'uppercase', letterSpacing: 0.5}}>Elevação</div>
          <div style={{fontSize: 11, color: C.inkMute, fontFamily: window.BR.font.mono}}>↑{elev}m · ↓{Math.round(elev*0.9)}m</div>
        </div>
        <window.ElevationChart height={64}/>
      </div>

      {/* Actions */}
      <div style={{padding: '4px 18px 20px', display:'flex', flexDirection:'column', gap: 10}}>
        <window.Button variant="primary" size="lg" full onClick={onSave}
          iconRight={<window.Icon name="check" size={18} color="#FFF"/>}>
          Salvar rota
        </window.Button>
        <div style={{display:'flex', gap: 10}}>
          <window.Button variant="outline" size="md" full icon={<window.Icon name="share" size={16}/>}>
            Compartilhar
          </window.Button>
          <window.Button variant="ghost" size="md" full onClick={onDiscard}
            style={{color: C.danger}}>
            Descartar
          </window.Button>
        </div>
      </div>
    </div>
  );
}
