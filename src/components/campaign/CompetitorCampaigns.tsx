import { BarChart3 } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import { defaultDashboardContent } from "@/lib/dashboard-content-store";

type MetricKey = "posts" | "likes" | "replies" | "shares";
const metricKeys: MetricKey[] = ["posts", "likes", "replies", "shares"];

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
}

function intensity(value: number, min: number, max: number) {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

function heatColor(t: number): string {
  const r = Math.round(241 + (124 - 241) * t);
  const g = Math.round(245 + (58  - 245) * t);
  const b = Math.round(249 + (237 - 249) * t);
  return `rgb(${r},${g},${b})`;
}

function textColor(t: number): string {
  return t > 0.55 ? "#ffffff" : "#1e293b";
}

export function CompetitorCampaigns() {
  const content = useDashboardContent();
  const competitors = content?.campaignCompetitors ?? defaultDashboardContent.campaignCompetitors ?? [];

  const scales = {} as Record<MetricKey, { min: number; max: number }>;
  for (const key of metricKeys) {
    const vals = competitors.map((r) => r[key] as number);
    scales[key] = { min: Math.min(...vals), max: Math.max(...vals) };
  }

  return (
    <div id="competitor-campaigns" className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Competitor Campaigns</h2>
          <p className="text-sm text-slate-500">Heatmap scaled per column — darker cells rank higher within that metric</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Posts</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Likes</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Replies</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Shares</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sentiment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {competitors.map((c, i) => (
              <tr key={c.id} className="hover:brightness-95 transition-all">
                <td className={`px-5 py-3.5 ${i === 0 ? "bg-violet-50/60" : ""}`}>
                  <div className="flex items-center gap-2">
                    {i === 0 && (
                      <span className="text-xs font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">You</span>
                    )}
                    <span className={`font-medium ${i === 0 ? "text-violet-800" : "text-slate-700"}`}>
                      {c.brand}
                    </span>
                  </div>
                </td>
                {metricKeys.map((key) => {
                  const t = intensity(c[key] as number, scales[key].min, scales[key].max);
                  const bg = heatColor(t);
                  const fg = textColor(t);
                  return (
                    <td key={key} className="px-4 py-2 text-center">
                      <span
                        className="inline-block rounded-lg px-3 py-1.5 text-xs font-semibold tabular-nums min-w-[60px]"
                        style={{ backgroundColor: bg, color: fg }}
                      >
                        {fmt(c[key] as number)}
                      </span>
                    </td>
                  );
                })}
                <td className="px-5 py-3.5 text-right">
                  {(() => {
                    // Normalise: stored value may be 0–1 (decimal) or 0–100 (percent)
                    const sentDecimal = c.sentiment > 1 ? c.sentiment / 100 : c.sentiment;
                    return (
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${sentDecimal >= 0.7 ? "bg-emerald-400" : sentDecimal >= 0.5 ? "bg-amber-400" : "bg-red-400"}`}
                            style={{ width: `${sentDecimal * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{(sentDecimal * 100).toFixed(1)}%</span>
                      </div>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Scale per column:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Low</span>
            <div className="h-2.5 w-28 rounded-full" style={{ background: `linear-gradient(to right, ${heatColor(0)}, ${heatColor(1)})` }} />
            <span className="text-xs text-slate-400">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
