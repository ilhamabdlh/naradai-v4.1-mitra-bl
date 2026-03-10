import { CampaignAnalysis } from "./components/campaign/CampaignAnalysis";
import { OutletAnalysis } from "./components/outlet/OutletAnalysis";
import { ActionRecommendations } from "./components/ActionRecommendations";
import { OutletCustomerSatisfaction } from "./components/OutletCustomerSatisfaction";
import { RecentInsights } from "./components/RecentInsights";
import { Header } from "./components/Header";
import { DataControlsBar } from "./components/DataControlsBar";
import { StatsOverview } from "./components/StatsOverview";
import { RisksOpportunities } from "./components/RisksOpportunities";
import { SourceContents } from "./components/SourceContents";
import { CompetitiveAnalysis } from "./components/CompetitiveAnalysis";
import { NavSidebar } from "./components/NavSidebar";
import { CampaignNavSidebar } from "./components/campaign/CampaignNavSidebar";
import { OutletNavSidebar } from "./components/outlet/OutletNavSidebar";
import { ProjectConfig } from "./components/ProjectConfig";
import { LoginPage } from "./components/LoginPage";
import { DataFilterProvider } from "./contexts/DataFilterContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import HoverReceiver from "@/visual-edits/VisualEditsMessenger";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { INSTANCES } from "@/lib/instances";
import { loadDashboardContent } from "@/lib/dashboard-content-store";
import { defaultFeatureVisibility, type FeatureVisibility } from "@/lib/dashboard-content-types";
import { DashboardContentProvider } from "@/contexts/DashboardContentContext";
import { useDataFilter } from "@/contexts/DataFilterContext";
import { useState, useEffect, useMemo, type ReactNode } from "react";
import { initializeSchedulers } from "@/lib/scheduler-service";
import { isAuthenticated, getAllowedInstanceIds } from "@/lib/auth";

const queryClient = new QueryClient();

function LoginGuard() {
  const location = useLocation();
  if (!isAuthenticated()) return <LoginPage />;
  const returnUrl = new URLSearchParams(location.search).get("returnUrl") || "/";
  return <Navigate to={returnUrl} replace />;
}

function AuthGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    const to = "/login?returnUrl=" + encodeURIComponent(location.pathname + location.search);
    return <Navigate to={to} replace />;
  }
  return <>{children}</>;
}

/** Menggabungkan content dengan data campaign yang dipilih (untuk instance yang punya campaigns). */
function getMergedCampaignContent(
  content: ReturnType<typeof loadDashboardContent> | null,
  campaignId: string
): ReturnType<typeof loadDashboardContent> | null {
  if (!content?.campaigns?.length) return content;
  const camp = content.campaigns.find((c) => c.id === campaignId) ?? content.campaigns[0];
  return { ...content, ...camp.data };
}

function CampaignAnalysisWithFilter({
  content,
  children,
}: {
  content: ReturnType<typeof loadDashboardContent> | null;
  children: ReactNode;
}) {
  const { appliedFilter } = useDataFilter();
  const merged = useMemo(
    () => getMergedCampaignContent(content, appliedFilter.projectId),
    [content, appliedFilter.projectId]
  );
  return <DashboardContentProvider content={merged}>{children}</DashboardContentProvider>;
}

