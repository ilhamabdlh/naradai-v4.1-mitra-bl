import type { DashboardContentStore, CompetitiveHeatmapRow, SourceContentPost } from "./dashboard-content-types";
import { bukalapakRawSourceContents } from "./bukalapak-raw-content";
import { defaultFeatureVisibility } from "./dashboard-content-types";

function toSourceContent(prefix: string, items: { content: string; platform: string; likes?: number; comments?: number; sentiment: number }[]): SourceContentPost[] {
  const norm = (p: string) => {
    const l = p.toLowerCase();
    if (l.includes("twitter") || l.includes("x")) return "twitter";
    if (l.includes("instagram")) return "instagram";
    if (l.includes("facebook")) return "facebook";
    if (l.includes("tiktok")) return "tiktok";
    return l.replace(/\s+/g, "_");
  };
  return items.map((item, i) => ({
    id: `${prefix}-${i + 1}`,
    platform: norm(item.platform),
    author: "",
    content: item.content,
    sentiment: item.sentiment,
    timestamp: "—",
    engagement: { likes: item.likes ?? 0, replies: item.comments ?? 0, retweets: 0 },
  }));
}

function toFullSentimentRow(row: Record<string, number | string>): CompetitiveHeatmapRow {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const scale = (x: number) => (x > 1 ? x / 100 : x);
  const out: CompetitiveHeatmapRow = { issue: String(row.issue ?? "") };
  for (const [k, v] of Object.entries(row)) {
    if (k === "issue") continue;
    out[k] = scale(n(v));
  }
  return out;
}

function toFullVolumeRow(row: Record<string, number | string>): CompetitiveHeatmapRow {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const out: CompetitiveHeatmapRow = { issue: String(row.issue ?? "") };
  for (const [k, v] of Object.entries(row)) {
    if (k === "issue") continue;
    out[k] = n(v);
  }
  return out;
}

function toSentiment(s: number): number {
  if (s >= -1 && s <= 1) return s;
  return s / 100;
}

function pickCriticalStrength(type: "quadrant", criticalIssues: string, competitiveStrengths: string): { critical: KeyInsightItem; strength: KeyInsightItem } {
  const criticalBullets = criticalIssues.split("\n").filter((l) => l.trim().startsWith("•"));
  const strengthBullets = competitiveStrengths.split("\n").filter((l) => l.trim().startsWith("•"));
  return {
    critical: { id: "ki1", type: "critical", title: "Critical Issues", description: criticalIssues.replace(/\n/g, " ").slice(0, 200), bullets: criticalBullets.length ? criticalBullets : [criticalIssues.slice(0, 150)] },
    strength: { id: "ki2", type: "strength", title: "Competitive Strengths", description: competitiveStrengths.replace(/\n/g, " ").slice(0, 200), bullets: strengthBullets.length ? strengthBullets : [competitiveStrengths.slice(0, 150)] },
  };
}

type KeyInsightItem = { id: string; type: "critical" | "strength"; title: string; description: string; bullets: string[] };

function buildBukalapakInitial(base: DashboardContentStore): DashboardContentStore {
  return {
  ...base,
  featureVisibility: {
    statsOverview: true,
    actionRecommendations: true,
    outletSatisfaction: false,
    risksOpportunities: true,
    competitiveAnalysis: true,
    recentInsights: true,
  },
  statsOverview: [
    { id: "1", label: "Average Sentiment", value: "58.1%", description: "Positive sentiment ratio based on 62 validated mentions", icon: "TrendingUp" },
    { id: "2", label: "Critical Issues", value: "18", description: "Mentions flagged as 'High Risk' (Scam, CS Support, Admin Fees)", icon: "AlertTriangle" },
    { id: "3", label: "Share of Voice", value: "32.8%", description: "Bukalapak SOV vs Order Kuota, Mitra Shopee, & Brilink", icon: "MessageSquare" },
    { id: "4", label: "Conversation Analyzed", value: "62", description: "Total validated Bukalapak mentions in current dataset", icon: "Users" },
  ],
  priorityActions: [
    {
      id: "1",
      priority: "critical",
      title: "Investigate and Resolve Hacked Mitra Accounts",
      description: "Users are reporting hacked Mitra Bukalapak accounts, indicating a security vulnerability or a successful scam attempt targeting their operations.",
      impact: "High",
      effort: "High",
      recommendation: "Deploy automated account security checks and enforce multi-factor authentication for unusual activities to protect merchant funds.",
      category: "Trust & Safety",
      quadrantColor: "red",
      relatedIssues: ["Account Hijacking", "Scam / Phishing"],
      metrics: { mentions: 6, sentiment: "Negative (47.5)", trend: "Critical" },
      sourceUsername: "Mitra Bukalapak",
      sourceContent: "Kok bisa akun Mitra Bukalapak kena bajak? Simak videonya yuk dan jangan lupa share ya❤️ #MitraBukalapak #TransaksiCepatAman #PINTER #aplikasipulsa #viral #hatihati #trending #fyp #fypシ゚viral #tips",
    },
    {
      id: "2",
      priority: "critical",
      title: "Re-engineer QRIS Settlement & Overhaul Admin Fees",
      description: "Agents are threatening churn due to high admin fees for top-ups and a critical friction in QRIS fund settlement that no longer goes directly to DANA without withdrawal fees.",
      impact: "High",
      effort: "Medium",
      recommendation: "Develop a 'Direct Settlement' integration layer for QRIS-to-DANA transactions to bypass withdrawal fees, and implement dynamic fee tiering for loyal agents.",
      category: "Revenue & Operations",
      quadrantColor: "red",
      relatedIssues: ["Admin Fee Frustration", "QRIS Settlement Friction"],
      metrics: { mentions: 8, sentiment: "Negative (15.0)", trend: "Increasing" },
      sourceUsername: "Imam Taukhit",
      sourceContent: "dulu bintang 5 karena : No admin fee!!! sekarang bintang 1 karena : ada biaya admin",
    },
    {
      id: "3",
      priority: "high",
      title: "Automate Reconciliation for Stuck PPOB Transactions",
      description: "Systemic failures in processing agent transactions (top-up, PPOB) are leaving funds stuck for days. Current CS Chatbot loops are failing to resolve these severe financial losses.",
      impact: "High",
      effort: "High",
      recommendation: "Implement a T+0 automated reconciliation cron job to auto-trigger refunds for 'Stuck' transactions and immediately route 'Money Not Received' tickets to Tier-2 Human Agents.",
      category: "Customer Experience",
      quadrantColor: "orange",
      relatedIssues: ["CS Support Failure", "Pending Transactions"],
      metrics: { mentions: 2, sentiment: "Negative (5.0)", trend: "Stable" },
      sourceUsername: "Renny Erl R",
      sourceContent: "Penanganan problem lama. berbelit2. seolah team IT dan channel managementnya tidak kompeten menangani problem system di lapangan. Case: 1. Top up saldo saya (yg notabene utk jual PPOB) sampe 3hr belum juga masuk. Sudah f/u sana sini. 2. Pulsa data customer yg statusnya berhasil, blm masuk sampe sekarang. Juga berbelit2, sampe saya kembaliin uang customer, pdhl saldo saya sudah kepotong. 3. Pembayaran customer menggunakan QRIS, status sukses tp ternyata tdk ada satupun yg msk ke saldo saya",
    },
  ],
  outletSatisfaction: [],
  risks: [
    {
      id: "1",
      title: "User Churn Due to Excessive Admin Fees on Top-Ups",
      description: "Users, including long-term Mitras, are churning because the service fee for topping up the Mitra balance is perceived as excessive compared to when there was no fee.",
      severity: "High",
      probability: 75,
      impact: "Market Retention",
      trend: "Increasing",
      supportingContents: 1,
      indicators: [{ label: "Fee Sentiment", value: 15.0, change: -12 }],
      mitigation: ["Review and adjust fee structures for high-volume agents to match competitor pricing or re-introduce fee waivers."],
      sourceContent: [{ id: "r1", platform: "", author: "Dieggy A", content: "sebagai user lama saya berhenti menggunakan aplikasi ini sejak ada biaya layanan pada pengisian saldo mitra yang menurut saya berlebihan. mungkin akan kembali jika sudah tidak ada biaya tersebut.", sentiment: -0.5, timestamp: "—" }],
    },
    {
      id: "2",
      title: "Ineffective CS Support for Systemic Transaction Failures",
      description: "Multiple transaction systems failed to process funds correctly, and the support process was ineffective in resolving the agent's financial losses.",
      severity: "Critical",
      probability: 68,
      impact: "Severe Agent Financial Loss",
      trend: "Stable",
      supportingContents: 1,
      indicators: [{ label: "CS Sentiment", value: 5.0, change: -40 }],
      mitigation: ["Implement immediate tier-2 escalation for transactions exceeding 24 hours pending and audit the QRIS settlement pipeline."],
      sourceContent: [{ id: "r2", platform: "", author: "Renny Erl R", content: "Penanganan problem lama. berbelit2. seolah team IT dan channel managementnya tidak kompeten menangani problem system di lapangan. Case: 1. Top up saldo saya (yg notabene utk jual PPOB) sampe 3hr belum juga masuk... 3. Pembayaran customer menggunakan QRIS, status sukses tp ternyata tdk ada satupun yg msk ke saldo saya", sentiment: -0.6, timestamp: "—" }],
    },
  ],
  opportunities: [
    {
      id: "1",
      title: "Leverage High-Performance Transaction Speed & Money Transfer",
      description: "The user is satisfied with the speed and security of the money transfer feature in the Mitra Bukalapak application, generating strong organic advocacy.",
      potential: "high",
      confidence: 88,
      timeframe: "Short Term",
      category: "Product Positioning",
      trend: "Trending",
      supportingContents: 1,
      metrics: { sentimentScore: 84.4, marketPotential: 0, reachGrowth: 0 },
      recommendations: ["Highlight 'Fast Transaction Speed' in upcoming marketing campaigns and encourage agents to use the #TransaksiCepatAman hashtag."],
      sourceContent: [{ id: "o1", platform: "twitter", author: "Master Cell 💳", content: "Transfer / kirim uang ke semua bank bisa bgt pakai aplikasi dari @Mitra Bukalapak dijamin #TransaksiCepatAman #MitraBukalapak", sentiment: 0.844, timestamp: "—" }],
    },
    {
      id: "2",
      title: "Promote Comprehensive Product Completeness (Mini ATM)",
      description: "The user expresses high satisfaction with the application and recommends it to others due to its comprehensive features for their business.",
      potential: "medium",
      confidence: 85,
      timeframe: "Long Term",
      category: "Market Expansion",
      trend: "Stable",
      supportingContents: 1,
      metrics: { sentimentScore: 84.0, marketPotential: 0, reachGrowth: 0 },
      recommendations: ["Target non-digital warungs by promoting the 'mini ATM' and complete agent payment features."],
      sourceContent: [{ id: "o2", platform: "tiktok", author: "OGI.JAYA", content: "Yuk segera download , Rugi banget sih kalo gak download aplikasi Mitra bukalapak 😍 @Mitra Bukalapak #mitrabukalapak #transaksicepataman #konterpulsa #miniatm #agenpembayaran", sentiment: 0.84, timestamp: "—" }],
    },
  ],
  competitiveIssues: [
    { id: "1", issue: "Severe Lag in Price Competitiveness (Admin Fees)", yourMentions: 8, competitorMedianMentions: 2.5, relativeMentions: 220, yourSentiment: 0.15, competitorMedianSentiment: 0.725, relativeSentiment: -79.3, category: "Pricing" },
    { id: "2", issue: "Dominance in Transaction Speed & Remittance", yourMentions: 14, competitorMedianMentions: 7, relativeMentions: 100, yourSentiment: 0.844, competitorMedianSentiment: 0.618, relativeSentiment: 36.5, category: "Performance" },
    { id: "3", issue: "Better Security Perception vs Competitor Baselines", yourMentions: 6, competitorMedianMentions: 9.5, relativeMentions: -36.8, yourSentiment: 0.475, competitorMedianSentiment: 0.244, relativeSentiment: 94.9, category: "Trust & Safety" },
  ],
  competitiveKeyInsights: [
    {
      id: "1",
      type: "insight",
      title: "Bukalapak vs PPOB Competitors Analysis",
      description: "Bukalapak (62 mentions) holds a strong Positive Ratio (58.1%) compared to Order_Kuota (52.3%) and Mitra_Shopee (30.9%), but has 18 critical high-risk mentions.",
      bullets: [
        "Bukalapak excels in Transaction Speed (84.4 average sentiment) and Product Completeness.",
        "Order_Kuota maintains the highest absolute volume (65 mentions) but Bukalapak has a higher overall positive ratio.",
        "Critical churn risks for Bukalapak are heavily driven by newly introduced admin fees and systemic CS support failures.",
      ],
    },
  ],
  whatsHappeningSentimentTrends: [
    { date: "Dec 20", positive: 5, negative: 2, neutral: 0 }, { date: "Dec 21", positive: 0, negative: 0, neutral: 1 }, { date: "Dec 22", positive: 0, negative: 0, neutral: 0 }, { date: "Dec 23", positive: 0, negative: 0, neutral: 0 }, { date: "Dec 24", positive: 0, negative: 0, neutral: 0 },
    { date: "Dec 25", positive: 3, negative: 3, neutral: 0 }, { date: "Dec 26", positive: 4, negative: 0, neutral: 0 }, { date: "Dec 27", positive: 0, negative: 2, neutral: 0 }, { date: "Dec 28", positive: 2, negative: 0, neutral: 0 }, { date: "Dec 29", positive: 1, negative: 1, neutral: 0 },
    { date: "Dec 30", positive: 0, negative: 0, neutral: 0 }, { date: "Dec 31", positive: 2, negative: 0, neutral: 0 }, { date: "Jan 01", positive: 0, negative: 0, neutral: 0 }, { date: "Jan 02", positive: 0, negative: 0, neutral: 0 }, { date: "Jan 03", positive: 0, negative: 0, neutral: 0 },
    { date: "Jan 04", positive: 0, negative: 2, neutral: 0 }, { date: "Jan 05", positive: 0, negative: 0, neutral: 0 }, { date: "Jan 06", positive: 2, negative: 0, neutral: 0 }, { date: "Jan 07", positive: 0, negative: 3, neutral: 0 }, { date: "Jan 08", positive: 3, negative: 1, neutral: 0 }, { date: "Jan 09", positive: 1, negative: 0, neutral: 0 },
    { date: "Jan 10", positive: 0, negative: 0, neutral: 0 }, { date: "Jan 11", positive: 0, negative: 0, neutral: 0 }, { date: "Jan 12", positive: 0, negative: 1, neutral: 0 }, { date: "Jan 13", positive: 3, negative: 2, neutral: 0 }, { date: "Jan 14", positive: 2, negative: 2, neutral: 0 },
    { date: "Jan 15", positive: 5, negative: 4, neutral: 0 }, { date: "Jan 16", positive: 1, negative: 0, neutral: 0 }, { date: "Jan 17", positive: 2, negative: 0, neutral: 0 }, { date: "Jan 18", positive: 0, negative: 0, neutral: 0 }, { date: "Jan 19", positive: 0, negative: 1, neutral: 1 },
  ],
  whatsHappeningKeyEvents: [
    { id: "1", date: "Jan 15", title: "Friction & Feedback Peak", description: "High engagement day observing multiple issues from account hijacking to positive feedback on transaction speeds." },
  ],
  whatsHappeningTopTopics: [
    { topic: "General Product Completeness (Other)", mentions: 21, sentiment: 0.84 },
    { topic: "Transaction Speed", mentions: 14, sentiment: 0.844 },
    { topic: "Admin & Service Fees", mentions: 8, sentiment: 0.15 },
    { topic: "Scam / Phishing", mentions: 6, sentiment: 0.475 },
    { topic: "CS Support", mentions: 2, sentiment: 0.05 },
  ],
  whatsHappeningAITopicAnalysis: [
    {
      id: "1",
      type: "trend",
      title: "Fee Frustration Dominating Negative Sentiment",
      description: "AI flagged that the introduction of top-up admin fees has directly triggered churn threats among formerly loyal agents.",
    },
  ],
  whatsHappeningTopicTrendsData: [
    { date: "Dec 20", Other: 3, "Transaction Speed": 2, "Admin Fee": 0, Scam: 1, "CS Support": 0, Promo: 1, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Dec 21", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 1, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Dec 22", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Dec 23", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Dec 24", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Dec 25", Other: 3, "Transaction Speed": 2, "Admin Fee": 1, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Dec 26", Other: 4, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Dec 27", Other: 0, "Transaction Speed": 0, "Admin Fee": 2, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Dec 28", Other: 2, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Dec 29", Other: 0, "Transaction Speed": 1, "Admin Fee": 0, Scam: 1, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Dec 30", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Dec 31", Other: 0, "Transaction Speed": 2, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 01", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 02", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 03", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 04", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 2, "App Crash": 0 },
    { date: "Jan 05", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 06", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 2, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 07", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 2, "Feature Request": 1, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 08", Other: 1, "Transaction Speed": 2, "Admin Fee": 1, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 09", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 1, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 10", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 11", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 12", Other: 1, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 13", Other: 1, "Transaction Speed": 2, "Admin Fee": 2, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 14", Other: 2, "Transaction Speed": 0, "Admin Fee": 2, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 15", Other: 2, "Transaction Speed": 3, "Admin Fee": 0, Scam: 0, "CS Support": 2, Promo: 0, "Feature Request": 2, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 16", Other: 1, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 17", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 2 },
    { date: "Jan 18", Other: 0, "Transaction Speed": 0, "Admin Fee": 0, Scam: 0, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
    { date: "Jan 19", Other: 1, "Transaction Speed": 0, "Admin Fee": 0, Scam: 1, "CS Support": 0, Promo: 0, "Feature Request": 0, "Login Issue": 0, "App Crash": 0 },
  ],
  whatsHappeningAITrendAnalysis: [
    {
      id: "1",
      type: "observation",
      title: "Operational vs Financial Dissatisfaction",
      description: "While operational speed ('mudah lancar') drives positivity, financial discrepancies (QRIS not settling, high fees) are creating critical bottlenecks.",
    },
  ],
  whatsHappeningWordCloud: [
    { text: "mitra", weight: 26, sentiment: "positive" },
    { text: "bukalapak", weight: 24, sentiment: "positive" },
    { text: "aplikasi", weight: 16, sentiment: "positive" },
    { text: "transaksicepataman", weight: 11, sentiment: "positive" },
    { text: "mudah", weight: 10, sentiment: "positive" },
    { text: "bajak", weight: 6, sentiment: "negative" },
  ],
  whatsHappeningClusters: [
    { id: "1", theme: "Operational Reliability & Speed", size: 35, sentiment: 0.84, trend: "stable", keywords: ["cepat", "mudah", "lancar", "transaksicepataman"] },
    { id: "2", theme: "Cost & Service Failures", size: 18, sentiment: -0.45, trend: "upward", keywords: ["admin", "biaya", "berbelit", "bajak"] },
  ],
  whatsHappeningHashtags: [
    { id: "1", tag: "#MitraBukalapak", conversations: 13, likes: 320, comments: 45 },
    { id: "2", tag: "#TransaksiCepatAman", conversations: 4, likes: 110, comments: 12 },
    { id: "3", tag: "#IklanJadul", conversations: 2, likes: 74, comments: 12 },
  ],
  whatsHappeningAccounts: [
    { id: "1", name: "Mitra Bukalapak", handle: "@MitraBukalapak", platform: "tiktok", followers: 458900, conversations: 3, likes: 84, replies: 14 },
    { id: "2", name: "Iklan Televisi Indonesia", handle: "@iklantv_id", platform: "tiktok", followers: 2379, conversations: 1, likes: 74, replies: 12 },
    { id: "3", name: "FEBRI CELL", handle: "@febricell", platform: "tiktok", followers: 5830, conversations: 1, likes: 48, replies: 0 },
  ],
  whatsHappeningContents: [
    { id: "1", title: "Kok bisa akun Mitra Bukalapak kena bajak? Simak videonya yuk...", platform: "tiktok", author: "Mitra Bukalapak", likes: 14, comments: 5 },
    { id: "2", title: "E-COMMERCE AGEN BUKALAPAK, TAHU BULATS (2017) Bukalapak pernah membuka layanan...", platform: "tiktok", author: "Iklan Televisi Indonesia", likes: 74, comments: 12 },
    { id: "3", title: "Sedia mitra bukalapak untuk lakuin berbagai transaksi☝🏻 #mitrabukalapak #transaksicepataman", platform: "tiktok", author: "FEBRI CELL", likes: 48, comments: 0 },
    { id: "4", title: "Yuk pake mitra bukalapak juga biar kontermu makin lengkap🥰 #usahakonterpaketdata", platform: "tiktok", author: "BAKOEL PAKETAN", likes: 39, comments: 4 },
  ],
  whatsHappeningKOLMatrix: [
    { id: "1", name: "Mitra Bukalapak", followers: 458900, positivity: 90, engagement: 85, color: "#E5001C", category: "Official" },
    { id: "2", name: "Micro-Agent Community", followers: 15000, positivity: 58, engagement: 70, color: "#f59e0b", category: "Organic" },
  ],
  whatsHappeningAIKOLAnalysis: [
    {
      id: "1",
      type: "insight",
      title: "Official Account Dominance",
      description: "Most high-engagement contents are strictly driven by the official @MitraBukalapak handle, focusing heavily on utility, feature education, and security awareness.",
    },
    {
      id: "2",
      type: "insight",
      title: "Grassroots Micro-Agent Advocacy",
      description: "Authentic counter owners such as @febricell (FEBRI CELL) and BAKOEL PAKETAN function as highly effective micro-KOLs. Their peer-to-peer endorsements regarding product completeness strongly resonate with grassroots merchants.",
    },
  ],
  whatsHappeningShareOfPlatform: [
    { date: "Dec 20", twitter: [2, "29%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [1, "14%"], googleplay: [3, "43%"], appstore: [1, "14%"] },
    { date: "Dec 21", twitter: [1, "100%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
    { date: "Dec 22", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
    { date: "Dec 23", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
    { date: "Dec 24", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
    { date: "Dec 25", twitter: [2, "33%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [3, "50%"], appstore: [1, "17%"] },
    { date: "Dec 26", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [3, "75%"], appstore: [1, "25%"] },
    { date: "Dec 27", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [1, "50%"], appstore: [1, "50%"] },
    { date: "Dec 28", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [1, "50%"], appstore: [1, "50%"] },
    { date: "Dec 29", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [2, "100%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
    { date: "Dec 30", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
    { date: "Dec 31", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [1, "50%"], appstore: [1, "50%"] },
    { date: "Jan 01", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
    { date: "Jan 02", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
    { date: "Jan 03", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
    { date: "Jan 04", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [1, "50%"], appstore: [1, "50%"] },
    { date: "Jan 05", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
    { date: "Jan 06", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [1, "50%"], appstore: [1, "50%"] },
    { date: "Jan 07", twitter: [1, "33%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [1, "33%"], appstore: [1, "33%"] },
    { date: "Jan 08", twitter: [1, "25%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [1, "25%"], googleplay: [1, "25%"], appstore: [1, "25%"] },
    { date: "Jan 09", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [1, "100%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
    { date: "Jan 10", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
    { date: "Jan 11", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
    { date: "Jan 12", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [1, "100%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
    { date: "Jan 13", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [1, "20%"], googleplay: [3, "60%"], appstore: [1, "20%"] },
    { date: "Jan 14", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [3, "75%"], appstore: [1, "25%"] },
    { date: "Jan 15", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [3, "33%"], googleplay: [4, "44%"], appstore: [2, "22%"] },
    { date: "Jan 16", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [1, "100%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
    { date: "Jan 17", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [1, "50%"], appstore: [1, "50%"] },
    { date: "Jan 18", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [0, "0%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
    { date: "Jan 19", twitter: [0, "0%"], instagram: [0, "0%"], facebook: [0, "0%"], tiktok: [2, "100%"], googleplay: [0, "0%"], appstore: [0, "0%"] },
  ],
  competitiveMatrixItems: [
    { id: "1", name: "Bukalapak", mentions: 62, positivePercentage: 58.1, size: 62, color: "#E5001C" },
    { id: "2", name: "Order_Kuota", mentions: 65, positivePercentage: 52.3, size: 65, color: "#0000FF" },
    { id: "3", name: "Mitra_Shopee", mentions: 55, positivePercentage: 30.9, size: 55, color: "#FF4500" },
    { id: "4", name: "Brilink", mentions: 7, positivePercentage: 28.6, size: 7, color: "#00529C" },
  ],
  competitiveQuadrantAnalysis: [
    { id: "1", label: "Market Leaders", brands: "Order_Kuota, Bukalapak", note: "High Volume, Established Trust" },
    { id: "2", label: "Main Contenders", brands: "Mitra_Shopee", note: "Strong Ecosystem Integration" },
    { id: "3", label: "Established Traditional", brands: "Brilink", note: "High physical presence, low digital chatter" },
  ],
  competitiveSentimentScores: [
    { issue: "Transaction Speed", Bukalapak: 84, Order_Kuota: 91, Mitra_Shopee: 32, Brilink: 0 },
    { issue: "Admin Fees", Bukalapak: 15, Order_Kuota: 95, Mitra_Shopee: 50, Brilink: 0 },
    { issue: "Security / Scam", Bukalapak: 48, Order_Kuota: 46, Mitra_Shopee: 3, Brilink: 0 },
    { issue: "Promo & Pricing", Bukalapak: 68, Order_Kuota: 60, Mitra_Shopee: 83, Brilink: 60 },
    { issue: "CS Support", Bukalapak: 5, Order_Kuota: 96, Mitra_Shopee: 42, Brilink: 0 },
    { issue: "Feature Request", Bukalapak: 32, Order_Kuota: 0, Mitra_Shopee: 54, Brilink: 25 },
    { issue: "Login Issues", Bukalapak: 5, Order_Kuota: 0, Mitra_Shopee: 15, Brilink: 0 },
    { issue: "App Reliability", Bukalapak: 98, Order_Kuota: 0, Mitra_Shopee: 0, Brilink: 0 },
    { issue: "General Features", Bukalapak: 84, Order_Kuota: 67, Mitra_Shopee: 58, Brilink: 43 },
  ],
  competitiveVolumeOfMentions: [
    { issue: "Transaction Speed", Bukalapak: 14, Order_Kuota: 12, Mitra_Shopee: 2, Brilink: 0 },
    { issue: "Admin Fees", Bukalapak: 8, Order_Kuota: 1, Mitra_Shopee: 4, Brilink: 0 },
    { issue: "Security / Scam", Bukalapak: 6, Order_Kuota: 4, Mitra_Shopee: 15, Brilink: 0 },
    { issue: "Promo & Pricing", Bukalapak: 4, Order_Kuota: 30, Mitra_Shopee: 5, Brilink: 1 },
    { issue: "CS Support", Bukalapak: 2, Order_Kuota: 2, Mitra_Shopee: 2, Brilink: 0 },
    { issue: "Feature Request", Bukalapak: 3, Order_Kuota: 0, Mitra_Shopee: 9, Brilink: 1 },
    { issue: "Login Issues", Bukalapak: 2, Order_Kuota: 0, Mitra_Shopee: 1, Brilink: 0 },
    { issue: "App Reliability", Bukalapak: 2, Order_Kuota: 0, Mitra_Shopee: 0, Brilink: 0 },
    { issue: "General Features", Bukalapak: 21, Order_Kuota: 16, Mitra_Shopee: 17, Brilink: 5 },
  ],
  competitiveShareOfVoice: [
    { date: "Dec 20", yourBrand: 70, competitorA: 0, competitorB: 30, competitorC: 0, competitorD: 0 },
    { date: "Dec 21", yourBrand: 33, competitorA: 33, competitorB: 33, competitorC: 0, competitorD: 0 },
    { date: "Dec 22", yourBrand: 0, competitorA: 50, competitorB: 50, competitorC: 0, competitorD: 0 },
    { date: "Dec 23", yourBrand: 0, competitorA: 100, competitorB: 0, competitorC: 0, competitorD: 0 },
    { date: "Dec 24", yourBrand: 0, competitorA: 33, competitorB: 67, competitorC: 0, competitorD: 0 },
    { date: "Dec 25", yourBrand: 50, competitorA: 17, competitorB: 33, competitorC: 0, competitorD: 0 },
    { date: "Dec 26", yourBrand: 67, competitorA: 0, competitorB: 17, competitorC: 17, competitorD: 0 },
    { date: "Dec 27", yourBrand: 40, competitorA: 0, competitorB: 60, competitorC: 0, competitorD: 0 },
    { date: "Dec 28", yourBrand: 33, competitorA: 50, competitorB: 17, competitorC: 0, competitorD: 0 },
    { date: "Dec 29", yourBrand: 33, competitorA: 33, competitorB: 33, competitorC: 0, competitorD: 0 },
    { date: "Dec 30", yourBrand: 0, competitorA: 100, competitorB: 0, competitorC: 0, competitorD: 0 },
    { date: "Dec 31", yourBrand: 40, competitorA: 40, competitorB: 20, competitorC: 0, competitorD: 0 },
    { date: "Jan 01", yourBrand: 0, competitorA: 67, competitorB: 33, competitorC: 0, competitorD: 0 },
    { date: "Jan 02", yourBrand: 0, competitorA: 100, competitorB: 0, competitorC: 0, competitorD: 0 },
    { date: "Jan 03", yourBrand: 0, competitorA: 75, competitorB: 25, competitorC: 0, competitorD: 0 },
    { date: "Jan 04", yourBrand: 50, competitorA: 25, competitorB: 0, competitorC: 25, competitorD: 0 },
    { date: "Jan 05", yourBrand: 0, competitorA: 50, competitorB: 50, competitorC: 0, competitorD: 0 },
    { date: "Jan 06", yourBrand: 25, competitorA: 50, competitorB: 25, competitorC: 0, competitorD: 0 },
    { date: "Jan 07", yourBrand: 30, competitorA: 40, competitorB: 30, competitorC: 0, competitorD: 0 },
    { date: "Jan 08", yourBrand: 24, competitorA: 18, competitorB: 59, competitorC: 0, competitorD: 0 },
    { date: "Jan 09", yourBrand: 17, competitorA: 67, competitorB: 17, competitorC: 0, competitorD: 0 },
    { date: "Jan 10", yourBrand: 0, competitorA: 33, competitorB: 67, competitorC: 0, competitorD: 0 },
    { date: "Jan 11", yourBrand: 0, competitorA: 50, competitorB: 50, competitorC: 0, competitorD: 0 },
    { date: "Jan 12", yourBrand: 33, competitorA: 67, competitorB: 0, competitorC: 0, competitorD: 0 },
    { date: "Jan 13", yourBrand: 83, competitorA: 17, competitorB: 0, competitorC: 0, competitorD: 0 },
    { date: "Jan 14", yourBrand: 33, competitorA: 25, competitorB: 42, competitorC: 0, competitorD: 0 },
    { date: "Jan 15", yourBrand: 56, competitorA: 25, competitorB: 19, competitorC: 0, competitorD: 0 },
    { date: "Jan 16", yourBrand: 17, competitorA: 50, competitorB: 33, competitorC: 0, competitorD: 0 },
    { date: "Jan 17", yourBrand: 40, competitorA: 60, competitorB: 0, competitorC: 0, competitorD: 0 },
    { date: "Jan 18", yourBrand: 0, competitorA: 60, competitorB: 0, competitorC: 40, competitorD: 0 },
    { date: "Jan 19", yourBrand: 29, competitorA: 29, competitorB: 0, competitorC: 43, competitorD: 0 },
  ],
  competitiveBrandLabels: {
    yourBrand: "Bukalapak",
    competitorA: "Order_Kuota",
    competitorB: "Mitra_Shopee",
    competitorC: "Brilink",
    competitorD: "",
  },
  rawSourceContents: bukalapakRawSourceContents,
};
}

function toHeatmapSentimentRowKapalApi(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const scale = (x: number) => (x > 1 ? x / 100 : x);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: scale(n(r["Kapal Api"])),
    competitorA: scale(n(r["Nescafe"])),
    competitorB: scale(n(r["Kopi Luwak"])),
    competitorC: scale(n(r["Indocafe"])),
    competitorD: scale(n(r["Torabika"])),
  };
}

function toHeatmapVolumeRowKapalApi(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: n(r["Kapal Api"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"]),
    competitorC: n(r["Indocafe"]),
    competitorD: n(r["Torabika"]),
  };
}

function toShareOfVoiceRowKapalApi(row: Record<string, number | string>): { date: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    date: String(row.date ?? ""),
    yourBrand: n(r["Kapal Api"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"]),
    competitorC: n(r["Indocafe"]),
    competitorD: n(r["Torabika"]),
  };
}

function buildKapalApiInitial(base: DashboardContentStore): DashboardContentStore {
  return {
  ...base,
  featureVisibility: defaultFeatureVisibility,
  statsOverview: [
    { id: "1", label: "Average Sentiment", value: "26.6%", description: "Average sentiment score across conversations (Twitter, IG, TikTok)", icon: "TrendingUp" },
    { id: "2", label: "Critical Issues", value: "1", description: "Critical risks related to taste profile (bitter/changed)", icon: "AlertTriangle" },
    { id: "3", label: "Share of Voice", value: "20.1%", description: "Kapal Api SOV vs 16 External Competitors", icon: "MessageSquare" },
    { id: "4", label: "Conversation Analyzed", value: "357", description: "Total validated Kapal Api mentions across all platforms", icon: "Users" },
  ],
  priorityActions: [
    { id: "1", priority: "critical", title: "Address 'More Bitter Taste' Complaints on Mix Variants", description: "Organic comments identified on TikTok and Twitter suggesting a formula change, with users claiming the coffee tastes more bitter if not stirred extensively.", impact: "High", effort: "Low", recommendation: "Create educational content on proper brewing/stirring methods (#CaraAdukKapalApi) or proactively verify quality assurance on recent production batches.", category: "Product Quality", quadrantColor: "red", relatedIssues: ["Taste alteration", "Undissolved sugar"], metrics: { mentions: 12, sentiment: -1.0, trend: "Emerging" }, sourceContent: toSourceContent("kapal-api-pa1", [
      { content: "sekarang kapal api kalau GK di aduk kenapa pahit yah min beda sama kapal api yang dulu kalau di aduk manis", platform: "TikTok Comment", likes: 0, comments: 0, sentiment: -0.85 },
      { content: "Legend:\n\nKopi kapal api diseduh di gelas plastik yang diaduk pake bungkus kopinya yang dilipat.", platform: "Twitter", likes: 3, comments: 1, sentiment: 0.15 },
      { content: "aku selalu minum kopi kapal api item waktu pagi, kopinya 1 sendok makan gulanya 1 sendok teh.. terus kalo kopinya abis aku ganyang ampasnya. gapapa kan?", platform: "Twitter", likes: 0, comments: 0, sentiment: -0.10 },
    ]) },
  ],
  outletSatisfaction: [],
  risks: [
    { id: "1", title: "Perception of Overly Dark Coffee Color", description: "Younger demographics on TikTok are questioning the extreme dark color of the coffee and highlighting a lack of modern flavor variations compared to competitors.", severity: "Medium", probability: 20, impact: "Brand Image", trend: "Upward", supportingContents: 1, indicators: [{ label: "Variant Inquiries", value: 24, change: 12 }], mitigation: ["Intensify targeted promotions of Kapal Api Krim/Milk variants towards younger demographics."] },
  ],
  opportunities: [
    { id: "1", title: "Consumption Trend: Homemade Milk Coffee Hacks", description: "High traction observed on Twitter discussing homemade milk coffee recipes using Kapal Api grounds mixed with condensed milk or Milo as a cost-effective alternative to cafes.", potential: "High Engagement", confidence: 50, timeframe: "Short Term", category: "User Generated Content", trend: "Trending", supportingContents: 1, metrics: { sentimentScore: 90, marketPotential: 80, reachGrowth: 15 }, recommendations: ["Launch a mixology challenge or recipe video series for Kapal Api on X/Twitter."] },
  ],
  competitiveIssues: [
    { id: "1", issue: "Gastric Comfort (Dizziness/Nausea)", yourMentions: 5, competitorMedianMentions: 2, relativeMentions: 150, yourSentiment: -0.5, competitorMedianSentiment: 0.2, relativeSentiment: -70, category: "Health" },
  ],
  competitiveKeyInsights: [
    { id: "1", type: "strength", title: "Kapal Api vs Comprehensive Competitive Landscape", description: "Kapal Api maintains a massive lead in raw volume (357) among black coffee peers, but niche specialty brands like First Crack and Space Roastery are capturing hyper-specific conversations.", bullets: ["Nescafe (400) remains the overall volume leader due to aggressive IG promotions.", "Niche and specialty brands (FiberCreme, Kopken, First Crack) generate very low volume but enjoy exceptionally high positive sentiment (>50%).", "Local legends like Kopi Gadjah (70) and Kopi Liong Bulan (32) are carving out solid regional relevance."] },
  ],
  whatsHappeningSentimentTrends: [
    { date: "Feb 13", positive: 15, negative: 6, neutral: 30 },
    { date: "Feb 14", positive: 10, negative: 5, neutral: 25 },
    { date: "Feb 15", positive: 24, negative: 12, neutral: 40 },
    { date: "Feb 16", positive: 12, negative: 8, neutral: 35 },
    { date: "Feb 17", positive: 30, negative: 10, neutral: 45 },
    { date: "Feb 18", positive: 25, negative: 9, neutral: 50 },
    { date: "Feb 19", positive: 15, negative: 4, neutral: 20 },
  ],
  whatsHappeningKeyEvents: [
    { id: "1", date: "Feb 18", title: "Two Worlds Performance Campaign (TikTok & IG)", description: "Video features with Bilal Indrajaya (#CaffeinatedByKapalApi) contributed the highest influx of positive sentiment this week." },
  ],
  whatsHappeningTopTopics: [
    { topic: "Two Worlds Performance / Serenity", mentions: 68, sentiment: 0.9 },
    { topic: "Late-night Work Companion (Organic)", mentions: 120, sentiment: 0.5 },
    { topic: "Homemade Milk Coffee Recipes", mentions: 85, sentiment: 0.75 },
    { topic: "Taste Alteration (Bitter/Dizziness)", mentions: 15, sentiment: -0.8 },
  ],
  whatsHappeningAITopicAnalysis: [
    { id: "1", type: "insight", title: "Correlation Between Kapal Api & Tranquility", description: "A significant portion of the audience associates Kapal Api with 'serenity' (syahdu) and 'easing the world's burdens', particularly on TikTok." },
  ],
  whatsHappeningTopicTrendsData: [
    { date: "Feb 13", Taste: 8, Campaign: 20, DailyUsage: 28, Mixology: 5 },
    { date: "Feb 14", Taste: 12, Campaign: 19, DailyUsage: 39, Mixology: 13 },
    { date: "Feb 15", Taste: 14, Campaign: 22, DailyUsage: 40, Mixology: 17 },
    { date: "Feb 16", Taste: 6, Campaign: 28, DailyUsage: 33, Mixology: 8 },
    { date: "Feb 17", Taste: 9, Campaign: 15, DailyUsage: 22, Mixology: 11 },
    { date: "Feb 18", Taste: 15, Campaign: 30, DailyUsage: 45, Mixology: 19 },
    { date: "Feb 19", Taste: 10, Campaign: 12, DailyUsage: 20, Mixology: 6 },
  ],
  whatsHappeningAITrendAnalysis: [
    { id: "1", type: "insight", title: "Spike in Organic 'Mixology' on Twitter", description: "Twitter audiences are highly enthusiastic about mixing Kapal Api sachets with milk or Milo as a creative hack to replicate expensive cafe beverages." },
  ],
  whatsHappeningWordCloud: [
    { text: "kopi", weight: 250, sentiment: "neutral" },
    { text: "hitam", weight: 110, sentiment: "neutral" },
    { text: "enak", weight: 85, sentiment: "positive" },
    { text: "susu", weight: 70, sentiment: "positive" },
    { text: "pahit", weight: 45, sentiment: "negative" },
    { text: "begadang", weight: 60, sentiment: "neutral" },
    { text: "syahdu", weight: 35, sentiment: "positive" },
  ],
  whatsHappeningClusters: [
    { id: "1", theme: "Daily Routine (Twitter/TikTok)", size: 150, sentiment: 0.4, trend: "stable", keywords: ["minum", "dunia", "cangkir", "bangun", "kerja"] },
  ],
  whatsHappeningHashtags: [
    { id: "1", tag: "CaffeinatedByKapalApi", conversations: 45, likes: 320, comments: 85 },
  ],
  whatsHappeningAccounts: [
    { id: "1", name: "kapalapi_id", handle: "@kapalapi_id", platform: "tiktok", followers: 150000, conversations: 1, likes: 68, replies: 24 },
    { id: "2", name: "Ryannya", handle: "@Lagivaksin", platform: "twitter", followers: 260, conversations: 2, likes: 70, replies: 4 },
    { id: "3", name: "Hadi Badex", handle: "@hadibadex", platform: "twitter", followers: 7627, conversations: 2, likes: 68, replies: 12 },
    { id: "4", name: "Ailua", handle: "@Nemathelm", platform: "twitter", followers: 48, conversations: 1, likes: 13, replies: 3 },
  ],
  whatsHappeningContents: [
    { id: "1", title: "Caffeinated by Kapal Api bikin Pertunjukan Dua Dunia...", platform: "tiktok", author: "kapalapi_id", likes: 68, comments: 24 },
  ],
  whatsHappeningKOLMatrix: [
    { id: "1", name: "kapalapi_id", followers: 150000, positivity: 90, engagement: 100, color: "blue", category: "Official Brand" },
  ],
  whatsHappeningAIKOLAnalysis: [
    { id: "1", type: "insight", title: "Strength of Personal Accounts on Twitter", description: "Kapal Api conversations are not driven by Mega-Influencers, but rather by hundreds of regular personal accounts on Twitter organically sharing their daily routines." },
  ],
  whatsHappeningShareOfPlatform: [
    { date: "Feb 13", twitter: 52, youtube: 0, reddit: 0, instagram: 12, facebook: 0, tiktok: 28 },
    { date: "Feb 14", twitter: 68, youtube: 0, reddit: 0, instagram: 5, facebook: 0, tiktok: 22 },
    { date: "Feb 15", twitter: 55, youtube: 0, reddit: 0, instagram: 14, facebook: 0, tiktok: 31 },
    { date: "Feb 16", twitter: 61, youtube: 0, reddit: 0, instagram: 8, facebook: 0, tiktok: 18 },
    { date: "Feb 17", twitter: 50, youtube: 0, reddit: 0, instagram: 10, facebook: 0, tiktok: 35 },
    { date: "Feb 18", twitter: 65, youtube: 0, reddit: 0, instagram: 5, facebook: 0, tiktok: 30 },
    { date: "Feb 19", twitter: 59, youtube: 0, reddit: 0, instagram: 9, facebook: 0, tiktok: 24 },
  ],
  competitiveMatrixItems: [
    { id: "1", name: "Kapal Api", mentions: 357, positivePercentage: 26.6, size: 357, color: "#E5001C" },
    { id: "2", name: "Nescafe", mentions: 400, positivePercentage: 31.8, size: 400, color: "#FF0000" },
    { id: "3", name: "Kopi Luwak", mentions: 195, positivePercentage: 31.8, size: 195, color: "#8B4513" },
    { id: "4", name: "Indocafe", mentions: 146, positivePercentage: 34.2, size: 146, color: "#D2691E" },
    { id: "5", name: "Torabika", mentions: 144, positivePercentage: 42.4, size: 144, color: "#A0522D" },
    { id: "6", name: "Kopiko", mentions: 115, positivePercentage: 5.2, size: 115, color: "#4B3621" },
    { id: "7", name: "Caffino", mentions: 95, positivePercentage: 46.3, size: 95, color: "#8A2BE2" },
    { id: "8", name: "Kopi Gadjah", mentions: 70, positivePercentage: 17.1, size: 70, color: "#555555" },
    { id: "9", name: "TOP Coffee", mentions: 40, positivePercentage: 32.5, size: 40, color: "#FF8C00" },
    { id: "10", name: "Kopi Liong Bulan", mentions: 32, positivePercentage: 12.5, size: 32, color: "#C0C0C0" },
    { id: "11", name: "Golda Coffee", mentions: 18, positivePercentage: 11.1, size: 18, color: "#FFD700" },
    { id: "12", name: "Kopken RTD", mentions: 17, positivePercentage: 52.9, size: 17, color: "#FF1493" },
    { id: "13", name: "Space Roastery", mentions: 14, positivePercentage: 7.1, size: 14, color: "#000000" },
    { id: "14", name: "FiberCreme", mentions: 9, positivePercentage: 55.6, size: 9, color: "#ADD8E6" },
    { id: "15", name: "First Crack Coffee", mentions: 8, positivePercentage: 50.0, size: 8, color: "#A52A2A" },
    { id: "16", name: "Roemah Koffie", mentions: 8, positivePercentage: 12.5, size: 8, color: "#DEB887" },
    { id: "17", name: "Max Creamer", mentions: 3, positivePercentage: 0.0, size: 3, color: "#F5F5DC" },
  ],
  competitiveQuadrantAnalysis: [
    { id: "1", label: "Market Leaders", brands: "Nescafe, Kapal Api", note: "High Volume, Dominant Awareness" },
    { id: "2", label: "Strong Contenders", brands: "Kopi Luwak, Indocafe, Torabika, Kopiko, Caffino, Kopi Gadjah", note: "Moderate to High Volume" },
    { id: "3", label: "Niche & Specialty", brands: "Space Roastery, FiberCreme, First Crack Coffee, Roemah Koffie, Max Creamer", note: "Low Volume, Specific Audiences" },
  ],
  competitiveSentimentScores: [
    toFullSentimentRow({ issue: "Taste", "Kapal Api": 55, "Nescafe": 44, "Kopi Luwak": 37, "Indocafe": 30, "Torabika": 43, "Kopiko": 68, "Caffino": 69, "Kopi Gadjah": 46, "TOP Coffee": 76, "Kopi Liong Bulan": 59, "Golda Coffee": 70, "Kopken RTD": 59, "Space Roastery": 75, "FiberCreme": 67, "First Crack Coffee": 30, "Roemah Koffie": 38, "Max Creamer": 37 }),
    toFullSentimentRow({ issue: "Aroma", "Kapal Api": 83, "Nescafe": 56, "Kopi Luwak": 32, "Indocafe": 37, "Torabika": 83, "Kopiko": 77, "Caffino": 41, "Kopi Gadjah": 37, "TOP Coffee": 76, "Kopi Liong Bulan": 51, "Golda Coffee": 76, "Kopken RTD": 45, "Space Roastery": 53, "FiberCreme": 70, "First Crack Coffee": 43, "Roemah Koffie": 65, "Max Creamer": 30 }),
    toFullSentimentRow({ issue: "Price", "Kapal Api": 52, "Nescafe": 46, "Kopi Luwak": 64, "Indocafe": 63, "Torabika": 57, "Kopiko": 55, "Caffino": 63, "Kopi Gadjah": 84, "TOP Coffee": 31, "Kopi Liong Bulan": 75, "Golda Coffee": 49, "Kopken RTD": 76, "Space Roastery": 32, "FiberCreme": 59, "First Crack Coffee": 43, "Roemah Koffie": 83, "Max Creamer": 53 }),
  ],
  competitiveVolumeOfMentions: [
    toFullVolumeRow({ issue: "Daily Routine", "Kapal Api": 178, "Nescafe": 200, "Kopi Luwak": 97, "Indocafe": 73, "Torabika": 72, "Kopiko": 57, "Caffino": 47, "Kopi Gadjah": 35, "TOP Coffee": 20, "Kopi Liong Bulan": 16, "Golda Coffee": 9, "Kopken RTD": 8, "Space Roastery": 7, "FiberCreme": 4, "First Crack Coffee": 4, "Roemah Koffie": 4, "Max Creamer": 1 }),
    toFullVolumeRow({ issue: "Promo/Bundle", "Kapal Api": 107, "Nescafe": 120, "Kopi Luwak": 58, "Indocafe": 43, "Torabika": 43, "Kopiko": 34, "Caffino": 28, "Kopi Gadjah": 21, "TOP Coffee": 12, "Kopi Liong Bulan": 9, "Golda Coffee": 5, "Kopken RTD": 5, "Space Roastery": 4, "FiberCreme": 2, "First Crack Coffee": 2, "Roemah Koffie": 2, "Max Creamer": 0 }),
    toFullVolumeRow({ issue: "New Product", "Kapal Api": 71, "Nescafe": 80, "Kopi Luwak": 39, "Indocafe": 29, "Torabika": 28, "Kopiko": 23, "Caffino": 19, "Kopi Gadjah": 14, "TOP Coffee": 8, "Kopi Liong Bulan": 6, "Golda Coffee": 3, "Kopken RTD": 3, "Space Roastery": 2, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 }),
  ],
  competitiveShareOfVoice: [
    toShareOfVoiceRowKapalApi({ date: "Feb 13", "Kapal Api": 27, "Nescafe": 50, "Kopi Luwak": 20, "Indocafe": 22, "Torabika": 17, "Kopiko": 11, "Caffino": 9, "Kopi Gadjah": 5 }),
    toShareOfVoiceRowKapalApi({ date: "Feb 14", "Kapal Api": 77, "Nescafe": 85, "Kopi Luwak": 31, "Indocafe": 27, "Torabika": 46, "Kopiko": 8, "Caffino": 11, "Kopi Gadjah": 8 }),
    toShareOfVoiceRowKapalApi({ date: "Feb 15", "Kapal Api": 38, "Nescafe": 60, "Kopi Luwak": 51, "Indocafe": 42, "Torabika": 35, "Kopiko": 20, "Caffino": 6, "Kopi Gadjah": 7 }),
    toShareOfVoiceRowKapalApi({ date: "Feb 16", "Kapal Api": 21, "Nescafe": 65, "Kopi Luwak": 28, "Indocafe": 8, "Torabika": 17, "Kopiko": 17, "Caffino": 25, "Kopi Gadjah": 17 }),
    toShareOfVoiceRowKapalApi({ date: "Feb 17", "Kapal Api": 60, "Nescafe": 35, "Kopi Luwak": 25, "Indocafe": 20, "Torabika": 14, "Kopiko": 23, "Caffino": 16, "Kopi Gadjah": 18 }),
    toShareOfVoiceRowKapalApi({ date: "Feb 18", "Kapal Api": 60, "Nescafe": 35, "Kopi Luwak": 14, "Indocafe": 8, "Torabika": 11, "Kopiko": 17, "Caffino": 2, "Kopi Gadjah": 4 }),
    toShareOfVoiceRowKapalApi({ date: "Feb 19", "Kapal Api": 74, "Nescafe": 70, "Kopi Luwak": 26, "Indocafe": 19, "Torabika": 4, "Kopiko": 19, "Caffino": 26, "Kopi Gadjah": 11 }),
  ],
  competitiveBrandLabels: {
    yourBrand: "Kapal Api",
    competitorA: "Nescafe",
    competitorB: "Kopi Luwak",
    competitorC: "Indocafe",
    competitorD: "Torabika",
  },
};
}

function toHeatmapSentimentRow(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const scale = (x: number) => (x > 1 ? x / 100 : x);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: scale(n(r["Kopi Good Day"])),
    competitorA: scale(n(r["Nescafe"])),
    competitorB: scale(n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0)),
    competitorC: scale(n(r["Indocafe"] ?? r["Caffino"] ?? 0)),
    competitorD: scale(n(r["Torabika"] ?? r["Kopiko"] ?? 0)),
  };
}

function toHeatmapVolumeRow(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: n(r["Kopi Good Day"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toShareOfVoiceRow(row: Record<string, number | string>): { date: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    date: String(row.date ?? ""),
    yourBrand: n(r["Kopi Good Day"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toHeatmapSentimentRowAbc(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const scale = (x: number) => (x > 1 ? x / 100 : x);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: scale(n(r["Kopi ABC"])),
    competitorA: scale(n(r["Nescafe"])),
    competitorB: scale(n(r["Kopi Luwak"])),
    competitorC: scale(n(r["Indocafe"])),
    competitorD: scale(n(r["Torabika"])),
  };
}

function toHeatmapVolumeRowAbc(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: n(r["Kopi ABC"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toShareOfVoiceRowAbc(row: Record<string, number | string>): { date: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    date: String(row.date ?? ""),
    yourBrand: n(r["Kopi ABC"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toHeatmapSentimentRowFresco(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const scale = (x: number) => (x > 1 ? x / 100 : x);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: scale(n(r["Kopi Fresco"])),
    competitorA: scale(n(r["Nescafe"])),
    competitorB: scale(n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0)),
    competitorC: scale(n(r["Indocafe"] ?? r["Caffino"] ?? 0)),
    competitorD: scale(n(r["Torabika"] ?? r["Kopiko"] ?? 0)),
  };
}

function toHeatmapVolumeRowFresco(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: n(r["Kopi Fresco"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toShareOfVoiceRowFresco(row: Record<string, number | string>): { date: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    date: String(row.date ?? ""),
    yourBrand: n(r["Kopi Fresco"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toHeatmapSentimentRowExcelso(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const scale = (x: number) => (x > 1 ? x / 100 : x);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: scale(n(r["Excelso"])),
    competitorA: scale(n(r["Nescafe"])),
    competitorB: scale(n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0)),
    competitorC: scale(n(r["Indocafe"] ?? r["Caffino"] ?? 0)),
    competitorD: scale(n(r["Torabika"] ?? r["Kopiko"] ?? 0)),
  };
}

function toHeatmapVolumeRowExcelso(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: n(r["Excelso"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toShareOfVoiceRowExcelso(row: Record<string, number | string>): { date: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    date: String(row.date ?? ""),
    yourBrand: n(r["Excelso"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toHeatmapSentimentRowKapten(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const scale = (x: number) => (x > 1 ? x / 100 : x);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: scale(n(r["Kopi Kapten"])),
    competitorA: scale(n(r["Nescafe"])),
    competitorB: scale(n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0)),
    competitorC: scale(n(r["Indocafe"] ?? r["Caffino"] ?? 0)),
    competitorD: scale(n(r["Torabika"] ?? r["Kopiko"] ?? 0)),
  };
}

function toHeatmapVolumeRowKapten(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: n(r["Kopi Kapten"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toShareOfVoiceRowKapten(row: Record<string, number | string>): { date: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    date: String(row.date ?? ""),
    yourBrand: n(r["Kopi Kapten"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toHeatmapSentimentRowUnakaffe(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const scale = (x: number) => (x > 1 ? x / 100 : x);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: scale(n(r["Unakaffe"])),
    competitorA: scale(n(r["Nescafe"])),
    competitorB: scale(n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0)),
    competitorC: scale(n(r["Indocafe"] ?? r["Caffino"] ?? 0)),
    competitorD: scale(n(r["Torabika"] ?? r["Kopiko"] ?? 0)),
  };
}

function toHeatmapVolumeRowUnakaffe(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: n(r["Unakaffe"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toShareOfVoiceRowUnakaffe(row: Record<string, number | string>): { date: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    date: String(row.date ?? ""),
    yourBrand: n(r["Unakaffe"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toHeatmapSentimentRowPikopi(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const scale = (x: number) => (x > 1 ? x / 100 : x);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: scale(n(r["Kopi Pikopi"])),
    competitorA: scale(n(r["Nescafe"])),
    competitorB: scale(n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0)),
    competitorC: scale(n(r["Indocafe"] ?? r["Caffino"] ?? 0)),
    competitorD: scale(n(r["Torabika"] ?? r["Kopiko"] ?? 0)),
  };
}

function toHeatmapVolumeRowPikopi(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: n(r["Kopi Pikopi"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toShareOfVoiceRowPikopi(row: Record<string, number | string>): { date: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    date: String(row.date ?? ""),
    yourBrand: n(r["Kopi Pikopi"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toHeatmapSentimentRowYa(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const scale = (x: number) => (x > 1 ? x / 100 : x);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: scale(n(r["Kopi YA"])),
    competitorA: scale(n(r["Nescafe"])),
    competitorB: scale(n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0)),
    competitorC: scale(n(r["Indocafe"] ?? r["Caffino"] ?? 0)),
    competitorD: scale(n(r["Torabika"] ?? r["Kopiko"] ?? 0)),
  };
}

function toHeatmapVolumeRowYa(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: n(r["Kopi YA"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toShareOfVoiceRowYa(row: Record<string, number | string>): { date: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    date: String(row.date ?? ""),
    yourBrand: n(r["Kopi YA"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toHeatmapSentimentRowSja(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const scale = (x: number) => (x > 1 ? x / 100 : x);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: scale(n(r["PT Santos Jaya Abadi"])),
    competitorA: scale(n(r["Nescafe"])),
    competitorB: scale(n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0)),
    competitorC: scale(n(r["Indocafe"] ?? r["Caffino"] ?? 0)),
    competitorD: scale(n(r["Torabika"] ?? r["Kopiko"] ?? 0)),
  };
}

function toHeatmapVolumeRowSja(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: n(r["PT Santos Jaya Abadi"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toShareOfVoiceRowSja(row: Record<string, number | string>): { date: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    date: String(row.date ?? ""),
    yourBrand: n(r["PT Santos Jaya Abadi"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toHeatmapSentimentRowGdxBaemon(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const scale = (x: number) => (x > 1 ? x / 100 : x);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: scale(n(r["Good Day x BABYMONSTER"])),
    competitorA: scale(n(r["Nescafe"])),
    competitorB: scale(n(r["Torabika"] ?? r["Kopiko"] ?? 0)),
    competitorC: scale(n(r["Indocafe"] ?? r["Caffino"] ?? 0)),
    competitorD: scale(n(r["Kopiko"] ?? r["Caffino"] ?? 0)),
  };
}

function toHeatmapVolumeRowGdxBaemon(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: n(r["Good Day x BABYMONSTER"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Kopiko"] ?? r["Caffino"] ?? 0),
  };
}

function toShareOfVoiceRowGdxBaemon(row: Record<string, number | string>): { date: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    date: String(row.date ?? ""),
    yourBrand: n(r["Good Day x BABYMONSTER"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Kopiko"] ?? r["Caffino"] ?? 0),
  };
}

function toHeatmapSentimentRowKacc(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const scale = (x: number) => (x > 1 ? x / 100 : x);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: scale(n(r["Kapal Api Coffee Corner"])),
    competitorA: scale(n(r["Nescafe"])),
    competitorB: scale(n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0)),
    competitorC: scale(n(r["Indocafe"] ?? r["Caffino"] ?? 0)),
    competitorD: scale(n(r["Torabika"] ?? r["Kopiko"] ?? 0)),
  };
}

function toHeatmapVolumeRowKacc(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: n(r["Kapal Api Coffee Corner"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toShareOfVoiceRowKacc(row: Record<string, number | string>): { date: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    date: String(row.date ?? ""),
    yourBrand: n(r["Kapal Api Coffee Corner"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function toHeatmapSentimentRowKrimKafe(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const scale = (x: number) => (x > 1 ? x / 100 : x);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: scale(n(r["Krim Kafe"])),
    competitorA: scale(n(r["Nescafe"])),
    competitorB: scale(n(r["FiberCreme"] ?? r["Kopi Luwak"] ?? 0)),
    competitorC: scale(n(r["Max Creamer"] ?? r["Indocafe"] ?? 0)),
    competitorD: scale(n(r["Indocafe"] ?? r["Torabika"] ?? 0)),
  };
}

function toHeatmapVolumeRowKrimKafe(row: Record<string, number | string>): { issue: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    issue: String(row.issue ?? ""),
    yourBrand: n(r["Krim Kafe"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["FiberCreme"] ?? r["Kopi Luwak"] ?? 0),
    competitorC: n(r["Max Creamer"] ?? r["Indocafe"] ?? 0),
    competitorD: n(r["Indocafe"] ?? r["Torabika"] ?? 0),
  };
}

function toShareOfVoiceRowKrimKafe(row: Record<string, number | string>): { date: string; yourBrand: number; competitorA: number; competitorB: number; competitorC: number; competitorD: number } {
  const n = (v: number | string) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
  const r = row as Record<string, number | string>;
  return {
    date: String(row.date ?? ""),
    yourBrand: n(r["Krim Kafe"]),
    competitorA: n(r["Nescafe"]),
    competitorB: n(r["Kopi Luwak"] ?? r["Torabika"] ?? 0),
    competitorC: n(r["Indocafe"] ?? r["Caffino"] ?? 0),
    competitorD: n(r["Torabika"] ?? r["Kopiko"] ?? 0),
  };
}

function buildKopiGoodDayInitial(base: DashboardContentStore): DashboardContentStore {
  const sentimentRows = [
    { issue: "Flavor Variants", "Kopi Good Day": 88, "Nescafe": 56, "Kopi Luwak": 32, "Indocafe": 37, "Torabika": 83, "Kopiko": 68, "Caffino": 80, "Kopi Gadjah": 25, "TOP Coffee": 55, "Kopi Liong Bulan": 15, "Golda Coffee": 60, "Kopken RTD": 75, "Space Roastery": 45, "FiberCreme": 60, "First Crack Coffee": 30, "Roemah Koffie": 38, "Max Creamer": 37 },
    { issue: "Sweetness Balance", "Kopi Good Day": 60, "Nescafe": 50, "Kopi Luwak": 45, "Indocafe": 50, "Torabika": 65, "Kopiko": 55, "Caffino": 60, "Kopi Gadjah": 40, "TOP Coffee": 50, "Kopi Liong Bulan": 45, "Golda Coffee": 40, "Kopken RTD": 60, "Space Roastery": 80, "FiberCreme": 70, "First Crack Coffee": 75, "Roemah Koffie": 70, "Max Creamer": 60 },
    { issue: "Price & Value", "Kopi Good Day": 85, "Nescafe": 46, "Kopi Luwak": 64, "Indocafe": 63, "Torabika": 70, "Kopiko": 65, "Caffino": 65, "Kopi Gadjah": 84, "TOP Coffee": 80, "Kopi Liong Bulan": 75, "Golda Coffee": 70, "Kopken RTD": 45, "Space Roastery": 32, "FiberCreme": 59, "First Crack Coffee": 43, "Roemah Koffie": 50, "Max Creamer": 53 },
  ];
  const volumeRows = [
    { issue: "Cold Brew / Iced", "Kopi Good Day": 115, "Nescafe": 65, "Kopi Luwak": 20, "Indocafe": 5, "Torabika": 25, "Kopiko": 5, "Caffino": 40, "Kopi Gadjah": 2, "TOP Coffee": 5, "Kopi Liong Bulan": 0, "Golda Coffee": 8, "Kopken RTD": 12, "Space Roastery": 2, "FiberCreme": 1, "First Crack Coffee": 0, "Roemah Koffie": 0, "Max Creamer": 0 },
    { issue: "Tier List & Debates", "Kopi Good Day": 60, "Nescafe": 35, "Kopi Luwak": 55, "Indocafe": 45, "Torabika": 50, "Kopiko": 30, "Caffino": 25, "Kopi Gadjah": 30, "TOP Coffee": 10, "Kopi Liong Bulan": 5, "Golda Coffee": 2, "Kopken RTD": 0, "Space Roastery": 0, "FiberCreme": 0, "First Crack Coffee": 0, "Roemah Koffie": 0, "Max Creamer": 0 },
    { issue: "K-Pop/Collab Promo", "Kopi Good Day": 16, "Nescafe": 0, "Kopi Luwak": 0, "Indocafe": 0, "Torabika": 0, "Kopiko": 20, "Caffino": 0, "Kopi Gadjah": 0, "TOP Coffee": 0, "Kopi Liong Bulan": 0, "Golda Coffee": 0, "Kopken RTD": 0, "Space Roastery": 0, "FiberCreme": 0, "First Crack Coffee": 0, "Roemah Koffie": 0, "Max Creamer": 0 },
  ];
  const sovRows = [
    { date: "Feb 13", "Kopi Good Day": 15, "Nescafe": 66, "Kopi Luwak": 42, "Indocafe": 10, "Torabika": 4, "Kopiko": 23, "Caffino": 20, "Kopi Gadjah": 13, "TOP Coffee": 5, "Kopi Liong Bulan": 5, "Golda Coffee": 2, "Kopken RTD": 1, "Space Roastery": 0, "FiberCreme": 0, "First Crack Coffee": 1, "Roemah Koffie": 0, "Max Creamer": 0 },
    { date: "Feb 14", "Kopi Good Day": 30, "Nescafe": 33, "Kopi Luwak": 42, "Indocafe": 3, "Torabika": 26, "Kopiko": 19, "Caffino": 16, "Kopi Gadjah": 11, "TOP Coffee": 7, "Kopi Liong Bulan": 3, "Golda Coffee": 1, "Kopken RTD": 2, "Space Roastery": 1, "FiberCreme": 0, "First Crack Coffee": 0, "Roemah Koffie": 1, "Max Creamer": 0 },
    { date: "Feb 15", "Kopi Good Day": 15, "Nescafe": 22, "Kopi Luwak": 18, "Indocafe": 27, "Torabika": 26, "Kopiko": 15, "Caffino": 14, "Kopi Gadjah": 11, "TOP Coffee": 4, "Kopi Liong Bulan": 0, "Golda Coffee": 1, "Kopken RTD": 1, "Space Roastery": 2, "FiberCreme": 1, "First Crack Coffee": 0, "Roemah Koffie": 0, "Max Creamer": 0 },
    { date: "Feb 16", "Kopi Good Day": 76, "Nescafe": 100, "Kopi Luwak": 48, "Indocafe": 33, "Torabika": 21, "Kopiko": 11, "Caffino": 18, "Kopi Gadjah": 2, "TOP Coffee": 8, "Kopi Liong Bulan": 3, "Golda Coffee": 4, "Kopken RTD": 3, "Space Roastery": 2, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 2, "Max Creamer": 0 },
    { date: "Feb 17", "Kopi Good Day": 7, "Nescafe": 33, "Kopi Luwak": 6, "Indocafe": 13, "Torabika": 21, "Kopiko": 27, "Caffino": 2, "Kopi Gadjah": 14, "TOP Coffee": 6, "Kopi Liong Bulan": 5, "Golda Coffee": 4, "Kopken RTD": 3, "Space Roastery": 2, "FiberCreme": 1, "First Crack Coffee": 0, "Roemah Koffie": 0, "Max Creamer": 0 },
    { date: "Feb 18", "Kopi Good Day": 15, "Nescafe": 77, "Kopi Luwak": 30, "Indocafe": 23, "Torabika": 39, "Kopiko": 7, "Caffino": 8, "Kopi Gadjah": 8, "TOP Coffee": 5, "Kopi Liong Bulan": 6, "Golda Coffee": 3, "Kopken RTD": 2, "Space Roastery": 2, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 },
    { date: "Feb 19", "Kopi Good Day": 33, "Nescafe": 69, "Kopi Luwak": 9, "Indocafe": 37, "Torabika": 7, "Kopiko": 13, "Caffino": 17, "Kopi Gadjah": 11, "TOP Coffee": 5, "Kopi Liong Bulan": 10, "Golda Coffee": 3, "Kopken RTD": 5, "Space Roastery": 5, "FiberCreme": 5, "First Crack Coffee": 5, "Roemah Koffie": 4, "Max Creamer": 3 },
  ];
  return {
    ...base,
    featureVisibility: {
      statsOverview: true,
      actionRecommendations: true,
      outletSatisfaction: false,
      risksOpportunities: true,
      competitiveAnalysis: true,
      recentInsights: true,
    },
    statsOverview: [
      { id: "1", label: "Average Sentiment", value: "49.7%", description: "Average sentiment score (Driven by high praise for flavor variants)", icon: "TrendingUp" },
      { id: "2", label: "Critical Issues", value: "0", description: "No critical brand safety issues detected", icon: "AlertTriangle" },
      { id: "3", label: "Share of Voice", value: "12.7%", description: "Good Day SOV vs 16 External Competitors", icon: "MessageSquare" },
      { id: "4", label: "Conversation Analyzed", value: "191", description: "Total validated Good Day mentions across all platforms", icon: "Users" },
    ],
    priorityActions: [
      {
        id: "1",
        priority: "high",
        title: "Capitalize on the Viral 'Sachet Coffee Tier List' Trend",
        description: "A viral discussion on Twitter initiated by @ndiscoklat has users ranking their favorite sachet coffees. Good Day Freeze and Cappucino are frequently cited as top-tier choices for flavored/sweet coffee.",
        impact: "High",
        effort: "Low",
        recommendation: "Officially join the conversation on Twitter. Acknowledge the fans who ranked Good Day at the top tier and consider rewarding them with product bundles or merchandise.",
        category: "Brand Engagement",
        quadrantColor: "green",
        relatedIssues: ["Organic Endorsement", "Flavor Preferences"],
        metrics: { mentions: 104, sentiment: 0.8, trend: "Trending" },
        sourceContent: [
          {
            id: "sc1",
            platform: "twitter",
            author: "@ndiscoklat",
            content: "Kopi item: kapal api, gadjah. Kopi rasa2: abc kopsus, kapal api kopsus, good day freeze, torabika, fresco",
            sentiment: 0.8,
            timestamp: "2 days ago",
            engagement: { likes: 4500, replies: 320, retweets: 0 },
          },
        ],
      },
    ],
    outletSatisfaction: [],
    risks: [
      {
        id: "1",
        title: "Alienation of Strong Coffee Drinkers",
        description: "While highly praised by the youth and sweet-tooth demographic, a niche segment of coffee purists openly labels Good Day as 'too sweet' or 'lacking coffee kick'.",
        severity: "Low",
        probability: 50,
        impact: "Market Penetration",
        trend: "Stable",
        supportingContents: 1,
        indicators: [{ label: "Keywords 'Terlalu Manis'", value: 16, change: 0 }],
        mitigation: ["Maintain the current positioning. Trying to appease black coffee purists may dilute the core brand identity as the ultimate fun, flavored coffee."],
        sourceContent: [
          { id: "r1", platform: "twitter", author: "@user", content: "Good day enak tapi mehhhhh agak kureng gmna gitu buat gw", sentiment: -0.3, timestamp: "1 day ago" },
        ],
      },
    ],
    opportunities: [
      {
        id: "1",
        title: "Amplify the BABYMONSTER Campaign",
        description: "The 'Good Day x BABYMONSTER' collaboration is generating flawless positive sentiment among the K-Pop fandom, but organic volume is currently constrained (under 30 mentions).",
        potential: "High Viral Reach",
        confidence: 85,
        timeframe: "Short Term",
        category: "Partnership / Campaign",
        trend: "Emerging",
        supportingContents: 1,
        metrics: { sentimentScore: 100, marketPotential: 85, reachGrowth: 25 },
        recommendations: ["Deploy photocard trading events, merch giveaways, or dedicated TikTok challenges using the BABYMONSTER track to rapidly boost campaign share of voice."],
        sourceContent: [
          { id: "o1", platform: "twitter", author: "@fan", content: "Ahyeon ❤️🔥so cool 😎 #kopigoodday", sentiment: 1, timestamp: "1 day ago" },
        ],
      },
    ],
    competitiveIssues: [
      {
        id: "1",
        issue: "Flavor Innovation Leadership",
        yourMentions: 58,
        competitorMedianMentions: 12,
        relativeMentions: 380,
        yourSentiment: 0.8,
        competitorMedianSentiment: 0.4,
        relativeSentiment: 100,
        category: "Product",
      },
    ],
    competitiveKeyInsights: [
      {
        id: "1",
        type: "strength",
        title: "Good Day Dominates the 'Flavored' Segment",
        description: "While Nescafe (400) and Torabika (144) hold strong overall volumes, Good Day (191) is the undisputed king of the 'Flavored/Sweet Coffee' mental availability, specifically with Gen-Z.",
        bullets: [
          "Torabika Creamy Latte is Good Day's most direct competitor in Twitter taste-test comparisons.",
          "Caffino (95) has strong positive sentiment but lacks Good Day's deep cultural embedment in daily youth routines.",
          "The BABYMONSTER campaign provides Good Day a unique pop-culture edge that competitors currently lack.",
        ],
      },
    ],
    whatsHappeningSentimentTrends: [
      { date: "Feb 13", positive: 8, negative: 1, neutral: 6 },
      { date: "Feb 14", positive: 15, negative: 2, neutral: 13 },
      { date: "Feb 15", positive: 7, negative: 1, neutral: 7 },
      { date: "Feb 16", positive: 38, negative: 1, neutral: 37 },
      { date: "Feb 17", positive: 4, negative: 1, neutral: 2 },
      { date: "Feb 18", positive: 8, negative: 1, neutral: 6 },
      { date: "Feb 19", positive: 15, negative: 1, neutral: 17 },
    ],
    whatsHappeningKeyEvents: [
      {
        id: "1",
        date: "Feb 16",
        title: "The Great Coffee Tier List Debate",
        description: "A Twitter thread asking users to categorize their coffee consumption levels resulted in a massive influx of mentions for Good Day Freeze and Cappucino.",
      },
    ],
    whatsHappeningTopTopics: [
      { topic: "Coffee Tier List / Level Kopi", mentions: 104, sentiment: 0.6 },
      { topic: "Good Day Cappucino & Freeze", mentions: 48, sentiment: 0.85 },
      { topic: "BABYMONSTER Collaboration", mentions: 22, sentiment: 1 },
      { topic: "Too Sweet / Sugar Content", mentions: 17, sentiment: -0.4 },
    ],
    whatsHappeningAITopicAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Shift Towards 'Cold' Consumption",
        description: "Good Day is increasingly associated with cold brewing (Good Day Freeze) and iced consumption, aligning perfectly with Gen-Z climate and lifestyle preferences.",
      },
    ],
    whatsHappeningTopicTrendsData: [
      { date: "Feb 13", TierList: 2, Flavors: 8, Baemon: 3, Sugar: 2 },
      { date: "Feb 14", TierList: 5, Flavors: 15, Baemon: 7, Sugar: 3 },
      { date: "Feb 15", TierList: 4, Flavors: 6, Baemon: 2, Sugar: 3 },
      { date: "Feb 16", TierList: 60, Flavors: 10, Baemon: 3, Sugar: 3 },
      { date: "Feb 17", TierList: 3, Flavors: 2, Baemon: 1, Sugar: 1 },
      { date: "Feb 18", TierList: 10, Flavors: 3, Baemon: 1, Sugar: 1 },
      { date: "Feb 19", TierList: 20, Flavors: 4, Baemon: 5, Sugar: 4 },
    ],
    whatsHappeningAITrendAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Flavored Coffee as an Identity",
        description: "Users are utilizing their choice of sachet coffee (specifically Good Day) as a playful marker of their social class, age demographic, and lifestyle on Twitter.",
      },
    ],
    whatsHappeningWordCloud: [
      { text: "cappucino", weight: 85, sentiment: "positive" },
      { text: "enak", weight: 70, sentiment: "positive" },
      { text: "freeze", weight: 65, sentiment: "positive" },
      { text: "levelnya", weight: 55, sentiment: "neutral" },
      { text: "manis", weight: 40, sentiment: "negative" },
      { text: "babymonster", weight: 35, sentiment: "positive" },
      { text: "creamy", weight: 30, sentiment: "positive" },
    ],
    whatsHappeningClusters: [
      {
        id: "1",
        theme: "Flavored Coffee Debate (Twitter)",
        size: 120,
        sentiment: 0.6,
        trend: "up",
        keywords: ["cappucino", "freeze", "level", "torabika"],
      },
    ],
    whatsHappeningHashtags: [
      { id: "1", tag: "#KopiGoodDay", conversations: 8, likes: 64099, comments: 2237 },
      { id: "2", tag: "#GoodDayxBABYMONSTER", conversations: 3, likes: 63577, comments: 2181 },
      { id: "3", tag: "#HaveAGoodDayWithBABYMONSTER", conversations: 2, likes: 43602, comments: 1646 },
      { id: "4", tag: "#DiBikinHangatAja", conversations: 2, likes: 34100, comments: 2534 },
    ],
    whatsHappeningAccounts: [
      { id: "1", name: "Good Day Coffee", handle: "@gooddayid", platform: "instagram", followers: 285000, conversations: 5, likes: 63877, replies: 2194 },
      { id: "2", name: "Adam Faturahman", handle: "@Faturahman97", platform: "twitter", followers: 850, conversations: 1, likes: 120, replies: 4 },
      { id: "3", name: "Santos Jaya Abadi", handle: "@santosjayaabadi", platform: "instagram", followers: 15000, conversations: 1, likes: 138, replies: 34 },
    ],
    whatsHappeningContents: [
      { id: "1", title: "Good Day ❤️ BABYMONSTER in our zone! #KopiGoodDay yang punya banyak rasa sekar...", platform: "instagram", author: "gooddayid", likes: 26552, comments: 379 },
      { id: "2", title: "Memasuki WIB (Waktu Indonesia bagian BABYMONSTER)! ⏰❤️ Ngopi Good Day sekarang ...", platform: "instagram", author: "gooddayid", likes: 19975, comments: 535 },
      { id: "3", title: "Akhirnya bisa ngerasain hangat dengan cara yang lebih fun bareng BABYMONSTER dan...", platform: "instagram", author: "gooddayid", likes: 17050, comments: 1267 },
      { id: "4", title: "@ndiscoklat Kopi item: kapal api, gadjah. Kopi rasa2: abc kopsus, good day freeze...", platform: "twitter", author: "Faturahman97", likes: 120, comments: 4 },
      { id: "5", title: "🚨 HATI-HATI PENIPUAN 🚨 Berkedok giveaway berhadiah yang mengatasnamakan Kopi Go...", platform: "instagram", author: "santosjayaabadi", likes: 138, comments: 34 },
    ],
    whatsHappeningKOLMatrix: [
      {
        id: "1",
        name: "ndiscoklat",
        followers: 12000,
        positivity: 70,
        engagement: 100,
        color: "yellow",
        category: "Organic Trendsetter",
      },
    ],
    whatsHappeningAIKOLAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Community over KOLs",
        description: "Excluding the official BABYMONSTER assets, the highest engagement comes from organic, highly-relatable community queries rather than paid influencers.",
      },
    ],
    whatsHappeningShareOfPlatform: [
      { date: "Feb 13", twitter: 80, youtube: 0, reddit: 0, instagram: 5, facebook: 0, tiktok: 15 },
      { date: "Feb 14", twitter: 85, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 15 },
      { date: "Feb 15", twitter: 70, youtube: 0, reddit: 0, instagram: 10, facebook: 0, tiktok: 20 },
      { date: "Feb 16", twitter: 95, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 5 },
      { date: "Feb 17", twitter: 90, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 10 },
      { date: "Feb 18", twitter: 88, youtube: 0, reddit: 0, instagram: 2, facebook: 0, tiktok: 10 },
      { date: "Feb 19", twitter: 82, youtube: 0, reddit: 0, instagram: 5, facebook: 0, tiktok: 13 },
    ],
    competitiveMatrixItems: [
      { id: "1", name: "Kopi Good Day", mentions: 191, positivePercentage: 49.7, size: 191, color: "#0000FF" },
      { id: "2", name: "Nescafe", mentions: 400, positivePercentage: 31.8, size: 400, color: "#FF0000" },
      { id: "3", name: "Kopi Luwak", mentions: 195, positivePercentage: 31.8, size: 195, color: "#8B4513" },
      { id: "4", name: "Indocafe", mentions: 146, positivePercentage: 34.2, size: 146, color: "#D2691E" },
      { id: "5", name: "Torabika", mentions: 144, positivePercentage: 42.4, size: 144, color: "#A0522D" },
      { id: "6", name: "Kopiko", mentions: 115, positivePercentage: 5.2, size: 115, color: "#4B3621" },
      { id: "7", name: "Caffino", mentions: 95, positivePercentage: 46.3, size: 95, color: "#8A2BE2" },
      { id: "8", name: "Kopi Gadjah", mentions: 70, positivePercentage: 17.1, size: 70, color: "#555555" },
      { id: "9", name: "TOP Coffee", mentions: 40, positivePercentage: 32.5, size: 40, color: "#FF8C00" },
      { id: "10", name: "Kopi Liong Bulan", mentions: 32, positivePercentage: 12.5, size: 32, color: "#C0C0C0" },
      { id: "11", name: "Golda Coffee", mentions: 18, positivePercentage: 11.1, size: 18, color: "#FFD700" },
      { id: "12", name: "Kopken RTD", mentions: 17, positivePercentage: 52.9, size: 17, color: "#FF1493" },
      { id: "13", name: "Space Roastery", mentions: 14, positivePercentage: 7.1, size: 14, color: "#000000" },
      { id: "14", name: "FiberCreme", mentions: 9, positivePercentage: 55.6, size: 9, color: "#ADD8E6" },
      { id: "15", name: "First Crack Coffee", mentions: 8, positivePercentage: 50.0, size: 8, color: "#A52A2A" },
      { id: "16", name: "Roemah Koffie", mentions: 8, positivePercentage: 12.5, size: 8, color: "#DEB887" },
      { id: "17", name: "Max Creamer", mentions: 3, positivePercentage: 0.0, size: 3, color: "#F5F5DC" },
    ],
    competitiveQuadrantAnalysis: [
      { id: "1", label: "Market Leaders", brands: "Nescafe", note: "High Volume" },
      { id: "2", label: "Flavor & Lifestyle Kings", brands: "Kopi Good Day, Caffino, Torabika, Kopken RTD", note: "Moderate to High Volume, Extremely High Positive Sentiment" },
      { id: "3", label: "Traditional Competitors", brands: "Kopi Luwak, Indocafe, Kopi Gadjah", note: "Older demographic associations" },
    ],
    competitiveSentimentScores: sentimentRows.map((r) => toFullSentimentRow(r as Record<string, number | string>)),
    competitiveVolumeOfMentions: volumeRows.map((r) => toFullVolumeRow(r as Record<string, number | string>)),
    competitiveShareOfVoice: sovRows.map((r) => toShareOfVoiceRow(r as Record<string, number | string>)),
    competitiveBrandLabels: { yourBrand: "Kopi Good Day", competitorA: "Nescafe", competitorB: "Kopi Luwak", competitorC: "Indocafe", competitorD: "Torabika" },
  };
}

function buildKopiAbcInitial(base: DashboardContentStore): DashboardContentStore {
  const sentimentRows = [
    { issue: "Taste", "Kopi ABC": 65, "Nescafe": 44, "Kopi Luwak": 37, "Indocafe": 30, "Torabika": 43, "Kopiko": 68, "Caffino": 69, "Kopi Gadjah": 46, "TOP Coffee": 76, "Kopi Liong Bulan": 59, "Golda Coffee": 70, "Kopken RTD": 59, "Space Roastery": 75, "FiberCreme": 67, "First Crack Coffee": 30, "Roemah Koffie": 38, "Max Creamer": 37 },
    { issue: "Aroma", "Kopi ABC": 50, "Nescafe": 56, "Kopi Luwak": 32, "Indocafe": 37, "Torabika": 83, "Kopiko": 77, "Caffino": 41, "Kopi Gadjah": 37, "TOP Coffee": 76, "Kopi Liong Bulan": 51, "Golda Coffee": 76, "Kopken RTD": 45, "Space Roastery": 53, "FiberCreme": 70, "First Crack Coffee": 43, "Roemah Koffie": 65, "Max Creamer": 30 },
    { issue: "Price & Value", "Kopi ABC": 92, "Nescafe": 46, "Kopi Luwak": 64, "Indocafe": 63, "Torabika": 57, "Kopiko": 55, "Caffino": 63, "Kopi Gadjah": 84, "TOP Coffee": 31, "Kopi Liong Bulan": 75, "Golda Coffee": 49, "Kopken RTD": 76, "Space Roastery": 32, "FiberCreme": 59, "First Crack Coffee": 43, "Roemah Koffie": 83, "Max Creamer": 53 },
  ];
  const volumeRows = [
    { issue: "Warkop / Hangout", "Kopi ABC": 35, "Nescafe": 12, "Kopi Luwak": 5, "Indocafe": 15, "Torabika": 22, "Kopiko": 0, "Caffino": 0, "Kopi Gadjah": 12 },
    { issue: "Breakfast Routine", "Kopi ABC": 22, "Nescafe": 45, "Kopi Luwak": 30, "Indocafe": 20, "Torabika": 18, "Kopiko": 15, "Caffino": 10 },
    { issue: "Health/Digestion", "Kopi ABC": 14, "Nescafe": 5, "Kopi Luwak": 12, "Indocafe": 2, "Torabika": 0, "Kopiko": 8, "Caffino": 2 },
  ];
  const sovRows = [
    { date: "Feb 13", "Kopi ABC": 11, "Nescafe": 50, "Kopi Luwak": 20, "Indocafe": 22, "Torabika": 17, "Kopiko": 11, "Caffino": 9 },
    { date: "Feb 14", "Kopi ABC": 11, "Nescafe": 85, "Kopi Luwak": 31, "Indocafe": 27, "Torabika": 46, "Kopiko": 8, "Caffino": 11 },
    { date: "Feb 15", "Kopi ABC": 3, "Nescafe": 60, "Kopi Luwak": 51, "Indocafe": 42, "Torabika": 35, "Kopiko": 20, "Caffino": 6 },
    { date: "Feb 16", "Kopi ABC": 7, "Nescafe": 65, "Kopi Luwak": 28, "Indocafe": 8, "Torabika": 17, "Kopiko": 17, "Caffino": 25 },
    { date: "Feb 17", "Kopi ABC": 22, "Nescafe": 35, "Kopi Luwak": 25, "Indocafe": 20, "Torabika": 14, "Kopiko": 23, "Caffino": 16 },
    { date: "Feb 18", "Kopi ABC": 11, "Nescafe": 35, "Kopi Luwak": 14, "Indocafe": 8, "Torabika": 11, "Kopiko": 17, "Caffino": 2 },
    { date: "Feb 19", "Kopi ABC": 16, "Nescafe": 70, "Kopi Luwak": 26, "Indocafe": 19, "Torabika": 4, "Kopiko": 19, "Caffino": 26 },
  ];
  return {
    ...base,
    featureVisibility: {
      statsOverview: true,
      actionRecommendations: true,
      outletSatisfaction: false,
      risksOpportunities: true,
      competitiveAnalysis: true,
      recentInsights: true,
    },
    statsOverview: [
      { id: "1", label: "Average Sentiment", value: "27.2%", description: "Average sentiment score (Dominated by humor/neutral Twitter threads)", icon: "TrendingUp" },
      { id: "2", label: "Critical Issues", value: "1", description: "Health concerns raised regarding 'Gastric Acid' (Asam Lambung)", icon: "AlertTriangle" },
      { id: "3", label: "Share of Voice", value: "5.8%", description: "Kopi ABC SOV vs 16 External Competitors", icon: "MessageSquare" },
      { id: "4", label: "Conversation Analyzed", value: "81", description: "Total validated Kopi ABC mentions across all platforms", icon: "Users" },
    ],
    priorityActions: [
      {
        id: "1",
        priority: "critical",
        title: "Address the 'Extreme Breakfast' Viral Trend Responsibly",
        description: "A viral interaction involving corporate brand accounts on Twitter joked about having Kopi ABC and Yakult for breakfast, prompting organic users to express concern over gastric health.",
        impact: "High",
        effort: "Medium",
        recommendation: "Deploy a lighthearted yet educational social media response advocating for consuming Kopi ABC after meals to prevent acid reflux.",
        category: "Brand Image & Health",
        quadrantColor: "red",
        relatedIssues: ["Gastric Acid (Asam Lambung)", "Empty Stomach Consumption"],
        metrics: { mentions: 14, sentiment: -0.8, trend: "Spiking" },
        sourceContent: [
          {
            id: "sc1",
            platform: "twitter",
            author: "@user",
            content: "sarapannya kopi ABC tiap hari, apa ga asam lambung????",
            sentiment: -0.8,
            timestamp: "2 days ago",
            engagement: { likes: 56, replies: 12, retweets: 0 },
          },
        ],
      },
    ],
    outletSatisfaction: [],
    risks: [
      {
        id: "1",
        title: "Association with 'Poverty' Humor / Low Tier",
        description: "Kopi ABC is frequently used as a punchline to describe frugality or low-budget student life (e.g., cheap gift exchanges). While relatable, it may bottleneck premium brand perception.",
        severity: "Low",
        probability: 75,
        impact: "Brand Positioning",
        trend: "Stable",
        supportingContents: 1,
        indicators: [{ label: "Low-Budget Keywords", value: 12, change: 5 }],
        mitigation: ["Lean into the relatability aspect by creating 'survival kit' student campaigns, turning the joke into a supportive brand message."],
        sourceContent: [
          { id: "r1", platform: "twitter", author: "@user", content: "tuker kado max 20rb... gue cuma dapet 1 sachet saos kfc sama kopi abc 1 sachet", sentiment: 0.2, timestamp: "1 day ago" },
        ],
      },
    ],
    opportunities: [
      {
        id: "1",
        title: "Unrivaled Dominance in Grassroots 'Warkop' Culture",
        description: "Audiens explicitly declare their loyalty to Kopi ABC Susu when visiting traditional Warkops (street cafes), showing a highly defensible moat against modern RTDs in this specific channel.",
        potential: "High Sales Volume",
        confidence: 85,
        timeframe: "Long Term",
        category: "Channel Strategy",
        trend: "Consistent",
        supportingContents: 1,
        metrics: { sentimentScore: 85, marketPotential: 80, reachGrowth: 15 },
        recommendations: ["Strengthen B2B distribution and visibility at the Warkop tier to block Torabika and Indocafe."],
        sourceContent: [
          { id: "o1", platform: "twitter", author: "@user", content: "levelnya warkop aja kali ya soalnya cuma doyan kapal api mix sama kopi abc susu", sentiment: 0.85, timestamp: "1 day ago" },
        ],
      },
    ],
    competitiveIssues: [
      {
        id: "1",
        issue: "Gastric Health / Acidity Warnings",
        yourMentions: 14,
        competitorMedianMentions: 1,
        relativeMentions: 1300,
        yourSentiment: -0.6,
        competitorMedianSentiment: 0.1,
        relativeSentiment: -85,
        category: "Health",
      },
    ],
    competitiveKeyInsights: [
      {
        id: "1",
        type: "strength",
        title: "Kopi ABC Defending the Grassroots Tier",
        description: "While Nescafe (400) and Kopi Luwak (195) lead the overall raw volume through digital pushes, Kopi ABC (81) commands the most organic, slice-of-life cultural footprint on Twitter.",
        bullets: [
          "Kopi ABC is rarely discussed in the context of promotions, proving its mentions are 100% organic user behavior.",
          "Caffino (95) and Kopiko (115) are actively trying to breach the youth segment, but Kopi ABC's 'Warkop' association remains culturally stronger.",
          "Gastric issues temporarily spiked ABC's negative sentiment due to a viral joke, unlike Torabika which maintains a safer health perception.",
        ],
      },
    ],
    whatsHappeningSentimentTrends: [
      { date: "Feb 13", positive: 4, negative: 1, neutral: 6 },
      { date: "Feb 14", positive: 3, negative: 1, neutral: 7 },
      { date: "Feb 15", positive: 1, negative: 0, neutral: 2 },
      { date: "Feb 16", positive: 2, negative: 1, neutral: 4 },
      { date: "Feb 17", positive: 4, negative: 4, neutral: 14 },
      { date: "Feb 18", positive: 3, negative: 1, neutral: 7 },
      { date: "Feb 19", positive: 5, negative: 0, neutral: 11 },
    ],
    whatsHappeningKeyEvents: [
      {
        id: "1",
        date: "Feb 17",
        title: "The 'Extreme Breakfast' Twitter Phenomenon",
        description: "An inter-brand banter mentioning Kopi ABC and Yakult for breakfast went viral, triggering a wave of quotes about 'Asam Lambung' (Gastric Acid) and student survival humor.",
      },
    ],
    whatsHappeningTopTopics: [
      { topic: "Warkop & Kopsus (Milk Coffee)", mentions: 35, sentiment: 0.8 },
      { topic: "Breakfast Routines (Sarapan)", mentions: 22, sentiment: 0.1 },
      { topic: "Gastric Acid / Health Humour", mentions: 14, sentiment: -0.6 },
      { topic: "Frugality / Student Life", mentions: 10, sentiment: 0.3 },
    ],
    whatsHappeningAITopicAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Irony and Affection in Consumer Sentiments",
        description: "Consumers express a deep, ironic affection for Kopi ABC, positioning it as the ultimate unpretentious 'survival' beverage for the working class and students.",
      },
    ],
    whatsHappeningTopicTrendsData: [
      { date: "Feb 13", Warkop: 8, Breakfast: 2, Health: 0, Humor: 1 },
      { date: "Feb 14", Warkop: 7, Breakfast: 2, Health: 0, Humor: 2 },
      { date: "Feb 15", Warkop: 2, Breakfast: 0, Health: 0, Humor: 1 },
      { date: "Feb 16", Warkop: 4, Breakfast: 1, Health: 1, Humor: 1 },
      { date: "Feb 17", Warkop: 5, Breakfast: 10, Health: 8, Humor: 5 },
      { date: "Feb 18", Warkop: 6, Breakfast: 4, Health: 3, Humor: 2 },
      { date: "Feb 19", Warkop: 9, Breakfast: 3, Health: 2, Humor: 3 },
    ],
    whatsHappeningAITrendAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Unintentional Brand Activations",
        description: "Kopi ABC is benefiting from 'free' exposure generated by other brand accounts (like @toshibatv_id) utilizing the product name as a relatable punchline for the Indonesian public.",
      },
    ],
    whatsHappeningWordCloud: [
      { text: "sarapan", weight: 80, sentiment: "neutral" },
      { text: "warkop", weight: 75, sentiment: "positive" },
      { text: "lambung", weight: 45, sentiment: "negative" },
      { text: "yakult", weight: 40, sentiment: "neutral" },
      { text: "kopsus", weight: 35, sentiment: "positive" },
      { text: "asam", weight: 30, sentiment: "negative" },
      { text: "lucu", weight: 15, sentiment: "positive" },
    ],
    whatsHappeningClusters: [
      {
        id: "1",
        theme: "Student/Warkop Core (Twitter)",
        size: 45,
        sentiment: 0.6,
        trend: "stable",
        keywords: ["warkop", "susu", "kado", "doyan"],
      },
    ],
    whatsHappeningHashtags: [
      { id: "1", tag: "#KopiABCSusu", conversations: 5, likes: 40, comments: 8 },
    ],
    whatsHappeningAccounts: [
      { id: "1", name: "Toshiba TV Indonesia", handle: "@toshibatv_id", platform: "twitter", followers: 18285, conversations: 1, likes: 6628, replies: 249 },
      { id: "2", name: "shunda", handle: "@madebyshunda", platform: "twitter", followers: 12793, conversations: 4, likes: 736, replies: 12 },
      { id: "3", name: "ngomonginuang", handle: "@CalonIstriGenZ", platform: "twitter", followers: 1230, conversations: 1, likes: 85, replies: 0 },
    ],
    whatsHappeningContents: [
      { id: "1", title: "Siapa lelaki itu, Manda? Aku bukan tipe pembeli barang mahal tapi kalau Toshiba rilis...", platform: "twitter", author: "toshibatv_id", likes: 6628, comments: 249 },
      { id: "2", title: "@toshibatv_id sarapannya kopi ABC tiap hari, apa ga asam lambung????", platform: "twitter", author: "CalonIstriGenZ", likes: 85, comments: 0 },
      { id: "3", title: "Salma kue ultahnya ada Kopi ABC Klepon😭🫵💗 emang kita ni kembar beda nasib...", platform: "twitter", author: "madebyshunda", likes: 450, comments: 6 },
      { id: "4", title: "org cantik dan hebat selain gw dan salma yg suka Kopi ABC Ice Klepon siapa lagi ya?", platform: "twitter", author: "madebyshunda", likes: 102, comments: 4 },
    ],
    whatsHappeningKOLMatrix: [
      {
        id: "1",
        name: "toshibatv_id",
        followers: 25000,
        positivity: 50,
        engagement: 85,
        color: "yellow",
        category: "Corporate Banter",
      },
    ],
    whatsHappeningAIKOLAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Admin-to-Admin Interactions",
        description: "This week's visibility peak was driven entirely by banter between corporate social media admins on Twitter rather than traditional coffee influencers.",
      },
    ],
    whatsHappeningShareOfPlatform: [
      { date: "Feb 13", twitter: 85, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 15 },
      { date: "Feb 14", twitter: 90, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 10 },
      { date: "Feb 15", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 16", twitter: 85, youtube: 0, reddit: 0, instagram: 5, facebook: 0, tiktok: 10 },
      { date: "Feb 17", twitter: 95, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 5 },
      { date: "Feb 18", twitter: 80, youtube: 0, reddit: 0, instagram: 5, facebook: 0, tiktok: 15 },
      { date: "Feb 19", twitter: 88, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 12 },
    ],
    competitiveMatrixItems: [
      { id: "1", name: "Kopi ABC", mentions: 81, positivePercentage: 27.2, size: 81, color: "#0000FF" },
      { id: "2", name: "Nescafe", mentions: 400, positivePercentage: 31.8, size: 400, color: "#FF0000" },
      { id: "3", name: "Kopi Luwak", mentions: 195, positivePercentage: 31.8, size: 195, color: "#8B4513" },
      { id: "4", name: "Indocafe", mentions: 146, positivePercentage: 34.2, size: 146, color: "#D2691E" },
      { id: "5", name: "Torabika", mentions: 144, positivePercentage: 42.4, size: 144, color: "#A0522D" },
      { id: "6", name: "Kopiko", mentions: 115, positivePercentage: 5.2, size: 115, color: "#4B3621" },
      { id: "7", name: "Caffino", mentions: 95, positivePercentage: 46.3, size: 95, color: "#8A2BE2" },
      { id: "8", name: "Kopi Gadjah", mentions: 70, positivePercentage: 17.1, size: 70, color: "#555555" },
      { id: "9", name: "TOP Coffee", mentions: 40, positivePercentage: 32.5, size: 40, color: "#FF8C00" },
      { id: "10", name: "Kopi Liong Bulan", mentions: 32, positivePercentage: 12.5, size: 32, color: "#C0C0C0" },
      { id: "11", name: "Golda Coffee", mentions: 18, positivePercentage: 11.1, size: 18, color: "#FFD700" },
      { id: "12", name: "Kopken RTD", mentions: 17, positivePercentage: 52.9, size: 17, color: "#FF1493" },
      { id: "13", name: "Space Roastery", mentions: 14, positivePercentage: 7.1, size: 14, color: "#000000" },
      { id: "14", name: "FiberCreme", mentions: 9, positivePercentage: 55.6, size: 9, color: "#ADD8E6" },
      { id: "15", name: "First Crack Coffee", mentions: 8, positivePercentage: 50.0, size: 8, color: "#A52A2A" },
      { id: "16", name: "Roemah Koffie", mentions: 8, positivePercentage: 12.5, size: 8, color: "#DEB887" },
      { id: "17", name: "Max Creamer", mentions: 3, positivePercentage: 0.0, size: 3, color: "#F5F5DC" },
    ],
    competitiveQuadrantAnalysis: [
      { id: "1", label: "Market Leaders", brands: "Nescafe", note: "High Volume" },
      { id: "2", label: "Strong Contenders", brands: "Kopi Luwak, Indocafe, Torabika, Kopiko, Caffino", note: "Moderate to High Volume" },
      { id: "3", label: "Grassroots & Niche Heroes", brands: "Kopi ABC, Kopi Gadjah, Kopi Liong Bulan, Space Roastery, First Crack Coffee", note: "Cultural relevance outweighs raw volume" },
    ],
    competitiveSentimentScores: sentimentRows.map((r) => toFullSentimentRow(r as Record<string, number | string>)),
    competitiveVolumeOfMentions: volumeRows.map((r) => toFullVolumeRow(r as Record<string, number | string>)),
    competitiveShareOfVoice: sovRows.map((r) => toShareOfVoiceRowAbc(r as Record<string, number | string>)),
    competitiveBrandLabels: { yourBrand: "Kopi ABC", competitorA: "Nescafe", competitorB: "Kopi Luwak", competitorC: "Indocafe", competitorD: "Torabika" },
  };
}

function buildKopiFrescoInitial(base: DashboardContentStore): DashboardContentStore {
  const sentimentRows = [
    { issue: "DIY/Mixology Base", "Kopi Fresco": 88, "Nescafe": 56, "Kopi Luwak": 32, "Indocafe": 37, "Torabika": 45, "Kopiko": 20, "Caffino": 35, "Kopi Gadjah": 60, "TOP Coffee": 40, "Kopi Liong Bulan": 65, "Golda Coffee": 10, "Kopken RTD": 15, "Space Roastery": 85, "FiberCreme": 70, "First Crack Coffee": 80, "Roemah Koffie": 65, "Max Creamer": 85 },
    { issue: "Black Coffee Purity", "Kopi Fresco": 60, "Nescafe": 50, "Kopi Luwak": 45, "Indocafe": 50, "Torabika": 30, "Kopiko": 25, "Caffino": 20, "Kopi Gadjah": 75, "TOP Coffee": 50, "Kopi Liong Bulan": 80, "Golda Coffee": 10, "Kopken RTD": 40, "Space Roastery": 95, "FiberCreme": 10, "First Crack Coffee": 90, "Roemah Koffie": 85, "Max Creamer": 5 },
    { issue: "Price & Value", "Kopi Fresco": 85, "Nescafe": 46, "Kopi Luwak": 64, "Indocafe": 63, "Torabika": 70, "Kopiko": 65, "Caffino": 65, "Kopi Gadjah": 84, "TOP Coffee": 80, "Kopi Liong Bulan": 75, "Golda Coffee": 70, "Kopken RTD": 45, "Space Roastery": 32, "FiberCreme": 59, "First Crack Coffee": 43, "Roemah Koffie": 50, "Max Creamer": 53 },
  ];
  const volumeRows = [
    { issue: "Homemade Recipe", "Kopi Fresco": 12, "Nescafe": 35, "Kopi Luwak": 10, "Indocafe": 15, "Torabika": 5, "Kopiko": 2, "Caffino": 5, "Kopi Gadjah": 8, "TOP Coffee": 2, "Kopi Liong Bulan": 4, "Golda Coffee": 0, "Kopken RTD": 0, "Space Roastery": 2, "FiberCreme": 5, "First Crack Coffee": 1, "Roemah Koffie": 0, "Max Creamer": 2 },
    { issue: "Daily Quick Fix", "Kopi Fresco": 5, "Nescafe": 120, "Kopi Luwak": 85, "Indocafe": 75, "Torabika": 95, "Kopiko": 80, "Caffino": 70, "Kopi Gadjah": 50, "TOP Coffee": 30, "Kopi Liong Bulan": 25, "Golda Coffee": 15, "Kopken RTD": 15, "Space Roastery": 5, "FiberCreme": 2, "First Crack Coffee": 4, "Roemah Koffie": 5, "Max Creamer": 1 },
    { issue: "Quality Concerns", "Kopi Fresco": 2, "Nescafe": 15, "Kopi Luwak": 8, "Indocafe": 5, "Torabika": 12, "Kopiko": 18, "Caffino": 8, "Kopi Gadjah": 5, "TOP Coffee": 4, "Kopi Liong Bulan": 2, "Golda Coffee": 2, "Kopken RTD": 1, "Space Roastery": 0, "FiberCreme": 0, "First Crack Coffee": 0, "Roemah Koffie": 1, "Max Creamer": 0 },
  ];
  const sovRows = [
    { date: "Feb 13", "Kopi Fresco": 3, "Nescafe": 73, "Kopi Luwak": 37, "Indocafe": 18, "Torabika": 22, "Kopiko": 15, "Caffino": 16, "Kopi Gadjah": 14, "TOP Coffee": 6, "Kopi Liong Bulan": 6, "Golda Coffee": 2, "Kopken RTD": 3, "Space Roastery": 3, "FiberCreme": 1, "First Crack Coffee": 0, "Roemah Koffie": 1, "Max Creamer": 1 },
    { date: "Feb 14", "Kopi Fresco": 1, "Nescafe": 45, "Kopi Luwak": 20, "Indocafe": 15, "Torabika": 30, "Kopiko": 25, "Caffino": 12, "Kopi Gadjah": 8, "TOP Coffee": 4, "Kopi Liong Bulan": 5, "Golda Coffee": 4, "Kopken RTD": 2, "Space Roastery": 1, "FiberCreme": 2, "First Crack Coffee": 2, "Roemah Koffie": 0, "Max Creamer": 0 },
    { date: "Feb 15", "Kopi Fresco": 1, "Nescafe": 80, "Kopi Luwak": 45, "Indocafe": 25, "Torabika": 18, "Kopiko": 10, "Caffino": 18, "Kopi Gadjah": 10, "TOP Coffee": 8, "Kopi Liong Bulan": 4, "Golda Coffee": 1, "Kopken RTD": 4, "Space Roastery": 2, "FiberCreme": 0, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 },
    { date: "Feb 16", "Kopi Fresco": 7, "Nescafe": 60, "Kopi Luwak": 28, "Indocafe": 35, "Torabika": 20, "Kopiko": 22, "Caffino": 10, "Kopi Gadjah": 12, "TOP Coffee": 5, "Kopi Liong Bulan": 3, "Golda Coffee": 3, "Kopken RTD": 1, "Space Roastery": 2, "FiberCreme": 1, "First Crack Coffee": 0, "Roemah Koffie": 2, "Max Creamer": 1 },
    { date: "Feb 17", "Kopi Fresco": 1, "Nescafe": 55, "Kopi Luwak": 18, "Indocafe": 20, "Torabika": 25, "Kopiko": 18, "Caffino": 20, "Kopi Gadjah": 9, "TOP Coffee": 7, "Kopi Liong Bulan": 8, "Golda Coffee": 2, "Kopken RTD": 2, "Space Roastery": 1, "FiberCreme": 2, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 },
    { date: "Feb 18", "Kopi Fresco": 2, "Nescafe": 48, "Kopi Luwak": 25, "Indocafe": 12, "Torabika": 15, "Kopiko": 12, "Caffino": 9, "Kopi Gadjah": 8, "TOP Coffee": 5, "Kopi Liong Bulan": 2, "Golda Coffee": 4, "Kopken RTD": 3, "Space Roastery": 4, "FiberCreme": 1, "First Crack Coffee": 2, "Roemah Koffie": 2, "Max Creamer": 1 },
    { date: "Feb 19", "Kopi Fresco": 4, "Nescafe": 39, "Kopi Luwak": 22, "Indocafe": 21, "Torabika": 14, "Kopiko": 13, "Caffino": 10, "Kopi Gadjah": 9, "TOP Coffee": 5, "Kopi Liong Bulan": 4, "Golda Coffee": 2, "Kopken RTD": 2, "Space Roastery": 1, "FiberCreme": 2, "First Crack Coffee": 2, "Roemah Koffie": 1, "Max Creamer": 0 },
  ];
  return {
    ...base,
    featureVisibility: {
      statsOverview: true,
      actionRecommendations: true,
      outletSatisfaction: false,
      risksOpportunities: true,
      competitiveAnalysis: true,
      recentInsights: true,
    },
    statsOverview: [
      { id: "1", label: "Average Sentiment", value: "52.6%", description: "Average sentiment score (Driven by high praise in mixology threads)", icon: "TrendingUp" },
      { id: "2", label: "Critical Issues", value: "1", description: "Minor complaints regarding 'burnt' (gosong) roast profile", icon: "AlertTriangle" },
      { id: "3", label: "Share of Voice", value: "1.4%", description: "Fresco SOV vs 16 External Competitors", icon: "MessageSquare" },
      { id: "4", label: "Conversation Analyzed", value: "19", description: "Total validated Fresco mentions across all platforms", icon: "Users" },
    ],
    priorityActions: [
      {
        id: "1",
        priority: "medium",
        title: "Monitor 'Burnt' Roast Profile Feedback",
        description: "A small fraction of organic users on Twitter reported that the black coffee variant of Fresco tastes somewhat 'burnt' or 'harsh' (nyegrak) recently.",
        impact: "Medium",
        effort: "Medium",
        recommendation: "Pass this feedback to the R&D/QC team to verify if recent roasting batches are darker than usual, or create content explaining the robust flavor profile of Fresco.",
        category: "Product Quality",
        quadrantColor: "yellow",
        relatedIssues: ["Roast level", "Harsh taste"],
        metrics: { mentions: 2, sentiment: -0.5, trend: "Isolated Incident" },
        sourceContent: [
          {
            id: "sc1",
            platform: "twitter",
            author: "@user",
            content: "Sama kaya Fresco , sekarang nyegrak kaya kopi 'gosong'",
            sentiment: -0.5,
            timestamp: "2 days ago",
            engagement: { likes: 0, replies: 0, retweets: 0 },
          },
        ],
      },
    ],
    outletSatisfaction: [],
    risks: [
      {
        id: "1",
        title: "Low Overall Brand Awareness",
        description: "With only 19 organic mentions in a week, Fresco suffers from low top-of-mind awareness compared to tier-1 competitors like Nescafe, Torabika, or Indocafe.",
        severity: "High",
        probability: 75,
        impact: "Market Share",
        trend: "Stagnant",
        supportingContents: 1,
        indicators: [{ label: "Total Volume", value: 19, change: -5 }],
        mitigation: ["Launch micro-influencer campaigns focusing specifically on the 'Fresco Kopi Susu' recipe to artificially boost conversation volume."],
        sourceContent: [
          { id: "r1", platform: "twitter", author: "@user", content: "Klo yg ada ampas kapal api kopi susu/Fresco enak nder", sentiment: 0.7, timestamp: "1 day ago" },
        ],
      },
    ],
    opportunities: [
      {
        id: "1",
        title: "Positioning as the Ultimate 'Kopsus' Base",
        description: "Fresco receives exceptionally high praise as a base for homemade milk coffee (Kopsus). Users actively recommend it over other brands for DIY sweet drinks.",
        potential: "High Conversion",
        confidence: 85,
        timeframe: "Medium Term",
        category: "Consumer Usage",
        trend: "Trending",
        supportingContents: 1,
        metrics: { sentimentScore: 95, marketPotential: 80, reachGrowth: 10 },
        recommendations: ["Own the 'Best Base for Milk Coffee' narrative. Partner with local culinary TikTokers to demonstrate Fresco hacks."],
        sourceContent: [
          { id: "o1", platform: "twitter", author: "@ndiscoklat", content: "Klo yg ada ampas kapal api kopi susu/Fresco enak nder", sentiment: 0.95, timestamp: "1 day ago" },
        ],
      },
    ],
    competitiveIssues: [
      {
        id: "1",
        issue: "Volume Deficit",
        yourMentions: 19,
        competitorMedianMentions: 70,
        relativeMentions: -72,
        yourSentiment: 0.5,
        competitorMedianSentiment: 0.3,
        relativeSentiment: 60,
        category: "Brand Awareness",
      },
    ],
    competitiveKeyInsights: [
      {
        id: "1",
        type: "strength",
        title: "The High-Quality Underdog",
        description: "Fresco commands a very small volume (19) compared to giants like Nescafe (400) or Torabika (144), but it vastly outperforms them in satisfaction (52.6% vs ~35%).",
        bullets: [
          "Fresco is heavily recommended in peer-to-peer Twitter threads (specifically the @ndiscoklat tier list).",
          "Torabika Creamy Latte dominates the 'instant' milk coffee space, but Fresco is preferred for 'DIY' milk coffee.",
          "Caffino and Kopiko generate more youth engagement, leaving Fresco reliant on purely organic taste-based word-of-mouth.",
        ],
      },
    ],
    whatsHappeningSentimentTrends: [
      { date: "Feb 13", positive: 1, negative: 0, neutral: 1 },
      { date: "Feb 14", positive: 2, negative: 1, neutral: 0 },
      { date: "Feb 15", positive: 1, negative: 0, neutral: 0 },
      { date: "Feb 16", positive: 3, negative: 2, neutral: 1 },
      { date: "Feb 17", positive: 1, negative: 1, neutral: 0 },
      { date: "Feb 18", positive: 1, negative: 1, neutral: 0 },
      { date: "Feb 19", positive: 1, negative: 1, neutral: 1 },
    ],
    whatsHappeningKeyEvents: [
      {
        id: "1",
        date: "Feb 16",
        title: "Twitter Sachet Coffee Tier List",
        description: "Fresco saw a mini-spike in mentions as users explicitly recommended it in the viral @ndiscoklat coffee ranking thread.",
      },
    ],
    whatsHappeningTopTopics: [
      { topic: "Homemade Milk Coffee Hacks", mentions: 10, sentiment: 0.9 },
      { topic: "Coffee Tier List Debates", mentions: 6, sentiment: 0.5 },
      { topic: "Burnt/Harsh Taste Complaints", mentions: 3, sentiment: -0.8 },
    ],
    whatsHappeningAITopicAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Fresco as a Culinary Ingredient",
        description: "Instead of being discussed as a standalone instant drink, Fresco is highly regarded as a high-quality 'ingredient' for creating cafe-style beverages at home.",
      },
    ],
    whatsHappeningTopicTrendsData: [
      { date: "Feb 13", DIYHacks: 1, TierList: 0, RoastLevel: 0 },
      { date: "Feb 14", DIYHacks: 2, TierList: 1, RoastLevel: 0 },
      { date: "Feb 15", DIYHacks: 1, TierList: 0, RoastLevel: 0 },
      { date: "Feb 16", DIYHacks: 4, TierList: 5, RoastLevel: 1 },
      { date: "Feb 17", DIYHacks: 1, TierList: 0, RoastLevel: 1 },
      { date: "Feb 18", DIYHacks: 0, TierList: 0, RoastLevel: 1 },
      { date: "Feb 19", DIYHacks: 1, TierList: 0, RoastLevel: 0 },
    ],
    whatsHappeningAITrendAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Word of Mouth Over Marketing",
        description: "Fresco's digital footprint is nearly 100% peer-to-peer recommendations. There is a noticeable absence of brand-driven promotional chatter.",
      },
    ],
    whatsHappeningWordCloud: [
      { text: "fresco", weight: 85, sentiment: "neutral" },
      { text: "kopsus", weight: 65, sentiment: "positive" },
      { text: "enak", weight: 55, sentiment: "positive" },
      { text: "susu", weight: 40, sentiment: "positive" },
      { text: "gosong", weight: 25, sentiment: "negative" },
      { text: "ampas", weight: 20, sentiment: "neutral" },
      { text: "mantap", weight: 15, sentiment: "positive" },
    ],
    whatsHappeningClusters: [
      {
        id: "1",
        theme: "Mixology Recommendations (Twitter)",
        size: 15,
        sentiment: 0.8,
        trend: "stable",
        keywords: ["susu", "enak", "ampas", "nder"],
      },
    ],
    whatsHappeningHashtags: [
      { id: "1", tag: "#EnaknyaNgopiFresco", conversations: 3, likes: 22, comments: 0 },
      { id: "2", tag: "#FrescoCappuccino", conversations: 3, likes: 22, comments: 0 },
      { id: "3", tag: "#FrescoMalibu", conversations: 2, likes: 17, comments: 0 },
    ],
    whatsHappeningAccounts: [
      { id: "1", name: "Kopi Fresco Official", handle: "@kopifresco.id", platform: "instagram", followers: 12500, conversations: 2, likes: 16, replies: 0 },
      { id: "2", name: "az_kecil", handle: "@zainudyn", platform: "twitter", followers: 441, conversations: 6, likes: 6, replies: 0 },
      { id: "3", name: "CHOMENK", handle: "@enggalreparasi", platform: "twitter", followers: 121, conversations: 2, likes: 2, replies: 0 },
    ],
    whatsHappeningContents: [
      { id: "1", title: "Kalau lo, apa aja nih goalsnya dalam bulan Ramadan? Yang pasti, jangan lupa st...", platform: "instagram", author: "kopifresco.id", likes: 11, comments: 0 },
      { id: "2", title: "Agenda weekend 2026 : Kumpul, Ketawa, Kopi Fresco, ulangi. #EnaknyaNgopiFresco...", platform: "instagram", author: "kopifresco.id", likes: 5, comments: 0 },
      { id: "3", title: "@ndiscoklat Bawah nya fresco luwak mantap bgt.95% mirip kopi lampung.", platform: "twitter", author: "enggalreparasi", likes: 1, comments: 0 },
      { id: "4", title: "@ndiscoklat Kopi item: kapal api, gadjah. Kopi rasa2: abc kopsus, kapal api kopsu...", platform: "twitter", author: "zainudyn", likes: 1, comments: 0 },
    ],
    whatsHappeningKOLMatrix: [
      {
        id: "1",
        name: "ndiscoklat",
        followers: 12000,
        positivity: 80,
        engagement: 95,
        color: "yellow",
        category: "Organic Trendsetter",
      },
    ],
    whatsHappeningAIKOLAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Zero Mega-KOL Presence",
        description: "Fresco relies entirely on micro-interactions and community threads. Partnering with a culinary/recipe KOL could significantly boost its 'mixology' identity.",
      },
    ],
    whatsHappeningShareOfPlatform: [
      { date: "Feb 13", twitter: 90, youtube: 0, reddit: 0, instagram: 10, facebook: 0, tiktok: 0 },
      { date: "Feb 14", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 15", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 16", twitter: 95, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 5 },
      { date: "Feb 17", twitter: 85, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 15 },
      { date: "Feb 18", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 19", twitter: 90, youtube: 0, reddit: 0, instagram: 10, facebook: 0, tiktok: 0 },
    ],
    competitiveMatrixItems: [
      { id: "1", name: "Kopi Fresco", mentions: 19, positivePercentage: 52.6, size: 19, color: "#008000" },
      { id: "2", name: "Nescafe", mentions: 400, positivePercentage: 31.8, size: 400, color: "#FF0000" },
      { id: "3", name: "Kopi Luwak", mentions: 195, positivePercentage: 31.8, size: 195, color: "#8B4513" },
      { id: "4", name: "Indocafe", mentions: 146, positivePercentage: 34.2, size: 146, color: "#D2691E" },
      { id: "5", name: "Torabika", mentions: 144, positivePercentage: 42.4, size: 144, color: "#A0522D" },
      { id: "6", name: "Kopiko", mentions: 115, positivePercentage: 5.2, size: 115, color: "#4B3621" },
      { id: "7", name: "Caffino", mentions: 95, positivePercentage: 46.3, size: 95, color: "#8A2BE2" },
      { id: "8", name: "Kopi Gadjah", mentions: 70, positivePercentage: 17.1, size: 70, color: "#555555" },
      { id: "9", name: "TOP Coffee", mentions: 40, positivePercentage: 32.5, size: 40, color: "#FF8C00" },
      { id: "10", name: "Kopi Liong Bulan", mentions: 32, positivePercentage: 12.5, size: 32, color: "#C0C0C0" },
      { id: "11", name: "Golda Coffee", mentions: 18, positivePercentage: 11.1, size: 18, color: "#FFD700" },
      { id: "12", name: "Kopken RTD", mentions: 17, positivePercentage: 52.9, size: 17, color: "#FF1493" },
      { id: "13", name: "Space Roastery", mentions: 14, positivePercentage: 7.1, size: 14, color: "#000000" },
      { id: "14", name: "FiberCreme", mentions: 9, positivePercentage: 55.6, size: 9, color: "#ADD8E6" },
      { id: "15", name: "First Crack Coffee", mentions: 8, positivePercentage: 50.0, size: 8, color: "#A52A2A" },
      { id: "16", name: "Roemah Koffie", mentions: 8, positivePercentage: 12.5, size: 8, color: "#DEB887" },
      { id: "17", name: "Max Creamer", mentions: 3, positivePercentage: 0.0, size: 3, color: "#F5F5DC" },
    ],
    competitiveQuadrantAnalysis: [
      { id: "1", label: "Market Leaders", brands: "Nescafe, Kopi Luwak, Indocafe", note: "High Volume" },
      { id: "2", label: "Low Volume, High Praise", brands: "Kopi Fresco, Kopken RTD, First Crack Coffee, FiberCreme", note: "Small footprint but deeply loved by users" },
      { id: "3", label: "Mass Mid-Tier", brands: "Torabika, Caffino, Kopiko, Kopi Gadjah", note: "High visibility, mixed sentiment" },
    ],
    competitiveSentimentScores: sentimentRows.map((r) => toFullSentimentRow(r as Record<string, number | string>)),
    competitiveVolumeOfMentions: volumeRows.map((r) => toFullVolumeRow(r as Record<string, number | string>)),
    competitiveShareOfVoice: sovRows.map((r) => toShareOfVoiceRowFresco(r as Record<string, number | string>)),
    competitiveBrandLabels: { yourBrand: "Kopi Fresco", competitorA: "Nescafe", competitorB: "Kopi Luwak", competitorC: "Indocafe", competitorD: "Torabika" },
  };
}

function buildExcelsoInitial(base: DashboardContentStore): DashboardContentStore {
  const sentimentRows = [
    { issue: "Quality of Beans / Roastery", "Excelso": 88, "Nescafe": 45, "Kopi Luwak": 35, "Indocafe": 30, "Torabika": 40, "Kopiko": 20, "Caffino": 35, "Kopi Gadjah": 45, "TOP Coffee": 30, "Kopi Liong Bulan": 55, "Golda Coffee": 20, "Kopken RTD": 65, "Space Roastery": 95, "FiberCreme": 0, "First Crack Coffee": 90, "Roemah Koffie": 85, "Max Creamer": 0 },
    { issue: "Brand Prestige", "Excelso": 92, "Nescafe": 65, "Kopi Luwak": 40, "Indocafe": 30, "Torabika": 35, "Kopiko": 35, "Caffino": 40, "Kopi Gadjah": 20, "TOP Coffee": 25, "Kopi Liong Bulan": 15, "Golda Coffee": 30, "Kopken RTD": 75, "Space Roastery": 85, "FiberCreme": 45, "First Crack Coffee": 80, "Roemah Koffie": 70, "Max Creamer": 20 },
    { issue: "Promo Attractiveness", "Excelso": 85, "Nescafe": 80, "Kopi Luwak": 64, "Indocafe": 50, "Torabika": 55, "Kopiko": 45, "Caffino": 60, "Kopi Gadjah": 30, "TOP Coffee": 40, "Kopi Liong Bulan": 10, "Golda Coffee": 35, "Kopken RTD": 70, "Space Roastery": 25, "FiberCreme": 30, "First Crack Coffee": 15, "Roemah Koffie": 20, "Max Creamer": 10 },
  ];
  const volumeRows = [
    { issue: "Cafe/Offline Visits", "Excelso": 45, "Nescafe": 10, "Kopi Luwak": 0, "Indocafe": 0, "Torabika": 0, "Kopiko": 0, "Caffino": 0, "Kopi Gadjah": 0, "TOP Coffee": 0, "Kopi Liong Bulan": 0, "Golda Coffee": 0, "Kopken RTD": 12, "Space Roastery": 8, "FiberCreme": 0, "First Crack Coffee": 5, "Roemah Koffie": 6, "Max Creamer": 0 },
    { issue: "Loyalty & Rewards", "Excelso": 15, "Nescafe": 30, "Kopi Luwak": 10, "Indocafe": 5, "Torabika": 8, "Kopiko": 5, "Caffino": 10, "Kopi Gadjah": 0, "TOP Coffee": 0, "Kopi Liong Bulan": 0, "Golda Coffee": 0, "Kopken RTD": 3, "Space Roastery": 0, "FiberCreme": 0, "First Crack Coffee": 0, "Roemah Koffie": 0, "Max Creamer": 0 },
    { issue: "Premium Beans", "Excelso": 10, "Nescafe": 5, "Kopi Luwak": 2, "Indocafe": 0, "Torabika": 0, "Kopiko": 0, "Caffino": 0, "Kopi Gadjah": 0, "TOP Coffee": 0, "Kopi Liong Bulan": 2, "Golda Coffee": 0, "Kopken RTD": 2, "Space Roastery": 6, "FiberCreme": 0, "First Crack Coffee": 3, "Roemah Koffie": 2, "Max Creamer": 0 },
  ];
  const sovRows = [
    { date: "Feb 13", "Excelso": 7, "Nescafe": 70, "Kopi Luwak": 37, "Indocafe": 33, "Torabika": 36, "Kopiko": 19, "Caffino": 9, "Kopi Gadjah": 12, "TOP Coffee": 5, "Kopi Liong Bulan": 5, "Golda Coffee": 3, "Kopken RTD": 3, "Space Roastery": 1, "FiberCreme": 2, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 1 },
    { date: "Feb 14", "Excelso": 11, "Nescafe": 45, "Kopi Luwak": 25, "Indocafe": 20, "Torabika": 12, "Kopiko": 23, "Caffino": 16, "Kopi Gadjah": 8, "TOP Coffee": 7, "Kopi Liong Bulan": 3, "Golda Coffee": 2, "Kopken RTD": 4, "Space Roastery": 2, "FiberCreme": 1, "First Crack Coffee": 2, "Roemah Koffie": 2, "Max Creamer": 0 },
    { date: "Feb 15", "Excelso": 5, "Nescafe": 80, "Kopi Luwak": 41, "Indocafe": 15, "Torabika": 28, "Kopiko": 11, "Caffino": 21, "Kopi Gadjah": 10, "TOP Coffee": 4, "Kopi Liong Bulan": 6, "Golda Coffee": 1, "Kopken RTD": 1, "Space Roastery": 3, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 0, "Max Creamer": 1 },
    { date: "Feb 16", "Excelso": 20, "Nescafe": 60, "Kopi Luwak": 18, "Indocafe": 22, "Torabika": 18, "Kopiko": 28, "Caffino": 14, "Kopi Gadjah": 14, "TOP Coffee": 8, "Kopi Liong Bulan": 4, "Golda Coffee": 4, "Kopken RTD": 3, "Space Roastery": 4, "FiberCreme": 2, "First Crack Coffee": 1, "Roemah Koffie": 2, "Max Creamer": 0 },
    { date: "Feb 17", "Excelso": 9, "Nescafe": 55, "Kopi Luwak": 22, "Indocafe": 18, "Torabika": 22, "Kopiko": 15, "Caffino": 12, "Kopi Gadjah": 11, "TOP Coffee": 6, "Kopi Liong Bulan": 5, "Golda Coffee": 2, "Kopken RTD": 2, "Space Roastery": 1, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 1 },
    { date: "Feb 18", "Excelso": 8, "Nescafe": 48, "Kopi Luwak": 20, "Indocafe": 25, "Torabika": 15, "Kopiko": 9, "Caffino": 8, "Kopi Gadjah": 6, "TOP Coffee": 5, "Kopi Liong Bulan": 3, "Golda Coffee": 3, "Kopken RTD": 2, "Space Roastery": 1, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 },
    { date: "Feb 19", "Excelso": 10, "Nescafe": 42, "Kopi Luwak": 32, "Indocafe": 13, "Torabika": 13, "Kopiko": 10, "Caffino": 15, "Kopi Gadjah": 9, "TOP Coffee": 5, "Kopi Liong Bulan": 6, "Golda Coffee": 3, "Kopken RTD": 2, "Space Roastery": 2, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 },
  ];
  return {
    ...base,
    featureVisibility: {
      statsOverview: true,
      actionRecommendations: true,
      outletSatisfaction: false,
      risksOpportunities: true,
      competitiveAnalysis: true,
      recentInsights: true,
    },
    statsOverview: [
      { id: "1", label: "Average Sentiment", value: "31.4%", description: "Average sentiment score (Boosted by rewards & premium bean quality)", icon: "TrendingUp" },
      { id: "2", label: "Critical Issues", value: "1", description: "Customer service discrepancies regarding 'sugar-free' requests at outlets", icon: "AlertTriangle" },
      { id: "3", label: "Share of Voice", value: "5.1%", description: "Excelso SOV vs 16 External Mass/Premium Competitors", icon: "MessageSquare" },
      { id: "4", label: "Conversation Analyzed", value: "70", description: "Total validated Excelso mentions across all platforms", icon: "Users" },
    ],
    priorityActions: [
      {
        id: "1",
        priority: "high",
        title: "Standardize 'Sugar-Free' Protocols in Outlets",
        description: "A viral complaint noted a user ordering a 'sugar-free Americano' during a B1G1 promo, only to receive a sweetened beverage, indicating a slip in barista standard operating procedures.",
        impact: "High",
        effort: "Medium",
        recommendation: "Deploy a quick refresher course for outlet staff regarding customized orders (less sugar/no sugar) to maintain the premium service standard.",
        category: "Customer Experience",
        quadrantColor: "red",
        relatedIssues: ["Barista Error", "Unwanted Sweetness"],
        metrics: { mentions: 3, sentiment: -0.9, trend: "Isolated Incident" },
        sourceContent: [
          {
            id: "sc1",
            platform: "twitter",
            author: "@user",
            content: "Pernah ke excelso, promo buy 1 get 1 free, dua2nya aku ambil americano. I thought udh gada gula, pas nyampe cuma 1 sip lah kok manis😭",
            sentiment: -0.9,
            timestamp: "2 days ago",
            engagement: { likes: 0, replies: 0, retweets: 0 },
          },
        ],
      },
    ],
    outletSatisfaction: [],
    risks: [
      {
        id: "1",
        title: "Perception of Being an 'Older Generation' Cafe",
        description: "In conversations mapping out modern cafe-hopping routines, Excelso is sometimes contrasted against trendier, fast-paced options like Fore or Tomoro, hinting at an 'older' demographic perception.",
        severity: "Medium",
        probability: 50,
        impact: "Gen-Z Market Share",
        trend: "Stable",
        supportingContents: 1,
        indicators: [{ label: "Youth Cafe Mentions", value: 12, change: 2 }],
        mitigation: ["Revamp the RTD (Ready-to-Drink) line or introduce highly aesthetic seasonal menus specifically targeted at Gen-Z on TikTok."],
        sourceContent: [
          { id: "r1", platform: "twitter", author: "@user", content: "Jangankan di fore! Di excelso pun ku ayoin anjay, tapi tomoro lebih enak sih.", sentiment: 0.2, timestamp: "1 day ago" },
        ],
      },
    ],
    opportunities: [
      {
        id: "1",
        title: "Capitalize on 'Premium' Home Brewing (Sensory Humour)",
        description: "Excelso beans are perceived as highly premium. A viral tweet generated amusement when a husband complained his wife used expensive Excelso coffee powder (instead of cheap sachets) for their child's sensory play.",
        potential: "High Viral Engagement",
        confidence: 60,
        timeframe: "Short Term",
        category: "Brand Image",
        trend: "Spiking",
        supportingContents: 1,
        metrics: { sentimentScore: 85, marketPotential: 75, reachGrowth: 18 },
        recommendations: ["Engage humorously with the viral tweet. Reiterate that Excelso's aroma is too good for mud-play, but perfect for the parents' morning sanity."],
        sourceContent: [
          { id: "o1", platform: "twitter", author: "@user", content: "Bini gw bikin lumpur-lumpuran buat latihan sensori bocil... Gw udah mikir \"Ya paling kopi sachet lah…\" Ternyata yang dipake Excelso", sentiment: 0.6, timestamp: "1 day ago" },
        ],
      },
    ],
    competitiveIssues: [
      {
        id: "1",
        issue: "Premium Roast Associations",
        yourMentions: 18,
        competitorMedianMentions: 5,
        relativeMentions: 260,
        yourSentiment: 0.7,
        competitorMedianSentiment: 0.4,
        relativeSentiment: 75,
        category: "Product",
      },
    ],
    competitiveKeyInsights: [
      {
        id: "1",
        type: "strength",
        title: "Excelso Leads the High-End Bean & Cafe Segment",
        description: "When compared to 16 external mass and specialty competitors, Excelso holds a unique hybrid position. It cannot match the raw volume of Nescafe (400), but utterly dominates the premium 'single origin' and 'lifestyle cafe' discussions.",
        bullets: [
          "Excelso is the most discussed brand for premium grounded beans (Toraja, Arabica) compared to Space Roastery (14) and First Crack (8).",
          "Telkomsel Platinum rewards drive significant digital footfall and positive sentiment for Excelso.",
          "Excelso avoids the 'gastric acid' or 'cheap tier' jokes that plague mass-market competitors like Torabika or Indocafe.",
        ],
      },
    ],
    whatsHappeningSentimentTrends: [
      { date: "Feb 13", positive: 4, negative: 1, neutral: 5 },
      { date: "Feb 14", positive: 3, negative: 0, neutral: 6 },
      { date: "Feb 15", positive: 2, negative: 2, neutral: 5 },
      { date: "Feb 16", positive: 5, negative: 1, neutral: 10 },
      { date: "Feb 17", positive: 3, negative: 0, neutral: 4 },
      { date: "Feb 18", positive: 2, negative: 1, neutral: 8 },
      { date: "Feb 19", positive: 3, negative: 1, neutral: 4 },
    ],
    whatsHappeningKeyEvents: [
      {
        id: "1",
        date: "Feb 16",
        title: "Loyalty Program Activations",
        description: "A surge in mentions related to users claiming Telkomsel Platinum rewards and Birthday treats at Excelso physical outlets.",
      },
    ],
    whatsHappeningTopTopics: [
      { topic: "Single Origin Beans (Toraja/Arabica)", mentions: 17, sentiment: 0.85 },
      { topic: "Cafe Rewards & Promos", mentions: 15, sentiment: 0.9 },
      { topic: "Sensory Play Viral Joke", mentions: 10, sentiment: 0.6 },
      { topic: "Barista Service (Sugar Issue)", mentions: 5, sentiment: -0.8 },
    ],
    whatsHappeningAITopicAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "The 'Treat Yourself' Narrative",
        description: "Conversations around Excelso are heavily framed as a 'reward' or an 'indulgence' rather than a basic daily caffeine fix, cementing its premium status.",
      },
    ],
    whatsHappeningTopicTrendsData: [
      { date: "Feb 13", CafeRewards: 2, PremiumBeans: 5, YouthCulture: 1, Service: 0 },
      { date: "Feb 14", CafeRewards: 3, PremiumBeans: 4, YouthCulture: 1, Service: 0 },
      { date: "Feb 15", CafeRewards: 1, PremiumBeans: 3, YouthCulture: 2, Service: 2 },
      { date: "Feb 16", CafeRewards: 7, PremiumBeans: 6, YouthCulture: 1, Service: 1 },
      { date: "Feb 17", CafeRewards: 2, PremiumBeans: 4, YouthCulture: 0, Service: 0 },
      { date: "Feb 18", CafeRewards: 1, PremiumBeans: 3, YouthCulture: 2, Service: 1 },
      { date: "Feb 19", CafeRewards: 3, PremiumBeans: 2, YouthCulture: 1, Service: 1 },
    ],
    whatsHappeningAITrendAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "O2O (Online to Offline) Success",
        description: "Excelso effectively bridges digital mentions with physical store visits. Many tweets are geo-tagged or implicitly mention visiting an outlet ('bengong di excelso blok M').",
      },
    ],
    whatsHappeningWordCloud: [
      { text: "excelso", weight: 120, sentiment: "positive" },
      { text: "toraja", weight: 65, sentiment: "positive" },
      { text: "arabica", weight: 55, sentiment: "positive" },
      { text: "promo", weight: 40, sentiment: "positive" },
      { text: "outlet", weight: 35, sentiment: "neutral" },
      { text: "manis", weight: 25, sentiment: "negative" },
      { text: "lumpur", weight: 20, sentiment: "neutral" },
    ],
    whatsHappeningClusters: [
      {
        id: "1",
        theme: "Premium Cafe Experience",
        size: 40,
        sentiment: 0.7,
        trend: "stable",
        keywords: ["outlet", "promo", "barista", "toraja"],
      },
    ],
    whatsHappeningHashtags: [
      { id: "1", tag: "#ExcelsoCoffee", conversations: 8, likes: 120, comments: 14 },
      { id: "2", tag: "#ExcelsoExperience", conversations: 8, likes: 95, comments: 10 },
    ],
    whatsHappeningAccounts: [
      { id: "1", name: "Telkomsel", handle: "@Telkomsel", platform: "twitter", followers: 2000000, conversations: 5, likes: 80, replies: 25 },
      { id: "2", name: "Hadi Badex", handle: "@hadibadex", platform: "twitter", followers: 7627, conversations: 1, likes: 10, replies: 6 },
      { id: "3", name: "ngomonginuang", handle: "@CalonIstriGenZ", platform: "twitter", followers: 1230, conversations: 2, likes: 15, replies: 3 },
    ],
    whatsHappeningContents: [
      { id: "1", title: "Bini gw bikin lumpur-lumpuran buat latihan sensori bocil. Ternyata yang dipake Excelso 🥲", platform: "twitter", author: "hadibadex", likes: 10, comments: 6 },
      { id: "2", title: "min @Telkomsel rewards platinum yg free excelso itu gaada barcode?", platform: "twitter", author: "OrganicUser", likes: 12, comments: 5 },
      { id: "3", title: "Kurangin kopi sachet, saatnya kembali ke kopi bubuk. JJ royal & excelso jg terbaik...", platform: "twitter", author: "CalonIstriGenZ", likes: 2, comments: 0 },
      { id: "4", title: "If you want instant, don't buy sachet. Try Excelso or Nescafe Gold. Better quality.", platform: "twitter", author: "ndiscoklat", likes: 1, comments: 1 },
    ],
    whatsHappeningKOLMatrix: [
      {
        id: "1",
        name: "excelsocoffee",
        followers: 105000,
        positivity: 85,
        engagement: 70,
        color: "gold",
        category: "Official Brand",
      },
    ],
    whatsHappeningAIKOLAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Reliance on Corporate Partners",
        description: "Instead of individual KOLs, Excelso's visibility is heavily supported by B2B partnerships (Telkomsel, Banking Promos) acting as amplification channels.",
      },
    ],
    whatsHappeningShareOfPlatform: [
      { date: "Feb 13", twitter: 65, youtube: 0, reddit: 0, instagram: 30, facebook: 0, tiktok: 5 },
      { date: "Feb 14", twitter: 70, youtube: 0, reddit: 0, instagram: 20, facebook: 0, tiktok: 10 },
      { date: "Feb 15", twitter: 85, youtube: 0, reddit: 0, instagram: 10, facebook: 0, tiktok: 5 },
      { date: "Feb 16", twitter: 60, youtube: 0, reddit: 0, instagram: 35, facebook: 0, tiktok: 5 },
      { date: "Feb 17", twitter: 75, youtube: 0, reddit: 0, instagram: 15, facebook: 0, tiktok: 10 },
      { date: "Feb 18", twitter: 80, youtube: 0, reddit: 0, instagram: 10, facebook: 0, tiktok: 10 },
      { date: "Feb 19", twitter: 78, youtube: 0, reddit: 0, instagram: 12, facebook: 0, tiktok: 10 },
    ],
    competitiveMatrixItems: [
      { id: "1", name: "Excelso", mentions: 70, positivePercentage: 31.4, size: 70, color: "#D4AF37" },
      { id: "2", name: "Nescafe", mentions: 400, positivePercentage: 31.8, size: 400, color: "#FF0000" },
      { id: "3", name: "Kopi Luwak", mentions: 195, positivePercentage: 31.8, size: 195, color: "#8B4513" },
      { id: "4", name: "Indocafe", mentions: 146, positivePercentage: 34.2, size: 146, color: "#D2691E" },
      { id: "5", name: "Torabika", mentions: 144, positivePercentage: 42.4, size: 144, color: "#A0522D" },
      { id: "6", name: "Kopiko", mentions: 115, positivePercentage: 5.2, size: 115, color: "#4B3621" },
      { id: "7", name: "Caffino", mentions: 95, positivePercentage: 46.3, size: 95, color: "#8A2BE2" },
      { id: "8", name: "Kopi Gadjah", mentions: 70, positivePercentage: 17.1, size: 70, color: "#555555" },
      { id: "9", name: "TOP Coffee", mentions: 40, positivePercentage: 32.5, size: 40, color: "#FF8C00" },
      { id: "10", name: "Kopi Liong Bulan", mentions: 32, positivePercentage: 12.5, size: 32, color: "#C0C0C0" },
      { id: "11", name: "Golda Coffee", mentions: 18, positivePercentage: 11.1, size: 18, color: "#FFD700" },
      { id: "12", name: "Kopken RTD", mentions: 17, positivePercentage: 52.9, size: 17, color: "#FF1493" },
      { id: "13", name: "Space Roastery", mentions: 14, positivePercentage: 7.1, size: 14, color: "#000000" },
      { id: "14", name: "FiberCreme", mentions: 9, positivePercentage: 55.6, size: 9, color: "#ADD8E6" },
      { id: "15", name: "First Crack Coffee", mentions: 8, positivePercentage: 50.0, size: 8, color: "#A52A2A" },
      { id: "16", name: "Roemah Koffie", mentions: 8, positivePercentage: 12.5, size: 8, color: "#DEB887" },
      { id: "17", name: "Max Creamer", mentions: 3, positivePercentage: 0.0, size: 3, color: "#F5F5DC" },
    ],
    competitiveQuadrantAnalysis: [
      { id: "1", label: "Mass Giants", brands: "Nescafe, Kopi Luwak, Indocafe", note: "Huge Volume, Different Target Market" },
      { id: "2", label: "Premium & Lifestyle Leaders", brands: "Excelso, Kopken RTD, Space Roastery, First Crack Coffee", note: "Higher Quality Perception, Niche Audiences" },
      { id: "3", label: "Mid-Tier Contenders", brands: "Caffino, Torabika, Kopiko", note: "Flavor-driven, mass volume" },
    ],
    competitiveSentimentScores: sentimentRows.map((r) => toFullSentimentRow(r as Record<string, number | string>)),
    competitiveVolumeOfMentions: volumeRows.map((r) => toFullVolumeRow(r as Record<string, number | string>)),
    competitiveShareOfVoice: sovRows.map((r) => toShareOfVoiceRowExcelso(r as Record<string, number | string>)),
    competitiveBrandLabels: { yourBrand: "Excelso", competitorA: "Nescafe", competitorB: "Kopi Luwak", competitorC: "Indocafe", competitorD: "Torabika" },
  };
}

function buildKopiKaptenInitial(base: DashboardContentStore): DashboardContentStore {
  const sentimentRows = [
    { issue: "Product Availability", "Kopi Kapten": 15, "Nescafe": 95, "Kopi Luwak": 90, "Indocafe": 88, "Torabika": 85, "Kopiko": 80, "Caffino": 75, "Kopi Gadjah": 65, "TOP Coffee": 70, "Kopi Liong Bulan": 40, "Golda Coffee": 75, "Kopken RTD": 70, "Space Roastery": 80, "FiberCreme": 85, "First Crack Coffee": 80, "Roemah Koffie": 75, "Max Creamer": 50 },
    { issue: "Value for Money", "Kopi Kapten": 85, "Nescafe": 56, "Kopi Luwak": 60, "Indocafe": 65, "Torabika": 62, "Kopiko": 50, "Caffino": 55, "Kopi Gadjah": 75, "TOP Coffee": 60, "Kopi Liong Bulan": 80, "Golda Coffee": 55, "Kopken RTD": 40, "Space Roastery": 20, "FiberCreme": 50, "First Crack Coffee": 15, "Roemah Koffie": 30, "Max Creamer": 40 },
    { issue: "Brand Fun / Meme-ability", "Kopi Kapten": 90, "Nescafe": 30, "Kopi Luwak": 25, "Indocafe": 15, "Torabika": 30, "Kopiko": 10, "Caffino": 25, "Kopi Gadjah": 45, "TOP Coffee": 20, "Kopi Liong Bulan": 55, "Golda Coffee": 15, "Kopken RTD": 35, "Space Roastery": 10, "FiberCreme": 10, "First Crack Coffee": 5, "Roemah Koffie": 5, "Max Creamer": 5 },
  ];
  const volumeRows = [
    { issue: "Where to Buy", "Kopi Kapten": 5, "Nescafe": 5, "Kopi Luwak": 2, "Indocafe": 3, "Torabika": 2, "Kopiko": 2, "Caffino": 3, "Kopi Gadjah": 5, "TOP Coffee": 1, "Kopi Liong Bulan": 8, "Golda Coffee": 1, "Kopken RTD": 2, "Space Roastery": 1, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 },
    { issue: "Fandom/Gifts", "Kopi Kapten": 3, "Nescafe": 0, "Kopi Luwak": 0, "Indocafe": 0, "Torabika": 0, "Kopiko": 2, "Caffino": 0, "Kopi Gadjah": 0, "TOP Coffee": 0, "Kopi Liong Bulan": 0, "Golda Coffee": 0, "Kopken RTD": 0, "Space Roastery": 0, "FiberCreme": 0, "First Crack Coffee": 0, "Roemah Koffie": 0, "Max Creamer": 0 },
    { issue: "Quality Comparison", "Kopi Kapten": 1, "Nescafe": 30, "Kopi Luwak": 15, "Indocafe": 10, "Torabika": 12, "Kopiko": 5, "Caffino": 10, "Kopi Gadjah": 8, "TOP Coffee": 5, "Kopi Liong Bulan": 5, "Golda Coffee": 2, "Kopken RTD": 5, "Space Roastery": 8, "FiberCreme": 0, "First Crack Coffee": 5, "Roemah Koffie": 5, "Max Creamer": 0 },
  ];
  const sovRows = [
    { date: "Feb 13", "Kopi Kapten": 2, "Nescafe": 73, "Kopi Luwak": 37, "Indocafe": 18, "Torabika": 22, "Kopiko": 15, "Caffino": 16, "Kopi Gadjah": 14, "TOP Coffee": 6, "Kopi Liong Bulan": 6, "Golda Coffee": 2, "Kopken RTD": 3, "Space Roastery": 3, "FiberCreme": 1, "First Crack Coffee": 0, "Roemah Koffie": 1, "Max Creamer": 1 },
    { date: "Feb 14", "Kopi Kapten": 2, "Nescafe": 45, "Kopi Luwak": 20, "Indocafe": 15, "Torabika": 30, "Kopiko": 25, "Caffino": 12, "Kopi Gadjah": 8, "TOP Coffee": 4, "Kopi Liong Bulan": 3, "Golda Coffee": 4, "Kopken RTD": 2, "Space Roastery": 1, "FiberCreme": 2, "First Crack Coffee": 2, "Roemah Koffie": 0, "Max Creamer": 0 },
    { date: "Feb 15", "Kopi Kapten": 1, "Nescafe": 80, "Kopi Luwak": 45, "Indocafe": 25, "Torabika": 18, "Kopiko": 10, "Caffino": 18, "Kopi Gadjah": 10, "TOP Coffee": 8, "Kopi Liong Bulan": 4, "Golda Coffee": 1, "Kopken RTD": 4, "Space Roastery": 2, "FiberCreme": 0, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 },
    { date: "Feb 16", "Kopi Kapten": 3, "Nescafe": 60, "Kopi Luwak": 28, "Indocafe": 35, "Torabika": 20, "Kopiko": 22, "Caffino": 10, "Kopi Gadjah": 12, "TOP Coffee": 5, "Kopi Liong Bulan": 3, "Golda Coffee": 3, "Kopken RTD": 1, "Space Roastery": 2, "FiberCreme": 1, "First Crack Coffee": 0, "Roemah Koffie": 2, "Max Creamer": 1 },
    { date: "Feb 17", "Kopi Kapten": 0, "Nescafe": 55, "Kopi Luwak": 18, "Indocafe": 20, "Torabika": 25, "Kopiko": 18, "Caffino": 20, "Kopi Gadjah": 9, "TOP Coffee": 7, "Kopi Liong Bulan": 8, "Golda Coffee": 2, "Kopken RTD": 2, "Space Roastery": 1, "FiberCreme": 2, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 },
    { date: "Feb 18", "Kopi Kapten": 1, "Nescafe": 48, "Kopi Luwak": 25, "Indocafe": 12, "Torabika": 15, "Kopiko": 12, "Caffino": 9, "Kopi Gadjah": 8, "TOP Coffee": 5, "Kopi Liong Bulan": 2, "Golda Coffee": 4, "Kopken RTD": 3, "Space Roastery": 4, "FiberCreme": 1, "First Crack Coffee": 2, "Roemah Koffie": 2, "Max Creamer": 1 },
    { date: "Feb 19", "Kopi Kapten": 0, "Nescafe": 39, "Kopi Luwak": 22, "Indocafe": 21, "Torabika": 14, "Kopiko": 13, "Caffino": 10, "Kopi Gadjah": 9, "TOP Coffee": 5, "Kopi Liong Bulan": 4, "Golda Coffee": 2, "Kopken RTD": 2, "Space Roastery": 1, "FiberCreme": 2, "First Crack Coffee": 2, "Roemah Koffie": 1, "Max Creamer": 0 },
  ];
  return {
    ...base,
    featureVisibility: {
      statsOverview: true,
      actionRecommendations: true,
      outletSatisfaction: false,
      risksOpportunities: true,
      competitiveAnalysis: true,
      recentInsights: true,
    },
    statsOverview: [
      { id: "1", label: "Average Sentiment", value: "11.1%", description: "Average sentiment score (Dominated by neutral inquiries & fan culture)", icon: "TrendingUp" },
      { id: "2", label: "Critical Issues", value: "1", description: "Complaints regarding product availability/distribution in major cities", icon: "AlertTriangle" },
      { id: "3", label: "Share of Voice", value: "0.8%", description: "Kapten SOV vs 16 External Competitors", icon: "MessageSquare" },
      { id: "4", label: "Conversation Analyzed", value: "9", description: "Total validated Kapten mentions across all platforms", icon: "Users" },
    ],
    priorityActions: [
      {
        id: "1",
        priority: "critical",
        title: "Investigate Distribution Bottlenecks in East Java",
        description: "Consumers on Twitter specifically noted the irony that Kopi Kapten is rarely found in Surabaya, despite being produced by Santos Jaya Abadi.",
        impact: "High",
        effort: "Medium",
        recommendation: "Cross-check B2B distribution data for the East Java region. Launch a digital 'Store Locator' or push online marketplace (e-commerce) availability for Kopi Kapten.",
        category: "Supply Chain & Distribution",
        quadrantColor: "red",
        relatedIssues: ["Product Scarcity", "Low Retail Penetration"],
        metrics: { mentions: 3, sentiment: 0, trend: "Persistent" },
        sourceContent: [
          {
            id: "sc1",
            platform: "twitter",
            author: "@user",
            content: "kalo di Surabaya Kopi Kapten jarang kutemui padahal saudaranya macam Kapal Api dan Kopi ABC sangat sering",
            sentiment: 0,
            timestamp: "2 days ago",
            engagement: { likes: 0, replies: 0, retweets: 0 },
          },
        ],
      },
    ],
    outletSatisfaction: [],
    risks: [
      {
        id: "1",
        title: "Perception of Being 'Sub-Standard' to Kapal Api",
        description: "Coffee enthusiasts discussing roast quality explicitly categorized Kopi Kapten as a lower grade ('bukan Grade 1') compared to premium options.",
        severity: "Low",
        probability: 75,
        impact: "Brand Prestige",
        trend: "Stable",
        supportingContents: 1,
        indicators: [{ label: "Quality Comparisons", value: 2, change: 0 }],
        mitigation: ["Do not fight the 'budget' perception; instead, lean into the 'economy/hemat' value proposition for the mass grassroots segment."],
        sourceContent: [
          { id: "r1", platform: "twitter", author: "@user", content: "kopi Kapten dan Kapal Api satu PT kopi yg mrk beli bukan Grade 1", sentiment: 0, timestamp: "1 day ago" },
        ],
      },
    ],
    opportunities: [
      {
        id: "1",
        title: "Accidental Fandom Marketing (JKT48 Core)",
        description: "Kopi Kapten is being playfully used as 'freebies' and merchandise by the JKT48 fandom (specifically for member Freya) due to the military/captain naming pun ('SIAP KAPTEN!').",
        potential: "High Viral Reach",
        confidence: 60,
        timeframe: "Short Term",
        category: "Gen-Z Activation",
        trend: "Spiking",
        supportingContents: 1,
        metrics: { sentimentScore: 100, marketPotential: 80, reachGrowth: 50 },
        recommendations: ["Acknowledge the fans! Quote-retweet the fanbases on Twitter with the brand account. Consider a low-budget tactical sponsorship for fandom events."],
        sourceContent: [
          { id: "o1", platform: "twitter", author: "@fan", content: "sampe rumah langsung seduh kopi kapten bersama kapten JKT48 WKWK... SIAP KAPTEN 🫡👮🏻", sentiment: 1, timestamp: "1 day ago" },
        ],
      },
    ],
    competitiveIssues: [
      {
        id: "1",
        issue: "Extremely Low Brand Recall",
        yourMentions: 9,
        competitorMedianMentions: 40,
        relativeMentions: -77,
        yourSentiment: 0.1,
        competitorMedianSentiment: 0.3,
        relativeSentiment: -66,
        category: "Awareness",
      },
    ],
    competitiveKeyInsights: [
      {
        id: "1",
        type: "strength",
        title: "The 'Hidden' Product in the Mass Market",
        description: "Kopi Kapten ranks at the very bottom of the mass-market tier in terms of digital visibility, overshadowed heavily by Torabika (144) and Indocafe (146).",
        bullets: [
          "Unlike Kopi Gadjah (70) which successfully built a 'strong coffee' identity, Kopi Kapten lacks a clear digital persona.",
          "Most interactions are driven by serendipity (finding it rarely or using it as a pun for 'Kapten') rather than intentional purchase intent.",
          "It holds an uncontested position as the 'budget-friendly' alternative among its minimal user base.",
        ],
      },
    ],
    whatsHappeningSentimentTrends: [
      { date: "Feb 13", positive: 0, negative: 0, neutral: 2 },
      { date: "Feb 14", positive: 1, negative: 0, neutral: 1 },
      { date: "Feb 15", positive: 0, negative: 0, neutral: 1 },
      { date: "Feb 16", positive: 0, negative: 0, neutral: 3 },
      { date: "Feb 17", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 18", positive: 0, negative: 0, neutral: 1 },
      { date: "Feb 19", positive: 0, negative: 0, neutral: 0 },
    ],
    whatsHappeningKeyEvents: [
      {
        id: "1",
        date: "Feb 14",
        title: "JKT48 Freya Birthday Freebies",
        description: "Fans distributed Kopi Kapten sachets as themed 'Captain' souvenirs during a JKT48 member's birthday event, generating organic joy.",
      },
    ],
    whatsHappeningTopTopics: [
      { topic: "Availability/Scarcity in Surabaya", mentions: 3, sentiment: -0.1 },
      { topic: "JKT48 Fandom Jokes", mentions: 2, sentiment: 1 },
      { topic: "Budget & Grade Quality", mentions: 2, sentiment: 0 },
    ],
    whatsHappeningAITopicAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Meme-ification of Brand Naming",
        description: "The brand name 'Kapten' carries more weight as a conversational pun on Twitter than as an actual coffee preference, offering a unique, non-traditional marketing angle.",
      },
    ],
    whatsHappeningTopicTrendsData: [
      { date: "Feb 13", Availability: 2, Fandom: 0, Quality: 0 },
      { date: "Feb 14", Availability: 0, Fandom: 2, Quality: 0 },
      { date: "Feb 15", Availability: 1, Fandom: 0, Quality: 0 },
      { date: "Feb 16", Availability: 0, Fandom: 0, Quality: 2 },
      { date: "Feb 17", Availability: 0, Fandom: 0, Quality: 0 },
      { date: "Feb 18", Availability: 0, Fandom: 0, Quality: 0 },
      { date: "Feb 19", Availability: 0, Fandom: 0, Quality: 0 },
    ],
    whatsHappeningAITrendAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Zero Official Social Media Footprint",
        description: "The brand relies 100% on external word-of-mouth. There are no mentions of official campaigns, promotions, or advertisements.",
      },
    ],
    whatsHappeningWordCloud: [
      { text: "kapten", weight: 85, sentiment: "positive" },
      { text: "surabaya", weight: 40, sentiment: "neutral" },
      { text: "jarang", weight: 35, sentiment: "negative" },
      { text: "jkt48", weight: 30, sentiment: "positive" },
      { text: "freya", weight: 25, sentiment: "positive" },
      { text: "grade", weight: 20, sentiment: "neutral" },
      { text: "hemat", weight: 15, sentiment: "positive" },
    ],
    whatsHappeningClusters: [
      {
        id: "1",
        theme: "Scarcity & Fandoms",
        size: 9,
        sentiment: 0.3,
        trend: "stable",
        keywords: ["jarang", "kutemui", "jkt48", "siap"],
      },
    ],
    whatsHappeningHashtags: [
      { id: "1", tag: "#FreyaDwiDasa", conversations: 2, likes: 340, comments: 15 },
      { id: "2", tag: "#AbhiUdayaVimsati", conversations: 2, likes: 340, comments: 15 },
      { id: "3", tag: "#KopiKapten", conversations: 4, likes: 45, comments: 8 },
    ],
    whatsHappeningAccounts: [
      { id: "1", name: "Freyanation Official", handle: "@FreyanationID", platform: "twitter", followers: 15000, conversations: 2, likes: 340, replies: 12 },
      { id: "2", name: "Freya Jayawardana", handle: "@Freya_JKT48", platform: "twitter", followers: 500000, conversations: 1, likes: 340, replies: 5 },
    ],
    whatsHappeningContents: [
      { id: "1", title: "Freebies tahun ini dikash kopi kapten Lucu banget wkwkwk SIAP KAPTEN 🫡👮🏻", platform: "twitter", author: "FreyanationID", likes: 326, comments: 2 },
      { id: "2", title: "sampe rumah langsung seduh kopi kapten bersama kapten JKT48 WKWK. makasi kopi nya @FreyanationID", platform: "twitter", author: "OrganicFan", likes: 14, comments: 1 },
      { id: "3", title: "kopi Kapten dan Kapal Api satu PT kopi yg mrk beli bukan Grade 1 Coba buat pake mocapot...", platform: "twitter", author: "fathulhafidh", likes: 1, comments: 0 },
    ],
    whatsHappeningKOLMatrix: [
      {
        id: "1",
        name: "FreyanationID",
        followers: 15000,
        positivity: 90,
        engagement: 80,
        color: "blue",
        category: "Pop Culture Fandom",
      },
    ],
    whatsHappeningAIKOLAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Accidental Micro-Influencers",
        description: "K-Pop and J-Pop fanbases act as accidental micro-influencers by utilizing the product for themed merchandise events.",
      },
    ],
    whatsHappeningShareOfPlatform: [
      { date: "Feb 13", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 14", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 15", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 16", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 17", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 18", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 19", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
    ],
    competitiveMatrixItems: [
      { id: "1", name: "Kopi Kapten", mentions: 9, positivePercentage: 11.1, size: 9, color: "#00008B" },
      { id: "2", name: "Nescafe", mentions: 400, positivePercentage: 31.8, size: 400, color: "#FF0000" },
      { id: "3", name: "Kopi Luwak", mentions: 195, positivePercentage: 31.8, size: 195, color: "#8B4513" },
      { id: "4", name: "Indocafe", mentions: 146, positivePercentage: 34.2, size: 146, color: "#D2691E" },
      { id: "5", name: "Torabika", mentions: 144, positivePercentage: 42.4, size: 144, color: "#A0522D" },
      { id: "6", name: "Kopiko", mentions: 115, positivePercentage: 5.2, size: 115, color: "#4B3621" },
      { id: "7", name: "Caffino", mentions: 95, positivePercentage: 46.3, size: 95, color: "#8A2BE2" },
      { id: "8", name: "Kopi Gadjah", mentions: 70, positivePercentage: 17.1, size: 70, color: "#555555" },
      { id: "9", name: "TOP Coffee", mentions: 40, positivePercentage: 32.5, size: 40, color: "#FF8C00" },
      { id: "10", name: "Kopi Liong Bulan", mentions: 32, positivePercentage: 12.5, size: 32, color: "#C0C0C0" },
      { id: "11", name: "Golda Coffee", mentions: 18, positivePercentage: 11.1, size: 18, color: "#FFD700" },
      { id: "12", name: "Kopken RTD", mentions: 17, positivePercentage: 52.9, size: 17, color: "#FF1493" },
      { id: "13", name: "Space Roastery", mentions: 14, positivePercentage: 7.1, size: 14, color: "#000000" },
      { id: "14", name: "FiberCreme", mentions: 9, positivePercentage: 55.6, size: 9, color: "#ADD8E6" },
      { id: "15", name: "First Crack Coffee", mentions: 8, positivePercentage: 50.0, size: 8, color: "#A52A2A" },
      { id: "16", name: "Roemah Koffie", mentions: 8, positivePercentage: 12.5, size: 8, color: "#DEB887" },
      { id: "17", name: "Max Creamer", mentions: 3, positivePercentage: 0.0, size: 3, color: "#F5F5DC" },
    ],
    competitiveQuadrantAnalysis: [
      { id: "1", label: "Mass Market Kings", brands: "Nescafe, Kopi Luwak, Indocafe", note: "Huge Volume, High Penetration" },
      { id: "2", label: "Cult Classics", brands: "Torabika, Caffino", note: "High engagement, high satisfaction" },
      { id: "3", label: "Invisible Brands", brands: "Kopi Kapten, Max Creamer", note: "Extremely low share of voice" },
    ],
    competitiveSentimentScores: sentimentRows.map((r) => toFullSentimentRow(r as Record<string, number | string>)),
    competitiveVolumeOfMentions: volumeRows.map((r) => toFullVolumeRow(r as Record<string, number | string>)),
    competitiveShareOfVoice: sovRows.map((r) => toShareOfVoiceRowKapten(r as Record<string, number | string>)),
    competitiveBrandLabels: { yourBrand: "Kopi Kapten", competitorA: "Nescafe", competitorB: "Kopi Luwak", competitorC: "Indocafe", competitorD: "Torabika" },
  };
}

function buildUnakaffeInitial(base: DashboardContentStore): DashboardContentStore {
  const sentimentRows = [
    { issue: "Premium Appeal", "Unakaffe": 90, "Nescafe": 60, "Kopi Luwak": 30, "Indocafe": 20, "Torabika": 30, "Kopiko": 20, "Caffino": 40, "Kopi Gadjah": 10, "TOP Coffee": 15, "Kopi Liong Bulan": 10, "Golda Coffee": 25, "Kopken RTD": 50, "Space Roastery": 85, "FiberCreme": 40, "First Crack Coffee": 80, "Roemah Koffie": 75, "Max Creamer": 10 },
    { issue: "Daily Convenience", "Unakaffe": 50, "Nescafe": 95, "Kopi Luwak": 90, "Indocafe": 85, "Torabika": 85, "Kopiko": 80, "Caffino": 75, "Kopi Gadjah": 60, "TOP Coffee": 70, "Kopi Liong Bulan": 40, "Golda Coffee": 80, "Kopken RTD": 75, "Space Roastery": 30, "FiberCreme": 60, "First Crack Coffee": 20, "Roemah Koffie": 30, "Max Creamer": 40 },
    { issue: "Organic Word of Mouth", "Unakaffe": 0, "Nescafe": 70, "Kopi Luwak": 50, "Indocafe": 40, "Torabika": 60, "Kopiko": 45, "Caffino": 55, "Kopi Gadjah": 80, "TOP Coffee": 30, "Kopi Liong Bulan": 85, "Golda Coffee": 20, "Kopken RTD": 60, "Space Roastery": 90, "FiberCreme": 30, "First Crack Coffee": 70, "Roemah Koffie": 65, "Max Creamer": 5 },
  ];
  const volumeRows = [
    { issue: "Home Brewing / Equipment", "Unakaffe": 1, "Nescafe": 35, "Kopi Luwak": 0, "Indocafe": 0, "Torabika": 0, "Kopiko": 0, "Caffino": 0, "Kopi Gadjah": 0, "TOP Coffee": 0, "Kopi Liong Bulan": 0, "Golda Coffee": 0, "Kopken RTD": 0, "Space Roastery": 12, "FiberCreme": 0, "First Crack Coffee": 5, "Roemah Koffie": 3, "Max Creamer": 0 },
    { issue: "Gift / Souvenir", "Unakaffe": 1, "Nescafe": 15, "Kopi Luwak": 5, "Indocafe": 2, "Torabika": 0, "Kopiko": 5, "Caffino": 0, "Kopi Gadjah": 0, "TOP Coffee": 0, "Kopi Liong Bulan": 0, "Golda Coffee": 0, "Kopken RTD": 0, "Space Roastery": 2, "FiberCreme": 0, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 },
    { issue: "Mass Consumption", "Unakaffe": 0, "Nescafe": 350, "Kopi Luwak": 190, "Indocafe": 144, "Torabika": 144, "Kopiko": 110, "Caffino": 95, "Kopi Gadjah": 70, "TOP Coffee": 40, "Kopi Liong Bulan": 32, "Golda Coffee": 18, "Kopken RTD": 17, "Space Roastery": 0, "FiberCreme": 9, "First Crack Coffee": 2, "Roemah Koffie": 4, "Max Creamer": 3 },
  ];
  const sovRows = [
    { date: "Feb 13", "Unakaffe": 0, "Nescafe": 50, "Kopi Luwak": 20, "Indocafe": 22, "Torabika": 17, "Kopiko": 11, "Caffino": 9, "Kopi Gadjah": 5, "TOP Coffee": 2, "Kopi Liong Bulan": 7, "Golda Coffee": 1, "Kopken RTD": 3, "Space Roastery": 0, "FiberCreme": 0, "First Crack Coffee": 1, "Roemah Koffie": 0, "Max Creamer": 1 },
    { date: "Feb 14", "Unakaffe": 0, "Nescafe": 85, "Kopi Luwak": 31, "Indocafe": 27, "Torabika": 46, "Kopiko": 8, "Caffino": 11, "Kopi Gadjah": 8, "TOP Coffee": 6, "Kopi Liong Bulan": 1, "Golda Coffee": 2, "Kopken RTD": 0, "Space Roastery": 3, "FiberCreme": 1, "First Crack Coffee": 0, "Roemah Koffie": 0, "Max Creamer": 0 },
    { date: "Feb 15", "Unakaffe": 0, "Nescafe": 60, "Kopi Luwak": 51, "Indocafe": 42, "Torabika": 35, "Kopiko": 20, "Caffino": 6, "Kopi Gadjah": 7, "TOP Coffee": 11, "Kopi Liong Bulan": 4, "Golda Coffee": 2, "Kopken RTD": 0, "Space Roastery": 2, "FiberCreme": 3, "First Crack Coffee": 3, "Roemah Koffie": 0, "Max Creamer": 1 },
    { date: "Feb 16", "Unakaffe": 1, "Nescafe": 65, "Kopi Luwak": 28, "Indocafe": 8, "Torabika": 17, "Kopiko": 17, "Caffino": 25, "Kopi Gadjah": 17, "TOP Coffee": 6, "Kopi Liong Bulan": 2, "Golda Coffee": 5, "Kopken RTD": 4, "Space Roastery": 4, "FiberCreme": 0, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 },
    { date: "Feb 17", "Unakaffe": 0, "Nescafe": 35, "Kopi Luwak": 25, "Indocafe": 20, "Torabika": 14, "Kopiko": 23, "Caffino": 16, "Kopi Gadjah": 18, "TOP Coffee": 4, "Kopi Liong Bulan": 6, "Golda Coffee": 4, "Kopken RTD": 4, "Space Roastery": 0, "FiberCreme": 2, "First Crack Coffee": 2, "Roemah Koffie": 2, "Max Creamer": 0 },
    { date: "Feb 18", "Unakaffe": 0, "Nescafe": 35, "Kopi Luwak": 14, "Indocafe": 8, "Torabika": 11, "Kopiko": 17, "Caffino": 2, "Kopi Gadjah": 4, "TOP Coffee": 4, "Kopi Liong Bulan": 4, "Golda Coffee": 1, "Kopken RTD": 0, "Space Roastery": 4, "FiberCreme": 2, "First Crack Coffee": 0, "Roemah Koffie": 4, "Max Creamer": 0 },
    { date: "Feb 19", "Unakaffe": 0, "Nescafe": 70, "Kopi Luwak": 26, "Indocafe": 19, "Torabika": 4, "Kopiko": 19, "Caffino": 26, "Kopi Gadjah": 11, "TOP Coffee": 7, "Kopi Liong Bulan": 8, "Golda Coffee": 3, "Kopken RTD": 6, "Space Roastery": 1, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 1 },
  ];
  return {
    ...base,
    featureVisibility: {
      statsOverview: true,
      actionRecommendations: true,
      outletSatisfaction: false,
      risksOpportunities: true,
      competitiveAnalysis: true,
      recentInsights: true,
    },
    statsOverview: [
      { id: "1", label: "Average Sentiment", value: "100.0%", description: "Sentiment is artificially high due to the only mention being promotional", icon: "TrendingUp" },
      { id: "2", label: "Critical Issues", value: "1", description: "Severe lack of organic brand awareness", icon: "AlertTriangle" },
      { id: "3", label: "Share of Voice", value: "0.08%", description: "Unakaffe SOV vs 16 External Competitors", icon: "MessageSquare" },
      { id: "4", label: "Conversation Analyzed", value: "1", description: "Total validated Unakaffe mentions across all platforms", icon: "Users" },
    ],
    priorityActions: [
      {
        id: "1",
        priority: "critical",
        title: "Address the 'Ghost Town' Phenomenon",
        description: "There is virtually zero organic conversation surrounding Unakaffe or its capsule machines across Twitter, TikTok, and Instagram in the past week.",
        impact: "High",
        effort: "High",
        recommendation: "Initiate an aggressive micro-influencer seeding campaign. Send Unakaffe machines to home-cafe (home-barista) content creators on TikTok to generate peer-to-peer discussions.",
        category: "Brand Awareness",
        quadrantColor: "red",
        relatedIssues: ["Zero Organic Footprint", "Low Market Penetration"],
        metrics: { mentions: 1, sentiment: 0, trend: "Dead" },
        sourceContent: [
          {
            id: "sc1",
            platform: "instagram",
            author: "@brand_or_retailer",
            content: "As families reunite beneath the glow of lanterns, elevate the celebration with coffee crafted at the touch of your Unakaffe System machine.",
            sentiment: 1,
            timestamp: "2 days ago",
            engagement: { likes: 12, replies: 0, retweets: 0 },
          },
        ],
      },
    ],
    outletSatisfaction: [],
    risks: [
      {
        id: "1",
        title: "Losing the 'Home Cafe' Trend to Competitors",
        description: "While consumers are actively discussing DIY milk coffee and premium beans at home (favoring brands like Fresco or Space Roastery), Unakaffe's capsule system is entirely absent from these modern mixology conversations.",
        severity: "High",
        probability: 75,
        impact: "Market Share",
        trend: "Stagnant",
        supportingContents: 0,
        indicators: [{ label: "Mixology Mentions", value: 0, change: 0 }],
        mitigation: ["Reposition Unakaffe not just as a machine, but as a lifestyle enabler for the 'lazy but premium' Gen-Z/Millennial home barista."],
        sourceContent: [],
      },
    ],
    opportunities: [
      {
        id: "1",
        title: "Untapped Corporate/B2B Gifting Potential",
        description: "The only mention found was related to festive celebrations (Lantern Festival/Imlek). This suggests that the machine is viewed as a premium gifting item rather than a daily personal purchase.",
        potential: "High Margin",
        confidence: 60,
        timeframe: "Seasonal",
        category: "Sales Channel",
        trend: "Seasonal",
        supportingContents: 1,
        metrics: { sentimentScore: 100, marketPotential: 75, reachGrowth: 0 },
        recommendations: ["Develop specific 'Hampers/Gift Bundles' targeting corporate clients or wedding registries to bypass the saturated individual retail market."],
        sourceContent: [
          { id: "o1", platform: "instagram", author: "@brand_or_retailer", content: "As families reunite beneath the glow of lanterns, elevate the celebration with coffee crafted at the touch of your Unakaffe System machine.", sentiment: 1, timestamp: "1 day ago" },
        ],
      },
    ],
    competitiveIssues: [
      {
        id: "1",
        issue: "Invisible in the Capsule/Premium Market",
        yourMentions: 1,
        competitorMedianMentions: 32,
        relativeMentions: -97,
        yourSentiment: 1.0,
        competitorMedianSentiment: 0.3,
        relativeSentiment: 233,
        category: "Awareness",
      },
    ],
    competitiveKeyInsights: [
      {
        id: "1",
        type: "strength",
        title: "Total Domination by Nescafe",
        description: "In the broader ecosystem, Nescafe (400 mentions) completely overshadows Unakaffe. Nescafe's aggressive digital presence leaves no breathing room for Unakaffe's premium capsule narrative to organically surface.",
        bullets: [
          "Nescafe owns the mass mindshare for 'instant' convenience.",
          "Specialty local brands like Space Roastery (14 mentions) have a smaller but significantly more loyal and vocal fanbase than Unakaffe.",
          "Unakaffe needs to decide if it is fighting Nescafe Dolce Gusto (mass premium) or Nespresso (high-end luxury), as currently, it is fighting neither.",
        ],
      },
    ],
    whatsHappeningSentimentTrends: [
      { date: "Feb 13", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 14", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 15", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 16", positive: 1, negative: 0, neutral: 0 },
      { date: "Feb 17", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 18", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 19", positive: 0, negative: 0, neutral: 0 },
    ],
    whatsHappeningKeyEvents: [
      {
        id: "1",
        date: "Feb 16",
        title: "Lantern Festival / Imlek Content",
        description: "A solitary promotional post linking the Unakaffe machine to family gatherings during the Lantern Festival.",
      },
    ],
    whatsHappeningTopTopics: [
      { topic: "Festive Gifting / Imlek", mentions: 1, sentiment: 1 },
      { topic: "Organic Product Review", mentions: 0, sentiment: 0 },
      { topic: "Machine Troubleshooting", mentions: 0, sentiment: 0 },
    ],
    whatsHappeningAITopicAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Absence of Product Utility Discussions",
        description: "There is a complete void of conversations regarding the actual usage, taste of the capsules, or machine maintenance, which are typical lifecycles of coffee machine brands.",
      },
    ],
    whatsHappeningTopicTrendsData: [
      { date: "Feb 13", Gifting: 0, Reviews: 0, Complaints: 0 },
      { date: "Feb 14", Gifting: 0, Reviews: 0, Complaints: 0 },
      { date: "Feb 15", Gifting: 0, Reviews: 0, Complaints: 0 },
      { date: "Feb 16", Gifting: 1, Reviews: 0, Complaints: 0 },
      { date: "Feb 17", Gifting: 0, Reviews: 0, Complaints: 0 },
      { date: "Feb 18", Gifting: 0, Reviews: 0, Complaints: 0 },
      { date: "Feb 19", Gifting: 0, Reviews: 0, Complaints: 0 },
    ],
    whatsHappeningAITrendAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Failed Social Penetration",
        description: "Unakaffe's current social media strategy (or lack thereof) has failed to penetrate the everyday digital lexicon of Indonesian coffee drinkers.",
      },
    ],
    whatsHappeningWordCloud: [
      { text: "unakaffe", weight: 100, sentiment: "positive" },
      { text: "system", weight: 80, sentiment: "positive" },
      { text: "machine", weight: 70, sentiment: "neutral" },
      { text: "lanterns", weight: 50, sentiment: "positive" },
      { text: "celebration", weight: 50, sentiment: "positive" },
      { text: "crafted", weight: 40, sentiment: "positive" },
    ],
    whatsHappeningClusters: [
      {
        id: "1",
        theme: "Seasonal Promotions",
        size: 1,
        sentiment: 1.0,
        trend: "stable",
        keywords: ["reunite", "lanterns", "celebration", "touch"],
      },
    ],
    whatsHappeningHashtags: [
      { id: "1", tag: "#UnakaffeSystem", conversations: 1, likes: 12, comments: 0 },
      { id: "2", tag: "#StartWithUnakaffe", conversations: 1, likes: 12, comments: 0 },
      { id: "3", tag: "#LunarNewYear", conversations: 1, likes: 12, comments: 0 },
    ],
    whatsHappeningAccounts: [
      { id: "1", name: "Unakaffe System", handle: "@unakaffesystem", platform: "instagram", followers: 12000, conversations: 1, likes: 12, replies: 0 },
    ],
    whatsHappeningContents: [
      { id: "1", title: "As families reunite beneath the glow of lanterns, elevate the celebration with coffee crafted...", platform: "instagram", author: "unakaffesystem", likes: 12, comments: 0 },
    ],
    whatsHappeningKOLMatrix: [
      {
        id: "1",
        name: "Brand Account",
        followers: 5000,
        positivity: 100,
        engagement: 10,
        color: "gray",
        category: "Official Broadcaster",
      },
    ],
    whatsHappeningAIKOLAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Need for Home-Barista KOLs",
        description: "Unakaffe desperately needs validation from third-party voices. Sponsoring interior design or 'aesthetic room' creators on TikTok could insert the machine into lifestyle conversations.",
      },
    ],
    whatsHappeningShareOfPlatform: [
      { date: "Feb 13", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 14", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 15", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 16", twitter: 0, youtube: 0, reddit: 0, instagram: 100, facebook: 0, tiktok: 0 },
      { date: "Feb 17", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 18", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 19", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
    ],
    competitiveMatrixItems: [
      { id: "1", name: "Unakaffe", mentions: 1, positivePercentage: 100.0, size: 1, color: "#8B4513" },
      { id: "2", name: "Nescafe", mentions: 400, positivePercentage: 31.8, size: 400, color: "#FF0000" },
      { id: "3", name: "Kopi Luwak", mentions: 195, positivePercentage: 31.8, size: 195, color: "#8B4513" },
      { id: "4", name: "Indocafe", mentions: 146, positivePercentage: 34.2, size: 146, color: "#D2691E" },
      { id: "5", name: "Torabika", mentions: 144, positivePercentage: 42.4, size: 144, color: "#A0522D" },
      { id: "6", name: "Kopiko", mentions: 115, positivePercentage: 5.2, size: 115, color: "#4B3621" },
      { id: "7", name: "Caffino", mentions: 95, positivePercentage: 46.3, size: 95, color: "#8A2BE2" },
      { id: "8", name: "Kopi Gadjah", mentions: 70, positivePercentage: 17.1, size: 70, color: "#555555" },
      { id: "9", name: "TOP Coffee", mentions: 40, positivePercentage: 32.5, size: 40, color: "#FF8C00" },
      { id: "10", name: "Kopi Liong Bulan", mentions: 32, positivePercentage: 12.5, size: 32, color: "#C0C0C0" },
      { id: "11", name: "Golda Coffee", mentions: 18, positivePercentage: 11.1, size: 18, color: "#FFD700" },
      { id: "12", name: "Kopken RTD", mentions: 17, positivePercentage: 52.9, size: 17, color: "#FF1493" },
      { id: "13", name: "Space Roastery", mentions: 14, positivePercentage: 7.1, size: 14, color: "#000000" },
      { id: "14", name: "FiberCreme", mentions: 9, positivePercentage: 55.6, size: 9, color: "#ADD8E6" },
      { id: "15", name: "First Crack Coffee", mentions: 8, positivePercentage: 50.0, size: 8, color: "#A52A2A" },
      { id: "16", name: "Roemah Koffie", mentions: 8, positivePercentage: 12.5, size: 8, color: "#DEB887" },
      { id: "17", name: "Max Creamer", mentions: 3, positivePercentage: 0.0, size: 3, color: "#F5F5DC" },
    ],
    competitiveQuadrantAnalysis: [
      { id: "1", label: "Mass Giants", brands: "Nescafe, Kopi Luwak, Indocafe", note: "High Volume" },
      { id: "2", label: "Niche/Premium", brands: "Space Roastery, First Crack Coffee", note: "Low volume, high organic loyalty" },
      { id: "3", label: "Danger Zone (Invisible)", brands: "Unakaffe, Max Creamer", note: "Near-zero organic conversation" },
    ],
    competitiveSentimentScores: sentimentRows.map((r) => toFullSentimentRow(r as Record<string, number | string>)),
    competitiveVolumeOfMentions: volumeRows.map((r) => toFullVolumeRow(r as Record<string, number | string>)),
    competitiveShareOfVoice: sovRows.map((r) => toShareOfVoiceRowUnakaffe(r as Record<string, number | string>)),
    competitiveBrandLabels: { yourBrand: "Unakaffe", competitorA: "Nescafe", competitorB: "Kopi Luwak", competitorC: "Indocafe", competitorD: "Torabika" },
  };
}

function buildKopiPikopiInitial(base: DashboardContentStore): DashboardContentStore {
  const sentimentRows = [
    { issue: "Taste/Flavor Profile", "Kopi Pikopi": 75, "Nescafe": 56, "Kopi Luwak": 32, "Indocafe": 37, "Torabika": 83, "Kopiko": 68, "Caffino": 80, "Kopi Gadjah": 25, "TOP Coffee": 55, "Kopi Liong Bulan": 15, "Golda Coffee": 60, "Kopken RTD": 75, "Space Roastery": 85, "FiberCreme": 60, "First Crack Coffee": 30, "Roemah Koffie": 38, "Max Creamer": 37 },
    { issue: "Brand Uniqueness", "Kopi Pikopi": 20, "Nescafe": 80, "Kopi Luwak": 70, "Indocafe": 65, "Torabika": 75, "Kopiko": 85, "Caffino": 70, "Kopi Gadjah": 80, "TOP Coffee": 50, "Kopi Liong Bulan": 85, "Golda Coffee": 40, "Kopken RTD": 60, "Space Roastery": 95, "FiberCreme": 70, "First Crack Coffee": 80, "Roemah Koffie": 70, "Max Creamer": 10 },
    { issue: "Value for Money", "Kopi Pikopi": 80, "Nescafe": 46, "Kopi Luwak": 64, "Indocafe": 63, "Torabika": 70, "Kopiko": 65, "Caffino": 65, "Kopi Gadjah": 84, "TOP Coffee": 80, "Kopi Liong Bulan": 75, "Golda Coffee": 70, "Kopken RTD": 45, "Space Roastery": 32, "FiberCreme": 59, "First Crack Coffee": 43, "Roemah Koffie": 50, "Max Creamer": 53 },
  ];
  const volumeRows = [
    { issue: "Standalone Praise", "Kopi Pikopi": 2, "Nescafe": 120, "Kopi Luwak": 60, "Indocafe": 45, "Torabika": 85, "Kopiko": 40, "Caffino": 55, "Kopi Gadjah": 30, "TOP Coffee": 15, "Kopi Liong Bulan": 10, "Golda Coffee": 5, "Kopken RTD": 10, "Space Roastery": 8, "FiberCreme": 2, "First Crack Coffee": 4, "Roemah Koffie": 5, "Max Creamer": 0 },
    { issue: "Aggregated Lists", "Kopi Pikopi": 17, "Nescafe": 180, "Kopi Luwak": 120, "Indocafe": 90, "Torabika": 45, "Kopiko": 65, "Caffino": 35, "Kopi Gadjah": 35, "TOP Coffee": 22, "Kopi Liong Bulan": 20, "Golda Coffee": 12, "Kopken RTD": 5, "Space Roastery": 4, "FiberCreme": 6, "First Crack Coffee": 3, "Roemah Koffie": 2, "Max Creamer": 3 },
    { issue: "Complaints", "Kopi Pikopi": 0, "Nescafe": 25, "Kopi Luwak": 15, "Indocafe": 11, "Torabika": 14, "Kopiko": 10, "Caffino": 5, "Kopi Gadjah": 5, "TOP Coffee": 3, "Kopi Liong Bulan": 2, "Golda Coffee": 1, "Kopken RTD": 2, "Space Roastery": 2, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 },
  ];
  const sovRows = [
    { date: "Feb 13", "Kopi Pikopi": 3, "Nescafe": 60, "Kopi Luwak": 20, "Indocafe": 25, "Torabika": 18, "Kopiko": 15, "Caffino": 11, "Kopi Gadjah": 8, "TOP Coffee": 4, "Kopi Liong Bulan": 5, "Golda Coffee": 2, "Kopken RTD": 4, "Space Roastery": 1, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 },
    { date: "Feb 14", "Kopi Pikopi": 4, "Nescafe": 65, "Kopi Luwak": 35, "Indocafe": 20, "Torabika": 22, "Kopiko": 10, "Caffino": 15, "Kopi Gadjah": 12, "TOP Coffee": 6, "Kopi Liong Bulan": 4, "Golda Coffee": 3, "Kopken RTD": 2, "Space Roastery": 2, "FiberCreme": 2, "First Crack Coffee": 1, "Roemah Koffie": 0, "Max Creamer": 1 },
    { date: "Feb 15", "Kopi Pikopi": 1, "Nescafe": 55, "Kopi Luwak": 40, "Indocafe": 30, "Torabika": 25, "Kopiko": 18, "Caffino": 12, "Kopi Gadjah": 10, "TOP Coffee": 8, "Kopi Liong Bulan": 5, "Golda Coffee": 2, "Kopken RTD": 3, "Space Roastery": 3, "FiberCreme": 1, "First Crack Coffee": 2, "Roemah Koffie": 1, "Max Creamer": 0 },
    { date: "Feb 16", "Kopi Pikopi": 6, "Nescafe": 80, "Kopi Luwak": 30, "Indocafe": 22, "Torabika": 35, "Kopiko": 25, "Caffino": 20, "Kopi Gadjah": 15, "TOP Coffee": 7, "Kopi Liong Bulan": 6, "Golda Coffee": 4, "Kopken RTD": 2, "Space Roastery": 2, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 2, "Max Creamer": 1 },
    { date: "Feb 17", "Kopi Pikopi": 1, "Nescafe": 50, "Kopi Luwak": 25, "Indocafe": 18, "Torabika": 20, "Kopiko": 15, "Caffino": 18, "Kopi Gadjah": 9, "TOP Coffee": 5, "Kopi Liong Bulan": 4, "Golda Coffee": 3, "Kopken RTD": 2, "Space Roastery": 1, "FiberCreme": 2, "First Crack Coffee": 1, "Roemah Koffie": 2, "Max Creamer": 0 },
    { date: "Feb 18", "Kopi Pikopi": 3, "Nescafe": 45, "Kopi Luwak": 20, "Indocafe": 15, "Torabika": 12, "Kopiko": 20, "Caffino": 10, "Kopi Gadjah": 8, "TOP Coffee": 6, "Kopi Liong Bulan": 4, "Golda Coffee": 2, "Kopken RTD": 2, "Space Roastery": 3, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 1 },
    { date: "Feb 19", "Kopi Pikopi": 1, "Nescafe": 45, "Kopi Luwak": 25, "Indocafe": 16, "Torabika": 12, "Kopiko": 12, "Caffino": 9, "Kopi Gadjah": 8, "TOP Coffee": 4, "Kopi Liong Bulan": 4, "Golda Coffee": 2, "Kopken RTD": 2, "Space Roastery": 2, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 },
  ];
  return {
    ...base,
    featureVisibility: {
      statsOverview: true,
      actionRecommendations: true,
      outletSatisfaction: false,
      risksOpportunities: true,
      competitiveAnalysis: true,
      recentInsights: true,
    },
    statsOverview: [
      { id: "1", label: "Average Sentiment", value: "31.6%", description: "Average sentiment score (Driven by organic recommendations in Twitter threads)", icon: "TrendingUp" },
      { id: "2", label: "Critical Issues", value: "0", description: "No critical brand safety or quality issues detected", icon: "AlertTriangle" },
      { id: "3", label: "Share of Voice", value: "1.4%", description: "Pikopi SOV vs 16 External Competitors", icon: "MessageSquare" },
      { id: "4", label: "Conversation Analyzed", value: "19", description: "Total validated Pikopi mentions across all platforms", icon: "Users" },
    ],
    priorityActions: [
      {
        id: "1",
        priority: "medium",
        title: "Amplify Inclusion in the 'Coffee Tier List' Trend",
        description: "Pikopi is repeatedly mentioned as part of a viral Twitter thread where users list all the sachet coffees they consume to determine their 'social tier' or 'coffee level'.",
        impact: "Medium",
        effort: "Low",
        recommendation: "Have the official account reply to these tier-list threads playfully, claiming that drinking Pikopi places them in the 'Smart & Tasty' tier.",
        category: "Brand Engagement",
        quadrantColor: "yellow",
        relatedIssues: ["Low Standalone Visibility", "Grouped Mentions"],
        metrics: { mentions: 14, sentiment: 0, trend: "Trending" },
        sourceContent: [
          {
            id: "sc1",
            platform: "twitter",
            author: "@user",
            content: "Gue minum ini levelnya apa? Gue juga minum luwak white coffee, kopi gadjah, indocafe, good day, neo, top, abc, kopiko, pikopi.",
            sentiment: 0,
            timestamp: "2 days ago",
            engagement: { likes: 56, replies: 14, retweets: 0 },
          },
        ],
      },
    ],
    outletSatisfaction: [],
    risks: [
      {
        id: "1",
        title: "Lack of Standalone Identity",
        description: "Pikopi is almost entirely mentioned in 'lists' alongside 5 to 10 other brands. There is a distinct lack of standalone tweets where a user expresses an isolated craving specifically for Pikopi.",
        severity: "High",
        probability: 75,
        impact: "Brand Recall",
        trend: "Stagnant",
        supportingContents: 1,
        indicators: [{ label: "Isolated Mentions", value: 0, change: 0 }],
        mitigation: ["Develop a strong, unique product USP (Unique Selling Proposition) and launch a hero campaign that differentiates Pikopi from being just 'another brand in the list'."],
        sourceContent: [
          { id: "r1", platform: "twitter", author: "@user", content: "white coffee luwak enak top kopi capuchino enak neo caramel macchiato enak satu lagi pikopi enak", sentiment: 0.8, timestamp: "1 day ago" },
        ],
      },
    ],
    opportunities: [
      {
        id: "1",
        title: "Word-of-Mouth Endorsements for Flavor",
        description: "When users do single out Pikopi within these lists, they explicitly label it as 'enak' (tasty), specifically equating its flavor quality to more established brands like Torabika and Caffino.",
        potential: "Trial Generation",
        confidence: 60,
        timeframe: "Medium Term",
        category: "Consumer Sentiment",
        trend: "Stable",
        supportingContents: 1,
        metrics: { sentimentScore: 80, marketPotential: 70, reachGrowth: 5 },
        recommendations: ["Highlight blind taste tests in future content, proving that Pikopi's taste holds up or beats market leaders in the sweet/flavored segment."],
        sourceContent: [
          { id: "o1", platform: "twitter", author: "@user", content: "...satu lagi pikopi enak", sentiment: 0.8, timestamp: "1 day ago" },
        ],
      },
    ],
    competitiveIssues: [
      {
        id: "1",
        issue: "Drowned in the 'Mass Product' Noise",
        yourMentions: 19,
        competitorMedianMentions: 70,
        relativeMentions: -72,
        yourSentiment: 0.3,
        competitorMedianSentiment: 0.3,
        relativeSentiment: 0,
        category: "Brand Awareness",
      },
    ],
    competitiveKeyInsights: [
      {
        id: "1",
        type: "strength",
        title: "Struggling for the Spotlight",
        description: "In the mass market tier, Pikopi (19) is severely overshadowed by Nescafe (400) and Torabika (144). It currently sits in the same visibility tier as Golda Coffee (18) and Kopken RTD (17).",
        bullets: [
          "Pikopi benefits from halo effects when users mention Torabika or Indocafe, often being tagged along in the same breath.",
          "Unlike Caffino (95) which drives standalone conversations about its strength/taste, Pikopi lacks an anchor attribute in digital discussions.",
        ],
      },
    ],
    whatsHappeningSentimentTrends: [
      { date: "Feb 13", positive: 1, negative: 0, neutral: 2 },
      { date: "Feb 14", positive: 1, negative: 0, neutral: 3 },
      { date: "Feb 15", positive: 0, negative: 0, neutral: 1 },
      { date: "Feb 16", positive: 2, negative: 0, neutral: 4 },
      { date: "Feb 17", positive: 0, negative: 0, neutral: 1 },
      { date: "Feb 18", positive: 1, negative: 0, neutral: 2 },
      { date: "Feb 19", positive: 1, negative: 0, neutral: 0 },
    ],
    whatsHappeningKeyEvents: [
      {
        id: "1",
        date: "Feb 16",
        title: "The Sachet Tier List Trend",
        description: "Pikopi experienced its highest mention frequency as users aggregated it into a viral thread discussing 'What level of coffee drinker are you?'",
      },
    ],
    whatsHappeningTopTopics: [
      { topic: "Coffee Tier Lists / Level Minum Kopi", mentions: 14, sentiment: 0.4 },
      { topic: "Flavor Endorsements (Enak)", mentions: 5, sentiment: 1 },
    ],
    whatsHappeningAITopicAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Pikopi as a 'List-Filler'",
        description: "The AI detects that the majority of Pikopi's mentions are syntactically tied to lists containing 5+ other coffee brands, indicating low solitary brand recall.",
      },
    ],
    whatsHappeningTopicTrendsData: [
      { date: "Feb 13", TierList: 3, Flavor: 0 },
      { date: "Feb 14", TierList: 3, Flavor: 1 },
      { date: "Feb 15", TierList: 1, Flavor: 0 },
      { date: "Feb 16", TierList: 4, Flavor: 2 },
      { date: "Feb 17", TierList: 1, Flavor: 0 },
      { date: "Feb 18", TierList: 2, Flavor: 1 },
      { date: "Feb 19", TierList: 0, Flavor: 1 },
    ],
    whatsHappeningAITrendAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Dependent on Viral Threads",
        description: "Pikopi's digital presence this week is almost entirely reliant on a single viral thread structure originating from one user (@ndiscoklat).",
      },
    ],
    whatsHappeningWordCloud: [
      { text: "pikopi", weight: 90, sentiment: "positive" },
      { text: "levelnya", weight: 85, sentiment: "neutral" },
      { text: "minum", weight: 80, sentiment: "neutral" },
      { text: "enak", weight: 55, sentiment: "positive" },
      { text: "luwak", weight: 40, sentiment: "neutral" },
      { text: "indocafe", weight: 35, sentiment: "neutral" },
      { text: "strong", weight: 20, sentiment: "positive" },
    ],
    whatsHappeningClusters: [
      {
        id: "1",
        theme: "Brand Listing / Comparisons",
        size: 18,
        sentiment: 0.5,
        trend: "up",
        keywords: ["levelnya", "minum", "indocafe", "semua"],
      },
    ],
    whatsHappeningHashtags: [
      { id: "1", tag: "#KopiPikopi", conversations: 0, likes: 0, comments: 0 },
    ],
    whatsHappeningAccounts: [
      { id: "1", name: "ndiscoklat", handle: "@ndiscoklat", platform: "twitter", followers: 12000, conversations: 1, likes: 4500, replies: 320 },
      { id: "2", name: "ngopi_latte", handle: "@ngopi_latte", platform: "twitter", followers: 1500, conversations: 1, likes: 2, replies: 1 },
    ],
    whatsHappeningContents: [
      { id: "1", title: "Gue minum ini levelnya apa? Gue juga minum luwak white coffee, kopi gadjah, indocafe, good day, neo, top, abc, kopiko, pikopi.", platform: "twitter", author: "ndiscoklat", likes: 4500, comments: 320 },
      { id: "2", title: "@ndiscoklat Caffino itu rasany strong... white coffee luwak enak top kopi capuchino enak neo caramel macchiato enak satu lagi pikopi enak", platform: "twitter", author: "OrganicUser", likes: 1, comments: 0 },
      { id: "3", title: "@ngopi_latte Kalau gula aren kebanyakan sukanya di top coffee atau pikopi kak", platform: "twitter", author: "OrganicUser", likes: 0, comments: 0 },
    ],
    whatsHappeningKOLMatrix: [
      {
        id: "1",
        name: "ndiscoklat",
        followers: 12000,
        positivity: 60,
        engagement: 95,
        color: "yellow",
        category: "Organic Trendsetter",
      },
    ],
    whatsHappeningAIKOLAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Absence of Core Advocates",
        description: "Unlike brands with dedicated fandoms or loyalists, Pikopi currently has no identifiable digital advocates or KOLs pushing its specific narrative.",
      },
    ],
    whatsHappeningShareOfPlatform: [
      { date: "Feb 13", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 14", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 15", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 16", twitter: 85, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 15 },
      { date: "Feb 17", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 18", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 19", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
    ],
    competitiveMatrixItems: [
      { id: "1", name: "Kopi Pikopi", mentions: 19, positivePercentage: 31.6, size: 19, color: "#00BFFF" },
      { id: "2", name: "Nescafe", mentions: 400, positivePercentage: 31.8, size: 400, color: "#FF0000" },
      { id: "3", name: "Kopi Luwak", mentions: 195, positivePercentage: 31.8, size: 195, color: "#8B4513" },
      { id: "4", name: "Indocafe", mentions: 146, positivePercentage: 34.2, size: 146, color: "#D2691E" },
      { id: "5", name: "Torabika", mentions: 144, positivePercentage: 42.4, size: 144, color: "#A0522D" },
      { id: "6", name: "Kopiko", mentions: 115, positivePercentage: 5.2, size: 115, color: "#4B3621" },
      { id: "7", name: "Caffino", mentions: 95, positivePercentage: 46.3, size: 95, color: "#8A2BE2" },
      { id: "8", name: "Kopi Gadjah", mentions: 70, positivePercentage: 17.1, size: 70, color: "#555555" },
      { id: "9", name: "TOP Coffee", mentions: 40, positivePercentage: 32.5, size: 40, color: "#FF8C00" },
      { id: "10", name: "Kopi Liong Bulan", mentions: 32, positivePercentage: 12.5, size: 32, color: "#C0C0C0" },
      { id: "11", name: "Golda Coffee", mentions: 18, positivePercentage: 11.1, size: 18, color: "#FFD700" },
      { id: "12", name: "Kopken RTD", mentions: 17, positivePercentage: 52.9, size: 17, color: "#FF1493" },
      { id: "13", name: "Space Roastery", mentions: 14, positivePercentage: 7.1, size: 14, color: "#000000" },
      { id: "14", name: "FiberCreme", mentions: 9, positivePercentage: 55.6, size: 9, color: "#ADD8E6" },
      { id: "15", name: "First Crack Coffee", mentions: 8, positivePercentage: 50.0, size: 8, color: "#A52A2A" },
      { id: "16", name: "Roemah Koffie", mentions: 8, positivePercentage: 12.5, size: 8, color: "#DEB887" },
      { id: "17", name: "Max Creamer", mentions: 3, positivePercentage: 0.0, size: 3, color: "#F5F5DC" },
    ],
    competitiveQuadrantAnalysis: [
      { id: "1", label: "Market Leaders", brands: "Nescafe, Kopi Luwak, Indocafe", note: "High Volume, High Baseline Visibility" },
      { id: "2", label: "Mid-Tier Flavor Fighters", brands: "Torabika, Caffino, TOP Coffee", note: "Strong standalone product identity" },
      { id: "3", label: "Low Visibility Group", brands: "Kopi Pikopi, Golda Coffee, Kopken RTD", note: "Struggling for solitary mentions" },
    ],
    competitiveSentimentScores: sentimentRows.map((r) => toFullSentimentRow(r as Record<string, number | string>)),
    competitiveVolumeOfMentions: volumeRows.map((r) => toFullVolumeRow(r as Record<string, number | string>)),
    competitiveShareOfVoice: sovRows.map((r) => toShareOfVoiceRowPikopi(r as Record<string, number | string>)),
    competitiveBrandLabels: { yourBrand: "Kopi Pikopi", competitorA: "Nescafe", competitorB: "Kopi Luwak", competitorC: "Indocafe", competitorD: "Torabika" },
  };
}

function buildKopiYaInitial(base: DashboardContentStore): DashboardContentStore {
  const sentimentRows = [
    { issue: "Brand Recall", "Kopi YA": 0, "Nescafe": 95, "Kopi Luwak": 90, "Indocafe": 88, "Torabika": 85, "Kopiko": 80, "Caffino": 75, "Kopi Gadjah": 65, "TOP Coffee": 70, "Kopi Liong Bulan": 40, "Golda Coffee": 75, "Kopken RTD": 70, "Space Roastery": 80, "FiberCreme": 85, "First Crack Coffee": 80, "Roemah Koffie": 75, "Max Creamer": 10 },
    { issue: "Flavor Praise", "Kopi YA": 0, "Nescafe": 56, "Kopi Luwak": 32, "Indocafe": 37, "Torabika": 83, "Kopiko": 68, "Caffino": 80, "Kopi Gadjah": 25, "TOP Coffee": 55, "Kopi Liong Bulan": 15, "Golda Coffee": 60, "Kopken RTD": 75, "Space Roastery": 85, "FiberCreme": 60, "First Crack Coffee": 30, "Roemah Koffie": 38, "Max Creamer": 37 },
    { issue: "Daily Integration", "Kopi YA": 0, "Nescafe": 80, "Kopi Luwak": 70, "Indocafe": 65, "Torabika": 75, "Kopiko": 85, "Caffino": 70, "Kopi Gadjah": 80, "TOP Coffee": 50, "Kopi Liong Bulan": 85, "Golda Coffee": 40, "Kopken RTD": 60, "Space Roastery": 95, "FiberCreme": 70, "First Crack Coffee": 80, "Roemah Koffie": 70, "Max Creamer": 10 },
  ];
  const volumeRows = [
    { issue: "Standalone Chat", "Kopi YA": 0, "Nescafe": 250, "Kopi Luwak": 140, "Indocafe": 110, "Torabika": 100, "Kopiko": 85, "Caffino": 60, "Kopi Gadjah": 50, "TOP Coffee": 25, "Kopi Liong Bulan": 25, "Golda Coffee": 10, "Kopken RTD": 10, "Space Roastery": 8, "FiberCreme": 6, "First Crack Coffee": 5, "Roemah Koffie": 5, "Max Creamer": 2 },
    { issue: "Grouped Lists", "Kopi YA": 0, "Nescafe": 150, "Kopi Luwak": 55, "Indocafe": 36, "Torabika": 44, "Kopiko": 30, "Caffino": 35, "Kopi Gadjah": 20, "TOP Coffee": 15, "Kopi Liong Bulan": 7, "Golda Coffee": 8, "Kopken RTD": 7, "Space Roastery": 6, "FiberCreme": 3, "First Crack Coffee": 3, "Roemah Koffie": 3, "Max Creamer": 1 },
  ];
  const sovRows = [
    { date: "Feb 13", "Kopi YA": 0, "Nescafe": 50, "Kopi Luwak": 20, "Indocafe": 22, "Torabika": 17, "Kopiko": 11, "Caffino": 9, "Kopi Gadjah": 5, "TOP Coffee": 2, "Kopi Liong Bulan": 7, "Golda Coffee": 1, "Kopken RTD": 3, "Space Roastery": 0, "FiberCreme": 0, "First Crack Coffee": 1, "Roemah Koffie": 0, "Max Creamer": 1 },
    { date: "Feb 14", "Kopi YA": 0, "Nescafe": 85, "Kopi Luwak": 31, "Indocafe": 27, "Torabika": 46, "Kopiko": 8, "Caffino": 11, "Kopi Gadjah": 8, "TOP Coffee": 6, "Kopi Liong Bulan": 1, "Golda Coffee": 2, "Kopken RTD": 0, "Space Roastery": 3, "FiberCreme": 1, "First Crack Coffee": 0, "Roemah Koffie": 0, "Max Creamer": 0 },
    { date: "Feb 15", "Kopi YA": 0, "Nescafe": 60, "Kopi Luwak": 51, "Indocafe": 42, "Torabika": 35, "Kopiko": 20, "Caffino": 6, "Kopi Gadjah": 7, "TOP Coffee": 11, "Kopi Liong Bulan": 4, "Golda Coffee": 2, "Kopken RTD": 0, "Space Roastery": 2, "FiberCreme": 3, "First Crack Coffee": 3, "Roemah Koffie": 0, "Max Creamer": 1 },
    { date: "Feb 16", "Kopi YA": 0, "Nescafe": 65, "Kopi Luwak": 28, "Indocafe": 8, "Torabika": 17, "Kopiko": 17, "Caffino": 25, "Kopi Gadjah": 17, "TOP Coffee": 6, "Kopi Liong Bulan": 2, "Golda Coffee": 5, "Kopken RTD": 4, "Space Roastery": 4, "FiberCreme": 0, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 },
    { date: "Feb 17", "Kopi YA": 0, "Nescafe": 35, "Kopi Luwak": 25, "Indocafe": 20, "Torabika": 14, "Kopiko": 23, "Caffino": 16, "Kopi Gadjah": 18, "TOP Coffee": 4, "Kopi Liong Bulan": 6, "Golda Coffee": 4, "Kopken RTD": 4, "Space Roastery": 0, "FiberCreme": 2, "First Crack Coffee": 2, "Roemah Koffie": 2, "Max Creamer": 0 },
    { date: "Feb 18", "Kopi YA": 0, "Nescafe": 35, "Kopi Luwak": 14, "Indocafe": 8, "Torabika": 11, "Kopiko": 17, "Caffino": 2, "Kopi Gadjah": 4, "TOP Coffee": 4, "Kopi Liong Bulan": 4, "Golda Coffee": 1, "Kopken RTD": 0, "Space Roastery": 4, "FiberCreme": 2, "First Crack Coffee": 0, "Roemah Koffie": 4, "Max Creamer": 0 },
    { date: "Feb 19", "Kopi YA": 0, "Nescafe": 70, "Kopi Luwak": 26, "Indocafe": 19, "Torabika": 4, "Kopiko": 19, "Caffino": 26, "Kopi Gadjah": 11, "TOP Coffee": 7, "Kopi Liong Bulan": 8, "Golda Coffee": 3, "Kopken RTD": 6, "Space Roastery": 1, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 1 },
  ];
  return {
    ...base,
    featureVisibility: {
      statsOverview: true,
      actionRecommendations: true,
      outletSatisfaction: false,
      risksOpportunities: true,
      competitiveAnalysis: true,
      recentInsights: true,
    },
    statsOverview: [
      { id: "1", label: "Average Sentiment", value: "0.0%", description: "Insufficient data to calculate sentiment", icon: "TrendingUp" },
      { id: "2", label: "Critical Issues", value: "1", description: "Total absence of brand presence in digital conversations", icon: "AlertTriangle" },
      { id: "3", label: "Share of Voice", value: "0.0%", description: "Kopi YA SOV vs 16 External Competitors", icon: "MessageSquare" },
      { id: "4", label: "Conversation Analyzed", value: "0", description: "Total validated Kopi YA mentions across all platforms", icon: "Users" },
    ],
    priorityActions: [
      {
        id: "1",
        priority: "critical",
        title: "Emergency Brand Re-Activation Required",
        description: "The AI detected exactly 0 organic and 0 promotional mentions for Kopi YA in the past week. The brand is completely invisible in the current mass market ecosystem.",
        impact: "High",
        effort: "High",
        recommendation: "Launch a massive disruptive sampling campaign or create an unmistakable digital hashtag (e.g., #IniKopiYA) to differentiate the brand name from common daily vocabulary ('minum kopi, ya?').",
        category: "Brand Awareness",
        quadrantColor: "red",
        relatedIssues: ["Zero Share of Voice", "Naming Confusion"],
        metrics: { mentions: 0, sentiment: 0, trend: "Dead" },
        sourceContent: [],
      },
    ],
    outletSatisfaction: [],
    risks: [
      {
        id: "1",
        title: "Brand Name SEO/Searchability Issue",
        description: "The name 'Kopi YA' naturally blends into everyday Indonesian conversational syntax ('kopi ya'). This makes it nearly impossible for organic word-of-mouth to be tracked or to stand out as a distinct product entity without strong visual aids.",
        severity: "High",
        probability: 75,
        impact: "Digital Marketing",
        trend: "Persistent",
        supportingContents: 1,
        indicators: [{ label: "False Positives", value: 43, change: 0 }],
        mitigation: ["Always pair the brand name with a specific keyword in all marketing materials (e.g., 'Kopi YA! Sachet' or 'Brand Kopi YA')."],
        sourceContent: [
          { id: "r1", platform: "twitter", author: "@user", content: "jangan terlalu banyak kopi ya kak [Non-Brand Example]", sentiment: 0, timestamp: "1 day ago" },
        ],
      },
    ],
    opportunities: [
      {
        id: "1",
        title: "Blank Canvas for Re-branding",
        description: "Having zero negative chatter means there is no existing consumer prejudice or 'baggage' (unlike Torabika or Indocafe which face occasional 'gastric acid' complaints). Kopi YA has a completely blank slate.",
        potential: "High Pivot Value",
        confidence: 60,
        timeframe: "Long Term",
        category: "Brand Strategy",
        trend: "Stagnant",
        supportingContents: 0,
        metrics: { sentimentScore: 0, marketPotential: 70, reachGrowth: 0 },
        recommendations: ["Position Kopi YA with a completely new angle (e.g., 'The only stomach-safe budget coffee') and flood TikTok to build a fresh identity from scratch."],
        sourceContent: [],
      },
    ],
    competitiveIssues: [
      {
        id: "1",
        issue: "Complete Market Eclipse",
        yourMentions: 0,
        competitorMedianMentions: 70,
        relativeMentions: -100,
        yourSentiment: 0.0,
        competitorMedianSentiment: 0.34,
        relativeSentiment: -100,
        category: "Awareness",
      },
    ],
    competitiveKeyInsights: [
      {
        id: "1",
        type: "strength",
        title: "Total Domination by Mass Market Incumbents",
        description: "While Nescafe (400), Kopi Luwak (195), and Torabika (144) control the high-volume daily consumption narrative, Kopi YA fails to capture even the micro-niche segments occupied by Max Creamer (3) or Roemah Koffie (8).",
        bullets: [
          "Consumers list up to 10 mass-market brands in 'Tier List' threads (Kopiko, Caffino, TOP Coffee), but Kopi YA is never recalled.",
          "Immediate intervention is required to generate even baseline (10-20 mentions) digital trial awareness.",
        ],
      },
    ],
    whatsHappeningSentimentTrends: [
      { date: "Feb 13", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 14", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 15", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 16", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 17", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 18", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 19", positive: 0, negative: 0, neutral: 0 },
    ],
    whatsHappeningKeyEvents: [
      {
        id: "1",
        date: "Feb 19",
        title: "No Events Detected",
        description: "No significant campaigns, viral threads, or promotions linked to Kopi YA were found in the monitored timeframe.",
      },
    ],
    whatsHappeningTopTopics: [
      { topic: "N/A", mentions: 0, sentiment: 0 },
    ],
    whatsHappeningAITopicAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Data Void",
        description: "The AI cannot process topical trends for Kopi YA as the dataset yielded exactly zero valid matches for the brand.",
      },
    ],
    whatsHappeningTopicTrendsData: [
      { date: "Feb 13", BrandChatter: 0 },
      { date: "Feb 14", BrandChatter: 0 },
      { date: "Feb 15", BrandChatter: 0 },
      { date: "Feb 16", BrandChatter: 0 },
      { date: "Feb 17", BrandChatter: 0 },
      { date: "Feb 18", BrandChatter: 0 },
      { date: "Feb 19", BrandChatter: 0 },
    ],
    whatsHappeningAITrendAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Invisible Brand Status",
        description: "Kopi YA is currently operating as a 'ghost brand' in the digital landscape, with no organic advocates or active corporate seeding.",
      },
    ],
    whatsHappeningWordCloud: [
      { text: "no_data", weight: 100, sentiment: "neutral" },
    ],
    whatsHappeningClusters: [
      {
        id: "1",
        theme: "No Conversations",
        size: 0,
        sentiment: 0,
        trend: "stable",
        keywords: ["none"],
      },
    ],
    whatsHappeningHashtags: [],
    whatsHappeningAccounts: [],
    whatsHappeningContents: [],
    whatsHappeningKOLMatrix: [],
    whatsHappeningAIKOLAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Zero KOL Utilization",
        description: "There is no evidence of Key Opinion Leaders, micro-influencers, or even bot networks pushing the Kopi YA brand name.",
      },
    ],
    whatsHappeningShareOfPlatform: [
      { date: "Feb 13", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 14", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 15", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 16", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 17", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 18", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 19", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
    ],
    competitiveMatrixItems: [
      { id: "1", name: "Kopi YA", mentions: 0, positivePercentage: 0.0, size: 0, color: "#808080" },
      { id: "2", name: "Nescafe", mentions: 400, positivePercentage: 31.8, size: 400, color: "#FF0000" },
      { id: "3", name: "Kopi Luwak", mentions: 195, positivePercentage: 31.8, size: 195, color: "#8B4513" },
      { id: "4", name: "Indocafe", mentions: 146, positivePercentage: 34.2, size: 146, color: "#D2691E" },
      { id: "5", name: "Torabika", mentions: 144, positivePercentage: 42.4, size: 144, color: "#A0522D" },
      { id: "6", name: "Kopiko", mentions: 115, positivePercentage: 5.2, size: 115, color: "#4B3621" },
      { id: "7", name: "Caffino", mentions: 95, positivePercentage: 46.3, size: 95, color: "#8A2BE2" },
      { id: "8", name: "Kopi Gadjah", mentions: 70, positivePercentage: 17.1, size: 70, color: "#555555" },
      { id: "9", name: "TOP Coffee", mentions: 40, positivePercentage: 32.5, size: 40, color: "#FF8C00" },
      { id: "10", name: "Kopi Liong Bulan", mentions: 32, positivePercentage: 12.5, size: 32, color: "#C0C0C0" },
      { id: "11", name: "Golda Coffee", mentions: 18, positivePercentage: 11.1, size: 18, color: "#FFD700" },
      { id: "12", name: "Kopken RTD", mentions: 17, positivePercentage: 52.9, size: 17, color: "#FF1493" },
      { id: "13", name: "Space Roastery", mentions: 14, positivePercentage: 7.1, size: 14, color: "#000000" },
      { id: "14", name: "FiberCreme", mentions: 9, positivePercentage: 55.6, size: 9, color: "#ADD8E6" },
      { id: "15", name: "First Crack Coffee", mentions: 8, positivePercentage: 50.0, size: 8, color: "#A52A2A" },
      { id: "16", name: "Roemah Koffie", mentions: 8, positivePercentage: 12.5, size: 8, color: "#DEB887" },
      { id: "17", name: "Max Creamer", mentions: 3, positivePercentage: 0.0, size: 3, color: "#F5F5DC" },
    ],
    competitiveQuadrantAnalysis: [
      { id: "1", label: "Market Leaders", brands: "Nescafe, Kopi Luwak, Indocafe", note: "High Volume" },
      { id: "2", label: "Mid-Tier Contenders", brands: "Torabika, Caffino, Kopiko, Kopi Gadjah", note: "Strong flavor debates" },
      { id: "3", label: "Danger Zone (Invisible)", brands: "Kopi YA, Max Creamer", note: "Zero to extremely low awareness" },
    ],
    competitiveSentimentScores: sentimentRows.map((r) => toFullSentimentRow(r as Record<string, number | string>)),
    competitiveVolumeOfMentions: volumeRows.map((r) => toFullVolumeRow(r as Record<string, number | string>)),
    competitiveShareOfVoice: sovRows.map((r) => toShareOfVoiceRowYa(r as Record<string, number | string>)),
    competitiveBrandLabels: { yourBrand: "Kopi YA", competitorA: "Nescafe", competitorB: "Kopi Luwak", competitorC: "Indocafe", competitorD: "Torabika" },
  };
}

function buildSantosJayaAbadiInitial(base: DashboardContentStore): DashboardContentStore {
  const sentimentRows = [
    { issue: "Brand Trust & Reputation", "PT Santos Jaya Abadi": 80, "Nescafe": 56, "Kopi Luwak": 32, "Indocafe": 37, "Torabika": 83, "Kopiko": 68, "Caffino": 80, "Kopi Gadjah": 25, "TOP Coffee": 55, "Kopi Liong Bulan": 15, "Golda Coffee": 60, "Kopken RTD": 75, "Space Roastery": 85, "FiberCreme": 60, "First Crack Coffee": 30, "Roemah Koffie": 38, "Max Creamer": 37 },
    { issue: "Digital Presence / PR", "PT Santos Jaya Abadi": 65, "Nescafe": 80, "Kopi Luwak": 70, "Indocafe": 65, "Torabika": 75, "Kopiko": 85, "Caffino": 70, "Kopi Gadjah": 80, "TOP Coffee": 50, "Kopi Liong Bulan": 85, "Golda Coffee": 40, "Kopken RTD": 60, "Space Roastery": 95, "FiberCreme": 70, "First Crack Coffee": 80, "Roemah Koffie": 70, "Max Creamer": 10 },
    { issue: "Organic Consumer Engagement", "PT Santos Jaya Abadi": 10, "Nescafe": 46, "Kopi Luwak": 64, "Indocafe": 63, "Torabika": 70, "Kopiko": 65, "Caffino": 65, "Kopi Gadjah": 84, "TOP Coffee": 80, "Kopi Liong Bulan": 75, "Golda Coffee": 70, "Kopken RTD": 45, "Space Roastery": 32, "FiberCreme": 59, "First Crack Coffee": 43, "Roemah Koffie": 50, "Max Creamer": 53 },
  ];
  const volumeRows = [
    { issue: "Corporate PR & HR", "PT Santos Jaya Abadi": 11, "Nescafe": 5, "Kopi Luwak": 2, "Indocafe": 0, "Torabika": 3, "Kopiko": 2, "Caffino": 1, "Kopi Gadjah": 0, "TOP Coffee": 0, "Kopi Liong Bulan": 0, "Golda Coffee": 0, "Kopken RTD": 2, "Space Roastery": 1, "FiberCreme": 0, "First Crack Coffee": 0, "Roemah Koffie": 0, "Max Creamer": 0 },
    { issue: "Daily Consumption", "PT Santos Jaya Abadi": 0, "Nescafe": 250, "Kopi Luwak": 140, "Indocafe": 110, "Torabika": 100, "Kopiko": 85, "Caffino": 60, "Kopi Gadjah": 50, "TOP Coffee": 25, "Kopi Liong Bulan": 25, "Golda Coffee": 10, "Kopken RTD": 10, "Space Roastery": 8, "FiberCreme": 6, "First Crack Coffee": 5, "Roemah Koffie": 5, "Max Creamer": 2 },
    { issue: "Promo & Marketing", "PT Santos Jaya Abadi": 0, "Nescafe": 145, "Kopi Luwak": 53, "Indocafe": 36, "Torabika": 41, "Kopiko": 28, "Caffino": 34, "Kopi Gadjah": 20, "TOP Coffee": 15, "Kopi Liong Bulan": 7, "Golda Coffee": 8, "Kopken RTD": 5, "Space Roastery": 5, "FiberCreme": 3, "First Crack Coffee": 3, "Roemah Koffie": 3, "Max Creamer": 1 },
  ];
  const sovRows = [
    { date: "Feb 13", "PT Santos Jaya Abadi": 2, "Nescafe": 50, "Kopi Luwak": 20, "Indocafe": 22, "Torabika": 17, "Kopiko": 11, "Caffino": 9, "Kopi Gadjah": 5, "TOP Coffee": 2, "Kopi Liong Bulan": 7, "Golda Coffee": 1, "Kopken RTD": 3, "Space Roastery": 0, "FiberCreme": 0, "First Crack Coffee": 1, "Roemah Koffie": 0, "Max Creamer": 1 },
    { date: "Feb 14", "PT Santos Jaya Abadi": 2, "Nescafe": 85, "Kopi Luwak": 31, "Indocafe": 27, "Torabika": 46, "Kopiko": 8, "Caffino": 11, "Kopi Gadjah": 8, "TOP Coffee": 6, "Kopi Liong Bulan": 1, "Golda Coffee": 2, "Kopken RTD": 0, "Space Roastery": 3, "FiberCreme": 1, "First Crack Coffee": 0, "Roemah Koffie": 0, "Max Creamer": 0 },
    { date: "Feb 15", "PT Santos Jaya Abadi": 3, "Nescafe": 60, "Kopi Luwak": 51, "Indocafe": 42, "Torabika": 35, "Kopiko": 20, "Caffino": 6, "Kopi Gadjah": 7, "TOP Coffee": 11, "Kopi Liong Bulan": 4, "Golda Coffee": 2, "Kopken RTD": 0, "Space Roastery": 2, "FiberCreme": 3, "First Crack Coffee": 3, "Roemah Koffie": 0, "Max Creamer": 1 },
    { date: "Feb 16", "PT Santos Jaya Abadi": 2, "Nescafe": 65, "Kopi Luwak": 28, "Indocafe": 8, "Torabika": 17, "Kopiko": 17, "Caffino": 25, "Kopi Gadjah": 17, "TOP Coffee": 6, "Kopi Liong Bulan": 2, "Golda Coffee": 5, "Kopken RTD": 4, "Space Roastery": 4, "FiberCreme": 0, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 },
    { date: "Feb 17", "PT Santos Jaya Abadi": 0, "Nescafe": 35, "Kopi Luwak": 25, "Indocafe": 20, "Torabika": 14, "Kopiko": 23, "Caffino": 16, "Kopi Gadjah": 18, "TOP Coffee": 4, "Kopi Liong Bulan": 6, "Golda Coffee": 4, "Kopken RTD": 4, "Space Roastery": 0, "FiberCreme": 2, "First Crack Coffee": 2, "Roemah Koffie": 2, "Max Creamer": 0 },
    { date: "Feb 18", "PT Santos Jaya Abadi": 1, "Nescafe": 35, "Kopi Luwak": 14, "Indocafe": 8, "Torabika": 11, "Kopiko": 17, "Caffino": 2, "Kopi Gadjah": 4, "TOP Coffee": 4, "Kopi Liong Bulan": 4, "Golda Coffee": 1, "Kopken RTD": 0, "Space Roastery": 4, "FiberCreme": 2, "First Crack Coffee": 0, "Roemah Koffie": 4, "Max Creamer": 0 },
    { date: "Feb 19", "PT Santos Jaya Abadi": 1, "Nescafe": 70, "Kopi Luwak": 26, "Indocafe": 19, "Torabika": 4, "Kopiko": 19, "Caffino": 26, "Kopi Gadjah": 11, "TOP Coffee": 7, "Kopi Liong Bulan": 8, "Golda Coffee": 3, "Kopken RTD": 6, "Space Roastery": 1, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 1 },
  ];
  return {
    ...base,
    featureVisibility: {
      statsOverview: true,
      actionRecommendations: true,
      outletSatisfaction: false,
      risksOpportunities: true,
      competitiveAnalysis: true,
      recentInsights: true,
    },
    statsOverview: [
      { id: "1", label: "Average Sentiment", value: "45.4%", description: "Average corporate sentiment (Driven by employer branding & scam alerts)", icon: "TrendingUp" },
      { id: "2", label: "Critical Issues", value: "1", description: "Circulation of fake giveaways / AI scam videos using the corporate name", icon: "AlertTriangle" },
      { id: "3", label: "Share of Voice", value: "0.8%", description: "Corporate SOV vs 16 External Product Competitors", icon: "MessageSquare" },
      { id: "4", label: "Conversation Analyzed", value: "11", description: "Total validated Corporate SJA mentions across all platforms", icon: "Users" },
    ],
    priorityActions: [
      {
        id: "1",
        priority: "critical",
        title: "Aggressive Take-Down of AI Deepfake Scams",
        description: "Official channels had to issue warnings regarding new scam modalities utilizing AI videos and fake giveaways under the name of Good Day and PT Santos Jaya Abadi.",
        impact: "High",
        effort: "Medium",
        recommendation: "Coordinate with Meta and X regional offices to establish a direct reporting line for immediate takedowns of deepfake scams utilizing SJA's intellectual property.",
        category: "Corporate Reputation & Legal",
        quadrantColor: "red",
        relatedIssues: ["Phishing / Fraud", "AI Deepfakes"],
        metrics: { mentions: 3, sentiment: -1.0, trend: "Emerging Risk" },
        sourceContent: [
          {
            id: "sc1",
            platform: "instagram",
            author: "@santosjayaabadi",
            content: "Hati - hati terhadap modus penipuan baru dengan menggunakan video A.I Berkedok giveaway berhadiah yang mengatasnamakan Kopi Good Day atau PT Santos Jaya Abadi",
            sentiment: -1.0,
            timestamp: "2 days ago",
            engagement: { likes: 85, replies: 10, retweets: 0 },
          },
        ],
      },
    ],
    outletSatisfaction: [],
    risks: [
      {
        id: "1",
        title: "Missed Retail Investment Momentum",
        description: "Retail investors on Twitter are actively looking to buy SJA/Kapal Api shares but are disappointed to learn that SJA is a private entity. While not a business risk, it indicates uncaptured public goodwill.",
        severity: "Low",
        probability: 75,
        impact: "Public Relations",
        trend: "Stable",
        supportingContents: 1,
        indicators: [{ label: "Stock Market Queries", value: 3, change: 0 }],
        mitigation: ["Maintain strong corporate PR emphasizing 'Family Owned, Nationally Loved' to pivot the narrative from 'unavailable stock' to 'dedicated heritage'."],
        sourceContent: [
          { id: "r1", platform: "twitter", author: "@user", content: "Kapal Api diproduksi oleh PT Santos Jaya Abadi, perusahaan swasta yang tidak terdaftar di bursa saham Indonesia.", sentiment: 0, timestamp: "1 day ago" },
        ],
      },
    ],
    opportunities: [
      {
        id: "1",
        title: "Capitalize on Sports Sponsorship Legacy",
        description: "Football fans (specifically Persebaya/East Java Liga 3) still organically recall PT Santos Jaya Abadi's sponsorships from years ago, showing high long-term brand recall in the sports sector.",
        potential: "High Brand Loyalty",
        confidence: 85,
        timeframe: "Medium Term",
        category: "Corporate Social Responsibility (CSR)",
        trend: "Stable",
        supportingContents: 1,
        metrics: { sentimentScore: 90, marketPotential: 80, reachGrowth: 0 },
        recommendations: ["Re-activate or amplify grassroots sports CSR programs in East Java to maintain this deeply rooted community goodwill."],
        sourceContent: [
          { id: "o1", platform: "twitter", author: "@fan", content: "Sejak Liga 3 Jawa Timur 2017.. lewat PT Santos Jaya Abadi", sentiment: 0.9, timestamp: "1 day ago" },
        ],
      },
    ],
    competitiveIssues: [
      {
        id: "1",
        issue: "Corporate Shielding Effectiveness",
        yourMentions: 11,
        competitorMedianMentions: 40,
        relativeMentions: -72,
        yourSentiment: 0.5,
        competitorMedianSentiment: 0.3,
        relativeSentiment: 66,
        category: "Corporate Awareness",
      },
    ],
    competitiveKeyInsights: [
      {
        id: "1",
        type: "strength",
        title: "Corporate vs Product-Level Visibility",
        description: "When mapped directly against 16 external product competitors, PT Santos Jaya Abadi (11 mentions) demonstrates a highly shielded corporate strategy. Consumers almost exclusively name competitors' product brands (Nescafe, Kopi Luwak) rather than corporate entities when discussing coffee.",
        bullets: [
          "Nescafe (400) and Kopi Luwak (195) dominate the overall conversation volume through daily consumption chatter.",
          "SJA's digital footprint is highly controlled, mostly originating from their own Employer Branding and PR announcements on Instagram.",
          "This indicates successful brand architecture: Kapal Api/Good Day take the consumer spotlight, leaving SJA to handle B2B, careers, and crisis management.",
        ],
      },
    ],
    whatsHappeningSentimentTrends: [
      { date: "Feb 13", positive: 2, negative: 0, neutral: 1 },
      { date: "Feb 14", positive: 1, negative: 1, neutral: 0 },
      { date: "Feb 15", positive: 0, negative: 0, neutral: 2 },
      { date: "Feb 16", positive: 1, negative: 0, neutral: 1 },
      { date: "Feb 17", positive: 0, negative: 1, neutral: 0 },
      { date: "Feb 18", positive: 1, negative: 0, neutral: 0 },
      { date: "Feb 19", positive: 0, negative: 0, neutral: 0 },
    ],
    whatsHappeningKeyEvents: [
      {
        id: "1",
        date: "Feb 15",
        title: "Corporate Anti-Scam Announcement",
        description: "Official SJA Instagram channels released a joint PSA warning against AI-generated fake giveaway videos targeting coffee consumers.",
      },
    ],
    whatsHappeningTopTopics: [
      { topic: "Scam / Fraud Warnings", mentions: 3, sentiment: -0.8 },
      { topic: "Stock Market / Private Company Status", mentions: 3, sentiment: 0.1 },
      { topic: "Employer Branding / Careers", mentions: 3, sentiment: 0.9 },
      { topic: "Historical Football Sponsorships", mentions: 2, sentiment: 0.8 },
    ],
    whatsHappeningAITopicAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "B2B and Investor Curiosity",
        description: "Organic Twitter conversations regarding SJA are entirely detached from coffee consumption, focusing strictly on business maneuvers, historical sports backing, and financial structures.",
      },
    ],
    whatsHappeningTopicTrendsData: [
      { date: "Feb 13", ScamAlerts: 0, StockMarket: 2, Careers: 1, Sports: 0 },
      { date: "Feb 14", ScamAlerts: 0, StockMarket: 1, Careers: 0, Sports: 1 },
      { date: "Feb 15", ScamAlerts: 2, StockMarket: 0, Careers: 0, Sports: 0 },
      { date: "Feb 16", ScamAlerts: 0, StockMarket: 0, Careers: 2, Sports: 0 },
      { date: "Feb 17", ScamAlerts: 1, StockMarket: 0, Careers: 0, Sports: 0 },
      { date: "Feb 18", ScamAlerts: 0, StockMarket: 0, Careers: 0, Sports: 1 },
      { date: "Feb 19", ScamAlerts: 0, StockMarket: 0, Careers: 0, Sports: 0 },
    ],
    whatsHappeningAITrendAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Proactive Defensive PR",
        description: "The corporate communications team is highly proactive on Instagram, successfully getting ahead of digital fraud narratives before they cause widespread reputational damage.",
      },
    ],
    whatsHappeningWordCloud: [
      { text: "santos", weight: 100, sentiment: "neutral" },
      { text: "jaya", weight: 100, sentiment: "neutral" },
      { text: "abadi", weight: 100, sentiment: "neutral" },
      { text: "penipuan", weight: 60, sentiment: "negative" },
      { text: "swasta", weight: 50, sentiment: "neutral" },
      { text: "saham", weight: 40, sentiment: "neutral" },
      { text: "karier", weight: 35, sentiment: "positive" },
    ],
    whatsHappeningClusters: [
      {
        id: "1",
        theme: "Corporate Defense & Facts",
        size: 11,
        sentiment: 0.2,
        trend: "stable",
        keywords: ["penipuan", "swasta", "saham", "video"],
      },
    ],
    whatsHappeningHashtags: [
      { id: "1", tag: "#SantosJayaAbadi", conversations: 4, likes: 456, comments: 85 },
      { id: "2", tag: "#WaspadaPenipuan", conversations: 3, likes: 456, comments: 85 },
      { id: "3", tag: "#GrowWithKapalApi", conversations: 1, likes: 95, comments: 5 },
      { id: "4", tag: "#KopiGoodDay", conversations: 2, likes: 138, comments: 34 },
    ],
    whatsHappeningAccounts: [
      { id: "1", name: "Santos Jaya Abadi", handle: "@santosjayaabadi", platform: "instagram", followers: 15000, conversations: 3, likes: 456, replies: 85 },
      { id: "2", name: "Grow With Kapal Api", handle: "@growwithkapalapi", platform: "instagram", followers: 8500, conversations: 1, likes: 95, replies: 5 },
      { id: "3", name: "Muflih Ns", handle: "@Muflih_Ns", platform: "twitter", followers: 120, conversations: 1, likes: 0, replies: 1 },
    ],
    whatsHappeningContents: [
      { id: "1", title: "🚨 HATI-HATI PENIPUAN 🚨 Berkedok giveaway berhadiah yang mengatasnamakan Kopi Good Day...", platform: "instagram", author: "santosjayaabadi", likes: 138, comments: 34 },
      { id: "2", title: "Hati - hati terhadap modus penipuan baru dengan menggunakan video A.I...", platform: "instagram", author: "santosjayaabadi", likes: 223, comments: 46 },
      { id: "3", title: "Wujudkan karier impianmu bersama PT Santos Jaya Abadi!☕👋 info rekrutmen di @growwithkapalapi", platform: "instagram", author: "growwithkapalapi", likes: 95, comments: 5 },
      { id: "4", title: "Kapal Api diproduksi oleh PT Santos Jaya Abadi, perusahaan swasta yang tidak terdaftar di bursa...", platform: "twitter", author: "Muflih_Ns", likes: 0, comments: 1 },
    ],
    whatsHappeningKOLMatrix: [
      {
        id: "1",
        name: "Financial/Stock Edu-Accounts",
        followers: 55000,
        positivity: 50,
        engagement: 40,
        color: "gray",
        category: "Finance Commentators",
      },
    ],
    whatsHappeningAIKOLAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Engaging Financial Communities",
        description: "Financial commentators and retail investors discussing 'FMCG stocks' occasionally name-drop SJA. Engaging these accounts could foster strong B2B corporate branding.",
      },
    ],
    whatsHappeningShareOfPlatform: [
      { date: "Feb 13", twitter: 60, youtube: 0, reddit: 0, instagram: 40, facebook: 0, tiktok: 0 },
      { date: "Feb 14", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 15", twitter: 0, youtube: 0, reddit: 0, instagram: 100, facebook: 0, tiktok: 0 },
      { date: "Feb 16", twitter: 0, youtube: 0, reddit: 0, instagram: 100, facebook: 0, tiktok: 0 },
      { date: "Feb 17", twitter: 0, youtube: 0, reddit: 0, instagram: 100, facebook: 0, tiktok: 0 },
      { date: "Feb 18", twitter: 100, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 19", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
    ],
    competitiveMatrixItems: [
      { id: "1", name: "PT Santos Jaya Abadi", mentions: 11, positivePercentage: 45.4, size: 11, color: "#8B0000" },
      { id: "2", name: "Nescafe", mentions: 400, positivePercentage: 31.8, size: 400, color: "#FF0000" },
      { id: "3", name: "Kopi Luwak", mentions: 195, positivePercentage: 31.8, size: 195, color: "#8B4513" },
      { id: "4", name: "Indocafe", mentions: 146, positivePercentage: 34.2, size: 146, color: "#D2691E" },
      { id: "5", name: "Torabika", mentions: 144, positivePercentage: 42.4, size: 144, color: "#A0522D" },
      { id: "6", name: "Kopiko", mentions: 115, positivePercentage: 5.2, size: 115, color: "#4B3621" },
      { id: "7", name: "Caffino", mentions: 95, positivePercentage: 46.3, size: 95, color: "#8A2BE2" },
      { id: "8", name: "Kopi Gadjah", mentions: 70, positivePercentage: 17.1, size: 70, color: "#555555" },
      { id: "9", name: "TOP Coffee", mentions: 40, positivePercentage: 32.5, size: 40, color: "#FF8C00" },
      { id: "10", name: "Kopi Liong Bulan", mentions: 32, positivePercentage: 12.5, size: 32, color: "#C0C0C0" },
      { id: "11", name: "Golda Coffee", mentions: 18, positivePercentage: 11.1, size: 18, color: "#FFD700" },
      { id: "12", name: "Kopken RTD", mentions: 17, positivePercentage: 52.9, size: 17, color: "#FF1493" },
      { id: "13", name: "Space Roastery", mentions: 14, positivePercentage: 7.1, size: 14, color: "#000000" },
      { id: "14", name: "FiberCreme", mentions: 9, positivePercentage: 55.6, size: 9, color: "#ADD8E6" },
      { id: "15", name: "First Crack Coffee", mentions: 8, positivePercentage: 50.0, size: 8, color: "#A52A2A" },
      { id: "16", name: "Roemah Koffie", mentions: 8, positivePercentage: 12.5, size: 8, color: "#DEB887" },
      { id: "17", name: "Max Creamer", mentions: 3, positivePercentage: 0.0, size: 3, color: "#F5F5DC" },
    ],
    competitiveQuadrantAnalysis: [
      { id: "1", label: "Product Brand Leaders", brands: "Nescafe, Kopi Luwak, Indocafe, Torabika", note: "Massive consumer consumption volume" },
      { id: "2", label: "Mid-Tier Product Chatter", brands: "Kopiko, Caffino, Kopi Gadjah, TOP Coffee", note: "Moderate visibility, high flavor debate" },
      { id: "3", label: "Corporate Entity", brands: "PT Santos Jaya Abadi", note: "Extremely low volume, 0% product consumption focus" },
    ],
    competitiveSentimentScores: sentimentRows.map((r) => toFullSentimentRow(r as Record<string, number | string>)),
    competitiveVolumeOfMentions: volumeRows.map((r) => toFullVolumeRow(r as Record<string, number | string>)),
    competitiveShareOfVoice: sovRows.map((r) => toShareOfVoiceRowSja(r as Record<string, number | string>)),
    competitiveBrandLabels: { yourBrand: "PT Santos Jaya Abadi", competitorA: "Nescafe", competitorB: "Kopi Luwak", competitorC: "Indocafe", competitorD: "Torabika" },
  };
}

function buildGoodDayXBabyMonsterInitial(base: DashboardContentStore): DashboardContentStore {
  const sentimentRows = [
    { issue: "Collab Power", "Good Day x BABYMONSTER": 98, "Nescafe": 40, "Torabika": 30, "Caffino": 45 },
  ];
  const volumeRows = [
    { issue: "Fandom Engagement", "Good Day x BABYMONSTER": 22, "Nescafe": 5, "Torabika": 2, "Kopiko": 15 },
  ];
  const sovRows = [
    { date: "Feb 13", "Good Day x BABYMONSTER": 3, "Nescafe": 55, "Torabika": 22, "Indocafe": 20, "Kopiko": 15 },
    { date: "Feb 14", "Good Day x BABYMONSTER": 4, "Nescafe": 45, "Torabika": 30, "Indocafe": 15, "Kopiko": 25 },
    { date: "Feb 15", "Good Day x BABYMONSTER": 2, "Nescafe": 80, "Torabika": 18, "Indocafe": 25, "Kopiko": 10 },
    { date: "Feb 16", "Good Day x BABYMONSTER": 4, "Nescafe": 60, "Torabika": 20, "Indocafe": 35, "Kopiko": 22 },
    { date: "Feb 17", "Good Day x BABYMONSTER": 2, "Nescafe": 55, "Torabika": 25, "Indocafe": 20, "Kopiko": 18 },
    { date: "Feb 18", "Good Day x BABYMONSTER": 5, "Nescafe": 48, "Torabika": 15, "Indocafe": 12, "Kopiko": 12 },
    { date: "Feb 19", "Good Day x BABYMONSTER": 2, "Nescafe": 39, "Torabika": 14, "Indocafe": 21, "Kopiko": 13 },
  ];
  return {
    ...base,
    featureVisibility: {
      statsOverview: true,
      actionRecommendations: true,
      outletSatisfaction: false,
      risksOpportunities: true,
      competitiveAnalysis: true,
      recentInsights: true,
    },
    statsOverview: [
      { id: "1", label: "Campaign Sentiment", value: "95.4%", description: "Peak positive sentiment driven by BABYMONSTER fandom engagement", icon: "TrendingUp" },
      { id: "2", label: "Critical Issues", value: "0", description: "Zero negative brand safety incidents related to the collaboration", icon: "AlertTriangle" },
      { id: "3", label: "Viral Share of Voice", value: "1.5%", description: "Campaign-specific SOV compared to 16 external competitors' total volume", icon: "MessageSquare" },
      { id: "4", label: "Validated Mentions", value: "22", description: "Total specific mentions of BABYMONSTER x Good Day this week", icon: "Users" },
    ],
    priorityActions: [
      {
        id: "1",
        priority: "high",
        title: "Leverage 'Ahyeon' Solo Traction",
        description: "TikTok comments show specific high-intensity engagement whenever Ahyeon is mentioned or shown in relation to Good Day. She is currently the primary 'hook' for the campaign's digital engagement.",
        impact: "High",
        effort: "Low",
        recommendation: "Increase the frequency of short, 'behind-the-scenes' or exclusive 'POV' clips featuring Ahyeon to maximize the current algorithm favor on TikTok.",
        category: "Content Strategy",
        quadrantColor: "green",
        relatedIssues: ["Fandom Bias", "Member Popularity"],
        metrics: { mentions: 12, sentiment: 1.0, trend: "Upward" },
        sourceContent: [
          {
            id: "pa1",
            platform: "tiktok",
            author: "@zuluhee_",
            content: "Ahyeon ❤️🔥so cool 😎 #kopigoodday",
            sentiment: 1.0,
            timestamp: "1 day ago",
            engagement: { likes: 6, replies: 0, retweets: 0 },
          },
        ],
      },
    ],
    outletSatisfaction: [],
    risks: [
      {
        id: "1",
        title: "Echo-Chamber Constraint",
        description: "The campaign is currently highly successful within the 'K-Pop fandom' circle but has limited spillover into the 'general coffee drinker' demographic on Twitter/X.",
        severity: "Low",
        probability: 75,
        impact: "Market Reach",
        trend: "Stable",
        supportingContents: 1,
        indicators: [{ label: "General Audience Cross-over", value: 15, change: 0 }],
        mitigation: ["Create 'Challenge' content that focuses on the coffee drinking experience/ritual using BABYMONSTER music, making it relatable to non-fans."],
        sourceContent: [
          {
            id: "r1",
            platform: "twitter",
            author: "@user",
            content: "Mentions are strictly tied to idol-appreciation keywords",
            sentiment: 0,
            timestamp: "1 day ago",
          },
        ],
      },
    ],
    opportunities: [
      {
        id: "1",
        title: "Digital Photocard / Merch Demand",
        description: "There is early organic inquiry regarding 'rewards' and 'exclusives'. Fandoms are highly motivated by physical or digital collectibles that link the brand to the idol group.",
        potential: "High Sales Conversion",
        confidence: 85,
        timeframe: "Short Term",
        category: "Sales Activation",
        trend: "Spiking",
        supportingContents: 1,
        metrics: { sentimentScore: 100, marketPotential: 80, reachGrowth: 20 },
        recommendations: ["Integrate 'Snap & Win' digital photocard filters on TikTok to gamify the purchase of Good Day packs."],
        sourceContent: [
          {
            id: "o1",
            platform: "twitter",
            author: "@user",
            content: "Queries regarding availability of collab-themed items",
            sentiment: 1.0,
            timestamp: "1 day ago",
          },
        ],
      },
    ],
    competitiveIssues: [
      {
        id: "1",
        issue: "Pop-Culture Advantage",
        yourMentions: 22,
        competitorMedianMentions: 0,
        relativeMentions: 999,
        yourSentiment: 0.95,
        competitorMedianSentiment: 0.3,
        relativeSentiment: 216,
        category: "Brand Edge",
      },
    ],
    competitiveKeyInsights: [
      {
        id: "1",
        type: "strength",
        title: "Exclusive Identity in the Youth Market",
        description: "None of the 16 external competitors currently have an active global-tier K-Pop collaboration. This gives Good Day a massive 'cool factor' advantage over giants like Nescafe and Torabika.",
        bullets: [
          "Nescafe (400) owns the volume, but Good Day owns the 'aspiration' and 'youthful energy' this week.",
          "Caffino (95) and Kopiko (115) attempt lifestyle targeting, but lack the viral firepower of a BABYMONSTER partnership.",
        ],
      },
    ],
    whatsHappeningSentimentTrends: [
      { date: "Feb 13", positive: 2, negative: 0, neutral: 1 },
      { date: "Feb 14", positive: 4, negative: 0, neutral: 0 },
      { date: "Feb 15", positive: 1, negative: 0, neutral: 1 },
      { date: "Feb 16", positive: 3, negative: 0, neutral: 1 },
      { date: "Feb 17", positive: 2, negative: 0, neutral: 0 },
      { date: "Feb 18", positive: 5, negative: 0, neutral: 0 },
      { date: "Feb 19", positive: 2, negative: 0, neutral: 0 },
    ],
    whatsHappeningKeyEvents: [
      { id: "1", date: "Feb 18", title: "Ahyeon Visual Interaction Spike", description: "High volume of 'visual appreciation' comments on TikTok regarding Ahyeon's appearance in Good Day promotional assets." },
    ],
    whatsHappeningTopTopics: [
      { topic: "Ahyeon / Visual Appreciation", mentions: 12, sentiment: 1.0 },
      { topic: "Kopi Good Day x BABYMONSTER", mentions: 6, sentiment: 1.0 },
      { topic: "Collaboration Photocards/Merch", mentions: 4, sentiment: 0.9 },
    ],
    whatsHappeningAITopicAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Fandom Loyalty as Brand Equity",
        description: "The 'Monster' fandom is actively migrating their coffee loyalty to Good Day as a form of supporting the idols' commercial success.",
      },
    ],
    whatsHappeningTopicTrendsData: [
      { date: "Feb 13", FandomTalk: 3 },
      { date: "Feb 14", FandomTalk: 4 },
      { date: "Feb 15", FandomTalk: 2 },
      { date: "Feb 16", FandomTalk: 4 },
      { date: "Feb 17", FandomTalk: 2 },
      { date: "Feb 18", FandomTalk: 5 },
      { date: "Feb 19", FandomTalk: 2 },
    ],
    whatsHappeningAITrendAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Organic Amplification by Fanbases",
        description: "Most of the Twitter/X reach is generated by fan-led update accounts rather than the brand's official handle, showing strong communal ownership of the campaign.",
      },
    ],
    whatsHappeningWordCloud: [
      { text: "babymonster", weight: 100, sentiment: "positive" },
      { text: "ahyeon", weight: 85, sentiment: "positive" },
      { text: "goodday", weight: 70, sentiment: "positive" },
      { text: "cool", weight: 60, sentiment: "positive" },
      { text: "love", weight: 50, sentiment: "positive" },
      { text: "baemon", weight: 40, sentiment: "positive" },
    ],
    whatsHappeningClusters: [
      {
        id: "1",
        theme: "Idol Appreciation",
        size: 15,
        sentiment: 1.0,
        trend: "up",
        keywords: ["ahyeon", "cool", "love", "pretty"],
      },
    ],
    whatsHappeningHashtags: [
      { id: "1", tag: "#KopiGoodDay", conversations: 15, likes: 64099, comments: 2237 },
      { id: "2", tag: "#GoodDayxBABYMONSTER", conversations: 8, likes: 63577, comments: 2181 },
      { id: "3", tag: "#HaveAGoodDayWithBABYMONSTER", conversations: 5, likes: 43602, comments: 1646 },
      { id: "4", tag: "#BABYMONSTER", conversations: 8, likes: 19975, comments: 535 },
    ],
    whatsHappeningAccounts: [
      { id: "1", name: "Good Day Coffee", handle: "@gooddayid", platform: "instagram", followers: 285000, conversations: 4, likes: 63577, replies: 2181 },
      { id: "2", name: "zuluhee_", handle: "@zuluhee_", platform: "tiktok", followers: 5000, conversations: 1, likes: 120, replies: 10 },
    ],
    whatsHappeningContents: [
      { id: "1", title: "Good Day ❤️ BABYMONSTER in our zone! #KopiGoodDay yang punya banyak rasa...", platform: "instagram", author: "gooddayid", likes: 26552, comments: 379 },
      { id: "2", title: "Memasuki WIB (Waktu Indonesia bagian BABYMONSTER)! ⏰❤️ Ngopi Good Day...", platform: "instagram", author: "gooddayid", likes: 19975, comments: 535 },
      { id: "3", title: "Akhirnya bisa ngerasain hangat dengan cara yang lebih fun bareng BABYMONSTER...", platform: "instagram", author: "gooddayid", likes: 17050, comments: 1267 },
      { id: "4", title: "Ahyeon ❤️🔥so cool 😎 #kopigoodday", platform: "tiktok", author: "zuluhee_", likes: 120, comments: 10 },
    ],
    whatsHappeningKOLMatrix: [
      {
        id: "1",
        name: "BABYMONSTER (Idol)",
        followers: 15000000,
        positivity: 100,
        engagement: 100,
        color: "red",
        category: "Brand Ambassador",
      },
    ],
    whatsHappeningAIKOLAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Global-to-Local Impact",
        description: "The campaign successfully translates global K-pop stardom into local Indonesian marketability, particularly effective in the digital-native Gen-Z segment.",
      },
    ],
    whatsHappeningShareOfPlatform: [
      { date: "Feb 13", twitter: 40, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 60 },
      { date: "Feb 14", twitter: 50, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 50 },
      { date: "Feb 15", twitter: 30, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 70 },
      { date: "Feb 16", twitter: 45, youtube: 0, reddit: 0, instagram: 10, facebook: 0, tiktok: 45 },
      { date: "Feb 17", twitter: 20, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 80 },
      { date: "Feb 18", twitter: 10, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 90 },
      { date: "Feb 19", twitter: 50, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 50 },
    ],
    competitiveMatrixItems: [
      { id: "1", name: "Good Day x BABYMONSTER", mentions: 22, positivePercentage: 95.4, size: 22, color: "#FF0000" },
      { id: "2", name: "Nescafe", mentions: 400, positivePercentage: 31.8, size: 400, color: "#FF0000" },
      { id: "3", name: "Kopi Luwak", mentions: 195, positivePercentage: 31.8, size: 195, color: "#8B4513" },
      { id: "4", name: "Indocafe", mentions: 146, positivePercentage: 34.2, size: 146, color: "#D2691E" },
      { id: "5", name: "Torabika", mentions: 144, positivePercentage: 42.4, size: 144, color: "#A0522D" },
      { id: "6", name: "Kopiko", mentions: 115, positivePercentage: 5.2, size: 115, color: "#4B3621" },
      { id: "7", name: "Caffino", mentions: 95, positivePercentage: 46.3, size: 95, color: "#8A2BE2" },
      { id: "8", name: "Kopi Gadjah", mentions: 52, positivePercentage: 17.1, size: 52, color: "#555555" },
      { id: "9", name: "TOP Coffee", mentions: 40, positivePercentage: 32.5, size: 40, color: "#FF8C00" },
      { id: "10", name: "Kopi Liong Bulan", mentions: 23, positivePercentage: 12.5, size: 23, color: "#C0C0C0" },
      { id: "11", name: "Golda Coffee", mentions: 18, positivePercentage: 11.1, size: 18, color: "#FFD700" },
      { id: "12", name: "Kopken RTD", mentions: 17, positivePercentage: 52.9, size: 17, color: "#FF1493" },
      { id: "13", name: "Space Roastery", mentions: 14, positivePercentage: 7.1, size: 14, color: "#000000" },
      { id: "14", name: "FiberCreme", mentions: 9, positivePercentage: 88.8, size: 9, color: "#ADD8E6" },
      { id: "15", name: "First Crack Coffee", mentions: 8, positivePercentage: 50.0, size: 8, color: "#A52A2A" },
      { id: "16", name: "Roemah Koffie", mentions: 8, positivePercentage: 12.5, size: 8, color: "#DEB887" },
      { id: "17", name: "Max Creamer", mentions: 3, positivePercentage: 0.0, size: 3, color: "#F5F5DC" },
    ],
    competitiveQuadrantAnalysis: [
      { id: "1", label: "Volume Leaders", brands: "Nescafe, Kopi Luwak, Torabika", note: "Massive daily reach" },
      { id: "2", label: "High Emotion / Engagement", brands: "Good Day x BABYMONSTER, Caffino, Kopken RTD", note: "High loyalty and positive sentiment scores" },
      { id: "3", label: "Traditional Base", brands: "Indocafe, Kopi Gadjah", note: "Consistent but lower digital engagement" },
    ],
    competitiveSentimentScores: sentimentRows.map((r) => toFullSentimentRow(r as Record<string, number | string>)),
    competitiveVolumeOfMentions: volumeRows.map((r) => toFullVolumeRow(r as Record<string, number | string>)),
    competitiveShareOfVoice: sovRows.map((r) => toShareOfVoiceRowGdxBaemon(r as Record<string, number | string>)),
    competitiveBrandLabels: { yourBrand: "Good Day x BABYMONSTER", competitorA: "Nescafe", competitorB: "Torabika", competitorC: "Indocafe", competitorD: "Kopiko" },
  };
}

function buildKapalApiCoffeeCornerInitial(base: DashboardContentStore): DashboardContentStore {
  const sentimentRows = [
    { issue: "Product Availability", "Kapal Api Coffee Corner": 85, "Nescafe": 95, "Kopi Luwak": 90, "Indocafe": 88, "Torabika": 85, "Kopiko": 80, "Caffino": 75, "Kopi Gadjah": 65, "TOP Coffee": 70, "Kopi Liong Bulan": 40, "Golda Coffee": 75, "Kopken RTD": 70, "Space Roastery": 80, "FiberCreme": 85, "First Crack Coffee": 80, "Roemah Koffie": 75, "Max Creamer": 50 },
    { issue: "Taste/Quality", "Kapal Api Coffee Corner": 90, "Nescafe": 56, "Kopi Luwak": 60, "Indocafe": 65, "Torabika": 62, "Kopiko": 50, "Caffino": 55, "Kopi Gadjah": 75, "TOP Coffee": 60, "Kopi Liong Bulan": 80, "Golda Coffee": 55, "Kopken RTD": 40, "Space Roastery": 20, "FiberCreme": 50, "First Crack Coffee": 15, "Roemah Koffie": 30, "Max Creamer": 40 },
  ];
  const volumeRows = [
    { issue: "Social Media Presence", "Kapal Api Coffee Corner": 4, "Nescafe": 150, "Kopi Luwak": 55, "Indocafe": 36, "Torabika": 44, "Kopiko": 30, "Caffino": 35, "Kopi Gadjah": 20, "TOP Coffee": 15, "Kopi Liong Bulan": 7, "Golda Coffee": 8, "Kopken RTD": 7, "Space Roastery": 6, "FiberCreme": 3, "First Crack Coffee": 3, "Roemah Koffie": 3, "Max Creamer": 1 },
  ];
  const sovRows = [
    { date: "Feb 13", "Kapal Api Coffee Corner": 1, "Nescafe": 50, "Kopi Luwak": 20, "Indocafe": 22, "Torabika": 17, "Kopiko": 11, "Caffino": 9, "Kopi Gadjah": 5, "TOP Coffee": 2, "Kopi Liong Bulan": 7, "Golda Coffee": 1, "Kopken RTD": 3, "Space Roastery": 0, "FiberCreme": 0, "First Crack Coffee": 1, "Roemah Koffie": 0, "Max Creamer": 1 },
    { date: "Feb 14", "Kapal Api Coffee Corner": 1, "Nescafe": 85, "Kopi Luwak": 31, "Indocafe": 27, "Torabika": 46, "Kopiko": 8, "Caffino": 11, "Kopi Gadjah": 8, "TOP Coffee": 6, "Kopi Liong Bulan": 1, "Golda Coffee": 2, "Kopken RTD": 0, "Space Roastery": 3, "FiberCreme": 1, "First Crack Coffee": 0, "Roemah Koffie": 0, "Max Creamer": 0 },
    { date: "Feb 15", "Kapal Api Coffee Corner": 1, "Nescafe": 60, "Kopi Luwak": 51, "Indocafe": 42, "Torabika": 35, "Kopiko": 20, "Caffino": 6, "Kopi Gadjah": 7, "TOP Coffee": 11, "Kopi Liong Bulan": 4, "Golda Coffee": 2, "Kopken RTD": 0, "Space Roastery": 2, "FiberCreme": 3, "First Crack Coffee": 3, "Roemah Koffie": 0, "Max Creamer": 1 },
    { date: "Feb 16", "Kapal Api Coffee Corner": 1, "Nescafe": 65, "Kopi Luwak": 28, "Indocafe": 8, "Torabika": 17, "Kopiko": 17, "Caffino": 25, "Kopi Gadjah": 17, "TOP Coffee": 6, "Kopi Liong Bulan": 2, "Golda Coffee": 5, "Kopken RTD": 4, "Space Roastery": 4, "FiberCreme": 0, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 0 },
    { date: "Feb 17", "Kapal Api Coffee Corner": 0, "Nescafe": 35, "Kopi Luwak": 25, "Indocafe": 20, "Torabika": 14, "Kopiko": 23, "Caffino": 16, "Kopi Gadjah": 18, "TOP Coffee": 4, "Kopi Liong Bulan": 6, "Golda Coffee": 4, "Kopken RTD": 4, "Space Roastery": 0, "FiberCreme": 2, "First Crack Coffee": 2, "Roemah Koffie": 2, "Max Creamer": 0 },
    { date: "Feb 18", "Kapal Api Coffee Corner": 0, "Nescafe": 35, "Kopi Luwak": 14, "Indocafe": 8, "Torabika": 11, "Kopiko": 17, "Caffino": 2, "Kopi Gadjah": 4, "TOP Coffee": 4, "Kopi Liong Bulan": 4, "Golda Coffee": 1, "Kopken RTD": 0, "Space Roastery": 4, "FiberCreme": 2, "First Crack Coffee": 0, "Roemah Koffie": 4, "Max Creamer": 0 },
    { date: "Feb 19", "Kapal Api Coffee Corner": 0, "Nescafe": 70, "Kopi Luwak": 26, "Indocafe": 19, "Torabika": 4, "Kopiko": 19, "Caffino": 26, "Kopi Gadjah": 11, "TOP Coffee": 7, "Kopi Liong Bulan": 8, "Golda Coffee": 3, "Kopken RTD": 6, "Space Roastery": 1, "FiberCreme": 1, "First Crack Coffee": 1, "Roemah Koffie": 1, "Max Creamer": 1 },
  ];
  return {
    ...base,
    featureVisibility: {
      statsOverview: true,
      actionRecommendations: true,
      outletSatisfaction: false,
      risksOpportunities: true,
      competitiveAnalysis: true,
      recentInsights: true,
    },
    statsOverview: [
      { id: "1", label: "Average Sentiment", value: "100.0%", description: "Sentiment is at maximum due to mentions being purely official promotional posts", icon: "TrendingUp" },
      { id: "2", label: "Critical Issues", value: "1", description: "Severe deficiency in organic consumer-led digital footprints (UGC)", icon: "AlertTriangle" },
      { id: "3", label: "Share of Voice", value: "0.3%", description: "KACC SOV vs 16 External FMCG & Retail Competitors", icon: "MessageSquare" },
      { id: "4", label: "Conversation Analyzed", value: "4", description: "Total validated KACC mentions across all platforms", icon: "Users" },
    ],
    priorityActions: [
      {
        id: "1",
        priority: "high",
        title: "Incentivize In-Store Digital Check-ins",
        description: "Analysis shows 100% of mentions come from the brand itself. There is zero organic chatter from users actually visiting the Coffee Corners.",
        impact: "High",
        effort: "Low",
        recommendation: "Launch an 'Instant Perk' program where customers get a free topping or discount for posting a story with the hashtag #NgopiDiKACC at the booth.",
        category: "Retail Marketing",
        quadrantColor: "red",
        relatedIssues: ["Zero Organic Advocacy", "Low Brand Discoverability"],
        metrics: { mentions: 4, sentiment: 0.5, trend: "Static" },
        sourceContent: [
          {
            id: "pa1",
            platform: "instagram",
            author: "@ka_coffeecorner",
            content: "Siapa di sini yang story wajib estetik gini juga pas nongkrong? #kacc #kapalapicoffeecorner",
            sentiment: 0.5,
            timestamp: "1 day ago",
            engagement: { likes: 32, replies: 2, retweets: 0 },
          },
        ],
      },
    ],
    outletSatisfaction: [],
    risks: [
      {
        id: "1",
        title: "Loss of Youth Lifestyle Relevance",
        description: "Younger coffee drinkers in the dataset are actively discussing aesthetic 'Home Cafes' and trendy RTDs, but KACC's physical presence is not being tagged as a 'lifestyle' choice.",
        severity: "Medium",
        probability: 75,
        impact: "Market Share",
        trend: "Stable",
        supportingContents: 1,
        indicators: [{ label: "Consumer Mentions", value: 0, change: 0 }],
        mitigation: ["Reposition the 'Corner' as a high-quality 'Quick Break' station for busy professionals and students."],
        sourceContent: [
          {
            id: "r1",
            platform: "instagram",
            author: "@user",
            content: "A quick break that is guaranteed to never fail 👌",
            sentiment: 0.5,
            timestamp: "1 day ago",
          },
        ],
      },
    ],
    opportunities: [
      {
        id: "1",
        title: "Seasonal Drink Promo Viral Potential",
        description: "KACC's specialized seasonal menus like 'Dark Choco Latte' have high aesthetic potential that remains un-leveraged by micro-influencers.",
        potential: "High Viral Reach",
        confidence: 50,
        timeframe: "Short Term",
        category: "Product Strategy",
        trend: "Spiking",
        supportingContents: 1,
        metrics: { sentimentScore: 100, marketPotential: 80, reachGrowth: 5 },
        recommendations: ["Invite 5-10 micro food-vloggers to visit a KACC booth and review the seasonal Dark Choco Latte to build baseline search volume."],
        sourceContent: [
          {
            id: "o1",
            platform: "instagram",
            author: "ka_coffeecorner",
            content: "Celebrate this month of love with something special! menu Dark Choco Latte dan Strawberry",
            sentiment: 1.0,
            timestamp: "1 day ago",
          },
        ],
      },
    ],
    competitiveIssues: [
      {
        id: "1",
        issue: "Digital Visibility Gap",
        yourMentions: 4,
        competitorMedianMentions: 52,
        relativeMentions: -92,
        yourSentiment: 1.0,
        competitorMedianSentiment: 0.3,
        relativeSentiment: 233,
        category: "Presence",
      },
    ],
    competitiveKeyInsights: [
      {
        id: "1",
        type: "strength",
        title: "Retail vs Product Overload",
        description: "When compared against the massive volume of sachet coffee mentions (Nescafe: 400, Luwak: 195), KACC's retail-focused chatter is invisible. The brand relies entirely on Instagram for its digital life.",
        bullets: [
          "FMCG giants like Torabika (144) and Kopiko (115) own the daily conversation 'noise'.",
          "KACC needs to differentiate its 'brewed on the spot' quality from the 'instant' sachet perception to gain premium retail traction.",
        ],
      },
    ],
    whatsHappeningSentimentTrends: [
      { date: "Feb 13", positive: 1, negative: 0, neutral: 0 },
      { date: "Feb 14", positive: 1, negative: 0, neutral: 0 },
      { date: "Feb 15", positive: 1, negative: 0, neutral: 0 },
      { date: "Feb 16", positive: 1, negative: 0, neutral: 0 },
      { date: "Feb 17", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 18", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 19", positive: 0, negative: 0, neutral: 0 },
    ],
    whatsHappeningKeyEvents: [
      { id: "1", date: "Feb 14", title: "Valentine's Day Seasonal Launch", description: "Release of the Dark Choco Latte and Strawberry menus to drive seasonal outlet traffic." },
    ],
    whatsHappeningTopTopics: [
      { topic: "Seasonal Menu (Valentine/Imlek)", mentions: 2, sentiment: 1.0 },
      { topic: "Aesthetic Break Time", mentions: 1, sentiment: 1.0 },
      { topic: "Retail Promotions", mentions: 1, sentiment: 1.0 },
    ],
    whatsHappeningAITopicAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Top-Down Communication",
        description: "100% of KACC's digital presence is controlled and generated by the corporate account, showing zero organic community engagement.",
      },
    ],
    whatsHappeningTopicTrendsData: [
      { date: "Feb 13", Promos: 1, Menu: 0 },
      { date: "Feb 14", Promos: 1, Menu: 1 },
      { date: "Feb 15", Promos: 1, Menu: 0 },
      { date: "Feb 16", Promos: 1, Menu: 0 },
      { date: "Feb 17", Promos: 0, Menu: 0 },
      { date: "Feb 18", Promos: 0, Menu: 0 },
      { date: "Feb 19", Promos: 0, Menu: 0 },
    ],
    whatsHappeningAITrendAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Missed UGC Opportunities",
        description: "Despite 'aesthetic' being a keyword, users are not tagging KACC in their lifestyle posts.",
      },
    ],
    whatsHappeningWordCloud: [
      { text: "kacc", weight: 100, sentiment: "positive" },
      { text: "kapalapicoffeecorner", weight: 80, sentiment: "positive" },
      { text: "valentine", weight: 60, sentiment: "positive" },
      { text: "estetik", weight: 40, sentiment: "positive" },
      { text: "strawberry", weight: 30, sentiment: "positive" },
      { text: "choco", weight: 30, sentiment: "positive" },
    ],
    whatsHappeningClusters: [
      {
        id: "1",
        theme: "Seasonal Brand Presence",
        size: 4,
        sentiment: 1.0,
        trend: "stable",
        keywords: ["kacc", "valentine", "lunar", "special"],
      },
    ],
    whatsHappeningHashtags: [
      { id: "1", tag: "#NgopiDiKACC", conversations: 4, likes: 70, comments: 2 },
      { id: "2", tag: "#KapalApiCoffeeCorner", conversations: 3, likes: 52, comments: 2 },
      { id: "3", tag: "#KACC", conversations: 4, likes: 70, comments: 2 },
    ],
    whatsHappeningAccounts: [
      { id: "1", name: "Kapal Api Coffee Corner", handle: "@ka_coffeecorner", platform: "instagram", followers: 15000, conversations: 4, likes: 70, replies: 2 },
    ],
    whatsHappeningContents: [
      { id: "1", title: "Siapa di sini yang story wajib estetik gini juga pas nongkrong?", platform: "instagram", author: "ka_coffeecorner", likes: 21, comments: 0 },
      { id: "2", title: "A quick break that is guaranteed to never fail 👌", platform: "instagram", author: "ka_coffeecorner", likes: 19, comments: 0 },
      { id: "3", title: "Happy Lunar New Year! 🧧 Tahun baru, harapan baru, dan momen baru...", platform: "instagram", author: "ka_coffeecorner", likes: 18, comments: 0 },
      { id: "4", title: "Celebrate this month of love with something special! 💝 Dark Choco Latte...", platform: "instagram", author: "ka_coffeecorner", likes: 12, comments: 2 },
    ],
    whatsHappeningKOLMatrix: [
      {
        id: "1",
        name: "Official Brand Account",
        followers: 15000,
        positivity: 100,
        engagement: 25,
        color: "gray",
        category: "Brand Broadcast",
      },
    ],
    whatsHappeningAIKOLAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Zero Third-Party Influence",
        description: "The brand is operating in a digital silo. No food bloggers or lifestyle influencers mentioned the physical booths this week.",
      },
    ],
    whatsHappeningShareOfPlatform: [
      { date: "Feb 13", twitter: 0, youtube: 0, reddit: 0, instagram: 100, facebook: 0, tiktok: 0 },
      { date: "Feb 14", twitter: 0, youtube: 0, reddit: 0, instagram: 100, facebook: 0, tiktok: 0 },
      { date: "Feb 15", twitter: 0, youtube: 0, reddit: 0, instagram: 100, facebook: 0, tiktok: 0 },
      { date: "Feb 16", twitter: 0, youtube: 0, reddit: 0, instagram: 100, facebook: 0, tiktok: 0 },
      { date: "Feb 17", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 18", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 19", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
    ],
    competitiveMatrixItems: [
      { id: "1", name: "Kapal Api Coffee Corner", mentions: 4, positivePercentage: 100.0, size: 4, color: "#E5001C" },
      { id: "2", name: "Nescafe", mentions: 400, positivePercentage: 31.8, size: 400, color: "#FF0000" },
      { id: "3", name: "Kopi Luwak", mentions: 195, positivePercentage: 31.8, size: 195, color: "#8B4513" },
      { id: "4", name: "Indocafe", mentions: 146, positivePercentage: 34.2, size: 146, color: "#D2691E" },
      { id: "5", name: "Torabika", mentions: 144, positivePercentage: 42.4, size: 144, color: "#A0522D" },
      { id: "6", name: "Kopiko", mentions: 115, positivePercentage: 5.2, size: 115, color: "#4B3621" },
      { id: "7", name: "Caffino", mentions: 95, positivePercentage: 46.3, size: 95, color: "#8A2BE2" },
      { id: "8", name: "Kopi Gadjah", mentions: 52, positivePercentage: 17.1, size: 52, color: "#555555" },
      { id: "9", name: "TOP Coffee", mentions: 40, positivePercentage: 32.5, size: 40, color: "#FF8C00" },
      { id: "10", name: "Kopi Liong Bulan", mentions: 23, positivePercentage: 12.5, size: 23, color: "#C0C0C0" },
      { id: "11", name: "Golda Coffee", mentions: 18, positivePercentage: 11.1, size: 18, color: "#FFD700" },
      { id: "12", name: "Kopken RTD", mentions: 17, positivePercentage: 52.9, size: 17, color: "#FF1493" },
      { id: "13", name: "Space Roastery", mentions: 14, positivePercentage: 7.1, size: 14, color: "#000000" },
      { id: "14", name: "FiberCreme", mentions: 9, positivePercentage: 88.8, size: 9, color: "#ADD8E6" },
      { id: "15", name: "First Crack Coffee", mentions: 8, positivePercentage: 50.0, size: 8, color: "#A52A2A" },
      { id: "16", name: "Roemah Koffie", mentions: 8, positivePercentage: 12.5, size: 8, color: "#DEB887" },
      { id: "17", name: "Max Creamer", mentions: 3, positivePercentage: 0.0, size: 3, color: "#F5F5DC" },
    ],
    competitiveQuadrantAnalysis: [
      { id: "1", label: "Mass Giants", brands: "Nescafe, Kopi Luwak, Indocafe", note: "High Volume" },
      { id: "2", label: "Social Stars", brands: "Torabika, Caffino, Kopken RTD", note: "Frequent standalone mentions" },
      { id: "3", label: "Invisible Brands", brands: "Kapal Api Coffee Corner, Max Creamer", note: "Limited to zero organic chatter" },
    ],
    competitiveSentimentScores: sentimentRows.map((r) => toFullSentimentRow(r as Record<string, number | string>)),
    competitiveVolumeOfMentions: volumeRows.map((r) => toFullVolumeRow(r as Record<string, number | string>)),
    competitiveShareOfVoice: sovRows.map((r) => toShareOfVoiceRowKacc(r as Record<string, number | string>)),
    competitiveBrandLabels: { yourBrand: "Kapal Api Coffee Corner", competitorA: "Nescafe", competitorB: "Kopi Luwak", competitorC: "Indocafe", competitorD: "Torabika" },
  };
}

function buildKrimKafeInitial(base: DashboardContentStore): DashboardContentStore {
  const sentimentRows = [
    { issue: "Mixology / Taste Pairing", "Krim Kafe": 0, "Nescafe": 56, "FiberCreme": 85, "Max Creamer": 95, "Indocafe": 60, "Kopi Luwak": 32, "Torabika": 83, "Kopiko": 68, "Caffino": 80, "Space Roastery": 85, "First Crack Coffee": 30, "Roemah Koffie": 38, "Kopi Gadjah": 25, "TOP Coffee": 55, "Kopi Liong Bulan": 15, "Golda Coffee": 60, "Kopken RTD": 75 },
    { issue: "Health / Diet Substitute", "Krim Kafe": 0, "Nescafe": 30, "FiberCreme": 95, "Max Creamer": 20, "Indocafe": 25, "Kopi Luwak": 15, "Torabika": 10, "Kopiko": 5, "Caffino": 10, "Space Roastery": 40, "First Crack Coffee": 20, "Roemah Koffie": 15, "Kopi Gadjah": 5, "TOP Coffee": 10, "Kopi Liong Bulan": 5, "Golda Coffee": 10, "Kopken RTD": 15 },
    { issue: "Organic Word of Mouth", "Krim Kafe": 0, "Nescafe": 46, "FiberCreme": 88, "Max Creamer": 85, "Indocafe": 63, "Kopi Luwak": 64, "Torabika": 70, "Kopiko": 65, "Caffino": 65, "Space Roastery": 32, "First Crack Coffee": 43, "Roemah Koffie": 50, "Kopi Gadjah": 84, "TOP Coffee": 80, "Kopi Liong Bulan": 75, "Golda Coffee": 70, "Kopken RTD": 45 },
  ];
  const volumeRows = [
    { issue: "Coffee Pairing (Mixology)", "Krim Kafe": 0, "Nescafe": 120, "FiberCreme": 2, "Max Creamer": 8, "Indocafe": 45, "Kopi Luwak": 60, "Torabika": 85, "Kopiko": 40, "Caffino": 55, "Space Roastery": 8, "First Crack Coffee": 4, "Roemah Koffie": 5, "Kopi Gadjah": 30, "TOP Coffee": 15, "Kopi Liong Bulan": 10, "Golda Coffee": 5, "Kopken RTD": 10 },
    { issue: "Culinary / Cooking", "Krim Kafe": 0, "Nescafe": 15, "FiberCreme": 7, "Max Creamer": 0, "Indocafe": 5, "Kopi Luwak": 0, "Torabika": 0, "Kopiko": 5, "Caffino": 2, "Space Roastery": 0, "First Crack Coffee": 0, "Roemah Koffie": 0, "Kopi Gadjah": 0, "TOP Coffee": 0, "Kopi Liong Bulan": 0, "Golda Coffee": 0, "Kopken RTD": 0 },
  ];
  const sovRows = [
    { date: "Feb 13", "Krim Kafe": 0, "Nescafe": 50, "Kopi Luwak": 20, "Indocafe": 22, "Torabika": 17, "Kopiko": 11, "Caffino": 9, "Kopi Gadjah": 5, "TOP Coffee": 2, "Kopi Liong Bulan": 7, "Golda Coffee": 1, "Kopken RTD": 3, "Space Roastery": 0, "FiberCreme": 2, "Max Creamer": 1, "First Crack Coffee": 1, "Roemah Koffie": 0 },
    { date: "Feb 14", "Krim Kafe": 0, "Nescafe": 85, "Kopi Luwak": 31, "Indocafe": 27, "Torabika": 46, "Kopiko": 8, "Caffino": 11, "Kopi Gadjah": 8, "TOP Coffee": 6, "Kopi Liong Bulan": 1, "Golda Coffee": 2, "Kopken RTD": 0, "Space Roastery": 3, "FiberCreme": 1, "Max Creamer": 2, "First Crack Coffee": 0, "Roemah Koffie": 0 },
    { date: "Feb 15", "Krim Kafe": 0, "Nescafe": 60, "Kopi Luwak": 51, "Indocafe": 42, "Torabika": 35, "Kopiko": 20, "Caffino": 6, "Kopi Gadjah": 7, "TOP Coffee": 11, "Kopi Liong Bulan": 4, "Golda Coffee": 2, "Kopken RTD": 0, "Space Roastery": 2, "FiberCreme": 0, "Max Creamer": 1, "First Crack Coffee": 3, "Roemah Koffie": 0 },
    { date: "Feb 16", "Krim Kafe": 0, "Nescafe": 65, "Kopi Luwak": 28, "Indocafe": 8, "Torabika": 17, "Kopiko": 17, "Caffino": 25, "Kopi Gadjah": 17, "TOP Coffee": 6, "Kopi Liong Bulan": 2, "Golda Coffee": 5, "Kopken RTD": 4, "Space Roastery": 4, "FiberCreme": 1, "Max Creamer": 0, "First Crack Coffee": 1, "Roemah Koffie": 1 },
    { date: "Feb 17", "Krim Kafe": 0, "Nescafe": 35, "Kopi Luwak": 25, "Indocafe": 20, "Torabika": 14, "Kopiko": 23, "Caffino": 16, "Kopi Gadjah": 18, "TOP Coffee": 4, "Kopi Liong Bulan": 6, "Golda Coffee": 4, "Kopken RTD": 4, "Space Roastery": 0, "FiberCreme": 2, "Max Creamer": 1, "First Crack Coffee": 2, "Roemah Koffie": 2 },
    { date: "Feb 18", "Krim Kafe": 0, "Nescafe": 35, "Kopi Luwak": 14, "Indocafe": 8, "Torabika": 11, "Kopiko": 17, "Caffino": 2, "Kopi Gadjah": 4, "TOP Coffee": 4, "Kopi Liong Bulan": 4, "Golda Coffee": 1, "Kopken RTD": 0, "Space Roastery": 4, "FiberCreme": 2, "Max Creamer": 2, "First Crack Coffee": 0, "Roemah Koffie": 4 },
    { date: "Feb 19", "Krim Kafe": 0, "Nescafe": 70, "Kopi Luwak": 26, "Indocafe": 19, "Torabika": 4, "Kopiko": 19, "Caffino": 26, "Kopi Gadjah": 11, "TOP Coffee": 7, "Kopi Liong Bulan": 8, "Golda Coffee": 3, "Kopken RTD": 6, "Space Roastery": 1, "FiberCreme": 1, "Max Creamer": 1, "First Crack Coffee": 1, "Roemah Koffie": 1 },
  ];
  return {
    ...base,
    featureVisibility: {
      statsOverview: true,
      actionRecommendations: true,
      outletSatisfaction: false,
      risksOpportunities: true,
      competitiveAnalysis: true,
      recentInsights: true,
    },
    statsOverview: [
      { id: "1", label: "Average Sentiment", value: "0.0%", description: "Insufficient data to calculate sentiment", icon: "TrendingUp" },
      { id: "2", label: "Critical Issues", value: "1", description: "Zero digital footprint in the highly active 'home mixology' segment", icon: "AlertTriangle" },
      { id: "3", label: "Share of Voice", value: "0.0%", description: "Krim Kafe SOV vs 16 External Competitors", icon: "MessageSquare" },
      { id: "4", label: "Conversation Analyzed", value: "0", description: "Total validated Krim Kafe mentions across all platforms", icon: "Users" },
    ],
    priorityActions: [
      {
        id: "1",
        priority: "critical",
        title: "Reclaim the 'Perfect Coffee Pairing' Narrative",
        description: "Currently, Twitter audiences organically pair competitor 'Max Creamer' specifically with Indocafe for the ultimate creamy taste. Krim Kafe is completely absent from these DIY coffee hacks.",
        impact: "High",
        effort: "Medium",
        recommendation: "Launch a digital campaign explicitly pairing Krim Kafe with Kapal Api or Excelso beans as the 'ultimate SJA ecosystem combo' to hijack the mixology conversation.",
        category: "Brand Awareness",
        quadrantColor: "red",
        relatedIssues: ["Lost Mixology Market", "Zero Organic Recall"],
        metrics: { mentions: 0, sentiment: 0, trend: "Dead" },
        sourceContent: [
          {
            id: "pa1",
            platform: "twitter",
            author: "@competitor",
            content: "[Competitor Quote] Indocafe fine blend + max creamer + gula = ENAAAAKKKKK BANGET🤩",
            sentiment: 0,
            timestamp: "1 day ago",
            engagement: { likes: 0, replies: 0, retweets: 0 },
          },
        ],
      },
    ],
    outletSatisfaction: [],
    risks: [
      {
        id: "1",
        title: "Complete Disconnection from the Health Trend",
        description: "FiberCreme is aggressively capturing the 'health-conscious' and 'cholesterol-safe' market segment through both organic recommendations and PR. Krim Kafe has no voice in this growing narrative.",
        severity: "High",
        probability: 75,
        impact: "Market Share",
        trend: "Persistent",
        supportingContents: 1,
        indicators: [{ label: "Health Mentions", value: 0, change: 0 }],
        mitigation: ["Identify and heavily promote any nutritional advantages of Krim Kafe (e.g., trans-fat free, low sugar) using health-focused macro influencers."],
        sourceContent: [
          {
            id: "r1",
            platform: "twitter",
            author: "@user",
            content: "[Competitor Quote] beralih ke FiberCreme... cita rasa creamy, namun lebih tinggi serat dan bersahabat untuk kolesterol",
            sentiment: 0,
            timestamp: "1 day ago",
          },
        ],
      },
    ],
    opportunities: [
      {
        id: "1",
        title: "Untapped 'Food & Culinary' Integration",
        description: "Competitors are framing their creamers not just for coffee, but as a substitute for coconut milk (santan) in cooking. Krim Kafe can pivot to tap into the massive daily cooking/culinary audience.",
        potential: "High Sales Volume",
        confidence: 50,
        timeframe: "Long Term",
        category: "Product Usage",
        trend: "Stagnant",
        supportingContents: 1,
        metrics: { sentimentScore: 0, marketPotential: 50, reachGrowth: 0 },
        recommendations: ["Partner with cooking channels (e.g., EndeusTV, local TikTok chefs) to showcase Krim Kafe as a versatile kitchen ingredient."],
        sourceContent: [
          {
            id: "o1",
            platform: "twitter",
            author: "@user",
            content: "[No culinary data found for Krim Kafe]",
            sentiment: 0,
            timestamp: "1 day ago",
          },
        ],
      },
    ],
    competitiveIssues: [
      {
        id: "1",
        issue: "Total Eclipse in the Creamer Sub-Segment",
        yourMentions: 0,
        competitorMedianMentions: 8,
        relativeMentions: -100,
        yourSentiment: 0.0,
        competitorMedianSentiment: 0.87,
        relativeSentiment: -100,
        category: "Product Category",
      },
    ],
    competitiveKeyInsights: [
      {
        id: "1",
        type: "strength",
        title: "The Silent Creamer",
        description: "In the specific non-dairy creamer battleground, Krim Kafe (0) is entirely swept away by FiberCreme (9) and Max Creamer (8). While the volume seems small, the competitors' sentiment is extraordinarily high (>85% positive).",
        bullets: [
          "Max Creamer owns the 'taste and indulgence' narrative (frequently paired with Indocafe).",
          "FiberCreme owns the 'health, diet, and cooking' narrative.",
          "Krim Kafe currently lacks any defining narrative or digital presence.",
        ],
      },
    ],
    whatsHappeningSentimentTrends: [
      { date: "Feb 13", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 14", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 15", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 16", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 17", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 18", positive: 0, negative: 0, neutral: 0 },
      { date: "Feb 19", positive: 0, negative: 0, neutral: 0 },
    ],
    whatsHappeningKeyEvents: [
      { id: "1", date: "Feb 19", title: "No Events Detected", description: "No significant campaigns, viral threads, or organic usage related to Krim Kafe were found in the monitored timeframe." },
    ],
    whatsHappeningTopTopics: [
      { topic: "N/A", mentions: 0, sentiment: 0 },
    ],
    whatsHappeningAITopicAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Data Void",
        description: "The AI cannot process topical trends for Krim Kafe as the dataset yielded exactly zero valid matches for the brand.",
      },
    ],
    whatsHappeningTopicTrendsData: [
      { date: "Feb 13", Mixology: 0, Health: 0 },
      { date: "Feb 14", Mixology: 0, Health: 0 },
      { date: "Feb 15", Mixology: 0, Health: 0 },
      { date: "Feb 16", Mixology: 0, Health: 0 },
      { date: "Feb 17", Mixology: 0, Health: 0 },
      { date: "Feb 18", Mixology: 0, Health: 0 },
      { date: "Feb 19", Mixology: 0, Health: 0 },
    ],
    whatsHappeningAITrendAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Invisible Brand Status",
        description: "Krim Kafe is currently operating as a 'ghost brand' in the digital landscape, failing to capitalize on the rising trend of home-cafe mixology.",
      },
    ],
    whatsHappeningWordCloud: [
      { text: "no_data", weight: 100, sentiment: "neutral" },
    ],
    whatsHappeningClusters: [
      {
        id: "1",
        theme: "No Conversations",
        size: 0,
        sentiment: 0,
        trend: "stable",
        keywords: ["none"],
      },
    ],
    whatsHappeningHashtags: [],
    whatsHappeningAccounts: [],
    whatsHappeningContents: [],
    whatsHappeningKOLMatrix: [],
    whatsHappeningAIKOLAnalysis: [
      {
        id: "1",
        type: "insight",
        title: "Zero Influencer Utilization",
        description: "There is no evidence of culinary KOLs or lifestyle influencers pushing the Krim Kafe product.",
      },
    ],
    whatsHappeningShareOfPlatform: [
      { date: "Feb 13", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 14", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 15", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 16", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 17", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 18", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
      { date: "Feb 19", twitter: 0, youtube: 0, reddit: 0, instagram: 0, facebook: 0, tiktok: 0 },
    ],
    competitiveMatrixItems: [
      { id: "1", name: "Krim Kafe", mentions: 0, positivePercentage: 0.0, size: 0, color: "#808080" },
      { id: "2", name: "Nescafe", mentions: 400, positivePercentage: 31.8, size: 400, color: "#FF0000" },
      { id: "3", name: "Kopi Luwak", mentions: 195, positivePercentage: 31.8, size: 195, color: "#8B4513" },
      { id: "4", name: "Indocafe", mentions: 146, positivePercentage: 34.2, size: 146, color: "#D2691E" },
      { id: "5", name: "Torabika", mentions: 144, positivePercentage: 42.4, size: 144, color: "#A0522D" },
      { id: "6", name: "Kopiko", mentions: 115, positivePercentage: 5.2, size: 115, color: "#4B3621" },
      { id: "7", name: "Caffino", mentions: 95, positivePercentage: 46.3, size: 95, color: "#8A2BE2" },
      { id: "8", name: "Kopi Gadjah", mentions: 70, positivePercentage: 17.1, size: 70, color: "#555555" },
      { id: "9", name: "TOP Coffee", mentions: 40, positivePercentage: 32.5, size: 40, color: "#FF8C00" },
      { id: "10", name: "Kopi Liong Bulan", mentions: 32, positivePercentage: 12.5, size: 32, color: "#C0C0C0" },
      { id: "11", name: "Golda Coffee", mentions: 18, positivePercentage: 11.1, size: 18, color: "#FFD700" },
      { id: "12", name: "Kopken RTD", mentions: 17, positivePercentage: 52.9, size: 17, color: "#FF1493" },
      { id: "13", name: "Space Roastery", mentions: 14, positivePercentage: 7.1, size: 14, color: "#000000" },
      { id: "14", name: "FiberCreme", mentions: 9, positivePercentage: 88.8, size: 9, color: "#ADD8E6" },
      { id: "15", name: "Max Creamer", mentions: 8, positivePercentage: 87.5, size: 8, color: "#F5F5DC" },
      { id: "16", name: "First Crack Coffee", mentions: 8, positivePercentage: 50.0, size: 8, color: "#A52A2A" },
      { id: "17", name: "Roemah Koffie", mentions: 8, positivePercentage: 12.5, size: 8, color: "#DEB887" },
    ],
    competitiveQuadrantAnalysis: [
      { id: "1", label: "Coffee Giants", brands: "Nescafe, Kopi Luwak, Indocafe", note: "Massive overall volume" },
      { id: "2", label: "Creamer Leaders", brands: "FiberCreme, Max Creamer", note: "Low volume but extremely high product satisfaction" },
      { id: "3", label: "Danger Zone (Invisible)", brands: "Krim Kafe", note: "Zero awareness in the creamer battleground" },
    ],
    competitiveSentimentScores: sentimentRows.map((r) => toFullSentimentRow(r as Record<string, number | string>)),
    competitiveVolumeOfMentions: volumeRows.map((r) => toFullVolumeRow(r as Record<string, number | string>)),
    competitiveShareOfVoice: sovRows.map((r) => toShareOfVoiceRowKrimKafe(r as Record<string, number | string>)),
    competitiveBrandLabels: { yourBrand: "Krim Kafe", competitorA: "Nescafe", competitorB: "FiberCreme", competitorC: "Max Creamer", competitorD: "Indocafe" },
  };
}

function buildBeningsInitial(d: DashboardContentStore): DashboardContentStore {
  return {
    ...d,
    featureVisibility: {
      statsOverview: true,
      actionRecommendations: true,
      outletSatisfaction: false,
      risksOpportunities: true,
      competitiveAnalysis: true,
      recentInsights: true,
    },
    statsOverview: [
      { id: "1", label: "Average Sentiment",     value: "84.2%", description: "Positive sentiment ratio based on 1124 validated mentions",                        icon: "TrendingUp"    },
      { id: "2", label: "Critical Issues",        value: "12",    description: "Mentions flagged as 'High Risk' (Slow Admin Response, Queue Issues)",              icon: "AlertTriangle" },
      { id: "3", label: "Share of Voice",         value: "28.5%", description: "Bening's SOV vs 8 Major Competitors (ZAP, Erha, Sozo, etc.)",                     icon: "MessageSquare" },
      { id: "4", label: "Conversation Analyzed",  value: "1124",  description: "Total validated Bening's mentions in current dataset",                             icon: "Users"         },
    ],
    priorityActions: [
      {
        id: "1",
        priority: "critical",
        title: "Evaluate Reservation Admin Response Time (TikTok)",
        description: "Audiences on TikTok repeatedly complain about admins being slow or completely unresponsive to reservation inquiries. This creates a high risk of losing potential new leads generated from organic reach.",
        impact: "High",
        effort: "Medium",
        recommendation: "Integrate an auto-reply chatbot outside of operational hours and establish a strict 15-minute response KPI for the Customer Service team.",
        category: "Customer Service",
        quadrantColor: "red",
        relatedIssues: ["No Response", "Lost Leads"],
        metrics: { mentions: 12, sentiment: "Negative (15.5)", trend: "Increasing" },
        sourceContent: "aku reservasi ngga dijawab ma admin",
      },
      {
        id: "2",
        priority: "high",
        title: "Capitalize on Regional Branch Satisfaction (Kendari)",
        description: "Organic reviews on Google Maps highlight extremely high customer satisfaction regarding treatment results and consistent promo availability at the Kendari branch.",
        impact: "Medium",
        effort: "Low",
        recommendation: "Leverage these positive reviews from regional branches as User-Generated Content (UGC) for national digital campaigns to boost brand trust.",
        category: "Revenue & Operations",
        quadrantColor: "orange",
        relatedIssues: ["Promo Availability", "Treatment Efficacy"],
        metrics: { mentions: 45, sentiment: "Positive (89.0)", trend: "Stable" },
        sourceContent: "Treatment dibenings klinik kendari selalu memuaskan dan promonya ada teruss😍",
      },
      {
        id: "3",
        priority: "high",
        title: "Expand Skin Barrier Education (Deep Moisture Gel)",
        description: "Educational content specifically addressing skin barrier repair using Bening's products received the highest positive sentiment and engagement on Instagram.",
        impact: "High",
        effort: "Medium",
        recommendation: "Produce more educational carousel posts or doctor Q&A sessions focused on skin barrier treatments and relevant product pairings.",
        category: "Marketing & Content",
        quadrantColor: "green",
        relatedIssues: ["Product Knowledge", "Skin Barrier"],
        metrics: { mentions: 125, sentiment: "Positive (92.5)", trend: "Increasing" },
        sourceContent: "Selain melembapkan, Deep Moisture Gel juga bisa membantu untuk memperbaiki skin barrier lho! 👀",
      },
    ],
    outletSatisfaction: [],
    risks: [
      {
        id: "1",
        title: "Patient Churn Due to Slow Digital CS Response",
        description: "Impulsive prospective patients from TikTok FYP threaten to switch to rapidly growing competitors like Sozo or Derma Express if Bening's admins fail to respond promptly via DM or WhatsApp.",
        severity: "High",
        probability: 0.85,
        impact: "Missed Revenue",
        trend: "Increasing",
        supportingContents: 12,
        indicators: [{ label: "CS Sentiment", value: 15.5, change: -10 }],
        mitigation: ["Implement SLA tracking for all incoming social media messages and allocate a dedicated CS shift for high-traffic evening hours."],
        sourceContent: [
          { id: "r1-1", platform: "tiktok", author: "anonymous", content: "aku reservasi ngga dijawab ma admin", sentiment: -0.85, timestamp: "Mar 04", engagement: { likes: 12, replies: 2, retweets: 0 } },
        ],
      },
    ],
    opportunities: [
      {
        id: "1",
        title: "Regional Promo-Driven Loyalty Expansion",
        description: "Patients in regional branches (e.g., Kendari) exhibit high price-sensitivity and show strong repeat-purchase loyalty when treatments are bundled with affordable promotions, countering affordable clinics like Naavagreen.",
        potential: "High Growth",
        confidence: 0.89,
        timeframe: "Short Term",
        category: "Regional Loyalty",
        trend: "Trending",
        supportingContents: 45,
        metrics: { sentimentScore: 89 },
        recommendations: ["Ensure that national marketing promos are perfectly synchronized with stock and equipment readiness across all regional branches."],
        sourceContent: [
          { id: "o1-1", platform: "google_maps", author: "Nelam Astagina", content: "sudah berapa kali meso dibenings klinik kendari selalu memuaskan dan harga berkahh teruss promonya 😍", sentiment: 0.89, timestamp: "Mar 03", engagement: { likes: 5, replies: 0, retweets: 0 } },
        ],
      },
    ],
    competitiveIssues: [
      { id: "1", issue: "CS Response Delay vs ZAP & Sozo",              category: "Customer Service", yourMentions: 12,  competitorMedianMentions: 5.5,  yourSentiment: 15.5, competitorMedianSentiment: 78.0, relativeSentiment: -80.1, relativeMentions: 118.0 },
      { id: "2", issue: "Product Satisfaction Dominance (Skin Barrier)", category: "Product Quality",  yourMentions: 125, competitorMedianMentions: 48.0, yourSentiment: 92.5, competitorMedianSentiment: 83.0, relativeSentiment: 11.4,  relativeMentions: 160.0 },
      { id: "3", issue: "Price War vs Derma Express & Naavagreen",       category: "Pricing & Promo", yourMentions: 85,  competitorMedianMentions: 95.0, yourSentiment: 84.0, competitorMedianSentiment: 86.5, relativeSentiment: -2.8,  relativeMentions: -10.5 },
    ],
    competitiveKeyInsights: [
      {
        id: "1",
        type: "insight",
        title: "Expanded Competitive Landscape Analysis",
        description: "Bening's maintains a strong Share of Voice (28.5%) in a highly fragmented market, successfully defending its premium positioning against Erha and Dermaster, while simultaneously competing on volume and accessibility with Sozo, Derma Express, and Airin.",
        bullets: [
          "Bening's leads in Skincare Product Efficacy mentions (Deep Moisture Gel).",
          "ZAP and Sozo dominate the 'Fast & Seamless Booking' conversation.",
          "Derma Express and Naavagreen capture high volume in extreme price-sensitivity discussions.",
          "Dermaster and Erha Ultimate hold the premium contouring and clinical dermatology segments.",
        ],
      },
    ],
    whatsHappeningSentimentTrends: [
      { date: "Feb 27", positive: 50,  negative: 1, neutral: 10 },
      { date: "Feb 28", positive: 55,  negative: 5, neutral: 12 },
      { date: "Mar 01", positive: 60,  negative: 2, neutral: 15 },
      { date: "Mar 02", positive: 65,  negative: 3, neutral: 14 },
      { date: "Mar 03", positive: 80,  negative: 1, neutral: 18 },
      { date: "Mar 04", positive: 95,  negative: 4, neutral: 20 },
      { date: "Mar 05", positive: 85,  negative: 2, neutral: 16 },
    ],
    whatsHappeningKeyEvents: [
      { id: "1", date: "Mar 04", title: "Peak Engagement: Moisture Gel", description: "A drastic surge in positive engagement driven by the release of Deep Moisture Gel educational content on Instagram." },
    ],
    whatsHappeningTopTopics: [
      { topic: "Treatment Result & Satisfaction", mentions: 450, sentiment: 89.0 },
      { topic: "Product (Skincare)",              mentions: 320, sentiment: 92.5 },
      { topic: "Promo & Pricing",                 mentions: 210, sentiment: 84.0 },
      { topic: "Customer Service (Admin)",         mentions: 85,  sentiment: 15.5 },
      { topic: "Facility & Queuing",              mentions: 59,  sentiment: 60.0 },
    ],
    whatsHappeningAITopicAnalysis: [
      { id: "1", type: "trend", title: "CS Bottleneck Amidst High Demand", description: "AI detected an anomaly where high audience enthusiasm for promotional content directly correlates with an increase in negative sentiment due to slow admin response times." },
    ],
    whatsHappeningTopicTrendsData: [
      { date: "Mar 01", Treatment: 20, Product: 20, Promo: 15, "Admin CS": 2, Facility: 1 },
      { date: "Mar 02", Treatment: 25, Product: 25, Promo: 18, "Admin CS": 4, Facility: 1 },
      { date: "Mar 03", Treatment: 30, Product: 35, Promo: 25, "Admin CS": 3, Facility: 2 },
      { date: "Mar 04", Treatment: 40, Product: 55, Promo: 30, "Admin CS": 8, Facility: 3 },
      { date: "Mar 05", Treatment: 35, Product: 45, Promo: 28, "Admin CS": 5, Facility: 2 },
    ],
    whatsHappeningAITrendAnalysis: [
      { id: "1", type: "observation", title: "The Digital vs Physical Experience Gap", description: "The physical clinic experience (Treatment) consistently receives high praise, yet the very first digital touchpoint (online reservation) acts as the brand's biggest pain point." },
    ],
    whatsHappeningWordCloud: [
      { text: "treatment", weight: 250, sentiment: "positive" },
      { text: "benings",   weight: 230, sentiment: "positive" },
      { text: "promo",     weight: 180, sentiment: "positive" },
      { text: "gel",       weight: 120, sentiment: "positive" },
      { text: "memuaskan", weight: 95,  sentiment: "positive" },
      { text: "admin",     weight: 40,  sentiment: "negative" },
      { text: "lama",      weight: 25,  sentiment: "negative" },
    ],
    whatsHappeningClusters: [
      { id: "1", theme: "Product Efficacy & Moisture", size: 45, sentiment:  0.92, trend: "upward",   keywords: ["gel", "barrier", "lembab", "kulit"] },
      { id: "2", theme: "Booking Frustrations",        size: 15, sentiment: -0.55, trend: "upward",   keywords: ["admin", "balas", "reservasi", "lama"] },
    ],
    whatsHappeningHashtags: [
      { id: "1", tag: "#BeningsIndonesia",  conversations: 450, likes: 12500, comments: 890 },
      { id: "2", tag: "#Skinmology",        conversations: 125, likes: 4200,  comments: 320 },
      { id: "3", tag: "#RamadanGlowDeals",  conversations: 85,  likes: 3100,  comments: 150 },
    ],
    whatsHappeningAccounts: [
      { id: "1", name: "Bening's Indonesia", handle: "@beningsindonesia",       platform: "instagram", followers: 1250000, conversations: 18, likes: 8500, replies: 420 },
      { id: "2", name: "Bening's Clinic",    handle: "@beningsclinicindonesia", platform: "tiktok",    followers: 850000,  conversations: 12, likes: 5600, replies: 380 },
    ],
    whatsHappeningContents: [
      { id: "1", title: "Selain melembapkan, Deep Moisture Gel juga bisa membantu untuk memperbaiki skin barrier...",          platform: "instagram",  author: "beningsindonesia", likes: 125, comments: 5 },
      { id: "2", title: "Treatment dibenings klinik kendari selalu memuaskan dan promonya ada teruss😍",                      platform: "google maps", author: "wiwi ramli",       likes: 2,   comments: 0 },
      { id: "3", title: "sudah berapa kali meso dibenings klinik kendari selalu memuaskan dan harga berkahh teruss promonya 😍", platform: "google maps", author: "Nelam Astagina",   likes: 5,   comments: 0 },
      { id: "4", title: "aku reservasi ngga dijawab ma admin",                                                                 platform: "tiktok",      author: "anonymous",        likes: 12,  comments: 2 },
    ],
    whatsHappeningKOLMatrix: [
      { id: "1", name: "Bening's Official",   followers: 1250000, positivity: 95, engagement: 88, color: "blue",  category: "Official" },
      { id: "2", name: "Google Local Guides", followers: 500,     positivity: 85, engagement: 60, color: "green", category: "Organic"  },
    ],
    whatsHappeningAIKOLAnalysis: [
      { id: "1", type: "insight", title: "Instagram as the Primary Trust Engine",   description: "Educational content published via the official Instagram account proves highly effective in building audience trust in skincare products." },
      { id: "2", type: "insight", title: "Local Validation via Google Maps",        description: "Authentic reviews from real customers on Google Maps serve as strong local validation, heavily influencing audiences seeking reassurance before booking." },
    ],
    whatsHappeningShareOfPlatform: [
      { date: "Mar 01", twitter: 15, instagram: 45, facebook: 0, tiktok: 20, googlemaps: 20 },
      { date: "Mar 02", twitter: 10, instagram: 50, facebook: 0, tiktok: 25, googlemaps: 15 },
      { date: "Mar 03", twitter: 5,  instagram: 55, facebook: 0, tiktok: 30, googlemaps: 10 },
      { date: "Mar 04", twitter: 10, instagram: 60, facebook: 0, tiktok: 20, googlemaps: 10 },
      { date: "Mar 05", twitter: 12, instagram: 58, facebook: 0, tiktok: 22, googlemaps: 8  },
    ],
    competitiveMatrixItems: [
      {
        id: "1", name: "Bening's", mentions: 1124, positivePercentage: 84.2, size: 1124, color: "#E5001C",
        keywords: ["pelayanan", "ramah", "treatment", "promo", "nyaman", "reservasi", "admin", "skin barrier", "moisture gel", "kendari"],
        competitivePosition: "Strong leader in product efficacy perception (skin barrier) and regional promo results, but digital reservation responsiveness is a critical vulnerability.",
      },
      {
        id: "2", name: "ZAP", mentions: 850, positivePercentage: 81.5, size: 850, color: "#81B622",
        keywords: ["booking", "online experience", "treatment", "lebaran", "promo"],
        competitivePosition: "Benchmark leader for seamless online booking and digital customer journey, maintaining high baseline satisfaction.",
      },
      {
        id: "3", name: "Erha", mentions: 620, positivePercentage: 75.0, size: 620, color: "#00529C",
        keywords: ["premium", "dermatology", "clinic", "ultimate", "expert"],
        competitivePosition: "Dominant clinical expert in high-end dermatology with a strong medical reputation, though slightly lower sentiment in mass-market engagement.",
      },
      {
        id: "4", name: "Sozo", mentions: 410, positivePercentage: 82.0, size: 410, color: "#6366F1",
        keywords: ["booking", "fast response", "modern"],
        competitivePosition: "Rising contender with a focus on modern clinical experiences and fast-response customer service channels.",
      },
      {
        id: "5", name: "Natasha", mentions: 310, positivePercentage: 68.0, size: 310, color: "#FFA500",
        keywords: ["skincare", "tradisional", "promo"],
        competitivePosition: "Established traditional player with deep market penetration, but currently experiencing low digital sentiment and engagement.",
      },
      {
        id: "6", name: "Derma Express", mentions: 280, positivePercentage: 85.0, size: 280, color: "#14B8A6",
        keywords: ["cakep", "terjangkau", "ekspansi"],
        competitivePosition: "High-growth player winning on the 'aesthetic but affordable' value proposition with high positive sentiment.",
      },
      {
        id: "7", name: "Dermaster", mentions: 150, positivePercentage: 88.0, size: 150, color: "#D946EF",
        keywords: ["contouring", "premium", "mahal"],
        competitivePosition: "Premium niche leader in facial contouring and clinical results, commanding high sentiment but lower overall volume.",
      },
      {
        id: "8", name: "Airin", mentions: 110, positivePercentage: 76.0, size: 110, color: "#F43F5E",
        keywords: ["jerawat", "konsultasi", "lokal"],
        competitivePosition: "Specialized local clinic with strong trust in acne treatment and personalized consultation.",
      },
      {
        id: "9", name: "Naavagreen", mentions: 95, positivePercentage: 65.0, size: 95, color: "#84CC16",
        keywords: ["murah", "terjangkau", "antrian"],
        competitivePosition: "Market leader in the extreme budget segment, though struggling with high negative sentiment regarding queue times and facility quality.",
      },
    ],
    competitiveQuadrantAnalysis: [
      { id: "1", label: "Market Leaders",           brands: ["Bening's", "ZAP", "Erha"],             note: "High Volume, Broad Market Reach" },
      { id: "2", label: "Fast Growing Contenders",  brands: ["Sozo", "Derma Express"],                note: "High positive sentiment, aggressive expansion" },
      { id: "3", label: "Premium Niche",            brands: ["Dermaster"],                            note: "Lower volume, very high satisfaction in contouring" },
      { id: "4", label: "Established Traditional",  brands: ["Natasha", "Naavagreen", "Airin"],       note: "High brand awareness, varying digital engagement" },
    ],
    competitiveSentimentScores: [
      { issue: "Treatment Result", "Bening's": 89, ZAP: 85, Erha: 88, Sozo: 82, Natasha: 75, "Derma Express": 84, Dermaster: 92, Airin: 78, Naavagreen: 70 },
      { issue: "Admin Response",   "Bening's": 15, ZAP: 82, Erha: 60, Sozo: 78, Natasha: 50, "Derma Express": 65, Dermaster: 85, Airin: 55, Naavagreen: 45 },
      { issue: "Product Quality",  "Bening's": 92, ZAP: 70, Erha: 90, Sozo: 75, Natasha: 80, "Derma Express": 80, Dermaster: 85, Airin: 82, Naavagreen: 68 },
      { issue: "Promo & Pricing",  "Bening's": 84, ZAP: 65, Erha: 55, Sozo: 88, Natasha: 70, "Derma Express": 90, Dermaster: 40, Airin: 75, Naavagreen: 95 },
      { issue: "Facility & Queuing","Bening's": 60, ZAP: 85, Erha: 75, Sozo: 80, Natasha: 65, "Derma Express": 72, Dermaster: 88, Airin: 68, Naavagreen: 50 },
    ],
    competitiveVolumeOfMentions: [
      { issue: "Treatment", "Bening's": 450, ZAP: 320, Erha: 250, Sozo: 180, Natasha: 150, "Derma Express": 140, Dermaster: 85, Airin: 60, Naavagreen: 45 },
      { issue: "Admin",     "Bening's": 85,  ZAP: 40,  Erha: 35,  Sozo: 25,  Natasha: 20,  "Derma Express": 30,  Dermaster: 10, Airin: 15, Naavagreen: 10 },
      { issue: "Product",   "Bening's": 320, ZAP: 150, Erha: 210, Sozo: 80,  Natasha: 90,  "Derma Express": 60,  Dermaster: 30, Airin: 25, Naavagreen: 20 },
      { issue: "Promo",     "Bening's": 210, ZAP: 180, Erha: 80,  Sozo: 95,  Natasha: 30,  "Derma Express": 40,  Dermaster: 15, Airin: 5,  Naavagreen: 15 },
      { issue: "Facility",  "Bening's": 59,  ZAP: 160, Erha: 45,  Sozo: 30,  Natasha: 20,  "Derma Express": 10,  Dermaster: 10, Airin: 5,  Naavagreen: 5  },
    ],
    competitiveShareOfVoice: [
      { date: "Mar 01", "Bening's": 28, ZAP: 22, Erha: 15, Sozo: 10, Natasha: 8, "Derma Express": 7, Dermaster: 4, Airin: 3, Naavagreen: 3 },
      { date: "Mar 02", "Bening's": 29, ZAP: 21, Erha: 14, Sozo: 11, Natasha: 8, "Derma Express": 8, Dermaster: 3, Airin: 3, Naavagreen: 3 },
      { date: "Mar 03", "Bening's": 27, ZAP: 23, Erha: 16, Sozo: 10, Natasha: 7, "Derma Express": 7, Dermaster: 4, Airin: 4, Naavagreen: 2 },
      { date: "Mar 04", "Bening's": 30, ZAP: 20, Erha: 15, Sozo: 12, Natasha: 7, "Derma Express": 6, Dermaster: 4, Airin: 3, Naavagreen: 3 },
      { date: "Mar 05", "Bening's": 28, ZAP: 22, Erha: 15, Sozo: 11, Natasha: 8, "Derma Express": 7, Dermaster: 3, Airin: 3, Naavagreen: 3 },
    ],
    competitiveBrandLabels: {
      yourBrand: "Bening's",
      competitors: ["ZAP", "Erha", "Sozo", "Natasha", "Derma Express", "Dermaster", "Airin", "Naavagreen"],
    },

    // ── Campaign Analysis ─────────────────────────────────────────────────────
    campaignStats: [
      { id: "1", label: "Total Likes",         value: "2,710",  change: "+21%", positive: true,  description: "Total likes across all active campaigns",         icon: "Heart"        },
      { id: "2", label: "Total Shares",        value: "147",    change: "+8%",  positive: true,  description: "Total shares / reposts across all platforms",     icon: "Share2"       },
      { id: "3", label: "Total Replies",       value: "662",    change: "+25%", positive: true,  description: "Total replies & comments from audience",          icon: "MessageCircle" },
      { id: "4", label: "Positive Reply Rate", value: "86.5%",  change: "+3%",  positive: true,  description: "Percentage of replies carrying positive sentiment",icon: "ThumbsUp"     },
    ],
    campaignPerformance: [
      { id: "1", name: "Brand Core - Bening's IG",    platform: "Instagram",   likes: 1820, shares: 85, replies: 150, sentiment: 92.5, status: "active"    },
      { id: "2", name: "Brand Core - Bening's TikTok",platform: "TikTok",      likes: 630,  shares: 27, replies: 285, sentiment: 78.5, status: "active"    },
      { id: "3", name: "Bening's Brand & Issue",       platform: "Twitter",     likes: 215,  shares: 35, replies: 85,  sentiment: 65.5, status: "active"    },
      { id: "4", name: "Outlet Review & Sentiment",    platform: "Google Maps", likes: 45,   shares: 0,  replies: 142, sentiment: 89.0, status: "active"    },
    ],
    campaignTrendData: [
      { id: "1", month: "Feb 2026", likes: 950,  shares: 45,  replies: 210 },
      { id: "2", month: "Mar 2026", likes: 1760, shares: 102, replies: 452 },
    ],
    campaignTimeSeriesData: [
      { id: "1", date: "28 Feb", likes: 120, shares: 5,  replies: 25  },
      { id: "2", date: "01 Mar", likes: 150, shares: 8,  replies: 30  },
      { id: "3", date: "02 Mar", likes: 165, shares: 10, replies: 35  },
      { id: "4", date: "03 Mar", likes: 210, shares: 12, replies: 45  },
      { id: "5", date: "04 Mar", likes: 550, shares: 45, replies: 120 },
      { id: "6", date: "05 Mar", likes: 350, shares: 32, replies: 112 },
    ],
    campaignPostPublishEvents: [
      { id: "1", date: "04 Mar", label: "Deep Moisture Gel Content Viral",  type: "reel"        },
      { id: "2", date: "05 Mar", label: "TikTok CS Complaints Spike",       type: "short_video" },
    ],
    campaignKeyEvents: [
      { id: "1", date: "Mar 04", title: "Educational Content Success",   type: "spike", insight: "The Instagram Reel explaining skin barrier repair utilizing 'Deep Moisture Gel' generated massive positive engagement, driving over 550 likes in a single day." },
      { id: "2", date: "Mar 05", title: "TikTok Admin Response Delay",   type: "drop",  insight: "A surge in TikTok video reach led to an influx of booking inquiries, which subsequently turned into negative replies as users complained about admins failing to respond." },
    ],
    campaignReplySentiment: {
      positive: 572,
      neutral:  60,
      negative: 30,
    },
    campaignReplyTopics: [
      {
        id: "1",
        topic: "Skin Barrier & Hydration",
        totalReplies: 45,
        positive: 40,
        neutral:  3,
        negative: 2,
        topComments: [
          "Deep Moisture Gel beneran bikin kulit glowing!",
          "Skin barrier ku udah jauh lebih baik setelah pakai ini",
          "Recommended banget buat kulit kering",
        ],
      },
      {
        id: "2",
        topic: "Admin Responsiveness",
        totalReplies: 35,
        positive: 5,
        neutral:  5,
        negative: 25,
        topComments: [
          "aku reservasi ngga dijawab ma admin",
          "Chat udah 2 hari masih belum dibales",
          "Ngga ada respon dari admin sama sekali",
        ],
      },
      {
        id: "3",
        topic: "Promo & Pricing",
        totalReplies: 20,
        positive: 17,
        neutral:  2,
        negative: 1,
        topComments: [
          "promonya ada teruss, worth it banget!",
          "Harga berkah, kualitas premium",
          "Promo Ramadan-nya keren banget",
        ],
      },
    ],
    campaignContentTypes: [
      {
        id: "1",
        type: "Educational Skincare Content",
        platform: "Instagram",
        posts: 15,
        likes: 1820,
        shares: 85,
        replies: 150,
        positiveSentiment: 92,
        negativeSentiment: 3,
        topTopics: ["Skin Barrier", "Product Efficacy", "Deep Moisture Gel"],
        audienceReaction: "Highly Positive",
      },
      {
        id: "2",
        type: "Promotional TikTok Videos",
        platform: "TikTok",
        posts: 20,
        likes: 630,
        shares: 27,
        replies: 285,
        positiveSentiment: 65,
        negativeSentiment: 25,
        topTopics: ["Promo Prices", "Booking Procedures", "Admin Response"],
        audienceReaction: "Mixed (High Interest, High Frustration)",
      },
      {
        id: "3",
        type: "Local Outlet Reviews",
        platform: "Google Maps",
        posts: 142,
        likes: 45,
        shares: 0,
        replies: 142,
        positiveSentiment: 89,
        negativeSentiment: 5,
        topTopics: ["Treatment Results", "Branch Service Quality", "Kendari Promos"],
        audienceReaction: "Highly Positive",
      },
    ],
    campaignTopPosts: [
      { id: "1", type: "reel",        title: "Skin barrier repair with Deep Moisture Gel",        platform: "Instagram",   likes: 550, shares: 45, replies: 120, sentiment: 0.93 },
      { id: "2", type: "short_video", title: "Bening's Promo Ramadan 2026 – Booking Now!",        platform: "TikTok",      likes: 210, shares: 18, replies: 85,  sentiment: 0.72 },
      { id: "3", type: "image",       title: "Testimoni: Treatment Meso di Kendari",              platform: "Instagram",   likes: 185, shares: 12, replies: 32,  sentiment: 0.91 },
      { id: "4", type: "thread",      title: "Bening's vs kompetitor: mana yang lebih worth it?", platform: "Twitter",     likes: 95,  shares: 20, replies: 42,  sentiment: 0.70 },
    ],
    campaignChannels: [
      { id: "1", name: "Instagram",   likes: 1820, replies: 150, shares: 85,  posts: 125, icon: "Instagram", color: "#E1306C" },
      { id: "2", name: "TikTok",      likes: 630,  replies: 285, shares: 27,  posts: 65,  icon: "Music",     color: "#010101" },
      { id: "3", name: "Twitter",     likes: 215,  replies: 85,  shares: 35,  posts: 85,  icon: "Twitter",   color: "#1DA1F2" },
      { id: "4", name: "Google Maps", likes: 45,   replies: 142, shares: 0,   posts: 142, icon: "Map",       color: "#4285F4" },
    ],
    campaignCompetitors: [
      { id: "1", brand: "Bening's",      posts: 417, likes: 2710, replies: 662, shares: 147, sentiment: 84.2 },
      { id: "2", brand: "ZAP Clinic",    posts: 280, likes: 1850, replies: 410, shares: 95,  sentiment: 81.5 },
      { id: "3", brand: "Erha",          posts: 210, likes: 1520, replies: 320, shares: 65,  sentiment: 75.0 },
      { id: "4", brand: "Sozo",          posts: 185, likes: 1120, replies: 210, shares: 45,  sentiment: 82.0 },
      { id: "5", brand: "Derma Express", posts: 150, likes: 980,  replies: 185, shares: 50,  sentiment: 85.0 },
      { id: "6", brand: "Natasha",       posts: 95,  likes: 450,  replies: 90,  shares: 15,  sentiment: 68.0 },
      { id: "7", brand: "Dermaster",     posts: 65,  likes: 320,  replies: 85,  shares: 10,  sentiment: 88.0 },
      { id: "8", brand: "Airin",         posts: 55,  likes: 280,  replies: 65,  shares: 12,  sentiment: 76.0 },
      { id: "9", brand: "Naavagreen",    posts: 45,  likes: 190,  replies: 55,  shares: 8,   sentiment: 65.0 },
    ],
    campaignRecommendations: [
      { id: "1", priority: "high", title: "Amplify Skin Barrier Education Campaigns",    detail: "Educational carousels and Reels focusing on skin barrier repair with the 'Deep Moisture Gel' generated the highest organic sentiment on Instagram. Allocate a larger ad budget to boost these specific formats to maximize product awareness.", impact: "High" },
      { id: "2", priority: "high", title: "Optimize TikTok Booking Funnel & CS SLAs",   detail: "Despite substantial engagement on TikTok promotional content, overall campaign sentiment is dragged down by poor admin response times. It is imperative to optimize the digital customer journey by implementing auto-replies before scaling TikTok ad spend.", impact: "High" },
    ],

    // ── Outlet Analysis ───────────────────────────────────────────────────────
    outletStats: [
      { id: "1", label: "Total Outlets Analyzed", value: "15",      change: "",     positive: true,  description: "Total cabang Bening's Clinic yang dimonitor dalam periode ini", icon: "MapPin"       },
      { id: "2", label: "Average Rating",          value: "4.7",     change: "",     positive: true,  description: "Rata-rata rating Google Maps seluruh cabang",                  icon: "Star"         },
      { id: "3", label: "Reviews Analyzed",        value: "8",       change: "",     positive: true,  description: "Total ulasan baru yang berhasil dianalisis pada periode ini",   icon: "MessageSquare"},
      { id: "4", label: "Overall Sentiment",       value: "Positive",change: "",     positive: true,  description: "Sentimen keseluruhan berdasarkan ulasan baru yang masuk",       icon: "TrendingUp"   },
    ],
    outletPriorityActions: [
      {
        id: "1",
        priority: "high",
        outlet: "Bening's Clinic Tasikmalaya",
        region: "Jawa Barat",
        title: "Hospitality & Communication Training for Front-line Staff",
        detail: "Reviews highlight a gap between excellent physical facilities and subpar human interaction quality. Doctors and front-liners need to be more informative and welcoming towards patients.",
        impact: "High",
      },
      {
        id: "2",
        priority: "medium",
        outlet: "All Silent Branches (12 Outlets)",
        region: "Nasional",
        title: "Implement Automated Post-Treatment Review Campaign",
        detail: "12 of 15 branches received zero new reviews this period, limiting SEO visibility and operational insights. Launch an automated WhatsApp blast requesting honest reviews after each treatment session.",
        impact: "Medium",
      },
      {
        id: "3",
        priority: "low",
        outlet: "Bening's Clinic Bogor",
        region: "Jawa Barat",
        title: "Replicate Bogor's Service Model Nationwide",
        detail: "Bogor branch consistently receives the highest praise for admin responsiveness and promos. Document their SOP and staff communication approach as the national service benchmark.",
        impact: "High",
      },
    ],
    outletMapData: [
      { id: "1",  name: "Bening's Clinic Bogor",       region: "Jawa Barat",     city: "Bogor",       lat: -6.595,  lng: 106.816, status: "good",    satisfaction: 0.90, reviews: 1048, issues: []                                               },
      { id: "2",  name: "Bening's Clinic Sidoarjo",    region: "Jawa Timur",     city: "Sidoarjo",    lat: -7.446,  lng: 112.718, status: "good",    satisfaction: 0.82, reviews: 248,  issues: []                                               },
      { id: "3",  name: "Bening's Clinic Tasikmalaya", region: "Jawa Barat",     city: "Tasikmalaya", lat: -7.327,  lng: 108.220, status: "warning", satisfaction: 0.55, reviews: 353,  issues: ["Staff Hospitality", "Doctor Communication"]    },
      { id: "4",  name: "Bening's Clinic Cibubur",     region: "DKI Jakarta",    city: "Cibubur",     lat: -6.375,  lng: 106.900, status: "good",    satisfaction: 0.88, reviews: 506,  issues: []                                               },
      { id: "5",  name: "Bening's Clinic Samarinda",   region: "Kalimantan Timur",city: "Samarinda",  lat: -0.502,  lng: 117.155, status: "good",    satisfaction: 0.86, reviews: 203,  issues: []                                               },
      { id: "6",  name: "Bening's Clinic Solo",        region: "Jawa Tengah",    city: "Solo",        lat: -7.575,  lng: 110.825, status: "good",    satisfaction: 0.89, reviews: 628,  issues: []                                               },
      { id: "7",  name: "Bening's Clinic Malang",      region: "Jawa Timur",     city: "Malang",      lat: -7.983,  lng: 112.621, status: "good",    satisfaction: 0.89, reviews: 634,  issues: []                                               },
      { id: "8",  name: "Bening's Clinic Gresik",      region: "Jawa Timur",     city: "Gresik",      lat: -7.157,  lng: 112.655, status: "good",    satisfaction: 0.85, reviews: 0,    issues: []                                               },
      { id: "9",  name: "Bening's Clinic Karawang",    region: "Jawa Barat",     city: "Karawang",    lat: -6.321,  lng: 107.324, status: "good",    satisfaction: 0.88, reviews: 157,  issues: []                                               },
      { id: "10", name: "Bening's Clinic Jember",      region: "Jawa Timur",     city: "Jember",      lat: -8.169,  lng: 113.700, status: "good",    satisfaction: 0.88, reviews: 467,  issues: []                                               },
      { id: "11", name: "Bening's Clinic Cirebon",     region: "Jawa Barat",     city: "Cirebon",     lat: -6.732,  lng: 108.552, status: "good",    satisfaction: 0.88, reviews: 540,  issues: []                                               },
      { id: "12", name: "Bening's Clinic Metro",       region: "Lampung",        city: "Metro",       lat: -5.113,  lng: 105.307, status: "good",    satisfaction: 0.92, reviews: 185,  issues: []                                               },
      { id: "13", name: "Bening's Clinic Cimahi",      region: "Jawa Barat",     city: "Cimahi",      lat: -6.871,  lng: 107.543, status: "good",    satisfaction: 0.88, reviews: 124,  issues: []                                               },
      { id: "14", name: "Bening's Clinic Cilegon",     region: "Banten",         city: "Cilegon",     lat: -6.002,  lng: 106.025, status: "good",    satisfaction: 0.88, reviews: 302,  issues: []                                               },
      { id: "15", name: "Bening's Clinic Kudus",       region: "Jawa Tengah",    city: "Kudus",       lat: -6.804,  lng: 110.840, status: "good",    satisfaction: 0.92, reviews: 144,  issues: []                                               },
    ],
    outletSentimentOverall: { positive: 78, neutral: 14, negative: 8 },
    outletSentimentByOutlet: [
      { id: "1", name: "Bogor",       positive: 90, neutral: 7,  negative: 3  },
      { id: "2", name: "Sidoarjo",    positive: 82, neutral: 12, negative: 6  },
      { id: "3", name: "Tasikmalaya", positive: 60, neutral: 20, negative: 20 },
    ],
    outletTopics: [
      { id: "1", topic: "Facility & Cleanliness",  mentions: 185, positive: 170, negative: 15 },
      { id: "2", topic: "Staff Friendliness",       mentions: 142, positive: 110, negative: 32 },
      { id: "3", topic: "Treatment Results",        mentions: 98,  positive: 92,  negative: 6  },
      { id: "4", topic: "Promo & Pricing",          mentions: 75,  positive: 70,  negative: 5  },
      { id: "5", topic: "Doctor Communication",     mentions: 45,  positive: 28,  negative: 17 },
    ],
    outletRecentReviews: [
      { id: "1", outlet: "Bogor",       sentiment: "positive", text: "Admin responsif, informatif, ramah, fasilitas nyaman dan banyak promo. Puas banget sama pelayanannya!", stars: 5 },
      { id: "2", outlet: "Bogor",       sentiment: "positive", text: "Klinik paling recommended di Bogor. Dokternya sabar jelasin treatment dan hasilnya memuaskan.", stars: 5 },
      { id: "3", outlet: "Sidoarjo",    sentiment: "positive", text: "Pelayanan ramah dari CS hingga dokter, serta tempat yang bersih. Sangat nyaman untuk treatment.", stars: 5 },
      { id: "4", outlet: "Sidoarjo",    sentiment: "positive", text: "Staff ramah dan profesional. Tempat bersih dan nyaman. Recommended banget untuk warga Sidoarjo!", stars: 5 },
      { id: "5", outlet: "Tasikmalaya", sentiment: "positive", text: "Tempat nyaman, luas, bersih, dan fasilitas lumayan lengkap. Gedungnya bagus banget.", stars: 4 },
      { id: "6", outlet: "Tasikmalaya", sentiment: "negative", text: "Fasilitas oke tapi keramahan front liner dan dokter perlu ditingkatkan, kurang informatif ke pasien.", stars: 3 },
      { id: "7", outlet: "Tasikmalaya", sentiment: "neutral",  text: "Tempatnya nyaman dan bersih. Cuma pelayanan perlu lebih ditingkatkan lagi, terutama info soal treatment.", stars: 3 },
      { id: "8", outlet: "Bogor",       sentiment: "positive", text: "Promo terus ada dan admin cepet banget responnya kalau mau booking. Jadi langganan sini deh!", stars: 5 },
    ],

    // ── Raw Source Contents ───────────────────────────────────────────────────
    rawSourceContents: [
      { id: "src-1", source: "Social_Media", platform: "instagram", author: "beningsindonesia",       content: "Selain melembapkan, Deep Moisture Gel juga bisa membantu untuk memperbaiki skin barrier lho! 👀 Coba yuk dan rasakan perbedaannya.",                                                   date: "04 Mar 2026", sentiment: 0.93,  cluster: "Product (Skincare)",       risk: "-",                         opportunity: "Skin Barrier Edu",        engagement: 125 },
      { id: "src-2", source: "Social_Media", platform: "instagram", author: "beningsindonesia",       content: "Testimoni pelanggan Bening's Kendari: treatment meso hasilnya selalu memuaskan! 😍 Promo terus ada untuk kalian.",                                                                     date: "03 Mar 2026", sentiment: 0.91,  cluster: "Treatment Result & Satisfaction", risk: "-",                 opportunity: "Regional Loyalty",        engagement: 185 },
      { id: "src-3", source: "Social_Media", platform: "tiktok",    author: "beningsclinicindonesia", content: "Bening's Promo Ramadan 2026 – Booking sekarang dan dapatkan harga spesial! Slot terbatas ya besties 🌙✨",                                                                           date: "02 Mar 2026", sentiment: 0.78,  cluster: "Promo & Pricing",          risk: "Admin Response Delay",      opportunity: "Promo Campaign",          engagement: 210 },
      { id: "src-4", source: "Social_Media", platform: "tiktok",    author: "anonymous",              content: "aku reservasi ngga dijawab ma admin, udah 2 hari masih belum direspons. kecewa banget sama @beningsclinicindonesia",                                                                  date: "05 Mar 2026", sentiment: -0.85, cluster: "Customer Service (Admin)", risk: "Patient Churn",             opportunity: "-",                       engagement: 12  },
      { id: "src-5", source: "Social_Media", platform: "twitter",   author: "@beautynerd_id",         content: "Bening's vs ZAP, mana yang lebih worth it buat treatment kulit? Thread 🧵 (baca sampai habis ya)",                                                                                   date: "03 Mar 2026", sentiment: 0.70,  cluster: "Competitive Analysis",     risk: "-",                         opportunity: "Brand Positioning",       engagement: 95  },
      { id: "src-6", source: "Social_Media", platform: "twitter",   author: "@skincare_jakarta",      content: "Pengguna Bening's mengeluh respons admin yang lambat. Apakah ini masalah sistemik atau hanya cabang tertentu saja?",                                                                  date: "05 Mar 2026", sentiment: -0.55, cluster: "Customer Service (Admin)", risk: "Brand Reputation",          opportunity: "-",                       engagement: 45  },
      { id: "src-7", source: "App_Review",   platform: "google maps",author: "wiwi ramli",            content: "Treatment dibenings klinik kendari selalu memuaskan dan promonya ada teruss😍",                                                                                                      date: "01 Mar 2026", sentiment: 0.89,  cluster: "Treatment Result & Satisfaction", risk: "-",                 opportunity: "Regional Loyalty",        engagement: 2,  rating: 5 },
      { id: "src-8", source: "App_Review",   platform: "google maps",author: "Nelam Astagina",        content: "sudah berapa kali meso dibenings klinik kendari selalu memuaskan dan harga berkahh teruss promonya 😍",                                                                               date: "28 Feb 2026", sentiment: 0.89,  cluster: "Promo & Pricing",          risk: "-",                         opportunity: "Regional Loyalty",        engagement: 5,  rating: 5 },
      { id: "src-9", source: "App_Review",   platform: "google maps",author: "anonymous_reviewer",    content: "Antrean panjang dan staff kurang responsif. Perlu evaluasi sistem antrean terutama di jam sibuk.",                                                                                    date: "04 Mar 2026", sentiment: -0.45, cluster: "Facility & Queuing",       risk: "Queue Issues",              opportunity: "-",                       engagement: 3,  rating: 2 },
      { id: "src-10", source: "Social_Media",platform: "instagram", author: "user_skincare_05",       content: "Skin barrier ku udah jauh lebih baik setelah rutin pakai Deep Moisture Gel dari Bening's. Worth every penny! 💧",                                                                   date: "04 Mar 2026", sentiment: 0.92,  cluster: "Product (Skincare)",       risk: "-",                         opportunity: "Skin Barrier Edu",        engagement: 45  },
      { id: "src-11", source: "Social_Media",platform: "instagram", author: "user_review_bng",        content: "Udah 3 bulan pakai rangkaian skincare Bening's dan hasilnya konsisten. Recommended untuk yang punya masalah kulit sensitif!",                                                        date: "02 Mar 2026", sentiment: 0.88,  cluster: "Product (Skincare)",       risk: "-",                         opportunity: "Product Advocacy",        engagement: 78  },
      { id: "src-12", source: "Social_Media",platform: "tiktok",    author: "user_tiktok_kecewa",     content: "Chat udah 2 hari masih belum dibales sama admin @beningsklinikindonesia. Mau booking treatment tapi gabisa karena ga ada respons.",                                                  date: "05 Mar 2026", sentiment: -0.80, cluster: "Customer Service (Admin)", risk: "Patient Churn",             opportunity: "-",                       engagement: 28  },
      // Outlet Analysis Source Contents
      { id: "src-13", source: "App_Review",  platform: "google maps",author: "Rini Andrianti",          content: "Admin responsif, informatif, ramah, fasilitas nyaman dan banyak promo. Puas banget sama pelayanannya!",                                                                              date: "03 Mar 2026", sentiment: 0.92,  cluster: "Facility & Queuing",       risk: "-",                         opportunity: "Bogor Benchmark",         engagement: 8,  rating: 5 },
      { id: "src-14", source: "App_Review",  platform: "google maps",author: "Hendra Kusuma",           content: "Klinik paling recommended di Bogor. Dokternya sabar jelasin treatment dan hasilnya memuaskan banget.",                                                                               date: "02 Mar 2026", sentiment: 0.90,  cluster: "Treatment Result & Satisfaction", risk: "-",                 opportunity: "Bogor Benchmark",         engagement: 5,  rating: 5 },
      { id: "src-15", source: "App_Review",  platform: "google maps",author: "Siti Rahmawati",          content: "Pelayanan ramah dari CS hingga dokter, serta tempat yang bersih. Sangat nyaman untuk treatment.",                                                                                   date: "01 Mar 2026", sentiment: 0.85,  cluster: "Facility & Queuing",       risk: "-",                         opportunity: "Regional Loyalty",        engagement: 3,  rating: 5 },
      { id: "src-16", source: "App_Review",  platform: "google maps",author: "Dewi Lestari",            content: "Tempat nyaman, luas, bersih, dan fasilitas lumayan lengkap. Gedungnya bagus banget.",                                                                                               date: "28 Feb 2026", sentiment: 0.65,  cluster: "Facility & Queuing",       risk: "Staff Hospitality",         opportunity: "-",                       engagement: 4,  rating: 4 },
      { id: "src-17", source: "App_Review",  platform: "google maps",author: "anonymous_tsm",           content: "Fasilitas oke tapi keramahan front liner dan dokter perlu ditingkatkan, kurang informatif ke pasien.",                                                                              date: "01 Mar 2026", sentiment: -0.50, cluster: "Customer Service (Admin)", risk: "Staff Hospitality",         opportunity: "-",                       engagement: 6,  rating: 3 },
      { id: "src-18", source: "App_Review",  platform: "google maps",author: "Putri Handayani",         content: "Tempatnya nyaman dan bersih. Cuma pelayanan perlu lebih ditingkatkan lagi, terutama info soal treatment.",                                                                          date: "02 Mar 2026", sentiment: -0.30, cluster: "Customer Service (Admin)", risk: "Staff Hospitality",         opportunity: "-",                       engagement: 2,  rating: 3 },
      { id: "src-19", source: "App_Review",  platform: "google maps",author: "Maya Soeharto",           content: "Promo terus ada dan admin cepet banget responnya kalau mau booking. Jadi langganan sini deh!",                                                                                      date: "04 Mar 2026", sentiment: 0.91,  cluster: "Promo & Pricing",          risk: "-",                         opportunity: "Bogor Benchmark",         engagement: 7,  rating: 5 },
      { id: "src-20", source: "App_Review",  platform: "google maps",author: "Agung Pratama",           content: "Staff ramah dan profesional di cabang Sidoarjo. Tempat bersih dan nyaman. Recommended banget!",                                                                                     date: "28 Feb 2026", sentiment: 0.87,  cluster: "Facility & Queuing",       risk: "-",                         opportunity: "Regional Loyalty",        engagement: 4,  rating: 5 },
    ],
  };
}

export function getInitialDashboardContentForInstance(instanceId: string, defaultContent: DashboardContentStore): DashboardContentStore | null {
  if (instanceId === "benings_brand_analysis_01_2026") return buildBeningsInitial(defaultContent);
  if (instanceId === "bukalapak") return buildBukalapakInitial(defaultContent);
  if (instanceId === "kapal_api_12_19_feb_2026") return buildKapalApiInitial(defaultContent);
  if (instanceId === "kopi_good_day_12_19_feb_2026") return buildKopiGoodDayInitial(defaultContent);
  if (instanceId === "kopi_abc_12_19_feb_2026") return buildKopiAbcInitial(defaultContent);
  if (instanceId === "kopi_fresco_12_19_feb_2026") return buildKopiFrescoInitial(defaultContent);
  if (instanceId === "excelso_12_19_feb_2026") return buildExcelsoInitial(defaultContent);
  if (instanceId === "kopi_kapten_12_19_feb_2026") return buildKopiKaptenInitial(defaultContent);
  if (instanceId === "unakaffe_12_19_feb_2026") return buildUnakaffeInitial(defaultContent);
  if (instanceId === "kopi_pikopi_12_19_feb_2026") return buildKopiPikopiInitial(defaultContent);
  if (instanceId === "kopi_ya_12_19_feb_2026") return buildKopiYaInitial(defaultContent);
  if (instanceId === "pt_santos_jaya_abadi_12_19_feb_2026") return buildSantosJayaAbadiInitial(defaultContent);
  if (instanceId === "good_day_x_babymonster_feb_2026") return buildGoodDayXBabyMonsterInitial(defaultContent);
  if (instanceId === "kacc_12_19_feb_2026") return buildKapalApiCoffeeCornerInitial(defaultContent);
  if (instanceId === "krim_kafe_12_19_feb_2026") return buildKrimKafeInitial(defaultContent);
  return null;
}
