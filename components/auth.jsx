// Auth screens: Login, Signup, Forgot password
window.AuthScreen = function AuthScreen({ onAuth, variant = 'classic' }) {
  const C = window.BR.colors;
  const [mode, setMode] = React.useState('login'); // login | signup | forgot
  const [email, setEmail] = React.useState('maria.silva@email.com');
  const [password, setPassword] = React.useState('••••••••');
  const [name, setName] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);

  // Variant A: "classic" — top image + form bottom
  // Variant B: "hero" — full green hero with route line

  const Hero = variant === 'classic' ? (
    <div style={{
      height: 280, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(160deg, ${C.forest} 0%, #1F3328 100%)`,
    }}>
      {/* Decorative map lines */}
      <svg viewBox="0 0 400 280" style={{position:'absolute', inset:0, width:'100%', height:'100%', opacity: 0.2}}>
        <path d="M-20 220 Q 80 180 160 200 T 320 150 T 440 180" stroke="#FFF" strokeWidth="2" fill="none"/>
        <path d="M-20 240 Q 100 210 200 230 T 440 200" stroke="#FFF" strokeWidth="1" fill="none" strokeDasharray="3 5"/>
        <path d="M-20 180 Q 120 140 220 170 T 440 140" stroke={C.primary} strokeWidth="3" fill="none" opacity="0.7"/>
        <circle cx="80" cy="170" r="4" fill={C.primary}/>
        <circle cx="260" cy="155" r="4" fill={C.primary}/>
        <circle cx="380" cy="148" r="4" fill="#FFF"/>
      </svg>
      {/* Contour lines */}
      <svg viewBox="0 0 400 280" style={{position:'absolute', inset:0, width:'100%', height:'100%', opacity: 0.08}}>
        {[40,80,120,160,200,240].map(y => (
          <path key={y} d={`M-20 ${y} Q 80 ${y-10} 200 ${y} T 420 ${y-5}`} stroke="#FFF" strokeWidth="1" fill="none"/>
        ))}
      </svg>
      {/* Logo + tagline */}
      <div style={{position:'absolute', inset:0, padding: '48px 32px 0', display:'flex', flexDirection:'column', justifyContent:'flex-end', paddingBottom: 36}}>
        <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 14}}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, background: C.primary,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <window.Icon name="bike" size={22} color="#FFF"/>
          </div>
          <div style={{fontSize: 22, fontWeight: 800, color:'#FFF', letterSpacing: -0.5, fontFamily: window.BR.font.sans}}>
            BikeRoute
          </div>
        </div>
        <div style={{fontSize: 28, fontWeight: 700, color:'#FFF', lineHeight: 1.1, letterSpacing: -0.8, maxWidth: 280}}>
          Pedale. Grave.<br/>
          <span style={{color: C.primary}}>Conquiste.</span>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'auto', background: C.bg}}>
      {Hero}
      <div style={{padding: '28px 24px 32px', flex:1, display:'flex', flexDirection:'column'}}>
        {/* Segmented tabs */}
        {mode !== 'forgot' && (
          <div style={{display:'flex', gap: 24, marginBottom: 24, borderBottom: `1px solid ${C.line}`}}>
            {[{id:'login', l:'Entrar'},{id:'signup', l:'Criar conta'}].map(t => (
              <button key={t.id} onClick={() => setMode(t.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '10px 0', fontSize: 15, fontWeight: 700,
                color: mode === t.id ? C.ink : C.inkMute,
                borderBottom: `2px solid ${mode === t.id ? C.primary : 'transparent'}`,
                marginBottom: -1, fontFamily: window.BR.font.sans,
              }}>{t.l}</button>
            ))}
          </div>
        )}

        {mode === 'forgot' && (
          <div style={{marginBottom: 24}}>
            <button onClick={()=>setMode('login')} style={{
              background:'none', border:'none', cursor:'pointer', color: C.inkSoft,
              display:'flex', alignItems:'center', gap: 4, padding: 0, fontSize: 14,
              fontFamily: window.BR.font.sans, marginBottom: 16,
            }}>
              <window.Icon name="chevronLeft" size={18}/> Voltar
            </button>
            <div style={{fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: C.ink}}>Recuperar senha</div>
            <div style={{fontSize: 14, color: C.inkSoft, marginTop: 6, lineHeight: 1.4}}>
              Informe seu email e enviaremos um link para redefinir sua senha.
            </div>
          </div>
        )}

        <div style={{display:'flex', flexDirection:'column', gap: 14}}>
          {mode === 'signup' && (
            <window.TextField label="Nome completo" value={name} onChange={e=>setName(e.target.value)}
              placeholder="Seu nome" icon={<window.Icon name="user" size={18}/>}/>
          )}
          <window.TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="voce@email.com" type="email" icon={<window.Icon name="mail" size={18}/>}/>
          {mode !== 'forgot' && (
            <window.TextField label="Senha" value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="••••••••" type={showPass ? 'text' : 'password'}
              icon={<window.Icon name="lock" size={18}/>}
              right={
                <button onClick={()=>setShowPass(s=>!s)} style={{background:'none', border:'none', cursor:'pointer', color: C.inkMute, padding: 4}}>
                  <window.Icon name="eye" size={18}/>
                </button>
              }/>
          )}
          {mode === 'signup' && (
            <window.TextField label="Confirmar senha" value={password} onChange={()=>{}}
              placeholder="••••••••" type="password" icon={<window.Icon name="lock" size={18}/>}/>
          )}
        </div>

        {mode === 'login' && (
          <button onClick={()=>setMode('forgot')} style={{
            background:'none', border:'none', cursor:'pointer',
            alignSelf:'flex-end', marginTop: 12, color: C.primaryDark,
            fontSize: 13, fontWeight: 600, fontFamily: window.BR.font.sans,
          }}>Esqueci minha senha</button>
        )}

        <div style={{marginTop: 24}}>
          <window.Button variant="primary" size="lg" full onClick={onAuth}
            iconRight={<window.Icon name="arrowRight" size={18} color="#FFF"/>}>
            {mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar link'}
          </window.Button>
        </div>

        {mode !== 'forgot' && (
          <>
            <div style={{
              display:'flex', alignItems:'center', gap: 12, margin: '20px 0',
              color: C.inkMute, fontSize: 12, fontWeight: 600,
            }}>
              <div style={{flex:1, height: 1, background: C.line}}/>
              <span>ou continue com</span>
              <div style={{flex:1, height: 1, background: C.line}}/>
            </div>
            <div style={{display:'flex', gap: 10}}>
              <window.Button variant="outline" size="md" full onClick={onAuth}>
                <span style={{fontWeight: 700}}>G</span>&nbsp;Google
              </window.Button>
              <window.Button variant="outline" size="md" full onClick={onAuth}>
                <span style={{fontWeight: 700}}>f</span>&nbsp;Facebook
              </window.Button>
            </div>
          </>
        )}

        <div style={{flex:1}}/>
        <div style={{textAlign: 'center', fontSize: 12, color: C.inkMute, marginTop: 20, lineHeight: 1.5}}>
          Ao continuar você aceita os <span style={{color: C.ink, fontWeight: 600}}>Termos de Uso</span> e<br/>
          <span style={{color: C.ink, fontWeight: 600}}>Política de Privacidade</span>
        </div>
      </div>
    </div>
  );
};

