import { AlertTriangle, ShieldAlert, Sparkles } from "lucide-react";
import { RiskCard } from "./RiskCard";
import { OpportunityCard } from "./OpportunityCard";
import { useDashboardContent } from "@/contexts/DashboardContentContext";

export function RisksOpportunities() {
  const content = useDashboardContent();
  const risks = (content?.risks ?? []).map((r) => ({
    ...r,
    id: r.id,
    metrics: r.metrics ?? {},
    indicators: r.indicators ?? [],
  }));
  const opportunities = content?.opportunities ?? [];

  return (
    <section id="risks-opportunities">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="w-6 h-6 text-violet-600" />
        <div>
          <h2 className="text-slate-900">Risks & Opportunities</h2>
          <p className="text-sm text-slate-600">AI-detected threats and growth opportunities from social intelligence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Risks Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-slate-900">Risks</h3>
            <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs">
              {risks.length} Active
            </span>
          </div>
          <div className="space-y-4">
            {risks.map((risk) => (
              <RiskCard key={risk.id} risk={risk} />
            ))}
          </div>
        </div>

        {/* Opportunities Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="text-slate-900">Opportunities</h3>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
              {opportunities.length} Identified
            </span>
          </div>
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
