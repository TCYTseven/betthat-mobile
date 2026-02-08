const COLORS = {
  background: '#FDFDFC',
  surface: '#F6F9F7',
  primary: '#184233',
  primaryDark: '#0F2D22',
  accent: '#8FE0B6',
  text: '#0F1E17',
  muted: '#66736B',
  border: '#E3EAE5',
  success: '#2E6B4F',
  warning: '#B47600',
  danger: '#B0352F',
  overlay: 'rgba(9, 25, 18, 0.45)',
  shadow: 'rgba(12, 28, 21, 0.1)',
  highlight: 'rgba(24, 66, 51, 0.08)',
};

const STATUS_COLORS = {
  open: COLORS.success,
  closed: COLORS.warning,
  resolved: COLORS.primaryDark,
};

export { COLORS, STATUS_COLORS };
