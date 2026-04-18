import React, { useState, type CSSProperties, type ReactNode } from 'react';
import { C, R, shadow, font } from '../tokens';
import Icon from './Icon';

// ─── Button ───────────────────────────────────────────────────────────────────

type BtnVariant = 'primary'|'dark'|'forest'|'outline'|'ghost'|'soft'|'danger';
type BtnSize = 'sm'|'md'|'lg'|'xl';

const btnSizes: Record<BtnSize, { h:number; px:number; fs:number; r:number }> = {
  sm: { h:36, px:14, fs:13, r:10 },
  md: { h:48, px:20, fs:15, r:14 },
  lg: { h:56, px:24, fs:16, r:16 },
  xl: { h:64, px:28, fs:17, r:18 },
};
const btnColors: Record<BtnVariant, { bg:string; color:string; border:string }> = {
  primary: { bg:C.primary,     color:'#FFF', border:'none' },
  dark:    { bg:C.ink,         color:'#FFF', border:'none' },
  forest:  { bg:C.forest,      color:'#FFF', border:'none' },
  outline: { bg:'transparent', color:C.ink,  border:`1.5px solid ${C.line}` },
  ghost:   { bg:'transparent', color:C.ink,  border:'none' },
  soft:    { bg:C.primarySoft, color:C.primaryDark, border:'none' },
  danger:  { bg:C.danger,      color:'#FFF', border:'none' },
};

interface BtnProps {
  children?: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  full?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  type?: 'button'|'submit';
}

export function Button({ children, onClick, variant='primary', size='md', icon, iconRight, full, disabled, style={}, type='button' }: BtnProps) {
  const s = btnSizes[size];
  const v = btnColors[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      height:s.h, padding:`0 ${s.px}px`, fontSize:s.fs, gap:8,
      borderRadius:s.r, background:v.bg, color:v.color, border:v.border,
      fontFamily:font.sans, fontWeight:600,
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      cursor:disabled?'not-allowed':'pointer',
      opacity:disabled?0.5:1, width:full?'100%':'auto',
      letterSpacing:-0.1, transition:'transform 0.15s', ...style,
    }}
    onTouchStart={e => { if (!disabled) (e.currentTarget as HTMLElement).style.transform='scale(0.97)'; }}
    onTouchEnd={e => { (e.currentTarget as HTMLElement).style.transform=''; }}
    >
      {icon}{children}{iconRight}
    </button>
  );
}

// ─── TextField ────────────────────────────────────────────────────────────────

interface FieldProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
  right?: ReactNode;
  hint?: string;
  autoCapitalize?: string;
}

export function TextField({ label, value, onChange, placeholder, type='text', icon, right, hint, autoCapitalize }: FieldProps) {
  const [focus, setFocus] = useState(false);
  return (
    <label style={{ display:'block', fontFamily:font.sans }}>
      {label && <div style={{ fontSize:13, fontWeight:600, color:C.inkSoft, marginBottom:8 }}>{label}</div>}
      <div style={{
        display:'flex', alignItems:'center', gap:10, height:52, padding:'0 14px',
        borderRadius:14, background:'#FFF',
        border:`1.5px solid ${focus ? C.primary : C.line}`,
        transition:'border-color 0.15s',
      }}>
        {icon && <span style={{ color:focus?C.primary:C.inkMute, display:'flex' }}>{icon}</span>}
        <input
          type={type} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          autoCapitalize={autoCapitalize}
          style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:15, fontFamily:font.sans, color:C.ink }}
        />
        {right}
      </div>
      {hint && <div style={{ fontSize:12, color:C.inkMute, marginTop:6 }}>{hint}</div>}
    </label>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

export function Stat({ label, value, unit, icon, dark, accent }: { label:string; value:string|number; unit?:string; icon?:ReactNode; dark?:boolean; accent?:string }) {
  return (
    <div style={{
      background: dark ? 'rgba(255,255,255,.06)' : C.white,
      border: dark ? '1px solid rgba(255,255,255,.1)' : `1px solid ${C.line}`,
      borderRadius:16, padding:'14px 16px',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
        {icon && <span style={{ color:accent||(dark?'#B6AA99':C.inkMute), display:'flex' }}>{icon}</span>}
        <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:0.8, color:dark?'#B6AA99':C.inkMute }}>{label}</div>
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
        <div style={{ fontSize:24, fontFamily:font.mono, fontWeight:500, color:dark?'#FFF':C.ink, lineHeight:1 }}>{value}</div>
        {unit && <div style={{ fontSize:12, color:dark?'#B6AA99':C.inkMute, fontFamily:font.mono }}>{unit}</div>}
      </div>
    </div>
  );
}

