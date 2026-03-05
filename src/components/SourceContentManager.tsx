import { useState, useEffect, useRef } from "react";
import {
  Database,
  BarChart3,
  Target,
  MapPin,
  ShieldAlert,
  Lightbulb,
  Swords,
  Plus,
  Pencil,
  Trash2,
  Save,
  RotateCcw,
  ChevronDown,
  Sparkles,
  TrendingUp,
  MessageCircle,
  Hash,
  FileText,
  UserCheck,
  Contact,
  LineChart,
  Users,
  Eye,
  EyeOff,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  loadDashboardContent,
  saveDashboardContent,
  defaultDashboardContent,
  generateId,
  clearAllDashboardContent,
} from "@/lib/dashboard-content-store";
import { getInitialDashboardContentForInstance } from "@/lib/initial-data";
import type {
  DashboardContentStore,
  StatItem,
  PriorityActionItem,
  OutletItem,
  RiskItem,
  OpportunityItem,
  CompetitiveIssueItem,
  SourceContentPost,
  KeyInsightItem,
  SentimentTrendItem,
  TopTopicItem,
  WordCloudItem,
  KeyEventItem,
  AITopicAnalysisItem,
  TopicTrendsOverTimeRow,
  AITrendAnalysisItem,
  ConversationClusterItem,
  TopHashtagItem,
  TopAccountItem,
  TopContentItem,
  KOLMatrixItem,
  AIKOLAnalysisItem,
  ShareOfPlatformRow,
  CompetitiveMatrixItem,
  QuadrantAnalysisItem,
  CompetitiveHeatmapRow,
  ShareOfVoiceRow,
  CompetitiveBrandLabels,
  FeatureVisibilityKey,
  FeatureVisibility,
  CampaignStatItem,
  CampaignItem,
  CampaignRecommendationItem,
  CampaignCompetitorItem,
  CampaignChannelItem,
  CampaignReplyTopicCluster,
  CampaignKeyEvent,
  CampaignPostPublishEvent,
  OutletStatItem,
  OutletPriorityActionItem,
  OutletMapDataItem,
  OutletTopicItem,
  OutletRecentReviewItem,
  OutletSentimentByOutletItem,
} from "@/lib/dashboard-content-types";
import { defaultFeatureVisibility } from "@/lib/dashboard-content-types";

type ParentTab = "brand" | "campaign" | "outlet-analysis";

type BrandSectionId =
  | "stats"
  | "actions"
  | "outlets"
  | "risks"
  | "opportunities"
  | "competitive"
  | "whats-happening";

type SectionId = BrandSectionId | "campaign" | "outlet-analysis";

const PARENT_TABS: { id: ParentTab; label: string; icon: typeof BarChart3 }[] = [
  { id: "brand",           label: "Brand Analysis",    icon: BarChart3 },
  { id: "campaign",        label: "Campaign Analysis", icon: LineChart },
  { id: "outlet-analysis", label: "Outlet Analysis",   icon: Contact },
];

const BRAND_SECTIONS: { id: BrandSectionId; label: string; icon: typeof BarChart3 }[] = [
  { id: "stats",           label: "Stats Overview",     icon: BarChart3 },
  { id: "actions",         label: "Priority Actions",   icon: Target },
  { id: "outlets",         label: "Outlet Satisfaction",icon: MapPin },
  { id: "risks",           label: "Risks",              icon: ShieldAlert },
  { id: "opportunities",   label: "Opportunities",      icon: Lightbulb },
  { id: "competitive",     label: "Competitive Analysis",icon: Swords },
  { id: "whats-happening", label: "What's Happening",   icon: TrendingUp },
];

const VISIBILITY_FEATURES: { id: FeatureVisibilityKey; label: string; description: string; icon: typeof BarChart3 }[] = [
  { id: "statsOverview", label: "Stats Overview", description: "Summary metrics: conversations, sentiment, critical issues, share of voice", icon: BarChart3 },
  { id: "actionRecommendations", label: "Priority Actions", description: "Rekomendasi aksi prioritas berdasarkan isu kritis", icon: Target },
  { id: "outletSatisfaction", label: "Outlet Satisfaction", description: "Peta kepuasan outlet dan lokasi", icon: MapPin },
  { id: "risksOpportunities", label: "Risks & Opportunities", description: "Kartu risiko dan peluang bisnis", icon: Lightbulb },
  { id: "competitiveAnalysis", label: "Competitive Analysis", description: "Analisis kompetitif, matrix, sentiment scores, share of voice", icon: Swords },
  { id: "recentInsights", label: "What's Happening", description: "Sentiment trends, top topics, word cloud, KOL matrix, dan lainnya", icon: TrendingUp },
];

interface SourceContentManagerProps {
  instanceId: string;
}

type ManageView = "data" | "visibility";

