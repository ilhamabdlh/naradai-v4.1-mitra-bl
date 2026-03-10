import { useEffect } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { INSTANCES } from "@/lib/instances";
import {
  useDataFilter,
  TIME_HORIZON_OPTIONS,
  type TimeHorizon,
} from "@/contexts/DataFilterContext";

const CAMPAIGNS = [
  { id: "brand_core_ig",        name: "Brand Core - Bening's IG"       },
  { id: "brand_core_tiktok",    name: "Brand Core - Bening's TikTok"   },
  { id: "brand_issue_twitter",  name: "Bening's Brand & Issue"         },
  { id: "outlet_review_gmaps",  name: "Outlet Review & Sentiment"      },
];

interface DataControlsBarProps {
  variant?: "default" | "campaign";
  /** Daftar campaign dari instance (untuk filter Campaign Analysis). Jika ada, dropdown menampilkan ini. */
  campaignList?: { id: string; name: string }[];
}

export function DataControlsBar({ variant = "default", campaignList }: DataControlsBarProps) {
  const {
    pendingFilter,
    appliedFilter,
    setPendingProject,
    setPendingTimeHorizon,
    applyFilter,
    isDirty,
  } = useDataFilter();

  const options = (variant === "campaign" && campaignList?.length) ? campaignList : CAMPAIGNS;
  const valueInOptions = options.some((o) => o.id === pendingFilter.projectId);
  const displayValue = valueInOptions ? pendingFilter.projectId : (options[0]?.id ?? "");

  useEffect(() => {
    if (variant === "campaign" && campaignList?.length && !campaignList.some((c) => c.id === appliedFilter.projectId)) {
      setPendingProject(campaignList[0].id);
      applyFilter();
    }
  }, [variant, campaignList, appliedFilter.projectId, setPendingProject, applyFilter]);

  return (
    <div className="sticky top-[73px] z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </div>

          <div className="w-px h-4 bg-slate-200" />

          {variant === "campaign" ? (
            /* ── Campaign dropdown ── */
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 shrink-0">Campaign</label>
              <div className="relative min-w-[260px]">
                <select
                  value={displayValue}
                  onChange={(e) => setPendingProject(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-8 text-sm font-medium text-slate-800 cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors"
                >
                  {options.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          ) : (
            /* ── Default: Project + Period dropdowns ── */
            <>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 shrink-0">Project</label>
                <div className="relative min-w-[160px]">
                  <select
                    value={pendingFilter.projectId}
                    onChange={(e) => setPendingProject(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-8 text-sm font-medium text-slate-800 cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors"
                  >
                    {INSTANCES.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 shrink-0">Period</label>
                <div className="relative">
                  <select
                    value={pendingFilter.timeHorizon}
                    onChange={(e) =>
                      setPendingTimeHorizon(e.target.value as TimeHorizon)
                    }
                    className="appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-8 text-sm font-medium text-slate-800 cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors"
                  >
                    {TIME_HORIZON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </>
          )}

          {/* Apply button */}
          <button
            onClick={applyFilter}
            disabled={!isDirty}
            className={`ml-1 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isDirty
                ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-sm hover:opacity-90 active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            Apply
          </button>

          {!isDirty && (
            <span className="text-xs text-slate-400 italic">
              Filters applied
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
