import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import { parseChartDate, formatChartDateAxisLabel, getWeekStart } from "@/lib/chart-date-utils";
import type { ShareOfPlatformRow, ShareOfPlatformValue } from "@/lib/dashboard-content-types";

type Granularity = "daily" | "weekly" | "monthly";

const PLATFORM_KEYS = ["twitter", "instagram", "facebook", "tiktok", "googlemaps", "googleplay", "appstore"] as const;

const MONTH_SHORT_SOP: Record<number, string> = {
  0: "Jan", 1: "Feb", 2: "Mar", 3: "Apr", 4: "May", 5: "Jun",
  6: "Jul", 7: "Aug", 8: "Sep", 9: "Oct", 10: "Nov", 11: "Dec",
};

function toNumber(v: ShareOfPlatformValue | undefined): number {
  if (v == null) return 0;
  return Array.isArray(v) ? v[0] : (typeof v === "number" ? v : 0);
}

function toPct(v: ShareOfPlatformValue | undefined): string {
  if (v == null) return "0%";
  return Array.isArray(v) ? (v[1] ?? "0%") : "";
}

/** Normalize store row (number atau [mention, pct]) ke row dengan nilai mention numerik dan *Pct untuk tooltip */
function normalizeShareRow(row: ShareOfPlatformRow): Record<string, number | string> {
  const out: Record<string, number | string> = { date: row.date };
  for (const k of PLATFORM_KEYS) {
    const v = (row as Record<string, ShareOfPlatformValue>)[k];
    out[k] = toNumber(v);
    const pct = toPct(v);
    if (pct) out[k + "Pct"] = pct;
  }
  return out;
}

type ChartRow = { date: string; twitter: number; instagram: number; facebook: number; tiktok: number; googlemaps: number; googleplay: number; appstore: number; [k: string]: number | string };

function aggregateShareOfPlatformData(
  items: ChartRow[],
  granularity: Granularity,
  allDates: string[]
): ChartRow[] {
  if (!items.length) return [];

  const sorted = [...items].sort((a, b) => {
    const dateA = parseChartDate(a.date, allDates);
    const dateB = parseChartDate(b.date, allDates);
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
    return dateA.getTime() - dateB.getTime();
  });

  const emptyRow = (): ChartRow => ({
    date: "",
    twitter: 0,
    instagram: 0,
    facebook: 0,
    tiktok: 0,
    googlemaps: 0,
    googleplay: 0,
    appstore: 0,
  });

  if (granularity === "daily") {
    return sorted.map((item) => ({
      ...item,
      date: formatChartDateAxisLabel(item.date, allDates),
    })) as ChartRow[];
  }

  if (granularity === "weekly") {
    const byWeek = new Map<string, { data: ChartRow; sortKey: string }>();
    for (const item of sorted) {
      const date = parseChartDate(item.date, allDates);
      if (isNaN(date.getTime())) continue;
      const weekStart = getWeekStart(date);
      const label = formatChartDateAxisLabel(weekStart, allDates);
      if (!byWeek.has(label)) {
        byWeek.set(label, { data: { ...emptyRow(), date: label }, sortKey: weekStart });
      }
      const acc = byWeek.get(label)!;
      for (const k of PLATFORM_KEYS) acc.data[k] = (acc.data[k] as number) + (item[k] as number) || 0;
    }
    return Array.from(byWeek.values())
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ data }) => data);
  }

  const byMonth = new Map<string, { data: ChartRow; sortKey: number }>();
  for (const item of sorted) {
    const date = parseChartDate(item.date, allDates);
    if (isNaN(date.getTime())) continue;
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const label = MONTH_SHORT_SOP[date.getMonth()] ?? "?";
    if (!byMonth.has(monthKey)) {
      byMonth.set(monthKey, { data: { ...emptyRow(), date: label }, sortKey: date.getTime() });
    }
    const acc = byMonth.get(monthKey)!;
    for (const k of PLATFORM_KEYS) acc.data[k] = (acc.data[k] as number) + (item[k] as number) || 0;
  }
  return Array.from(byMonth.values())
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ data }) => data);
}

