import React, { useState } from 'react';
import { C, font, shadow } from '../tokens';
import { Button, TextField } from '../components/ui';
import Icon from '../components/Icon';
import { useAuth } from '../store/auth';

export default function AuthScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<'login'|'signup'|'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [info, setInfo] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null); setInfo(null);
    if (!email.trim()) { setError('Informe seu email.'); return; }

    setLoading(true);
    try {
      if (mode === 'forgot') {
        const err = await sendPasswordReset(email);
        if (err) setError(err);
        else setInfo('Link enviado para seu email. Verifique a caixa de entrada.');
      } else if (mode === 'login') {
        const err = await signInWithEmail(email, password);
        if (err) setError('Email ou senha incorretos.');
      } else {
        if (!name.trim()) { setError('Informe seu nome.'); setLoading(false); return; }
        if (password.length < 8) { setError('Senha precisa ter pelo menos 8 caracteres.'); setLoading(false); return; }
        if (password !== confirm) { setError('As senhas não coincidem.'); setLoading(false); return; }
        const err = await signUpWithEmail(email, password, name);
        if (err) setError(err);
        else setInfo('Conta criada! Verifique seu email para confirmar.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    const err = await signInWithGoogle();
    if (err) setError(err);
    setLoading(false);
  }

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'auto', background:C.bg }}>
      {/* Hero */}
      <div style={{ height:280, position:'relative', overflow:'hidden', background:`linear-gradient(160deg,${C.forest} 0%,#1F3328 100%)` }}>
        <svg viewBox="0 0 400 280" style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.2 }}>
          <path d="M-20 220 Q 80 180 160 200 T 320 150 T 440 180" stroke="#FFF" strokeWidth="2" fill="none"/>
          <path d="M-20 180 Q 120 140 220 170 T 440 140" stroke={C.primary} strokeWidth="3" fill="none" opacity=".7"/>
          <circle cx="80" cy="170" r="4" fill={C.primary}/><circle cx="260" cy="155" r="4" fill={C.primary}/>
        </svg>
        <div style={{ position:'absolute', inset:0, padding:'0 32px', display:'flex', flexDirection:'column', justifyContent:'flex-end', paddingBottom:36 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <div style={{ width:38, height:38, borderRadius:12, background:C.primary, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon name="bike" size={22} color="#FFF"/>
            </div>
            <div style={{ fontSize:22, fontWeight:800, color:'#FFF', letterSpacing:-0.5, fontFamily:font.sans }}>BikeRoute</div>
          </div>
          <div style={{ fontSize:28, fontWeight:700, color:'#FFF', lineHeight:1.1, letterSpacing:-0.8 }}>
            Pedale. Grave.<br/><span style={{ color:C.primary }}>Conquiste.</span>
          </div>
        </div>
      </div>

      <div style={{ padding:'28px 24px 40px', flex:1, display:'flex', flexDirection:'column' }}>
        {/* Mode tabs */}
        {mode !== 'forgot' && (
          <div style={{ display:'flex', gap:24, marginBottom:24, borderBottom:`1px solid ${C.line}` }}>
            {[{id:'login',l:'Entrar'},{id:'signup',l:'Criar conta'}].map(t => (
              <button key={t.id} onClick={() => { setMode(t.id as any); setError(null); setInfo(null); }} style={{
                background:'none', border:'none', cursor:'pointer', padding:'10px 0', fontSize:15, fontWeight:700,
                color:mode===t.id?C.ink:C.inkMute, fontFamily:font.sans,
                borderBottom:`2px solid ${mode===t.id?C.primary:'transparent'}`, marginBottom:-1,
              }}>{t.l}</button>
            ))}
          </div>
        )}

        {mode === 'forgot' && (
          <div style={{ marginBottom:24 }}>
            <button onClick={() => setMode('login')} style={{ background:'none', border:'none', cursor:'pointer', color:C.inkSoft, display:'flex', alignItems:'center', gap:4, padding:0, fontSize:14, fontFamily:font.sans, marginBottom:16 }}>
              <Icon name="chevronLeft" size={18}/> Voltar
            </button>
            <div style={{ fontSize:24, fontWeight:700, letterSpacing:-0.5, color:C.ink }}>Recuperar senha</div>
            <div style={{ fontSize:14, color:C.inkSoft, marginTop:6, lineHeight:1.5 }}>Informe seu email e enviaremos um link para redefinir sua senha.</div>
          </div>
        )}

        {/* Fields */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {mode === 'signup' && (
            <TextField label="Nome completo" value={name} onChange={setName} placeholder="Seu nome"
              icon={<Icon name="user" size={18}/>} autoCapitalize="words"/>
          )}
          <TextField label="Email" value={email} onChange={setEmail} placeholder="voce@email.com"
            type="email" icon={<Icon name="mail" size={18}/>} autoCapitalize="none"/>
          {mode !== 'forgot' && (
            <TextField label="Senha" value={password} onChange={setPassword} placeholder="••••••••"
              type={showPass?'text':'password'} icon={<Icon name="lock" size={18}/>}
              right={
                <button onClick={() => setShowPass(s=>!s)} style={{ background:'none', border:'none', cursor:'pointer', color:C.inkMute, padding:4, display:'flex' }}>
                  <Icon name="eye" size={18}/>
                </button>
              }/>
          )}
          {mode === 'signup' && (
            <TextField label="Confirmar senha" value={confirm} onChange={setConfirm}
              placeholder="••••••••" type="password" icon={<Icon name="lock" size={18}/>}/>
          )}
        </div>

        {mode === 'login' && (
          <button onClick={() => { setMode('forgot'); setError(null); setInfo(null); }} style={{ background:'none', border:'none', cursor:'pointer', alignSelf:'flex-end', marginTop:12, color:C.primaryDark, fontSize:13, fontWeight:600, fontFamily:font.sans }}>
            Esqueci minha senha
          </button>
        )}

        {/* Feedback */}
        {error && (
          <div style={{ marginTop:16, padding:'10px 14px', borderRadius:12, background:'#FDECEA', color:C.danger, fontSize:13, fontWeight:600 }}>
            {error}
          </div>
        )}
        {info && (
          <div style={{ marginTop:16, padding:'10px 14px', borderRadius:12, background:C.forestSoft, color:C.forest, fontSize:13, fontWeight:600 }}>
            {info}
          </div>
        )}

        <div style={{ marginTop:24 }}>
          <Button variant="primary" size="lg" full onClick={handleSubmit} disabled={loading}
            iconRight={<Icon name="arrowRight" size={18} color="#FFF"/>}>
            {loading ? 'Aguarde…' : mode==='login'?'Entrar':mode==='signup'?'Criar conta':'Enviar link'}
          </Button>
        </div>

        {mode !== 'forgot' && (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0', color:C.inkMute, fontSize:12, fontWeight:600 }}>
              <div style={{ flex:1, height:1, background:C.line }}/><span>ou continue com</span><div style={{ flex:1, height:1, background:C.line }}/>
            </div>
            <Button variant="outline" size="md" full onClick={handleGoogle} disabled={loading}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight:6 }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              }>
              Continuar com Google
            </Button>
          </>
        )}

        <div style={{ flex:1 }}/>
        <div style={{ textAlign:'center', fontSize:12, color:C.inkMute, marginTop:24, lineHeight:1.5 }}>
          Ao continuar você aceita os <span style={{ color:C.ink, fontWeight:600 }}>Termos de Uso</span> e <span style={{ color:C.ink, fontWeight:600 }}>Política de Privacidade</span>
        </div>
      </div>
    </div>
  );
}
