// Routes list + detail + edit screens
const useSt2 = React.useState;

const MOCK_ROUTES = [
  { id: 1, name: 'Ibirapuera Loop', date: 'Hoje, 07:12', dist: 18.4, time: '54min', type: 'urbano', elev: 142, speed: 20.4, cal: 699, difficulty: 'easy', privacy: 'public', notes: 'Volta matinal tranquila pelo parque.', cover: 'forest' },
  { id: 2, name: 'Trilha Cantareira', date: 'Dom, 14 abr', dist: 32.1, time: '2h 18min', type: 'trilha', elev: 820, speed: 13.9, cal: 1250, difficulty: 'hard', privacy: 'public', notes: 'Subida pesada, descida técnica. Levar bastante água.', cover: 'mountain' },
  { id: 3, name: 'Marginal Pinheiros', date: 'Sex, 12 abr', dist: 22.0, time: '1h 04min', type: 'estrada', elev: 85, speed: 20.6, cal: 820, difficulty: 'medium', privacy: 'public', notes: 'Ciclovia rápida, ótimo para treino.', cover: 'road' },
  { id: 4, name: 'Volta da USP', date: 'Qua, 10 abr', dist: 14.2, time: '42min', type: 'urbano', elev: 95, speed: 20.3, cal: 540, difficulty: 'easy', privacy: 'private', notes: '', cover: 'forest' },
  { id: 5, name: 'Pico do Jaraguá', date: 'Dom, 7 abr', dist: 28.8, time: '2h 05min', type: 'trilha', elev: 680, speed: 13.8, cal: 1120, difficulty: 'hard', privacy: 'public', notes: 'Subida técnica até o pico.', cover: 'mountain' },
];

