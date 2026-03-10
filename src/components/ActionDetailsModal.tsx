import { useState } from "react";
import { X, CheckCircle, Clock, Circle, Share2, Copy, Mail, MessageSquare, ThumbsUp, ThumbsDown, Twitter, Instagram, Facebook } from "lucide-react";

interface ActionDetailsModalProps {
  action: any;
  onClose: () => void;
  onStatusChange: (actionId: string | number, status: string) => void;
  currentStatus: string;
}

export function ActionDetailsModal({ action, onClose, onStatusChange, currentStatus }: ActionDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Mock social media content that AI used as basis
  const getSourceContent = (actionId: number) => {
    const sources: Record<number, any[]> = {
      1: [ // Packaging complaints
        {
          id: 1,
          platform: "twitter",
          author: "@johndoe",
          content: "Just received my order and the box was completely crushed. Product inside is damaged. Really disappointed with the packaging quality @YourBrand",
          sentiment: -0.85,
          timestamp: "2 days ago",
          engagement: { likes: 234, replies: 45, retweets: 12 }
        },
        {
          id: 2,
          platform: "instagram",
          author: "@sarahm_shopper",
          content: "Love the product but why is the packaging so flimsy? Third time I've received a damaged box. Please use better materials!",
          sentiment: -0.72,
          timestamp: "3 days ago",
          engagement: { likes: 156, replies: 28, retweets: 0 }
        },
        {
          id: 3,
          platform: "facebook",
          author: "Mike Thompson",
          content: "The product quality is great but arrived with dents and tears in the packaging. Seems like the boxes can't handle shipping well.",
          sentiment: -0.68,
          timestamp: "5 days ago",
          engagement: { likes: 89, replies: 15, retweets: 0 }
        },
        {
          id: 4,
          platform: "twitter",
          author: "@retailreviewer",
          content: "Anyone else having issues with @YourBrand packaging? My last 2 orders came damaged during shipping. The boxes need reinforcement.",
          sentiment: -0.79,
          timestamp: "1 week ago",
          engagement: { likes: 342, replies: 67, retweets: 28 }
        },
      ],
      2: [ // Customer service wait times
        {
          id: 5,
          platform: "twitter",
          author: "@angrycustomer",
          content: "Been waiting 45 minutes on hold with @YourBrand customer service. This is ridiculous! Worst support experience ever.",
          sentiment: -0.91,
          timestamp: "1 day ago",
          engagement: { likes: 445, replies: 89, retweets: 56 }
        },
        {
          id: 6,
          platform: "facebook",
          author: "Lisa Chen",
          content: "I've been trying to reach customer support for 3 days. No response to emails, phone wait times over an hour. What's going on?",
          sentiment: -0.87,
          timestamp: "2 days ago",
          engagement: { likes: 267, replies: 54, retweets: 0 }
        },
        {
          id: 7,
          platform: "instagram",
          author: "@frustrated_buyer",
          content: "Love your products but your customer service is a nightmare. 1+ hour wait times are unacceptable in 2026.",
          sentiment: -0.75,
          timestamp: "4 days ago",
          engagement: { likes: 198, replies: 41, retweets: 0 }
        },
      ],
      3: [ // Dark mode feature requests
        {
          id: 8,
          platform: "twitter",
          author: "@uxdesignfan",
          content: "When is @YourBrand adding dark mode to the app? My eyes are begging for it! Every other app has it already.",
          sentiment: 0.45,
          timestamp: "1 day ago",
          engagement: { likes: 523, replies: 145, retweets: 87 }
        },
        {
          id: 9,
          platform: "instagram",
          author: "@techie_mom",
          content: "The app is great but PLEASE add dark mode! Using it at night is blinding. Would be perfect with dark mode option.",
          sentiment: 0.38,
          timestamp: "3 days ago",
          engagement: { likes: 312, replies: 67, retweets: 0 }
        },
        {
          id: 10,
          platform: "facebook",
          author: "David Park",
          content: "Feature request: Dark mode for the mobile app. It's the only thing missing to make this app perfect!",
          sentiment: 0.51,
          timestamp: "5 days ago",
          engagement: { likes: 234, replies: 43, retweets: 0 }
        },
      ]
    };
    return sources[actionId] || [];
  };

  // Daftar post untuk Source Content: sourceContent string (dengan atau tanpa sourceUsername), atau array
  const sourcePosts: Array<{ id: string; platform: string; author: string; content: string; sentiment: number; timestamp: string; engagement?: { likes: number; replies: number; retweets: number } }> = (() => {
    if (typeof action.sourceContent === "string") {
      let sentimentNum = 0;
      if (typeof action.metrics?.sentiment === "number") {
        sentimentNum = action.metrics.sentiment;
      } else if (typeof action.metrics?.sentiment === "string" && /[-+]?\d+(\.\d+)?%?/.test(String(action.metrics.sentiment))) {
        const raw = String(action.metrics.sentiment).replace(/%/g, "");
        const n = parseFloat(raw.replace(/^.*?([-+]?\d+(\.\d+)?).*$/, "$1"));
        if (!isNaN(n)) sentimentNum = n <= 1 ? n * 2 - 1 : (n / 100) * 2 - 1;
      }
      return [
        {
          id: "source-1",
          platform: "tiktok",
          author: action.sourceUsername ?? "—",
          content: action.sourceContent,
          sentiment: sentimentNum,
          timestamp: "—",
          engagement: { likes: 0, replies: 0, retweets: 0 },
        },
      ];
    }
    const arr = Array.isArray(action.sourceContent) && action.sourceContent.length ? action.sourceContent : getSourceContent(Number(action.id) || action.id);
    return arr;
  })();

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

  const statuses = [
    { value: "not-started", label: "Not Started", icon: Circle, color: "text-slate-400" },
    { value: "in-progress", label: "In Progress", icon: Clock, color: "text-amber-500" },
    { value: "completed", label: "Completed", icon: CheckCircle, color: "text-emerald-500" },
  ];

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    onStatusChange(action.id, status);
  };

  const handleShare = (method: string) => {
    const shareText = `Priority Action: ${action.title}\n\n${action.description}\n\nRecommendation: ${action.recommendation}\n\nImpact: ${action.impact} | Effort: ${action.effort}`;
    
    if (method === "copy") {
      navigator.clipboard.writeText(shareText);
      setShowShareMenu(false);
      // Could add a toast notification here
    } else if (method === "email") {
      window.location.href = `mailto:?subject=${encodeURIComponent(action.title)}&body=${encodeURIComponent(shareText)}`;
      setShowShareMenu(false);
    } else if (method === "slack") {
      // Placeholder for Slack integration
      alert("Slack integration coming soon!");
      setShowShareMenu(false);
    }
  };

  const Icon = action.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-slate-900 mb-2">{action.title}</h2>
              <p className="text-sm text-slate-600">{action.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Selection */}
          <div>
            <label className="text-sm text-slate-700 mb-3 block">Action Status</label>
            <div className="grid grid-cols-3 gap-3">
              {statuses.map((status) => {
                const StatusIcon = status.icon;
                const isSelected = selectedStatus === status.value;
                return (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-violet-500 bg-violet-50"
                        : "border-slate-200 bg-white hover:border-violet-300"
                    }`}
                  >
                    <StatusIcon className={`w-5 h-5 mx-auto mb-2 ${isSelected ? "text-violet-600" : status.color}`} />
                    <div className={`text-sm ${isSelected ? "text-violet-900" : "text-slate-700"}`}>
                      {status.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metrics */}
          <div>
            <h3 className="text-slate-900 mb-3">Key Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="text-sm text-slate-500 mb-1">Mentions</div>
                <div className="text-2xl text-slate-900">{action.metrics.mentions.toLocaleString()}</div>
                <div className="text-xs text-slate-500 mt-1">conversations</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="text-sm text-slate-500 mb-1">Sentiment</div>
                <div className={`text-2xl ${typeof action.metrics.sentiment === "number" && action.metrics.sentiment < 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {typeof action.metrics.sentiment === "string"
                    ? action.metrics.sentiment
                    : (action.metrics.sentiment > 0 ? "+" : "") + (action.metrics.sentiment ?? 0).toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-1">average score</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="text-sm text-slate-500 mb-1">Trend</div>
                <div className="text-2xl text-slate-900 capitalize">{action.metrics.trend}</div>
                <div className="text-xs text-slate-500 mt-1">7-day trend</div>
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div>
            <h3 className="text-slate-900 mb-3">AI Recommendation</h3>
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
              <p className="text-slate-900 leading-relaxed">{action.recommendation}</p>
            </div>
          </div>

          {/* Source Content - Social Media Posts */}
          <div>
            <h3 className="text-slate-900 mb-3">Source Content</h3>
            <p className="text-sm text-slate-600 mb-4">
              Social media posts that contributed to this AI recommendation
            </p>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {sourcePosts.map((post) => (
                <div key={post.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-violet-300 transition-colors">
                  {/* Post Header: tampilkan username dari post.author, action.sourceUsername, atau item pertama array */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(post.platform)}
                      <span className="text-sm font-medium text-slate-900">
                        {post.author || action.sourceUsername || (Array.isArray(action.sourceContent) && action.sourceContent[0]?.author) || "—"}
                      </span>
                      <span className="text-xs text-slate-500">• {post.timestamp || "—"}</span>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                      (post.sentiment ?? 0) < 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {(post.sentiment ?? 0) < 0 ? <ThumbsDown className="w-3 h-3" /> : <ThumbsUp className="w-3 h-3" />}
                      {(post.sentiment ?? 0).toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Post Content */}
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">{post.content}</p>
                  
                  {/* Engagement Stats */}
                  {(post.engagement?.likes != null || post.engagement?.replies != null || (post.engagement?.retweets ?? 0) > 0) && (
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>❤️ {(post.engagement?.likes ?? 0).toLocaleString()}</span>
                      <span>💬 {post.engagement?.replies ?? 0}</span>
                      {(post.engagement?.retweets ?? 0) > 0 && <span>🔄 {post.engagement?.retweets}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Impact & Effort */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-slate-900 mb-3">Expected Impact</h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="text-lg text-slate-900">{action.impact}</div>
                <p className="text-sm text-slate-600 mt-2">
                  This action could significantly improve customer sentiment and reduce negative mentions.
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-slate-900 mb-3">Required Effort</h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="text-lg text-slate-900">{action.effort}</div>
                <p className="text-sm text-slate-600 mt-2">
                  Estimated timeline: 1-2 weeks with cross-team collaboration.
                </p>
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div>
            <h3 className="text-slate-900 mb-3">Share with Team</h3>
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-slate-700"
              >
                <Share2 className="w-4 h-4" />
                Share Action
              </button>
              
              {showShareMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden">
                  <button
                    onClick={() => handleShare("copy")}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-slate-700"
                  >
                    <Copy className="w-4 h-4" />
                    Copy to clipboard
                  </button>
                  <button
                    onClick={() => handleShare("email")}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-slate-700 border-t border-slate-100"
                  >
                    <Mail className="w-4 h-4" />
                    Send via email
                  </button>
                  <button
                    onClick={() => handleShare("slack")}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-slate-700 border-t border-slate-100"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Share to Slack
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              // Status is already saved via handleStatusChange
            }}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:opacity-90 transition-opacity shadow-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}