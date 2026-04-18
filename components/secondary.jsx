// Stats / Profile / Friends screens — simpler secondary screens
const useSt3 = React.useState;

window.StatsScreen = function StatsScreen() {
  const C = window.BR.colors;
  const [period, setPeriod] = useSt3('week');
  const bars = [
    { d: 'Seg', v: 12 }, { d: 'Ter', v: 0 }, { d: 'Qua', v: 14.2 },
    { d: 'Qui', v: 0 }, { d: 'Sex', v: 22 }, { d: 'Sáb', v: 18.4 }, { d: 'Dom', v: 32.1 },
  ];
  const max = Math.max(...bars.map(b => b.v));

  return (
    <div style={{flex: 1, overflow:'auto', background: C.bg}}>
      <div style={{padding: '18px 22px 4px'}}>
        <div style={{fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: -0.8}}>Estatísticas</div>
      </div>
      <div style={{padding: '14px 22px'}}>
        <window.Segmented
          options={[{value:'week', label:'Semana'}, {value:'month', label:'Mês'}, {value:'year', label:'Ano'}, {value:'all', label:'Tudo'}]}
          value={period} onChange={setPeriod}
        />
      </div>

      {/* Big totals */}
      <div style={{padding: '4px 18px 14px'}}>
        <div style={{background: C.forest, borderRadius: 22, padding: 20, color:'#FFF', position:'relative', overflow:'hidden'}}>
          <svg viewBox="0 0 320 200" style={{position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.1}}>
            <path d="M-10 140 Q 80 100 160 120 T 340 90" stroke="#FFF" strokeWidth="2" fill="none"/>
          </svg>
          <div style={{position:'relative', fontSize: 11, color:'rgba(255,255,255,0.65)', fontWeight: 600, textTransform:'uppercase', letterSpacing: 0.8}}>Distância total · semana</div>
          <div style={{position:'relative', fontSize: 48, fontFamily: window.BR.font.mono, fontWeight: 500, letterSpacing: -1.5, marginTop: 4, lineHeight: 1}}>
            98.7<span style={{fontSize: 18, color:'rgba(255,255,255,0.6)', fontWeight: 400}}> km</span>
          </div>
          <div style={{position:'relative', marginTop: 6, fontSize: 13, color: C.leaf, display:'flex', alignItems:'center', gap: 4}}>
            <window.Icon name="arrowUp" size={14} color={C.leaf}/> +23% vs semana anterior
          </div>
          {/* Bars */}
          <div style={{position:'relative', marginTop: 20, display:'flex', gap: 6, alignItems:'flex-end', height: 80}}>
            {bars.map((b, i) => (
              <div key={i} style={{flex: 1, display:'flex', flexDirection:'column', alignItems:'center', gap: 6}}>
                <div style={{
                  width:'100%', height: `${Math.max(4, (b.v/max)*60)}px`,
                  background: b.v > 0 ? C.primary : 'rgba(255,255,255,0.15)',
                  borderRadius: 6,
                }}/>
                <div style={{fontSize: 10, color:'rgba(255,255,255,0.6)', fontWeight: 600}}>{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metric grid */}
      <div style={{padding: '4px 18px 14px', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8}}>
        <window.Stat label="Tempo" value="6h 18m" icon={<window.Icon name="clock" size={13}/>}/>
        <window.Stat label="Calorias" value="3 439" unit="kcal" icon={<window.Icon name="flame" size={13}/>}/>
        <window.Stat label="Elevação" value="1 247" unit="m" icon={<window.Icon name="mountain" size={13}/>}/>
        <window.Stat label="Vel. méd." value="18.2" unit="km/h" icon={<window.Icon name="speed" size={13}/>}/>
      </div>

      {/* Ranking */}
      <div style={{padding: '4px 18px 20px'}}>
        <div style={{fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 10, letterSpacing: -0.2}}>Ranking de amigos</div>
        <div style={{background:'#FFF', border:`1px solid ${C.line}`, borderRadius: 18, overflow:'hidden'}}>
          {[
            {n: 1, name: 'Carlos R.', km: 142.3, you: false, medal:'🥇'},
            {n: 2, name: 'Ana P.', km: 118.6, you: false, medal:'🥈'},
            {n: 3, name: 'Você', km: 98.7, you: true, medal:'🥉'},
            {n: 4, name: 'Bruno M.', km: 76.4, you: false},
            {n: 5, name: 'Julia S.', km: 54.1, you: false},
          ].map((r, i, arr) => (
            <div key={r.n} style={{
              padding: '12px 16px', display:'flex', alignItems:'center', gap: 12,
              borderBottom: i < arr.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
              background: r.you ? C.primarySoft : 'transparent',
            }}>
              <div style={{fontSize: 13, fontWeight: 700, color: C.inkMute, fontFamily: window.BR.font.mono, width: 18}}>{r.n}</div>
              <div style={{
                width: 36, height: 36, borderRadius:'50%',
                background: r.you ? C.primary : `hsl(${r.n*60}, 35%, 55%)`,
                color:'#FFF', display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight: 700, fontSize: 14,
              }}>{r.name[0]}</div>
              <div style={{flex: 1, fontSize: 14, fontWeight: r.you ? 700 : 600, color: C.ink}}>{r.name}</div>
              <div style={{fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: window.BR.font.mono}}>{r.km} <span style={{color: C.inkMute, fontSize: 11}}>km</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

window.ProfileScreen = function ProfileScreen({ onLogout }) {
  const C = window.BR.colors;
  return (
    <div style={{flex: 1, overflow:'auto', background: C.bg}}>
      <div style={{padding: '18px 22px 24px', background: C.forest, color:'#FFF', position:'relative', overflow:'hidden'}}>
        <svg viewBox="0 0 390 200" style={{position:'absolute', inset:0, width:'100%', height:'100%', opacity: 0.12}}>
          <path d="M-10 140 Q 80 110 160 130 T 420 100" stroke="#FFF" strokeWidth="2" fill="none"/>
          <path d="M-10 160 Q 100 130 180 150 T 420 120" stroke="#FFF" strokeWidth="1" fill="none"/>
        </svg>
        <div style={{position:'relative', display:'flex', alignItems:'center', gap: 14}}>
          <div style={{
            width: 72, height: 72, borderRadius:'50%',
            background: `linear-gradient(135deg, ${C.moss}, ${C.primary})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize: 28, fontWeight: 700, color:'#FFF',
            border: '3px solid rgba(255,255,255,0.2)',
          }}>M</div>
          <div>
            <div style={{fontSize: 20, fontWeight: 800, letterSpacing: -0.4}}>Maria Silva</div>
            <div style={{fontSize: 13, color: 'rgba(255,255,255,0.7)'}}>@maria.bike · São Paulo</div>
            <div style={{fontSize: 12, color: C.leaf, marginTop: 4, fontWeight: 600}}>Pedalando desde março 2024</div>
          </div>
        </div>
        <div style={{position:'relative', marginTop: 18, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8}}>
          {[
            {l:'Rotas', v:'47'},
            {l:'Distância', v:'1 247 km'},
            {l:'Elevação', v:'12.4k m'},
          ].map(s => (
            <div key={s.l} style={{textAlign:'center'}}>
              <div style={{fontSize: 18, fontFamily: window.BR.font.mono, fontWeight: 600}}>{s.v}</div>
              <div style={{fontSize: 10, color:'rgba(255,255,255,0.6)', fontWeight: 600, textTransform:'uppercase', letterSpacing: 0.6, marginTop: 2}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding: 18, display:'flex', flexDirection:'column', gap: 8}}>
        {[
          {icon:'target', l:'Metas e desafios', s:'3 ativos'},
          {icon:'trophy', l:'Conquistas', s:'12 de 30'},
          {icon:'users', l:'Amigos', s:'18 seguindo'},
          {icon:'bike', l:'Minhas bikes', s:'2 cadastradas'},
          {icon:'settings', l:'Configurações'},
        ].map(item => (
          <button key={item.l} style={{
            background:'#FFF', border:`1px solid ${C.line}`, borderRadius: 14,
            padding: '14px 16px', display:'flex', alignItems:'center', gap: 12,
            cursor:'pointer', textAlign:'left',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: C.forestSoft, color: C.forest,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <window.Icon name={item.icon} size={18} color={C.forest}/>
            </div>
            <div style={{flex: 1}}>
              <div style={{fontSize: 14, fontWeight: 600, color: C.ink}}>{item.l}</div>
              {item.s && <div style={{fontSize: 12, color: C.inkMute}}>{item.s}</div>}
            </div>
            <window.Icon name="chevronRight" size={16} color={C.inkMute}/>
          </button>
        ))}

        <button onClick={onLogout} style={{
          background:'transparent', border:`1.5px solid ${C.line}`, borderRadius: 14,
          padding: 14, marginTop: 12, cursor:'pointer',
          fontSize: 14, fontWeight: 600, color: C.danger,
          fontFamily: window.BR.font.sans,
        }}>
          Sair da conta
        </button>
      </div>
    </div>
  );
};
