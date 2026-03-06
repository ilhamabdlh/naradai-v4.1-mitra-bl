import { MessageCircle, ThumbsUp, ThumbsDown, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import { defaultDashboardContent } from "@/lib/dashboard-content-store";

function SentimentBar({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }) {
  return (
    <div className="flex h-2 rounded-full overflow-hidden w-full">
      <div className="bg-emerald-400 transition-all" style={{ width: `${positive}%` }} />
      <div className="bg-slate-300 transition-all" style={{ width: `${neutral}%` }} />
      <div className="bg-red-400 transition-all" style={{ width: `${negative}%` }} />
    </div>
  );
}

export function ReplySentiment() {
  const content = useDashboardContent();
  const overall = content?.campaignReplySentiment ?? defaultDashboardContent.campaignReplySentiment ?? { positive: 74, neutral: 16, negative: 10 };
  const topicClusters = content?.campaignReplyTopics ?? defaultDashboardContent.campaignReplyTopics ?? [];

  const [expanded, setExpanded] = useState<string | null>(null);
  const totalReplies = topicClusters.reduce((s, t) => s + t.totalReplies, 0);

  const sentimentBreakdown = [
    { label: "Positive", pct: overall.positive, color: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50", icon: ThumbsUp },
    { label: "Neutral",  pct: overall.neutral,  color: "bg-slate-300",   text: "text-slate-600",   bg: "bg-slate-50",   icon: Minus },
    { label: "Negative", pct: overall.negative, color: "bg-red-400",     text: "text-red-600",     bg: "bg-red-50",     icon: ThumbsDown },
  ];

  return (
    <div id="reply-sentiment" className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-md">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reply Sentiment & Topics</h2>
          <p className="text-sm text-slate-500">What audiences are saying — broken down by sentiment and topic</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Overall Reply Sentiment</h3>
          <span className="text-xs text-slate-500">{totalReplies.toLocaleString()} total replies</span>
        </div>
        <div className="flex h-5 rounded-xl overflow-hidden gap-0.5">
          {sentimentBreakdown.map((s) => (
            <div
              key={s.label}
              className={`${s.color} flex items-center justify-center transition-all`}
              style={{ width: `${s.pct}%` }}
            >
              <span className="text-white text-xs font-bold">{s.pct}%</span>
            </div>
          ))}
        </div>
        <div className="flex gap-6">
          {sentimentBreakdown.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${s.bg}`}>
                <Icon className={`w-4 h-4 ${s.text}`} />
                <span className={`text-sm font-semibold ${s.text}`}>{s.pct}%</span>
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Reply Topics</h3>
          <p className="text-xs text-slate-500 mt-0.5">Topics extracted from replies — click to see example comments</p>
        </div>
        <div className="divide-y divide-slate-100">
          {topicClusters.map((t) => {
            const isOpen = expanded === t.id;
            const sharePct = totalReplies > 0 ? Math.round((t.totalReplies / totalReplies) * 100) : 0;

            // Normalise to within-topic percentages (stored values may be % of grand total)
            const rawSum = t.positive + t.neutral + t.negative;
            const posWithin  = rawSum > 0 ? Math.round((t.positive / rawSum) * 100) : 0;
            const neuWithin  = rawSum > 0 ? Math.round((t.neutral  / rawSum) * 100) : 0;
            const negWithin  = 100 - posWithin - neuWithin;

            return (
              <div key={t.id}>
                <button
                  onClick={() => setExpanded(isOpen ? null : t.id)}
                  className="w-full px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-800">{t.topic}</span>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{t.totalReplies.toLocaleString()} replies · {sharePct}% of total</span>
                          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <SentimentBar positive={posWithin} neutral={neuWithin} negative={negWithin} />
                      <div className="flex gap-4 mt-1.5 text-xs">
                        <span className="text-emerald-600 font-medium">{posWithin}% pos</span>
                        <span className="text-slate-400">{neuWithin}% neutral</span>
                        <span className="text-red-500 font-medium">{negWithin}% neg</span>
                      </div>
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 space-y-2 bg-slate-50/60">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sample replies</p>
                    {t.topComments.map((comment, i) => (
                      <div key={i} className="flex items-start gap-2 bg-white rounded-xl px-3 py-2.5 border border-slate-100 text-sm text-slate-700">
                        <MessageCircle className="w-3.5 h-3.5 mt-0.5 text-slate-300 shrink-0" />
                        {comment}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
