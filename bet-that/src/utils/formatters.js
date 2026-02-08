const pad = (value) => String(value).padStart(2, '0');

const formatAmount = (value) => {
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toFixed(2);
};

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[date.getMonth()]} ${date.getDate()} · ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

const formatCountdown = (closeAt, now) => {
  const diffMs = new Date(closeAt).getTime() - now;
  if (!Number.isFinite(diffMs) || diffMs <= 0) return 'Betting closed';
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) {
    return `${days}d ${hours}h left`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
};

const toInputDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const toInputTime = (date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export { pad, formatAmount, formatDateTime, formatCountdown, toInputDate, toInputTime };
