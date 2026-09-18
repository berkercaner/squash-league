import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SeriesPoint } from "../lib/types";
import { formatDate } from "../lib/format";

function TrendTooltip({ active, payload, color }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-card-hover backdrop-blur dark:border-white/10 dark:bg-surface-dark-raised/95">
      <div className="font-semibold text-slate-900 dark:text-slate-100">{formatDate(point.playedAt)}</div>
      <div className="mt-0.5 flex items-center gap-1.5 tabular">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        <span className="text-slate-500 dark:text-slate-400">Score</span>
        <span className="font-bold text-slate-900 dark:text-slate-100">{point.score}</span>
      </div>
    </div>
  );
}

export function TrendChart({ series, color }: { series: SeriesPoint[]; color: string }) {
  if (series.length < 2) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-white/10 dark:text-slate-600">
        Play a few more matches to see a trend line.
      </div>
    );
  }

  const data = series.map((p) => ({ playedAt: p.playedAt, score: p.score }));
  const gradId = `trend-${color.replace("#", "")}`;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-white/5" />
          <XAxis
            dataKey="playedAt"
            tickFormatter={(v) => formatDate(v)}
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-slate-400 dark:text-slate-600"
            axisLine={false}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "currentColor" }}
            className="text-slate-400 dark:text-slate-600"
            axisLine={false}
            tickLine={false}
            width={36}
            allowDecimals={false}
          />
          <ReferenceLine y={0} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeDasharray="3 3" />
          <Tooltip content={<TrendTooltip color={color} />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradId})`}
            dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: "white" }}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
