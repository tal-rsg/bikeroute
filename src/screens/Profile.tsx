import React, { useState } from 'react';
import { C, font, fmt } from '../tokens';
import { Button, TextField } from '../components/ui';
import Icon from '../components/Icon';
import { useAuth } from '../store/auth';
import { useRoutes } from '../store/routes';
import { exportRoutesJSON } from '../lib/db';

export default function ProfileScreen() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { routes } = useRoutes();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [goal, setGoal] = useState(String(profile?.weekly_goal_km ?? 80));
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const active = routes.filter(r => !r.deletedAt);
  const totalKm  = active.reduce((s,r) => s + r.distanceKm, 0);
  const totalElev = active.reduce((s,r) => s + r.elevationGain, 0);
  const firstName = (profile?.name ?? user?.email ?? 'Ciclista').split(' ')[0];
  const initial = firstName[0].toUpperCase();

  async function handleSaveProfile() {
    setSaving(true);
    await updateProfile({ name, city, weekly_goal_km: Number(goal) });
    setSaving(false);
    setEditing(false);
  }

  async function handleExportJSON() {
    if (!user) return;
    const json = await exportRoutesJSON(user.id);
    const blob = new Blob([json], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bikeroute_backup.json'; a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
  }

  return (
    <div style={{ flex:1, overflow:'auto', background:C.bg }}>
      {/* Hero */}
      <div style={{ padding:'18px 22px 24px', background:C.forest, color:'#FFF', position:'relative', overflow:'hidden' }}>
        <svg viewBox="0 0 390 200" style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.12 }}>
          <path d="M-10 140 Q 80 110 160 130 T 420 100" stroke="#FFF" strokeWidth="2" fill="none"/>
        </svg>
        <div style={{ position:'relative', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:`linear-gradient(135deg,${C.moss},${C.primary})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:700, color:'#FFF', border:'3px solid rgba(255,255,255,.2)' }}>
            {initial}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:20, fontWeight:800, letterSpacing:-0.4 }}>{profile?.name ?? firstName}</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.7)', marginTop:2 }}>{user?.email}</div>
            {profile?.city && <div style={{ fontSize:12, color:C.leaf, marginTop:4, fontWeight:600 }}>{profile.city}</div>}
          </div>
          <button onClick={() => setEditing(true)} style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="edit" size={16} color="#FFF"/>
          </button>
        </div>
        <div style={{ position:'relative', marginTop:18, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:18, fontFamily:font.mono, fontWeight:600 }}>{active.length}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.6)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.6, marginTop:2 }}>Rotas</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:18, fontFamily:font.mono, fontWeight:600 }}>{totalKm.toFixed(0)}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.6)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.6, marginTop:2 }}>km total</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:18, fontFamily:font.mono, fontWeight:600 }}>{(totalElev/1000).toFixed(1)}k</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.6)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.6, marginTop:2 }}>m elevação</div>
          </div>
        </div>
      </div>

      <div style={{ padding:18, display:'flex', flexDirection:'column', gap:8 }}>
        {/* Menu items */}
        {[
          { icon:'target', l:'Meta semanal', s:`${profile?.weekly_goal_km ?? 80} km`, onClick:()=>setEditing(true) },
          { icon:'download', l:'Exportar rotas (JSON)', s:'Backup completo', onClick:handleExportJSON },
          { icon:'bike', l:'Minhas bikes', s:'Em breve' },
          { icon:'settings', l:'Configurações', s:'' },
        ].map(item => (
          <button key={item.l} onClick={item.onClick} style={{ background:'#FFF', border:`1px solid ${C.line}`, borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', textAlign:'left' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:C.forestSoft, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon name={item.icon} size={18} color={C.forest}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.ink }}>{item.l}</div>
              {item.s && <div style={{ fontSize:12, color:C.inkMute }}>{item.s}</div>}
            </div>
            <Icon name="chevronRight" size={16} color={C.inkMute}/>
          </button>
        ))}

        <button onClick={handleSignOut} disabled={signingOut} style={{ background:'transparent', border:`1.5px solid ${C.line}`, borderRadius:14, padding:14, marginTop:12, cursor:'pointer', fontSize:14, fontWeight:600, color:C.danger, fontFamily:font.sans, opacity:signingOut?0.5:1 }}>
          {signingOut ? 'Saindo…' : 'Sair da conta'}
        </button>
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:100, display:'flex', alignItems:'flex-end' }}>
          <div style={{ background:C.bg, borderRadius:'24px 24px 0 0', padding:'24px 20px 40px', width:'100%' }}>
            <div style={{ fontSize:18, fontWeight:700, color:C.ink, marginBottom:20 }}>Editar perfil</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:20 }}>
              <TextField label="Nome" value={name} onChange={setName} autoCapitalize="words"/>
              <TextField label="Cidade" value={city} onChange={setCity} autoCapitalize="words"/>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:C.inkSoft, marginBottom:8 }}>Meta semanal: <b style={{ color:C.ink }}>{goal} km</b></div>
                <input type="range" min="20" max="300" step="5" value={goal} onChange={e => setGoal(e.target.value)} style={{ width:'100%', accentColor:C.primary }}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <Button variant="primary" size="lg" full onClick={handleSaveProfile} disabled={saving}>{saving?'Salvando…':'Salvar'}</Button>
              <Button variant="outline" size="lg" onClick={() => setEditing(false)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