function AppContent() {
  const location = useLocation();
  const allowedInstanceIds = useMemo(() => getAllowedInstanceIds(), []);
  const allowedInstances = useMemo(
    () => (allowedInstanceIds.length === 0 ? [] : INSTANCES.filter((i) => allowedInstanceIds.includes(i.id))),
    [allowedInstanceIds]
  );
  const defaultInstanceId = allowedInstances[0]?.id ?? "";

  const [currentPage, setCurrentPage] = useState<"brand-analysis" | "campaign-analysis" | "outlet-analysis" | "source-contents">("brand-analysis");
  const [currentInstanceId, setCurrentInstanceId] = useState<string>(() => {
    const saved = localStorage.getItem("naradai_current_instance");
    if (saved && allowedInstanceIds.includes(saved)) return saved;
    return defaultInstanceId;
  });
  const [featureVisibility, setFeatureVisibility] = useState<FeatureVisibility>(defaultFeatureVisibility);
  const [dashboardContent, setDashboardContent] = useState<ReturnType<typeof loadDashboardContent> | null>(null);

  useEffect(() => {
    if (!allowedInstanceIds.includes(currentInstanceId) && defaultInstanceId) {
      setCurrentInstanceId(defaultInstanceId);
      localStorage.setItem("naradai_current_instance", defaultInstanceId);
    }
  }, [currentInstanceId, defaultInstanceId, allowedInstanceIds]);

  useEffect(() => {
    const content = loadDashboardContent(currentInstanceId);
    if (currentPage === "brand-analysis") {
      setFeatureVisibility(content.featureVisibility ?? defaultFeatureVisibility);
    }
    setDashboardContent(content);
  }, [currentPage, currentInstanceId]);

  // Untuk Mitra Bukalapak, tab Outlet Analysis disembunyikan; jika sedang di outlet, alihkan ke brand-analysis
  useEffect(() => {
    if (currentInstanceId === "mitra_bukalapak_dashboard" && currentPage === "outlet-analysis") {
      setCurrentPage("brand-analysis");
    }
  }, [currentInstanceId, currentPage]);

  const handleInstanceChange = (instanceId: string) => {
    setCurrentInstanceId(instanceId);
    localStorage.setItem("naradai_current_instance", instanceId);
  };

  const isProjectConfig = location.pathname === "/project-config";
  if (isProjectConfig) {
    return (
      <DataFilterProvider initialProjectId={currentInstanceId}>
        <Header currentPage={currentPage} onNavigate={setCurrentPage} instanceId={currentInstanceId} />
        <DataControlsBar />
        <ProjectConfig />
      </DataFilterProvider>
    );
  }

  return (
    <DataFilterProvider initialProjectId={currentInstanceId}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-100/40 via-transparent to-transparent pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-100/40 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <Header currentPage={currentPage} onNavigate={setCurrentPage} instanceId={currentInstanceId} />
          <DataControlsBar
            variant={currentPage === "campaign-analysis" ? "campaign" : "default"}
            campaignList={
              currentPage === "campaign-analysis"
                ? (dashboardContent?.campaigns?.map((c) => ({ id: c.id, name: c.name })) ?? undefined)
                : undefined
            }
          />
          <div className="flex">
            {currentPage === "brand-analysis" && <NavSidebar />}
            {currentPage === "campaign-analysis" && <CampaignNavSidebar />}
            {currentPage === "outlet-analysis" && <OutletNavSidebar />}
            <main className="flex-1 px-6 py-8 max-w-[1200px] mx-auto">
              {currentPage === "brand-analysis" ? (
                <DashboardContentProvider content={dashboardContent}>
                  <div className="flex flex-col gap-12">
                    {featureVisibility.statsOverview && <StatsOverview />}
                    {featureVisibility.actionRecommendations && <ActionRecommendations />}
                    {featureVisibility.outletSatisfaction && <OutletCustomerSatisfaction />}
                    {featureVisibility.risksOpportunities && <RisksOpportunities />}
                    {featureVisibility.competitiveAnalysis && <CompetitiveAnalysis />}
                    {featureVisibility.recentInsights && <RecentInsights />}
                  </div>
                </DashboardContentProvider>
              ) : currentPage === "campaign-analysis" ? (
                <CampaignAnalysisWithFilter content={dashboardContent}>
                  <CampaignAnalysis />
                </CampaignAnalysisWithFilter>
              ) : currentPage === "outlet-analysis" ? (
                <DashboardContentProvider content={dashboardContent}>
                  <OutletAnalysis />
                </DashboardContentProvider>
              ) : (
                <DashboardContentProvider content={dashboardContent}>
                  <SourceContents instanceId={currentInstanceId} />
                </DashboardContentProvider>
              )}
            </main>
          </div>
        </div>
      </div>
    </DataFilterProvider>
  );
}

const App = () => {
  useEffect(() => {
    initializeSchedulers();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <HoverReceiver />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginGuard />} />
            <Route path="*" element={<AuthGuard><AppContent /></AuthGuard>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
