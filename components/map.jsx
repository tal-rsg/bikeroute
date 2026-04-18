// Map placeholder component with route overlay
window.MapView = function MapView({
  height = 360, variant = 'forest', showRoute = true,
  progress = 1, showMarkers = true, interactive = true,
}) {
  // Simulated terrain map (SVG) — parks, roads, river
  const C = window.BR.colors;

  // Route path — a scenic loop
  const fullPath = "M 60 420 Q 80 380 120 360 T 200 340 Q 240 330 260 300 T 280 240 Q 290 200 270 160 T 230 100 Q 210 80 180 80 T 130 110";
  const dist = 900;
  const offset = dist * (1 - progress);

  return (
    <div style={{
      position: 'relative', height, width: '100%', overflow: 'hidden',
      background: '#DDE7DB', // base green terrain
    }}>
      <svg viewBox="0 0 360 480" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Park areas */}
        <rect x="0" y="0" width="360" height="480" fill="#D6E3D1"/>
        <path d="M0 0 L180 0 L150 80 L80 120 L0 100 Z" fill="#B8CFA8" opacity="0.7"/>
        <path d="M220 60 L360 40 L360 180 L280 200 L240 140 Z" fill="#B8CFA8" opacity="0.7"/>
        <path d="M0 300 L100 280 L140 360 L80 440 L0 420 Z" fill="#B8CFA8" opacity="0.7"/>
        <path d="M240 360 L340 340 L360 440 L280 460 L230 420 Z" fill="#B8CFA8" opacity="0.6"/>

        {/* River */}
        <path d="M-10 200 Q 100 180 180 230 T 370 240" stroke="#B3C8D4" strokeWidth="22" fill="none" opacity="0.8"/>
        <path d="M-10 200 Q 100 180 180 230 T 370 240" stroke="#9FBACA" strokeWidth="22" fill="none" opacity="0.3"/>

        {/* Road grid — major */}
        <g stroke="#FAF7F0" strokeWidth="8" fill="none">
          <path d="M-10 140 Q 180 130 370 150"/>
          <path d="M-10 340 L 370 330"/>
          <path d="M80 -10 L 90 490"/>
          <path d="M260 -10 L 250 490"/>
        </g>
        <g stroke="#E4DED1" strokeWidth="8" fill="none" strokeDasharray="4 6" opacity="0.6">
          <path d="M-10 140 Q 180 130 370 150"/>
          <path d="M-10 340 L 370 330"/>
        </g>
        {/* Minor roads */}
        <g stroke="#FAF7F0" strokeWidth="3" fill="none" opacity="0.8">
          <path d="M40 -10 L 50 490"/>
          <path d="M140 -10 L 130 490"/>
          <path d="M200 -10 L 210 490"/>
          <path d="M320 -10 L 310 490"/>
          <path d="M-10 60 L 370 50"/>
          <path d="M-10 240 L 370 230"/>
          <path d="M-10 420 L 370 410"/>
        </g>

        {/* Buildings dots */}
        <g fill="#C9C0AB" opacity="0.5">
          {Array.from({length: 40}).map((_, i) => {
            const x = (i * 73) % 360;
            const y = (i * 131) % 480;
            return <rect key={i} x={x} y={y} width="8" height="8" rx="1"/>;
          })}
        </g>

        {/* Trees */}
        <g>
          {Array.from({length: 25}).map((_, i) => {
            const x = 20 + (i * 47) % 340;
            const y = 30 + (i * 83) % 440;
            return <circle key={i} cx={x} cy={y} r="4" fill="#6B8E5A" opacity="0.4"/>;
          })}
        </g>

        {/* Route — shadow/glow then main */}
        {showRoute && (
          <>
            <path d={fullPath} stroke={C.primary} strokeWidth="10" fill="none" opacity="0.2" strokeLinecap="round"/>
            <path d={fullPath} stroke={C.primary} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={dist} strokeDashoffset={offset}/>
          </>
        )}

        {showMarkers && showRoute && (
          <>
            {/* Start marker */}
            <circle cx="60" cy="420" r="9" fill="#FFF" stroke={C.forest} strokeWidth="3"/>
            <circle cx="60" cy="420" r="4" fill={C.forest}/>
            {/* End marker */}
            <g transform="translate(130, 110)">
              <path d="M0 -18 a 10 10 0 1 1 0.01 0 Z M0 -3 L0 5" stroke={C.primary} strokeWidth="3" fill={C.primary}/>
              <circle cx="0" cy="-8" r="3" fill="#FFF"/>
            </g>
          </>
        )}
      </svg>

      {/* Attribution overlay */}
      <div style={{
        position: 'absolute', bottom: 8, right: 10,
        fontSize: 10, color: '#5C554A', opacity: 0.6,
        fontFamily: window.BR.font.mono,
      }}>© BikeRoute Maps</div>

      {/* Compass */}
      {interactive && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 36, height: 36, borderRadius: '50%',
          background: '#FFF', boxShadow: window.BR.shadow.sm,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: window.BR.colors.primary,
          fontFamily: window.BR.font.mono,
        }}>N</div>
      )}
    </div>
  );
};

// Mini elevation profile
window.ElevationChart = function ElevationChart({ height = 80, color }) {
  const C = window.BR.colors;
  color = color || C.forest;
  const pts = [20, 35, 30, 45, 60, 55, 70, 65, 80, 72, 85, 75, 60, 50, 42, 55, 48, 35, 30, 25];
  const w = 300;
  const stepX = w / (pts.length - 1);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i*stepX} ${height - p*(height/100)*0.9 - 4}`).join(' ');
  const fill = path + ` L ${w} ${height} L 0 ${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{width:'100%', height, display:'block'}}>
      <path d={fill} fill={color} opacity="0.15"/>
      <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};
