import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Label,
} from "recharts";
import { TrendingUp, Megaphone, HelpCircle, AlertTriangle } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import type { CompetitiveIssueItem } from "@/lib/dashboard-content-types";

type QuadrantCategory = "winning" | "opportunity" | "critical" | "improvement";

/** Garis tengah tetap di 0% — posisi kuadran berdasarkan relatif terhadap nol. */
function getQuadrant(relativeSentiment: number, relativeMentions: number): QuadrantCategory {
  const highSentiment = relativeSentiment >= 0;
  const highMentions = relativeMentions >= 0;
  if (highSentiment && !highMentions) return "winning";
  if (highSentiment && highMentions) return "opportunity";
  if (!highSentiment && highMentions) return "critical";
  return "improvement";
}

const QUADRANT_COLORS: Record<QuadrantCategory, string> = {
  winning: "#10b981",
  opportunity: "#0ea5e9",
  critical: "#ef4444",
  improvement: "#f59e0b",
};

export function CompetitiveIssuesMatrixChart() {
  const content = useDashboardContent();
  const issues = content?.competitiveIssues ?? [];

  const { data, xDomain, yDomain } = useMemo(() => {
    if (!issues.length) return { data: [], xDomain: [-100, 100] as [number, number], yDomain: [-100, 100] as [number, number] };

    const sentiments = issues.map((i) => i.relativeSentiment);
    const mentions = issues.map((i) => i.relativeMentions);

    const data = issues.map((item) => ({
      ...item,
      quadrant: getQuadrant(item.relativeSentiment, item.relativeMentions),
      color: QUADRANT_COLORS[getQuadrant(item.relativeSentiment, item.relativeMentions)],
    }));

    const pad = 25;
    const xAbs = Math.max(100, ...mentions.map(Math.abs));
    const yAbs = Math.max(100, ...sentiments.map(Math.abs));
    const xRange = Math.max(xAbs + pad, 120);
    const yRange = Math.max(yAbs + pad, 120);

    return {
      data,
      xDomain: [-xRange, xRange] as [number, number],
      yDomain: [-yRange, yRange] as [number, number],
    };
  }, [issues]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: CompetitiveIssueItem & { quadrant: QuadrantCategory; color: string } }> }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
      <div className="bg-white rounded-xl border-2 border-slate-200 p-4 shadow-xl">
        <p className="font-semibold text-slate-900 mb-2">{p.issue}</p>
        <div className="space-y-1 text-sm text-slate-600">
          <p>Relative Sentiment: <span className="font-medium text-slate-900">{p.relativeSentiment.toFixed(1)}%</span></p>
          <p>Relative Mentions: <span className="font-medium text-slate-900">{p.relativeMentions.toFixed(1)}%</span></p>
          <p>Category: <span className="font-medium capitalize text-slate-900">{p.quadrant.replace("_", " ")}</span></p>
        </div>
      </div>
    );
  };

  if (!issues.length) {
    return (
      <div className="flex items-center justify-center h-[360px] text-sm text-slate-500 rounded-xl border border-dashed border-slate-200">
        No competitive issues data for this instance.
      </div>
    );
  }

  const quadrantBoxes = [
    {
      id: "winning" as const,
      title: "Winning Position",
      desc: "High sentiment, Low mentions",
      color: QUADRANT_COLORS.winning,
      Icon: TrendingUp,
      position: "top-left",
    },
    {
      id: "opportunity" as const,
      title: "Amplify Opportunity",
      desc: "High sentiment, High mentions",
      color: QUADRANT_COLORS.opportunity,
      Icon: Megaphone,
      position: "top-right",
    },
    {
      id: "improvement" as const,
      title: "Room for Improvement",
      desc: "Low sentiment, Low mentions",
      color: QUADRANT_COLORS.improvement,
      Icon: HelpCircle,
      position: "bottom-left",
    },
    {
      id: "critical" as const,
      title: "Critical Issue",
      desc: "Low sentiment, High mentions",
      color: QUADRANT_COLORS.critical,
      Icon: AlertTriangle,
      position: "bottom-right",
    },
  ];

  return (
    <div>
      <div className="relative w-full" style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 16, right: 16, bottom: 28, left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              dataKey="relativeMentions"
              name="Relative Mentions"
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              domain={xDomain}
              tickFormatter={(v) => `${v}%`}
            >
              <Label value="Relative Mentions Volume (%)" position="bottom" offset={0} style={{ fill: "#64748b", fontSize: 12 }} />
            </XAxis>
            <YAxis
              type="number"
              dataKey="relativeSentiment"
              name="Relative Sentiment"
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              domain={yDomain}
              tickFormatter={(v) => `${v}%`}
            >
              <Label value="Relative Sentiment (%)" angle={-90} position="insideLeft" offset={-5} style={{ fill: "#64748b", fontSize: 12 }} />
            </YAxis>
            <ReferenceLine x={0} stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" />
            <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "#94a3b8" }} />
            <Scatter data={data} name="Issues">
              {data.map((entry) => (
                <Cell key={entry.id} fill={entry.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        {/* Quadrant callout boxes — posisi tetap di empat penjuru */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-2 grid-rows-2" style={{ padding: "24px 8px 36px 8px" }}>
          {quadrantBoxes.map((q) => {
            const pos = q.position;
            const isTop = pos.startsWith("top");
            const isLeft = pos.endsWith("left");
            return (
              <div
                key={q.id}
                className={`flex ${isLeft ? "justify-start" : "justify-end"} ${isTop ? "items-start" : "items-end"}`}
              >
                <div
                  className="flex flex-col gap-1 max-w-[180px] rounded-xl border-2 p-3 bg-white/95 shadow-sm"
                  style={{ borderColor: q.color }}
                >
                  <div className="flex items-center gap-2">
                    <q.Icon className="w-4 h-4 flex-shrink-0" style={{ color: q.color }} />
                    <span className="text-xs font-bold text-slate-900">{q.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">{q.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {data.map((d) => (
          <span
            key={d.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border"
            style={{ borderColor: d.color, color: d.color, backgroundColor: `${d.color}18` }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.issue}
          </span>
        ))}
      </div>
    </div>
  );
}