// ─── BottomNav ────────────────────────────────────────────────────────────────

const navItems = [
  { id:'home',    icon:'home',     label:'Início' },
  { id:'routes',  icon:'route',    label:'Rotas' },
  { id:'record',  icon:'record',   label:'Gravar', center:true },
  { id:'stats',   icon:'trending', label:'Stats' },
  { id:'profile', icon:'user',     label:'Perfil' },
];

export function BottomNav({ active, onChange }: { active:string; onChange:(id:string)=>void }) {
  return (
    <div style={{
      height:80, flexShrink:0, background:'#FFF',
      borderTop:`1px solid ${C.line}`,
      display:'flex', alignItems:'flex-start', padding:'8px 4px 0',
      paddingBottom:'env(safe-area-inset-bottom,0)',
    }}>
      {navItems.map(it => {
        const isActive = active === it.id;
        if (it.center) return (
          <button key={it.id} onClick={() => onChange(it.id)} style={{
            flex:1, background:'none', border:'none', cursor:'pointer',
            display:'flex', flexDirection:'column', alignItems:'center', gap:2, paddingTop:0,
          }}>
            <div style={{
              width:56, height:56, borderRadius:'50%', background:C.primary,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 6px 18px rgba(232,85,58,.4)',
              transform:'translateY(-16px)',
            }}>
              <Icon name="record" size={22} color="#FFF"/>
            </div>
            <div style={{ fontSize:11, fontWeight:600, color:C.ink, transform:'translateY(-12px)', fontFamily:font.sans }}>{it.label}</div>
          </button>
        );
        return (
          <button key={it.id} onClick={() => onChange(it.id)} style={{
            flex:1, background:'none', border:'none', cursor:'pointer',
            display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'4px 0',
            color: isActive ? C.primary : C.inkMute,
          }}>
            <Icon name={it.icon} size={22} color={isActive?C.primary:C.inkMute} stroke={isActive?2.2:1.8}/>
            <div style={{ fontSize:11, fontWeight:isActive?700:500, fontFamily:font.sans }}>{it.label}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────────

export function Pill({ children, active, onClick, color }: { children:ReactNode; active?:boolean; onClick?:()=>void; color?:string }) {
  return (
    <button onClick={onClick} style={{
      display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:999,
      background: active ? (color||C.ink) : C.white,
      color: active ? '#FFF' : C.ink,
      border:`1.5px solid ${active?(color||C.ink):C.line}`,
      fontSize:13, fontWeight:600, fontFamily:font.sans, cursor:'pointer', whiteSpace:'nowrap',
    }}>{children}</button>
  );
}

// ─── Segmented ────────────────────────────────────────────────────────────────

export function Segmented({ options, value, onChange }: { options:{value:string;label:string}[]; value:string; onChange:(v:string)=>void }) {
  return (
    <div style={{ display:'inline-flex', padding:4, borderRadius:12, background:C.bgAlt, border:`1px solid ${C.line}` }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)} style={{
          padding:'8px 14px', borderRadius:9,
          background: value===opt.value ? '#FFF' : 'transparent',
          color: value===opt.value ? C.ink : C.inkSoft,
          border:'none', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:font.sans,
          boxShadow: value===opt.value ? '0 1px 2px rgba(0,0,0,.08)' : 'none',
        }}>{opt.label}</button>
      ))}
    </div>
  );
}

// ─── SyncBadge ────────────────────────────────────────────────────────────────

export function SyncBadge({ status, pending }: { status:string; pending:number }) {
  if (status === 'idle' && pending === 0) return null;
  const syncing = status === 'syncing';
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px',
      borderRadius:999, fontSize:11, fontWeight:700,
      background: syncing ? C.forestSoft : C.primarySoft,
      color: syncing ? C.forest : C.primaryDark,
    }}>
      <Icon name="sync" size={12} color={syncing?C.forest:C.primaryDark}/>
      {syncing ? `Sincronizando${pending>0?` (${pending})`:''}…` : 'Erro na sincronização'}
    </div>
  );
}

// ─── MapView (SVG placeholder) ────────────────────────────────────────────────

