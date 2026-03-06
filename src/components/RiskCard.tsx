import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, ThumbsDown, Twitter, Instagram, Facebook, MessageSquare, FileText } from "lucide-react";
import { useState } from "react";

interface RiskCardProps {
  risk: {
    id: string | number;
    title: string;
    description: string;
    severity: string;
    probability: number;
    impact: string;
    trend: string;
    supportingContents: number;
    metrics?: Record<string, unknown>;
    indicators: Array<{ label: string; value: number; change: number }>;
    mitigation?: string[];
    sourceContent?: Array<{ id: string; platform: string; author: string; content: string; sentiment: number; timestamp: string }>;
  };
}

export function RiskCard({ risk }: RiskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock source content for risks
  const getSourceContent = (riskId: number) => {
    const sources: Record<number, any[]> = {
      1: [ // Declining brand sentiment
        {
          id: 1,
          platform: "twitter",
          author: "@frustrated_user",
          content: "Really disappointed with @YourBrand lately. Quality just isn't what it used to be. Might switch to competitors.",
          sentiment: -0.78,
          timestamp: "1 day ago",
        },
        {
          id: 2,
          platform: "instagram",
          author: "@brand_watcher",
          content: "Anyone else noticing @YourBrand going downhill? Not happy with recent changes.",
          sentiment: -0.65,
          timestamp: "2 days ago",
        },
      ],
      2: [ // Customer service complaints
        {
          id: 3,
          platform: "twitter",
          author: "@angrycustomer",
          content: "Been waiting 45 minutes on hold with @YourBrand customer service. This is ridiculous! Worst support experience ever.",
          sentiment: -0.91,
          timestamp: "1 day ago",
        },
        {
          id: 4,
          platform: "facebook",
          author: "Lisa Chen",
          content: "I've been trying to reach customer support for 3 days. No response to emails, phone wait times over an hour.",
          sentiment: -0.87,
          timestamp: "2 days ago",
        },
      ],
      3: [ // Competitor gaining traction
        {
          id: 5,
          platform: "twitter",
          author: "@tech_reviewer",
          content: "Switched from @YourBrand to @CompetitorX and wow, what a difference! Better features and half the price.",
          sentiment: -0.72,
          timestamp: "3 days ago",
        },
        {
          id: 6,
          platform: "instagram",
          author: "@savvy_shopper",
          content: "CompetitorX just launched their new product and it's better than YourBrand in every way. Highly recommend!",
          sentiment: -0.68,
          timestamp: "4 days ago",
        },
      ],
    };
    return sources[riskId as number] || [];
  };

  const sourceList = risk.sourceContent?.length ? risk.sourceContent : getSourceContent(Number(risk.id) || 0);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return <Twitter className="w-4 h-4 text-sky-500" />;
      case "instagram":
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case "facebook":
        return <Facebook className="w-4 h-4 text-blue-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-slate-500" />;
    }
  };

  const severityConfig: Record<string, { color: string; dot: string }> = {
    critical: { color: "bg-red-100 border-red-300 text-red-700", dot: "bg-red-500" },
    high: { color: "bg-orange-100 border-orange-300 text-orange-700", dot: "bg-orange-500" },
    medium: { color: "bg-amber-100 border-amber-300 text-amber-700", dot: "bg-amber-500" },
  };

  const defaultConfig = { color: "bg-slate-100 border-slate-300 text-slate-700", dot: "bg-slate-500" };
  const config = severityConfig[String(risk.severity ?? "")] ?? defaultConfig;
  const TrendIcon = risk.trend === "increasing" ? TrendingUp : risk.trend === "decreasing" ? TrendingDown : Minus;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all h-full">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${config.dot}`} />
              <span className={`text-xs px-2.5 py-1 rounded-full ${config.color} uppercase tracking-wider`}>
                {risk.severity}
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <TrendIcon className="w-3.5 h-3.5" />
                {risk.trend}
              </div>
            </div>
            <h4 className="text-slate-900 mb-1">{risk.title}</h4>
            <p className="text-sm text-slate-600">{risk.description}</p>
          </div>
        </div>

          {/* Probability Meter */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span>Probability</span>
              <span className="font-medium">{risk.probability}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all"
                style={{ width: `${risk.probability}%` }}
              />
            </div>
          </div>

          {/* Number of Supporting Contents */}
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500">Number of Supporting Contents</span>
            <span className="ml-auto text-sm font-semibold text-slate-900">{risk.supportingContents}</span>
          </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {(risk.indicators ?? []).slice(0, 3).map((indicator, idx) => (
            <div key={idx} className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">{indicator.label}</div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-slate-900">{typeof indicator.value === 'number' && indicator.value < 1 && indicator.value > -1 ? indicator.value.toFixed(2) : indicator.value}</span>
                {indicator.change !== 0 && (
                  <span className={`text-xs ${indicator.change > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {indicator.change > 0 ? '+' : ''}{indicator.change}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-sm text-violet-600 hover:text-violet-700 transition-colors"
        >
          <span>{isExpanded ? 'Show less' : 'View risk details'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-slate-50 p-5 space-y-4">
          <div>
            <div className="text-sm text-slate-700 mb-2">Impact Assessment</div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-slate-900">{risk.impact}</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-700 mb-2">Mitigation Strategy</div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <ul className="space-y-2 text-sm text-slate-700">
                {(risk.mitigation ?? []).length > 0
                  ? (risk.mitigation ?? []).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-violet-600 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))
                  : (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-violet-600 mt-1">•</span>
                        <span>Monitor sentiment trends daily for early warning signs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-violet-600 mt-1">•</span>
                        <span>Prepare response communication templates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-violet-600 mt-1">•</span>
                        <span>Engage customer support team for rapid response</span>
                      </li>
                    </>
                  )}
              </ul>
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-700 mb-2">Source Content</div>
            <p className="text-xs text-slate-600 mb-3">Social media posts contributing to this risk assessment</p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {sourceList.map((post) => (
                <div key={post.id} className="bg-white border border-slate-200 rounded-lg p-3 hover:border-red-300 transition-colors">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(post.platform)}
                      <span className="text-sm font-medium text-slate-900">{post.author}</span>
                      <span className="text-xs text-slate-500">• {post.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700">
                      <ThumbsDown className="w-3 h-3" />
                      {post.sentiment.toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Post Content */}
                  <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}