export function SourceContentManager({ instanceId }: SourceContentManagerProps) {
  const [store, setStore] = useState<DashboardContentStore>(defaultDashboardContent);
  const [manageView, setManageView] = useState<ManageView>("data");
  const [activeParentTab, setActiveParentTab] = useState<ParentTab>("brand");
  const [activeBrandSection, setActiveBrandSection] = useState<BrandSectionId>("stats");
  const [competitiveSubTab, setCompetitiveSubTab] = useState<"overview" | "issues" | "insights" | "matrix" | "sentiment" | "volume" | "sov">("overview");
  const [whatsHappeningSubTab, setWhatsHappeningSubTab] = useState<string>("sentiment");
  const [campaignSubTab, setCampaignSubTab] = useState<"stats" | "performance" | "channels" | "competitors" | "recommendations" | "replyTopics" | "keyEvents" | "postEvents">("stats");
  const [outletAnalysisSubTab, setOutletAnalysisSubTab] = useState<"stats" | "priorityActions" | "mapData" | "sentimentByOutlet" | "topics" | "reviews">("stats");
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const lastSavedInstanceIdRef = useRef<string>(instanceId);
  const visibility = (store.featureVisibility ?? defaultFeatureVisibility) as FeatureVisibility;

  useEffect(() => {
    setStore(loadDashboardContent(instanceId));
    setLoaded(true);
  }, [instanceId]);

  useEffect(() => {
    if (!loaded || lastSavedInstanceIdRef.current !== instanceId) return;
    saveDashboardContent(store, instanceId);
    lastSavedInstanceIdRef.current = instanceId;
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [store, loaded, instanceId]);

  const updateStore = (updater: (prev: DashboardContentStore) => DashboardContentStore) => {
    setStore(updater);
  };

  const setVisibility = (updater: (prev: FeatureVisibility) => FeatureVisibility) => {
    updateStore((p) => ({ ...p, featureVisibility: updater(p.featureVisibility ?? defaultFeatureVisibility) }));
  };

  const resetToDefault = () => {
    const instanceInitial = getInitialDashboardContentForInstance(instanceId, defaultDashboardContent);
    setStore(instanceInitial ?? defaultDashboardContent);
  };

  const handleClearAll = () => {
    clearAllDashboardContent();
    setStore(defaultDashboardContent);
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-200/50">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Content Management</h2>
            <p className="text-sm text-slate-600">Kelola data sumber untuk semua fitur dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            {saved ? (
              <>
                <Save className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Tersimpan</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span className="text-xs text-slate-600">Auto-save ke browser</span>
              </>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={resetToDefault} className="rounded-xl">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset default
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear all data
          </Button>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 mb-6">
        <button
          type="button"
          onClick={() => setManageView("data")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
            manageView === "data"
              ? "bg-white text-violet-700 shadow-md border border-violet-200/50"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Database className="w-4 h-4" />
          Kelola Data
        </button>
        <button
          type="button"
          onClick={() => setManageView("visibility")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
            manageView === "visibility"
              ? "bg-white text-violet-700 shadow-md border border-violet-200/50"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Eye className="w-4 h-4" />
          Display Settings
        </button>
      </div>

      {manageView === "visibility" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center border border-violet-200/50">
              <Settings2 className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Tampilkan / Sembunyikan Fitur</h3>
              <p className="text-sm text-slate-600">Pilih fitur mana yang ingin ditampilkan di dashboard</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VISIBILITY_FEATURES.map(({ id, label, description, icon: Icon }) => {
              const isOn = visibility[id] ?? true;
              return (
                <Card
                  key={id}
                  className={`rounded-2xl border-2 transition-all overflow-hidden ${
                    isOn
                      ? "border-violet-200/60 bg-gradient-to-br from-white to-violet-50/30 shadow-sm hover:shadow-md"
                      : "border-slate-200 bg-slate-50/50 opacity-90"
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4 p-5">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          isOn ? "bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-200/50" : "bg-slate-200"
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${isOn ? "text-white" : "text-slate-500"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <h4 className={`font-semibold ${isOn ? "text-slate-900" : "text-slate-500"}`}>{label}</h4>
                          <Switch
                            checked={isOn}
                            onCheckedChange={(checked) => setVisibility((v) => ({ ...v, [id]: checked }))}
                            className="data-[state=checked]:bg-violet-500 data-[state=unchecked]:bg-slate-300"
                          />
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
                        <div className="mt-2 flex items-center gap-1.5 text-xs">
                          {isOn ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-medium">Ditampilkan di dashboard</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-slate-500">Disembunyikan</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 text-center pt-2">Perubahan disimpan otomatis. Dashboard akan menampilkan hanya fitur yang diaktifkan.</p>
        </div>
      )}

      {manageView === "data" && (
        <>
      {/* ── 3 Parent Tabs ──────────────────────────────────────────── */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 mb-4">
        {PARENT_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveParentTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeParentTab === id
                ? "bg-white text-violet-700 shadow-md border border-violet-200/50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Brand Analysis ─────────────────────────────────────────── */}
      {activeParentTab === "brand" && (
        <>
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
            {BRAND_SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveBrandSection(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeBrandSection === id
                    ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                <ChevronDown className={`w-3.5 h-3.5 opacity-70 ${activeBrandSection === id ? "rotate-180" : ""}`} />
              </button>
            ))}
          </div>

          {activeBrandSection === "stats" && (
            <StatsSection
              items={store.statsOverview}
              onUpdate={(items) => updateStore((p) => ({ ...p, statsOverview: items }))}
            />
          )}
          {activeBrandSection === "actions" && (
            <ActionsSection
              items={store.priorityActions}
              onUpdate={(items) => updateStore((p) => ({ ...p, priorityActions: items }))}
            />
          )}
          {activeBrandSection === "outlets" && (
            <OutletsSection
              items={store.outletSatisfaction}
              onUpdate={(items) => updateStore((p) => ({ ...p, outletSatisfaction: items }))}
            />
          )}
          {activeBrandSection === "risks" && (
            <RisksSection
              items={store.risks}
              onUpdate={(items) => updateStore((p) => ({ ...p, risks: items }))}
            />
          )}
          {activeBrandSection === "opportunities" && (
            <OpportunitiesSection
              items={store.opportunities}
              onUpdate={(items) => updateStore((p) => ({ ...p, opportunities: items }))}
            />
          )}
          {activeBrandSection === "competitive" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            <button onClick={() => setCompetitiveSubTab("overview")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${competitiveSubTab === "overview" ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Competitor Overview</button>
            <button onClick={() => setCompetitiveSubTab("issues")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${competitiveSubTab === "issues" ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Competitive Issues</button>
            <button onClick={() => setCompetitiveSubTab("insights")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${competitiveSubTab === "insights" ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Key Insights</button>
            <button onClick={() => setCompetitiveSubTab("matrix")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${competitiveSubTab === "matrix" ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Competitive Matrix</button>
            <button onClick={() => setCompetitiveSubTab("sentiment")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${competitiveSubTab === "sentiment" ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Sentiment Scores</button>
            <button onClick={() => setCompetitiveSubTab("volume")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${competitiveSubTab === "volume" ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Volume of Mentions</button>
            <button onClick={() => setCompetitiveSubTab("sov")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${competitiveSubTab === "sov" ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Share of Voice</button>
          </div>
          {competitiveSubTab === "overview" && (
            <CompetitorOverviewEditor
              items={store.competitiveMatrixItems ?? []}
              onUpdate={(v) => updateStore((p) => ({ ...p, competitiveMatrixItems: v }))}
            />
          )}
          {competitiveSubTab === "issues" && (
            <CompetitiveSection items={store.competitiveIssues} onUpdate={(items) => updateStore((p) => ({ ...p, competitiveIssues: items }))} />
          )}
          {competitiveSubTab === "insights" && (
            <KeyInsightsSection items={store.competitiveKeyInsights ?? []} onUpdate={(items) => updateStore((p) => ({ ...p, competitiveKeyInsights: items }))} />
          )}
          {competitiveSubTab === "matrix" && (
            <CompetitiveMatrixEditor
              matrixItems={store.competitiveMatrixItems ?? []}
              onUpdateMatrix={(v) => updateStore((p) => ({ ...p, competitiveMatrixItems: v }))}
              quadrantItems={store.competitiveQuadrantAnalysis ?? []}
              onUpdateQuadrant={(v) => updateStore((p) => ({ ...p, competitiveQuadrantAnalysis: v }))}
            />
          )}
          {competitiveSubTab === "sentiment" && (
            <CompetitiveHeatmapEditor title="Sentiment Scores" items={store.competitiveSentimentScores ?? []} onUpdate={(v) => updateStore((p) => ({ ...p, competitiveSentimentScores: v }))} valueLabel="Score (0-1)" brandLabels={store.competitiveBrandLabels} competitiveMatrixItems={store.competitiveMatrixItems ?? []} />
          )}
          {competitiveSubTab === "volume" && (
            <CompetitiveHeatmapEditor title="Volume of Mentions" items={store.competitiveVolumeOfMentions ?? []} onUpdate={(v) => updateStore((p) => ({ ...p, competitiveVolumeOfMentions: v }))} valueLabel="Volume" brandLabels={store.competitiveBrandLabels} competitiveMatrixItems={store.competitiveMatrixItems ?? []} />
          )}
          {competitiveSubTab === "sov" && (
            <ShareOfVoiceEditor items={store.competitiveShareOfVoice ?? []} onUpdate={(v) => updateStore((p) => ({ ...p, competitiveShareOfVoice: v }))} brandLabels={store.competitiveBrandLabels} />
          )}
        </div>
          )}
          {activeBrandSection === "whats-happening" && (
            <WhatsHappeningSection
              store={store}
              updateStore={updateStore}
              activeSubTab={whatsHappeningSubTab}
              onSubTabChange={setWhatsHappeningSubTab}
            />
          )}
        </>
      )}

      {/* ── Campaign Analysis ──────────────────────────────────────── */}
      {activeParentTab === "campaign" && (
        <CampaignSection
          store={store}
          updateStore={updateStore}
          activeSubTab={campaignSubTab}
          onSubTabChange={setCampaignSubTab}
        />
      )}

      {/* ── Outlet Analysis ────────────────────────────────────────── */}
      {activeParentTab === "outlet-analysis" && (
        <OutletAnalysisSection
          store={store}
          updateStore={updateStore}
          activeSubTab={outletAnalysisSubTab}
          onSubTabChange={setOutletAnalysisSubTab}
        />
      )}
        </>
      )}

      {/* ── Konfirmasi Clear All ─────────────────────────────────── */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Hapus Semua Data?
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-1">
              Tindakan ini akan menghapus <strong>seluruh data semua instance</strong> yang tersimpan di browser (localStorage). Data tidak dapat dipulihkan setelah dihapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowClearConfirm(false)} className="rounded-xl">
              Batal
            </Button>
            <Button
              onClick={handleClearAll}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Ya, Hapus Semua
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatsSection({
  items,
  onUpdate,
}: {
  items: StatItem[];
  onUpdate: (items: StatItem[]) => void;
}) {
  const [editing, setEditing] = useState<StatItem | null>(null);
  const [adding, setAdding] = useState(false);

  const openEdit = (item: StatItem) => setEditing({ ...item });
  const openAdd = () => setAdding(true);
  const close = () => {
    setEditing(null);
    setAdding(false);
  };

  const saveEdit = () => {
    if (editing) {
      onUpdate(items.map((i) => (i.id === editing.id ? editing : i)));
      close();
    }
  };

  const saveAdd = (item: Omit<StatItem, "id">) => {
    onUpdate([...items, { ...item, id: generateId() }]);
    setAdding(false);
  };

  const remove = (id: string) => {
    onUpdate(items.filter((i) => i.id !== id));
    close();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Add stat
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="rounded-2xl border-slate-200 overflow-hidden hover:border-violet-300 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{item.label}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(item)}>
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600" onClick={() => remove(item.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-bold text-slate-900 mb-1">{item.value}</p>
              <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <StatFormDialog
        open={!!editing || adding}
        title={editing ? "Edit stat" : "Add stat"}
        initial={editing ?? undefined}
        onClose={close}
        onSave={(item) => {
          if (editing) {
            onUpdate(items.map((i) => (i.id === item.id ? item : i)));
          } else {
            onUpdate([...items, item]);
          }
          close();
        }}
        isAdd={adding}
      />
    </div>
  );
}

function StatFormDialog({
  open,
  title,
  initial,
  onClose,
  onSave,
  isAdd,
}: {
  open: boolean;
  title: string;
  initial?: StatItem;
  onClose: () => void;
  onSave: (item: StatItem) => void;
  isAdd: boolean;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [value, setValue] = useState(initial?.value ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "BarChart3");

  useEffect(() => {
    if (open) {
      setLabel(initial?.label ?? "");
      setValue(initial?.value ?? "");
      setDescription(initial?.description ?? "");
      setIcon(initial?.icon ?? "BarChart3");
    }
  }, [open, initial?.id, initial?.label, initial?.value, initial?.description, initial?.icon]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: StatItem = {
      id: initial?.id ?? generateId(),
      label,
      value,
      description,
      icon,
    };
    onSave(item);
    if (isAdd) {
      setLabel("");
      setValue("");
      setDescription("");
      setIcon("BarChart3");
    }
    onClose();
  };

  if (!open) return null;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form id="stat-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Label</label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Conversations Analyzed" className="rounded-xl" required />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Value</label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="847.2K" className="rounded-xl" required />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Deskripsi</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi singkat..." className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Icon (nama)</label>
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="BarChart3" className="rounded-xl" />
          </div>
        </form>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Batal</Button>
          <Button type="submit" form="stat-form" className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">
            {isAdd ? "Tambah" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActionsSection({
  items,
  onUpdate,
}: {
  items: PriorityActionItem[];
  onUpdate: (items: PriorityActionItem[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const remove = (id: string) => onUpdate(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAdding(true)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah action
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="rounded-2xl border-slate-200 overflow-hidden hover:border-violet-300 transition-colors">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-cyan-500" />
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditingId(item.id)}>
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500" onClick={() => remove(item.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{item.priority}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{item.impact} impact</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{item.effort} effort</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {editingId && (
        <ActionEditDialog
          item={items.find((i) => i.id === editingId)!}
          onClose={() => setEditingId(null)}
          onSave={(updated) => {
            onUpdate(items.map((i) => (i.id === updated.id ? updated : i)));
            setEditingId(null);
          }}
        />
      )}
      {adding && (
        <ActionEditDialog
          item={{
            id: generateId(),
            priority: "medium",
            title: "",
            description: "",
            impact: "Medium",
            effort: "Medium",
            recommendation: "",
            category: "Opportunity",
            quadrantColor: "cyan",
            relatedIssues: [],
            metrics: { mentions: 0, sentiment: 0, trend: "stable" },
            sourceContent: [],
          }}
          onClose={() => setAdding(false)}
          onSave={(newItem) => {
            onUpdate([...items, newItem]);
            setAdding(false);
          }}
          isNew
        />
      )}
    </div>
  );
}

function ActionEditDialog({
  item,
  onClose,
  onSave,
  isNew,
}: {
  item: PriorityActionItem;
  onClose: () => void;
  onSave: (item: PriorityActionItem) => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState(item);

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Tambah priority action" : "Edit action"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Judul</label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Judul action" className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Deskripsi</label>
            <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Deskripsi" className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as PriorityActionItem["priority"] }))}
                className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Impact</label>
              <Input value={form.impact} onChange={(e) => setForm((p) => ({ ...p, impact: e.target.value }))} className="rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Effort</label>
              <Input value={form.effort} onChange={(e) => setForm((p) => ({ ...p, effort: e.target.value }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Category</label>
              <Input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="rounded-xl" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Rekomendasi</label>
            <Input value={form.recommendation} onChange={(e) => setForm((p) => ({ ...p, recommendation: e.target.value }))} placeholder="Rekomendasi AI" className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Related issues (pisah koma)</label>
            <Input
              value={form.relatedIssues.join(", ")}
              onChange={(e) => setForm((p) => ({ ...p, relatedIssues: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
              placeholder="Packaging, Customer Service"
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Mentions</label>
              <Input type="number" value={form.metrics.mentions} onChange={(e) => setForm((p) => ({ ...p, metrics: { ...p.metrics, mentions: Number(e.target.value) || 0 } }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Sentiment</label>
              <Input type="number" step="0.01" value={form.metrics.sentiment} onChange={(e) => setForm((p) => ({ ...p, metrics: { ...p.metrics, sentiment: Number(e.target.value) || 0 } }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Trend</label>
              <select
                value={form.metrics.trend}
                onChange={(e) => setForm((p) => ({ ...p, metrics: { ...p.metrics, trend: e.target.value } }))}
                className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm"
              >
                <option value="increasing">Increasing</option>
                <option value="decreasing">Decreasing</option>
                <option value="stable">Stable</option>
              </select>
            </div>
          </div>
          <SourceContentEditor
            value={form.sourceContent ?? []}
            onChange={(sourceContent) => setForm((p) => ({ ...p, sourceContent }))}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Batal</Button>
          <Button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SourceContentEditor({ value, onChange }: { value: SourceContentPost[]; onChange: (v: SourceContentPost[]) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const list = value ?? [];
  const add = () => {
    const newPost: SourceContentPost = { id: generateId(), platform: "twitter", author: "", content: "", sentiment: 0, timestamp: "" };
    onChange([...list, newPost]);
    setEditingId(newPost.id);
  };
  const remove = (id: string) => {
    onChange(list.filter((p) => p.id !== id));
    if (editingId === id) setEditingId(null);
  };
  const update = (id: string, updates: Partial<SourceContentPost>) => {
    onChange(list.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-600">Source Content</label>
        <Button type="button" variant="outline" size="sm" className="rounded-lg h-8" onClick={add}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Tambah
        </Button>
      </div>
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {list.map((post) =>
          editingId === post.id ? (
            <div key={post.id} className="rounded-xl border border-violet-200 bg-violet-50/50 p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Platform" value={post.platform} onChange={(e) => update(post.id, { platform: e.target.value })} className="rounded-lg h-8 text-xs" />
                <Input placeholder="Author" value={post.author} onChange={(e) => update(post.id, { author: e.target.value })} className="rounded-lg h-8 text-xs" />
              </div>
              <Input placeholder="Content" value={post.content} onChange={(e) => update(post.id, { content: e.target.value })} className="rounded-lg h-8 text-xs" />
              <div className="flex gap-2 items-center">
                <Input type="number" step="0.01" placeholder="Sentiment" value={post.sentiment} onChange={(e) => update(post.id, { sentiment: Number(e.target.value) || 0 })} className="rounded-lg h-8 text-xs w-24" />
                <Input placeholder="Timestamp" value={post.timestamp} onChange={(e) => update(post.id, { timestamp: e.target.value })} className="rounded-lg h-8 text-xs flex-1" />
              </div>
              <div className="flex gap-2">
                <Input type="number" placeholder="Likes" value={post.engagement?.likes ?? ""} onChange={(e) => update(post.id, { engagement: { ...post.engagement, likes: Number(e.target.value) || 0, replies: post.engagement?.replies ?? 0, retweets: post.engagement?.retweets ?? 0 } })} className="rounded-lg h-8 text-xs w-20" />
                <Input type="number" placeholder="Replies" value={post.engagement?.replies ?? ""} onChange={(e) => update(post.id, { engagement: { ...post.engagement, replies: Number(e.target.value) || 0, likes: post.engagement?.likes ?? 0, retweets: post.engagement?.retweets ?? 0 } })} className="rounded-lg h-8 text-xs w-20" />
                <Input type="number" placeholder="Retweets" value={post.engagement?.retweets ?? ""} onChange={(e) => update(post.id, { engagement: { ...post.engagement, retweets: Number(e.target.value) || 0, likes: post.engagement?.likes ?? 0, replies: post.engagement?.replies ?? 0 } })} className="rounded-lg h-8 text-xs w-20" />
              </div>
              <div className="flex justify-end gap-1">
                <Button type="button" variant="ghost" size="sm" className="h-7 text-red-600" onClick={() => remove(post.id)}><Trash2 className="w-3 h-3" /></Button>
                <Button type="button" variant="ghost" size="sm" className="h-7" onClick={() => setEditingId(null)}>Selesai</Button>
              </div>
            </div>
          ) : (
            <div key={post.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <span className="truncate flex-1">{post.author || "(no author)"} · {post.platform} · {post.sentiment.toFixed(2)}</span>
              <div className="flex gap-1 shrink-0">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(post.id)}><Pencil className="w-3 h-3" /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => remove(post.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function OutletsSection({ items, onUpdate }: { items: OutletItem[]; onUpdate: (items: OutletItem[]) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const remove = (id: string) => onUpdate(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAdding(true)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah outlet
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((outlet) => (
          <Card key={outlet.id} className="rounded-2xl border-slate-200 overflow-hidden hover:border-violet-300 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{outlet.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditingId(outlet.id)}>
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500" onClick={() => remove(outlet.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-500">{outlet.location}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  outlet.status === "critical" ? "bg-red-100 text-red-700" :
                  outlet.status === "warning" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {outlet.status}
                </span>
                <span className="text-sm font-medium text-slate-700">Sentiment: {outlet.satisfaction.toFixed(2)}</span>
              </div>
              {outlet.issues.length > 0 && (
                <p className="text-xs text-slate-600">{outlet.issues.join(", ")}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {editingId && (
        <OutletEditDialog
          item={items.find((i) => i.id === editingId)!}
          onClose={() => setEditingId(null)}
          onSave={(updated) => {
            onUpdate(items.map((i) => (i.id === updated.id ? updated : i)));
            setEditingId(null);
          }}
        />
      )}
      {adding && (
        <OutletEditDialog
          item={{
            id: generateId(),
            name: "",
            location: "",
            status: "good",
            satisfaction: 0,
            issues: [],
            coords: { x: 50, y: 50 },
          }}
          onClose={() => setAdding(false)}
          onSave={(newItem) => {
            onUpdate([...items, newItem]);
            setAdding(false);
          }}
          isNew
        />
      )}
    </div>
  );
}

function OutletEditDialog({
  item,
  onClose,
  onSave,
  isNew,
}: {
  item: OutletItem;
  onClose: () => void;
  onSave: (item: OutletItem) => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState(item);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Tambah outlet" : "Edit outlet"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Nama</label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Lokasi</label>
            <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as OutletItem["status"] }))}
              className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm"
            >
              <option value="good">Good</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Satisfaction (-1 s/d 1)</label>
            <Input type="number" step="0.01" min="-1" max="1" value={form.satisfaction} onChange={(e) => setForm((p) => ({ ...p, satisfaction: Number(e.target.value) || 0 }))} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Issues (pisah koma)</label>
            <Input value={form.issues.join(", ")} onChange={(e) => setForm((p) => ({ ...p, issues: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))} className="rounded-xl" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Batal</Button>
          <Button onClick={() => onSave(form)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RisksSection({ items, onUpdate }: { items: RiskItem[]; onUpdate: (items: RiskItem[]) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const remove = (id: string) => onUpdate(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAdding(true)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah risk
        </Button>
      </div>
      <div className="grid gap-4">
        {items.map((risk) => (
          <Card key={risk.id} className="rounded-2xl border-slate-200 overflow-hidden hover:border-violet-300 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{risk.title}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditingId(risk.id)}>
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500" onClick={() => remove(risk.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap text-xs">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{risk.severity}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{risk.probability}%</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{risk.trend}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-600 line-clamp-2">{risk.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {editingId && (
        <RiskEditDialog
          item={items.find((i) => i.id === editingId)!}
          onClose={() => setEditingId(null)}
          onSave={(updated) => {
            onUpdate(items.map((i) => (i.id === updated.id ? updated : i)));
            setEditingId(null);
          }}
        />
      )}
      {adding && (
        <RiskEditDialog
          item={{
            id: generateId(),
            title: "",
            description: "",
            severity: "medium",
            probability: 50,
            impact: "",
            trend: "stable",
            supportingContents: 0,
            indicators: [],
            mitigation: [],
            sourceContent: [],
          }}
          onClose={() => setAdding(false)}
          onSave={(newItem) => {
            onUpdate([...items, newItem]);
            setAdding(false);
          }}
          isNew
        />
      )}
    </div>
  );
}

function RiskEditDialog({
  item,
  onClose,
  onSave,
  isNew,
}: {
  item: RiskItem;
  onClose: () => void;
  onSave: (item: RiskItem) => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState(item);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Tambah risk" : "Edit risk"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Judul</label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Deskripsi</label>
            <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="rounded-xl" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Severity</label>
              <select value={form.severity} onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value }))} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Probability (%)</label>
              <Input type="number" min={0} max={100} value={form.probability} onChange={(e) => setForm((p) => ({ ...p, probability: Number(e.target.value) || 0 }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Trend</label>
              <select value={form.trend} onChange={(e) => setForm((p) => ({ ...p, trend: e.target.value }))} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                <option value="increasing">Increasing</option>
                <option value="decreasing">Decreasing</option>
                <option value="stable">Stable</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Impact</label>
            <Input value={form.impact} onChange={(e) => setForm((p) => ({ ...p, impact: e.target.value }))} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Supporting contents</label>
            <Input type="number" value={form.supportingContents} onChange={(e) => setForm((p) => ({ ...p, supportingContents: Number(e.target.value) || 0 }))} className="rounded-xl" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-600">Indicators (Quick Metrics)</label>
              <Button type="button" variant="outline" size="sm" className="rounded-lg h-7 text-xs" onClick={() => setForm((p) => ({ ...p, indicators: [...(p.indicators || []), { label: "", value: 0, change: 0 }] }))}>
                <Plus className="w-3 h-3 mr-1" /> Tambah
              </Button>
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {(form.indicators || []).map((ind, idx) => (
                <div key={idx} className="flex gap-2 items-center rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <Input placeholder="Label" value={ind.label} onChange={(e) => setForm((p) => ({ ...p, indicators: p.indicators.map((i, iidx) => iidx === idx ? { ...i, label: e.target.value } : i) }))} className="rounded-lg h-8 text-xs flex-1" />
                  <Input type="number" step="0.01" placeholder="Value" value={ind.value} onChange={(e) => setForm((p) => ({ ...p, indicators: p.indicators.map((i, iidx) => iidx === idx ? { ...i, value: Number(e.target.value) || 0 } : i) }))} className="rounded-lg h-8 text-xs w-20" />
                  <Input type="number" placeholder="Change %" value={ind.change} onChange={(e) => setForm((p) => ({ ...p, indicators: p.indicators.map((i, iidx) => iidx === idx ? { ...i, change: Number(e.target.value) || 0 } : i) }))} className="rounded-lg h-8 text-xs w-16" />
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => setForm((p) => ({ ...p, indicators: p.indicators.filter((_, iidx) => iidx !== idx) }))}><Trash2 className="w-3 h-3" /></Button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Mitigation Strategy (satu per baris)</label>
            <textarea
              value={(form.mitigation ?? []).join("\n")}
              onChange={(e) => setForm((p) => ({ ...p, mitigation: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }))}
              className="w-full min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Strategi mitigasi 1&#10;Strategi mitigasi 2"
            />
          </div>
          <SourceContentEditor value={form.sourceContent ?? []} onChange={(sourceContent) => setForm((p) => ({ ...p, sourceContent }))} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Batal</Button>
          <Button onClick={() => onSave(form)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OpportunitiesSection({
  items,
  onUpdate,
}: {
  items: OpportunityItem[];
  onUpdate: (items: OpportunityItem[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const remove = (id: string) => onUpdate(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAdding(true)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah opportunity
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((opp) => (
          <Card key={opp.id} className="rounded-2xl border-slate-200 overflow-hidden hover:border-cyan-300 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base line-clamp-2">{opp.title}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditingId(opp.id)}>
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500" onClick={() => remove(opp.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap text-xs">
                <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700">{opp.potential}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{opp.confidence}%</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{opp.timeframe}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-600 line-clamp-2">{opp.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {editingId && (
        <OpportunityEditDialog
          item={items.find((i) => i.id === editingId)!}
          onClose={() => setEditingId(null)}
          onSave={(updated) => {
            onUpdate(items.map((i) => (i.id === updated.id ? updated : i)));
            setEditingId(null);
          }}
        />
      )}
      {adding && (
        <OpportunityEditDialog
          item={{
            id: generateId(),
            title: "",
            description: "",
            potential: "medium",
            confidence: 50,
            timeframe: "Short-term",
            category: "",
            trend: "stable",
            supportingContents: 0,
            metrics: {},
            recommendations: [],
            sourceContent: [],
          }}
          onClose={() => setAdding(false)}
          onSave={(newItem) => {
            onUpdate([...items, newItem]);
            setAdding(false);
          }}
          isNew
        />
      )}
    </div>
  );
}

function OpportunityEditDialog({
  item,
  onClose,
  onSave,
  isNew,
}: {
  item: OpportunityItem;
  onClose: () => void;
  onSave: (item: OpportunityItem) => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState(item);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Tambah opportunity" : "Edit opportunity"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Judul</label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Deskripsi</label>
            <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Potential</label>
              <select value={form.potential} onChange={(e) => setForm((p) => ({ ...p, potential: e.target.value }))} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Confidence (%)</label>
              <Input type="number" min={0} max={100} value={form.confidence} onChange={(e) => setForm((p) => ({ ...p, confidence: Number(e.target.value) || 0 }))} className="rounded-xl" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Supporting contents</label>
            <Input type="number" value={form.supportingContents} onChange={(e) => setForm((p) => ({ ...p, supportingContents: Number(e.target.value) || 0 }))} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Rekomendasi (satu per baris)</label>
            <textarea
              value={form.recommendations.join("\n")}
              onChange={(e) => setForm((p) => ({ ...p, recommendations: e.target.value.split("\n").filter(Boolean) }))}
              className="w-full min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Rekomendasi 1&#10;Rekomendasi 2"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-600">Key Metrics</label>
              <Button type="button" variant="outline" size="sm" className="rounded-lg h-7 text-xs" onClick={() => setForm((p) => ({ ...p, metrics: { ...p.metrics, newMetric: 0 } }))}>
                <Plus className="w-3 h-3 mr-1" /> Tambah
              </Button>
            </div>
            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {Object.entries(form.metrics || {}).map(([key, val]) => (
                <div key={key} className="flex gap-2 items-center rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <Input placeholder="Nama metric" value={key} onChange={(e) => { const m = { ...form.metrics }; delete m[key]; m[e.target.value] = val; setForm((p) => ({ ...p, metrics: m })); }} className="rounded-lg h-8 text-xs flex-1" />
                  <Input type="number" step="0.01" value={val} onChange={(e) => setForm((p) => ({ ...p, metrics: { ...p.metrics, [key]: Number(e.target.value) || 0 } }))} className="rounded-lg h-8 text-xs w-28" />
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => setForm((p) => { const m = { ...p.metrics }; delete m[key]; return { ...p, metrics: m }; })}><Trash2 className="w-3 h-3" /></Button>
                </div>
              ))}
            </div>
          </div>
          <SourceContentEditor value={form.sourceContent ?? []} onChange={(sourceContent) => setForm((p) => ({ ...p, sourceContent }))} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Batal</Button>
          <Button onClick={() => onSave(form)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CompetitiveSection({
  items,
  onUpdate,
}: {
  items: CompetitiveIssueItem[];
  onUpdate: (items: CompetitiveIssueItem[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const remove = (id: string) => onUpdate(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAdding(true)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah issue
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Issue</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Category</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Your Sentiment</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Competitor Median</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Your Mentions</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{row.issue}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    row.category === "winning" ? "bg-emerald-100 text-emerald-700" :
                    row.category === "critical" ? "bg-red-100 text-red-700" :
                    row.category === "opportunity" ? "bg-cyan-100 text-cyan-700" : "bg-slate-100 text-slate-600"
                  }`}>{row.category}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{row.yourSentiment.toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-600">{row.competitorMedianSentiment.toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-600">{row.yourMentions.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditingId(row.id)}>
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500" onClick={() => remove(row.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingId && (
        <CompetitiveEditDialog
          item={items.find((i) => i.id === editingId)!}
          onClose={() => setEditingId(null)}
          onSave={(updated) => {
            onUpdate(items.map((i) => (i.id === updated.id ? updated : i)));
            setEditingId(null);
          }}
        />
      )}
      {adding && (
        <CompetitiveEditDialog
          item={{
            id: generateId(),
            issue: "",
            category: "moderate",
            yourSentiment: 0.5,
            competitorMedianSentiment: 0.5,
            yourMentions: 2000,
            competitorMedianMentions: 2000,
            relativeSentiment: 0,
            relativeMentions: 0,
          }}
          onClose={() => setAdding(false)}
          onSave={(newItem) => {
            onUpdate([...items, newItem]);
            setAdding(false);
          }}
          isNew
        />
      )}
    </div>
  );
}

function KeyInsightsSection({
  items,
  onUpdate,
}: {
  items: KeyInsightItem[];
  onUpdate: (items: KeyInsightItem[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const remove = (id: string) => onUpdate(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAdding(true)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Key Insight
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((insight) => (
          <Card
            key={insight.id}
            className={`rounded-2xl overflow-hidden border-2 transition-colors ${
              insight.type === "critical" ? "border-red-200 bg-red-50/50" : "border-emerald-200 bg-emerald-50/50"
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{insight.title}</CardTitle>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditingId(insight.id)}>
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500" onClick={() => remove(insight.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${insight.type === "critical" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                {insight.type === "critical" ? "Critical" : "Strength"}
              </span>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-600 line-clamp-2 mb-2">{insight.description}</p>
              {insight.bullets?.length > 0 && (
                <ul className="text-xs text-slate-600 space-y-0.5">
                  {insight.bullets.slice(0, 3).map((b, i) => (
                    <li key={i}>• {b}</li>
                  ))}
                  {insight.bullets.length > 3 && <li className="text-slate-400">+{insight.bullets.length - 3} lagi</li>}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {editingId && (
        <KeyInsightEditDialog
          item={items.find((i) => i.id === editingId)!}
          onClose={() => setEditingId(null)}
          onSave={(updated) => {
            onUpdate(items.map((i) => (i.id === updated.id ? updated : i)));
            setEditingId(null);
          }}
        />
      )}
      {adding && (
        <KeyInsightEditDialog
          item={{
            id: generateId(),
            type: "critical",
            title: "",
            description: "",
            bullets: [],
          }}
          onClose={() => setAdding(false)}
          onSave={(newItem) => {
            onUpdate([...items, newItem]);
            setAdding(false);
          }}
          isNew
        />
      )}
    </div>
  );
}

function KeyInsightEditDialog({
  item,
  onClose,
  onSave,
  isNew,
}: {
  item: KeyInsightItem;
  onClose: () => void;
  onSave: (item: KeyInsightItem) => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState(item);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Tambah Key Insight" : "Edit Key Insight"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Tipe</label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as KeyInsightItem["type"] }))}
              className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm"
            >
              <option value="critical">Critical</option>
              <option value="strength">Strength</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Judul</label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Critical Issues" className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Deskripsi</label>
            <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Deskripsi singkat..." className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Bullet points (satu per baris)</label>
            <textarea
              value={(form.bullets ?? []).join("\n")}
              onChange={(e) => setForm((p) => ({ ...p, bullets: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }))}
              className="w-full min-h-[100px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="• Point 1&#10;• Point 2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Batal</Button>
          <Button onClick={() => onSave(form)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const WHATS_HAPPENING_SUB_TABS: { id: string; label: string; icon: typeof TrendingUp }[] = [
  { id: "sentiment", label: "Sentiment Trends", icon: TrendingUp },
  { id: "topics", label: "Top Discussion Topics", icon: MessageCircle },
  { id: "wordcloud", label: "Word Cloud", icon: MessageCircle },
  { id: "topic-trends", label: "Topic Trends Over Time", icon: LineChart },
  { id: "clusters", label: "Conversation Clusters", icon: Users },
  { id: "hashtags", label: "Top Hashtags", icon: Hash },
  { id: "accounts", label: "Top Accounts", icon: Contact },
  { id: "contents", label: "Top Contents", icon: FileText },
  { id: "kol", label: "KOL Matrix", icon: UserCheck },
  { id: "share", label: "Share of Platform", icon: BarChart3 },
];

function WhatsHappeningSection({
  store,
  updateStore,
  activeSubTab,
  onSubTabChange,
}: {
  store: DashboardContentStore;
  updateStore: (updater: (p: DashboardContentStore) => DashboardContentStore) => void;
  activeSubTab: string;
  onSubTabChange: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {WHATS_HAPPENING_SUB_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSubTabChange(id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeSubTab === id ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>
      {activeSubTab === "sentiment" && (
        <SentimentTrendsEditor
          items={store.whatsHappeningSentimentTrends ?? []}
          onUpdate={(items) => updateStore((p) => ({ ...p, whatsHappeningSentimentTrends: items }))}
          keyEvents={store.whatsHappeningKeyEvents ?? []}
          onUpdateKeyEvents={(items) => updateStore((p) => ({ ...p, whatsHappeningKeyEvents: items }))}
        />
      )}
      {activeSubTab === "topics" && (
        <TopTopicsEditor
          items={store.whatsHappeningTopTopics ?? []}
          onUpdate={(items) => updateStore((p) => ({ ...p, whatsHappeningTopTopics: items }))}
          aiTopicAnalysis={store.whatsHappeningAITopicAnalysis ?? []}
          onUpdateAITopicAnalysis={(items) => updateStore((p) => ({ ...p, whatsHappeningAITopicAnalysis: items }))}
        />
      )}
      {activeSubTab === "wordcloud" && (
        <WordCloudEditor
          items={store.whatsHappeningWordCloud ?? []}
          onUpdate={(items) => updateStore((p) => ({ ...p, whatsHappeningWordCloud: items }))}
        />
      )}
      {activeSubTab === "topic-trends" && (
        <TopicTrendsEditor
          data={store.whatsHappeningTopicTrendsData ?? []}
          onUpdateData={(v) => updateStore((p) => ({ ...p, whatsHappeningTopicTrendsData: v }))}
          aiTrendAnalysis={store.whatsHappeningAITrendAnalysis ?? []}
          onUpdateAi={(v) => updateStore((p) => ({ ...p, whatsHappeningAITrendAnalysis: v }))}
        />
      )}
      {activeSubTab === "clusters" && (
        <ConversationClustersEditor
          items={store.whatsHappeningClusters ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, whatsHappeningClusters: v }))}
        />
      )}
      {activeSubTab === "hashtags" && (
        <TopHashtagsEditor
          items={store.whatsHappeningHashtags ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, whatsHappeningHashtags: v }))}
        />
      )}
      {activeSubTab === "accounts" && (
        <TopAccountsEditor
          items={store.whatsHappeningAccounts ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, whatsHappeningAccounts: v }))}
        />
      )}
      {activeSubTab === "contents" && (
        <TopContentsEditor
          items={store.whatsHappeningContents ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, whatsHappeningContents: v }))}
        />
      )}
      {activeSubTab === "kol" && (
        <KOLMatrixEditor
          items={store.whatsHappeningKOLMatrix ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, whatsHappeningKOLMatrix: v }))}
          aiAnalysis={store.whatsHappeningAIKOLAnalysis ?? []}
          onUpdateAi={(v) => updateStore((p) => ({ ...p, whatsHappeningAIKOLAnalysis: v }))}
        />
      )}
      {activeSubTab === "share" && (
        <ShareOfPlatformEditor
          items={store.whatsHappeningShareOfPlatform ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, whatsHappeningShareOfPlatform: v }))}
        />
      )}
    </div>
  );
}

function SentimentTrendsEditor({
  items,
  onUpdate,
  keyEvents,
  onUpdateKeyEvents,
}: {
  items: SentimentTrendItem[];
  onUpdate: (v: SentimentTrendItem[]) => void;
  keyEvents: KeyEventItem[];
  onUpdateKeyEvents: (v: KeyEventItem[]) => void;
}) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [keyEventEditId, setKeyEventEditId] = useState<string | null>(null);
  const [keyEventAdding, setKeyEventAdding] = useState(false);
  const list = items ?? [];
  const events = keyEvents ?? [];
  const add = () => {
    onUpdate([...list, { date: "", positive: 0, negative: 0, neutral: 0 }]);
    setAdding(true);
    setEditingIdx(list.length);
  };
  const updateKeyEvent = (id: string, u: Partial<KeyEventItem>) => {
    onUpdateKeyEvents(events.map((e) => (e.id === id ? { ...e, ...u } : e)));
  };
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Tambah data
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Positive</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Negative</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Neutral</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{row.date}</td>
                  <td className="px-4 py-3">{row.positive}</td>
                  <td className="px-4 py-3">{row.negative}</td>
                  <td className="px-4 py-3">{row.neutral}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingIdx(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editingIdx !== null && list[editingIdx] && (
          <Dialog open onOpenChange={(o) => !o && (setEditingIdx(null), setAdding(false))}>
            <DialogContent className="rounded-2xl sm:max-w-sm">
              <DialogHeader><DialogTitle>{adding ? "Tambah baris" : "Edit baris"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Date" value={list[editingIdx].date} onChange={(e) => onUpdate(list.map((r, i) => i === editingIdx ? { ...r, date: e.target.value } : r))} className="rounded-xl" />
                <Input type="number" placeholder="Positive" value={list[editingIdx].positive} onChange={(e) => onUpdate(list.map((r, i) => i === editingIdx ? { ...r, positive: Number(e.target.value) || 0 } : r))} className="rounded-xl" />
                <Input type="number" placeholder="Negative" value={list[editingIdx].negative} onChange={(e) => onUpdate(list.map((r, i) => i === editingIdx ? { ...r, negative: Number(e.target.value) || 0 } : r))} className="rounded-xl" />
                <Input type="number" placeholder="Neutral" value={list[editingIdx].neutral} onChange={(e) => onUpdate(list.map((r, i) => i === editingIdx ? { ...r, neutral: Number(e.target.value) || 0 } : r))} className="rounded-xl" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setEditingIdx(null); setAdding(false); }}>Tutup</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="border-t border-slate-200 pt-6">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">Key Events Detected by AI</h4>
        <div className="flex justify-end mb-3">
          <Button onClick={() => { const newItem = { id: generateId(), date: "", title: "", description: "" }; onUpdateKeyEvents([...events, newItem]); setKeyEventEditId(newItem.id); setKeyEventAdding(true); }} className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200">
            <Plus className="w-4 h-4 mr-2" />
            Tambah event
          </Button>
        </div>
        <div className="space-y-2">
          {events.map((ev) => (
            <div key={ev.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 bg-slate-50">
              <div className="min-w-0 flex-1">
                <span className="text-xs text-slate-500">{ev.date}</span>
                <p className="font-medium text-slate-900 truncate">{ev.title || "—"}</p>
                <p className="text-xs text-slate-600 truncate">{ev.description || "—"}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setKeyEventEditId(ev.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdateKeyEvents(events.filter((e) => e.id !== ev.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
        {(keyEventEditId || keyEventAdding) && (() => {
          const ev = events.find((e) => e.id === keyEventEditId) ?? (keyEventAdding ? events[events.length - 1] : null);
          if (!ev) return null;
          return (
            <Dialog open onOpenChange={(o) => !o && (setKeyEventEditId(null), setKeyEventAdding(false))}>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader><DialogTitle>Key Event</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Date (e.g. Nov 9)" value={ev.date} onChange={(e) => updateKeyEvent(ev.id, { date: e.target.value })} className="rounded-xl" />
                  <Input placeholder="Title" value={ev.title} onChange={(e) => updateKeyEvent(ev.id, { title: e.target.value })} className="rounded-xl" />
                  <textarea placeholder="Description" value={ev.description} onChange={(e) => updateKeyEvent(ev.id, { description: e.target.value })} className="w-full min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setKeyEventEditId(null); setKeyEventAdding(false); }}>Tutup</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })()}
      </div>
    </div>
  );
}

function TopTopicsEditor({
  items,
  onUpdate,
  aiTopicAnalysis,
  onUpdateAITopicAnalysis,
}: {
  items: TopTopicItem[];
  onUpdate: (v: TopTopicItem[]) => void;
  aiTopicAnalysis: AITopicAnalysisItem[];
  onUpdateAITopicAnalysis: (v: AITopicAnalysisItem[]) => void;
}) {
  const list = items ?? [];
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [aiEditId, setAiEditId] = useState<string | null>(null);
  const [aiAdding, setAiAdding] = useState(false);
  const add = () => { onUpdate([...list, { topic: "", mentions: 0, sentiment: 0 }]); setEditIdx(list.length); };
  const updateRow = (idx: number, u: Partial<TopTopicItem>) => onUpdate(list.map((r, i) => i === idx ? { ...r, ...u } : r));
  const aiList = aiTopicAnalysis ?? [];
  const updateAi = (id: string, u: Partial<AITopicAnalysisItem>) => onUpdateAITopicAnalysis(aiList.map((a) => (a.id === id ? { ...a, ...u } : a)));

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Tambah topic
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Topic</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Mentions</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Sentiment</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{row.topic}</td>
                  <td className="px-4 py-3">{row.mentions.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.sentiment.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditIdx(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editIdx !== null && list[editIdx] && (
          <Dialog open onOpenChange={(o) => !o && setEditIdx(null)}>
            <DialogContent className="rounded-2xl sm:max-w-sm">
              <DialogHeader><DialogTitle>Edit topic</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Topic" value={list[editIdx].topic} onChange={(e) => updateRow(editIdx, { topic: e.target.value })} className="rounded-xl" />
                <Input type="number" placeholder="Mentions" value={list[editIdx].mentions} onChange={(e) => updateRow(editIdx, { mentions: Number(e.target.value) || 0 })} className="rounded-xl" />
                <Input type="number" step="0.01" placeholder="Sentiment" value={list[editIdx].sentiment} onChange={(e) => updateRow(editIdx, { sentiment: Number(e.target.value) || 0 })} className="rounded-xl" />
              </div>
              <DialogFooter><Button onClick={() => setEditIdx(null)}>Tutup</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="border-t border-slate-200 pt-6">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">AI Topic Analysis</h4>
        <div className="flex justify-end mb-3">
          <Button onClick={() => { const newItem = { id: generateId(), type: "insight" as const, title: "", description: "" }; onUpdateAITopicAnalysis([...aiList, newItem]); setAiEditId(newItem.id); setAiAdding(true); }} className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200">
            <Plus className="w-4 h-4 mr-2" />
            Tambah analisis
          </Button>
        </div>
        <div className="space-y-2">
          {aiList.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 bg-slate-50">
              <div className="min-w-0 flex-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{a.type}</span>
                <p className="font-medium text-slate-900 mt-1 truncate">{a.title || "—"}</p>
                <p className="text-xs text-slate-600 truncate">{a.description || "—"}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAiEditId(a.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdateAITopicAnalysis(aiList.filter((x) => x.id !== a.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
        {(aiEditId || aiAdding) && (() => {
          const a = aiList.find((x) => x.id === aiEditId);
          if (!a) return null;
          return (
            <Dialog open onOpenChange={(o) => !o && (setAiEditId(null), setAiAdding(false))}>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader><DialogTitle>AI Topic Analysis</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <select value={a.type} onChange={(e) => updateAi(a.id, { type: e.target.value as AITopicAnalysisItem["type"] })} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                    <option value="critical">critical</option>
                    <option value="opportunity">opportunity</option>
                    <option value="insight">insight</option>
                  </select>
                  <Input placeholder="Title" value={a.title} onChange={(e) => updateAi(a.id, { title: e.target.value })} className="rounded-xl" />
                  <textarea placeholder="Description" value={a.description} onChange={(e) => updateAi(a.id, { description: e.target.value })} className="w-full min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <DialogFooter><Button variant="outline" onClick={() => { setAiEditId(null); setAiAdding(false); }}>Tutup</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })()}
      </div>
    </div>
  );
}

function WordCloudEditor({ items, onUpdate }: { items: WordCloudItem[]; onUpdate: (v: WordCloudItem[]) => void }) {
  const list = items ?? [];
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const add = () => onUpdate([...list, { text: "", weight: 50, sentiment: "neutral" }]);
  const updateRow = (idx: number, u: Partial<WordCloudItem>) => onUpdate(list.map((r, i) => i === idx ? { ...r, ...u } : r));
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah kata
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Text</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Weight</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Sentiment</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-3">{row.text}</td>
                <td className="px-4 py-3">{row.weight}</td>
                <td className="px-4 py-3">{row.sentiment}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditIdx(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editIdx !== null && list[editIdx] && (
        <Dialog open onOpenChange={(o) => !o && setEditIdx(null)}>
          <DialogContent className="rounded-2xl sm:max-w-sm">
            <DialogHeader><DialogTitle>Edit kata</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Text" value={list[editIdx].text} onChange={(e) => updateRow(editIdx, { text: e.target.value })} className="rounded-xl" />
              <Input type="number" placeholder="Weight" value={list[editIdx].weight} onChange={(e) => updateRow(editIdx, { weight: Number(e.target.value) || 0 })} className="rounded-xl" />
              <select
                value={list[editIdx].sentiment}
                onChange={(e) => updateRow(editIdx, { sentiment: e.target.value as WordCloudItem["sentiment"] })}
                className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm"
              >
                <option value="positive">positive</option>
                <option value="negative">negative</option>
                <option value="neutral">neutral</option>
              </select>
            </div>
            <DialogFooter><Button onClick={() => setEditIdx(null)}>Tutup</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

const TOPIC_TREND_KEYS = ["packaging", "customerService", "productQuality", "shipping"] as const;

function TopicTrendsEditor({
  data,
  onUpdateData,
  aiTrendAnalysis,
  onUpdateAi,
}: {
  data: TopicTrendsOverTimeRow[];
  onUpdateData: (v: TopicTrendsOverTimeRow[]) => void;
  aiTrendAnalysis: AITrendAnalysisItem[];
  onUpdateAi: (v: AITrendAnalysisItem[]) => void;
}) {
  const list = data ?? [];
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [aiEditId, setAiEditId] = useState<string | null>(null);
  const [aiAdding, setAiAdding] = useState(false);
  const addRow = () => onUpdateData([...list, { date: "", packaging: 0, customerService: 0, productQuality: 0, shipping: 0 }]);
  const updateRow = (idx: number, u: Partial<TopicTrendsOverTimeRow>) => onUpdateData(list.map((r, i) => (i === idx ? { ...r, ...u } : r)));
  const aiList = aiTrendAnalysis ?? [];
  const updateAi = (id: string, u: Partial<AITrendAnalysisItem>) => onUpdateAi(aiList.map((a) => (a.id === id ? { ...a, ...u } : a)));
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={addRow} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Tambah baris
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                {TOPIC_TREND_KEYS.map((k) => (
                  <th key={k} className="px-4 py-3 text-left font-semibold text-slate-700">{k}</th>
                ))}
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{row.date}</td>
                  {TOPIC_TREND_KEYS.map((k) => (
                    <td key={k} className="px-4 py-3">{Number((row as Record<string, unknown>)[k]) || 0}</td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditIdx(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdateData(list.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editIdx !== null && list[editIdx] && (
          <Dialog open onOpenChange={(o) => !o && setEditIdx(null)}>
            <DialogContent className="rounded-2xl sm:max-w-sm">
              <DialogHeader><DialogTitle>Edit baris</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Date" value={list[editIdx].date} onChange={(e) => updateRow(editIdx, { date: e.target.value })} className="rounded-xl" />
                {TOPIC_TREND_KEYS.map((k) => (
                  <Input key={k} type="number" placeholder={k} value={Number((list[editIdx] as Record<string, unknown>)[k]) || 0} onChange={(e) => updateRow(editIdx, { [k]: Number(e.target.value) || 0 })} className="rounded-xl" />
                ))}
              </div>
              <DialogFooter><Button onClick={() => setEditIdx(null)}>Tutup</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="border-t border-slate-200 pt-6">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">AI Trend Analysis</h4>
        <div className="flex justify-end mb-3">
          <Button onClick={() => { const newItem = { id: generateId(), type: "insight" as const, title: "", description: "" }; onUpdateAi([...aiList, newItem]); setAiEditId(newItem.id); setAiAdding(true); }} className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200">
            <Plus className="w-4 h-4 mr-2" />
            Tambah analisis
          </Button>
        </div>
        <div className="space-y-2">
          {aiList.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 bg-slate-50">
              <div className="min-w-0 flex-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{a.type}</span>
                <p className="font-medium text-slate-900 mt-1 truncate">{a.title || "—"}</p>
                <p className="text-xs text-slate-600 truncate">{a.description || "—"}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAiEditId(a.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdateAi(aiList.filter((x) => x.id !== a.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
        {(aiEditId || aiAdding) && (() => {
          const a = aiList.find((x) => x.id === aiEditId);
          if (!a) return null;
          return (
            <Dialog open onOpenChange={(o) => !o && (setAiEditId(null), setAiAdding(false))}>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader><DialogTitle>AI Trend Analysis</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <select value={a.type} onChange={(e) => updateAi(a.id, { type: e.target.value as AITrendAnalysisItem["type"] })} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                    <option value="critical">critical</option>
                    <option value="warning">warning</option>
                    <option value="insight">insight</option>
                  </select>
                  <Input placeholder="Title" value={a.title} onChange={(e) => updateAi(a.id, { title: e.target.value })} className="rounded-xl" />
                  <textarea placeholder="Description" value={a.description} onChange={(e) => updateAi(a.id, { description: e.target.value })} className="w-full min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <DialogFooter><Button variant="outline" onClick={() => { setAiEditId(null); setAiAdding(false); }}>Tutup</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })()}
      </div>
    </div>
  );
}

function ConversationClustersEditor({ items, onUpdate }: { items: ConversationClusterItem[]; onUpdate: (v: ConversationClusterItem[]) => void }) {
  const list = items ?? [];
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const updateOne = (id: string, u: Partial<ConversationClusterItem>) => onUpdate(list.map((c) => (c.id === id ? { ...c, ...u } : c)));
  const add = () => { const newItem = { id: generateId(), theme: "", size: 0, sentiment: 0, trend: "stable" as const, keywords: [] }; onUpdate([...list, newItem]); setEditId(newItem.id); setAdding(true); };
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah cluster
        </Button>
      </div>
      <div className="space-y-2">
        {list.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 bg-slate-50">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">{c.theme || "—"}</p>
              <p className="text-xs text-slate-600">{c.size.toLocaleString()} mentions · {c.sentiment.toFixed(2)} · {c.trend}</p>
              <div className="flex flex-wrap gap-1 mt-1">{c.keywords.slice(0, 3).map((k) => <span key={k} className="text-xs px-1.5 py-0.5 bg-violet-100 rounded">{k}</span>)}{c.keywords.length > 3 && <span className="text-xs text-slate-500">+{c.keywords.length - 3}</span>}</div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditId(c.id)}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((x) => x.id !== c.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
      {editId && (() => {
        const c = list.find((x) => x.id === editId);
        if (!c) return null;
        return (
          <Dialog open onOpenChange={(o) => !o && (setEditId(null), setAdding(false))}>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader><DialogTitle>{adding ? "Tambah cluster" : "Edit cluster"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Theme" value={c.theme} onChange={(e) => updateOne(c.id, { theme: e.target.value })} className="rounded-xl" />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Size" value={c.size} onChange={(e) => updateOne(c.id, { size: Number(e.target.value) || 0 })} className="rounded-xl" />
                  <Input type="number" step="0.01" placeholder="Sentiment" value={c.sentiment} onChange={(e) => updateOne(c.id, { sentiment: Number(e.target.value) || 0 })} className="rounded-xl" />
                </div>
                <select value={c.trend} onChange={(e) => updateOne(c.id, { trend: e.target.value as ConversationClusterItem["trend"] })} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                  <option value="up">up</option>
                  <option value="down">down</option>
                  <option value="stable">stable</option>
                </select>
                <textarea placeholder="Keywords (satu per baris)" value={c.keywords.join("\n")} onChange={(e) => updateOne(c.id, { keywords: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} className="w-full min-h-[60px] rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <DialogFooter><Button variant="outline" onClick={() => { setEditId(null); setAdding(false); }}>Tutup</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function TopHashtagsEditor({ items, onUpdate }: { items: TopHashtagItem[]; onUpdate: (v: TopHashtagItem[]) => void }) {
  const list = items ?? [];
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const updateOne = (id: string, u: Partial<TopHashtagItem>) => onUpdate(list.map((x) => (x.id === id ? { ...x, ...u } : x)));
  const add = () => { const newItem = { id: generateId(), tag: "", likes: 0, comments: 0 }; onUpdate([...list, newItem]); setEditId(newItem.id); setAdding(true); };
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah hashtag
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Tag</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Likes</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Comments</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{row.tag}</td>
                <td className="px-4 py-3">{(row.likes ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3">{(row.comments ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditId(row.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((x) => x.id !== row.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editId && (() => {
        const row = list.find((x) => x.id === editId);
        if (!row) return null;
        return (
          <Dialog open onOpenChange={(o) => !o && (setEditId(null), setAdding(false))}>
            <DialogContent className="rounded-2xl sm:max-w-sm">
              <DialogHeader><DialogTitle>{adding ? "Tambah hashtag" : "Edit"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Tag (e.g. #BrandX)" value={row.tag} onChange={(e) => updateOne(row.id, { tag: e.target.value })} className="rounded-xl" />
                <Input type="number" placeholder="Likes" value={row.likes} onChange={(e) => updateOne(row.id, { likes: Number(e.target.value) || 0 })} className="rounded-xl" />
                <Input type="number" placeholder="Comments" value={row.comments} onChange={(e) => updateOne(row.id, { comments: Number(e.target.value) || 0 })} className="rounded-xl" />
              </div>
              <DialogFooter><Button variant="outline" onClick={() => { setEditId(null); setAdding(false); }}>Tutup</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function TopAccountsEditor({ items, onUpdate }: { items: TopAccountItem[]; onUpdate: (v: TopAccountItem[]) => void }) {
  const list = items ?? [];
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const updateOne = (id: string, u: Partial<TopAccountItem>) => onUpdate(list.map((x) => (x.id === id ? { ...x, ...u } : x)));
  const add = () => { const newItem = { id: generateId(), name: "", handle: "", platform: "Twitter", followers: 0, conversations: 0, likes: 0, replies: 0 }; onUpdate([...list, newItem]); setEditId(newItem.id); setAdding(true); };
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah akun
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Handle</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Platform</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Followers</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3 text-slate-600">{row.handle}</td>
                <td className="px-4 py-3">{row.platform}</td>
                <td className="px-4 py-3">{row.followers.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditId(row.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((x) => x.id !== row.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editId && (() => {
        const row = list.find((x) => x.id === editId);
        if (!row) return null;
        return (
          <Dialog open onOpenChange={(o) => !o && (setEditId(null), setAdding(false))}>
            <DialogContent className="rounded-2xl sm:max-w-sm">
              <DialogHeader><DialogTitle>{adding ? "Tambah akun" : "Edit"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Name" value={row.name} onChange={(e) => updateOne(row.id, { name: e.target.value })} className="rounded-xl" />
                <Input placeholder="Handle" value={row.handle} onChange={(e) => updateOne(row.id, { handle: e.target.value })} className="rounded-xl" />
                <Input placeholder="Platform" value={row.platform} onChange={(e) => updateOne(row.id, { platform: e.target.value })} className="rounded-xl" />
                <Input type="number" placeholder="Followers" value={row.followers} onChange={(e) => updateOne(row.id, { followers: Number(e.target.value) || 0 })} className="rounded-xl" />
                <Input type="number" placeholder="Conversations" value={row.conversations} onChange={(e) => updateOne(row.id, { conversations: Number(e.target.value) || 0 })} className="rounded-xl" />
                <Input type="number" placeholder="Likes" value={row.likes} onChange={(e) => updateOne(row.id, { likes: Number(e.target.value) || 0 })} className="rounded-xl" />
                <Input type="number" placeholder="Replies" value={row.replies} onChange={(e) => updateOne(row.id, { replies: Number(e.target.value) || 0 })} className="rounded-xl" />
              </div>
              <DialogFooter><Button variant="outline" onClick={() => { setEditId(null); setAdding(false); }}>Tutup</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function TopContentsEditor({ items, onUpdate }: { items: TopContentItem[]; onUpdate: (v: TopContentItem[]) => void }) {
  const list = items ?? [];
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const updateOne = (id: string, u: Partial<TopContentItem>) => onUpdate(list.map((x) => (x.id === id ? { ...x, ...u } : x)));
  const add = () => { const newItem = { id: generateId(), title: "", platform: "", author: "", likes: 0, comments: 0 }; onUpdate([...list, newItem]); setEditId(newItem.id); setAdding(true); };
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah konten
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Platform</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Author</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Likes</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium max-w-[200px] truncate">{row.title}</td>
                <td className="px-4 py-3">{row.platform}</td>
                <td className="px-4 py-3 text-slate-600">{row.author}</td>
                <td className="px-4 py-3">{(row.likes ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditId(row.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((x) => x.id !== row.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editId && (() => {
        const row = list.find((x) => x.id === editId);
        if (!row) return null;
        return (
          <Dialog open onOpenChange={(o) => !o && (setEditId(null), setAdding(false))}>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader><DialogTitle>{adding ? "Tambah konten" : "Edit"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Title" value={row.title} onChange={(e) => updateOne(row.id, { title: e.target.value })} className="rounded-xl" />
                <Input placeholder="Platform" value={row.platform} onChange={(e) => updateOne(row.id, { platform: e.target.value })} className="rounded-xl" />
                <Input placeholder="Author" value={row.author} onChange={(e) => updateOne(row.id, { author: e.target.value })} className="rounded-xl" />
                <Input type="number" placeholder="Likes" value={row.likes} onChange={(e) => updateOne(row.id, { likes: Number(e.target.value) || 0 })} className="rounded-xl" />
                <Input type="number" placeholder="Comments" value={row.comments} onChange={(e) => updateOne(row.id, { comments: Number(e.target.value) || 0 })} className="rounded-xl" />
              </div>
              <DialogFooter><Button variant="outline" onClick={() => { setEditId(null); setAdding(false); }}>Tutup</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function KOLMatrixEditor({
  items,
  onUpdate,
  aiAnalysis,
  onUpdateAi,
}: {
  items: KOLMatrixItem[];
  onUpdate: (v: KOLMatrixItem[]) => void;
  aiAnalysis: AIKOLAnalysisItem[];
  onUpdateAi: (v: AIKOLAnalysisItem[]) => void;
}) {
  const list = items ?? [];
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [aiEditId, setAiEditId] = useState<string | null>(null);
  const [aiAdding, setAiAdding] = useState(false);
  const updateOne = (id: string, u: Partial<KOLMatrixItem>) => onUpdate(list.map((x) => (x.id === id ? { ...x, ...u } : x)));
  const add = () => { const newItem = { id: generateId(), name: "", followers: 0, positivity: 0, engagement: 0, color: "#8b5cf6", category: "" }; onUpdate([...list, newItem]); setEditId(newItem.id); setAdding(true); };
  const aiList = aiAnalysis ?? [];
  const updateAi = (id: string, u: Partial<AIKOLAnalysisItem>) => onUpdateAi(aiList.map((a) => (a.id === id ? { ...a, ...u } : a)));
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Tambah KOL
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Followers</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Positivity %</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Engagement</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Category</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">{row.followers.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.positivity}%</td>
                  <td className="px-4 py-3">{row.engagement.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.category}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditId(row.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((x) => x.id !== row.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editId && (() => {
          const row = list.find((x) => x.id === editId);
          if (!row) return null;
          return (
            <Dialog open onOpenChange={(o) => !o && (setEditId(null), setAdding(false))}>
              <DialogContent className="rounded-2xl sm:max-w-sm">
                <DialogHeader><DialogTitle>{adding ? "Tambah KOL" : "Edit"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Name" value={row.name} onChange={(e) => updateOne(row.id, { name: e.target.value })} className="rounded-xl" />
                  <Input type="number" placeholder="Followers" value={row.followers} onChange={(e) => updateOne(row.id, { followers: Number(e.target.value) || 0 })} className="rounded-xl" />
                  <Input type="number" placeholder="Positivity %" value={row.positivity} onChange={(e) => updateOne(row.id, { positivity: Number(e.target.value) || 0 })} className="rounded-xl" />
                  <Input type="number" placeholder="Engagement" value={row.engagement} onChange={(e) => updateOne(row.id, { engagement: Number(e.target.value) || 0 })} className="rounded-xl" />
                  <Input placeholder="Category" value={row.category} onChange={(e) => updateOne(row.id, { category: e.target.value })} className="rounded-xl" />
                  <Input placeholder="Color (#hex)" value={row.color} onChange={(e) => updateOne(row.id, { color: e.target.value })} className="rounded-xl" />
                </div>
                <DialogFooter><Button variant="outline" onClick={() => { setEditId(null); setAdding(false); }}>Tutup</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })()}
      </div>
      <div className="border-t border-slate-200 pt-6">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">AI KOL Analysis</h4>
        <div className="flex justify-end mb-3">
          <Button onClick={() => { const newItem = { id: generateId(), type: "insight" as const, title: "", description: "" }; onUpdateAi([...aiList, newItem]); setAiEditId(newItem.id); setAiAdding(true); }} className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200">
            <Plus className="w-4 h-4 mr-2" />
            Tambah analisis
          </Button>
        </div>
        <div className="space-y-2">
          {aiList.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 bg-slate-50">
              <div className="min-w-0 flex-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{a.type}</span>
                <p className="font-medium text-slate-900 mt-1 truncate">{a.title || "—"}</p>
                <p className="text-xs text-slate-600 truncate">{a.description || "—"}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAiEditId(a.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdateAi(aiList.filter((x) => x.id !== a.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
        {(aiEditId || aiAdding) && (() => {
          const a = aiList.find((x) => x.id === aiEditId);
          if (!a) return null;
          return (
            <Dialog open onOpenChange={(o) => !o && (setAiEditId(null), setAiAdding(false))}>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader><DialogTitle>AI KOL Analysis</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <select value={a.type} onChange={(e) => updateAi(a.id, { type: e.target.value as AIKOLAnalysisItem["type"] })} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                    <option value="critical">critical</option>
                    <option value="opportunity">opportunity</option>
                    <option value="insight">insight</option>
                  </select>
                  <Input placeholder="Title" value={a.title} onChange={(e) => updateAi(a.id, { title: e.target.value })} className="rounded-xl" />
                  <textarea placeholder="Description" value={a.description} onChange={(e) => updateAi(a.id, { description: e.target.value })} className="w-full min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <DialogFooter><Button variant="outline" onClick={() => { setAiEditId(null); setAiAdding(false); }}>Tutup</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })()}
      </div>
    </div>
  );
}

function ShareOfPlatformEditor({ items, onUpdate }: { items: ShareOfPlatformRow[]; onUpdate: (v: ShareOfPlatformRow[]) => void }) {
  const list = items ?? [];
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const platforms = ["twitter", "youtube", "reddit", "instagram", "facebook", "tiktok"] as const;
  const add = () => onUpdate([...list, { date: "", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 }]);
  const updateRow = (idx: number, u: Partial<ShareOfPlatformRow>) => onUpdate(list.map((r, i) => (i === idx ? { ...r, ...u } : r)));
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah baris
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
              {platforms.map((p) => (
                <th key={p} className="px-4 py-3 text-left font-semibold text-slate-700">{p}</th>
              ))}
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-3">{row.date}</td>
                {platforms.map((p) => (
                  <td key={p} className="px-4 py-3">{row[p].toLocaleString()}</td>
                ))}
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditIdx(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editIdx !== null && list[editIdx] && (
        <Dialog open onOpenChange={(o) => !o && (setEditIdx(null), setAdding(false))}>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader><DialogTitle>Edit baris</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Date" value={list[editIdx].date} onChange={(e) => updateRow(editIdx, { date: e.target.value })} className="rounded-xl" />
              {platforms.map((p) => (
                <Input key={p} type="number" placeholder={p} value={list[editIdx][p]} onChange={(e) => updateRow(editIdx, { [p]: Number(e.target.value) || 0 })} className="rounded-xl" />
              ))}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { setEditIdx(null); setAdding(false); }}>Tutup</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Competitor Overview Editor ─────────────────────────────────────────────
function CompetitorOverviewEditor({
  items,
  onUpdate,
}: {
  items: CompetitiveMatrixItem[];
  onUpdate: (v: CompetitiveMatrixItem[]) => void;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const updateOne = (id: string, patch: Partial<CompetitiveMatrixItem>) => {
    onUpdate(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const handleAdd = () => {
    const newItem: CompetitiveMatrixItem = {
      id: `brand_${Date.now()}`,
      name: "",
      mentions: 0,
      positivePercentage: 0,
      size: 10,
      color: "#8b5cf6",
      keywords: [],
      competitivePosition: "",
    };
    onUpdate([...items, newItem]);
    setEditId(newItem.id);
    setAdding(true);
  };

  const handleDelete = (id: string) => {
    onUpdate(items.filter((x) => x.id !== id));
  };

  const totalMentions = items.reduce((s, x) => s + (x.mentions ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Competitor Overview</h3>
          <p className="text-xs text-slate-500 mt-0.5">Keywords &amp; posisi kompetitif tiap brand</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Tambah brand
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-sm">Belum ada data. Klik "Tambah brand".</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const sov = totalMentions > 0 ? ((item.mentions / totalMentions) * 100).toFixed(1) : "0.0";
            const initials = item.name ? item.name.slice(0, 2).toUpperCase() : "?";
            return (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: item.color || "#8b5cf6" }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{item.name || <span className="text-slate-400 italic">Nama brand</span>}</p>
                    <p className="text-[11px] text-slate-400">Competitor</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditId(item.id); setAdding(false); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Keywords</p>
                  {(item.keywords ?? []).length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {(item.keywords ?? []).map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 rounded-full text-[11px] font-medium border"
                          style={{ backgroundColor: `${item.color}15`, color: item.color, borderColor: `${item.color}40` }}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 italic">Belum ada keyword</p>
                  )}
                </div>

                {/* Competitive Position */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Competitive Position</p>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {item.competitivePosition || <span className="italic text-slate-300">Belum ada deskripsi</span>}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-800">{item.mentions.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">Conversations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-800">{sov}%</p>
                    <p className="text-[10px] text-slate-400">Share of Voice</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-800">{item.positivePercentage}%</p>
                    <p className="text-[10px] text-slate-400">Avg Sentiment</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      {editId && (() => {
        const row = items.find((x) => x.id === editId);
        if (!row) return null;
        const kwString = (row.keywords ?? []).join(", ");
        return (
          <Dialog open onOpenChange={(o) => { if (!o) { setEditId(null); setAdding(false); } }}>
            <DialogContent className="rounded-2xl sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{adding ? "Tambah brand" : `Edit — ${row.name || "Brand"}`}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Nama Brand</label>
                  <Input
                    placeholder="Nama brand..."
                    value={row.name}
                    onChange={(e) => updateOne(row.id, { name: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Mentions</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={row.mentions}
                      onChange={(e) => updateOne(row.id, { mentions: Number(e.target.value) })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Positive % (Avg Sentiment)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      min={0}
                      max={100}
                      value={row.positivePercentage}
                      onChange={(e) => updateOne(row.id, { positivePercentage: Number(e.target.value) })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Warna Brand</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={row.color || "#8b5cf6"}
                      onChange={(e) => updateOne(row.id, { color: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <Input
                      value={row.color || "#8b5cf6"}
                      onChange={(e) => updateOne(row.id, { color: e.target.value })}
                      className="rounded-xl flex-1 font-mono text-sm"
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Keywords <span className="text-slate-400">(pisahkan dengan koma)</span>
                  </label>
                  <Input
                    placeholder="pelayanan, ramah, treatment, promo, ..."
                    value={kwString}
                    onChange={(e) =>
                      updateOne(row.id, { keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) })
                    }
                    className="rounded-xl"
                  />
                  {(row.keywords ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(row.keywords ?? []).map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 rounded-full text-[11px] border"
                          style={{ backgroundColor: `${row.color}15`, color: row.color, borderColor: `${row.color}40` }}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Competitive Position</label>
                  <textarea
                    rows={4}
                    placeholder="Deskripsi posisi kompetitif brand ini di pasar..."
                    value={row.competitivePosition ?? ""}
                    onChange={(e) => updateOne(row.id, { competitivePosition: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setEditId(null); setAdding(false); }}>
                  Selesai
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function CompetitiveMatrixEditor({
  matrixItems,
  onUpdateMatrix,
  quadrantItems,
  onUpdateQuadrant,
}: {
  matrixItems: CompetitiveMatrixItem[];
  onUpdateMatrix: (v: CompetitiveMatrixItem[]) => void;
  quadrantItems: QuadrantAnalysisItem[];
  onUpdateQuadrant: (v: QuadrantAnalysisItem[]) => void;
}) {
  const list = matrixItems ?? [];
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const quads = quadrantItems ?? [];
  const [quadEditId, setQuadEditId] = useState<string | null>(null);
  const [quadAdding, setQuadAdding] = useState(false);
  const updateOne = (id: string, u: Partial<CompetitiveMatrixItem>) => onUpdateMatrix(list.map((x) => (x.id === id ? { ...x, ...u } : x)));
  const add = () => { const newItem: CompetitiveMatrixItem = { id: generateId(), name: "", mentions: 0, positivePercentage: 0, size: 0, color: "#8b5cf6", keywords: [], competitivePosition: "" }; onUpdateMatrix([...list, newItem]); setEditId(newItem.id); setAdding(true); };
  const updateQuad = (id: string, u: Partial<QuadrantAnalysisItem>) => onUpdateQuadrant(quads.map((q) => (q.id === id ? { ...q, ...u } : q)));
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-800">Competitor Overview & Matrix Data</h4>
        <div className="flex justify-end">
          <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Tambah brand
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Brand</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Mentions</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Sentiment %</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Keywords</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Competitive Position</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: row.color || "#8b5cf6" }} />
                      <span className="font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.mentions.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.positivePercentage}%</td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <div className="flex flex-wrap gap-1">
                      {(row.keywords ?? []).slice(0, 3).map((kw) => (
                        <span key={kw} className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 border border-slate-200">{kw}</span>
                      ))}
                      {(row.keywords ?? []).length > 3 && (
                        <span className="text-[10px] text-slate-400">+{(row.keywords ?? []).length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="text-xs text-slate-600 line-clamp-2">{row.competitivePosition || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditId(row.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdateMatrix(list.filter((x) => x.id !== row.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editId && (() => {
          const row = list.find((x) => x.id === editId);
          if (!row) return null;
          const kwString = (row.keywords ?? []).join(", ");
          return (
            <Dialog open onOpenChange={(o) => !o && (setEditId(null), setAdding(false))}>
              <DialogContent className="rounded-2xl sm:max-w-lg">
                <DialogHeader><DialogTitle>{adding ? "Tambah brand" : `Edit — ${row.name || "Brand"}`}</DialogTitle></DialogHeader>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Brand Name</label>
                      <Input placeholder="Nama brand" value={row.name} onChange={(e) => updateOne(row.id, { name: e.target.value })} className="rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Color (#hex)</label>
                      <div className="flex gap-2">
                        <input type="color" value={row.color || "#8b5cf6"} onChange={(e) => updateOne(row.id, { color: e.target.value })} className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer p-1" />
                        <Input placeholder="#hex" value={row.color} onChange={(e) => updateOne(row.id, { color: e.target.value })} className="rounded-xl flex-1" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Mentions</label>
                      <Input type="number" placeholder="0" value={row.mentions} onChange={(e) => updateOne(row.id, { mentions: Number(e.target.value) || 0 })} className="rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Positive % (0–100)</label>
                      <Input type="number" placeholder="0" value={row.positivePercentage} onChange={(e) => updateOne(row.id, { positivePercentage: Number(e.target.value) || 0 })} className="rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Size (bubble)</label>
                      <Input type="number" placeholder="0" value={row.size} onChange={(e) => updateOne(row.id, { size: Number(e.target.value) || 0 })} className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Keywords <span className="text-slate-400">(pisahkan dengan koma)</span></label>
                    <Input
                      placeholder="pelayanan, ramah, treatment, promo, ..."
                      value={kwString}
                      onChange={(e) => updateOne(row.id, { keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) })}
                      className="rounded-xl"
                    />
                    {(row.keywords ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(row.keywords ?? []).map((kw) => (
                          <span key={kw} className="px-2 py-0.5 rounded-full text-[11px] bg-violet-50 text-violet-700 border border-violet-200">{kw}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Competitive Position</label>
                    <textarea
                      rows={3}
                      placeholder="Deskripsi posisi kompetitif brand ini di pasar..."
                      value={row.competitivePosition ?? ""}
                      onChange={(e) => updateOne(row.id, { competitivePosition: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 resize-none"
                    />
                  </div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => { setEditId(null); setAdding(false); }}>Tutup</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })()}
      </div>
      <div className="border-t border-slate-200 pt-6">
        <h4 className="text-sm font-semibold text-slate-800 mb-3">Quadrant Analysis</h4>
        <div className="flex justify-end mb-3">
          <Button onClick={() => { const newItem = { id: generateId(), label: "", brands: "", note: "" }; onUpdateQuadrant([...quads, newItem]); setQuadEditId(newItem.id); setQuadAdding(true); }} className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200">
            <Plus className="w-4 h-4 mr-2" />
            Tambah quadrant
          </Button>
        </div>
        <div className="space-y-2">
          {quads.map((q) => (
            <div key={q.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 bg-slate-50">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{q.label || "—"}</p>
                <p className="text-xs text-slate-600">Brands: {q.brands || "—"}</p>
                <p className="text-xs text-slate-500">{q.note || "—"}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuadEditId(q.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdateQuadrant(quads.filter((x) => x.id !== q.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
        {(quadEditId || quadAdding) && (() => {
          const q = quads.find((x) => x.id === quadEditId);
          if (!q) return null;
          return (
            <Dialog open onOpenChange={(o) => !o && (setQuadEditId(null), setQuadAdding(false))}>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader><DialogTitle>Quadrant Analysis</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Label" value={q.label} onChange={(e) => updateQuad(q.id, { label: e.target.value })} className="rounded-xl" />
                  <Input placeholder="Brands" value={q.brands} onChange={(e) => updateQuad(q.id, { brands: e.target.value })} className="rounded-xl" />
                  <Input placeholder="Note" value={q.note} onChange={(e) => updateQuad(q.id, { note: e.target.value })} className="rounded-xl" />
                </div>
                <DialogFooter><Button variant="outline" onClick={() => { setQuadEditId(null); setQuadAdding(false); }}>Tutup</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })()}
      </div>
    </div>
  );
}

const HEATMAP_COLS = ["yourBrand", "competitorA", "competitorB", "competitorC", "competitorD"] as const;

function CompetitiveHeatmapEditor({
  title,
  items,
  onUpdate,
  valueLabel,
  brandLabels,
  competitiveMatrixItems,
}: {
  title: string;
  items: CompetitiveHeatmapRow[];
  onUpdate: (v: CompetitiveHeatmapRow[]) => void;
  valueLabel: string;
  brandLabels?: CompetitiveBrandLabels | undefined;
  competitiveMatrixItems?: CompetitiveMatrixItem[];
}) {
  const list = items ?? [];
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  
  // Generate all brand names from competitiveMatrixItems
  const allBrands = competitiveMatrixItems && competitiveMatrixItems.length > 0
    ? competitiveMatrixItems.map(item => item.name)
    : (brandLabels ? [brandLabels.yourBrand, brandLabels.competitorA, brandLabels.competitorB, brandLabels.competitorC, brandLabels.competitorD] : ["Your Brand", "Competitor A", "Competitor B", "Competitor C", "Competitor D"]);
  
  // Helper: support full row (row[brandName]) and legacy 5-column (yourBrand, competitorA–D)
  const getBrandValue = (row: CompetitiveHeatmapRow, brandName: string): number => {
    const direct = row[brandName];
    if (typeof direct === "number") return direct;
    if (typeof direct === "string") return parseFloat(direct) || 0;
    if (brandLabels) {
      if (brandName === brandLabels.yourBrand) return (row.yourBrand as number) ?? 0;
      if (brandName === brandLabels.competitorA) return (row.competitorA as number) ?? 0;
      if (brandName === brandLabels.competitorB) return (row.competitorB as number) ?? 0;
      if (brandName === brandLabels.competitorC) return (row.competitorC as number) ?? 0;
      if (brandName === brandLabels.competitorD) return (row.competitorD as number) ?? 0;
    }
    return 0;
  };
  
  const add = () => onUpdate([...list, { issue: "", yourBrand: 0, competitorA: 0, competitorB: 0, competitorC: 0, competitorD: 0 }]);
  const updateRow = (idx: number, u: Partial<CompetitiveHeatmapRow>) => onUpdate(list.map((r, i) => (i === idx ? { ...r, ...u } : r)));
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <div className="flex justify-end">
        <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah baris
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm min-w-max">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 sticky left-0 bg-slate-50 z-10 min-w-[120px]">Issue</th>
              {allBrands.map((brandName, i) => (
                <th key={i} className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">{brandName}</th>
              ))}
              <th className="px-4 py-3 text-right font-semibold text-slate-700 sticky right-0 bg-slate-50 z-10">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium sticky left-0 bg-white z-10">{row.issue}</td>
                {allBrands.map((brandName, colIdx) => {
                  const value = getBrandValue(row, brandName);
                  return (
                    <td key={colIdx} className="px-4 py-3 whitespace-nowrap">
                      {typeof value === "number" && value % 1 !== 0 ? value.toFixed(2) : value.toLocaleString()}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right sticky right-0 bg-white z-10">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditIdx(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editIdx !== null && list[editIdx] && (
        <Dialog open onOpenChange={(o) => !o && (setEditIdx(null), setAdding(false))}>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader><DialogTitle>Edit baris ({valueLabel})</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Issue" value={list[editIdx].issue} onChange={(e) => updateRow(editIdx, { issue: e.target.value })} className="rounded-xl" />
              {HEATMAP_COLS.map((c) => {
                const brandName = brandLabels 
                  ? (c === "yourBrand" ? brandLabels.yourBrand : c === "competitorA" ? brandLabels.competitorA : c === "competitorB" ? brandLabels.competitorB : c === "competitorC" ? brandLabels.competitorC : brandLabels.competitorD)
                  : c;
                return (
                  <Input key={c} type="number" step={valueLabel.includes("Score") ? 0.01 : 1} placeholder={brandName} value={list[editIdx][c]} onChange={(e) => updateRow(editIdx, { [c]: valueLabel.includes("Score") ? Number(e.target.value) || 0 : Number(e.target.value) || 0 })} className="rounded-xl" />
                );
              })}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => { setEditIdx(null); setAdding(false); }}>Tutup</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ShareOfVoiceEditor({ items, onUpdate, brandLabels }: { items: ShareOfVoiceRow[]; onUpdate: (v: ShareOfVoiceRow[]) => void; brandLabels?: CompetitiveBrandLabels | undefined }) {
  const list = items ?? [];
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const cols = ["yourBrand", "competitorA", "competitorB", "competitorC", "competitorD"] as const;
  const labels = brandLabels ? [brandLabels.yourBrand, brandLabels.competitorA, brandLabels.competitorB, brandLabels.competitorC, brandLabels.competitorD] : ["Your Brand", "Competitor A", "Competitor B", "Competitor C", "Competitor D"];
  const add = () => onUpdate([...list, { date: "", yourBrand: 0, competitorA: 0, competitorB: 0, competitorC: 0, competitorD: 0 }]);
  const updateRow = (idx: number, u: Partial<ShareOfVoiceRow>) => onUpdate(list.map((r, i) => (i === idx ? { ...r, ...u } : r)));
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-slate-800">Share of Voice (per date)</h4>
      <div className="flex justify-end">
        <Button onClick={add} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah baris
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
              {labels.map((l, i) => (
                <th key={i} className="px-4 py-3 text-left font-semibold text-slate-700">{l}</th>
              ))}
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-3">{row.date}</td>
                {cols.map((c) => (
                  <td key={c} className="px-4 py-3">{row[c].toLocaleString()}</td>
                ))}
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditIdx(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(list.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editIdx !== null && list[editIdx] && (
        <Dialog open onOpenChange={(o) => !o && setEditIdx(null)}>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader><DialogTitle>Edit baris</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Date" value={list[editIdx].date} onChange={(e) => updateRow(editIdx, { date: e.target.value })} className="rounded-xl" />
              {cols.map((c) => (
                <Input key={c} type="number" placeholder={c} value={list[editIdx][c]} onChange={(e) => updateRow(editIdx, { [c]: Number(e.target.value) || 0 })} className="rounded-xl" />
              ))}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setEditIdx(null)}>Tutup</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Campaign Section ──────────────────────────────────────────────────────

type CampaignSubTab = "stats" | "performance" | "channels" | "competitors" | "recommendations" | "replyTopics" | "keyEvents" | "postEvents";

function CampaignSection({
  store,
  updateStore,
  activeSubTab,
  onSubTabChange,
}: {
  store: DashboardContentStore;
  updateStore: (fn: (p: DashboardContentStore) => DashboardContentStore) => void;
  activeSubTab: CampaignSubTab;
  onSubTabChange: (t: CampaignSubTab) => void;
}) {
  const subTabs: { id: CampaignSubTab; label: string }[] = [
    { id: "stats",           label: "KPI Stats" },
    { id: "performance",     label: "Campaigns" },
    { id: "channels",        label: "Channels" },
    { id: "competitors",     label: "Competitors" },
    { id: "recommendations", label: "Recommendations" },
    { id: "replyTopics",     label: "Reply Topics" },
    { id: "keyEvents",       label: "Key Events" },
    { id: "postEvents",      label: "Post Events" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onSubTabChange(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeSubTab === t.id ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeSubTab === "stats" && (
        <CampaignStatsSection
          items={store.campaignStats ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, campaignStats: v }))}
        />
      )}
      {activeSubTab === "performance" && (
        <CampaignPerformanceSection
          items={store.campaignPerformance ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, campaignPerformance: v }))}
        />
      )}
      {activeSubTab === "channels" && (
        <CampaignChannelsSection
          items={store.campaignChannels ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, campaignChannels: v }))}
        />
      )}
      {activeSubTab === "competitors" && (
        <CampaignCompetitorsSection
          items={store.campaignCompetitors ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, campaignCompetitors: v }))}
        />
      )}
      {activeSubTab === "recommendations" && (
        <CampaignRecommendationsSection
          items={store.campaignRecommendations ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, campaignRecommendations: v }))}
        />
      )}
      {activeSubTab === "replyTopics" && (
        <CampaignReplyTopicsSection
          items={store.campaignReplyTopics ?? []}
          overall={store.campaignReplySentiment ?? { positive: 74, neutral: 16, negative: 10 }}
          onUpdateItems={(v) => updateStore((p) => ({ ...p, campaignReplyTopics: v }))}
          onUpdateOverall={(v) => updateStore((p) => ({ ...p, campaignReplySentiment: v }))}
        />
      )}
      {activeSubTab === "keyEvents" && (
        <CampaignKeyEventsSection
          items={store.campaignKeyEvents ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, campaignKeyEvents: v }))}
        />
      )}
      {activeSubTab === "postEvents" && (
        <CampaignPostEventsSection
          items={store.campaignPostPublishEvents ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, campaignPostPublishEvents: v }))}
        />
      )}
    </div>
  );
}

function CampaignStatsSection({ items, onUpdate }: { items: CampaignStatItem[]; onUpdate: (v: CampaignStatItem[]) => void }) {
  const [editing, setEditing] = useState<CampaignStatItem | null>(null);
  const [adding, setAdding] = useState(false);
  const blank: Omit<CampaignStatItem, "id"> = { label: "", value: "", change: "", positive: true, description: "", icon: "Heart" };
  const [form, setForm] = useState<Omit<CampaignStatItem, "id">>(blank);

  const openEdit = (item: CampaignStatItem) => { setEditing({ ...item }); setAdding(false); };
  const openAdd = () => { setForm(blank); setAdding(true); setEditing(null); };
  const close = () => { setEditing(null); setAdding(false); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90"><Plus className="w-4 h-4 mr-2" />Add stat</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="rounded-2xl border-slate-200 overflow-hidden hover:border-violet-300 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{item.label}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(item)}><Pencil className="w-3.5 h-3.5 text-slate-500" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600" onClick={() => onUpdate(items.filter((i) => i.id !== item.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-bold text-slate-900 mb-1">{item.value}</p>
              <p className="text-xs text-slate-500">{item.change} · {item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {(editing || adding) && (
        <Dialog open onOpenChange={(o) => !o && close()}>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader><DialogTitle>{adding ? "Tambah stat" : "Edit stat"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {[
                { key: "label", label: "Label", placeholder: "Total Likes" },
                { key: "value", label: "Value", placeholder: "186K" },
                { key: "change", label: "Change", placeholder: "+22%" },
                { key: "description", label: "Description", placeholder: "Total likes..." },
                { key: "icon", label: "Icon (Heart/Share2/MessageCircle)", placeholder: "Heart" },
              ].map(({ key, label: lbl, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">{lbl}</label>
                  <Input
                    placeholder={placeholder}
                    value={adding ? String((form as any)[key] ?? "") : String((editing as any)?.[key] ?? "")}
                    onChange={(e) => {
                      if (adding) setForm((p) => ({ ...p, [key]: e.target.value }));
                      else setEditing((p) => p ? { ...p, [key]: e.target.value } : p);
                    }}
                    className="rounded-xl"
                  />
                </div>
              ))}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-600">Positive</label>
                <Switch
                  checked={adding ? form.positive : (editing?.positive ?? true)}
                  onCheckedChange={(v) => {
                    if (adding) setForm((p) => ({ ...p, positive: v }));
                    else setEditing((p) => p ? { ...p, positive: v } : p);
                  }}
                  className="data-[state=checked]:bg-violet-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={close} className="rounded-xl">Batal</Button>
              <Button onClick={() => {
                if (adding) { onUpdate([...items, { ...form, id: generateId() }]); close(); }
                else if (editing) { onUpdate(items.map((i) => i.id === editing.id ? editing : i)); close(); }
              }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CampaignPerformanceSection({ items, onUpdate }: { items: CampaignItem[]; onUpdate: (v: CampaignItem[]) => void }) {
  const [editing, setEditing] = useState<CampaignItem | null>(null);
  const [adding, setAdding] = useState(false);
  const blank: Omit<CampaignItem, "id"> = { name: "", platform: "", likes: 0, shares: 0, replies: 0, status: "active", sentiment: 0.7 };
  const [form, setForm] = useState<Omit<CampaignItem, "id">>(blank);

  const close = () => { setEditing(null); setAdding(false); };
  const isEditing = editing !== null;
  const cur = isEditing ? editing : form;
  const setCur = isEditing
    ? (fn: (p: CampaignItem) => CampaignItem) => setEditing((p) => p ? fn(p) : p)
    : (fn: (p: Omit<CampaignItem, "id">) => Omit<CampaignItem, "id">) => setForm(fn);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(blank); setAdding(true); setEditing(null); }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90"><Plus className="w-4 h-4 mr-2" />Add campaign</Button>
      </div>
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Campaign</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Platform</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Likes</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Shares</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Replies</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                <td className="px-4 py-3 text-slate-600">{c.platform}</td>
                <td className="px-4 py-3 text-right">{c.likes.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{c.shares.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{c.replies.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === "active" ? "bg-emerald-100 text-emerald-700" : c.status === "paused" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{c.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing({ ...c }); setAdding(false); }}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(items.filter((i) => i.id !== c.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(editing || adding) && (
        <Dialog open onOpenChange={(o) => !o && close()}>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader><DialogTitle>{adding ? "Tambah campaign" : "Edit campaign"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {[
                { key: "name", label: "Campaign Name", type: "text" },
                { key: "platform", label: "Platform", type: "text" },
                { key: "likes", label: "Likes", type: "number" },
                { key: "shares", label: "Shares", type: "number" },
                { key: "replies", label: "Replies", type: "number" },
                { key: "sentiment", label: "Sentiment (0-1)", type: "number" },
              ].map(({ key, label: lbl, type }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">{lbl}</label>
                  <Input type={type} step={key === "sentiment" ? 0.01 : 1}
                    value={String((cur as any)[key] ?? "")}
                    onChange={(e) => (setCur as any)((p: any) => ({ ...p, [key]: type === "number" ? Number(e.target.value) || 0 : e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Status</label>
                <select value={cur.status} onChange={(e) => (setCur as any)((p: any) => ({ ...p, status: e.target.value }))} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={close} className="rounded-xl">Batal</Button>
              <Button onClick={() => {
                if (adding) { onUpdate([...items, { ...(form as Omit<CampaignItem, "id">), id: generateId() }]); close(); }
                else if (editing) { onUpdate(items.map((i) => i.id === editing.id ? editing : i)); close(); }
              }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CampaignChannelsSection({ items, onUpdate }: { items: CampaignChannelItem[]; onUpdate: (v: CampaignChannelItem[]) => void }) {
  const [editing, setEditing] = useState<CampaignChannelItem | null>(null);
  const [adding, setAdding] = useState(false);
  const blank: Omit<CampaignChannelItem, "id"> = { name: "", likes: 0, replies: 0, shares: 0, posts: 0, icon: "", color: "from-slate-400 to-slate-600" };
  const [form, setForm] = useState<Omit<CampaignChannelItem, "id">>(blank);
  const close = () => { setEditing(null); setAdding(false); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(blank); setAdding(true); setEditing(null); }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90"><Plus className="w-4 h-4 mr-2" />Add channel</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <Card key={c.id} className="rounded-2xl border-slate-200 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xs font-bold`}>{c.icon}</div>
                  <span className="font-semibold text-slate-800">{c.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing({ ...c }); setAdding(false); }}><Pencil className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onUpdate(items.filter((i) => i.id !== c.id))}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
              <p className="text-xs text-slate-500">{c.posts} posts · {c.likes.toLocaleString()} likes</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {(editing || adding) && (() => {
        const cur = editing ?? form;
        const setCur = editing
          ? (fn: (p: CampaignChannelItem) => CampaignChannelItem) => setEditing((p) => p ? fn(p) : p)
          : (fn: (p: Omit<CampaignChannelItem, "id">) => Omit<CampaignChannelItem, "id">) => setForm(fn);
        return (
          <Dialog open onOpenChange={(o) => !o && close()}>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader><DialogTitle>{adding ? "Tambah channel" : "Edit channel"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {[
                  { key: "name", label: "Channel Name", type: "text" },
                  { key: "icon", label: "Icon Label (e.g. IG, TK, X)", type: "text" },
                  { key: "color", label: "Gradient CSS (e.g. from-pink-400 to-rose-500)", type: "text" },
                  { key: "posts", label: "Posts", type: "number" },
                  { key: "likes", label: "Likes", type: "number" },
                  { key: "replies", label: "Replies", type: "number" },
                  { key: "shares", label: "Shares", type: "number" },
                ].map(({ key, label: lbl, type }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">{lbl}</label>
                    <Input type={type}
                      value={String((cur as any)[key] ?? "")}
                      onChange={(e) => (setCur as any)((p: any) => ({ ...p, [key]: type === "number" ? Number(e.target.value) || 0 : e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close} className="rounded-xl">Batal</Button>
                <Button onClick={() => {
                  if (adding) { onUpdate([...items, { ...(form as Omit<CampaignChannelItem, "id">), id: generateId() }]); close(); }
                  else if (editing) { onUpdate(items.map((i) => i.id === editing.id ? editing : i)); close(); }
                }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function CampaignCompetitorsSection({ items, onUpdate }: { items: CampaignCompetitorItem[]; onUpdate: (v: CampaignCompetitorItem[]) => void }) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const blank: Omit<CampaignCompetitorItem, "id"> = { brand: "", posts: 0, likes: 0, replies: 0, shares: 0, sentiment: 0.7 };
  const [form, setForm] = useState<Omit<CampaignCompetitorItem, "id">>(blank);
  const close = () => { setEditIdx(null); setAdding(false); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(blank); setAdding(true); setEditIdx(null); }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90"><Plus className="w-4 h-4 mr-2" />Add competitor</Button>
      </div>
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Brand</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Posts</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Likes</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Replies</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Shares</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Sentiment</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((c, idx) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{c.brand}</td>
                <td className="px-4 py-3 text-right">{c.posts}</td>
                <td className="px-4 py-3 text-right">{c.likes.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{c.replies.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{c.shares.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{(c.sentiment * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditIdx(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onUpdate(items.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(editIdx !== null || adding) && (() => {
        const cur = editIdx !== null ? items[editIdx] : form;
        const setCur = editIdx !== null
          ? (fn: (p: CampaignCompetitorItem) => CampaignCompetitorItem) => onUpdate(items.map((item, i) => i === editIdx ? fn(item) : item))
          : (fn: (p: Omit<CampaignCompetitorItem, "id">) => Omit<CampaignCompetitorItem, "id">) => setForm(fn);
        return (
          <Dialog open onOpenChange={(o) => !o && close()}>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader><DialogTitle>{adding ? "Tambah competitor" : "Edit competitor"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {[
                  { key: "brand", label: "Brand Name", type: "text" },
                  { key: "posts", label: "Posts", type: "number" },
                  { key: "likes", label: "Likes", type: "number" },
                  { key: "replies", label: "Replies", type: "number" },
                  { key: "shares", label: "Shares", type: "number" },
                  { key: "sentiment", label: "Sentiment (0-1)", type: "number" },
                ].map(({ key, label: lbl, type }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">{lbl}</label>
                    <Input type={type} step={key === "sentiment" ? 0.01 : 1}
                      value={String((cur as any)[key] ?? "")}
                      onChange={(e) => (setCur as any)((p: any) => ({ ...p, [key]: type === "number" ? Number(e.target.value) || 0 : e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close} className="rounded-xl">Batal</Button>
                <Button onClick={() => {
                  if (adding) { onUpdate([...items, { ...(form as Omit<CampaignCompetitorItem, "id">), id: generateId() }]); close(); }
                  else { close(); }
                }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function CampaignRecommendationsSection({ items, onUpdate }: { items: CampaignRecommendationItem[]; onUpdate: (v: CampaignRecommendationItem[]) => void }) {
  const [editing, setEditing] = useState<CampaignRecommendationItem | null>(null);
  const [adding, setAdding] = useState(false);
  const blank: Omit<CampaignRecommendationItem, "id"> = { priority: "medium", title: "", detail: "", impact: "" };
  const [form, setForm] = useState<Omit<CampaignRecommendationItem, "id">>(blank);
  const close = () => { setEditing(null); setAdding(false); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(blank); setAdding(true); setEditing(null); }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90"><Plus className="w-4 h-4 mr-2" />Add recommendation</Button>
      </div>
      <div className="space-y-3">
        {items.map((rec) => (
          <Card key={rec.id} className="rounded-2xl border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rec.priority === "high" ? "bg-red-100 text-red-700" : rec.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{rec.priority}</span>
                    <span className="font-semibold text-slate-800 text-sm">{rec.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{rec.detail}</p>
                  <span className="text-xs text-violet-600 font-medium">{rec.impact}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing({ ...rec }); setAdding(false); }}><Pencil className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onUpdate(items.filter((i) => i.id !== rec.id))}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {(editing || adding) && (() => {
        const cur = editing ?? form;
        const setCur = editing
          ? (fn: (p: CampaignRecommendationItem) => CampaignRecommendationItem) => setEditing((p) => p ? fn(p) : p)
          : (fn: (p: Omit<CampaignRecommendationItem, "id">) => Omit<CampaignRecommendationItem, "id">) => setForm(fn);
        return (
          <Dialog open onOpenChange={(o) => !o && close()}>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader><DialogTitle>{adding ? "Tambah rekomendasi" : "Edit rekomendasi"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Priority</label>
                  <select value={cur.priority} onChange={(e) => (setCur as any)((p: any) => ({ ...p, priority: e.target.value }))} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                {[
                  { key: "title", label: "Title" },
                  { key: "detail", label: "Detail" },
                  { key: "impact", label: "Impact" },
                ].map(({ key, label: lbl }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">{lbl}</label>
                    <Input value={String((cur as any)[key] ?? "")} onChange={(e) => (setCur as any)((p: any) => ({ ...p, [key]: e.target.value }))} className="rounded-xl" />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close} className="rounded-xl">Batal</Button>
                <Button onClick={() => {
                  if (adding) { onUpdate([...items, { ...(form as Omit<CampaignRecommendationItem, "id">), id: generateId() }]); close(); }
                  else if (editing) { onUpdate(items.map((i) => i.id === editing.id ? editing : i)); close(); }
                }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function CampaignReplyTopicsSection({
  items, overall, onUpdateItems, onUpdateOverall,
}: {
  items: CampaignReplyTopicCluster[];
  overall: { positive: number; neutral: number; negative: number };
  onUpdateItems: (v: CampaignReplyTopicCluster[]) => void;
  onUpdateOverall: (v: { positive: number; neutral: number; negative: number }) => void;
}) {
  const [editing, setEditing] = useState<CampaignReplyTopicCluster | null>(null);
  const [adding, setAdding] = useState(false);
  const blank: Omit<CampaignReplyTopicCluster, "id"> = { topic: "", totalReplies: 0, positive: 70, neutral: 20, negative: 10, topComments: [] };
  const [form, setForm] = useState<Omit<CampaignReplyTopicCluster, "id">>(blank);
  const close = () => { setEditing(null); setAdding(false); };

  return (
    <div className="space-y-5">
      <Card className="rounded-2xl border-slate-200">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Overall Sentiment</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          {[
            { key: "positive", label: "Positive %" },
            { key: "neutral", label: "Neutral %" },
            { key: "negative", label: "Negative %" },
          ].map(({ key, label: lbl }) => (
            <div key={key}>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{lbl}</label>
              <Input type="number" min={0} max={100}
                value={(overall as any)[key]}
                onChange={(e) => onUpdateOverall({ ...overall, [key]: Number(e.target.value) || 0 })}
                className="rounded-xl"
              />
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={() => { setForm(blank); setAdding(true); setEditing(null); }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90"><Plus className="w-4 h-4 mr-2" />Add topic</Button>
      </div>
      <div className="space-y-3">
        {items.map((t) => (
          <Card key={t.id} className="rounded-2xl border-slate-200">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{t.topic}</p>
                <p className="text-xs text-slate-500">{t.totalReplies.toLocaleString()} replies · {t.positive}% pos · {t.negative}% neg</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing({ ...t, topComments: [...t.topComments] }); setAdding(false); }}><Pencil className="w-3 h-3" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onUpdateItems(items.filter((i) => i.id !== t.id))}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {(editing || adding) && (() => {
        const cur = editing ?? form;
        const setCur = editing
          ? (fn: (p: CampaignReplyTopicCluster) => CampaignReplyTopicCluster) => setEditing((p) => p ? fn(p) : p)
          : (fn: (p: Omit<CampaignReplyTopicCluster, "id">) => Omit<CampaignReplyTopicCluster, "id">) => setForm(fn);
        return (
          <Dialog open onOpenChange={(o) => !o && close()}>
            <DialogContent className="rounded-2xl sm:max-w-lg">
              <DialogHeader><DialogTitle>{adding ? "Tambah topic" : "Edit topic"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {[
                  { key: "topic", label: "Topic", type: "text" },
                  { key: "totalReplies", label: "Total Replies", type: "number" },
                  { key: "positive", label: "Positive %", type: "number" },
                  { key: "neutral", label: "Neutral %", type: "number" },
                  { key: "negative", label: "Negative %", type: "number" },
                ].map(({ key, label: lbl, type }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">{lbl}</label>
                    <Input type={type} value={String((cur as any)[key] ?? "")} onChange={(e) => (setCur as any)((p: any) => ({ ...p, [key]: type === "number" ? Number(e.target.value) || 0 : e.target.value }))} className="rounded-xl" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Top Comments (satu per baris)</label>
                  <textarea
                    rows={4}
                    value={(cur.topComments ?? []).join("\n")}
                    onChange={(e) => (setCur as any)((p: any) => ({ ...p, topComments: e.target.value.split("\n") }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close} className="rounded-xl">Batal</Button>
                <Button onClick={() => {
                  if (adding) { onUpdateItems([...items, { ...(form as Omit<CampaignReplyTopicCluster, "id">), id: generateId() }]); close(); }
                  else if (editing) { onUpdateItems(items.map((i) => i.id === editing.id ? editing : i)); close(); }
                }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function CampaignKeyEventsSection({ items, onUpdate }: { items: CampaignKeyEvent[]; onUpdate: (v: CampaignKeyEvent[]) => void }) {
  const [editing, setEditing] = useState<CampaignKeyEvent | null>(null);
  const [adding, setAdding] = useState(false);
  const blank: Omit<CampaignKeyEvent, "id"> = { date: "", title: "", type: "spike", insight: "" };
  const [form, setForm] = useState<Omit<CampaignKeyEvent, "id">>(blank);
  const close = () => { setEditing(null); setAdding(false); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(blank); setAdding(true); setEditing(null); }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90"><Plus className="w-4 h-4 mr-2" />Add event</Button>
      </div>
      <div className="space-y-3">
        {items.map((e) => (
          <Card key={e.id} className="rounded-2xl border-slate-200">
            <CardContent className="p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${e.type === "spike" ? "bg-amber-100 text-amber-700" : e.type === "pivot" ? "bg-violet-100 text-violet-700" : "bg-red-100 text-red-700"}`}>{e.type}</span>
                  <span className="text-xs text-slate-400">{e.date}</span>
                </div>
                <p className="font-semibold text-slate-800 text-sm">{e.title}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{e.insight}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing({ ...e }); setAdding(false); }}><Pencil className="w-3 h-3" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onUpdate(items.filter((i) => i.id !== e.id))}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {(editing || adding) && (() => {
        const cur = editing ?? form;
        const setCur = editing
          ? (fn: (p: CampaignKeyEvent) => CampaignKeyEvent) => setEditing((p) => p ? fn(p) : p)
          : (fn: (p: Omit<CampaignKeyEvent, "id">) => Omit<CampaignKeyEvent, "id">) => setForm(fn);
        return (
          <Dialog open onOpenChange={(o) => !o && close()}>
            <DialogContent className="rounded-2xl sm:max-w-lg">
              <DialogHeader><DialogTitle>{adding ? "Tambah key event" : "Edit key event"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Type</label>
                  <select value={cur.type} onChange={(e) => (setCur as any)((p: any) => ({ ...p, type: e.target.value }))} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                    <option value="spike">Spike</option>
                    <option value="pivot">Pivot</option>
                    <option value="drop">Drop</option>
                  </select>
                </div>
                {[
                  { key: "date", label: "Date (e.g. Jan 15)" },
                  { key: "title", label: "Title" },
                  { key: "insight", label: "AI Insight" },
                ].map(({ key, label: lbl }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">{lbl}</label>
                    <Input value={String((cur as any)[key] ?? "")} onChange={(e) => (setCur as any)((p: any) => ({ ...p, [key]: e.target.value }))} className="rounded-xl" />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close} className="rounded-xl">Batal</Button>
                <Button onClick={() => {
                  if (adding) { onUpdate([...items, { ...(form as Omit<CampaignKeyEvent, "id">), id: generateId() }]); close(); }
                  else if (editing) { onUpdate(items.map((i) => i.id === editing.id ? editing : i)); close(); }
                }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function CampaignPostEventsSection({ items, onUpdate }: { items: CampaignPostPublishEvent[]; onUpdate: (v: CampaignPostPublishEvent[]) => void }) {
  const [editing, setEditing] = useState<CampaignPostPublishEvent | null>(null);
  const [adding, setAdding] = useState(false);
  const blank: Omit<CampaignPostPublishEvent, "id"> = { date: "", label: "", type: "reel" };
  const [form, setForm] = useState<Omit<CampaignPostPublishEvent, "id">>(blank);
  const close = () => { setEditing(null); setAdding(false); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(blank); setAdding(true); setEditing(null); }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90"><Plus className="w-4 h-4 mr-2" />Add post event</Button>
      </div>
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Label</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Type</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-600">{p.date}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{p.label}</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-medium">{p.type}</span></td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing({ ...p }); setAdding(false); }}><Pencil className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onUpdate(items.filter((i) => i.id !== p.id))}><Trash2 className="w-3 h-3" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(editing || adding) && (() => {
        const cur = editing ?? form;
        const setCur = editing
          ? (fn: (p: CampaignPostPublishEvent) => CampaignPostPublishEvent) => setEditing((p) => p ? fn(p) : p)
          : (fn: (p: Omit<CampaignPostPublishEvent, "id">) => Omit<CampaignPostPublishEvent, "id">) => setForm(fn);
        return (
          <Dialog open onOpenChange={(o) => !o && close()}>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader><DialogTitle>{adding ? "Tambah post event" : "Edit post event"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Type</label>
                  <select value={cur.type} onChange={(e) => (setCur as any)((p: any) => ({ ...p, type: e.target.value }))} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                    <option value="reel">Reel</option>
                    <option value="thread">Thread</option>
                    <option value="carousel">Carousel</option>
                    <option value="image">Image</option>
                    <option value="short_video">Short Video</option>
                    <option value="live_stream">Live Stream</option>
                  </select>
                </div>
                {[
                  { key: "date", label: "Date (e.g. Jan 8)" },
                  { key: "label", label: "Label" },
                ].map(({ key, label: lbl }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">{lbl}</label>
                    <Input value={String((cur as any)[key] ?? "")} onChange={(e) => (setCur as any)((p: any) => ({ ...p, [key]: e.target.value }))} className="rounded-xl" />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close} className="rounded-xl">Batal</Button>
                <Button onClick={() => {
                  if (adding) { onUpdate([...items, { ...(form as Omit<CampaignPostPublishEvent, "id">), id: generateId() }]); close(); }
                  else if (editing) { onUpdate(items.map((i) => i.id === editing.id ? editing : i)); close(); }
                }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

// ─── Outlet Analysis Section ────────────────────────────────────────────────

type OutletAnalysisSubTab = "stats" | "priorityActions" | "mapData" | "sentimentByOutlet" | "topics" | "reviews";

function OutletAnalysisSection({
  store,
  updateStore,
  activeSubTab,
  onSubTabChange,
}: {
  store: DashboardContentStore;
  updateStore: (fn: (p: DashboardContentStore) => DashboardContentStore) => void;
  activeSubTab: OutletAnalysisSubTab;
  onSubTabChange: (t: OutletAnalysisSubTab) => void;
}) {
  const subTabs: { id: OutletAnalysisSubTab; label: string }[] = [
    { id: "stats",             label: "KPI Stats" },
    { id: "priorityActions",   label: "Priority Actions" },
    { id: "mapData",           label: "Outlet Map Data" },
    { id: "sentimentByOutlet", label: "Sentiment Per Outlet" },
    { id: "topics",            label: "Topics" },
    { id: "reviews",           label: "Recent Reviews" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onSubTabChange(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeSubTab === t.id ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeSubTab === "stats" && (
        <OutletStatsSection
          items={store.outletStats ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, outletStats: v }))}
        />
      )}
      {activeSubTab === "priorityActions" && (
        <OutletPriorityActionsSection
          items={store.outletPriorityActions ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, outletPriorityActions: v }))}
        />
      )}
      {activeSubTab === "mapData" && (
        <OutletMapDataSection
          items={store.outletMapData ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, outletMapData: v }))}
        />
      )}
      {activeSubTab === "sentimentByOutlet" && (
        <OutletSentimentSection
          overall={store.outletSentimentOverall ?? { positive: 62, neutral: 22, negative: 16 }}
          byOutlet={store.outletSentimentByOutlet ?? []}
          onUpdateOverall={(v) => updateStore((p) => ({ ...p, outletSentimentOverall: v }))}
          onUpdateByOutlet={(v) => updateStore((p) => ({ ...p, outletSentimentByOutlet: v }))}
        />
      )}
      {activeSubTab === "topics" && (
        <OutletTopicsSection
          items={store.outletTopics ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, outletTopics: v }))}
        />
      )}
      {activeSubTab === "reviews" && (
        <OutletReviewsSection
          items={store.outletRecentReviews ?? []}
          onUpdate={(v) => updateStore((p) => ({ ...p, outletRecentReviews: v }))}
        />
      )}
    </div>
  );
}

function OutletStatsSection({ items, onUpdate }: { items: OutletStatItem[]; onUpdate: (v: OutletStatItem[]) => void }) {
  const [editing, setEditing] = useState<OutletStatItem | null>(null);
  const [adding, setAdding] = useState(false);
  const blank: Omit<OutletStatItem, "id"> = { label: "", value: "", change: "", positive: true, description: "", icon: "Store" };
  const [form, setForm] = useState<Omit<OutletStatItem, "id">>(blank);
  const close = () => { setEditing(null); setAdding(false); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(blank); setAdding(true); setEditing(null); }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90"><Plus className="w-4 h-4 mr-2" />Add stat</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="rounded-2xl border-slate-200 overflow-hidden hover:border-violet-300 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{item.label}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => { setEditing({ ...item }); setAdding(false); }}><Pencil className="w-3.5 h-3.5 text-slate-500" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500" onClick={() => onUpdate(items.filter((i) => i.id !== item.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-bold text-slate-900 mb-1">{item.value}</p>
              <p className="text-xs text-slate-500">{item.change} · {item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {(editing || adding) && (() => {
        const cur = editing ?? form;
        const setCur = editing
          ? (fn: (p: OutletStatItem) => OutletStatItem) => setEditing((p) => p ? fn(p) : p)
          : (fn: (p: Omit<OutletStatItem, "id">) => Omit<OutletStatItem, "id">) => setForm(fn);
        return (
          <Dialog open onOpenChange={(o) => !o && close()}>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader><DialogTitle>{adding ? "Tambah stat" : "Edit stat"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {[
                  { key: "label", label: "Label" },
                  { key: "value", label: "Value" },
                  { key: "change", label: "Change" },
                  { key: "description", label: "Description" },
                  { key: "icon", label: "Icon (Store/Star/MessageSquare/TrendingDown)" },
                ].map(({ key, label: lbl }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">{lbl}</label>
                    <Input value={String((cur as any)[key] ?? "")} onChange={(e) => (setCur as any)((p: any) => ({ ...p, [key]: e.target.value }))} className="rounded-xl" />
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-slate-600">Positive</label>
                  <Switch checked={cur.positive} onCheckedChange={(v) => (setCur as any)((p: any) => ({ ...p, positive: v }))} className="data-[state=checked]:bg-violet-500" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close} className="rounded-xl">Batal</Button>
                <Button onClick={() => {
                  if (adding) { onUpdate([...items, { ...(form as Omit<OutletStatItem, "id">), id: generateId() }]); close(); }
                  else if (editing) { onUpdate(items.map((i) => i.id === editing.id ? editing : i)); close(); }
                }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function OutletPriorityActionsSection({ items, onUpdate }: { items: OutletPriorityActionItem[]; onUpdate: (v: OutletPriorityActionItem[]) => void }) {
  const [editing, setEditing] = useState<OutletPriorityActionItem | null>(null);
  const [adding, setAdding] = useState(false);
  const blank: Omit<OutletPriorityActionItem, "id"> = { priority: "medium", outlet: "", region: "", title: "", detail: "", impact: "" };
  const [form, setForm] = useState<Omit<OutletPriorityActionItem, "id">>(blank);
  const close = () => { setEditing(null); setAdding(false); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(blank); setAdding(true); setEditing(null); }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90"><Plus className="w-4 h-4 mr-2" />Add action</Button>
      </div>
      <div className="space-y-3">
        {items.map((action) => (
          <Card key={action.id} className="rounded-2xl border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${action.priority === "high" ? "bg-red-100 text-red-700" : action.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{action.priority}</span>
                    <span className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{action.outlet}</span>
                    <span className="text-xs text-slate-400">{action.region}</span>
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">{action.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{action.detail}</p>
                  <p className="text-xs text-violet-600 font-medium mt-1">{action.impact}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing({ ...action }); setAdding(false); }}><Pencil className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onUpdate(items.filter((i) => i.id !== action.id))}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {(editing || adding) && (() => {
        const cur = editing ?? form;
        const setCur = editing
          ? (fn: (p: OutletPriorityActionItem) => OutletPriorityActionItem) => setEditing((p) => p ? fn(p) : p)
          : (fn: (p: Omit<OutletPriorityActionItem, "id">) => Omit<OutletPriorityActionItem, "id">) => setForm(fn);
        return (
          <Dialog open onOpenChange={(o) => !o && close()}>
            <DialogContent className="rounded-2xl sm:max-w-lg">
              <DialogHeader><DialogTitle>{adding ? "Tambah action" : "Edit action"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Priority</label>
                  <select value={cur.priority} onChange={(e) => (setCur as any)((p: any) => ({ ...p, priority: e.target.value }))} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                {[
                  { key: "outlet", label: "Outlet Name" },
                  { key: "region", label: "Region" },
                  { key: "title", label: "Title" },
                  { key: "detail", label: "Detail" },
                  { key: "impact", label: "Impact" },
                ].map(({ key, label: lbl }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">{lbl}</label>
                    <Input value={String((cur as any)[key] ?? "")} onChange={(e) => (setCur as any)((p: any) => ({ ...p, [key]: e.target.value }))} className="rounded-xl" />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close} className="rounded-xl">Batal</Button>
                <Button onClick={() => {
                  if (adding) { onUpdate([...items, { ...(form as Omit<OutletPriorityActionItem, "id">), id: generateId() }]); close(); }
                  else if (editing) { onUpdate(items.map((i) => i.id === editing.id ? editing : i)); close(); }
                }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function OutletMapDataSection({ items, onUpdate }: { items: OutletMapDataItem[]; onUpdate: (v: OutletMapDataItem[]) => void }) {
  const [editing, setEditing] = useState<OutletMapDataItem | null>(null);
  const [adding, setAdding] = useState(false);
  const blank: Omit<OutletMapDataItem, "id"> = { name: "", region: "", city: "", lat: 0, lng: 0, status: "good", satisfaction: 4.0, reviews: 0, issues: [] };
  const [form, setForm] = useState<Omit<OutletMapDataItem, "id">>(blank);
  const close = () => { setEditing(null); setAdding(false); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(blank); setAdding(true); setEditing(null); }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90"><Plus className="w-4 h-4 mr-2" />Add outlet</Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm min-w-max">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">City</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Satisfaction</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Reviews</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{o.name}</td>
                <td className="px-4 py-3 text-slate-600">{o.city}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.status === "critical" ? "bg-red-100 text-red-700" : o.status === "warning" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{o.status}</span></td>
                <td className="px-4 py-3 text-right">{o.satisfaction.toFixed(1)}</td>
                <td className="px-4 py-3 text-right">{o.reviews.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing({ ...o, issues: [...o.issues] }); setAdding(false); }}><Pencil className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onUpdate(items.filter((i) => i.id !== o.id))}><Trash2 className="w-3 h-3" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(editing || adding) && (() => {
        const cur = editing ?? form;
        const setCur = editing
          ? (fn: (p: OutletMapDataItem) => OutletMapDataItem) => setEditing((p) => p ? fn(p) : p)
          : (fn: (p: Omit<OutletMapDataItem, "id">) => Omit<OutletMapDataItem, "id">) => setForm(fn);
        return (
          <Dialog open onOpenChange={(o) => !o && close()}>
            <DialogContent className="rounded-2xl sm:max-w-lg overflow-y-auto max-h-[90vh]">
              <DialogHeader><DialogTitle>{adding ? "Tambah outlet" : "Edit outlet"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Status</label>
                  <select value={cur.status} onChange={(e) => (setCur as any)((p: any) => ({ ...p, status: e.target.value }))} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                    <option value="good">Good</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                {[
                  { key: "name", label: "Outlet Name", type: "text" },
                  { key: "region", label: "Region", type: "text" },
                  { key: "city", label: "City", type: "text" },
                  { key: "lat", label: "Latitude", type: "number" },
                  { key: "lng", label: "Longitude", type: "number" },
                  { key: "satisfaction", label: "Satisfaction (0-5)", type: "number" },
                  { key: "reviews", label: "Reviews Count", type: "number" },
                ].map(({ key, label: lbl, type }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">{lbl}</label>
                    <Input type={type} step={key === "satisfaction" ? 0.1 : key === "lat" || key === "lng" ? 0.0001 : 1}
                      value={String((cur as any)[key] ?? "")}
                      onChange={(e) => (setCur as any)((p: any) => ({ ...p, [key]: type === "number" ? Number(e.target.value) || 0 : e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Issues (satu per baris)</label>
                  <textarea
                    rows={3}
                    value={(cur.issues ?? []).join("\n")}
                    onChange={(e) => (setCur as any)((p: any) => ({ ...p, issues: e.target.value.split("\n").filter(Boolean) }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close} className="rounded-xl">Batal</Button>
                <Button onClick={() => {
                  if (adding) { onUpdate([...items, { ...(form as Omit<OutletMapDataItem, "id">), id: generateId() }]); close(); }
                  else if (editing) { onUpdate(items.map((i) => i.id === editing.id ? editing : i)); close(); }
                }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function OutletSentimentSection({
  overall, byOutlet, onUpdateOverall, onUpdateByOutlet,
}: {
  overall: { positive: number; neutral: number; negative: number };
  byOutlet: OutletSentimentByOutletItem[];
  onUpdateOverall: (v: { positive: number; neutral: number; negative: number }) => void;
  onUpdateByOutlet: (v: OutletSentimentByOutletItem[]) => void;
}) {
  const [editing, setEditing] = useState<OutletSentimentByOutletItem | null>(null);
  const [adding, setAdding] = useState(false);
  const blank: Omit<OutletSentimentByOutletItem, "id"> = { name: "", positive: 60, neutral: 20, negative: 20 };
  const [form, setForm] = useState<Omit<OutletSentimentByOutletItem, "id">>(blank);
  const close = () => { setEditing(null); setAdding(false); };

  return (
    <div className="space-y-5">
      <Card className="rounded-2xl border-slate-200">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Overall Sentiment</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          {[
            { key: "positive", label: "Positive %" },
            { key: "neutral", label: "Neutral %" },
            { key: "negative", label: "Negative %" },
          ].map(({ key, label: lbl }) => (
            <div key={key}>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{lbl}</label>
              <Input type="number" min={0} max={100}
                value={(overall as any)[key]}
                onChange={(e) => onUpdateOverall({ ...overall, [key]: Number(e.target.value) || 0 })}
                className="rounded-xl"
              />
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={() => { setForm(blank); setAdding(true); setEditing(null); }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90"><Plus className="w-4 h-4 mr-2" />Add outlet sentiment</Button>
      </div>
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Outlet</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Positive %</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Neutral %</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Negative %</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {byOutlet.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{o.name}</td>
                <td className="px-4 py-3 text-right text-emerald-600 font-medium">{o.positive}%</td>
                <td className="px-4 py-3 text-right text-slate-500">{o.neutral}%</td>
                <td className="px-4 py-3 text-right text-red-500 font-medium">{o.negative}%</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing({ ...o }); setAdding(false); }}><Pencil className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onUpdateByOutlet(byOutlet.filter((i) => i.id !== o.id))}><Trash2 className="w-3 h-3" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(editing || adding) && (() => {
        const cur = editing ?? form;
        const setCur = editing
          ? (fn: (p: OutletSentimentByOutletItem) => OutletSentimentByOutletItem) => setEditing((p) => p ? fn(p) : p)
          : (fn: (p: Omit<OutletSentimentByOutletItem, "id">) => Omit<OutletSentimentByOutletItem, "id">) => setForm(fn);
        return (
          <Dialog open onOpenChange={(o) => !o && close()}>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader><DialogTitle>{adding ? "Tambah outlet sentiment" : "Edit outlet sentiment"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {[
                  { key: "name", label: "Outlet Name", type: "text" },
                  { key: "positive", label: "Positive %", type: "number" },
                  { key: "neutral", label: "Neutral %", type: "number" },
                  { key: "negative", label: "Negative %", type: "number" },
                ].map(({ key, label: lbl, type }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">{lbl}</label>
                    <Input type={type} value={String((cur as any)[key] ?? "")} onChange={(e) => (setCur as any)((p: any) => ({ ...p, [key]: type === "number" ? Number(e.target.value) || 0 : e.target.value }))} className="rounded-xl" />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close} className="rounded-xl">Batal</Button>
                <Button onClick={() => {
                  if (adding) { onUpdateByOutlet([...byOutlet, { ...(form as Omit<OutletSentimentByOutletItem, "id">), id: generateId() }]); close(); }
                  else if (editing) { onUpdateByOutlet(byOutlet.map((i) => i.id === editing.id ? editing : i)); close(); }
                }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function OutletTopicsSection({ items, onUpdate }: { items: OutletTopicItem[]; onUpdate: (v: OutletTopicItem[]) => void }) {
  const [editing, setEditing] = useState<OutletTopicItem | null>(null);
  const [adding, setAdding] = useState(false);
  const blank: Omit<OutletTopicItem, "id"> = { topic: "", mentions: 0, positive: 60, negative: 20 };
  const [form, setForm] = useState<Omit<OutletTopicItem, "id">>(blank);
  const close = () => { setEditing(null); setAdding(false); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(blank); setAdding(true); setEditing(null); }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90"><Plus className="w-4 h-4 mr-2" />Add topic</Button>
      </div>
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Topic</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Mentions</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Positive %</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Negative %</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{t.topic}</td>
                <td className="px-4 py-3 text-right">{t.mentions.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-emerald-600 font-medium">{t.positive}%</td>
                <td className="px-4 py-3 text-right text-red-500 font-medium">{t.negative}%</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing({ ...t }); setAdding(false); }}><Pencil className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onUpdate(items.filter((i) => i.id !== t.id))}><Trash2 className="w-3 h-3" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(editing || adding) && (() => {
        const cur = editing ?? form;
        const setCur = editing
          ? (fn: (p: OutletTopicItem) => OutletTopicItem) => setEditing((p) => p ? fn(p) : p)
          : (fn: (p: Omit<OutletTopicItem, "id">) => Omit<OutletTopicItem, "id">) => setForm(fn);
        return (
          <Dialog open onOpenChange={(o) => !o && close()}>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader><DialogTitle>{adding ? "Tambah topic" : "Edit topic"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {[
                  { key: "topic", label: "Topic", type: "text" },
                  { key: "mentions", label: "Mentions", type: "number" },
                  { key: "positive", label: "Positive %", type: "number" },
                  { key: "negative", label: "Negative %", type: "number" },
                ].map(({ key, label: lbl, type }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">{lbl}</label>
                    <Input type={type} value={String((cur as any)[key] ?? "")} onChange={(e) => (setCur as any)((p: any) => ({ ...p, [key]: type === "number" ? Number(e.target.value) || 0 : e.target.value }))} className="rounded-xl" />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close} className="rounded-xl">Batal</Button>
                <Button onClick={() => {
                  if (adding) { onUpdate([...items, { ...(form as Omit<OutletTopicItem, "id">), id: generateId() }]); close(); }
                  else if (editing) { onUpdate(items.map((i) => i.id === editing.id ? editing : i)); close(); }
                }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function OutletReviewsSection({ items, onUpdate }: { items: OutletRecentReviewItem[]; onUpdate: (v: OutletRecentReviewItem[]) => void }) {
  const [editing, setEditing] = useState<OutletRecentReviewItem | null>(null);
  const [adding, setAdding] = useState(false);
  const blank: Omit<OutletRecentReviewItem, "id"> = { outlet: "", sentiment: "positive", text: "", stars: 5 };
  const [form, setForm] = useState<Omit<OutletRecentReviewItem, "id">>(blank);
  const close = () => { setEditing(null); setAdding(false); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(blank); setAdding(true); setEditing(null); }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90"><Plus className="w-4 h-4 mr-2" />Add review</Button>
      </div>
      <div className="space-y-3">
        {items.map((r) => (
          <Card key={r.id} className="rounded-2xl border-slate-200">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{r.outlet}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.sentiment === "positive" ? "bg-emerald-100 text-emerald-700" : r.sentiment === "negative" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"}`}>{r.sentiment}</span>
                  <span className="text-xs text-slate-500">⭐ {r.stars}</span>
                </div>
                <p className="text-sm text-slate-700">"{r.text}"</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing({ ...r }); setAdding(false); }}><Pencil className="w-3 h-3" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onUpdate(items.filter((i) => i.id !== r.id))}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {(editing || adding) && (() => {
        const cur = editing ?? form;
        const setCur = editing
          ? (fn: (p: OutletRecentReviewItem) => OutletRecentReviewItem) => setEditing((p) => p ? fn(p) : p)
          : (fn: (p: Omit<OutletRecentReviewItem, "id">) => Omit<OutletRecentReviewItem, "id">) => setForm(fn);
        return (
          <Dialog open onOpenChange={(o) => !o && close()}>
            <DialogContent className="rounded-2xl sm:max-w-lg">
              <DialogHeader><DialogTitle>{adding ? "Tambah review" : "Edit review"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Sentiment</label>
                  <select value={cur.sentiment} onChange={(e) => (setCur as any)((p: any) => ({ ...p, sentiment: e.target.value }))} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
                    <option value="positive">Positive</option>
                    <option value="neutral">Neutral</option>
                    <option value="negative">Negative</option>
                  </select>
                </div>
                {[
                  { key: "outlet", label: "Outlet Name", type: "text" },
                  { key: "stars", label: "Stars (1-5)", type: "number" },
                  { key: "text", label: "Review Text", type: "text" },
                ].map(({ key, label: lbl, type }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">{lbl}</label>
                    <Input type={type} min={1} max={5}
                      value={String((cur as any)[key] ?? "")}
                      onChange={(e) => (setCur as any)((p: any) => ({ ...p, [key]: type === "number" ? Number(e.target.value) || 0 : e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close} className="rounded-xl">Batal</Button>
                <Button onClick={() => {
                  if (adding) { onUpdate([...items, { ...(form as Omit<OutletRecentReviewItem, "id">), id: generateId() }]); close(); }
                  else if (editing) { onUpdate(items.map((i) => i.id === editing.id ? editing : i)); close(); }
                }} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

function CompetitiveEditDialog({
  item,
  onClose,
  onSave,
  isNew,
}: {
  item: CompetitiveIssueItem;
  onClose: () => void;
  onSave: (item: CompetitiveIssueItem) => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState(item);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Tambah competitive issue" : "Edit issue"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Issue</label>
            <Input value={form.issue} onChange={(e) => setForm((p) => ({ ...p, issue: e.target.value }))} placeholder="Product Quality" className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Category</label>
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm">
              <option value="winning">Winning</option>
              <option value="critical">Critical</option>
              <option value="opportunity">Opportunity</option>
              <option value="moderate">Moderate</option>
              <option value="minor">Minor</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Your sentiment</label>
              <Input type="number" step="0.01" value={form.yourSentiment} onChange={(e) => setForm((p) => ({ ...p, yourSentiment: Number(e.target.value) || 0 }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Competitor median</label>
              <Input type="number" step="0.01" value={form.competitorMedianSentiment} onChange={(e) => setForm((p) => ({ ...p, competitorMedianSentiment: Number(e.target.value) || 0 }))} className="rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Your mentions</label>
              <Input type="number" value={form.yourMentions} onChange={(e) => setForm((p) => ({ ...p, yourMentions: Number(e.target.value) || 0 }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Competitor mentions</label>
              <Input type="number" value={form.competitorMedianMentions} onChange={(e) => setForm((p) => ({ ...p, competitorMedianMentions: Number(e.target.value) || 0 }))} className="rounded-xl" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Batal</Button>
          <Button onClick={() => onSave(form)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500">Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
