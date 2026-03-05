import type {
  DashboardContentStore,
  StatItem,
  PriorityActionItem,
  OutletItem,
  RiskItem,
  OpportunityItem,
  CompetitiveIssueItem,
  SentimentTrendItem,
  TopTopicItem,
  WordCloudItem,
} from "./dashboard-content-types";
import { defaultFeatureVisibility } from "./dashboard-content-types";
import type {
  CampaignStatItem,
  CampaignItem,
  CampaignTrendDataPoint,
  CampaignTimeSeriesPoint,
  CampaignPostPublishEvent,
  CampaignKeyEvent,
  CampaignReplySentimentOverall,
  CampaignReplyTopicCluster,
  CampaignContentTypeItem,
  CampaignTopPostItem,
  CampaignChannelItem,
  CampaignCompetitorItem,
  CampaignRecommendationItem,
  OutletStatItem,
  OutletPriorityActionItem,
  OutletMapDataItem,
  OutletSentimentByOutletItem,
  OutletTopicItem,
  OutletRecentReviewItem,
} from "./dashboard-content-types";
import { getInitialDashboardContentForInstance } from "./initial-data";

const STORAGE_KEY_PREFIX = "naradai_dashboard_content";

function getStorageKey(instanceId: string): string {
  return `${STORAGE_KEY_PREFIX}_${instanceId}`;
}

