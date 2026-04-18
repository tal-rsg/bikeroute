// Phone chrome — status bar + home indicator (simpler Android look)
window.PhoneChrome = function PhoneChrome({ children, dark = false }) {
  const C = window.BR.colors;
  const fg = dark ? '#FFFFFF' : C.ink;
  return (
    <div style={{
      width: 390, height: 820,
      borderRadius: 44, overflow: 'hidden',
      background: dark ? '#0F0E0C' : C.bg,
      border: '10px solid #1A1814',
      boxShadow: '0 40px 100px rgba(31,27,22,0.25), 0 12px 30px rgba(31,27,22,0.12)',
      display: 'flex', flexDirection: 'column', position: 'relative',
      fontFamily: window.BR.font.sans,
    }}>
      {/* Status bar */}
      <div style={{
        height: 36, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', color: fg, fontSize: 14, fontWeight: 600,
        letterSpacing: 0.2, position: 'relative', zIndex: 10,
      }}>
        <span style={{fontFamily: window.BR.font.mono, fontSize: 13}}>9:30</span>
        {/* Camera notch */}
        <div style={{
          position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)',
          width: 22, height: 22, borderRadius: '50%', background: '#0A0908',
        }}/>
        <div style={{display:'flex', alignItems:'center', gap: 5}}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill={fg}><path d="M7 10L0 3a9.9 9.9 0 0114 0L7 10z"/></svg>
          <svg width="14" height="10" viewBox="0 0 14 10" fill={fg}><rect x="0" y="6" width="3" height="4" rx="0.5"/><rect x="4" y="4" width="3" height="6" rx="0.5"/><rect x="8" y="2" width="3" height="8" rx="0.5"/></svg>
          <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
            <rect x="0.5" y="0.5" width="18" height="10" rx="2" stroke={fg} fill="none"/>
            <rect x="2" y="2" width="15" height="7" rx="1" fill={fg}/>
            <rect x="19.5" y="3.5" width="2" height="4" rx="0.5" fill={fg}/>
          </svg>
        </div>
      </div>
      {/* Content */}
      <div style={{flex: 1, overflow: 'hidden', position: 'relative', display:'flex', flexDirection:'column'}}>
        {children}
      </div>
    </div>
  );
};

// Button component
window.Button = function Button({
  children, onClick, variant = 'primary', size = 'md',
  icon, iconRight, full, disabled, style = {},
}) {
  const C = window.BR.colors;
  const sizes = {
    sm: { h: 36, px: 14, fs: 13, gap: 6, r: 10 },
    md: { h: 48, px: 20, fs: 15, gap: 8, r: 14 },
    lg: { h: 56, px: 24, fs: 16, gap: 10, r: 16 },
    xl: { h: 64, px: 28, fs: 17, gap: 10, r: 18 },
  };
  const s = sizes[size];
  const variants = {
    primary: { bg: C.primary, color: '#FFF', border: 'none' },
    dark: { bg: C.ink, color: '#FFF', border: 'none' },
    forest: { bg: C.forest, color: '#FFF', border: 'none' },
    outline: { bg: 'transparent', color: C.ink, border: `1.5px solid ${C.line}` },
    ghost: { bg: 'transparent', color: C.ink, border: 'none' },
    soft: { bg: C.primarySoft, color: C.primaryDark, border: 'none' },
    danger: { bg: C.danger, color: '#FFF', border: 'none' },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      height: s.h, padding: `0 ${s.px}px`, fontSize: s.fs, gap: s.gap,
      borderRadius: s.r, background: v.bg, color: v.color, border: v.border,
      fontFamily: window.BR.font.sans, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      width: full ? '100%' : 'auto',
      letterSpacing: -0.1,
      transition: 'all 0.15s ease', ...style,
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {icon}{children}{iconRight}
    </button>
  );
};

// Text input
window.TextField = function TextField({ label, value, onChange, placeholder, type='text', icon, right, hint }) {
  const C = window.BR.colors;
  const [focus, setFocus] = React.useState(false);
  return (
    <label style={{display:'block', fontFamily: window.BR.font.sans}}>
      {label && <div style={{fontSize: 13, fontWeight: 600, color: C.inkSoft, marginBottom: 8}}>{label}</div>}
      <div style={{
        display:'flex', alignItems:'center', gap: 10,
        height: 52, padding: '0 14px',
        borderRadius: 14, background: '#FFF',
        border: `1.5px solid ${focus ? C.primary : C.line}`,
        transition: 'border-color 0.15s',
      }}>
        {icon && <span style={{color: focus ? C.primary : C.inkMute, display:'flex'}}>{icon}</span>}
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
          style={{
            flex:1, border:'none', outline:'none', background:'transparent',
            fontSize: 15, fontFamily: window.BR.font.sans, color: C.ink,
          }}
        />
        {right}
      </div>
      {hint && <div style={{fontSize: 12, color: C.inkMute, marginTop: 6}}>{hint}</div>}
    </label>
  );
};

