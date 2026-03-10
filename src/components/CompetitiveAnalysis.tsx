import { useMemo } from "react";
import { Trophy, MessageSquare, Mic2, Smile, PieChart, BarChart3, LayoutGrid, Grid3X3 } from "lucide-react";
import { ShareOfPlatform } from "./ShareOfPlatform";
import { ShareOfVoiceChart } from "./ShareOfVoiceChart";
import { CompetitiveMatrixChart } from "./CompetitiveMatrixChart";
import { CompetitiveIssuesMatrixChart } from "./CompetitiveIssuesMatrixChart";
import { CompetitiveHeatmapsView } from "./CompetitiveHeatmapsView";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import type { CompetitorOverviewItem } from "@/lib/dashboard-content-types";

export function CompetitiveAnalysis() {
  const content = useDashboardContent();

  // Default overview jika tidak ada data dari instance
  const defaultCompetitorsOverview: CompetitorOverviewItem[] = [
    {
      id: "co1",
      name: "Your Brand",
      keywords: ["brand", "official", "original"],
      competitivePosition:
        "Market leader with strong innovation and shipping speed, but customer service remains a key vulnerability.",
      conversations: 9800,
      shareOfVoice: 34,
      avgSentiment: 0.72,
      color: "#8b5cf6",
    },
    {
      id: "co2",
      name: "Competitor A",
      keywords: ["competitor a", "rival a", "brand a"],
      competitivePosition:
        "Strong challenger with improving customer service scores and growing share of voice.",
      conversations: 7600,
      shareOfVoice: 26,
      avgSentiment: 0.68,
      color: "#06b6d4",
    },
    {
      id: "co3",
      name: "Competitor B",
      keywords: ["competitor b", "rival b", "brand b"],
      competitivePosition:
        "Niche player excelling in pricing perception, but limited reach in high-volume topics.",
      conversations: 6700,
      shareOfVoice: 23,
      avgSentiment: 0.65,
      color: "#f59e0b",
    },
  ];

  const competitorsOverview: CompetitorOverviewItem[] = useMemo(() => {
    const matrixItems = content?.competitiveMatrixItems ?? [];
    if (!matrixItems.length) return defaultCompetitorsOverview;

    const totalMentions = matrixItems.reduce((sum, item) => sum + item.mentions, 0);

    return matrixItems.map((item, idx) => {
      const fallback = defaultCompetitorsOverview[idx] ?? defaultCompetitorsOverview[0];
      return {
        id: item.id,
        name: item.name,
        keywords: item.keywords ?? fallback.keywords,
        competitivePosition: item.competitivePosition ?? fallback.competitivePosition,
        conversations: item.mentions,
        shareOfVoice:
          totalMentions > 0 ? parseFloat(((item.mentions / totalMentions) * 100).toFixed(1)) : 0,
        avgSentiment: item.positivePercentage / 100,
        color: item.color ?? fallback.color,
        logo: item.logo ?? fallback.logo,
      };
    });
  }, [content?.competitiveMatrixItems]);

  return (
    <section id="competitive-analysis" className="space-y-6">
      {/* Card utama: Competitive Analysis + Competitors Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-900 mb-1">Competitive Analysis</h3>
            <p className="text-sm text-slate-600">
              How you compare to competitors across key issues
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-slate-900 mb-3">Competitors Overview</h4>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {competitorsOverview.map((comp) => {
              const sentimentPct = Math.round((comp.avgSentiment ?? 0) * 100);
              return (
                <div
                  key={comp.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col h-full"
                >
                  {/* Header: logo atau inisial */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-slate-100 border border-slate-200"
                      style={comp.logo ? undefined : { backgroundColor: comp.color ?? "#8b5cf6" }}
                    >
                      {comp.logo ? (
                        <img
                          src={comp.logo}
                          alt={comp.name}
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        <span className="text-white font-bold text-base">
                          {comp.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{comp.name}</p>
                      <p className="text-xs text-slate-500">Competitor</p>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Keywords
                    </p>
                    <div
                      className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto content-start"
                      style={{ scrollbarWidth: "thin" }}
                    >
                      {comp.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 rounded-full text-xs font-medium border"
                          style={{
                            borderColor: comp.color ?? "#8b5cf6",
                            color: comp.color ?? "#8b5cf6",
                            backgroundColor: `${comp.color ?? "#8b5cf6"}18`,
                          }}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Competitive Position */}
                  <div className="flex-1 mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Competitive Position
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {comp.competitivePosition}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                    <div className="flex flex-col items-center gap-1 text-center">
                      <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                        <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">
                        {comp.conversations.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight">Conversations</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center">
                      <div className="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center">
                        <Mic2 className="w-3.5 h-3.5 text-cyan-500" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">{comp.shareOfVoice}%</p>
                      <p className="text-[10px] text-slate-500 leading-tight">Share of Voice</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Smile className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">{sentimentPct}%</p>
                      <p className="text-[10px] text-slate-500 leading-tight">Avg Sentiment</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Competitive Issues Matrix (quadrant: relative sentiment vs relative mentions) */}
      <div
        id="competitive-issues-matrix"
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h4 className="text-slate-900 mb-0.5">Competitive Issues Matrix</h4>
            <p className="text-xs text-slate-600">
              Position relative to competitor median performance
            </p>
          </div>
        </div>
        <CompetitiveIssuesMatrixChart />
      </div>

      {/* Competitive Matrix (bubble) */}
      <div
        id="competitive-matrix"
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h4 className="text-slate-900 mb-0.5">Competitive Matrix</h4>
            <p className="text-xs text-slate-600">Volume vs sentiment across brands</p>
          </div>
        </div>
        <CompetitiveMatrixChart />
      </div>

      {/* Competitive Issues Heatmaps (Sentiment Scores + Volume of Mentions) */}
      <div
        id="competitive-heatmaps"
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
            <Grid3X3 className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h4 className="text-slate-900 mb-0.5">Competitive Issues Heatmaps</h4>
            <p className="text-xs text-slate-600">
              Sentiment scores and volume of mentions by issue and brand
            </p>
          </div>
        </div>
        <CompetitiveHeatmapsView />
      </div>

      {/* Share of Platform (full width) */}
      <div id="share-of-platform" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <PieChart className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h4 className="text-slate-900 mb-0.5">Share of Platform</h4>
            <p className="text-xs text-slate-600">
              Historical number of conversations, broken down by platform
            </p>
          </div>
        </div>
        <ShareOfPlatform />
      </div>

      {/* Share of Voice (full width, stacked bar) */}
      <div id="share-of-voice" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h4 className="text-slate-900 mb-0.5">Share of Voice</h4>
            <p className="text-xs text-slate-600">
              Historical number of conversations, broken down by brand
            </p>
          </div>
        </div>
        <ShareOfVoiceChart />
      </div>
    </section>
  );
}