window.RoutesListScreen = function RoutesListScreen({ onOpen, onRecord }) {
  const C = window.BR.colors;
  const [filter, setFilter] = useSt2('all');
  const [sort, setSort] = useSt2('recent');

  const filtered = MOCK_ROUTES.filter(r => filter === 'all' || r.type === filter);

  return (
    <div style={{flex: 1, overflow: 'auto', background: C.bg}}>
      {/* Header */}
      <div style={{padding: '18px 22px 8px'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12}}>
          <div>
            <div style={{fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: -0.8}}>Minhas rotas</div>
            <div style={{fontSize: 13, color: C.inkMute, marginTop: 2}}>{MOCK_ROUTES.length} rotas · 115.5 km no total</div>
          </div>
          <button style={{
            width: 40, height: 40, borderRadius: 12, border:`1px solid ${C.line}`,
            background:'#FFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <window.Icon name="search" size={18} color={C.ink}/>
          </button>
        </div>

        {/* Filter chips */}
        <div style={{display:'flex', gap: 8, overflowX:'auto', paddingBottom: 4, margin: '0 -22px', padding: '0 22px 4px'}}>
          {[
            {id: 'all', l: 'Todas', n: MOCK_ROUTES.length},
            {id: 'urbano', l: 'Urbano', n: MOCK_ROUTES.filter(r=>r.type==='urbano').length},
            {id: 'trilha', l: 'Trilha', n: MOCK_ROUTES.filter(r=>r.type==='trilha').length},
            {id: 'estrada', l: 'Estrada', n: MOCK_ROUTES.filter(r=>r.type==='estrada').length},
          ].map(f => (
            <window.Pill key={f.id} active={filter===f.id} onClick={()=>setFilter(f.id)}>
              {f.l} <span style={{opacity: 0.6, fontWeight: 500}}>({f.n})</span>
            </window.Pill>
          ))}
        </div>
      </div>

      {/* Sort bar */}
      <div style={{padding:'8px 22px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <window.Segmented
          options={[{value:'recent', label:'Recentes'}, {value:'longest', label:'Mais longas'}, {value:'fastest', label:'Rápidas'}]}
          value={sort} onChange={setSort}
        />
      </div>

      {/* List */}
      <div style={{padding: '4px 18px 20px', display:'flex', flexDirection:'column', gap: 10}}>
        {filtered.map(r => <RouteCard key={r.id} route={r} onClick={() => onOpen(r)}/>)}
        {filtered.length === 0 && (
          <div style={{textAlign:'center', padding: '40px 20px', color: C.inkMute}}>
            Nenhuma rota neste filtro
          </div>
        )}
      </div>
    </div>
  );
};

function RouteCard({ route, onClick }) {
  const C = window.BR.colors;
  const typeColor = route.type === 'trilha' ? C.forest : route.type === 'estrada' ? C.sky : C.moss;
  return (
    <button onClick={onClick} style={{
      background: '#FFF', border: `1px solid ${C.line}`, borderRadius: 18,
      padding: 14, cursor:'pointer', textAlign:'left',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{display:'flex', alignItems:'flex-start', gap: 12}}>
        <div style={{
          width: 72, height: 72, borderRadius: 14, background: C.forestSoft,
          position:'relative', overflow:'hidden', flexShrink: 0,
        }}>
          <svg viewBox="0 0 72 72" style={{width:'100%', height:'100%'}}>
            <rect width="72" height="72" fill={route.cover === 'mountain' ? '#D4DECA' : route.cover === 'road' ? '#E0E6EC' : C.forestSoft}/>
            {/* mini terrain */}
            {route.cover === 'mountain' && <>
              <path d="M0 55 L 20 35 L 35 48 L 50 30 L 72 45 L 72 72 L 0 72Z" fill={C.moss} opacity="0.5"/>
              <path d="M0 62 L 25 48 L 45 58 L 72 55 L 72 72 L 0 72Z" fill={C.forest} opacity="0.4"/>
            </>}
            {route.cover === 'road' && <>
              <rect y="35" width="72" height="6" fill={C.inkMute} opacity="0.3"/>
              <rect y="45" width="72" height="6" fill={C.inkMute} opacity="0.2"/>
            </>}
            <path d={route.type === 'trilha' ? "M5 55 Q 20 30 35 40 T 65 20" : route.type === 'estrada' ? "M5 38 L 65 35" : "M5 55 Q 25 35 38 42 T 65 25"}
              stroke={C.primary} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <circle cx="5" cy={route.type === 'trilha' ? 55 : route.type === 'estrada' ? 38 : 55} r="2.5" fill="#FFF" stroke={C.primary} strokeWidth="1.5"/>
          </svg>
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 8}}>
            <div style={{fontSize: 15, fontWeight: 700, color: C.ink, letterSpacing: -0.3, lineHeight: 1.2}}>{route.name}</div>
            {route.privacy === 'private' && (
              <div style={{color: C.inkMute, flexShrink: 0, paddingTop: 2}}>
                <window.Icon name="lock2" size={14}/>
              </div>
            )}
          </div>
          <div style={{fontSize: 11, color: C.inkMute, marginTop: 3, display:'flex', alignItems:'center', gap: 6}}>
            <span>{route.date}</span>
            <span>·</span>
            <span style={{color: typeColor, fontWeight: 600, textTransform:'capitalize'}}>{route.type}</span>
          </div>
          <div style={{display:'flex', gap: 10, marginTop: 8, fontSize: 11, color: C.inkSoft, fontFamily: window.BR.font.mono}}>
            <div><b style={{color: C.ink}}>{route.dist}</b> km</div>
            <div style={{color: C.lineSoft}}>|</div>
            <div>{route.time}</div>
            <div style={{color: C.lineSoft}}>|</div>
            <div>↑{route.elev}m</div>
          </div>
        </div>
      </div>
      {/* Mini elevation */}
      <div style={{marginTop: -4}}>
        <window.ElevationChart height={32} color={typeColor}/>
      </div>
    </button>
  );
}

// Route detail screen
window.RouteDetailScreen = function RouteDetailScreen({ route, onBack, onEdit, onShare }) {
  const C = window.BR.colors;
  if (!route) return null;

  return (
    <div style={{flex: 1, overflow:'auto', background: C.bg}}>
      {/* Hero map */}
      <div style={{position:'relative'}}>
        <window.MapView height={280}/>
        <button onClick={onBack} style={{
          position:'absolute', top: 14, left: 14,
          width: 40, height: 40, borderRadius: 12, background:'#FFF',
          border:`1px solid ${C.line}`, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: window.BR.shadow.sm,
        }}>
          <window.Icon name="chevronLeft" size={20} color={C.ink}/>
        </button>
        <div style={{position:'absolute', top: 14, right: 14, display:'flex', gap: 8}}>
          <button onClick={onShare} style={{
            width: 40, height: 40, borderRadius: 12, background:'#FFF',
            border:`1px solid ${C.line}`, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow: window.BR.shadow.sm,
          }}>
            <window.Icon name="share" size={18} color={C.ink}/>
          </button>
          <button onClick={onEdit} style={{
            width: 40, height: 40, borderRadius: 12, background: C.ink,
            border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow: window.BR.shadow.sm,
          }}>
            <window.Icon name="edit" size={18} color="#FFF"/>
          </button>
        </div>
      </div>

      {/* Title sheet */}
      <div style={{
        background: C.bg, borderRadius: '28px 28px 0 0',
        marginTop: -20, padding: '20px 22px 16px', position:'relative',
      }}>
        <div style={{display:'flex', alignItems:'center', gap: 8, fontSize: 11, color: C.inkMute, fontWeight: 600, textTransform:'uppercase', letterSpacing: 0.8, marginBottom: 6}}>
          <span style={{color: C.primary}}>●</span> {route.type}
          <span>·</span>
          {route.date}
        </div>
        <div style={{fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: -0.6, lineHeight: 1.1}}>{route.name}</div>
        {route.notes && (
          <div style={{fontSize: 13, color: C.inkSoft, marginTop: 8, lineHeight: 1.5}}>{route.notes}</div>
        )}
      </div>

      {/* Stats */}
      <div style={{padding: '0 18px 14px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8}}>
        <window.Stat label="Distância" value={route.dist} unit="km" icon={<window.Icon name="route" size={13}/>}/>
        <window.Stat label="Tempo" value={route.time} icon={<window.Icon name="clock" size={13}/>}/>
        <window.Stat label="Elevação" value={route.elev} unit="m" icon={<window.Icon name="mountain" size={13}/>}/>
        <window.Stat label="Vel. méd." value={route.speed} unit="km/h" icon={<window.Icon name="speed" size={13}/>}/>
        <window.Stat label="Kcal" value={route.cal} icon={<window.Icon name="flame" size={13}/>}/>
        <window.Stat label="Nível" value={route.difficulty === 'easy' ? 'Fácil' : route.difficulty === 'medium' ? 'Médio' : 'Difícil'} icon={<window.Icon name="target" size={13}/>}/>
      </div>

      {/* Elevation */}
      <div style={{margin: '0 18px 14px', background:'#FFF', border:`1px solid ${C.line}`, borderRadius: 16, padding: '14px 16px'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10}}>
          <div style={{fontSize: 12, fontWeight: 700, color: C.ink, textTransform:'uppercase', letterSpacing: 0.5}}>Perfil de elevação</div>
          <div style={{fontSize: 11, color: C.inkMute, fontFamily: window.BR.font.mono}}>máx 318m</div>
        </div>
        <window.ElevationChart height={72}/>
        <div style={{display:'flex', justifyContent:'space-between', fontSize: 10, color: C.inkMute, marginTop: 4, fontFamily: window.BR.font.mono}}>
          <span>0 km</span><span>{(route.dist/2).toFixed(1)} km</span><span>{route.dist} km</span>
        </div>
      </div>

      {/* Action row */}
      <div style={{padding: '0 18px 24px', display:'flex', gap: 8}}>
        <window.Button variant="forest" size="md" full icon={<window.Icon name="play" size={16} color="#FFF"/>}>
          Refazer rota
        </window.Button>
        <window.Button variant="outline" size="md" icon={<window.Icon name="download" size={16}/>}/>
        <window.Button variant="outline" size="md" icon={<window.Icon name="heart" size={16}/>}/>
      </div>
    </div>
  );
};

// Edit route screen
window.EditRouteScreen = function EditRouteScreen({ route, onBack, onSave }) {
  const C = window.BR.colors;
  const [name, setName] = useSt2(route?.name || '');
  const [notes, setNotes] = useSt2(route?.notes || '');
  const [type, setType] = useSt2(route?.type || 'urbano');
  const [difficulty, setDifficulty] = useSt2(route?.difficulty || 'easy');
  const [privacy, setPrivacy] = useSt2(route?.privacy || 'public');

  if (!route) return null;

  return (
    <div style={{flex: 1, display:'flex', flexDirection:'column', background: C.bg, overflow:'hidden'}}>
      {/* App bar */}
      <div style={{
        padding: '12px 16px', display:'flex', alignItems:'center', gap: 8,
        background: C.bg, borderBottom: `1px solid ${C.lineSoft}`,
      }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 12, border: `1px solid ${C.line}`,
          background:'#FFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <window.Icon name="x" size={18} color={C.ink}/>
        </button>
        <div style={{flex: 1, fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: -0.3}}>Editar rota</div>
        <window.Button variant="primary" size="sm" onClick={onSave}>Salvar</window.Button>
      </div>

      <div style={{flex: 1, overflow:'auto', padding: '16px 18px 20px'}}>
        {/* Cover photo */}
        <div style={{marginBottom: 16}}>
          <div style={{fontSize: 13, fontWeight: 600, color: C.inkSoft, marginBottom: 8}}>Foto de capa</div>
          <div style={{
            height: 140, borderRadius: 16, background: C.forestSoft,
            position:'relative', overflow:'hidden',
            border: `1px solid ${C.line}`,
          }}>
            <window.MapView height={140} interactive={false}/>
            <button style={{
              position:'absolute', bottom: 10, right: 10,
              padding: '8px 12px', borderRadius: 10, background:'rgba(31,27,22,0.85)',
              color:'#FFF', border:'none', cursor:'pointer',
              display:'flex', alignItems:'center', gap: 6, fontSize: 12, fontWeight: 600,
            }}>
              <window.Icon name="camera" size={14} color="#FFF"/> Alterar
            </button>
          </div>
        </div>

        {/* Name */}
        <div style={{marginBottom: 14}}>
          <window.TextField label="Nome da rota" value={name} onChange={e=>setName(e.target.value)}/>
        </div>

        {/* Notes */}
        <div style={{marginBottom: 16}}>
          <div style={{fontSize: 13, fontWeight: 600, color: C.inkSoft, marginBottom: 8}}>Descrição</div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)}
            placeholder="Adicione notas sobre esta rota..."
            style={{
              width: '100%', minHeight: 88, padding: '12px 14px',
              borderRadius: 14, background:'#FFF',
              border: `1.5px solid ${C.line}`, outline:'none',
              fontSize: 14, fontFamily: window.BR.font.sans, color: C.ink,
              resize: 'vertical', boxSizing:'border-box',
            }}/>
        </div>

        {/* Type */}
        <div style={{marginBottom: 16}}>
          <div style={{fontSize: 13, fontWeight: 600, color: C.inkSoft, marginBottom: 8}}>Tipo de atividade</div>
          <div style={{display:'flex', gap: 8}}>
            {[
              {id:'urbano', l:'Urbano', icon:'map'},
              {id:'trilha', l:'Trilha', icon:'mountain'},
              {id:'estrada', l:'Estrada', icon:'route'},
            ].map(t => (
              <button key={t.id} onClick={()=>setType(t.id)} style={{
                flex: 1, padding: '12px 8px', borderRadius: 14,
                background: type === t.id ? C.forestSoft : '#FFF',
                border: `1.5px solid ${type === t.id ? C.forest : C.line}`,
                cursor: 'pointer',
                display:'flex', flexDirection:'column', alignItems:'center', gap: 4,
                color: type === t.id ? C.forest : C.inkSoft,
              }}>
                <window.Icon name={t.icon} size={18} color={type === t.id ? C.forest : C.inkSoft}/>
                <div style={{fontSize: 12, fontWeight: 600}}>{t.l}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div style={{marginBottom: 16}}>
          <div style={{fontSize: 13, fontWeight: 600, color: C.inkSoft, marginBottom: 8}}>Nível de dificuldade</div>
          <div style={{display:'flex', gap: 6}}>
            {[
              {id:'easy', l:'Fácil', c: C.success},
              {id:'medium', l:'Médio', c: C.warn},
              {id:'hard', l:'Difícil', c: C.danger},
            ].map(d => (
              <button key={d.id} onClick={()=>setDifficulty(d.id)} style={{
                flex: 1, padding: '10px 8px', borderRadius: 12,
                background: difficulty === d.id ? d.c : '#FFF',
                border: `1.5px solid ${difficulty === d.id ? d.c : C.line}`,
                cursor: 'pointer',
                color: difficulty === d.id ? '#FFF' : C.inkSoft,
                fontSize: 12, fontWeight: 600,
                display:'flex', alignItems:'center', justifyContent:'center', gap: 6,
              }}>
                <div style={{width: 8, height: 8, borderRadius:'50%', background: difficulty === d.id ? '#FFF' : d.c}}/>
                {d.l}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div style={{marginBottom: 16}}>
          <div style={{fontSize: 13, fontWeight: 600, color: C.inkSoft, marginBottom: 8}}>Privacidade</div>
          <div style={{display:'flex', flexDirection:'column', gap: 8}}>
            {[
              {id:'public', icon:'globe', l:'Pública', d:'Qualquer pessoa pode ver'},
              {id:'private', icon:'lock2', l:'Privada', d:'Apenas você'},
            ].map(p => (
              <button key={p.id} onClick={()=>setPrivacy(p.id)} style={{
                background:'#FFF', border: `1.5px solid ${privacy === p.id ? C.forest : C.line}`,
                borderRadius: 14, padding: '12px 14px', cursor:'pointer',
                display:'flex', alignItems:'center', gap: 12, textAlign:'left',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: privacy === p.id ? C.forestSoft : C.bgAlt,
                  color: privacy === p.id ? C.forest : C.inkSoft,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <window.Icon name={p.icon} size={16} color={privacy === p.id ? C.forest : C.inkSoft}/>
                </div>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 14, fontWeight: 600, color: C.ink}}>{p.l}</div>
                  <div style={{fontSize: 12, color: C.inkMute}}>{p.d}</div>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: `2px solid ${privacy === p.id ? C.forest : C.line}`,
                  background: privacy === p.id ? C.forest : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {privacy === p.id && <window.Icon name="check" size={12} color="#FFF" stroke={3}/>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <button style={{
          width: '100%', padding: 14, borderRadius: 14,
          background:'transparent', border:`1.5px solid ${C.line}`,
          color: C.danger, fontSize: 14, fontWeight: 600,
          display:'flex', alignItems:'center', justifyContent:'center', gap: 8,
          fontFamily: window.BR.font.sans, cursor:'pointer',
        }}>
          <window.Icon name="trash" size={16} color={C.danger}/> Excluir rota
        </button>
      </div>
    </div>
  );
};