// Stat tile
window.Stat = function Stat({ label, value, unit, icon, dark, accent }) {
  const C = window.BR.colors;
  return (
    <div style={{
      background: dark ? 'rgba(255,255,255,0.06)' : C.white,
      border: dark ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${C.line}`,
      borderRadius: 16, padding: '14px 16px',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:6, marginBottom: 6}}>
        {icon && <span style={{color: accent || (dark ? '#B6AA99' : C.inkMute), display:'flex'}}>{icon}</span>}
        <div style={{fontSize: 11, fontWeight: 600, textTransform:'uppercase',
          letterSpacing: 0.8, color: dark ? '#B6AA99' : C.inkMute}}>{label}</div>
      </div>
      <div style={{display:'flex', alignItems:'baseline', gap: 4}}>
        <div style={{fontSize: 24, fontFamily: window.BR.font.mono, fontWeight: 500,
          color: dark ? '#FFF' : C.ink, lineHeight: 1}}>{value}</div>
        {unit && <div style={{fontSize: 12, color: dark ? '#B6AA99' : C.inkMute,
          fontFamily: window.BR.font.mono}}>{unit}</div>}
      </div>
    </div>
  );
};

// Bottom nav
window.BottomNav = function BottomNav({ active, onChange }) {
  const C = window.BR.colors;
  const items = [
    { id: 'home', icon: 'home', label: 'Início' },
    { id: 'routes', icon: 'route', label: 'Rotas' },
    { id: 'record', icon: 'record', label: 'Gravar', center: true },
    { id: 'stats', icon: 'trending', label: 'Stats' },
    { id: 'profile', icon: 'user', label: 'Perfil' },
  ];
  return (
    <div style={{
      height: 84, flexShrink: 0,
      background: '#FFF',
      borderTop: `1px solid ${C.line}`,
      display: 'flex', alignItems: 'flex-start',
      padding: '8px 4px 0', position: 'relative',
    }}>
      {items.map(it => {
        const isActive = active === it.id;
        if (it.center) {
          return (
            <button key={it.id} onClick={() => onChange(it.id)}
              style={{
                flex: 1, background:'none', border:'none', cursor:'pointer',
                display:'flex', flexDirection:'column', alignItems:'center', gap: 2,
                paddingTop: 0,
              }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: C.primary, color: '#FFF',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow: '0 6px 18px rgba(232,85,58,0.4)',
                transform: 'translateY(-16px)',
              }}>
                <window.Icon name="record" size={22} color="#FFF"/>
              </div>
              <div style={{fontSize: 11, fontWeight: 600, color: C.ink,
                transform: 'translateY(-12px)', fontFamily: window.BR.font.sans}}>{it.label}</div>
            </button>
          );
        }
        return (
          <button key={it.id} onClick={() => onChange(it.id)}
            style={{
              flex: 1, background:'none', border:'none', cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', gap: 4,
              padding: '4px 0',
              color: isActive ? C.primary : C.inkMute,
            }}>
            <window.Icon name={it.icon} size={22} color={isActive ? C.primary : C.inkMute} stroke={isActive ? 2.2 : 1.8}/>
            <div style={{fontSize: 11, fontWeight: isActive ? 700 : 500, fontFamily: window.BR.font.sans}}>{it.label}</div>
          </button>
        );
      })}
    </div>
  );
};

// Pill / Chip
window.Pill = function Pill({ children, active, onClick, icon, color }) {
  const C = window.BR.colors;
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 14px', borderRadius: 999,
      background: active ? (color || C.ink) : C.white,
      color: active ? '#FFF' : C.ink,
      border: `1.5px solid ${active ? (color || C.ink) : C.line}`,
      fontSize: 13, fontWeight: 600, fontFamily: window.BR.font.sans,
      cursor: 'pointer', whiteSpace: 'nowrap',
    }}>
      {icon}{children}
    </button>
  );
};

// Segmented control
window.Segmented = function Segmented({ options, value, onChange }) {
  const C = window.BR.colors;
  return (
    <div style={{
      display: 'inline-flex', padding: 4, borderRadius: 12,
      background: C.bgAlt, border: `1px solid ${C.line}`,
    }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          style={{
            padding: '8px 14px', borderRadius: 9,
            background: value === opt.value ? '#FFF' : 'transparent',
            color: value === opt.value ? C.ink : C.inkSoft,
            border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: window.BR.font.sans,
            boxShadow: value === opt.value ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
          }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
};
