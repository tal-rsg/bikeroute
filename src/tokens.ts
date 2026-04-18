export const C = {
  primary:     '#E8553A',
  primaryDark: '#C94222',
  primarySoft: '#FDEDE8',
  forest:      '#2D4A3E',
  forestSoft:  '#E8EFE9',
  moss:        '#6B8E5A',
  leaf:        '#8FAD7A',
  bg:          '#FAF7F0',
  bgAlt:       '#F2EEE3',
  ink:         '#1F1B16',
  inkSoft:     '#5C554A',
  inkMute:     '#8B8478',
  line:        '#E4DED1',
  lineSoft:    '#EFEADD',
  white:       '#FFFFFF',
  success:     '#4A8A4E',
  danger:      '#C44536',
  warn:        '#D4A04C',
  sky:         '#7FA9BF',
} as const;

export const R = { sm: 8, md: 12, lg: 20, xl: 28, pill: 999 } as const;

export const shadow = {
  sm: '0 1px 2px rgba(31,27,22,.06),0 1px 3px rgba(31,27,22,.04)',
  md: '0 4px 12px rgba(31,27,22,.08),0 2px 4px rgba(31,27,22,.04)',
  lg: '0 12px 32px rgba(31,27,22,.12),0 4px 8px rgba(31,27,22,.06)',
} as const;

export const font = {
  sans: "'Manrope', system-ui, sans-serif",
  mono: "'DM Mono', 'JetBrains Mono', monospace",
} as const;

export function fmt(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