// Variant B — hero dominant
window.AuthScreenHero = function AuthScreenHero({ onAuth }) {
  const C = window.BR.colors;
  const [mode, setMode] = React.useState('login');
  const [email, setEmail] = React.useState('maria.silva@email.com');
  const [password, setPassword] = React.useState('••••••••');

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', background: C.forest, overflow:'auto', position:'relative'}}>
      {/* Hero illustration */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
      }}>
        <svg viewBox="0 0 390 500" preserveAspectRatio="xMidYMid slice"
          style={{position:'absolute', top:0, left:0, width:'100%', height:500}}>
          <defs>
            <linearGradient id="mt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3A5D4D"/>
              <stop offset="1" stopColor="#1F3328"/>
            </linearGradient>
          </defs>
          {/* mountain silhouettes */}
          <path d="M0 340 L60 240 L130 300 L200 200 L280 290 L360 230 L390 270 L390 500 L0 500Z" fill="url(#mt)" opacity="0.6"/>
          <path d="M0 400 L80 320 L180 380 L260 300 L340 370 L390 340 L390 500 L0 500Z" fill="#162A20" opacity="0.8"/>
          {/* Route */}
          <path d="M40 440 Q 120 400 180 420 T 300 380 T 380 360" stroke={C.primary} strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M40 440 Q 120 400 180 420 T 300 380 T 380 360" stroke={C.primary} strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.2"/>
          {/* Sun */}
          <circle cx="310" cy="130" r="36" fill={C.primary} opacity="0.3"/>
          <circle cx="310" cy="130" r="24" fill={C.primary}/>
        </svg>
      </div>

      {/* Content */}
      <div style={{position:'relative', padding: '60px 28px 28px', color:'#FFF', flex:1, display:'flex', flexDirection:'column'}}>
        <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 8}}>
          <div style={{
            width: 36, height: 36, borderRadius: 11, background: C.primary,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <window.Icon name="bike" size={20} color="#FFF"/>
          </div>
          <div style={{fontSize: 20, fontWeight: 800, letterSpacing: -0.4}}>BikeRoute</div>
        </div>

        <div style={{height: 180}}/>

        <div style={{fontSize: 32, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1, marginBottom: 8}}>
          Sua trilha<br/>começa aqui.
        </div>
        <div style={{fontSize: 14, color:'rgba(255,255,255,0.7)', marginBottom: 28, maxWidth: 280, lineHeight: 1.5}}>
          Grave rotas, acompanhe elevação e compartilhe conquistas.
        </div>

        {/* Glass card form */}
        <div style={{
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 22, padding: 20,
        }}>
          <div style={{display:'flex', gap: 8, marginBottom: 16, background:'rgba(0,0,0,0.2)', padding: 3, borderRadius: 10}}>
            {[{id:'login', l:'Entrar'},{id:'signup', l:'Cadastrar'}].map(t=>(
              <button key={t.id} onClick={()=>setMode(t.id)} style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
                background: mode === t.id ? C.primary : 'transparent',
                color: '#FFF', fontSize: 13, fontWeight: 700, cursor:'pointer',
                fontFamily: window.BR.font.sans,
              }}>{t.l}</button>
            ))}
          </div>
          <div style={{display:'flex', flexDirection:'column', gap: 10}}>
            <div style={{
              display:'flex', alignItems:'center', gap: 10, height: 48, padding: '0 14px',
              borderRadius: 12, background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <window.Icon name="mail" size={18} color="rgba(255,255,255,0.6)"/>
              <input value={email} onChange={e=>setEmail(e.target.value)} style={{
                flex:1, background:'transparent', border:'none', outline:'none',
                color:'#FFF', fontSize: 14, fontFamily: window.BR.font.sans,
              }}/>
            </div>
            <div style={{
              display:'flex', alignItems:'center', gap: 10, height: 48, padding: '0 14px',
              borderRadius: 12, background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <window.Icon name="lock" size={18} color="rgba(255,255,255,0.6)"/>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{
                flex:1, background:'transparent', border:'none', outline:'none',
                color:'#FFF', fontSize: 14, fontFamily: window.BR.font.sans,
              }}/>
            </div>
          </div>
          <button onClick={onAuth} style={{
            width: '100%', marginTop: 16, height: 52, borderRadius: 14,
            background: C.primary, color:'#FFF', border:'none', cursor:'pointer',
            fontSize: 15, fontWeight: 700, fontFamily: window.BR.font.sans,
            display:'flex', alignItems:'center', justifyContent:'center', gap: 8,
          }}>
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
            <window.Icon name="arrowRight" size={18} color="#FFF"/>
          </button>
          <div style={{textAlign:'center', marginTop: 12}}>
            <button style={{
              background:'none', border:'none', color:'rgba(255,255,255,0.7)', fontSize: 12,
              cursor:'pointer', fontFamily: window.BR.font.sans,
            }}>Esqueci minha senha</button>
          </div>
        </div>
      </div>
    </div>
  );
};
