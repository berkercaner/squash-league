import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import type { SeriesPoint } from "../lib/types";

export function Sparkline({
  series,
  color,
  height = 40,
  showBaseline = true,
}: {
  series: SeriesPoint[];
  color: string;
  height?: number;
  showBaseline?: boolean;
}) {
  if (series.length < 2) {
    return (
      <div className="flex items-center text-[11px] text-slate-400 dark:text-slate-600" style={{ height }}>
        Not enough data
      </div>
    );
  }

  const data = series.map((p, i) => ({ i, score: p.score }));
  const gradId = `spark-${color.replace("#", "")}`;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
          {showBaseline && (
            <Area
              dataKey={() => 0}
              stroke="none"
              fill="none"
              isAnimationActive={false}
            />
          )}
          <Area
            type="monotone"
            dataKey="score"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradId})`}
            dot={false}
            isAnimationActive
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