/** Ubah setiap row sehingga nilai bar = persentase, tapi tetap menyimpan mention & label persen untuk tooltip. */
function convertRowsToPercent(rows: ChartRow[]): ChartRow[] {
  return rows.map((row) => {
    const out: ChartRow = { ...row };
    const total = PLATFORM_KEYS.reduce((sum, key) => sum + ((row[key] as number) || 0), 0);
    for (const key of PLATFORM_KEYS) {
      const mention = (row[key] as number) || 0;
      (out as any)[`${key}Mention`] = mention;
      const pctNum = total > 0 ? (mention / total) * 100 : 0;
      out[key] = pctNum;
      if (out[`${key}Pct`] == null) {
        out[`${key}Pct`] = total > 0 ? `${pctNum.toFixed(0)}%` : "0%";
      }
    }
    return out;
  });
}

const dailyData: ChartRow[] = [
  { date: "Jan 1", twitter: 180, instagram: 100, facebook: 78, tiktok: 55, googleplay: 0, appstore: 0 },
  { date: "Jan 2", twitter: 195, instagram: 105, facebook: 72, tiktok: 60, googleplay: 0, appstore: 0 },
  { date: "Jan 3", twitter: 170, instagram: 95, facebook: 80, tiktok: 58, googleplay: 0, appstore: 0 },
  { date: "Jan 4", twitter: 210, instagram: 110, facebook: 75, tiktok: 65, googleplay: 0, appstore: 0 },
  { date: "Jan 5", twitter: 200, instagram: 115, facebook: 82, tiktok: 62, googleplay: 0, appstore: 0 },
  { date: "Jan 6", twitter: 185, instagram: 108, facebook: 76, tiktok: 68, googleplay: 0, appstore: 0 },
  { date: "Jan 7", twitter: 220, instagram: 120, facebook: 85, tiktok: 70, googleplay: 0, appstore: 0 },
  { date: "Jan 8", twitter: 230, instagram: 125, facebook: 80, tiktok: 72, googleplay: 0, appstore: 0 },
  { date: "Jan 9", twitter: 215, instagram: 118, facebook: 88, tiktok: 75, googleplay: 0, appstore: 0 },
  { date: "Jan 10", twitter: 240, instagram: 130, facebook: 82, tiktok: 78, googleplay: 0, appstore: 0 },
  { date: "Jan 11", twitter: 225, instagram: 122, facebook: 90, tiktok: 80, googleplay: 0, appstore: 0 },
  { date: "Jan 12", twitter: 250, instagram: 135, facebook: 85, tiktok: 82, googleplay: 0, appstore: 0 },
  { date: "Jan 13", twitter: 235, instagram: 128, facebook: 92, tiktok: 85, googleplay: 0, appstore: 0 },
  { date: "Jan 14", twitter: 260, instagram: 140, facebook: 88, tiktok: 88, googleplay: 0, appstore: 0 },
  { date: "Jan 15", twitter: 245, instagram: 132, facebook: 95, tiktok: 90, googleplay: 0, appstore: 0 },
  { date: "Jan 16", twitter: 270, instagram: 145, facebook: 90, tiktok: 92, googleplay: 0, appstore: 0 },
  { date: "Jan 17", twitter: 255, instagram: 138, facebook: 98, tiktok: 95, googleplay: 0, appstore: 0 },
  { date: "Jan 18", twitter: 280, instagram: 150, facebook: 92, tiktok: 98, googleplay: 0, appstore: 0 },
  { date: "Jan 19", twitter: 265, instagram: 142, facebook: 100, tiktok: 100, googleplay: 0, appstore: 0 },
  { date: "Jan 20", twitter: 290, instagram: 155, facebook: 95, tiktok: 102, googleplay: 0, appstore: 0 },
  { date: "Jan 21", twitter: 275, instagram: 148, facebook: 102, tiktok: 105, googleplay: 0, appstore: 0 },
  { date: "Jan 22", twitter: 300, instagram: 160, facebook: 98, tiktok: 108, googleplay: 0, appstore: 0 },
  { date: "Jan 23", twitter: 285, instagram: 152, facebook: 105, tiktok: 110, googleplay: 0, appstore: 0 },
  { date: "Jan 24", twitter: 310, instagram: 165, facebook: 100, tiktok: 112, googleplay: 0, appstore: 0 },
  { date: "Jan 25", twitter: 295, instagram: 158, facebook: 108, tiktok: 115, googleplay: 0, appstore: 0 },
  { date: "Jan 26", twitter: 320, instagram: 170, facebook: 102, tiktok: 118, googleplay: 0, appstore: 0 },
  { date: "Jan 27", twitter: 305, instagram: 162, facebook: 110, tiktok: 120, googleplay: 0, appstore: 0 },
  { date: "Jan 28", twitter: 330, instagram: 175, facebook: 105, tiktok: 122, googleplay: 0, appstore: 0 },
  { date: "Jan 29", twitter: 315, instagram: 168, facebook: 112, tiktok: 125, googleplay: 0, appstore: 0 },
  { date: "Jan 30", twitter: 340, instagram: 180, facebook: 108, tiktok: 128, googleplay: 0, appstore: 0 },
];

