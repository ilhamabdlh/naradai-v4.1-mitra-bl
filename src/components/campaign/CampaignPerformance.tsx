import { Target } from "lucide-react";
import { Heart, Share2, MessageCircle } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import { defaultDashboardContent } from "@/lib/dashboard-content-store";

const statusColors: Record<string, string> = {
  active:    "bg-emerald-100 text-emerald-700",
  completed: "bg-slate-100 text-slate-600",
  paused:    "bg-amber-100 text-amber-700",
};

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
}

export function CampaignPerformance() {
  const content = useDashboardContent();
  const campaigns = content?.campaignPerformance ?? defaultDashboardContent.campaignPerformance ?? [];

  return (
    <div id="campaign-performance" className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
          <Target className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Campaign Performance</h2>
          <p className="text-sm text-slate-500">Likes, shares, replies and sentiment per campaign</p>
        </div>
      </div>
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform</th>
              <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span className="inline-flex items-center gap-1"><Heart className="w-3 h-3 text-rose-400" />Likes</span>
              </th>
              <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span className="inline-flex items-center gap-1"><Share2 className="w-3 h-3 text-violet-400" />Shares</span>
              </th>
              <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span className="inline-flex items-center gap-1"><MessageCircle className="w-3 h-3 text-cyan-400" />Replies</span>
              </th>
              <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sentiment</th>
              <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4 font-medium text-slate-800">{c.name}</td>
                <td className="px-4 py-4 text-slate-600">{c.platform}</td>
                <td className="px-4 py-4 text-right text-rose-600 font-medium">{fmt(c.likes)}</td>
                <td className="px-4 py-4 text-right text-violet-600 font-medium">{fmt(c.shares)}</td>
                <td className="px-4 py-4 text-right text-cyan-600 font-medium">{fmt(c.replies)}</td>
                <td className="px-4 py-4 text-right">
                  {(() => {
                    // Normalise: stored value may be 0–1 (decimal) or 0–100 (percent)
                    const sentDecimal = c.sentiment > 1 ? c.sentiment / 100 : c.sentiment;
                    return (
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
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
                <td className="px-4 py-4 text-center">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