export const defaultDashboardContent: DashboardContentStore = {
  featureVisibility: defaultFeatureVisibility,
  statsOverview: [
    { id: "1", label: "Conversations Analyzed", value: "847.2K", description: "Posts and comments containing keywords related to your brand and competitors", icon: "Users" },
    { id: "2", label: "Average Sentiment Score", value: "0.72", description: "The average sentiment score (0.0–1.0) of the conversations related to your brand", icon: "TrendingUp" },
    { id: "3", label: "Critical Issues", value: "23", description: "Critical issues identified by Naradai AI where sentiment is relatively worse with mentions volume relatively higher", icon: "AlertTriangle" },
    { id: "4", label: "Share of Voice", value: "34.2%", description: "Your brand's share of total conversations compared to competitors", icon: "BarChart3" },
  ],
  priorityActions: [
    { id: "1", priority: "critical", title: "Address Packaging Complaints", description: "23% increase in negative mentions about product packaging damage during shipping", impact: "High", effort: "Medium", recommendation: "Contact logistics team to review packaging protocols. Consider switching to reinforced boxes for fragile items.", category: "Critical Issue", quadrantColor: "red", relatedIssues: ["Packaging"], metrics: { mentions: 1847, sentiment: -0.68, trend: "increasing" }, sourceContent: [{ id: "sc1", platform: "twitter", author: "@johndoe", content: "Just received my order and the box was completely crushed. Product inside is damaged. Really disappointed with the packaging quality @YourBrand", sentiment: -0.85, timestamp: "2 days ago", engagement: { likes: 234, replies: 45, retweets: 12 } }] },
    { id: "2", priority: "high", title: "Respond to Customer Service Backlash", description: "Wait times trending 40% longer than last month with rising frustration", impact: "Critical", effort: "Low", recommendation: "Publish transparent update about support improvements. Deploy chatbot for common queries.", category: "Critical Issue", quadrantColor: "red", relatedIssues: ["Customer Service", "Support Availability"], metrics: { mentions: 2341, sentiment: -0.54, trend: "increasing" }, sourceContent: [] },
    { id: "3", priority: "medium", title: "Capitalize on Feature Request Trend", description: "Mobile app dark mode requested by 15% of active users in discussions", impact: "Medium", effort: "High", recommendation: "Fast-track dark mode feature. Consider beta program to engage early adopters.", category: "Opportunity", quadrantColor: "cyan", relatedIssues: ["Features", "App UX"], metrics: { mentions: 892, sentiment: 0.42, trend: "stable" }, sourceContent: [] },
  ],
  outletSatisfaction: [
    { id: "1", name: "Medan Central", location: "Sumatra", coords: { x: 15, y: 35 }, status: "good", satisfaction: 0.84, issues: [] },
    { id: "2", name: "Jakarta Flagship", location: "Java", coords: { x: 28, y: 75 }, status: "critical", satisfaction: -0.32, issues: ["Long wait times", "Product availability"] },
    { id: "3", name: "Bandung Hub", location: "Java", coords: { x: 32, y: 78 }, status: "warning", satisfaction: 0.16, issues: ["Staff friendliness"] },
    { id: "4", name: "Surabaya East", location: "Java", coords: { x: 45, y: 82 }, status: "good", satisfaction: 0.76, issues: [] },
    { id: "5", name: "Banjarmasin Riverside", location: "Kalimantan", coords: { x: 48, y: 55 }, status: "good", satisfaction: 0.64, issues: [] },
    { id: "6", name: "Makassar Port", location: "Sulawesi", coords: { x: 62, y: 65 }, status: "warning", satisfaction: 0.30, issues: ["Delivery delays"] },
    { id: "7", name: "Manado North", location: "Sulawesi", coords: { x: 68, y: 35 }, status: "good", satisfaction: 0.78, issues: [] },
    { id: "8", name: "Denpasar Tourist", location: "Bali", coords: { x: 50, y: 88 }, status: "critical", satisfaction: -0.44, issues: ["High price perception", "Cleanliness"] },
    { id: "9", name: "Jayapura East", location: "Papua", coords: { x: 92, y: 72 }, status: "good", satisfaction: 0.90, issues: [] },
  ],
  risks: [
    { id: "1", title: "Declining Brand Sentiment", description: "Negative sentiment increased by 14% over the last 7 days", severity: "high", probability: 85, impact: "Brand reputation", trend: "increasing", supportingContents: 47, indicators: [{ label: "Customer Service", value: -0.54, change: -12 }, { label: "Product Quality", value: -0.28, change: -8 }, { label: "Packaging", value: -0.68, change: -23 }], mitigation: ["Monitor sentiment trends daily for early warning signs", "Prepare response communication templates", "Engage customer support team for rapid response"], sourceContent: [{ id: "r1", platform: "twitter", author: "@frustrated_user", content: "Really disappointed with @YourBrand lately. Quality just isn't what it used to be.", sentiment: -0.78, timestamp: "1 day ago" }] },
    { id: "2", title: "Competitor Gaining Market Share", description: "Competitor B's share of voice increased 8% this month", severity: "medium", probability: 72, impact: "Market position", trend: "increasing", supportingContents: 31, indicators: [{ label: "Social Mentions", value: 24, change: 8 }, { label: "Engagement Rate", value: 7.8, change: 12 }, { label: "Positive Sentiment", value: 75, change: 6 }], mitigation: [], sourceContent: [] },
    { id: "3", title: "Product Launch Backlash Risk", description: "Early feedback on new feature shows 42% negative response", severity: "critical", probability: 68, impact: "Product adoption", trend: "stable", supportingContents: 63, indicators: [{ label: "Usability Issues", value: 156, change: 45 }, { label: "Performance Complaints", value: 89, change: 23 }, { label: "Design Criticism", value: 67, change: 12 }], mitigation: [], sourceContent: [] },
  ],
  opportunities: [
    { id: "1", title: "Sustainability Movement Alignment", description: "34% of conversations mention eco-friendly preferences", potential: "high", confidence: 88, timeframe: "Short-term", category: "Product positioning", trend: "increasing", supportingContents: 52, metrics: { conversationVolume: 4521, growthRate: 34, sentimentScore: 0.76 }, recommendations: ["Launch eco-friendly product line", "Highlight sustainable practices", "Partner with environmental organizations"], sourceContent: [] },
    { id: "2", title: "Untapped Mobile User Segment", description: "Mobile users show 2.3x higher engagement but underserved", potential: "high", confidence: 91, timeframe: "Medium-term", category: "Market expansion", trend: "increasing", supportingContents: 38, metrics: { segmentSize: 156000, engagementRate: 12.4, conversionPotential: 68 }, recommendations: ["Optimize mobile app experience", "Create mobile-first features", "Target mobile advertising"], sourceContent: [] },
    { id: "3", title: "Influencer Partnership Gap", description: "Competitors have 3x more influencer mentions", potential: "medium", confidence: 79, timeframe: "Short-term", category: "Brand awareness", trend: "stable", supportingContents: 24, metrics: { currentInfluencers: 12, competitorAverage: 36, potentialReach: 2400000 }, recommendations: ["Identify and partner with micro-influencers", "Create affiliate program", "Amplify user-generated content"], sourceContent: [] },
  ],
  competitiveIssues: [
    { id: "1", issue: "Product Quality", category: "winning", yourSentiment: 0.78, competitorMedianSentiment: 0.68, yourMentions: 2500, competitorMedianMentions: 2000, relativeSentiment: 15, relativeMentions: 25 },
    { id: "2", issue: "Customer Service", category: "critical", yourSentiment: 0.32, competitorMedianSentiment: 0.67, yourMentions: 2800, competitorMedianMentions: 2000, relativeSentiment: -35, relativeMentions: 40 },
    { id: "3", issue: "Pricing", category: "moderate", yourSentiment: 0.58, competitorMedianSentiment: 0.70, yourMentions: 2300, competitorMedianMentions: 2000, relativeSentiment: -12, relativeMentions: 15 },
    { id: "4", issue: "Features", category: "opportunity", yourSentiment: 0.73, competitorMedianSentiment: 0.65, yourMentions: 1700, competitorMedianMentions: 2000, relativeSentiment: 8, relativeMentions: -15 },
    { id: "5", issue: "Packaging", category: "critical", yourSentiment: 0.38, competitorMedianSentiment: 0.66, yourMentions: 2600, competitorMedianMentions: 2000, relativeSentiment: -28, relativeMentions: 30 },
    { id: "6", issue: "Shipping Speed", category: "opportunity", yourSentiment: 0.82, competitorMedianSentiment: 0.62, yourMentions: 2200, competitorMedianMentions: 2000, relativeSentiment: 20, relativeMentions: 10 },
    { id: "7", issue: "App UX", category: "opportunity", yourSentiment: 0.70, competitorMedianSentiment: 0.65, yourMentions: 1600, competitorMedianMentions: 2000, relativeSentiment: 5, relativeMentions: -20 },
    { id: "8", issue: "Innovation", category: "winning", yourSentiment: 0.80, competitorMedianSentiment: 0.62, yourMentions: 2700, competitorMedianMentions: 2000, relativeSentiment: 18, relativeMentions: 35 },
  ],
  competitiveKeyInsights: [
    { id: "ki1", type: "critical", title: "Critical Issues", description: "Customer Service & Packaging are significantly underperforming with high visibility", bullets: ["Support Availability: -40% sentiment, +35% mentions", "Customer Service: -35% sentiment, +40% mentions"] },
    { id: "ki2", type: "strength", title: "Competitive Strengths", description: "Innovation & Product Quality are strong differentiators", bullets: ["Innovation: +18% sentiment, +35% mentions", "Shipping Speed: +20% sentiment, +10% mentions"] },
  ],
  whatsHappeningSentimentTrends: [
    { date: "Nov 1", positive: 68, negative: 22, neutral: 10 },
    { date: "Nov 8", positive: 73, negative: 17, neutral: 10 },
    { date: "Nov 15", positive: 67, negative: 23, neutral: 10 },
    { date: "Nov 22", positive: 62, negative: 28, neutral: 10 },
    { date: "Nov 30", positive: 61, negative: 29, neutral: 10 },
  ] as SentimentTrendItem[],
  whatsHappeningTopTopics: [
    { topic: "Packaging", mentions: 2847, sentiment: -0.68 },
    { topic: "Customer Service", mentions: 2341, sentiment: -0.54 },
    { topic: "Product Quality", mentions: 1923, sentiment: 0.71 },
    { topic: "Shipping Speed", mentions: 1654, sentiment: 0.32 },
    { topic: "Price Value", mentions: 1432, sentiment: 0.45 },
    { topic: "Mobile App", mentions: 892, sentiment: 0.12 },
  ] as TopTopicItem[],
  whatsHappeningWordCloud: [
    { text: "quality", weight: 95, sentiment: "positive" },
    { text: "customer service", weight: 88, sentiment: "negative" },
    { text: "price", weight: 82, sentiment: "neutral" },
    { text: "delivery", weight: 78, sentiment: "positive" },
    { text: "packaging", weight: 72, sentiment: "negative" },
  ] as WordCloudItem[],
  whatsHappeningKeyEvents: [
    { id: "ke1", date: "Nov 9", title: "Product Launch Success", description: "New feature rollout received 75% positive sentiment, highest this month." },
    { id: "ke2", date: "Nov 17", title: "Packaging Issue Reports Spike", description: "Shipping damage complaints increased 23%, causing sentiment drop." },
    { id: "ke3", date: "Nov 17", title: "Competitor Price War Begins", description: "Major competitor slashed prices by 30%, triggering negative brand comparisons." },
    { id: "ke4", date: "Nov 25", title: "Customer Service Backlash", description: "Support wait times triggered wave of negative feedback across platforms." },
  ],
  whatsHappeningAITopicAnalysis: [
    { id: "ata1", type: "critical", title: "Packaging is #1 Pain Point", description: "Most discussed topic with highly negative sentiment. Immediate action required to prevent brand damage." },
    { id: "ata2", type: "opportunity", title: "Product Quality is a Strength", description: "High volume with positive sentiment. Leverage this in marketing to counter negative narratives." },
    { id: "ata3", type: "insight", title: "Mobile App Underperforming", description: "Low mention volume with neutral sentiment suggests lack of engagement. Consider feature improvements." },
  ],
  whatsHappeningTopicTrendsData: [
    { date: "Nov 1", packaging: 320, customerService: 280, productQuality: 245, shipping: 190 },
    { date: "Nov 5", packaging: 340, customerService: 265, productQuality: 260, shipping: 185 },
    { date: "Nov 9", packaging: 355, customerService: 270, productQuality: 280, shipping: 195 },
    { date: "Nov 13", packaging: 380, customerService: 285, productQuality: 275, shipping: 200 },
    { date: "Nov 17", packaging: 465, customerService: 295, productQuality: 270, shipping: 205 },
    { date: "Nov 21", packaging: 520, customerService: 340, productQuality: 265, shipping: 210 },
    { date: "Nov 25", packaging: 567, customerService: 401, productQuality: 260, shipping: 215 },
  ],
  whatsHappeningAITrendAnalysis: [
    { id: "atra1", type: "critical", title: "Packaging Mentions Surging", description: "77% increase in packaging discussions since Nov 1. Spike correlates with shipping damage reports." },
    { id: "atra2", type: "warning", title: "Customer Service Escalating", description: "43% rise in customer service mentions, accelerating after Nov 21. Wait times are primary driver." },
    { id: "atra3", type: "insight", title: "Product Quality Discussions Stable", description: "Minimal variation in product quality mentions. Consistent positive sentiment indicates strength." },
  ],
  whatsHappeningClusters: [
    { id: "cl1", theme: "Packaging Damage Issues", size: 2847, sentiment: -0.68, trend: "up", keywords: ["broken", "damaged", "poor packaging", "arrived broken"] },
    { id: "cl2", theme: "Excellent Product Quality", size: 1923, sentiment: 0.71, trend: "stable", keywords: ["high quality", "durable", "worth it", "exceeded expectations"] },
    { id: "cl3", theme: "Customer Support Delays", size: 2341, sentiment: -0.54, trend: "up", keywords: ["slow response", "waiting", "no reply", "poor support"] },
    { id: "cl4", theme: "Fast Shipping Praise", size: 1654, sentiment: 0.32, trend: "down", keywords: ["quick delivery", "fast shipping", "arrived early", "prompt"] },
  ],
  whatsHappeningHashtags: [
    { id: "h1", tag: "#BrandXFail", conversations: 1240, likes: 8921, comments: 3412 },
    { id: "h2", tag: "#SkincareTok", conversations: 980, likes: 7654, comments: 2187 },
    { id: "h3", tag: "#BrandXReview", conversations: 856, likes: 6432, comments: 1954 },
    { id: "h4", tag: "#CleanBeauty", conversations: 720, likes: 5876, comments: 1643 },
    { id: "h5", tag: "#PackagingFail", conversations: 690, likes: 5210, comments: 2876 },
    { id: "h6", tag: "#BrandXLove", conversations: 612, likes: 4987, comments: 1102 },
    { id: "h7", tag: "#AffordableSkincare", conversations: 544, likes: 4321, comments: 987 },
    { id: "h8", tag: "#CompetitorAvsX", conversations: 498, likes: 3876, comments: 1543 },
    { id: "h9", tag: "#GlowUp", conversations: 421, likes: 3210, comments: 765 },
    { id: "h10", tag: "#BrandXAlternative", conversations: 388, likes: 2987, comments: 1321 },
  ],
  whatsHappeningAccounts: [
    { id: "ac1", name: "GlowUpGuru", handle: "@glowupguru", platform: "YouTube", followers: 1240000, conversations: 87, likes: 34200, replies: 8740 },
    { id: "ac2", name: "Beauty Obsessed", handle: "@beautyobsessed", platform: "Twitter", followers: 890000, conversations: 124, likes: 28900, replies: 6320 },
    { id: "ac3", name: "Skincare Daily", handle: "@skincaredaily", platform: "Twitter", followers: 760000, conversations: 96, likes: 22100, replies: 5480 },
    { id: "ac4", name: "Glow Journey", handle: "@glowjourney", platform: "Instagram", followers: 654000, conversations: 63, likes: 19800, replies: 4120 },
    { id: "ac5", name: "BeautyHacks101", handle: "@beautyhacks101", platform: "YouTube", followers: 521000, conversations: 45, likes: 16400, replies: 3890 },
    { id: "ac6", name: "Deal Watcher", handle: "@dealwatcher", platform: "Twitter", followers: 412000, conversations: 78, likes: 12300, replies: 3210 },
    { id: "ac7", name: "Loyal Customer", handle: "@loyalcustomer", platform: "Instagram", followers: 328000, conversations: 34, likes: 9870, replies: 2140 },
    { id: "ac8", name: "frustrated_buyer", handle: "u/frustrated_buyer", platform: "Reddit", followers: 245000, conversations: 56, likes: 8430, replies: 4670 },
    { id: "ac9", name: "online_shopper99", handle: "u/online_shopper99", platform: "Reddit", followers: 198000, conversations: 42, likes: 6210, replies: 3540 },
    { id: "ac10", name: "tech_user42", handle: "u/tech_user42", platform: "Reddit", followers: 156000, conversations: 38, likes: 4890, replies: 2980 },
  ],
  whatsHappeningContents: [
    { id: "co1", title: "OMG the new packaging is literally falling apart 😭", platform: "Twitter", author: "@beautyobsessed", likes: 4823, comments: 1247 },
    { id: "co2", title: "Honest review: Is Brand X worth the hype? (spoiler: YES)", platform: "YouTube", author: "GlowUpGuru", likes: 3912, comments: 982 },
    { id: "co3", title: "Customer service finally responded after 3 weeks...", platform: "Reddit", author: "u/frustrated_buyer", likes: 3541, comments: 876 },
    { id: "co4", title: "Brand X vs Competitor A - full comparison thread 🧵", platform: "Twitter", author: "@skincaredaily", likes: 3104, comments: 743 },
    { id: "co5", title: "Just switched from Competitor B and WOW the difference", platform: "Instagram", author: "@glowjourney", likes: 2876, comments: 654 },
    { id: "co6", title: "Why does nobody talk about their shipping issues?", platform: "Reddit", author: "u/online_shopper99", likes: 2654, comments: 891 },
    { id: "co7", title: "Brand X appreciation post - 2 years and counting ❤️", platform: "Instagram", author: "@loyalcustomer", likes: 2431, comments: 412 },
    { id: "co8", title: "Price increase again?? This is getting ridiculous", platform: "Twitter", author: "@dealwatcher", likes: 2198, comments: 567 },
    { id: "co9", title: "Tutorial: How to get the most out of Brand X products", platform: "YouTube", author: "BeautyHacks101", likes: 1987, comments: 324 },
    { id: "co10", title: "My mobile app keeps crashing after the latest update", platform: "Reddit", author: "u/tech_user42", likes: 1765, comments: 498 },
  ],
  whatsHappeningKOLMatrix: [
    { id: "kol1", name: "@TechReviewer", followers: 245000, positivity: 82, engagement: 12400, color: "#10b981", category: "Tech Influencer" },
    { id: "kol2", name: "@DigitalTrends", followers: 189000, positivity: 76, engagement: 9800, color: "#06b6d4", category: "Media Outlet" },
    { id: "kol3", name: "@ProductGuru", followers: 156000, positivity: 88, engagement: 15600, color: "#10b981", category: "Product Reviewer" },
    { id: "kol4", name: "@TechCritic", followers: 134000, positivity: 34, engagement: 8900, color: "#ef4444", category: "Critical Reviewer" },
    { id: "kol5", name: "@IndustryInsider", followers: 98000, positivity: 68, engagement: 5200, color: "#f59e0b", category: "Industry Expert" },
    { id: "kol6", name: "@ConsumerWatch", followers: 87000, positivity: 42, engagement: 6700, color: "#ef4444", category: "Consumer Advocate" },
    { id: "kol7", name: "@SmartBuyer", followers: 72000, positivity: 79, engagement: 4800, color: "#06b6d4", category: "Shopping Guide" },
    { id: "kol8", name: "@EcoReviews", followers: 64000, positivity: 91, engagement: 7200, color: "#10b981", category: "Sustainability Focus" },
    { id: "kol9", name: "@BudgetHacks", followers: 53000, positivity: 58, engagement: 3400, color: "#f59e0b", category: "Value Focused" },
    { id: "kol10", name: "@QualityFirst", followers: 47000, positivity: 85, engagement: 5100, color: "#10b981", category: "Quality Advocate" },
    { id: "kol11", name: "@TrendSpotter", followers: 38000, positivity: 72, engagement: 2900, color: "#06b6d4", category: "Trend Analyst" },
    { id: "kol12", name: "@HonestReview", followers: 29000, positivity: 51, engagement: 1800, color: "#f59e0b", category: "Honest Opinions" },
    { id: "kol13", name: "@DailyDeals", followers: 23000, positivity: 64, engagement: 1400, color: "#06b6d4", category: "Deals Curator" },
    { id: "kol14", name: "@UnboxExpert", followers: 18000, positivity: 38, engagement: 1200, color: "#ef4444", category: "Unboxing Channel" },
    { id: "kol15", name: "@GreenChoice", followers: 12000, positivity: 94, engagement: 1600, color: "#10b981", category: "Eco Advocate" },
  ],
  whatsHappeningAIKOLAnalysis: [
    { id: "kola1", type: "critical", title: "Engage @TechCritic Urgently", description: "High-reach influencer (134K followers) with only 34% positive sentiment. One negative post could reach thousands. Prioritize relationship building." },
    { id: "kola2", type: "opportunity", title: "Partner with @ProductGuru", description: "Top-tier influencer with 88% positivity and high engagement. Perfect candidate for brand ambassadorship or product collaboration." },
    { id: "kola3", type: "insight", title: "Nurture Mid-Tier Advocates", description: "@EcoReviews (91% positive) and @QualityFirst (85% positive) are smaller but highly supportive. Great for authentic testimonials." },
  ],
  whatsHappeningShareOfPlatform: [
    { date: "Jan 1", twitter: 1200, youtube: 600, reddit: 500, instagram: 700, facebook: 550, tiktok: 400 },
    { date: "Jan 8", twitter: 1350, youtube: 650, reddit: 550, instagram: 750, facebook: 500, tiktok: 450 },
    { date: "Jan 15", twitter: 1100, youtube: 700, reddit: 600, instagram: 680, facebook: 520, tiktok: 480 },
    { date: "Jan 22", twitter: 1500, youtube: 720, reddit: 650, instagram: 800, facebook: 580, tiktok: 500 },
    { date: "Jan 29", twitter: 1400, youtube: 680, reddit: 700, instagram: 850, facebook: 600, tiktok: 520 },
    { date: "Feb 5", twitter: 1600, youtube: 750, reddit: 620, instagram: 900, facebook: 550, tiktok: 550 },
    { date: "Feb 12", twitter: 1450, youtube: 800, reddit: 680, instagram: 820, facebook: 620, tiktok: 600 },
    { date: "Feb 19", twitter: 1550, youtube: 770, reddit: 720, instagram: 880, facebook: 580, tiktok: 570 },
    { date: "Feb 26", twitter: 1700, youtube: 850, reddit: 750, instagram: 950, facebook: 640, tiktok: 620 },
    { date: "Mar 5", twitter: 1650, youtube: 820, reddit: 800, instagram: 920, facebook: 600, tiktok: 650 },
    { date: "Mar 12", twitter: 1800, youtube: 900, reddit: 780, instagram: 980, facebook: 660, tiktok: 700 },
    { date: "Mar 19", twitter: 1750, youtube: 880, reddit: 830, instagram: 1000, facebook: 680, tiktok: 720 },
  ],
  competitiveMatrixItems: [
    { id: "cm1", name: "Your Brand", mentions: 42000, positivePercentage: 58, size: 850, color: "#8b5cf6" },
    { id: "cm2", name: "Competitor A", mentions: 38000, positivePercentage: 62, size: 720, color: "#06b6d4" },
    { id: "cm3", name: "Competitor B", mentions: 31000, positivePercentage: 71, size: 650, color: "#10b981" },
    { id: "cm4", name: "Competitor C", mentions: 24000, positivePercentage: 54, size: 480, color: "#f59e0b" },
    { id: "cm5", name: "Competitor D", mentions: 18000, positivePercentage: 48, size: 380, color: "#ef4444" },
  ],
  competitiveQuadrantAnalysis: [
    { id: "qa1", label: "High Volume + Positive", brands: "Competitor A, B", note: "Market leaders" },
    { id: "qa2", label: "High Volume + Mixed", brands: "Your Brand", note: "Improve sentiment" },
    { id: "qa3", label: "Low Volume + Mixed", brands: "Competitor C, D", note: "Growth opportunity" },
    { id: "qa4", label: "Key Insight", brands: "↗ Move up-right", note: "Increase positive %" },
  ],
  competitiveSentimentScores: [
    { issue: "Product Quality", yourBrand: 0.78, competitorA: 0.72, competitorB: 0.65, competitorC: 0.68, competitorD: 0.71 },
    { issue: "Customer Service", yourBrand: 0.32, competitorA: 0.68, competitorB: 0.71, competitorC: 0.65, competitorD: 0.64 },
    { issue: "Pricing", yourBrand: 0.58, competitorA: 0.72, competitorB: 0.68, competitorC: 0.70, competitorD: 0.69 },
    { issue: "Features", yourBrand: 0.73, competitorA: 0.67, competitorB: 0.65, competitorC: 0.64, competitorD: 0.63 },
    { issue: "Packaging", yourBrand: 0.38, competitorA: 0.65, competitorB: 0.68, competitorC: 0.67, competitorD: 0.64 },
    { issue: "Shipping Speed", yourBrand: 0.82, competitorA: 0.58, competitorB: 0.62, competitorC: 0.65, competitorD: 0.61 },
    { issue: "App UX", yourBrand: 0.70, competitorA: 0.66, competitorB: 0.64, competitorC: 0.65, competitorD: 0.67 },
    { issue: "Innovation", yourBrand: 0.80, competitorA: 0.60, competitorB: 0.58, competitorC: 0.65, competitorD: 0.62 },
  ],
  competitiveVolumeOfMentions: [
    { issue: "Product Quality", yourBrand: 2500, competitorA: 2100, competitorB: 1900, competitorC: 2000, competitorD: 1950 },
    { issue: "Customer Service", yourBrand: 2800, competitorA: 2050, competitorB: 1980, competitorC: 1900, competitorD: 2100 },
    { issue: "Pricing", yourBrand: 2300, competitorA: 2000, competitorB: 1950, competitorC: 2050, competitorD: 2020 },
    { issue: "Features", yourBrand: 1700, competitorA: 2100, competitorB: 1950, competitorC: 1980, competitorD: 2050 },
    { issue: "Packaging", yourBrand: 2600, competitorA: 1900, competitorB: 2050, competitorC: 2000, competitorD: 1980 },
    { issue: "Shipping Speed", yourBrand: 2200, competitorA: 2050, competitorB: 1980, competitorC: 1950, competitorD: 2100 },
    { issue: "App UX", yourBrand: 1600, competitorA: 2100, competitorB: 1950, competitorC: 2000, competitorD: 1900 },
    { issue: "Innovation", yourBrand: 2700, competitorA: 1950, competitorB: 1900, competitorC: 2100, competitorD: 2000 },
  ],
  competitiveShareOfVoice: [
    { date: "Jan 1", yourBrand: 1800, competitorA: 1500, competitorB: 1300, competitorC: 1400, competitorD: 1350 },
    { date: "Jan 8", yourBrand: 2100, competitorA: 1600, competitorB: 1400, competitorC: 1500, competitorD: 1420 },
    { date: "Jan 15", yourBrand: 1950, competitorA: 1700, competitorB: 1350, competitorC: 1550, competitorD: 1480 },
    { date: "Jan 22", yourBrand: 2300, competitorA: 1800, competitorB: 1500, competitorC: 1600, competitorD: 1520 },
    { date: "Jan 29", yourBrand: 2500, competitorA: 1750, competitorB: 1450, competitorC: 1650, competitorD: 1580 },
    { date: "Feb 5", yourBrand: 2200, competitorA: 1900, competitorB: 1550, competitorC: 1700, competitorD: 1600 },
    { date: "Feb 12", yourBrand: 2600, competitorA: 1850, competitorB: 1600, competitorC: 1750, competitorD: 1650 },
    { date: "Feb 19", yourBrand: 2400, competitorA: 2000, competitorB: 1650, competitorC: 1800, competitorD: 1700 },
    { date: "Feb 26", yourBrand: 2800, competitorA: 1950, competitorB: 1700, competitorC: 1850, competitorD: 1750 },
    { date: "Mar 5", yourBrand: 2700, competitorA: 2100, competitorB: 1750, competitorC: 1900, competitorD: 1800 },
    { date: "Mar 12", yourBrand: 3000, competitorA: 2050, competitorB: 1800, competitorC: 1950, competitorD: 1850 },
    { date: "Mar 19", yourBrand: 2900, competitorA: 2200, competitorB: 1850, competitorC: 2000, competitorD: 1900 },
  ],
  competitiveBrandLabels: {
    yourBrand: "Your Brand",
    competitorA: "Competitor A",
    competitorB: "Competitor B",
    competitorC: "Competitor C",
    competitorD: "Competitor D",
  },
  rawSourceContents: [],

  // ─── Campaign Analysis Defaults ──────────────────────────────────────────
  campaignStats: [
    { id: "cs1", label: "Total Likes", value: "186K", change: "+22%", positive: true, description: "Total likes received across all campaign posts.", icon: "Heart" },
    { id: "cs2", label: "Total Shares", value: "28.4K", change: "+14%", positive: true, description: "Total shares and reposts across all platforms.", icon: "Share2" },
    { id: "cs3", label: "Total Replies", value: "41.2K", change: "+31%", positive: true, description: "Total replies and comments on campaign posts.", icon: "MessageCircle" },
    { id: "cs4", label: "Positive Reply Rate", value: "74%", change: "+5pts", positive: true, description: "Percentage of replies classified as positive sentiment.", icon: "MessageCircle" },
  ] as CampaignStatItem[],
  campaignPerformance: [
    { id: "cp1", name: "Summer Launch 2025", platform: "Instagram", likes: 48200, shares: 3200, replies: 1840, status: "active", sentiment: 0.78 },
    { id: "cp2", name: "Year-End Sale", platform: "TikTok", likes: 92400, shares: 12800, replies: 4100, status: "completed", sentiment: 0.65 },
    { id: "cp3", name: "Brand Awareness Q1", platform: "Twitter/X", likes: 8200, shares: 2400, replies: 920, status: "active", sentiment: 0.71 },
    { id: "cp4", name: "Product Launch - ProMax", platform: "YouTube", likes: 18400, shares: 1100, replies: 680, status: "paused", sentiment: 0.55 },
    { id: "cp5", name: "Influencer Collab Series", platform: "Instagram", likes: 61400, shares: 8900, replies: 5100, status: "active", sentiment: 0.82 },
  ] as CampaignItem[],
  campaignTrendData: [
    { id: "ct1", month: "Aug", likes: 28, shares: 3.2, replies: 5.1 },
    { id: "ct2", month: "Sep", likes: 34, shares: 3.8, replies: 6.0 },
    { id: "ct3", month: "Oct", likes: 41, shares: 4.4, replies: 7.2 },
    { id: "ct4", month: "Nov", likes: 52, shares: 5.1, replies: 8.8 },
    { id: "ct5", month: "Dec", likes: 63, shares: 5.8, replies: 10.4 },
    { id: "ct6", month: "Jan", likes: 74, shares: 6.4, replies: 12.1 },
    { id: "ct7", month: "Feb", likes: 88, shares: 7.2, replies: 14.3 },
  ] as CampaignTrendDataPoint[],
  campaignTimeSeriesData: [
    { id: "cts1",  date: "Jan 5",  likes: 820,  replies: 94,  shares: 61 },
    { id: "cts2",  date: "Jan 8",  likes: 910,  replies: 102, shares: 70 },
    { id: "cts3",  date: "Jan 10", likes: 870,  replies: 98,  shares: 66 },
    { id: "cts4",  date: "Jan 13", likes: 1050, replies: 130, shares: 85 },
    { id: "cts5",  date: "Jan 15", likes: 1420, replies: 198, shares: 120 },
    { id: "cts6",  date: "Jan 18", likes: 1310, replies: 177, shares: 108 },
    { id: "cts7",  date: "Jan 20", likes: 1180, replies: 155, shares: 95 },
    { id: "cts8",  date: "Jan 22", likes: 1390, replies: 185, shares: 114 },
    { id: "cts9",  date: "Jan 25", likes: 1680, replies: 232, shares: 147 },
    { id: "cts10", date: "Jan 28", likes: 1540, replies: 210, shares: 133 },
    { id: "cts11", date: "Feb 1",  likes: 1720, replies: 248, shares: 158 },
    { id: "cts12", date: "Feb 4",  likes: 2050, replies: 310, shares: 193 },
    { id: "cts13", date: "Feb 7",  likes: 1920, replies: 285, shares: 178 },
    { id: "cts14", date: "Feb 10", likes: 2210, replies: 345, shares: 215 },
    { id: "cts15", date: "Feb 13", likes: 2640, replies: 420, shares: 268 },
    { id: "cts16", date: "Feb 16", likes: 2490, replies: 390, shares: 245 },
    { id: "cts17", date: "Feb 18", likes: 2310, replies: 355, shares: 228 },
    { id: "cts18", date: "Feb 20", likes: 2520, replies: 380, shares: 249 },
    { id: "cts19", date: "Feb 22", likes: 3080, replies: 487, shares: 312 },
    { id: "cts20", date: "Feb 25", likes: 2870, replies: 445, shares: 286 },
    { id: "cts21", date: "Feb 28", likes: 3240, replies: 520, shares: 335 },
  ] as CampaignTimeSeriesPoint[],
  campaignPostPublishEvents: [
    { id: "ppe1", date: "Jan 8",  label: "Reel #1 — Product Reveal",    type: "reel" },
    { id: "ppe2", date: "Jan 15", label: "Thread — Founder Story",       type: "thread" },
    { id: "ppe3", date: "Jan 22", label: "Carousel — Feature Breakdown", type: "carousel" },
    { id: "ppe4", date: "Feb 1",  label: "Reel #2 — Tutorial",           type: "reel" },
    { id: "ppe5", date: "Feb 10", label: "Static — UGC Compilation",     type: "image" },
    { id: "ppe6", date: "Feb 13", label: "Reel #3 — Creator Collab",     type: "reel" },
    { id: "ppe7", date: "Feb 22", label: "Live Stream Recap Clip",        type: "live_stream" },
  ] as CampaignPostPublishEvent[],
  campaignKeyEvents: [
    { id: "cke1", date: "Jan 15", title: "First major engagement spike", type: "spike", insight: "The Founder Story thread published on Jan 15 drove a 35% jump in likes and a 52% surge in replies within 48 hours. Audience comments clustered around authenticity and brand trust — reply sentiment was 78% positive." },
    { id: "cke2", date: "Feb 4",  title: "Sustained growth trend begins", type: "pivot", insight: "Starting Feb 4, all three engagement metrics entered a consistent upward trend. The Tutorial Reel appears to have onboarded a new audience cohort — shares nearly doubled week-over-week." },
    { id: "cke3", date: "Feb 13", title: "Creator Collab inflection point", type: "spike", insight: "The Creator Collab Reel on Feb 13 produced the single-day highest like-to-reply ratio (6.3×) suggesting broad passive appreciation rather than active discussion." },
    { id: "cke4", date: "Feb 22", title: "Replies & shares decouple from likes", type: "pivot", insight: "On Feb 22, replies (+28%) and shares (+26%) grew significantly faster than likes (+22%) — a decoupling that signals deeper audience involvement and purchase intent." },
  ] as CampaignKeyEvent[],
  campaignReplySentiment: { positive: 74, neutral: 16, negative: 10 } as CampaignReplySentimentOverall,
  campaignReplyTopics: [
    { id: "crt1", topic: "Product Quality",     totalReplies: 9800, positive: 82, neutral: 12, negative: 6,  topComments: ["This is literally the best product I've tried all year 🔥", "Quality feels premium, definitely worth the price", "The finish is a bit disappointing compared to photos"] },
    { id: "crt2", topic: "Pricing & Value",     totalReplies: 7200, positive: 54, neutral: 22, negative: 24, topComments: ["A bit pricey for what you get tbh", "Worth every penny if you use it daily", "Why is it more expensive than last year's version?"] },
    { id: "crt3", topic: "Brand Vibe & Aesthetics", totalReplies: 6400, positive: 88, neutral: 9, negative: 3, topComments: ["The campaign visuals are absolutely stunning ✨", "Love the energy and direction this brand is going", "Very on-brand and consistent — refreshing!"] },
    { id: "crt4", topic: "Delivery & Availability", totalReplies: 5100, positive: 61, neutral: 18, negative: 21, topComments: ["Still waiting for my order from 2 weeks ago 😤", "Arrived super fast, impressed with logistics", "Out of stock in my region again, frustrating"] },
    { id: "crt5", topic: "Content & Creator Collab", totalReplies: 4900, positive: 79, neutral: 14, negative: 7, topComments: ["The influencer collab was so authentic and fun", "Finally a brand collab that doesn't feel forced", "Great content but felt a bit scripted at times"] },
    { id: "crt6", topic: "Campaign Concept",    totalReplies: 4200, positive: 71, neutral: 19, negative: 10, topComments: ["The storytelling in this campaign is next level", "Really resonated with the theme, well done", "Not sure I understood the message clearly"] },
  ] as CampaignReplyTopicCluster[],
  campaignContentTypes: [
    { id: "cct1", type: "Reel",         platform: "Instagram", posts: 24, likes: 61400, shares: 8900,  replies: 5100, positiveSentiment: 81, negativeSentiment: 7,  topTopics: ["Brand Vibe", "Product Quality", "Content Style"],    audienceReaction: "High excitement & aspiration — audiences respond with enthusiasm and shareability" },
    { id: "cct2", type: "Short Video",  platform: "TikTok",    posts: 32, likes: 92400, shares: 12800, replies: 4100, positiveSentiment: 79, negativeSentiment: 9,  topTopics: ["Campaign Concept", "Creator Collab", "Humor"],        audienceReaction: "Viral-driven response — heavy on shares and likes; replies lean humorous and conversational" },
    { id: "cct3", type: "Thread",       platform: "Twitter/X", posts: 48, likes: 8200,  shares: 2400,  replies: 4800, positiveSentiment: 58, negativeSentiment: 22, topTopics: ["Pricing & Value", "Opinions", "Brand Comparison"],    audienceReaction: "High reply volume with polarised opinions — debates on price and comparisons to competitors" },
    { id: "cct4", type: "Carousel",     platform: "Instagram", posts: 18, likes: 34200, shares: 4100,  replies: 2900, positiveSentiment: 76, negativeSentiment: 10, topTopics: ["Product Features", "Availability", "Aesthetics"],     audienceReaction: "Educational engagement — audiences save and share for reference, ask follow-up questions" },
    { id: "cct5", type: "Static Image", platform: "Facebook",  posts: 56, likes: 12800, shares: 3400,  replies: 1900, positiveSentiment: 65, negativeSentiment: 15, topTopics: ["Promotions", "Delivery", "Brand Sentiment"],          audienceReaction: "Older audience segment — promotional content drives shares; service complaints appear in replies" },
    { id: "cct6", type: "Live Stream",  platform: "YouTube",   posts: 6,  likes: 18400, shares: 1100,  replies: 8200, positiveSentiment: 72, negativeSentiment: 11, topTopics: ["Product Demo", "Q&A", "Authenticity"],                audienceReaction: "Deep engagement — high reply count from live Q&A; audiences value real-time authenticity" },
  ] as CampaignContentTypeItem[],
  campaignTopPosts: [
    { id: "ctp1", type: "Short Video", title: "30-second campaign spot",    platform: "TikTok",    likes: 92400, shares: 12800, replies: 4100, sentiment: 0.79 },
    { id: "ctp2", type: "Reel",        title: "Behind-the-scenes reveal",   platform: "Instagram", likes: 48200, shares: 3200,  replies: 1840, sentiment: 0.84 },
    { id: "ctp3", type: "Live Stream", title: "Live product Q&A session",   platform: "YouTube",   likes: 18400, shares: 1100,  replies: 8200, sentiment: 0.72 },
    { id: "ctp4", type: "Thread",      title: "Campaign story + user polls", platform: "Twitter/X", likes: 8200,  shares: 2400,  replies: 4800, sentiment: 0.61 },
  ] as CampaignTopPostItem[],
  campaignChannels: [
    { id: "cc1", name: "Instagram", likes: 89200, replies: 21400, shares: 23800, posts: 48,  icon: "IG", color: "from-pink-400 to-rose-500" },
    { id: "cc2", name: "TikTok",    likes: 74300, replies: 18600, shares: 25680, posts: 32,  icon: "TK", color: "from-slate-700 to-slate-900" },
    { id: "cc3", name: "Twitter/X", likes: 14800, replies: 9240,  shares: 4100,  posts: 124, icon: "X",  color: "from-sky-400 to-blue-600" },
    { id: "cc4", name: "YouTube",   likes: 22100, replies: 8900,  shares: 5720,  posts: 12,  icon: "YT", color: "from-red-400 to-red-600" },
    { id: "cc5", name: "Facebook",  likes: 12400, replies: 4600,  shares: 4000,  posts: 56,  icon: "FB", color: "from-blue-500 to-indigo-600" },
  ] as CampaignChannelItem[],
  campaignCompetitors: [
    { id: "ccmp1", brand: "Your Brand",   posts: 264, likes: 184200, replies: 41800, shares: 29600, sentiment: 0.76 },
    { id: "ccmp2", brand: "Competitor A", posts: 198, likes: 152400, replies: 28900, shares: 21300, sentiment: 0.68 },
    { id: "ccmp3", brand: "Competitor B", posts: 143, likes: 118700, replies: 34100, shares: 18900, sentiment: 0.72 },
    { id: "ccmp4", brand: "Competitor C", posts: 310, likes: 87600,  replies: 19200, shares: 11400, sentiment: 0.59 },
    { id: "ccmp5", brand: "Competitor D", posts: 97,  likes: 214500, replies: 52300, shares: 38100, sentiment: 0.81 },
  ] as CampaignCompetitorItem[],
  campaignRecommendations: [
    { id: "cr1", priority: "high",   title: "Double down on TikTok Reels",             detail: "TikTok shows the highest engagement rate at 12.1%. Increase posting frequency from 2x to 4x per week and allocate an additional 10% of budget.", impact: "Est. +18% reach" },
    { id: "cr2", priority: "high",   title: "Address negative price sentiment",         detail: "Price & Value theme has a 61% positive sentiment score - the lowest across all themes. Consider highlighting value propositions or limited-time offers.", impact: "Est. +9% sentiment" },
    { id: "cr3", priority: "medium", title: "Reactivate paused YouTube campaign",       detail: "Product Launch - ProMax shows 0.55 sentiment. Refreshing the creative and relaunching could improve perception and recapture lost reach.", impact: "Est. +280K reach" },
    { id: "cr4", priority: "medium", title: "Expand influencer collaboration",          detail: "The Influencer Collab Series has the highest engagement rate (15.3%). Partnering with 2-3 additional micro-influencers could amplify organic reach.", impact: "Est. +400K impressions" },
    { id: "cr5", priority: "low",    title: "Repurpose top-performing content cross-platform", detail: "The TikTok 30-second campaign spot has 92K likes. Repurposing it for Instagram Reels and YouTube Shorts can extend its lifecycle at minimal cost.", impact: "Est. +150K engagements" },
  ] as CampaignRecommendationItem[],

  // ─── Outlet Analysis Defaults ────────────────────────────────────────────
  outletStats: [
    { id: "os1", label: "Total Outlets",     value: "124",   change: "+3",   positive: true,  description: "Total number of active outlets across all regions.",                                               icon: "Store" },
    { id: "os2", label: "Avg. Satisfaction", value: "3.8",   change: "-0.2", positive: false, description: "Average customer satisfaction score (out of 5) across all outlets.",                              icon: "Star" },
    { id: "os3", label: "Total Reviews",     value: "41.2K", change: "+18%", positive: true,  description: "Total customer reviews collected across all outlets.",                                             icon: "MessageSquare" },
    { id: "os4", label: "Critical Outlets",  value: "9",     change: "+2",   positive: false, description: "Outlets with satisfaction scores below the critical threshold (< 3.0).",                          icon: "TrendingDown" },
  ] as OutletStatItem[],
  outletPriorityActions: [
    { id: "opa1", priority: "high",   outlet: "Jakarta Flagship", region: "DKI Jakarta",  title: "Address wait time complaints urgently",          detail: "Wait time mentions spiked 45% in the last 48 hours. Negative reviews citing 'slow service' now account for 38% of all reviews for this outlet. Immediate staffing review recommended.", impact: "Est. +0.6 score" },
    { id: "opa2", priority: "high",   outlet: "Medan Central",    region: "North Sumatra", title: "Investigate pricing & cleanliness issues",       detail: "Persistent complaints about overpriced items and facility hygiene. Sentiment dropped 22pts MoM. An on-site audit and price alignment with regional average is advised.", impact: "Est. +0.5 score" },
    { id: "opa3", priority: "medium", outlet: "Surabaya East",    region: "East Java",     title: "Respond to product availability feedback",       detail: "Customers repeatedly mention out-of-stock items during peak hours. Aligning inventory reorder points with foot traffic data could reduce stockout complaints by ~60%.", impact: "Est. +0.3 score" },
    { id: "opa4", priority: "medium", outlet: "Bandung Dago",     region: "West Java",     title: "Leverage high satisfaction as showcase outlet",  detail: "Scoring 4.6/5 — the highest in the network. Document service practices and replicate the SOP across the 8 underperforming outlets in West Java.", impact: "Network +0.2 avg" },
    { id: "opa5", priority: "low",    outlet: "All Regions",      region: "National",      title: "Launch post-visit review reminder campaign",     detail: "Review collection rate is 12% below target. A simple SMS/WhatsApp prompt sent 2 hours after visit could increase review volume and provide better signal on emerging issues.", impact: "Est. +30% reviews" },
  ] as OutletPriorityActionItem[],
  outletMapData: [
    { id: "o1",  name: "Jakarta Flagship",     region: "DKI Jakarta",    city: "Jakarta",    lat: -6.2088, lng: 106.8456, status: "critical", satisfaction: 2.6, reviews: 4820, issues: ["Long wait times", "Staff attitude", "Overcrowding"] },
    { id: "o2",  name: "Jakarta Selatan",      region: "DKI Jakarta",    city: "Jakarta",    lat: -6.2615, lng: 106.8106, status: "warning",  satisfaction: 3.2, reviews: 2140, issues: ["Parking difficulty", "Limited seating"] },
    { id: "o3",  name: "Bogor Sudirman",       region: "West Java",      city: "Bogor",      lat: -6.5971, lng: 106.8060, status: "good",     satisfaction: 4.1, reviews: 1380, issues: [] },
    { id: "o4",  name: "Bandung Dago",         region: "West Java",      city: "Bandung",    lat: -6.8783, lng: 107.6100, status: "good",     satisfaction: 4.6, reviews: 3100, issues: [] },
    { id: "o5",  name: "Bandung Buah Batu",    region: "West Java",      city: "Bandung",    lat: -6.9520, lng: 107.6450, status: "warning",  satisfaction: 3.4, reviews: 980,  issues: ["Product availability", "Wait times"] },
    { id: "o6",  name: "Surabaya East",        region: "East Java",      city: "Surabaya",   lat: -7.2504, lng: 112.7688, status: "warning",  satisfaction: 3.1, reviews: 2620, issues: ["Stock-outs", "Inconsistent quality"] },
    { id: "o7",  name: "Surabaya North",       region: "East Java",      city: "Surabaya",   lat: -7.2021, lng: 112.7363, status: "good",     satisfaction: 3.9, reviews: 1450, issues: [] },
    { id: "o8",  name: "Malang Kota",          region: "East Java",      city: "Malang",     lat: -7.9797, lng: 112.6304, status: "good",     satisfaction: 4.2, reviews: 870,  issues: [] },
    { id: "o9",  name: "Medan Central",        region: "North Sumatra",  city: "Medan",      lat: 3.5952,  lng: 98.6722,  status: "critical", satisfaction: 2.4, reviews: 3340, issues: ["Overpricing", "Cleanliness", "Poor service"] },
    { id: "o10", name: "Medan Helvetia",       region: "North Sumatra",  city: "Medan",      lat: 3.6185,  lng: 98.6318,  status: "warning",  satisfaction: 3.0, reviews: 920,  issues: ["Limited menu", "Parking"] },
    { id: "o11", name: "Palembang Ilir",       region: "South Sumatra",  city: "Palembang",  lat: -2.9761, lng: 104.7754, status: "good",     satisfaction: 4.0, reviews: 760,  issues: [] },
    { id: "o12", name: "Makassar Panakkukang", region: "South Sulawesi", city: "Makassar",   lat: -5.1477, lng: 119.4327, status: "warning",  satisfaction: 3.3, reviews: 1140, issues: ["Delivery delays", "Temperature issues"] },
    { id: "o13", name: "Makassar Tanjung",     region: "South Sulawesi", city: "Makassar",   lat: -5.1356, lng: 119.4066, status: "good",     satisfaction: 3.8, reviews: 680,  issues: [] },
    { id: "o14", name: "Semarang Simpang",     region: "Central Java",   city: "Semarang",   lat: -6.9932, lng: 110.4203, status: "good",     satisfaction: 4.1, reviews: 1020, issues: [] },
    { id: "o15", name: "Yogyakarta Malioboro", region: "DIY",            city: "Yogyakarta", lat: -7.7956, lng: 110.3695, status: "good",     satisfaction: 4.4, reviews: 2200, issues: [] },
    { id: "o16", name: "Denpasar Kuta",        region: "Bali",           city: "Denpasar",   lat: -8.7190, lng: 115.1700, status: "good",     satisfaction: 4.3, reviews: 2840, issues: [] },
    { id: "o17", name: "Denpasar Sanur",       region: "Bali",           city: "Denpasar",   lat: -8.7034, lng: 115.2607, status: "warning",  satisfaction: 3.5, reviews: 1120, issues: ["Tourist pricing complaints"] },
    { id: "o18", name: "Balikpapan Centre",    region: "East Kalimantan",city: "Balikpapan", lat: -1.2675, lng: 116.8289, status: "critical", satisfaction: 2.8, reviews: 1460, issues: ["Staff shortage", "Supply chain delays"] },
  ] as OutletMapDataItem[],
  outletSentimentOverall: { positive: 62, neutral: 22, negative: 16 },
  outletSentimentByOutlet: [
    { id: "osbo1",  name: "Bandung Dago",           positive: 84, neutral: 12, negative: 4  },
    { id: "osbo2",  name: "Yogyakarta Malioboro",   positive: 80, neutral: 13, negative: 7  },
    { id: "osbo3",  name: "Denpasar Kuta",          positive: 77, neutral: 14, negative: 9  },
    { id: "osbo4",  name: "Malang Kota",            positive: 74, neutral: 16, negative: 10 },
    { id: "osbo5",  name: "Semarang Simpang",       positive: 70, neutral: 17, negative: 13 },
    { id: "osbo6",  name: "Surabaya North",         positive: 65, neutral: 20, negative: 15 },
    { id: "osbo7",  name: "Jakarta Selatan",        positive: 55, neutral: 22, negative: 23 },
    { id: "osbo8",  name: "Surabaya East",          positive: 48, neutral: 24, negative: 28 },
    { id: "osbo9",  name: "Balikpapan Centre",      positive: 38, neutral: 20, negative: 42 },
    { id: "osbo10", name: "Medan Central",          positive: 29, neutral: 15, negative: 56 },
    { id: "osbo11", name: "Jakarta Flagship",       positive: 26, neutral: 18, negative: 56 },
  ] as OutletSentimentByOutletItem[],
  outletTopics: [
    { id: "ot1",  topic: "Service Speed",        mentions: 8420, positive: 44, negative: 42 },
    { id: "ot2",  topic: "Product Quality",      mentions: 7680, positive: 75, negative: 12 },
    { id: "ot3",  topic: "Cleanliness",          mentions: 5940, positive: 68, negative: 21 },
    { id: "ot4",  topic: "Staff Friendliness",   mentions: 5120, positive: 72, negative: 16 },
    { id: "ot5",  topic: "Pricing & Value",      mentions: 4880, positive: 38, negative: 48 },
    { id: "ot6",  topic: "Product Availability", mentions: 3760, positive: 51, negative: 35 },
    { id: "ot7",  topic: "Ambiance",             mentions: 3240, positive: 80, negative: 8  },
    { id: "ot8",  topic: "Parking",              mentions: 2980, positive: 31, negative: 54 },
    { id: "ot9",  topic: "Queue Management",     mentions: 2640, positive: 29, negative: 58 },
    { id: "ot10", topic: "Promotions & Deals",   mentions: 2100, positive: 84, negative: 6  },
  ] as OutletTopicItem[],
  outletRecentReviews: [
    { id: "orr1", outlet: "Jakarta Flagship",     sentiment: "negative", text: "Waited 40 minutes just for a drink. Staff seem overwhelmed and understaffed. Not coming back.", stars: 1 },
    { id: "orr2", outlet: "Bandung Dago",         sentiment: "positive", text: "The best experience! Staff are warm, the atmosphere is cozy and the products taste amazing. 10/10.", stars: 5 },
    { id: "orr3", outlet: "Medan Central",        sentiment: "negative", text: "Prices are way too high compared to other locations. The facility was not clean and service was dismissive.", stars: 2 },
    { id: "orr4", outlet: "Yogyakarta Malioboro", sentiment: "positive", text: "Perfect spot right by Malioboro. Always consistent, quick service, and the staff remembered my order!", stars: 5 },
    { id: "orr5", outlet: "Surabaya East",        sentiment: "neutral",  text: "Average experience. They were out of 3 menu items on a Saturday afternoon. Staff were polite though.", stars: 3 },
    { id: "orr6", outlet: "Balikpapan Centre",    sentiment: "negative", text: "Took nearly an hour to serve us. Multiple tables left without ordering. Management needs to step in.", stars: 1 },
  ] as OutletRecentReviewItem[],
};

