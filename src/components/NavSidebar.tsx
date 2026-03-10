import { useState, useEffect } from "react";
import {
  BarChart3,
  Target,
  MapPin,
  ShieldAlert,
  Swords,
  TrendingUp,
  MessageCircle,
  LineChart,
  Users,
  Hash,
  Contact,
  FileText,
  UserCheck,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  children?: { id: string; label: string }[];
}

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "priority-actions", label: "Priority Actions", icon: Target },
  { id: "outlet-satisfaction", label: "Outlet Satisfaction", icon: MapPin },
  { id: "risks-opportunities", label: "Risks & Opportunities", icon: ShieldAlert },
    {
      id: "competitive-analysis",
      label: "Competitive Analysis",
      icon: Swords,
      children: [
        { id: "competitive-analysis", label: "Competitors Overview" },
        { id: "competitive-issues-matrix", label: "Issues Matrix" },
        { id: "competitive-matrix", label: "Competitive Matrix" },
        { id: "competitive-heatmaps", label: "Heatmaps" },
        { id: "share-of-platform", label: "Share of Platform" },
        { id: "share-of-voice", label: "Share of Voice" },
      ],
    },
    {
      id: "whats-happening",
      label: "What's Happening",
      icon: TrendingUp,
      children: [
        { id: "sentiment-trends", label: "Sentiment Trends" },
        { id: "top-topics", label: "Top Discussion Topics" },
        { id: "topic-trends", label: "Topic Trends Over Time" },
        { id: "word-cloud", label: "Word Cloud" },
        { id: "conversation-clusters", label: "Conversation Clusters" },
        { id: "top-hashtags", label: "Top Hashtags" },
        { id: "top-accounts", label: "Top Accounts" },
        { id: "top-contents", label: "Top Contents" },
        { id: "kol-matrix", label: "KOL Matrix" },
      ],
    },
];

export function NavSidebar() {
  const [activeId, setActiveId] = useState<string>("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "competitive-analysis": true,
    "whats-happening": true,
  });
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const allIds = navItems.flatMap((item) =>
      item.children ? [item.id, ...item.children.map((c) => c.id)] : [item.id]
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    allIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isActive = (id: string) => activeId === id;

  const isParentActive = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some((c) => c.id === activeId);
  };

  if (collapsed) {
    return (
      <div className="sticky top-20 h-[calc(100vh-5rem)] flex flex-col items-center py-4 w-10">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title="Expand sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="sticky top-20 h-[calc(100vh-5rem)] w-56 shrink-0 overflow-y-auto py-4 pr-2 scrollbar-thin">
      <div className="flex items-center justify-between mb-3 pl-3 pr-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contents</span>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>

      <nav className="space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children;
          const isExp = expanded[item.id];
          const parentActive = isParentActive(item);

          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleExpand(item.id);
                  }
                  scrollTo(item.id);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-sm transition-colors ${
                  isActive(item.id) || parentActive
                    ? "bg-violet-50 text-violet-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate flex-1">{item.label}</span>
                {hasChildren && (
                  isExp ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />
                )}
              </button>

              {hasChildren && isExp && (
                <div className="ml-5 pl-3 border-l border-slate-200 mt-0.5 space-y-0.5">
                  {item.children!.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => scrollTo(child.id)}
                      className={`w-full text-left px-2 py-1 rounded-md text-xs transition-colors ${
                        isActive(child.id)
                          ? "bg-violet-50 text-violet-700 font-medium"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