const weeklyData: ChartRow[] = [
  { date: "Jan 1", twitter: 1200, instagram: 700, facebook: 550, tiktok: 400, googleplay: 0, appstore: 0 },
  { date: "Jan 8", twitter: 1350, instagram: 750, facebook: 500, tiktok: 450, googleplay: 0, appstore: 0 },
  { date: "Jan 15", twitter: 1100, instagram: 680, facebook: 520, tiktok: 480, googleplay: 0, appstore: 0 },
  { date: "Jan 22", twitter: 1500, instagram: 800, facebook: 580, tiktok: 500, googleplay: 0, appstore: 0 },
  { date: "Jan 29", twitter: 1400, instagram: 850, facebook: 600, tiktok: 520, googleplay: 0, appstore: 0 },
  { date: "Feb 5", twitter: 1600, instagram: 900, facebook: 550, tiktok: 550, googleplay: 0, appstore: 0 },
  { date: "Feb 12", twitter: 1450, instagram: 820, facebook: 620, tiktok: 600, googleplay: 0, appstore: 0 },
  { date: "Feb 19", twitter: 1550, instagram: 880, facebook: 580, tiktok: 570, googleplay: 0, appstore: 0 },
  { date: "Feb 26", twitter: 1700, instagram: 950, facebook: 640, tiktok: 620, googleplay: 0, appstore: 0 },
  { date: "Mar 5", twitter: 1650, instagram: 920, facebook: 600, tiktok: 650, googleplay: 0, appstore: 0 },
  { date: "Mar 12", twitter: 1800, instagram: 980, facebook: 660, tiktok: 700, googleplay: 0, appstore: 0 },
  { date: "Mar 19", twitter: 1750, instagram: 1000, facebook: 680, tiktok: 720, googleplay: 0, appstore: 0 },
];

const monthlyData: ChartRow[] = [
  { date: "Oct", twitter: 5200, instagram: 3000, facebook: 2300, tiktok: 1700, googleplay: 0, appstore: 0 },
  { date: "Nov", twitter: 5800, instagram: 3400, facebook: 2500, tiktok: 1900, googleplay: 0, appstore: 0 },
  { date: "Dec", twitter: 6400, instagram: 3800, facebook: 2700, tiktok: 2200, googleplay: 0, appstore: 0 },
  { date: "Jan", twitter: 6900, instagram: 4100, facebook: 2900, tiktok: 2400, googleplay: 0, appstore: 0 },
  { date: "Feb", twitter: 7300, instagram: 4400, facebook: 3000, tiktok: 2600, googleplay: 0, appstore: 0 },
  { date: "Mar", twitter: 7800, instagram: 4700, facebook: 3200, tiktok: 2800, googleplay: 0, appstore: 0 },
];

const dataByGranularity: Record<Granularity, ChartRow[]> = {
  daily: dailyData,
  weekly: weeklyData,
  monthly: monthlyData,
};

