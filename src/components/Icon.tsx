import React from 'react';

interface Props {
  name: string;
  size?: number;
  color?: string;
  stroke?: number;
}

type IconPath = React.ReactNode | ((color: string) => React.ReactElement);
const paths: Record<string, IconPath> = {
  home:         <><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></>,
  route:        <><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M6 8.5v3a4 4 0 004 4h4a4 4 0 014 0"/></>,
  record:       (c: string) => <circle cx="12" cy="12" r="8" fill={c} stroke="none"/>,
  play:         (c: string) => <path d="M8 5l12 7-12 7V5z" fill={c} stroke={c} strokeLinejoin="round"/>,
  pause:        (c: string) => <><rect x="7" y="5" width="4" height="14" fill={c} stroke="none"/><rect x="13" y="5" width="4" height="14" fill={c} stroke="none"/></>,
  stop:         (c: string) => <rect x="6" y="6" width="12" height="12" fill={c} stroke="none" rx="2"/>,
  user:         <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></>,
  mail:         <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>,
  lock:         <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></>,
  eye:          <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
  chevronRight: <path d="M9 6l6 6-6 6"/>,
  chevronLeft:  <path d="M15 6l-9 6 9 6"/>,
  arrowRight:   <><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>,
  arrowUp:      <><path d="M12 19V5"/><path d="M6 11l6-6 6 6"/></>,
  check:        <path d="M4 12l5 5L20 6"/>,
  plus:         <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  search:       <><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></>,
  clock:        <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  map:          <><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z"/><path d="M9 4v16M15 6v16"/></>,
  mountain:     <path d="M3 19l5-9 4 6 3-4 6 7z"/>,
  speed:        <><path d="M12 14a2 2 0 100-4 2 2 0 000 4z"/><path d="M12 14l5-5"/><path d="M4 17a9 9 0 1116 0"/></>,
  flame:        <path d="M12 2s5 4 5 10a5 5 0 01-10 0c0-2 1-3 2-4-1 3 1 4 2 4 2 0 2-2 1-4 0-2 0-4 0-6z"/>,
  trending:     <><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></>,
  heart:        <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/>,
  share:        <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></>,
  edit:         <><path d="M4 20h4l11-11-4-4L4 16v4z"/><path d="M13 5l4 4"/></>,
  trash:        <><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12"/><path d="M9 7V4h6v3"/></>,
  camera:       <><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M9 7l2-3h2l2 3"/></>,
  sun:          <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></>,
  wind:         <><path d="M3 8h12a3 3 0 100-6"/><path d="M3 12h18"/><path d="M3 16h15a3 3 0 110 6"/></>,
  target:       (c: string) => <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill={c} stroke="none"/></>,
  trophy:       <><path d="M8 3h8v5a4 4 0 01-8 0V3z"/><path d="M8 5H5a2 2 0 002 4M16 5h3a2 2 0 01-2 4"/><path d="M9 13v3h6v-3M8 21h8"/><path d="M10 16v5M14 16v5"/></>,
  users:        <><circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="6" r="2.5"/><path d="M17 11c3 0 5 2 5 5"/></>,
  bike:         <><circle cx="5.5" cy="17" r="3.5"/><circle cx="18.5" cy="17" r="3.5"/><path d="M9 17l3-7 4 7M12 10h4l-1-3M8 7h3"/></>,
  settings:     <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
  lock2:        <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>,
  globe:        <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3.5 3 14.5 0 18"/><path d="M12 3c-3 3.5-3 14.5 0 18"/></>,
  notif:        <><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 004 0"/></>,
  x:            <><path d="M6 6l12 12M18 6L6 18"/></>,
  more:         (c: string) => <><circle cx="5" cy="12" r="1.5" fill={c}/><circle cx="12" cy="12" r="1.5" fill={c}/><circle cx="19" cy="12" r="1.5" fill={c}/></>,
  download:     <><path d="M12 3v13M6 12l6 5 6-5M4 21h16"/></>,
  droplet:      <path d="M12 3s6 7 6 11a6 6 0 11-12 0c0-4 6-11 6-11z"/>,
  wifi:         <><path d="M5 12.5A9.5 9.5 0 0119 12.5"/><path d="M8.5 15.5A5 5 0 0115.5 15.5"/><circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/></>,
  'wifi-off':   <><line x1="2" y1="2" x2="22" y2="22"/><path d="M8.5 16.5A5 5 0 0115.5 16.5"/><path d="M5 13A9.5 9.5 0 0113.5 10.5"/><path d="M19 13c-.5-.7-1.1-1.3-1.8-1.8"/><circle cx="12" cy="20" r="1.5" fill="currentColor" stroke="none"/></>,
  'sync':       <><path d="M21 12a9 9 0 01-9 9M3 12a9 9 0 019-9"/><path d="M21 3v4h-4"/><path d="M3 21v-4h4"/></>,
};

export default function Icon({ name, size = 24, color = 'currentColor', stroke = 2 }: Props) {
  const p = paths[name] as IconPath | undefined;
  const content = typeof p === 'function' ? (p as (c: string) => React.ReactElement)(color) : p;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round"
    >
      {content ?? null}
    </svg>
  );
}
