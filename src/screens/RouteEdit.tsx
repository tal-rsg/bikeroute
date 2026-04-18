import React, { useState } from 'react';
import { C, font } from '../tokens';
import { Button, TextField, MapPlaceholder } from '../components/ui';
import Icon from '../components/Icon';
import { useRoutes } from '../store/routes';
import type { LocalRoute } from '../lib/db';

interface Props { route: LocalRoute; onBack: () => void; onSaved: () => void; }

export default function RouteEditScreen({ route, onBack, onSaved }: Props) {
  const { update, remove } = useRoutes();
  const [name, setName] = useState(route.name);
  const [description, setDescription] = useState(route.description);
  const [type, setType] = useState(route.type);
  const [difficulty, setDifficulty] = useState(route.difficulty);
  const [privacy, setPrivacy] = useState(route.privacy);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSave() {
    setSaving(true);
    await update(route.id, { name, description, type, difficulty, privacy });
    setSaving(false);
    onSaved();
  }

  async function handleDelete() {
    await remove(route.id);
    onBack();
  }

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg, overflow:'hidden' }}>
      {/* App bar */}
      <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:8, background:C.bg, borderBottom:`1px solid ${C.lineSoft}`, flexShrink:0 }}>
        <button onClick={onBack} style={{ width:40, height:40, borderRadius:12, border:`1px solid ${C.line}`, background:'#FFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon name="x" size={18} color={C.ink}/>
        </button>
        <div style={{ flex:1, fontSize:16, fontWeight:700, color:C.ink }}>Editar rota</div>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving?'Salvando…':'Salvar'}
        </Button>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'16px 18px 32px' }}>
        {/* Cover / map preview */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.inkSoft, marginBottom:8 }}>Foto de capa</div>
          <div style={{ height:140, borderRadius:16, overflow:'hidden', border:`1px solid ${C.line}`, position:'relative' }}>
            <MapPlaceholder height={140} interactive={false}/>
            <button style={{ position:'absolute', bottom:10, right:10, padding:'8px 12px', borderRadius:10, background:'rgba(31,27,22,.85)', color:'#FFF', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600 }}>
              <Icon name="camera" size={14} color="#FFF"/> Alterar
            </button>
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom:14 }}>
          <TextField label="Nome da rota" value={name} onChange={setName}/>
        </div>

        {/* Description */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.inkSoft, marginBottom:8 }}>Descrição</div>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Adicione notas sobre esta rota…"
            style={{ width:'100%', minHeight:88, padding:'12px 14px', borderRadius:14, background:'#FFF', border:`1.5px solid ${C.line}`, outline:'none', fontSize:14, fontFamily:font.sans, color:C.ink, resize:'vertical' }}/>
        </div>

        {/* Type */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.inkSoft, marginBottom:8 }}>Tipo de atividade</div>
          <div style={{ display:'flex', gap:8 }}>
            {[{id:'urbano',l:'Urbano',icon:'map'},{id:'trilha',l:'Trilha',icon:'mountain'},{id:'estrada',l:'Estrada',icon:'route'}].map(t => (
              <button key={t.id} onClick={() => setType(t.id as any)} style={{ flex:1, padding:'12px 8px', borderRadius:14, background:type===t.id?C.forestSoft:'#FFF', border:`1.5px solid ${type===t.id?C.forest:C.line}`, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4, color:type===t.id?C.forest:C.inkSoft }}>
                <Icon name={t.icon} size={18} color={type===t.id?C.forest:C.inkSoft}/><div style={{ fontSize:12, fontWeight:600 }}>{t.l}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.inkSoft, marginBottom:8 }}>Nível de dificuldade</div>
          <div style={{ display:'flex', gap:6 }}>
            {[{id:'easy',l:'Fácil',c:C.success},{id:'medium',l:'Médio',c:C.warn},{id:'hard',l:'Difícil',c:C.danger}].map(d => (
              <button key={d.id} onClick={() => setDifficulty(d.id as any)} style={{ flex:1, padding:'10px 8px', borderRadius:12, background:difficulty===d.id?d.c:'#FFF', border:`1.5px solid ${difficulty===d.id?d.c:C.line}`, cursor:'pointer', color:difficulty===d.id?'#FFF':C.inkSoft, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:difficulty===d.id?'#FFF':d.c }}/>{d.l}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.inkSoft, marginBottom:8 }}>Privacidade</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[{id:'public',icon:'globe',l:'Pública',d:'Qualquer pessoa pode ver'},{id:'private',icon:'lock2',l:'Privada',d:'Apenas você'}].map(p => (
              <button key={p.id} onClick={() => setPrivacy(p.id as any)} style={{ background:'#FFF', border:`1.5px solid ${privacy===p.id?C.forest:C.line}`, borderRadius:14, padding:'12px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:12, textAlign:'left' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:privacy===p.id?C.forestSoft:C.bgAlt, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon name={p.icon} size={16} color={privacy===p.id?C.forest:C.inkSoft}/>
                </div>
                <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:600, color:C.ink }}>{p.l}</div><div style={{ fontSize:12, color:C.inkMute }}>{p.d}</div></div>
                <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${privacy===p.id?C.forest:C.line}`, background:privacy===p.id?C.forest:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {privacy===p.id && <Icon name="check" size={12} color="#FFF" stroke={3}/>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Delete */}
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} style={{ width:'100%', padding:14, borderRadius:14, background:'transparent', border:`1.5px solid ${C.line}`, color:C.danger, fontSize:14, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:font.sans, cursor:'pointer' }}>
            <Icon name="trash" size={16} color={C.danger}/> Excluir rota
          </button>
        ) : (
          <div style={{ background:'#FDECEA', border:`1.5px solid ${C.danger}`, borderRadius:14, padding:16 }}>
            <div style={{ fontSize:14, fontWeight:600, color:C.ink, marginBottom:12 }}>Tem certeza? Esta ação não pode ser desfeita.</div>
            <div style={{ display:'flex', gap:8 }}>
              <Button variant="danger" size="sm" full onClick={handleDelete}>Excluir definitivamente</Button>
              <Button variant="outline" size="sm" full onClick={() => setConfirmDelete(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