const platformColors: Record<string, string> = {
  twitter: "#1DA1F2",
  instagram: "#E1306C",
  facebook: "#6B7280",
  tiktok: "#010101",
  googlemaps: "#4285F4",
  googleplay: "#34A853",
  appstore: "#8B5CF6",
};

const platformLabels: Record<string, string> = {
  twitter: "Twitter / X",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  googlemaps: "Google Maps",
  googleplay: "Google Play",
  appstore: "App Store",
};

export function ShareOfPlatform() {
  const content = useDashboardContent();
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const storeData = content?.whatsHappeningShareOfPlatform ?? [];

  const { data, activePlatformKeys } = useMemo(() => {
    const sourceRows = storeData.length > 0
      ? (storeData as ShareOfPlatformRow[]).map(normalizeShareRow) as ChartRow[]
      : dataByGranularity["daily"];

    // Tampilkan semua platform yang muncul di data (termasuk yang total 0), agar value 0 tetap tampil
    const platformKeysInData = new Set<string>();
    for (const row of sourceRows) {
      for (const k of PLATFORM_KEYS) {
        const v = (row as Record<string, unknown>)[k];
        if (v !== undefined && v !== null) platformKeysInData.add(k);
      }
    }
    const active =
      platformKeysInData.size > 0
        ? PLATFORM_KEYS.filter((k) => platformKeysInData.has(k))
        : [...PLATFORM_KEYS];

    const allDates = sourceRows.map((i) => i.date);
    const aggregated = aggregateShareOfPlatformData(sourceRows, granularity, allDates);
    const converted = convertRowsToPercent(aggregated);
    return { data: converted, activePlatformKeys: active };
  }, [storeData, granularity]);

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
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            interval={granularity === "daily" ? 2 : 0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v.toFixed ? v.toFixed(0) : v}`}
            label={{
              value: 'Share (%)',
              angle: -90,
              position: 'insideLeft',
              offset: -5,
              style: { fontSize: 12, fill: '#475569', fontWeight: 600 },
            }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null;
              const filteredPayload = payload.filter((entry: { dataKey?: string }) =>
                activePlatformKeys.includes(entry.dataKey as typeof PLATFORM_KEYS[number])
              );
              const total = filteredPayload.reduce((sum: number, entry: { value?: number }) => sum + (entry.value || 0), 0);
              const row = payload[0]?.payload as Record<string, number | string> | undefined;
              return (
                <div className="bg-white border-2 border-slate-200 rounded-xl p-3 shadow-xl">
                  <p className="font-semibold text-slate-900 mb-2 text-sm">{label}</p>
                  <div className="space-y-1.5">
                    {filteredPayload.map((entry: { dataKey?: string; value?: number; color?: string }, idx: number) => {
                      const key = entry.dataKey ?? "";
                      const mentionFromRow = row?.[`${key}Mention`];
                      const mention = typeof mentionFromRow === "number" ? mentionFromRow : 0;
                      const pctFromData = row?.[`${key}Pct`];
                      const pct =
                        typeof pctFromData === "string" && pctFromData
                          ? pctFromData
                          : total > 0
                            ? `${((entry.value || 0) / total * 100).toFixed(0)}%`
                            : "0%";
                      return (
                        <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-slate-600">{platformLabels[entry.dataKey ?? ""] ?? entry.dataKey}</span>
                          </div>
                          <span className="font-semibold text-slate-900">
                            Mention: {mention.toLocaleString()} · {pct}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-slate-200 mt-2 pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Total</span>
                    <span className="font-semibold text-slate-900">{total.toLocaleString()}</span>
                  </div>
                </div>
              );
            }}
          />
          <Legend
            content={() => (
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2" style={{ paddingTop: 8 }}>
                {activePlatformKeys.map((key) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span
                      className="inline-block rounded-full"
                      style={{ width: 8, height: 8, backgroundColor: platformColors[key] }}
                    />
                    <span className="text-xs text-slate-700">{platformLabels[key]}</span>
                  </div>
                ))}
              </div>
            )}
          />
          {activePlatformKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="a"
              fill={platformColors[key]}
              radius={i === activePlatformKeys.length - 1 ? [4, 4, 0, 0] : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