const LEGACY_STORAGE_KEY = "naradai_dashboard_content";

export function loadDashboardContent(instanceId: string = "default"): DashboardContentStore {
  try {
    const key = getStorageKey(instanceId);
    let raw = localStorage.getItem(key);
    if (!raw && instanceId === "bukalapak") {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    }
    if (!raw) {
      const initial = getInitialDashboardContentForInstance(instanceId, defaultDashboardContent);
      if (initial) return initial;
      return defaultDashboardContent;
    }
    const parsed = JSON.parse(raw) as DashboardContentStore;
    const initial = getInitialDashboardContentForInstance(instanceId, defaultDashboardContent);
    const isKapalApiWithWrongSavedDefault =
      instanceId === "kapal_api_12_19_feb_2026" &&
      parsed?.statsOverview?.[0]?.value === "847.2K";
    if (isKapalApiWithWrongSavedDefault && initial) {
      localStorage.removeItem(key);
      return initial;
    }
    const parsedActions = parsed.priorityActions ?? defaultDashboardContent.priorityActions;
    const initialActions = initial?.priorityActions;
    const priorityActions =
      Array.isArray(initialActions) && initialActions.length > 0 && Array.isArray(parsedActions)
        ? parsedActions.map((pa) => {
            const fromInitial = initialActions.find((ia) => ia.id === pa.id);
            if (!fromInitial) return pa;
            return {
              ...pa,
              sourceUsername: pa.sourceUsername ?? fromInitial.sourceUsername,
              sourceContent: pa.sourceContent ?? fromInitial.sourceContent,
              metrics: { ...fromInitial.metrics, ...pa.metrics },
            };
          })
        : parsedActions;

    // Special handling untuk Share of Platform:
    // - Untuk instance bukalapak, kita ingin pakai struktur baru [mention, "xx%"] dari initial-data.
    // - Data lama yang tersimpan di localStorage masih memakai angka mentah (bukan array), sehingga tooltip jadi tidak sesuai.
    const parsedShareOfPlatform = parsed.whatsHappeningShareOfPlatform;
    const initialShareOfPlatform = initial?.whatsHappeningShareOfPlatform;
    const isLegacyBukalapakShareOfPlatform =
      instanceId === "bukalapak" &&
      Array.isArray(parsedShareOfPlatform) &&
      parsedShareOfPlatform.length > 0 &&
      typeof (parsedShareOfPlatform[0] as any)?.twitter === "number" &&
      !Array.isArray((parsedShareOfPlatform[0] as any)?.twitter);

    const whatsHappeningShareOfPlatform =
      (!isLegacyBukalapakShareOfPlatform &&
      Array.isArray(parsedShareOfPlatform) &&
      parsedShareOfPlatform.length > 0
        ? parsedShareOfPlatform
        : initialShareOfPlatform) ?? defaultDashboardContent.whatsHappeningShareOfPlatform;

    return {
      featureVisibility: parsed.featureVisibility ?? defaultDashboardContent.featureVisibility,
      statsOverview: parsed.statsOverview ?? defaultDashboardContent.statsOverview,
      priorityActions,
      outletSatisfaction: parsed.outletSatisfaction ?? defaultDashboardContent.outletSatisfaction,
      risks: parsed.risks ?? defaultDashboardContent.risks,
      opportunities: parsed.opportunities ?? defaultDashboardContent.opportunities,
      competitiveIssues: parsed.competitiveIssues ?? defaultDashboardContent.competitiveIssues,
      competitiveKeyInsights: parsed.competitiveKeyInsights ?? defaultDashboardContent.competitiveKeyInsights,
      whatsHappeningSentimentTrends: parsed.whatsHappeningSentimentTrends ?? defaultDashboardContent.whatsHappeningSentimentTrends,
      whatsHappeningKeyEvents: parsed.whatsHappeningKeyEvents ?? defaultDashboardContent.whatsHappeningKeyEvents,
      whatsHappeningTopTopics: parsed.whatsHappeningTopTopics ?? defaultDashboardContent.whatsHappeningTopTopics,
      whatsHappeningAITopicAnalysis: parsed.whatsHappeningAITopicAnalysis ?? defaultDashboardContent.whatsHappeningAITopicAnalysis,
      whatsHappeningTopicTrendsData:
        (Array.isArray(parsed.whatsHappeningTopicTrendsData) && parsed.whatsHappeningTopicTrendsData.length > 0
          ? parsed.whatsHappeningTopicTrendsData
          : initial?.whatsHappeningTopicTrendsData) ?? defaultDashboardContent.whatsHappeningTopicTrendsData,
      whatsHappeningAITrendAnalysis: parsed.whatsHappeningAITrendAnalysis ?? defaultDashboardContent.whatsHappeningAITrendAnalysis,
      whatsHappeningWordCloud: parsed.whatsHappeningWordCloud ?? defaultDashboardContent.whatsHappeningWordCloud,
      whatsHappeningClusters: parsed.whatsHappeningClusters ?? defaultDashboardContent.whatsHappeningClusters,
      whatsHappeningHashtags: parsed.whatsHappeningHashtags ?? defaultDashboardContent.whatsHappeningHashtags,
      whatsHappeningAccounts: parsed.whatsHappeningAccounts ?? defaultDashboardContent.whatsHappeningAccounts,
      whatsHappeningContents: parsed.whatsHappeningContents ?? defaultDashboardContent.whatsHappeningContents,
      whatsHappeningKOLMatrix: parsed.whatsHappeningKOLMatrix ?? defaultDashboardContent.whatsHappeningKOLMatrix,
      whatsHappeningAIKOLAnalysis: parsed.whatsHappeningAIKOLAnalysis ?? defaultDashboardContent.whatsHappeningAIKOLAnalysis,
      whatsHappeningShareOfPlatform,
      competitiveMatrixItems: (() => {
        const cached = parsed.competitiveMatrixItems;
        const fromInitial = initial?.competitiveMatrixItems;
        const def = defaultDashboardContent.competitiveMatrixItems;
        if (!Array.isArray(cached) || cached.length === 0) return fromInitial ?? def;
        // Merge keywords & competitivePosition dari initial jika cache belum punya
        return cached.map((item) => {
          const match = fromInitial?.find((i) => i.name === item.name || i.id === item.id);
          return {
            ...item,
            keywords: (item.keywords && item.keywords.length > 0) ? item.keywords : (match?.keywords ?? []),
            competitivePosition: item.competitivePosition || match?.competitivePosition || "",
          };
        });
      })() ?? defaultDashboardContent.competitiveMatrixItems,
      competitiveQuadrantAnalysis:
        (Array.isArray(parsed.competitiveQuadrantAnalysis) && parsed.competitiveQuadrantAnalysis.length > 0
          ? parsed.competitiveQuadrantAnalysis
          : initial?.competitiveQuadrantAnalysis) ?? defaultDashboardContent.competitiveQuadrantAnalysis,
      competitiveSentimentScores:
        (Array.isArray(parsed.competitiveSentimentScores) && parsed.competitiveSentimentScores.length > 0
          ? parsed.competitiveSentimentScores
          : initial?.competitiveSentimentScores) ?? defaultDashboardContent.competitiveSentimentScores,
      competitiveVolumeOfMentions:
        (Array.isArray(parsed.competitiveVolumeOfMentions) && parsed.competitiveVolumeOfMentions.length > 0
          ? parsed.competitiveVolumeOfMentions
          : initial?.competitiveVolumeOfMentions) ?? defaultDashboardContent.competitiveVolumeOfMentions,
      competitiveShareOfVoice: parsed.competitiveShareOfVoice ?? defaultDashboardContent.competitiveShareOfVoice,
      competitiveBrandLabels: parsed.competitiveBrandLabels ?? initial?.competitiveBrandLabels ?? defaultDashboardContent.competitiveBrandLabels,
      rawSourceContents: (Array.isArray(parsed.rawSourceContents) && parsed.rawSourceContents.length > 0 ? parsed.rawSourceContents : initial?.rawSourceContents) ?? defaultDashboardContent.rawSourceContents,
      // Campaign Analysis
      campaignStats: (Array.isArray(parsed.campaignStats) && parsed.campaignStats.length > 0 ? parsed.campaignStats : initial?.campaignStats) ?? defaultDashboardContent.campaignStats,
      campaignPerformance: (Array.isArray(parsed.campaignPerformance) && parsed.campaignPerformance.length > 0 ? parsed.campaignPerformance : initial?.campaignPerformance) ?? defaultDashboardContent.campaignPerformance,
      campaignTrendData: (Array.isArray(parsed.campaignTrendData) && parsed.campaignTrendData.length > 0 ? parsed.campaignTrendData : initial?.campaignTrendData) ?? defaultDashboardContent.campaignTrendData,
      campaignTimeSeriesData: (Array.isArray(parsed.campaignTimeSeriesData) && parsed.campaignTimeSeriesData.length > 0 ? parsed.campaignTimeSeriesData : initial?.campaignTimeSeriesData) ?? defaultDashboardContent.campaignTimeSeriesData,
      campaignPostPublishEvents: (Array.isArray(parsed.campaignPostPublishEvents) && parsed.campaignPostPublishEvents.length > 0 ? parsed.campaignPostPublishEvents : initial?.campaignPostPublishEvents) ?? defaultDashboardContent.campaignPostPublishEvents,
      campaignKeyEvents: (Array.isArray(parsed.campaignKeyEvents) && parsed.campaignKeyEvents.length > 0 ? parsed.campaignKeyEvents : initial?.campaignKeyEvents) ?? defaultDashboardContent.campaignKeyEvents,
      campaignReplySentiment: parsed.campaignReplySentiment ?? initial?.campaignReplySentiment ?? defaultDashboardContent.campaignReplySentiment,
      campaignReplyTopics: (Array.isArray(parsed.campaignReplyTopics) && parsed.campaignReplyTopics.length > 0 ? parsed.campaignReplyTopics : initial?.campaignReplyTopics) ?? defaultDashboardContent.campaignReplyTopics,
      campaignContentTypes: (Array.isArray(parsed.campaignContentTypes) && parsed.campaignContentTypes.length > 0 ? parsed.campaignContentTypes : initial?.campaignContentTypes) ?? defaultDashboardContent.campaignContentTypes,
      campaignTopPosts: (Array.isArray(parsed.campaignTopPosts) && parsed.campaignTopPosts.length > 0 ? parsed.campaignTopPosts : initial?.campaignTopPosts) ?? defaultDashboardContent.campaignTopPosts,
      campaignChannels: (Array.isArray(parsed.campaignChannels) && parsed.campaignChannels.length > 0 ? parsed.campaignChannels : initial?.campaignChannels) ?? defaultDashboardContent.campaignChannels,
      campaignCompetitors: (Array.isArray(parsed.campaignCompetitors) && parsed.campaignCompetitors.length > 0 ? parsed.campaignCompetitors : initial?.campaignCompetitors) ?? defaultDashboardContent.campaignCompetitors,
      campaignRecommendations: (Array.isArray(parsed.campaignRecommendations) && parsed.campaignRecommendations.length > 0 ? parsed.campaignRecommendations : initial?.campaignRecommendations) ?? defaultDashboardContent.campaignRecommendations,
      // Outlet Analysis
      outletStats: (Array.isArray(parsed.outletStats) && parsed.outletStats.length > 0 ? parsed.outletStats : initial?.outletStats) ?? defaultDashboardContent.outletStats,
      outletPriorityActions: (Array.isArray(parsed.outletPriorityActions) && parsed.outletPriorityActions.length > 0 ? parsed.outletPriorityActions : initial?.outletPriorityActions) ?? defaultDashboardContent.outletPriorityActions,
      outletMapData: (Array.isArray(parsed.outletMapData) && parsed.outletMapData.length > 0 ? parsed.outletMapData : initial?.outletMapData) ?? defaultDashboardContent.outletMapData,
      outletSentimentOverall: parsed.outletSentimentOverall ?? initial?.outletSentimentOverall ?? defaultDashboardContent.outletSentimentOverall,
      outletSentimentByOutlet: (Array.isArray(parsed.outletSentimentByOutlet) && parsed.outletSentimentByOutlet.length > 0 ? parsed.outletSentimentByOutlet : initial?.outletSentimentByOutlet) ?? defaultDashboardContent.outletSentimentByOutlet,
      outletTopics: (Array.isArray(parsed.outletTopics) && parsed.outletTopics.length > 0 ? parsed.outletTopics : initial?.outletTopics) ?? defaultDashboardContent.outletTopics,
      outletRecentReviews: (Array.isArray(parsed.outletRecentReviews) && parsed.outletRecentReviews.length > 0 ? parsed.outletRecentReviews : initial?.outletRecentReviews) ?? defaultDashboardContent.outletRecentReviews,
    };
  } catch {
    return defaultDashboardContent;
  }
}

export function saveDashboardContent(data: DashboardContentStore, instanceId: string = "default"): void {
  localStorage.setItem(getStorageKey(instanceId), JSON.stringify(data));
}

export function deleteDashboardContent(instanceId: string): void {
  const key = getStorageKey(instanceId);
  localStorage.removeItem(key);
  console.log(`✅ Dashboard content deleted for instance: ${instanceId}`);
}

/** Hapus seluruh data semua instance dari localStorage. */
export function clearAllDashboardContent(): string[] {
  const removed: string[] = [];
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_KEY_PREFIX)) keysToRemove.push(k);
  }
  keysToRemove.forEach((k) => {
    localStorage.removeItem(k);
    removed.push(k);
  });
  return removed;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
