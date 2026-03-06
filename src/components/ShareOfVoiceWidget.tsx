import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import type { ShareOfVoiceRow } from "@/lib/dashboard-content-types";

type Granularity = "daily" | "weekly" | "monthly";

const defaultDaily: ShareOfVoiceRow[] = [
  { date: "Jan 1",  yourBrand: 250, competitorA: 210, competitorB: 180, competitorC: 200, competitorD: 190 },
  { date: "Jan 15", yourBrand: 288, competitorA: 248, competitorB: 208, competitorC: 226, competitorD: 216 },
  { date: "Jan 30", yourBrand: 385, competitorA: 282, competitorB: 250, competitorC: 262, competitorD: 252 },
];

const defaultWeekly: ShareOfVoiceRow[] = [
  { date: "Jan 1",  yourBrand: 1800, competitorA: 1500, competitorB: 1300, competitorC: 1400, competitorD: 1350 },
  { date: "Jan 15", yourBrand: 1950, competitorA: 1700, competitorB: 1350, competitorC: 1550, competitorD: 1480 },
  { date: "Jan 29", yourBrand: 2500, competitorA: 1750, competitorB: 1450, competitorC: 1650, competitorD: 1580 },
];

const defaultMonthly: ShareOfVoiceRow[] = [
  { date: "Oct", yourBrand: 7500, competitorA: 6200, competitorB: 5400, competitorC: 5800, competitorD: 5600 },
  { date: "Nov", yourBrand: 8200, competitorA: 6800, competitorB: 5900, competitorC: 6300, competitorD: 6100 },
  { date: "Dec", yourBrand: 9100, competitorA: 7200, competitorB: 6400, competitorC: 6800, competitorD: 6500 },
  { date: "Jan", yourBrand: 9800, competitorA: 7600, competitorB: 6700, competitorC: 7100, competitorD: 6800 },
];

const dataByGranularity: Record<Granularity, ShareOfVoiceRow[]> = {
  daily: defaultDaily,
  weekly: defaultWeekly,
  monthly: defaultMonthly,
};

const DEFAULT_COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#f43f5e", "#ec4899", "#3b82f6", "#84cc16", "#f97316"];

export function ShareOfVoiceWidget() {
  const content = useDashboardContent();
  const [granularity, setGranularity] = useState<Granularity>("weekly");
  const storeRows = content?.competitiveShareOfVoice ?? [];
  const rows = storeRows.length ? storeRows : dataByGranularity[granularity];
  const latestRow = rows[rows.length - 1] ?? rows[0];

  // Deteksi brand keys secara dinamis dari data
  const brandKeys = useMemo(() => {
    if (!latestRow) return [];
    return Object.keys(latestRow).filter((k) => k !== "date");
  }, [latestRow]);

  const yourBrandKey = brandKeys[0] ?? "yourBrand";

  const pieData = useMemo(() => {
    if (!latestRow) return [];
    return brandKeys
      .map((key) => ({ name: key, value: Number(latestRow[key]) || 0, key }))
      .filter((d) => d.value > 0);
  }, [latestRow, brandKeys]);

  const totalVoice = useMemo(() => pieData.reduce((s, d) => s + d.value, 0), [pieData]);
  const brandShare = useMemo(
    () => (totalVoice > 0 && latestRow ? ((Number(latestRow[yourBrandKey]) / totalVoice) * 100).toFixed(1) : "0"),
    [latestRow, totalVoice, yourBrandKey]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-600">
          Voice = total conversations (brand + competitors). Share of voice = % mentioning your brand.
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(["daily", "weekly", "monthly"] as Granularity[]).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                granularity === g ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {pieData.length === 0 ? (
        <div className="h-[320px] flex items-center justify-center text-slate-500">No data</div>
      ) : (
        <>
          <div className="mb-2 text-sm font-semibold text-slate-800">
            Your brand share of voice: <span className="text-violet-600">{brandShare}%</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const total = payload.reduce((s, p) => s + (p.value as number), 0);
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-sm">
                      {payload.map((p: any) => {
                        const pct = total > 0 ? (((p.value as number) / total) * 100).toFixed(1) : "0";
                        return (
                          <div key={p.name} className="flex justify-between gap-4">
                            <span className="text-slate-600">{p.name}</span>
                            <span className="font-semibold text-slate-900">
                              {(p.value as number).toLocaleString()} ({pct}%)
                            </span>
                          </div>
                        );
                      })}
                      <div className="border-t border-slate-100 mt-2 pt-2 flex justify-between">
                        <span className="text-slate-600 font-medium">Total voice</span>
                        <span className="font-semibold">{total.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend formatter={(value) => <span className="text-xs text-slate-700">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
