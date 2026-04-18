// Home screen with dashboard
window.HomeScreen = function HomeScreen({ onNav, onRecord, onOpenRoute, weekGoal, variant = 'a' }) {
  const C = window.BR.colors;

  // Mock user
  const user = { name: 'Maria', city: 'São Paulo' };
  const weeklyStats = {
    distance: 47.2, goal: weekGoal || 80,
    rides: 4, time: '3h 42min', elev: 612,
  };

  const quickActions = [
    { id: 'record', icon: 'record', label: 'Gravar rota', color: C.primary, onClick: onRecord },
    { id: 'routes', icon: 'map', label: 'Minhas rotas', color: C.forest, onClick: () => onNav('routes') },
    { id: 'friends', icon: 'users', label: 'Amigos', color: C.moss, onClick: () => onNav('friends') },
    { id: 'goals', icon: 'target', label: 'Metas', color: C.sky, onClick: () => onNav('goals') },
  ];

  const recentRoutes = [
    { id: 1, name: 'Ibirapuera Loop', date: 'Hoje, 07:12', dist: '18.4 km', time: '54min', type: 'urbano', elev: 142 },
    { id: 2, name: 'Trilha Cantareira', date: 'Dom, 14 abr', dist: '32.1 km', time: '2h 18min', type: 'trilha', elev: 820 },
    { id: 3, name: 'Marginal Pinheiros', date: 'Sex, 12 abr', dist: '22.0 km', time: '1h 04min', type: 'estrada', elev: 85 },
  ];

  const pct = Math.min(100, (weeklyStats.distance / weeklyStats.goal) * 100);

  // Variant A: bold hero with big ring. Variant B: grid-first minimal.
  return (
    <div style={{flex:1, overflow:'auto', background: C.bg}}>
      {/* Header */}
      <div style={{
        padding: '18px 22px 14px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div style={{display:'flex', alignItems:'center', gap: 12}}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.moss}, ${C.forest})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#FFF', fontWeight: 700, fontSize: 16,
          }}>M</div>
          <div>
            <div style={{fontSize: 12, color: C.inkMute, fontWeight: 500}}>Bem-vinda de volta</div>
            <div style={{fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: -0.3}}>{user.name} Silva</div>
          </div>
        </div>
        <div style={{display:'flex', gap: 8}}>
          <button style={{
            width: 40, height: 40, borderRadius: 12,
            background: C.white, border: `1px solid ${C.line}`,
            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
            position: 'relative',
          }}>
            <window.Icon name="notif" size={18} color={C.ink}/>
            <div style={{
              position:'absolute', top: 8, right: 10,
              width: 8, height: 8, borderRadius: '50%', background: C.primary,
              border: '2px solid #FFF',
            }}/>
          </button>
        </div>
      </div>

      {variant === 'a' ? (
        <>
          {/* Weekly goal hero card */}
          <div style={{margin: '6px 18px 18px', padding: 20,
            background: C.forest, borderRadius: 24, color:'#FFF',
            position:'relative', overflow:'hidden',
          }}>
            {/* bg pattern */}
            <svg viewBox="0 0 300 200" style={{position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.1}}>
              <path d="M-10 160 Q 80 130 160 150 T 320 120" stroke="#FFF" strokeWidth="1.5" fill="none"/>
              <path d="M-10 180 Q 100 150 180 170 T 320 140" stroke="#FFF" strokeWidth="1" fill="none" strokeDasharray="3 4"/>
            </svg>
            <div style={{position:'relative', display:'flex', alignItems:'center', gap: 20}}>
              {/* Ring */}
              <div style={{position:'relative', width: 110, height: 110, flexShrink: 0}}>
                <svg viewBox="0 0 110 110" style={{transform:'rotate(-90deg)'}}>
                  <circle cx="55" cy="55" r="48" stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none"/>
                  <circle cx="55" cy="55" r="48" stroke={C.primary} strokeWidth="8" fill="none"
                    strokeDasharray={Math.PI*96} strokeDashoffset={Math.PI*96*(1 - pct/100)}
                    strokeLinecap="round"/>
                </svg>
                <div style={{
                  position:'absolute', inset:0, display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center',
                }}>
                  <div style={{fontSize: 22, fontWeight: 700, fontFamily: window.BR.font.mono}}>{Math.round(pct)}%</div>
                  <div style={{fontSize: 10, color:'rgba(255,255,255,0.6)', fontWeight:600, letterSpacing: 0.5}}>META</div>
                </div>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 12, color:'rgba(255,255,255,0.65)', fontWeight: 600, textTransform:'uppercase', letterSpacing: 0.6, marginBottom: 4}}>
                  Meta semanal
                </div>
                <div style={{fontSize: 20, fontWeight: 700, letterSpacing: -0.4, marginBottom: 8}}>
                  <span style={{fontFamily: window.BR.font.mono}}>{weeklyStats.distance}</span>
                  <span style={{color:'rgba(255,255,255,0.5)', fontSize: 16}}> / {weeklyStats.goal} km</span>
                </div>
                <div style={{fontSize: 13, color:'rgba(255,255,255,0.8)', lineHeight: 1.4}}>
                  Faltam <b style={{color:'#FFF'}}>{(weeklyStats.goal - weeklyStats.distance).toFixed(1)} km</b> para sua meta
                </div>
              </div>
            </div>
            {/* Mini stats row */}
            <div style={{position:'relative', marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.12)', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8}}>
              <div>
                <div style={{fontSize: 16, fontWeight: 600, fontFamily: window.BR.font.mono}}>{weeklyStats.rides}</div>
                <div style={{fontSize: 11, color:'rgba(255,255,255,0.6)'}}>Pedaladas</div>
              </div>
              <div>
                <div style={{fontSize: 16, fontWeight: 600, fontFamily: window.BR.font.mono}}>{weeklyStats.time}</div>
                <div style={{fontSize: 11, color:'rgba(255,255,255,0.6)'}}>Tempo</div>
              </div>
              <div>
                <div style={{fontSize: 16, fontWeight: 600, fontFamily: window.BR.font.mono}}>{weeklyStats.elev}m</div>
                <div style={{fontSize: 11, color:'rgba(255,255,255,0.6)'}}>Elevação</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Variant B — minimal stacked cards */}
          <div style={{margin: '6px 18px 14px', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10}}>
            <div style={{background:'#FFF', borderRadius: 18, padding: 16, border: `1px solid ${C.line}`}}>
              <div style={{fontSize: 11, color: C.inkMute, fontWeight: 600, textTransform:'uppercase', letterSpacing: 0.6}}>Esta semana</div>
              <div style={{fontSize: 24, fontFamily: window.BR.font.mono, fontWeight: 600, color: C.ink, marginTop: 4}}>{weeklyStats.distance}
                <span style={{fontSize: 13, color: C.inkMute}}> km</span>
              </div>
              <div style={{height: 6, background: C.lineSoft, borderRadius: 3, marginTop: 10, overflow:'hidden'}}>
                <div style={{width: `${pct}%`, height:'100%', background: C.primary}}/>
              </div>
              <div style={{fontSize: 11, color: C.inkMute, marginTop: 6}}>Meta: {weeklyStats.goal} km</div>
            </div>
            <div style={{background: C.forest, borderRadius: 18, padding: 16, color:'#FFF'}}>
              <div style={{fontSize: 11, color:'rgba(255,255,255,0.6)', fontWeight: 600, textTransform:'uppercase', letterSpacing: 0.6}}>Ranking</div>
              <div style={{fontSize: 24, fontFamily: window.BR.font.mono, fontWeight: 600, marginTop: 4}}>#14
                <span style={{fontSize: 13, color:'rgba(255,255,255,0.6)'}}> /127</span>
              </div>
              <div style={{display:'flex', alignItems:'center', gap: 4, fontSize: 11, marginTop: 10, color: C.leaf}}>
                <window.Icon name="arrowUp" size={12}/> Subiu 3 posições
              </div>
            </div>
          </div>
        </>
      )}

      {/* Quick actions */}
      <div style={{padding: '4px 18px 14px'}}>
        <div style={{fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 10, letterSpacing: -0.2, display:'flex', alignItems:'center', gap: 6}}>
          Menu rápido
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap: 8}}>
          {quickActions.map(a => (
            <button key={a.id} onClick={a.onClick} style={{
              background: C.white, border: `1px solid ${C.line}`, borderRadius: 16,
              padding: '14px 8px', cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', gap: 8,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 11,
                background: a.color + '15', color: a.color,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <window.Icon name={a.icon} size={20} color={a.color}/>
              </div>
              <div style={{fontSize: 11, fontWeight: 600, color: C.ink, textAlign:'center', lineHeight: 1.2}}>{a.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Weather + tip strip */}
      <div style={{padding: '0 18px 14px'}}>
        <div style={{
          background: '#FFF', border: `1px solid ${C.line}`, borderRadius: 16,
          padding: '14px 16px', display:'flex', alignItems:'center', gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #FCE3B6, #F5A524)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <window.Icon name="sun" size={22} color="#FFF"/>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 13, fontWeight: 600, color: C.ink}}>Bom dia pra pedalar</div>
            <div style={{fontSize: 12, color: C.inkSoft, marginTop: 2}}>
              <b style={{fontFamily: window.BR.font.mono, color: C.ink}}>22°</b> · Ensolarado · Vento leve
            </div>
          </div>
          <div style={{display:'flex', gap: 10, color: C.inkMute, fontSize: 11, fontFamily: window.BR.font.mono}}>
            <div style={{textAlign:'center'}}>
              <window.Icon name="wind" size={14}/> 8km/h
            </div>
            <div style={{textAlign:'center'}}>
              <window.Icon name="droplet" size={14}/> 45%
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{padding: '4px 18px 20px'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10}}>
          <div style={{fontSize: 13, fontWeight: 700, color: C.ink, letterSpacing: -0.2}}>Atividade recente</div>
          <button onClick={() => onNav('routes')} style={{
            background:'none', border:'none', cursor:'pointer', fontSize: 12, fontWeight: 600,
            color: C.primaryDark, display:'flex', alignItems:'center', gap: 2,
          }}>Ver tudo <window.Icon name="chevronRight" size={14}/></button>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap: 8}}>
          {recentRoutes.map(r => (
            <button key={r.id} onClick={() => onOpenRoute(r)} style={{
              background: C.white, border:`1px solid ${C.line}`, borderRadius: 16,
              padding: 12, cursor:'pointer', display:'flex', alignItems:'center', gap: 12,
              textAlign:'left',
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: 12, background: C.bgAlt,
                position:'relative', overflow:'hidden', flexShrink: 0,
              }}>
                <svg viewBox="0 0 60 60" style={{width:'100%', height:'100%'}}>
                  <rect width="60" height="60" fill={C.forestSoft}/>
                  <path d={r.type === 'trilha' ? "M5 45 Q 15 25 25 35 T 45 20 T 58 30" : r.type === 'estrada' ? "M5 30 L 58 28" : "M5 45 Q 20 30 30 35 T 55 20"}
                    stroke={C.primary} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontSize: 14, fontWeight: 700, color: C.ink, letterSpacing: -0.2, marginBottom: 3}}>{r.name}</div>
                <div style={{fontSize: 11, color: C.inkMute, marginBottom: 6}}>{r.date} · {r.type}</div>
                <div style={{display:'flex', gap: 10, fontSize: 11, color: C.inkSoft, fontFamily: window.BR.font.mono}}>
                  <span><b style={{color: C.ink}}>{r.dist}</b></span>
                  <span>·</span>
                  <span>{r.time}</span>
                  <span>·</span>
                  <span>↑{r.elev}m</span>
                </div>
              </div>
              <window.Icon name="chevronRight" size={16} color={C.inkMute}/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
