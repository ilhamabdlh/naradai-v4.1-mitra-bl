import type { CampaignListItem, CampaignAnalysisSlice } from "./dashboard-content-types";

export function buildMitraBukalapakCampaigns(): CampaignListItem[] {
  const kolak: CampaignAnalysisSlice = {
    campaignStats: [
      { id: "1", label: "Average Sentiment", value: "77.8%", change: "+5.1pts", positive: true, description: "Positive sentiment ratio based on 27 validated Instagram mentions", icon: "TrendingUp" },
      { id: "2", label: "Critical Issues", value: "3", change: "+1", positive: false, description: "Instagram mentions flagged as 'High Risk' (Negative Sentiment)", icon: "AlertTriangle" },
      { id: "3", label: "Share of Voice", value: "14.8%", change: "+2.4pts", positive: true, description: "Mitra Bukalapak Instagram SOV vs Competitors", icon: "MessageSquare" },
      { id: "4", label: "Conversation Analyzed", value: "27", change: "+27", positive: true, description: "Total validated Bukalapak Instagram posts & comments in current period", icon: "Users" },
    ],
    campaignPerformance: [
      { id: "1", name: "Ramadan Top Up Promo (TOPUPRAMADAN)", platform: "Instagram", likes: 195, shares: 0, replies: 110, status: "active", sentiment: 0.95 },
      { id: "2", name: "Berkah Mitra: Kultum & Giveaway Series", platform: "Instagram", likes: 171, shares: 0, replies: 77, status: "active", sentiment: 0.95 },
      { id: "3", name: "Security Awareness: Anti Misi Komisi", platform: "Instagram", likes: 147, shares: 0, replies: 254, status: "active", sentiment: 0.15 },
    ],
    campaignTrendData: [
      { id: "1", month: "Feb 2026", likes: 1215, shares: 0, replies: 512 },
      { id: "2", month: "Mar 2026", likes: 389, shares: 0, replies: 211 },
    ],
    campaignTimeSeriesData: [
      { id: "1", date: "09 Feb", likes: 27, replies: 0, shares: 0 },
      { id: "2", date: "10 Feb", likes: 19, replies: 1, shares: 0 },
      { id: "3", date: "11 Feb", likes: 36, replies: 8, shares: 0 },
      { id: "4", date: "12 Feb", likes: 27, replies: 6, shares: 0 },
      { id: "5", date: "13 Feb", likes: 69, replies: 24, shares: 0 },
      { id: "6", date: "15 Feb", likes: 147, replies: 254, shares: 0 },
      { id: "7", date: "17 Feb", likes: 31, replies: 4, shares: 0 },
      { id: "8", date: "18 Feb", likes: 55, replies: 7, shares: 0 },
      { id: "9", date: "19 Feb", likes: 138, replies: 15, shares: 0 },
      { id: "10", date: "20 Feb", likes: 171, replies: 77, shares: 0 },
      { id: "11", date: "21 Feb", likes: 95, replies: 19, shares: 0 },
      { id: "12", date: "22 Feb", likes: 37, replies: 15, shares: 0 },
      { id: "13", date: "23 Feb", likes: 195, replies: 110, shares: 0 },
      { id: "14", date: "24 Feb", likes: 41, replies: 16, shares: 0 },
      { id: "15", date: "25 Feb", likes: 98, replies: 11, shares: 0 },
      { id: "16", date: "26 Feb", likes: 36, replies: 15, shares: 0 },
      { id: "17", date: "27 Feb", likes: 46, replies: 18, shares: 0 },
      { id: "18", date: "28 Feb", likes: 29, replies: 11, shares: 0 },
      { id: "19", date: "01 Mar", likes: 26, replies: 11, shares: 0 },
      { id: "20", date: "02 Mar", likes: 31, replies: 7, shares: 0 },
      { id: "21", date: "03 Mar", likes: 34, replies: 32, shares: 0 },
      { id: "22", date: "04 Mar", likes: 67, replies: 16, shares: 0 },
      { id: "23", date: "05 Mar", likes: 35, replies: 22, shares: 0 },
      { id: "24", date: "06 Mar", likes: 58, replies: 6, shares: 0 },
      { id: "25", date: "07 Mar", likes: 32, replies: 12, shares: 0 },
      { id: "26", date: "08 Mar", likes: 20, replies: 5, shares: 0 },
      { id: "27", date: "09 Mar", likes: 4, replies: 1, shares: 0 },
    ],
    campaignPostPublishEvents: [
      { id: "1", date: "13 Feb", label: "Promo Ramadan Awareness Post", type: "carousel" },
      { id: "2", date: "20 Feb", label: "Berkah Mitra Giveaway Announcement", type: "carousel" },
      { id: "3", date: "23 Feb", label: "Top Up Promo Code Launch", type: "short_video" },
    ],
    campaignKeyEvents: [
      { id: "1", date: "15 Feb", title: "Anti-Fraud Engagement Peak", type: "spike", insight: "Post mengenai edukasi penipuan 'misi komisi' mendapatkan jumlah komentar tertinggi (254), menunjukkan perhatian besar mitra terhadap keamanan akun." },
      { id: "2", date: "23 Feb", title: "Top Up Promo Conversion Peak", type: "spike", insight: "Peluncuran kode TOPUPRAMADAN menghasilkan jumlah Like tertinggi (195), menandakan minat tinggi mitra pada diskon operasional." },
    ],
    campaignReplySentiment: { positive: 54.7, neutral: 42.4, negative: 2.9 },
    campaignReplyTopics: [
      { id: "1", topic: "Security & Fraud Awareness", totalReplies: 254, positive: 50.0, neutral: 25.0, negative: 25.0, topComments: ["Wajib di share ini biar yg lain pada melek, pernah kejadian temenku kena scam macam ni", "Sangat bermanfaat banget, jelas dan gampang dipahami 👍", "Izin share videonya min, bapakku prnh ketipu ini 😢"] },
      { id: "2", topic: "Promo & Ramadan Top-Up", totalReplies: 110, positive: 62.5, neutral: 37.5, negative: 0.0, topComments: ["Tangerang msh ada g?", "Mau dong min😍", "Semoga dapat sound box aamiin"] },
      { id: "3", topic: "Ramadan Engagement (NgaBreng & Kultum)", totalReplies: 149, positive: 68.8, neutral: 27.1, negative: 4.2, topComments: ["Ada tips Tahan banting juga yah min. Karena sering terbanting sampai terpelanting. 🔥🔥🔥", "BISMILLAH MISSION COMPLETED ✅ #BERKAHMITRA", "Berkah berkah berkah & bahagia melimpah 😍"] },
    ],
    campaignContentTypes: [
      { id: "1", type: "Educational Carousel", platform: "Instagram", posts: 15, likes: 850, shares: 0, replies: 403, positiveSentiment: 56.9, negativeSentiment: 17.3, topTopics: ["security", "fraud prevention", "ramadan wisdom"], audienceReaction: "High community awareness; users actively share warnings and tips in the comment section." },
      { id: "2", type: "Promo Video/Post", platform: "Instagram", posts: 12, likes: 754, shares: 0, replies: 110, positiveSentiment: 62.5, negativeSentiment: 0.0, topTopics: ["discounts", "top up code", "giveaway"], audienceReaction: "Strong direct response; high conversion intent driven by discount codes." },
    ],
    campaignTopPosts: [
      { id: "1", type: "carousel", title: "Top up digital pas Ramadan jadi makin berkah", platform: "Instagram", likes: 195, shares: 0, replies: 110, sentiment: 0.95 },
      { id: "2", type: "carousel", title: "Berkah Mitra Giveaway: Menangkan 2.5 Juta", platform: "Instagram", likes: 171, shares: 0, replies: 77, sentiment: 0.95 },
      { id: "3", type: "video", title: "Hati-hati Penipuan Misi Komisi Juragan!", platform: "Instagram", likes: 147, shares: 0, replies: 254, sentiment: 0.15 },
    ],
    campaignChannels: [
      { id: "1", name: "Instagram", likes: 1604, replies: 723, shares: 0, posts: 27, icon: "IG", color: "from-pink-500 to-rose-500" },
    ],
    campaignCompetitors: [
      { id: "1", brand: "Mitra Bukalapak", posts: 27, likes: 1604, replies: 723, shares: 0, sentiment: 77.8 },
      { id: "2", brand: "Mitra Shopee", posts: 25, likes: 3701, replies: 5071, shares: 0, sentiment: 89.0 },
      { id: "3", brand: "Order Kuota", posts: 20, likes: 353, replies: 40, shares: 0, sentiment: 77.5 },
      { id: "4", brand: "BRILink", posts: 3, likes: 687, replies: 88, shares: 0, sentiment: 85.0 },
    ],
    campaignRecommendations: [
      { id: "1", priority: "high", title: "Increase Frequency of Security Bulletins", detail: "Data shows the highest engagement (254 replies) on fraud prevention posts. Mitras have a high demand for safety information. Scale this into a weekly 'Security Spotlight' series.", impact: "High" },
      { id: "2", priority: "high", title: "Extend TOPUPRAMADAN Promo Momentum", detail: "This promo generated the highest likes (195). Consider a 'Phase 2' rollout as the March 15 deadline approaches to maintain positive sentiment and transaction volume.", impact: "High" },
    ],
  };

  const hikmah: CampaignAnalysisSlice = {
    campaignStats: [
      { id: "1", label: "Average Sentiment", value: "89.3%", change: "+11.5pts", positive: true, description: "Positive sentiment ratio for #HIKMAH series on TikTok", icon: "TrendingUp" },
      { id: "2", label: "Critical Issues", value: "0", change: "0", positive: true, description: "No high-risk negative mentions detected in this campaign", icon: "CheckCircle" },
      { id: "3", label: "Share of Voice", value: "1.5%", change: "+0.8pts", positive: true, description: "Campaign-specific SOV within TikTok niche markets", icon: "MessageSquare" },
      { id: "4", label: "Conversation Analyzed", value: "22", change: "+22", positive: true, description: "Total #HIKMAH video posts and comments analyzed", icon: "Activity" },
    ],
    campaignPerformance: [
      { id: "1", name: "Kultum: Meluruskan Niat Mencari Rezeki", platform: "TikTok", likes: 78, shares: 97, replies: 60, status: "active", sentiment: 0.85 },
      { id: "2", name: "Kultum: Kepercayaan Faktor Penting Usaha", platform: "TikTok", likes: 70, shares: 71, replies: 47, status: "active", sentiment: 0.9 },
      { id: "3", name: "Kultum: Sabar Melayani Pelanggan", platform: "TikTok", likes: 61, shares: 76, replies: 52, status: "active", sentiment: 0.9 },
      { id: "4", name: "Kultum: Rezeki Halal Usaha Jadi Ibadah", platform: "TikTok", likes: 61, shares: 65, replies: 44, status: "active", sentiment: 0.9 },
    ],
    campaignTrendData: [
      { id: "1", month: "Feb 2026", likes: 501, shares: 610, replies: 475 },
      { id: "2", month: "Mar 2026", likes: 366, shares: 340, replies: 331 },
    ],
    campaignTimeSeriesData: [
      { id: "1", date: "09 Feb", likes: 0, replies: 0, shares: 0 },
      { id: "2", date: "10 Feb", likes: 0, replies: 0, shares: 0 },
      { id: "3", date: "11 Feb", likes: 0, replies: 0, shares: 0 },
      { id: "4", date: "12 Feb", likes: 0, replies: 0, shares: 0 },
      { id: "5", date: "13 Feb", likes: 0, replies: 0, shares: 0 },
      { id: "6", date: "14 Feb", likes: 0, replies: 0, shares: 0 },
      { id: "7", date: "15 Feb", likes: 0, replies: 0, shares: 0 },
      { id: "8", date: "16 Feb", likes: 0, replies: 0, shares: 0 },
      { id: "9", date: "17 Feb", likes: 0, replies: 0, shares: 0 },
      { id: "10", date: "18 Feb", likes: 0, replies: 0, shares: 0 },
      { id: "11", date: "19 Feb", likes: 0, replies: 0, shares: 0 },
      { id: "12", date: "20 Feb", likes: 78, replies: 60, shares: 97 },
      { id: "13", date: "21 Feb", likes: 61, replies: 44, shares: 76 },
      { id: "14", date: "22 Feb", likes: 70, replies: 47, shares: 71 },
      { id: "15", date: "23 Feb", likes: 54, replies: 54, shares: 63 },
      { id: "16", date: "24 Feb", likes: 61, replies: 52, shares: 65 },
      { id: "17", date: "25 Feb", likes: 59, replies: 50, shares: 56 },
      { id: "18", date: "26 Feb", likes: 53, replies: 62, shares: 61 },
      { id: "19", date: "27 Feb", likes: 46, replies: 36, shares: 56 },
      { id: "20", date: "28 Feb", likes: 54, replies: 60, shares: 64 },
      { id: "21", date: "01 Mar", likes: 55, replies: 34, shares: 47 },
      { id: "22", date: "02 Mar", likes: 50, replies: 56, shares: 50 },
      { id: "23", date: "03 Mar", likes: 49, replies: 32, shares: 55 },
      { id: "24", date: "04 Mar", likes: 50, replies: 50, shares: 53 },
      { id: "25", date: "05 Mar", likes: 52, replies: 52, shares: 52 },
      { id: "26", date: "06 Mar", likes: 50, replies: 27, shares: 42 },
      { id: "27", date: "07 Mar", likes: 41, replies: 49, shares: 39 },
      { id: "28", date: "08 Mar", likes: 41, replies: 49, shares: 36 },
      { id: "29", date: "09 Mar", likes: 0, replies: 0, shares: 0 },
    ],
    campaignReplySentiment: { positive: 88.5, neutral: 11.5, negative: 0.0 },
    campaignReplyTopics: [
      { id: "1", topic: "Pantun Hikmah (Community Engagement)", totalReplies: 312, positive: 95.0, neutral: 5.0, negative: 0.0, topComments: ["Jaga lisan jangan berdusta, Agar pahala puasa tidak sirna", "Sekecil apapun usaha dan doa kita, Nikmat Allah teramat besar", "Ketika berdagang tetap amanah, Niscaya rezeky akan halal"] },
      { id: "2", topic: "Spiritual & Business Reflection", totalReplies: 220, positive: 82.0, neutral: 18.0, negative: 0.0, topComments: ["Meski sepi tetap semangat Karena usaha tak khianati hasil.", "Masya Allah adem banget denger kultumnya", "Sabar melayani pelanggan memang tantangan tersendiri buat konter"] },
    ],
    campaignContentTypes: [
      { id: "1", type: "Kultum Video", platform: "TikTok", posts: 18, likes: 696, shares: 1230, replies: 643, positiveSentiment: 89.3, negativeSentiment: 0.0, topTopics: ["niat rezeki", "sabar", "amanah", "ibadah"], audienceReaction: "Very high shareability; Juragan tends to use these videos as status updates for their own community." },
    ],
    campaignTopPosts: [
      { id: "1", type: "video", title: "Meluruskan Niat Mencari Rezeki", platform: "TikTok", likes: 78, shares: 97, replies: 60, sentiment: 0.85 },
      { id: "2", type: "video", title: "Kepercayaan Faktor Penting Usaha", platform: "TikTok", likes: 70, shares: 71, replies: 47, sentiment: 0.9 },
    ],
    campaignChannels: [
      { id: "1", name: "TikTok", likes: 1302, replies: 1071, shares: 1230, posts: 57, icon: "TT", color: "from-slate-900 to-slate-700" },
    ],
    campaignCompetitors: [
      { id: "1", brand: "Mitra Bukalapak", posts: 57, likes: 1302, replies: 1071, shares: 1230, sentiment: 86.9 },
      { id: "2", brand: "Mitra Shopee", posts: 275, likes: 5408, replies: 888, shares: 378, sentiment: 79.5 },
      { id: "3", brand: "Order Kuota", posts: 18, likes: 755, replies: 55, shares: 86, sentiment: 58.6 },
      { id: "4", brand: "BRILink", posts: 1, likes: 49, replies: 19, shares: 0, sentiment: 60.0 },
    ],
    campaignRecommendations: [
      { id: "1", priority: "high", title: "Expand Community Pantun Contest", detail: "Interaksi pantun memiliki sentiment positif tertinggi. Buat kontes mingguan dengan hadiah saldo Mitra untuk meningkatkan loyalitas organik.", impact: "High" },
      { id: "2", priority: "medium", title: "Repurpose Kultum to TikTok Stories", detail: "Share rate yang tinggi menunjukkan konten ini bernilai edukasi. Gunakan potongan pendek untuk Stories agar tetap relevan di timeline harian.", impact: "Medium" },
    ],
  };

  return [
    { id: "bukalapak_campaign_kolak_final_rag", name: "KOLAK RAG (Instagram)", data: kolak },
    { id: "bukalapak_campaign_hikmah_tiktok_final", name: "Hikmah TikTok", data: hikmah },
  ];
}
