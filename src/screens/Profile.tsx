import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { C, font } from '../tokens';
import { Button, TextField } from '../components/ui';
import Icon from '../components/Icon';
import { useAuth } from '../store/auth';
import { useRoutes } from '../store/routes';
import { exportRoutesJSON, getBikes, saveBike, deleteBike, type LocalBike } from '../lib/db';

// ─── Tipos de bike ────────────────────────────────────────────────────────────

const BIKE_TYPES = [
  { id: 'estrada',  label: 'Estrada',      icon: 'route' },
  { id: 'mountain', label: 'Mountain Bike', icon: 'mountain' },
  { id: 'ebike',    label: 'E-Bike',        icon: 'speed' },
] as const;

// ─── Modal de bike ────────────────────────────────────────────────────────────

function BikeFormModal({ userId, bike, onSave, onClose }: {
  userId: string;
  bike?: LocalBike;
  onSave: () => void;
  onClose: () => void;
}) {
  const [name, setName]   = useState(bike?.name ?? '');
  const [type, setType]   = useState<LocalBike['type']>(bike?.type ?? 'mountain');
  const [brand, setBrand] = useState(bike?.brand ?? '');
  const [model, setModel] = useState(bike?.model ?? '');
  const [year, setYear]   = useState(String(bike?.year ?? new Date().getFullYear()));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const now = Date.now();
    await saveBike({
      id: bike?.id ?? crypto.randomUUID(),
      userId,
      name: name.trim(),
      type,
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      year: year ? Number(year) : undefined,
      createdAt: bike?.createdAt ?? now,
      updatedAt: now,
    });
    onSave();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: C.bg, borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 20 }}>
          {bike ? 'Editar bike' : 'Nova bike'}
        </div>

        {/* Tipo */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft, marginBottom: 8 }}>Tipo</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {BIKE_TYPES.map(t => (
              <button key={t.id} onClick={() => setType(t.id as LocalBike['type'])} style={{
                flex: 1, padding: '10px 6px', borderRadius: 14,
                background: type === t.id ? C.forestSoft : '#FFF',
                border: `1.5px solid ${type === t.id ? C.forest : C.line}`,
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                color: type === t.id ? C.forest : C.inkSoft,
              }}>
                <Icon name={t.icon} size={18} color={type === t.id ? C.forest : C.inkSoft}/>
                <div style={{ fontSize: 11, fontWeight: 600 }}>{t.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <TextField label="Nome da bike *" value={name} onChange={setName} placeholder="Ex: Trek Marlin 7"/>
          <TextField label="Marca" value={brand} onChange={setBrand} placeholder="Ex: Trek, Specialized, Scott"/>
          <TextField label="Modelo" value={model} onChange={setModel} placeholder="Ex: Marlin 7"/>
          <TextField label="Ano" value={year} onChange={setYear} type="number" placeholder="Ex: 2023"/>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="primary" size="lg" full onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
          <Button variant="outline" size="lg" onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de lista de bikes ──────────────────────────────────────────────────

function BikesModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [bikes, setBikes] = useState<LocalBike[]>([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<LocalBike | null>(null);

  async function load() {
    setBikes(await getBikes(userId));
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    await deleteBike(id);
    load();
  }

  const typeLabel = (t: LocalBike['type']) =>
    BIKE_TYPES.find(x => x.id === t)?.label ?? t;
  const typeIcon = (t: LocalBike['type']) =>
    BIKE_TYPES.find(x => x.id === t)?.icon ?? 'bike';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 150, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: C.bg, borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ flex: 1, fontSize: 18, fontWeight: 700, color: C.ink }}>Minhas bikes</div>
          <button onClick={() => setAdding(true)} style={{ background: C.primary, border: 'none', borderRadius: 12, padding: '8px 14px', color: '#FFF', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: font.sans, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="plus" size={14} color="#FFF"/> Nova bike
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {bikes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: C.inkMute }}>
              <Icon name="bike" size={40} color={C.line}/>
              <div style={{ marginTop: 12, fontSize: 14 }}>Nenhuma bike cadastrada</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Adicione sua bike para organizar melhor seus treinos</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bikes.map(b => (
                <div key={b.id} style={{ background: '#FFF', border: `1px solid ${C.line}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: C.forestSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={typeIcon(b.type)} size={22} color={C.forest}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: C.inkMute, marginTop: 2 }}>
                      {typeLabel(b.type)}{b.brand ? ` · ${b.brand}` : ''}{b.year ? ` · ${b.year}` : ''}
                    </div>
                  </div>
                  <button onClick={() => setEditing(b)} style={{ width: 32, height: 32, borderRadius: 8, background: C.bgAlt, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="edit" size={14} color={C.inkSoft}/>
                  </button>
                  <button onClick={() => handleDelete(b.id)} style={{ width: 32, height: 32, borderRadius: 8, background: '#FDECEA', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="trash" size={14} color={C.danger}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button variant="outline" size="md" full onClick={onClose} style={{ marginTop: 16 }}>Fechar</Button>
      </div>

      {(adding || editing) && (
        <BikeFormModal
          userId={userId}
          bike={editing ?? undefined}
          onSave={() => { setAdding(false); setEditing(null); load(); }}
          onClose={() => { setAdding(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

// ─── Tela de perfil ───────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { routes } = useRoutes();
  const [editing, setEditing] = useState(false);
  const [showBikes, setShowBikes] = useState(false);
  const [name, setName] = useState(profile?.name ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [goal, setGoal] = useState(String(profile?.weekly_goal_km ?? 80));
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  const active = routes.filter(r => !r.deletedAt);
  const totalKm   = active.reduce((s, r) => s + r.distanceKm, 0);
  const totalElev = active.reduce((s, r) => s + r.elevationGain, 0);
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
    setExportMsg('Exportando…');
    try {
      const json = await exportRoutesJSON(user.id);
      const filename = `bikeroute_backup_${new Date().toISOString().slice(0, 10)}.json`;

      if (Capacitor.isNativePlatform()) {
        // Escreve no cache e abre o share sheet nativo
        await Filesystem.writeFile({
          path: filename,
          data: json,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
        await Share.share({
          title: 'Exportar rotas BikeRoute',
          url: uri,
          dialogTitle: 'Salvar backup JSON',
        });
      } else {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
      }
      setExportMsg('');
    } catch (e) {
      console.error(e);
      setExportMsg('Erro ao exportar');
      setTimeout(() => setExportMsg(''), 3000);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', background: C.bg }}>
      {/* Hero */}
      <div style={{ padding: '18px 22px 24px', background: C.forest, color: '#FFF', position: 'relative', overflow: 'hidden' }}>
        <svg viewBox="0 0 390 200" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .12 }}>
          <path d="M-10 140 Q 80 110 160 130 T 420 100" stroke="#FFF" strokeWidth="2" fill="none"/>
        </svg>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg,${C.moss},${C.primary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#FFF', border: '3px solid rgba(255,255,255,.2)' }}>
            {initial}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4 }}>{profile?.name ?? firstName}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>{user?.email}</div>
            {profile?.city && <div style={{ fontSize: 12, color: C.leaf, marginTop: 4, fontWeight: 600 }}>{profile.city}</div>}
          </div>
          <button onClick={() => setEditing(true)} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="edit" size={16} color="#FFF"/>
          </button>
        </div>
        <div style={{ position: 'relative', marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontFamily: font.mono, fontWeight: 600 }}>{active.length}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2 }}>Rotas</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontFamily: font.mono, fontWeight: 600 }}>{totalKm.toFixed(0)}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2 }}>km total</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontFamily: font.mono, fontWeight: 600 }}>{(totalElev / 1000).toFixed(1)}k</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2 }}>m elevação</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { icon: 'target',   label: 'Meta semanal',        sub: `${profile?.weekly_goal_km ?? 80} km`, onClick: () => setEditing(true) },
          { icon: 'download', label: 'Exportar rotas (JSON)', sub: exportMsg || 'Backup completo', onClick: handleExportJSON },
          { icon: 'bike',     label: 'Minhas bikes',         sub: 'Gerenciar bikes', onClick: () => setShowBikes(true) },
          { icon: 'settings', label: 'Configurações',         sub: '' },
        ].map(item => (
          <button key={item.label} onClick={item.onClick} style={{ background: '#FFF', border: `1px solid ${C.line}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.forestSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={item.icon} size={18} color={C.forest}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{item.label}</div>
              {item.sub && <div style={{ fontSize: 12, color: exportMsg && item.icon === 'download' ? C.warn : C.inkMute }}>{item.sub}</div>}
            </div>
            <Icon name="chevronRight" size={16} color={C.inkMute}/>
          </button>
        ))}

        <button onClick={handleSignOut} disabled={signingOut} style={{ background: 'transparent', border: `1.5px solid ${C.line}`, borderRadius: 14, padding: 14, marginTop: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: C.danger, fontFamily: font.sans, opacity: signingOut ? 0.5 : 1 }}>
          {signingOut ? 'Saindo…' : 'Sair da conta'}
        </button>
      </div>

      {/* Edit profile modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: C.bg, borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 20 }}>Editar perfil</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <TextField label="Nome" value={name} onChange={setName} autoCapitalize="words"/>
              <TextField label="Cidade" value={city} onChange={setCity} autoCapitalize="words"/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft, marginBottom: 8 }}>Meta semanal: <b style={{ color: C.ink }}>{goal} km</b></div>
                <input type="range" min="20" max="300" step="5" value={goal} onChange={e => setGoal(e.target.value)} style={{ width: '100%', accentColor: C.primary }}/>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="primary" size="lg" full onClick={handleSaveProfile} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Button>
              <Button variant="outline" size="lg" onClick={() => setEditing(false)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Bikes modal */}
      {showBikes && user && (
        <BikesModal userId={user.id} onClose={() => setShowBikes(false)}/>
      )}
    </div>
  );
}
