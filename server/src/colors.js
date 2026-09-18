// Fixed, accessible-in-both-themes palette used to auto-assign a player's
// avatar/chart color when one isn't supplied.
export const PLAYER_COLORS = [
  "#22d3ee", // cyan
  "#a78bfa", // violet
  "#fb923c", // orange
  "#34d399", // emerald
  "#f472b6", // pink
  "#facc15", // yellow
  "#60a5fa", // blue
  "#f87171", // red
  "#4ade80", // green
  "#e879f9", // fuchsia
];

export function colorForIndex(index) {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}
