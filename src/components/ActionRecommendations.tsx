import { AlertTriangle, Target, MessageSquare, Package, Zap, TrendingUp, TrendingDown, Minus, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { ActionDetailsModal } from "./ActionDetailsModal";
import { Share2, CheckCircle, Clock, Circle } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import { useDataFilter } from "@/contexts/DataFilterContext";
import useEmblaCarousel from "embla-carousel-react";

const categoryTooltips: Record<string, string> = {
  "Critical Issue": "Sentiment is relatively worse than competitors with mentions volume relatively higher — requires urgent attention.",
  "Opportunity": "Sentiment is relatively better than competitors with mentions volume relatively higher — leverage this strength.",
  "Watch": "Sentiment is relatively worse than competitors with mentions volume relatively lower — monitor closely.",
  "Strength": "Sentiment is relatively better than competitors with mentions volume relatively lower — a quiet advantage.",
};

const priorityIconMap = { critical: AlertTriangle, high: MessageSquare, medium: Zap } as const;

const ACTION_STATUS_KEY_PREFIX = "naradai_action_statuses_";

export function ActionRecommendations() {
  const content = useDashboardContent();
  const { appliedFilter } = useDataFilter();
  const storageKey = `${ACTION_STATUS_KEY_PREFIX}${appliedFilter.projectId}`;

  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [actionStatuses, setActionStatuses] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      return {};
    }
  });
  const [showShareMenu, setShowShareMenu] = useState<string | null>(null);
  const [openCategoryTooltip, setOpenCategoryTooltip] = useState<string | null>(null);
  const [openMetricTooltip, setOpenMetricTooltip] = useState<string | null>(null);

  const actions = useMemo(() => {
    const list = content?.priorityActions ?? [];
    return list.map((item) => ({
      ...item,
      icon: priorityIconMap[item.priority] ?? Package,
      relatedIssues: Array.isArray(item.relatedIssues) ? item.relatedIssues : [],
      metrics: item.metrics ?? { mentions: 0, sentiment: 0, trend: "stable" as const },
    }));
  }, [content?.priorityActions]);

  const priorityColors = {
    critical: "from-red-500 to-orange-500",
    high: "from-orange-500 to-amber-500",
    medium: "from-amber-500 to-yellow-500",
  };

  const impactBgColors = {
    Critical: "bg-slate-900 border-slate-700",
    High: "bg-red-100 border-red-300",
    Medium: "bg-orange-100 border-orange-300",
    Low: "bg-emerald-100 border-emerald-300",
  };

  const impactTextColors = {
    Critical: "text-white",
    High: "text-slate-900",
    Medium: "text-slate-900",
    Low: "text-slate-900",
  };

  const impactLabelColors = {
    Critical: "text-slate-300",
    High: "text-slate-600",
    Medium: "text-slate-600",
    Low: "text-slate-600",
  };

  const impactColors = {
    Critical: "bg-slate-800 text-white border-slate-700",
    High: "bg-red-200 text-red-900 border-red-400",
    Medium: "bg-orange-200 text-orange-900 border-orange-400",
    Low: "bg-emerald-200 text-emerald-900 border-emerald-400",
  };

  const effortColors = {
    High: "bg-red-100 text-red-700 border-red-300",
    Medium: "bg-amber-100 text-amber-700 border-amber-300",
    Low: "bg-emerald-100 text-emerald-700 border-emerald-300",
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case "decreasing":
        return <TrendingDown className="w-4 h-4 text-emerald-600" />;
      case "stable":
        return <Minus className="w-4 h-4 text-slate-600" />;
      default:
        return <Minus className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleStatusChange = (actionId: string, status: string) => {
    setActionStatuses((prev) => {
      const next = { ...prev, [actionId]: status };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  // Reload statuses jika instance (projectId) berubah
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setActionStatuses(raw ? (JSON.parse(raw) as Record<string, string>) : {});
    } catch {
      setActionStatuses({});
    }
  }, [storageKey]);

  const handleShare = (actionId: string, method: string) => {
    const action = actions.find((a) => a.id === actionId);
    if (!action) return;

    const shareText = `Priority Action: ${action.title}\n\n${action.description}\n\nRecommendation: ${action.recommendation}`;
    
    if (method === "copy") {
      navigator.clipboard.writeText(shareText);
      setShowShareMenu(null);
    } else if (method === "email") {
      window.location.href = `mailto:?subject=${encodeURIComponent(action.title)}&body=${encodeURIComponent(shareText)}`;
      setShowShareMenu(null);
    }
  };

  const getStatusBadge = (actionId: string) => {
    const status = actionStatuses[actionId] || "not-started";
    const statusConfig = {
      "not-started": { icon: Circle, label: "Not Started", color: "bg-slate-100 text-slate-600 border-slate-300" },
      "in-progress": { icon: Clock, label: "In Progress", color: "bg-amber-100 text-amber-700 border-amber-300" },
      "completed": { icon: CheckCircle, label: "Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const StatusIcon = config.icon;
    
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${config.color}`}>
        <StatusIcon className="w-3.5 h-3.5" />
        {config.label}
      </div>
    );
  };

  // Quadrant color mapping
  const quadrantColors = {
    red: {
      border: "border-red-500",
      bg: "bg-red-50",
      categoryBg: "bg-red-100",
      categoryText: "text-red-700",
      categoryBorder: "border-red-300",
      topBar: "from-red-500 to-orange-500",
      iconBg: "from-red-500 to-red-600",
      issueBg: "bg-red-100",
      issueText: "text-red-700",
      issueBorder: "border-red-200",
    },
    cyan: {
      border: "border-cyan-500",
      bg: "bg-cyan-50",
      categoryBg: "bg-cyan-100",
      categoryText: "text-cyan-700",
      categoryBorder: "border-cyan-300",
      topBar: "from-cyan-500 to-blue-500",
      iconBg: "from-cyan-500 to-cyan-600",
      issueBg: "bg-cyan-100",
      issueText: "text-cyan-700",
      issueBorder: "border-cyan-200",
    },
    emerald: {
      border: "border-emerald-500",
      bg: "bg-emerald-50",
      categoryBg: "bg-emerald-100",
      categoryText: "text-emerald-700",
      categoryBorder: "border-emerald-300",
      topBar: "from-emerald-500 to-green-500",
      iconBg: "from-emerald-500 to-emerald-600",
      issueBg: "bg-emerald-100",
      issueText: "text-emerald-700",
      issueBorder: "border-emerald-200",
    },
    amber: {
      border: "border-amber-500",
      bg: "bg-amber-50",
      categoryBg: "bg-amber-100",
      categoryText: "text-amber-700",
      categoryBorder: "border-amber-300",
      topBar: "from-amber-500 to-yellow-500",
      iconBg: "from-amber-500 to-amber-600",
      issueBg: "bg-amber-100",
      issueText: "text-amber-700",
      issueBorder: "border-amber-200",
    },
  };

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 1024px)": { slidesToScroll: 1 },
    },
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section id="priority-actions">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-slate-900">Priority Actions</h2>
            <p className="text-sm text-slate-600">AI-recommended actions based on urgent issues</p>
          </div>
        </div>
        {actions.length > 3 && (
          <div className="flex items-center gap-2">
            <button
              onClick={scrollPrev}
              disabled={prevBtnDisabled}
              className={`p-2 rounded-lg border transition-all ${
                prevBtnDisabled
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-violet-300"
              }`}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              disabled={nextBtnDisabled}
              className={`p-2 rounded-lg border transition-all ${
                nextBtnDisabled
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-violet-300"
              }`}
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {actions.map((action) => {
          const Icon = action.icon;
          // Map quadrantColor ke color scheme dengan fallback default
          let colorScheme = quadrantColors[action.quadrantColor as keyof typeof quadrantColors];
          
          // Jika quadrantColor tidak ditemukan, gunakan default berdasarkan priority
          if (!colorScheme) {
            // Map warna hex atau nama warna ke color scheme yang ada
            const colorMap: Record<string, keyof typeof quadrantColors> = {
              "#FFA500": "amber", // Orange
              "#FFD700": "amber", // Gold
              "#32CD32": "emerald", // Lime Green
              red: "red",
              cyan: "cyan",
              emerald: "emerald",
              amber: "amber",
            };
            
            const mappedColor = colorMap[action.quadrantColor] || 
                              (action.priority === "critical" ? "red" : 
                               action.priority === "high" ? "amber" : "cyan");
            
            colorScheme = quadrantColors[mappedColor] || quadrantColors.red;
          }
          
          return (
            <div
              key={action.id}
              className={`flex-[0_0_100%] lg:flex-[0_0_calc(50%-12px)] xl:flex-[0_0_calc(33.333%-16px)] min-w-0 relative overflow-hidden rounded-3xl backdrop-blur-sm border-2 transition-all duration-300 group hover:scale-[1.01] hover:shadow-2xl ${colorScheme.bg} ${colorScheme.border}`}
              style={{ maxWidth: "100%" }}
            >
              {/* Priority indicator with glow */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorScheme.topBar} shadow-lg`} />
              
              <div className="p-6 flex flex-col h-full">
                {/* ── FIXED TOP: Category + Icon/Impact/Status ── */}
                <div>
                  {/* Quadrant Category Badge */}
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-1.5">
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${colorScheme.categoryBg} ${colorScheme.categoryText} ${colorScheme.categoryBorder}`}>
                        <Target className="w-3.5 h-3.5 mr-1.5" />
                        {action.category}
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenCategoryTooltip(openCategoryTooltip === action.id ? null : action.id)}
                        onMouseEnter={() => setOpenCategoryTooltip(action.id)}
                        onMouseLeave={() => setOpenCategoryTooltip(null)}
                        className="text-slate-400 hover:text-violet-500 transition-colors"
                        aria-label={`Info about ${action.category}`}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {openCategoryTooltip === action.id && categoryTooltips[action.category] && (
                      <div className="mt-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-xs leading-relaxed shadow-lg">
                        {categoryTooltips[action.category]}
                      </div>
                    )}
                  </div>

                  {/* Header: Icon, Impact/Effort, Status */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 bg-gradient-to-br flex-shrink-0 ${colorScheme.iconBg}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${impactColors[action.impact as keyof typeof impactColors]}`}>
                          {action.impact} Impact
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${effortColors[action.effort as keyof typeof effortColors]}`}>
                          {action.effort} Effort
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        {getStatusBadge(action.id)}
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowShareMenu(showShareMenu === action.id ? null : action.id); }}
                            className="p-1.5 rounded-lg transition-all hover:bg-white/60"
                            title="Share action"
                          >
                            <Share2 className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                          {showShareMenu === action.id && (
                            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-10 min-w-[140px]">
                              <button onClick={() => handleShare(action.id, "copy")} className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors text-slate-700">Copy link</button>
                              <button onClick={() => handleShare(action.id, "email")} className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors text-slate-700 border-t border-slate-100">Send via email</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── FLEX-1 MIDDLE: Title + Description + Related Issues ── */}
                <div className="flex-1 flex flex-col">
                  {/* Title */}
                  <h3 className="mb-3 leading-snug text-slate-900">{action.title}</h3>

                  {/* Description — flex-1 agar mendorong related issues ke posisi sama */}
                  <p className="text-sm leading-relaxed mb-4 text-slate-600 flex-1">
                    {action.description}
                  </p>

                  {/* Related Issues */}
                  <div className="mb-6">
                    <div className="flex items-center gap-1.5 mb-2">
                      <p className="text-xs font-semibold text-slate-700">Related Issues:</p>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenMetricTooltip(openMetricTooltip === `${action.id}-issues` ? null : `${action.id}-issues`)}
                          onMouseEnter={() => setOpenMetricTooltip(`${action.id}-issues`)}
                          onMouseLeave={() => setOpenMetricTooltip(null)}
                          className="text-slate-400 hover:text-violet-500 transition-colors"
                          aria-label="Info about related issues"
                        >
                          <Info className="w-3 h-3" />
                        </button>
                        {openMetricTooltip === `${action.id}-issues` && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 rounded-lg bg-slate-800 text-white text-xs leading-relaxed shadow-lg z-10 pointer-events-none">
                            Related issues are topics or themes connected to this priority action.
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[28px]">
                      {action.relatedIssues.map((issue: string, idx: number) => (
                        <span key={idx} className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${colorScheme.issueBg} ${colorScheme.issueText} ${colorScheme.issueBorder}`}>
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── FIXED BOTTOM: Divider + Metrics + Recommendation + CTA ── */}
                <div>
                  {/* Divider */}
                  <div className="h-px mb-4 bg-slate-200" />

                  {/* Metrics */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      {getTrendIcon(action.metrics.trend)}
                      <span className="text-xs font-medium text-slate-900">{action.metrics.mentions.toLocaleString()} mentions</span>
                      <button
                        type="button"
                        onMouseEnter={() => setOpenMetricTooltip(`${action.id}-mentions`)}
                        onMouseLeave={() => setOpenMetricTooltip(null)}
                        className="text-slate-400 hover:text-violet-500 transition-colors"
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${typeof action.metrics.sentiment === "string" ? /negative/i.test(action.metrics.sentiment) ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700" : action.metrics.sentiment < 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {typeof action.metrics.sentiment === "string" ? action.metrics.sentiment : (action.metrics.sentiment > 0 ? "+" : "") + (action.metrics.sentiment as number).toFixed(2)} sentiment
                      </div>
                      <button
                        type="button"
                        onMouseEnter={() => setOpenMetricTooltip(`${action.id}-sentiment`)}
                        onMouseLeave={() => setOpenMetricTooltip(null)}
                        className="text-slate-400 hover:text-violet-500 transition-colors"
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {openMetricTooltip === `${action.id}-mentions` && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-slate-800 text-white text-xs leading-relaxed shadow-lg">
                      The number of conversations related to your brand that constitute this issue.
                    </div>
                  )}
                  {openMetricTooltip === `${action.id}-sentiment` && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-slate-800 text-white text-xs leading-relaxed shadow-lg">
                      The average sentiment of conversations related to your brand that constitute this issue.
                    </div>
                  )}
                  {!openMetricTooltip?.startsWith(`${action.id}-`) && <div className="mb-3" />}

                  {/* Recommendation */}
                  <div className="rounded-xl p-4 mb-5 bg-white/60 border border-slate-200">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-violet-600" />
                      <p className="text-xs leading-relaxed text-slate-700">{action.recommendation}</p>
                    </div>
                  </div>

                  {/* CTA button */}
                  <button
                    onClick={() => setSelectedAction(action)}
                    className={`w-full py-3 rounded-xl text-white transition-all duration-300 shadow-md hover:shadow-lg font-medium text-sm bg-gradient-to-r ${colorScheme.topBar} hover:opacity-90`}
                  >
                    View Details & Source Contents
                  </button>
                </div>
              </div>
            </div>
          );
        })}
          </div>
        </div>
      </div>

      {selectedAction && (
        <ActionDetailsModal
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onStatusChange={handleStatusChange}
          currentStatus={actionStatuses[selectedAction.id] || "not-started"}
        />
      )}
    </section>
  );
}