export function MapPlaceholder({ height = 360, progress = 1, showMarkers = true, interactive = true }:
  { height?: number|string; progress?: number; showMarkers?: boolean; interactive?: boolean }) {
  const fullPath = "M 60 420 Q 80 380 120 360 T 200 340 Q 240 330 260 300 T 280 240 Q 290 200 270 160 T 230 100 Q 210 80 180 80 T 130 110";
  const dist = 900;
  const offset = dist * (1 - progress);
  return (
    <div style={{ position:'relative', height, width:'100%', overflow:'hidden', background:'#DDE7DB' }}>
      <svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid slice"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
        <rect width="360" height="480" fill="#D6E3D1"/>
        <path d="M0 0 L180 0 L150 80 L80 120 L0 100Z" fill="#B8CFA8" opacity=".7"/>
        <path d="M220 60 L360 40 L360 180 L280 200 L240 140Z" fill="#B8CFA8" opacity=".7"/>
        <path d="M-10 200 Q 100 180 180 230 T 370 240" stroke="#B3C8D4" strokeWidth="22" fill="none" opacity=".8"/>
        <g stroke="#FAF7F0" strokeWidth="8" fill="none">
          <path d="M-10 140 Q 180 130 370 150"/><path d="M-10 340 L370 330"/>
          <path d="M80 -10 L90 490"/><path d="M260 -10 L250 490"/>
        </g>
        <g stroke="#FAF7F0" strokeWidth="3" fill="none" opacity=".8">
          <path d="M40 -10 L50 490"/><path d="M140 -10 L130 490"/><path d="M200 -10 L210 490"/>
          <path d="M-10 60 L370 50"/><path d="M-10 240 L370 230"/><path d="M-10 420 L370 410"/>
        </g>
        {Array.from({length:25}).map((_,i) => (
          <circle key={i} cx={20+(i*47)%340} cy={30+(i*83)%440} r="4" fill="#6B8E5A" opacity=".4"/>
        ))}
        <path d={fullPath} stroke={C.primary} strokeWidth="10" fill="none" opacity=".2" strokeLinecap="round"/>
        <path d={fullPath} stroke={C.primary} strokeWidth="5" fill="none" strokeLinecap="round"
          strokeDasharray={dist} strokeDashoffset={offset}/>
        {showMarkers && <>
          <circle cx="60" cy="420" r="9" fill="#FFF" stroke={C.forest} strokeWidth="3"/>
          <circle cx="60" cy="420" r="4" fill={C.forest}/>
          <g transform="translate(130,110)">
            <path d="M0 -18 a 10 10 0 1 1 0.01 0Z M0 -3 L0 5" stroke={C.primary} strokeWidth="3" fill={C.primary}/>
            <circle cx="0" cy="-8" r="3" fill="#FFF"/>
          </g>
        </>}
      </svg>
      <div style={{ position:'absolute', bottom:8, right:10, fontSize:10, color:'#5C554A', opacity:0.6, fontFamily:font.mono }}>© BikeRoute Maps</div>
      {interactive && (
        <div style={{ position:'absolute', top:12, right:12, width:36, height:36, borderRadius:'50%', background:'#FFF', boxShadow:shadow.sm, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:C.primary, fontFamily:font.mono }}>N</div>
      )}
    </div>
  );
}

// ─── ElevationChart ───────────────────────────────────────────────────────────

export function ElevationChart({ height = 80, color = C.forest, points }: { height?:number; color?:string; points?:number[] }) {
  const pts = points ?? [20,35,30,45,60,55,70,65,80,72,85,75,60,50,42,55,48,35,30,25];
  const w = 300;
  const step = w / (pts.length - 1);
  const path = pts.map((p,i) => `${i===0?'M':'L'} ${i*step} ${height - p*(height/100)*0.9 - 4}`).join(' ');
  const fill = path + ` L ${w} ${height} L 0 ${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ width:'100%', height, display:'block' }}>
      <path d={fill} fill={color} opacity=".15"/>
      <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

export function TopBar({ title, onBack, right }: { title:string; onBack?:()=>void; right?:ReactNode }) {
  return (
    <div style={{ padding:'12px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', background:C.bg, flexShrink:0 }}>
      <button onClick={onBack} style={{ width:40, height:40, borderRadius:12, border:`1px solid ${C.line}`, background:'#FFF', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon name="chevronLeft" size={20} color={C.ink}/>
      </button>
      <div style={{ fontSize:15, fontWeight:700, color:C.ink, letterSpacing:-0.3 }}>{title}</div>
      <div style={{ width:40, display:'flex', justifyContent:'flex-end' }}>{right}</div>
    </div>
  );
}
