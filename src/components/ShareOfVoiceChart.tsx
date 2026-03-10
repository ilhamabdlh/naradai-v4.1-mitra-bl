import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import { parseChartDate, formatChartDateAxisLabel, getWeekStart } from "@/lib/chart-date-utils";
import type { ShareOfVoiceRow } from "@/lib/dashboard-content-types";

type Granularity = "daily" | "weekly" | "monthly";

const MONTH_SHORT: Record<number, string> = {
  0: "Jan", 1: "Feb", 2: "Mar", 3: "Apr", 4: "May", 5: "Jun",
  6: "Jul", 7: "Aug", 8: "Sep", 9: "Oct", 10: "Nov", 11: "Dec",
};

const BRAND_COLORS: Record<string, string> = {
  "Mitra Bukalapak": "#dc2626",
  "Mitra Shopee": "#ea580c",
  "Order Kuota": "#2563eb",
  "BRILink": "#059669",
};

function getBrandColor(brandKey: string, index: number): string {
  return BRAND_COLORS[brandKey] ?? ["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ec4899"][index % 5];
}

type SovChartRow = { date: string; [brand: string]: number | string };

function aggregateSovData(
  rows: ShareOfVoiceRow[],
  granularity: Granularity,
  allDates: string[],
  brandKeys: string[]
): SovChartRow[] {
  if (!rows.length || !brandKeys.length) return [];

  const sorted = [...rows].sort((a, b) => {
    const dateA = parseChartDate(a.date, allDates);
    const dateB = parseChartDate(b.date, allDates);
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
    return dateA.getTime() - dateB.getTime();
  });

  const emptyRow = (): SovChartRow => {
    const r: SovChartRow = { date: "" };
    brandKeys.forEach((k) => (r[k] = 0));
    return r;
  };

  if (granularity === "daily") {
    return sorted.map((row) => {
      const out: SovChartRow = { date: formatChartDateAxisLabel(row.date, allDates) };
      brandKeys.forEach((k) => (out[k] = Number((row as Record<string, unknown>)[k]) || 0));
      return out;
    });
  }

  if (granularity === "weekly") {
    const byWeek = new Map<string, { data: SovChartRow; sortKey: string }>();
    for (const row of sorted) {
      const date = parseChartDate(row.date, allDates);
      if (isNaN(date.getTime())) continue;
      const weekStart = getWeekStart(date);
      const label = formatChartDateAxisLabel(weekStart, allDates);
      if (!byWeek.has(weekStart)) {
        byWeek.set(weekStart, { data: { ...emptyRow(), date: label }, sortKey: weekStart });
      }
      const acc = byWeek.get(weekStart)!;
      brandKeys.forEach((k) => {
        const v = Number((row as Record<string, unknown>)[k]) || 0;
        (acc.data[k] as number) += v;
      });
    }
    return Array.from(byWeek.values())
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ data }) => data);
  }

  const byMonth = new Map<string, { data: SovChartRow; sortKey: number }>();
  for (const row of sorted) {
    const date = parseChartDate(row.date, allDates);
    if (isNaN(date.getTime())) continue;
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const label = (MONTH_SHORT[date.getMonth()] ?? "?") + " " + String(date.getFullYear()).slice(2);
    if (!byMonth.has(monthKey)) {
      byMonth.set(monthKey, { data: { ...emptyRow(), date: label }, sortKey: date.getTime() });
    }
    const acc = byMonth.get(monthKey)!;
    brandKeys.forEach((k) => {
      const v = Number((row as Record<string, unknown>)[k]) || 0;
      (acc.data[k] as number) += v;
    });
  }
  return Array.from(byMonth.values())
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ data }) => data);
}

function convertToPercent(rows: SovChartRow[], brandKeys: string[]): SovChartRow[] {
  return rows.map((row) => {
    const total = brandKeys.reduce((sum, k) => sum + (Number(row[k]) || 0), 0);
    const out: SovChartRow = { date: row.date };
    brandKeys.forEach((k) => {
      const val = Number(row[k]) || 0;
      out[k] = total > 0 ? (val / total) * 100 : 0;
    });
    return out;
  });
}

export function ShareOfVoiceChart() {
  const content = useDashboardContent();
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const rows = content?.competitiveShareOfVoice ?? [];

  const { data, brandKeys } = useMemo(() => {
    if (!rows.length) return { data: [], brandKeys: [] as string[] };
    const first = rows[0] as Record<string, unknown>;
    const keys = Object.keys(first).filter((k) => k !== "date") as string[];
    const allDates = rows.map((r) => (r as ShareOfVoiceRow).date);
    const aggregated = aggregateSovData(rows as ShareOfVoiceRow[], granularity, allDates, keys);
    const asPercent = convertToPercent(aggregated, keys);
    return { data: asPercent, brandKeys: keys };
  }, [rows, granularity]);

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center h-[320px] text-sm text-slate-500 rounded-xl border border-dashed border-slate-200">
        No Share of Voice data for this instance.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(["daily", "weekly", "monthly"] as Granularity[]).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                granularity === g
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
            interval={granularity === "daily" ? 2 : 0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${typeof v === "number" && v.toFixed ? v.toFixed(0) : v}`}
            label={{
              value: "Share (%)",
              angle: -90,
              position: "insideLeft",
              offset: -5,
              style: { fontSize: 12, fill: "#475569", fontWeight: 600 },
            }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const total = payload.reduce((s, p) => s + (Number(p.value) || 0), 0);
              return (
                <div className="bg-white border-2 border-slate-200 rounded-xl p-3 shadow-xl">
                  <p className="font-semibold text-slate-900 mb-2 text-sm">{label}</p>
                  <div className="space-y-1.5">
                    {payload
                      .filter((p) => Number(p.value) > 0)
                      .map((entry: { dataKey?: string; value?: number; color?: string }, idx: number) => {
                        const pct = total > 0 ? ((Number(entry.value) / total) * 100).toFixed(1) : "0";
                        return (
                          <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-slate-600">{entry.dataKey}</span>
                            </div>
                            <span className="font-semibold text-slate-900">
                              {Number(entry.value).toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                  </div>
                  <div className="border-t border-slate-200 mt-2 pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Total</span>
                    <span className="font-semibold text-slate-900">{total.toFixed(1)}%</span>
                  </div>
                </div>
              );
            }}
          />
          <Legend
            content={() => (
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2" style={{ paddingTop: 8 }}>
                {brandKeys.map((key, i) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span
                      className="inline-block rounded-full"
                      style={{ width: 8, height: 8, backgroundColor: getBrandColor(key, i) }}
                    />
                    <span className="text-xs text-slate-700">{key}</span>
                  </div>
                ))}
              </div>
            )}
          />
          {brandKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="sov"
              fill={getBrandColor(key, i)}
              radius={i === brandKeys.length - 1 ? [4, 4, 0, 0] : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
