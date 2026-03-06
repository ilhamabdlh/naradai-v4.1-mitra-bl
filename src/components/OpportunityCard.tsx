import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Target, ThumbsUp, Twitter, Instagram, Facebook, MessageSquare, FileText } from "lucide-react";
import { useState } from "react";

interface OpportunityCardProps {
  opportunity: {
    id: string | number;
    title: string;
    description: string;
    potential: string;
    confidence: number;
    timeframe: string;
    category: string;
    trend: string;
    supportingContents: number;
    metrics: Record<string, unknown>;
    recommendations: string[];
    sourceContent?: Array<{ id: string; platform: string; author: string; content: string; sentiment: number; timestamp: string }>;
  };
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock source content for opportunities
  const getSourceContent = (opportunityId: number) => {
    const sources: Record<number, any[]> = {
      1: [ // Untapped market segment
        {
          id: 1,
          platform: "twitter",
          author: "@entrepreneur_mom",
          content: "As a busy mom, I wish @YourBrand had products specifically designed for parents on the go. Would definitely buy!",
          sentiment: 0.72,
          timestamp: "1 day ago",
        },
        {
          id: 2,
          platform: "instagram",
          author: "@fitness_enthusiast",
          content: "Love @YourBrand but would be amazing if you had a fitness-focused line. That's a huge market!",
          sentiment: 0.68,
          timestamp: "2 days ago",
        },
      ],
      2: [ // Positive product feedback
        {
          id: 3,
          platform: "twitter",
          author: "@happycustomer",
          content: "Just got my order and I'm blown away by the quality! @YourBrand never disappoints. Highly recommend to everyone!",
          sentiment: 0.92,
          timestamp: "1 day ago",
        },
        {
          id: 4,
          platform: "facebook",
          author: "Emma S.",
          content: "Best purchase I've made this year! Quality is outstanding and shipping was fast. Customer service was helpful too.",
          sentiment: 0.95,
          timestamp: "2 days ago",
        },
      ],
      3: [ // Feature request trending
        {
          id: 5,
          platform: "twitter",
          author: "@uxdesignfan",
          content: "When is @YourBrand adding dark mode to the app? My eyes are begging for it! Every other app has it already.",
          sentiment: 0.45,
          timestamp: "1 day ago",
        },
        {
          id: 6,
          platform: "instagram",
          author: "@techie_mom",
          content: "The app is great but PLEASE add dark mode! Using it at night is blinding. Would be perfect with dark mode option.",
          sentiment: 0.38,
          timestamp: "2 days ago",
        },
      ],
    };
    return sources[opportunityId as number] || [];
  };

  const sourceList = opportunity.sourceContent?.length ? opportunity.sourceContent : getSourceContent(Number(opportunity.id) || 0);

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

  const potentialConfig: Record<string, { color: string; dot: string }> = {
    high: { color: "bg-emerald-100 border-emerald-300 text-emerald-700", dot: "bg-emerald-500" },
    medium: { color: "bg-cyan-100 border-cyan-300 text-cyan-700", dot: "bg-cyan-500" },
    low: { color: "bg-slate-100 border-slate-300 text-slate-700", dot: "bg-slate-500" },
  };

  const defaultConfig = { color: "bg-slate-100 border-slate-300 text-slate-700", dot: "bg-slate-500" };
  const config = potentialConfig[String(opportunity.potential ?? "")] ?? defaultConfig;
  const TrendIcon = opportunity.trend === "increasing" ? TrendingUp : opportunity.trend === "decreasing" ? TrendingDown : Minus;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all h-full">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${config.dot}`} />
              <span className={`text-xs px-2.5 py-1 rounded-full ${config.color} uppercase tracking-wider`}>
                {opportunity.potential} Potential
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <TrendIcon className="w-3.5 h-3.5" />
                {opportunity.trend}
              </div>
            </div>
            <h4 className="text-slate-900 mb-1">{opportunity.title}</h4>
            <p className="text-sm text-slate-600">{opportunity.description}</p>
          </div>
        </div>

          {/* Confidence Meter */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span>Confidence Score</span>
              <span className="font-medium">{opportunity.confidence}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
                style={{ width: `${opportunity.confidence}%` }}
              />
            </div>
          </div>

          {/* Number of Supporting Contents */}
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500">Number of Supporting Contents</span>
            <span className="ml-auto text-sm font-semibold text-slate-900">{opportunity.supportingContents}</span>
          </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Timeframe</div>
            <div className="text-sm text-slate-900">{opportunity.timeframe}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Category</div>
            <div className="text-sm text-slate-900">{opportunity.category}</div>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-sm text-violet-600 hover:text-violet-700 transition-colors"
        >
          <span>{isExpanded ? 'Show less' : 'View opportunity details'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-slate-50 p-5 space-y-4">
          <div>
            <div className="text-sm text-slate-700 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              Recommended Actions
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <ul className="space-y-2 text-sm text-slate-700">
                {opportunity.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-700 mb-2">Source Content</div>
            <p className="text-xs text-slate-600 mb-3">Social media posts contributing to this opportunity identification</p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {sourceList.map((post) => (
                <div key={post.id} className="bg-white border border-slate-200 rounded-lg p-3 hover:border-emerald-300 transition-colors">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(post.platform)}
                      <span className="text-sm font-medium text-slate-900">{post.author}</span>
                      <span className="text-xs text-slate-500">• {post.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700">
                      <ThumbsUp className="w-3 h-3" />
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