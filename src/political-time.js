// Denser navigation is independent of the dates for which boundary evidence exists.
export const TIME_BANDS = [
  { start: -4000, end: -500, step: 250, label: 'Early history' },
  { start: -500, end: 1, step: 50, label: 'Classical antiquity' },
  { start: 1, end: 1500, step: 25, label: 'Common Era' },
  { start: 1500, end: 1700, step: 20, label: 'Early modern' },
  { start: 1700, end: 1800, step: 10, label: '18th century' },
  { start: 1800, end: 2020, step: 5, label: 'Modern history' },
];

export function timeResolution(year) {
  if (year === 'modern') return 5;
  return (TIME_BANDS.find(b => year >= b.start && year < b.end) || TIME_BANDS.at(-1)).step;
}

export function buildTimeStops(snapshots) {
  const years = new Set();
  for (const {start,end,step} of TIME_BANDS) {
    years.add(start);
    for (let year = Math.ceil(start / step) * step; year < end; year += step) if (year !== 0) years.add(year);
    years.add(end);
  }
  for (const s of snapshots) if (Number.isFinite(s.year) && !s.modern) years.add(s.year);
  return [...years].filter(y => y !== 0).sort((a,b) => a-b).concat('modern');
}

export function timePosition(stops, year) {
  if (year === 'modern') return stops.length - 1;
  const upper = stops.findIndex(y => y === 'modern' || y >= year);
  if (upper <= 0) return 0;
  if (stops[upper] === 'modern') return upper - 1;
  const lower = upper - 1;
  return lower + (year - stops[lower]) / (stops[upper] - stops[lower]);
}

export function stepTime(stops, year, delta) {
  const position = timePosition(stops,year);
  const index = delta > 0 ? Math.floor(position) + delta : Math.ceil(position) + delta;
  return stops[Math.max(0,Math.min(stops.length-1,index))];
}

export function boundaryForYear(snapshots, year) {
  if (year === 'modern') return snapshots.find(s => s.modern);
  const dated = snapshots.filter(s => !s.modern && Number.isFinite(s.year));
  return dated.filter(s => s.year <= year).at(-1) || dated[0];
}

export function clampPoliticalYear(year) {
  const rounded = Math.round(year);
  return Math.max(-4000,Math.min(2020,rounded === 0 ? 1 : rounded));
}

// A wheel gesture may emit dozens of tiny events. Cap its contribution and
// consume one step at a time so trackpad momentum cannot skip whole centuries.
export function wheelBudget(previous,pixels) {
  const sameDirection = Math.sign(previous) === Math.sign(pixels);
  return Math.max(-240,Math.min(240,(sameDirection ? previous : 0) + pixels));
}
