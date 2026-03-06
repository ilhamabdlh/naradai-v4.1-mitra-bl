import { useState, useMemo } from "react";
import { TrendingUp, Target, AlertTriangle, Lightbulb, ThermometerSun, Volume2, BarChart3, Trophy, MessageSquare, Mic2, Smile, PieChart, ChevronLeft, ChevronRight } from "lucide-react";
import { ShareOfPlatform } from "./ShareOfPlatform";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Legend, BarChart, Bar } from "recharts";
import { CompetitiveMatrixChart } from "./CompetitiveMatrixChart";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import type { CompetitiveHeatmapRow, CompetitorOverviewItem } from "@/lib/dashboard-content-types";

interface IssueData {
  issue: string;
  relativeSentiment: number; // % compared to competitors median
  relativeMentions: number; // % compared to competitors median
  category: string;
  yourSentiment: number;
  competitorMedianSentiment: number;
  yourMentions: number;
  competitorMedianMentions: number;
}

type HeatmapData = CompetitiveHeatmapRow;

const defaultIssuesData: IssueData[] = [
    {
      issue: "Product Quality",
      relativeSentiment: 15,
      relativeMentions: 25,
      category: "winning",
      yourSentiment: 0.78,
      competitorMedianSentiment: 0.68,
      yourMentions: 2500,
      competitorMedianMentions: 2000,
    },
    {
      issue: "Customer Service",
      relativeSentiment: -35,
      relativeMentions: 40,
      category: "critical",
      yourSentiment: 0.32,
      competitorMedianSentiment: 0.67,
      yourMentions: 2800,
      competitorMedianMentions: 2000,
    },
    {
      issue: "Pricing",
      relativeSentiment: -12,
      relativeMentions: 15,
      category: "moderate",
      yourSentiment: 0.58,
      competitorMedianSentiment: 0.70,
      yourMentions: 2300,
      competitorMedianMentions: 2000,
    },
    {
      issue: "Features",
      relativeSentiment: 8,
      relativeMentions: -15,
      category: "opportunity",
      yourSentiment: 0.73,
      competitorMedianSentiment: 0.65,
      yourMentions: 1700,
      competitorMedianMentions: 2000,
    },
    {
      issue: "Packaging",
      relativeSentiment: -28,
      relativeMentions: 30,
      category: "critical",
      yourSentiment: 0.38,
      competitorMedianSentiment: 0.66,
      yourMentions: 2600,
      competitorMedianMentions: 2000,
    },
    {
      issue: "Shipping Speed",
      relativeSentiment: 20,
      relativeMentions: 10,
      category: "opportunity",
      yourSentiment: 0.82,
      competitorMedianSentiment: 0.62,
      yourMentions: 2200,
      competitorMedianMentions: 2000,
    },
    {
      issue: "App UX",
      relativeSentiment: 5,
      relativeMentions: -20,
      category: "opportunity",
      yourSentiment: 0.70,
      competitorMedianSentiment: 0.65,
      yourMentions: 1600,
      competitorMedianMentions: 2000,
    },
    {
      issue: "Return Policy",
      relativeSentiment: -8,
      relativeMentions: -10,
      category: "minor",
      yourSentiment: 0.60,
      competitorMedianSentiment: 0.68,
      yourMentions: 1800,
      competitorMedianMentions: 2000,
    },
    {
      issue: "Innovation",
      relativeSentiment: 18,
      relativeMentions: 35,
      category: "winning",
      yourSentiment: 0.80,
      competitorMedianSentiment: 0.62,
      yourMentions: 2700,
      competitorMedianMentions: 2000,
    },
    {
      issue: "Brand Trust",
      relativeSentiment: 12,
      relativeMentions: 20,
      category: "winning",
      yourSentiment: 0.76,
      competitorMedianSentiment: 0.64,
      yourMentions: 2400,
      competitorMedianMentions: 2000,
    },
    {
      issue: "Support Availability",
      relativeSentiment: -40,
      relativeMentions: 35,
      category: "critical",
      yourSentiment: 0.28,
      competitorMedianSentiment: 0.68,
      yourMentions: 2700,
      competitorMedianMentions: 2000,
    },
    {
      issue: "Value for Money",
      relativeSentiment: -5,
      relativeMentions: 5,
      category: "moderate",
      yourSentiment: 0.63,
      competitorMedianSentiment: 0.68,
      yourMentions: 2100,
      competitorMedianMentions: 2000,
    },
  ];

const defaultSentimentHeatmap: HeatmapData[] = [
    { issue: "Product Quality", yourBrand: 0.78, competitorA: 0.72, competitorB: 0.65, competitorC: 0.68, competitorD: 0.71 },
    { issue: "Customer Service", yourBrand: 0.32, competitorA: 0.68, competitorB: 0.71, competitorC: 0.65, competitorD: 0.64 },
    { issue: "Pricing", yourBrand: 0.58, competitorA: 0.72, competitorB: 0.68, competitorC: 0.70, competitorD: 0.69 },
    { issue: "Features", yourBrand: 0.73, competitorA: 0.67, competitorB: 0.65, competitorC: 0.64, competitorD: 0.63 },
    { issue: "Packaging", yourBrand: 0.38, competitorA: 0.65, competitorB: 0.68, competitorC: 0.67, competitorD: 0.64 },
    { issue: "Shipping Speed", yourBrand: 0.82, competitorA: 0.58, competitorB: 0.62, competitorC: 0.65, competitorD: 0.61 },
    { issue: "App UX", yourBrand: 0.70, competitorA: 0.66, competitorB: 0.64, competitorC: 0.65, competitorD: 0.67 },
    { issue: "Innovation", yourBrand: 0.80, competitorA: 0.60, competitorB: 0.58, competitorC: 0.65, competitorD: 0.62 },
  ];

const defaultVolumeHeatmap: HeatmapData[] = [
    { issue: "Product Quality", yourBrand: 2500, competitorA: 2100, competitorB: 1900, competitorC: 2000, competitorD: 1950 },
    { issue: "Customer Service", yourBrand: 2800, competitorA: 2050, competitorB: 1980, competitorC: 1900, competitorD: 2100 },
    { issue: "Pricing", yourBrand: 2300, competitorA: 2000, competitorB: 1950, competitorC: 2050, competitorD: 2020 },
    { issue: "Features", yourBrand: 1700, competitorA: 2100, competitorB: 1950, competitorC: 1980, competitorD: 2050 },
    { issue: "Packaging", yourBrand: 2600, competitorA: 1900, competitorB: 2050, competitorC: 2000, competitorD: 1980 },
    { issue: "Shipping Speed", yourBrand: 2200, competitorA: 2050, competitorB: 1980, competitorC: 1950, competitorD: 2100 },
    { issue: "App UX", yourBrand: 1600, competitorA: 2100, competitorB: 1950, competitorC: 2000, competitorD: 1900 },
    { issue: "Innovation", yourBrand: 2700, competitorA: 1950, competitorB: 1900, competitorC: 2100, competitorD: 2000 },
  ];

export function CompetitiveAnalysis() {
  const content = useDashboardContent();
  const [activeInsightIndex, setActiveInsightIndex] = useState(0);

  // --- Competitors Overview defaults ---
  const defaultCompetitorsOverview: CompetitorOverviewItem[] = [
    {
      id: "co1", name: "Your Brand",
      keywords: ["brand", "official", "original"],
      competitivePosition: "Market leader with strong innovation and shipping speed, but customer service remains a key vulnerability.",
      conversations: 9800, shareOfVoice: 34, avgSentiment: 0.72, color: "#8b5cf6",
    },
    {
      id: "co2", name: "Competitor A",
      keywords: ["competitor a", "rival a", "brand a"],
      competitivePosition: "Strong challenger with improving customer service scores and growing share of voice.",
      conversations: 7600, shareOfVoice: 26, avgSentiment: 0.68, color: "#06b6d4",
    },
    {
      id: "co3", name: "Competitor B",
      keywords: ["competitor b", "rival b", "brand b"],
      competitivePosition: "Niche player excelling in pricing perception, but limited reach in high-volume topics.",
      conversations: 6700, shareOfVoice: 23, avgSentiment: 0.65, color: "#f59e0b",
    },
    {
      id: "co4", name: "Competitor C",
      keywords: ["competitor c", "rival c", "brand c"],
      competitivePosition: "Growing presence in packaging and app UX discussions, sentiment is improving quarter-over-quarter.",
      conversations: 7100, shareOfVoice: 24, avgSentiment: 0.66, color: "#10b981",
    },
    {
      id: "co5", name: "Competitor D",
      keywords: ["competitor d", "rival d", "brand d"],
      competitivePosition: "Steady performer with moderate visibility; strong in return policy satisfaction but lags in innovation.",
      conversations: 6800, shareOfVoice: 23, avgSentiment: 0.64, color: "#f43f5e",
    },
  ];

  // Derive overview from matrix items when available
  const competitorsOverview: CompetitorOverviewItem[] = useMemo(() => {
    const matrixItems = content?.competitiveMatrixItems ?? [];
    const labels = content?.competitiveBrandLabels;
    if (matrixItems.length === 0) return defaultCompetitorsOverview;

    const totalMentions = matrixItems.reduce((s, m) => s + m.mentions, 0);
    return matrixItems.map((item, idx) => {
      const base = defaultCompetitorsOverview[idx] ?? defaultCompetitorsOverview[0];
      const nameKey = labels
        ? Object.entries(labels).find(([, v]) => v === item.name)?.[0]
        : null;
      return {
        id: item.id,
        name: item.name,
        keywords: item.keywords ?? base.keywords,
        competitivePosition: item.competitivePosition ?? base.competitivePosition,
        conversations: item.mentions,
        shareOfVoice: totalMentions > 0 ? parseFloat(((item.mentions / totalMentions) * 100).toFixed(1)) : 0,
        avgSentiment: item.positivePercentage / 100,
        color: item.color ?? base.color,
      } as CompetitorOverviewItem;
    });
  }, [content?.competitiveMatrixItems, content?.competitiveBrandLabels]);

  const issuesData: IssueData[] = useMemo(() => {
    const list = content?.competitiveIssues ?? [];
    if (list.length === 0) return defaultIssuesData;
    return list.map((item) => ({
      issue: item.issue,
      relativeSentiment: item.relativeSentiment,
      relativeMentions: item.relativeMentions,
      category: item.category,
      yourSentiment: item.yourSentiment,
      competitorMedianSentiment: item.competitorMedianSentiment,
      yourMentions: item.yourMentions,
      competitorMedianMentions: item.competitorMedianMentions,
    }));
  }, [content?.competitiveIssues]);
  
  // Calculate symmetric domain around 0 to keep center lines static
  const xDomain = useMemo(() => {
    if (issuesData.length === 0) return [-50, 50];
    const values = issuesData.map(d => d.relativeMentions);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const absMax = Math.max(Math.abs(min), Math.abs(max));
    const padding = absMax * 0.1; // 10% padding
    return [-absMax - padding, absMax + padding];
  }, [issuesData]);
  
  const yDomain = useMemo(() => {
    if (issuesData.length === 0) return [-50, 50];
    const values = issuesData.map(d => d.relativeSentiment);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const absMax = Math.max(Math.abs(min), Math.abs(max));
    const padding = absMax * 0.1; // 10% padding
    return [-absMax - padding, absMax + padding];
  }, [issuesData]);
  const sentimentHeatmapData: HeatmapData[] = (content?.competitiveSentimentScores?.length ? content.competitiveSentimentScores : defaultSentimentHeatmap) as HeatmapData[];
  const volumeHeatmapData: HeatmapData[] = (content?.competitiveVolumeOfMentions?.length ? content.competitiveVolumeOfMentions : defaultVolumeHeatmap) as HeatmapData[];

  const brandLabels = content?.competitiveBrandLabels;
  const competitiveMatrixItems = content?.competitiveMatrixItems ?? [];
  
  // All brands for heatmap columns (scrollable); fallback to 5 if no matrix items
  const heatmapBrands = useMemo(() => {
    if (competitiveMatrixItems.length > 0) {
      return competitiveMatrixItems.map(item => item.name);
    }
    if (brandLabels) {
      return [brandLabels.yourBrand, brandLabels.competitorA, brandLabels.competitorB, brandLabels.competitorC, brandLabels.competitorD];
    }
    return ["Your Brand", "Competitor A", "Competitor B", "Competitor C", "Competitor D"];
  }, [competitiveMatrixItems, brandLabels]);

  // Get value for a brand: support full row (row[brandName]) and legacy 5-column (yourBrand, competitorA–D)
  const getBrandValue = (row: HeatmapData, brandName: string): number => {
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

  // Normalise sentiment value ke skala 0–1 (data bisa disimpan sebagai 0–100 atau 0–1)
  const normalizeSentiment = (v: number): number => (v > 1 ? v / 100 : v);

  const companies = heatmapBrands;

  type Granularity = "daily" | "weekly" | "monthly";
  const [sovGranularity, setSovGranularity] = useState<Granularity>("daily");

  const sovDaily = [
    { date: "Jan 1", yourBrand: 250, competitorA: 210, competitorB: 180, competitorC: 200, competitorD: 190 },
    { date: "Jan 2", yourBrand: 260, competitorA: 215, competitorB: 185, competitorC: 195, competitorD: 195 },
    { date: "Jan 3", yourBrand: 245, competitorA: 220, competitorB: 190, competitorC: 205, competitorD: 185 },
    { date: "Jan 4", yourBrand: 270, competitorA: 205, competitorB: 175, competitorC: 210, competitorD: 200 },
    { date: "Jan 5", yourBrand: 280, competitorA: 225, competitorB: 195, competitorC: 198, competitorD: 192 },
    { date: "Jan 6", yourBrand: 265, competitorA: 218, competitorB: 188, competitorC: 202, competitorD: 198 },
    { date: "Jan 7", yourBrand: 255, competitorA: 212, competitorB: 182, competitorC: 208, competitorD: 188 },
    { date: "Jan 8", yourBrand: 290, competitorA: 230, competitorB: 200, competitorC: 215, competitorD: 205 },
    { date: "Jan 9", yourBrand: 300, competitorA: 225, competitorB: 195, competitorC: 210, competitorD: 200 },
    { date: "Jan 10", yourBrand: 285, competitorA: 235, competitorB: 205, competitorC: 220, competitorD: 210 },
    { date: "Jan 11", yourBrand: 310, competitorA: 228, competitorB: 198, competitorC: 218, competitorD: 208 },
    { date: "Jan 12", yourBrand: 295, competitorA: 240, competitorB: 210, competitorC: 225, competitorD: 215 },
    { date: "Jan 13", yourBrand: 320, competitorA: 232, competitorB: 202, competitorC: 222, competitorD: 212 },
    { date: "Jan 14", yourBrand: 305, competitorA: 245, competitorB: 215, competitorC: 228, competitorD: 218 },
    { date: "Jan 15", yourBrand: 275, competitorA: 242, competitorB: 192, competitorC: 221, competitorD: 211 },
    { date: "Jan 16", yourBrand: 288, competitorA: 248, competitorB: 208, competitorC: 226, competitorD: 216 },
    { date: "Jan 17", yourBrand: 315, competitorA: 250, competitorB: 212, competitorC: 230, competitorD: 220 },
    { date: "Jan 18", yourBrand: 325, competitorA: 255, competitorB: 218, competitorC: 235, competitorD: 225 },
    { date: "Jan 19", yourBrand: 330, competitorA: 258, competitorB: 222, competitorC: 238, competitorD: 228 },
    { date: "Jan 20", yourBrand: 340, competitorA: 260, competitorB: 225, competitorC: 240, competitorD: 230 },
    { date: "Jan 21", yourBrand: 335, competitorA: 252, competitorB: 220, competitorC: 236, competitorD: 226 },
    { date: "Jan 22", yourBrand: 345, competitorA: 262, competitorB: 228, competitorC: 242, competitorD: 232 },
    { date: "Jan 23", yourBrand: 350, competitorA: 265, competitorB: 230, competitorC: 245, competitorD: 235 },
    { date: "Jan 24", yourBrand: 355, competitorA: 268, competitorB: 235, competitorC: 248, competitorD: 238 },
    { date: "Jan 25", yourBrand: 360, competitorA: 270, competitorB: 238, competitorC: 250, competitorD: 240 },
    { date: "Jan 26", yourBrand: 365, competitorA: 272, competitorB: 240, competitorC: 252, competitorD: 242 },
    { date: "Jan 27", yourBrand: 370, competitorA: 275, competitorB: 242, competitorC: 255, competitorD: 245 },
    { date: "Jan 28", yourBrand: 375, competitorA: 278, competitorB: 245, competitorC: 258, competitorD: 248 },
    { date: "Jan 29", yourBrand: 380, competitorA: 280, competitorB: 248, competitorC: 260, competitorD: 250 },
    { date: "Jan 30", yourBrand: 385, competitorA: 282, competitorB: 250, competitorC: 262, competitorD: 252 },
  ];

  const sovWeekly = [
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
  ];

  const sovMonthly = [
    { date: "Oct", yourBrand: 7500, competitorA: 6200, competitorB: 5400, competitorC: 5800, competitorD: 5600 },
    { date: "Nov", yourBrand: 8200, competitorA: 6800, competitorB: 5900, competitorC: 6300, competitorD: 6100 },
    { date: "Dec", yourBrand: 9100, competitorA: 7200, competitorB: 6400, competitorC: 6800, competitorD: 6500 },
    { date: "Jan", yourBrand: 9800, competitorA: 7600, competitorB: 6700, competitorC: 7100, competitorD: 6800 },
    { date: "Feb", yourBrand: 10200, competitorA: 7900, competitorB: 7000, competitorC: 7400, competitorD: 7100 },
    { date: "Mar", yourBrand: 10800, competitorA: 8300, competitorB: 7400, competitorC: 7800, competitorD: 7500 },
  ];

  const sovDataByGranularity: Record<Granularity, typeof sovWeekly> = {
    daily: sovDaily,
    weekly: sovWeekly,
    monthly: sovMonthly,
  };

  const shareOfVoiceFromContent = content?.competitiveShareOfVoice ?? [];
  const shareOfVoiceData =
    shareOfVoiceFromContent.length > 0 ? shareOfVoiceFromContent : sovDataByGranularity[sovGranularity];
 
  // Deteksi brand keys dinamis dari data SOV (semua key selain "date")
  const sovBrandKeys = useMemo(() => {
    if (shareOfVoiceFromContent.length > 0) {
      const first = shareOfVoiceFromContent[0];
      return Object.keys(first).filter((k) => k !== "date");
    }
    // Fallback ke brandLabels lama
    if (brandLabels) {
      const keys = [brandLabels.yourBrand];
      if (brandLabels.competitors?.length) keys.push(...brandLabels.competitors);
      else {
        if (brandLabels.competitorA) keys.push(brandLabels.competitorA);
        if (brandLabels.competitorB) keys.push(brandLabels.competitorB);
        if (brandLabels.competitorC) keys.push(brandLabels.competitorC);
        if (brandLabels.competitorD) keys.push(brandLabels.competitorD);
      }
      return keys;
    }
    return ["yourBrand", "competitorA", "competitorB", "competitorC"];
  }, [shareOfVoiceFromContent, brandLabels]);

  // Normalisasi data SOV per tanggal menjadi persentase (agar setiap bar penuh 100%)
  const shareOfVoiceChartData = useMemo(() => {
    if (!shareOfVoiceData || shareOfVoiceData.length === 0) return [];
    return shareOfVoiceData.map((row) => {
      const out: Record<string, number | string> = { ...row };
      const total = sovBrandKeys.reduce((sum, key) => {
        const raw = (row as any)[key];
        const num = typeof raw === "number" ? raw : Number(raw) || 0;
        return sum + num;
      }, 0);
      sovBrandKeys.forEach((key) => {
        const raw = (row as any)[key];
        const mentions = typeof raw === "number" ? raw : Number(raw) || 0;
        (out as any)[`${key}Mention`] = mentions;
        const pctNum = total > 0 ? (mentions / total) * 100 : 0;
        out[key] = pctNum;
        (out as any)[`${key}Pct`] = `${pctNum.toFixed(1)}%`;
      });
      return out;
    });
  }, [shareOfVoiceData, sovBrandKeys]);

  // Labels = identity (brand name langsung sebagai key)
  const sovLabels: Record<string, string> = useMemo(() => {
    return Object.fromEntries(sovBrandKeys.map((k) => [k, k]));
  }, [sovBrandKeys]);

  // Warna per brand — ambil dari competitiveMatrixItems jika ada
  const DEFAULT_SOV_COLORS = ["#8b5cf6","#06b6d4","#f59e0b","#10b981","#f43f5e","#ec4899","#3b82f6","#84cc16","#f97316"];
  const brandColors = useMemo(() => {
    const colorMap: Record<string, string> = {};
    const matrixColorByName = Object.fromEntries(competitiveMatrixItems.map((m) => [m.name, m.color]));
    sovBrandKeys.forEach((key, i) => {
      colorMap[key] = matrixColorByName[key] ?? DEFAULT_SOV_COLORS[i % DEFAULT_SOV_COLORS.length];
    });
    return colorMap;
  }, [sovBrandKeys, competitiveMatrixItems]);

  // Function to get sentiment color (red for negative, green for positive)
  const getSentimentColor = (value: number): string => {
    if (value >= 0.7) return "rgb(34, 197, 94)"; // green-500
    if (value >= 0.6) return "rgb(74, 222, 128)"; // green-400
    if (value >= 0.5) return "rgb(134, 239, 172)"; // green-300
    if (value >= 0.4) return "rgb(254, 215, 170)"; // orange-200
    if (value >= 0.3) return "rgb(254, 159, 130)"; // orange-300
    return "rgb(239, 68, 68)"; // red-500
  };

  // Function to get text color based on background
  const getTextColor = (value: number): string => {
    if (value >= 0.5) return "rgb(255, 255, 255)";
    if (value >= 0.4) return "rgb(15, 23, 42)"; // slate-900
    return "rgb(255, 255, 255)";
  };

  // Function to get volume color (blue scale)
  const getVolumeColor = (value: number, max: number): string => {
    const intensity = value / max;
    if (intensity >= 0.9) return "rgb(30, 58, 138)"; // blue-900
    if (intensity >= 0.8) return "rgb(30, 64, 175)"; // blue-800
    if (intensity >= 0.7) return "rgb(37, 99, 235)"; // blue-600
    if (intensity >= 0.6) return "rgb(59, 130, 246)"; // blue-500
    if (intensity >= 0.5) return "rgb(96, 165, 250)"; // blue-400
    if (intensity >= 0.4) return "rgb(147, 197, 253)"; // blue-300
    if (intensity >= 0.3) return "rgb(191, 219, 254)"; // blue-200
    return "rgb(219, 234, 254)"; // blue-100
  };

  const getVolumeTextColor = (value: number, max: number): string => {
    const intensity = value / max;
    return intensity >= 0.5 ? "rgb(255, 255, 255)" : "rgb(15, 23, 42)";
  };

    const getQuadrantColor = (sentiment: number, mentions: number) => {
      if (sentiment >= 0 && mentions <= 0) return "#10b981"; // Winning (emerald)
      if (sentiment >= 0 && mentions > 0) return "#06b6d4"; // Opportunity (cyan)
      if (sentiment < 0 && mentions <= 0) return "#f59e0b"; // Improvement (amber)
      if (sentiment < 0 && mentions > 0) return "#ef4444"; // Critical (red)
      return "#64748b"; // default
    };

    const getColorByCategory = (category: string) => {
      switch (category) {
        case "winning":
          return "#10b981"; // emerald-500
        case "opportunity":
          return "#06b6d4"; // cyan-500
        case "critical":
          return "#ef4444"; // red-500
        case "improvement":
        case "moderate":
          return "#f59e0b"; // amber-500
        default:
          return "#64748b"; // slate-500
      }
    };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border-2 border-violet-200 rounded-xl p-4 shadow-xl" style={{ zIndex: 9999, position: 'relative' }}>
          <p className="font-semibold text-slate-900 mb-3">{data.issue}</p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600">Your Sentiment:</span>
              <span className="font-semibold text-slate-900">{data.yourSentiment.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600">Competitors Median:</span>
              <span className="font-semibold text-slate-900">{data.competitorMedianSentiment.toFixed(2)}</span>
            </div>
            <div className="h-px bg-slate-200 my-2" />
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600">Your Mentions:</span>
              <span className="font-semibold text-slate-900">{data.yourMentions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600">Competitors Median:</span>
              <span className="font-semibold text-slate-900">{data.competitorMedianMentions.toLocaleString()}</span>
            </div>
            <div className="h-px bg-slate-200 my-2" />
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600">Relative Sentiment:</span>
              <span className={`font-semibold ${data.relativeSentiment > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {data.relativeSentiment > 0 ? '+' : ''}{data.relativeSentiment}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600">Relative Mentions:</span>
              <span className={`font-semibold ${data.relativeMentions > 0 ? 'text-cyan-600' : 'text-slate-600'}`}>
                {data.relativeMentions > 0 ? '+' : ''}{data.relativeMentions}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="competitive-analysis">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-slate-900 mb-1">Competitive Analysis</h3>
          <p className="text-sm text-slate-600">How you compare to competitors across key issues</p>
        </div>
      </div>

      {/* Competitors Overview carousel */}
      <div className="mb-6">
        <h4 className="text-slate-900 mb-3">Competitors Overview</h4>
        <div className="flex items-stretch gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
          {competitorsOverview.map((comp) => {
            const sentimentPct = Math.round(comp.avgSentiment * 100);

            return (
              <div
                key={comp.id}
                className="flex-shrink-0 w-72 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                    style={{ backgroundColor: comp.color ?? "#8b5cf6" }}
                  >
                    {comp.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{comp.name}</p>
                    <p className="text-xs text-slate-500">Competitor</p>
                  </div>
                </div>

                {/* Keywords */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Keywords</p>
                  <div className="flex flex-wrap gap-1.5 h-[68px] overflow-y-auto content-start" style={{ scrollbarWidth: "thin" }}>
                    {comp.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                          borderColor: comp.color ?? "#8b5cf6",
                          color: comp.color ?? "#8b5cf6",
                          backgroundColor: `${comp.color ?? "#8b5cf6"}18`,
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Competitive Position — flex-1 agar semua card punya tinggi seragam */}
                <div className="flex-1 mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Competitive Position</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{comp.competitivePosition}</p>
                </div>

                {/* Stats row — selalu di bawah */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                      <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-900">{comp.conversations.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">Conversations</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <div className="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center">
                      <Mic2 className="w-3.5 h-3.5 text-cyan-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-900">{comp.shareOfVoice}%</p>
                    <p className="text-[10px] text-slate-500 leading-tight">Share of Voice</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Smile className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-900">{sentimentPct}%</p>
                    <p className="text-[10px] text-slate-500 leading-tight">Avg Sentiment</p>
                  </div>
                </div>

                </div>
            );
          })}
        </div>
      </div>

      <div id="competitive-issues-matrix" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-slate-900 mb-1">Competitive Issues Matrix</h4>
            <p className="text-xs text-slate-600">Position relative to competitor median performance</p>
          </div>
          
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Winning Position</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-slate-600">Amplify Opportunity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-600">Critical Issue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-600">Room for Improvement</span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={500}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  dataKey="relativeMentions" 
                  name="Relative Mentions"
                  unit="%"
                  domain={xDomain}
                  allowDataOverflow={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  label={{ 
                    value: 'Relative Mentions Volume (%)', 
                    position: 'bottom',
                    offset: 40,
                    style: { fontSize: 13, fill: '#475569', fontWeight: 600 }
                  }}
                />
                <YAxis 
                  type="number" 
                  dataKey="relativeSentiment" 
                  name="Relative Sentiment"
                  unit="%"
                  domain={yDomain}
                  allowDataOverflow={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  label={{ 
                    value: 'Relative Sentiment (%)', 
                    angle: -90, 
                    position: 'left',
                    offset: 40,
                    style: { fontSize: 13, fill: '#475569', fontWeight: 600 }
                  }}
                />
                <ZAxis range={[100, 100]} />
                
                {/* Reference lines for quadrants - always at center (0, 0) */}
                <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={2} isFront={false} />
                <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={2} isFront={false} />
                
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ strokeDasharray: '3 3' }}
                  wrapperStyle={{ zIndex: 9999 }}
                />
                
                <Scatter 
                  name="Issues" 
                  data={issuesData} 
                  fill="#8b5cf6"
                >
                  {issuesData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getQuadrantColor(entry.relativeSentiment, entry.relativeMentions)} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
          </ResponsiveContainer>

          {/* Quadrant Labels — semi-transparan & menempel di sudut chart agar tidak menutupi data point */}
          <div className="absolute top-5 left-[68px] bg-emerald-50/70 border border-emerald-200/70 rounded-lg px-2.5 py-1 pointer-events-none backdrop-blur-[2px]">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span className="text-[11px] font-semibold text-emerald-700">Winning Position</span>
            </div>
            <p className="text-[10px] text-emerald-600/90 mt-0.5">High sentiment, Low mentions</p>
          </div>

          <div className="absolute top-5 right-3 bg-cyan-50/70 border border-cyan-200/70 rounded-lg px-2.5 py-1 pointer-events-none backdrop-blur-[2px]">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-cyan-600" />
              <span className="text-[11px] font-semibold text-cyan-700">Amplify Opportunity</span>
            </div>
            <p className="text-[10px] text-cyan-600/90 mt-0.5">High sentiment, High mentions</p>
          </div>

          <div className="absolute bottom-[68px] left-[68px] bg-amber-50/70 border border-amber-200/70 rounded-lg px-2.5 py-1 pointer-events-none backdrop-blur-[2px]">
            <div className="flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-600" />
              <span className="text-[11px] font-semibold text-amber-700">Room for Improvement</span>
            </div>
            <p className="text-[10px] text-amber-600/90 mt-0.5">Low sentiment, Low mentions</p>
          </div>

          <div className="absolute bottom-[68px] right-3 bg-red-50/70 border border-red-200/70 rounded-lg px-2.5 py-1 pointer-events-none backdrop-blur-[2px]">
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-600" />
              <span className="text-[11px] font-semibold text-red-700">Critical Issue</span>
            </div>
            <p className="text-[10px] text-red-600/90 mt-0.5">Low sentiment, High mentions</p>
          </div>
        </div>

        {/* Key Insights - now as horizontal carousel */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          {(() => {
            const items =
              content?.competitiveKeyInsights?.length
                ? content.competitiveKeyInsights
                : [
                    {
                      id: "ki1",
                      type: "critical" as const,
                      title: "Critical Issues",
                      description:
                        "Customer Service & Packaging are significantly underperforming with high visibility",
                      bullets: [
                        "Support Availability: -40% sentiment, +35% mentions",
                        "Customer Service: -35% sentiment, +40% mentions",
                      ],
                    },
                    {
                      id: "ki2",
                      type: "strength" as const,
                      title: "Competitive Strengths",
                      description: "Innovation & Product Quality are strong differentiators",
                      bullets: [
                        "Innovation: +18% sentiment, +35% mentions",
                        "Shipping Speed: +20% sentiment, +10% mentions",
                      ],
                    },
                  ];

            const total = items.length;
            const safeIndex =
              total === 0 ? 0 : Math.min(total - 1, Math.max(0, activeInsightIndex));

            const goPrev = () => {
              if (total <= 1) return;
              setActiveInsightIndex((prev) => (prev - 1 + total) % total);
            };

            const goNext = () => {
              if (total <= 1) return;
              setActiveInsightIndex((prev) => (prev + 1) % total);
            };

            if (total === 0) return null;

            return (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-sm font-semibold text-slate-900">Key Insights</h5>
                  {total > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {safeIndex + 1} / {total}
                      </span>
                      <div className="inline-flex rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <button
                          type="button"
                          onClick={goPrev}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-l border-slate-200 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative min-h-[180px]">
                  {items.map((item, idx) => {
                    const isActive = idx === safeIndex;
                    const baseClasses =
                      "rounded-lg p-4 transition-all duration-300 ease-out " +
                      (isActive
                        ? "opacity-100 translate-x-0 relative"
                        : "opacity-0 translate-x-4 pointer-events-none absolute inset-0");

                    if (item.type === "critical") {
                      return (
                        <div
                          key={item.id}
                          className={`bg-red-50 border border-red-200 ${baseClasses}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-red-900 mb-1">
                                {item.title}
                              </p>
                              <p className="text-xs text-red-700 mb-2">
                                {item.description}
                              </p>
                              {item.bullets?.length > 0 && (
                                <ul className="text-xs text-red-600 space-y-1">
                                  {item.bullets.map((b, i) => (
                                    <li key={i}>• {b}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.id}
                        className={`bg-emerald-50 border border-emerald-200 ${baseClasses}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-emerald-900 mb-1">
                              {item.title}
                            </p>
                            <p className="text-xs text-emerald-700 mb-2">
                              {item.description}
                            </p>
                            {item.bullets?.length > 0 && (
                              <ul className="text-xs text-emerald-600 space-y-1">
                                {item.bullets.map((b, i) => (
                                  <li key={i}>• {b}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Competitive Matrix */}
      <div id="competitive-matrix" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h4 className="text-slate-900 mb-0.5">Competitive Matrix</h4>
            <p className="text-xs text-slate-600">Volume vs sentiment across brands</p>
          </div>
        </div>
        <CompetitiveMatrixChart />
      </div>

      {/* Competitive Issues Heatmaps */}
      <div id="competitive-heatmaps" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-6">
        <div className="mb-6">
          <h4 className="text-slate-900 mb-1">Competitive Issues Heatmaps</h4>
          <p className="text-xs text-slate-600">Detailed comparison of sentiment and mentions volume across all competitors</p>
        </div>

        <div className="space-y-8">
          {/* Sentiment Scores Heatmap */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-red-500 flex items-center justify-center">
                <ThermometerSun className="w-4 h-4 text-white" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-slate-900">Sentiment Scores</h5>
                <p className="text-xs text-slate-600">Darker green = more positive, Darker red = more negative</p>
              </div>
            </div>

            <div className="max-w-full overflow-x-auto overflow-y-visible rounded-lg border border-slate-200" style={{ scrollbarGutter: "stable" }}>
              <p className="text-xs text-slate-500 mb-2">Geser kanan/kiri untuk melihat semua merek</p>
              <table className="w-full border-collapse min-w-max">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 sticky left-0 z-20 min-w-[120px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                      Issue
                    </th>
                    {companies.map((company, idx) => (
                      <th
                        key={idx}
                        className={`p-3 text-xs font-semibold text-slate-700 border border-slate-200 text-center whitespace-nowrap ${
                          idx === 0 ? 'bg-violet-50' : 'bg-slate-50'
                        }`}
                      >
                        {company}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sentimentHeatmapData.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      <td className="p-3 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 sticky left-0 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                        {row.issue}
                      </td>
                      {companies.map((company, colIdx) => {
                        const value = getBrandValue(row, company);
                        const normalized = normalizeSentiment(value);
                        return (
                          <td
                            key={colIdx}
                            className="p-3 text-xs font-semibold text-center border border-slate-200 whitespace-nowrap"
                            style={{
                              backgroundColor: getSentimentColor(normalized),
                              color: getTextColor(normalized),
                            }}
                          >
                            {value > 1 ? value.toFixed(2) : (value * 100).toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sentiment Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(239, 68, 68)" }} />
                <span className="text-slate-600">Very Negative</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(254, 159, 130)" }} />
                <span className="text-slate-600">Negative</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(134, 239, 172)" }} />
                <span className="text-slate-600">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(74, 222, 128)" }} />
                <span className="text-slate-600">Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(34, 197, 94)" }} />
                <span className="text-slate-600">Very Positive</span>
              </div>
            </div>
          </div>

          {/* Volume of Mentions Heatmap */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-300 to-blue-900 flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-slate-900">Volume of Mentions</h5>
                <p className="text-xs text-slate-600">Darker blue = higher volume of conversations</p>
              </div>
            </div>

            <div className="max-w-full overflow-x-auto overflow-y-visible rounded-lg border border-slate-200" style={{ scrollbarGutter: "stable" }}>
              <p className="text-xs text-slate-500 mb-2">Geser kanan/kiri untuk melihat semua merek</p>
              <table className="w-full border-collapse min-w-max">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 sticky left-0 z-20 min-w-[120px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                      Issue
                    </th>
                    {companies.map((company, idx) => (
                      <th
                        key={idx}
                        className={`p-3 text-xs font-semibold text-slate-700 border border-slate-200 text-center whitespace-nowrap ${
                          idx === 0 ? 'bg-violet-50' : 'bg-slate-50'
                        }`}
                      >
                        {company}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {volumeHeatmapData.map((row, rowIdx) => {
                    const maxVolume = Math.max(
                      ...companies.map(company => getBrandValue(row, company))
                    );
                    
                    return (
                      <tr key={rowIdx}>
                        <td className="p-3 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 sticky left-0 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                          {row.issue}
                        </td>
                        {companies.map((company, colIdx) => {
                          const value = getBrandValue(row, company);
                          return (
                            <td
                              key={colIdx}
                              className="p-3 text-xs font-semibold text-center border border-slate-200 whitespace-nowrap"
                              style={{
                                backgroundColor: getVolumeColor(value, maxVolume),
                                color: getVolumeTextColor(value, maxVolume),
                              }}
                            >
                              {value.toLocaleString()}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Volume Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(219, 234, 254)" }} />
                <span className="text-slate-600">Low Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(147, 197, 253)" }} />
                <span className="text-slate-600">Medium-Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(59, 130, 246)" }} />
                <span className="text-slate-600">Medium-High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(30, 64, 175)" }} />
                <span className="text-slate-600">High Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(30, 58, 138)" }} />
                <span className="text-slate-600">Very High Volume</span>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Share of Platform */}
        <div id="share-of-platform" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <PieChart className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h4 className="text-slate-900 mb-0.5">Share of Platform</h4>
              <p className="text-xs text-slate-600">Historical number of conversations, broken down by platform</p>
            </div>
          </div>
          <ShareOfPlatform />
        </div>

        {/* Share of Voice */}
        <div id="share-of-voice" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <h4 className="text-slate-900 mb-0.5">Share of Voice</h4>
                <p className="text-xs text-slate-600">Historical number of conversations, broken down by brand</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {(["daily", "weekly", "monthly"] as Granularity[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setSovGranularity(g)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    sovGranularity === g
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
          <BarChart data={shareOfVoiceChartData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  interval={sovGranularity === "daily" ? 2 : 0}
                />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (typeof v === "number" && v.toFixed ? v.toFixed(0) : v)}
              label={{
                value: 'Share (%)',
                angle: -90,
                position: 'insideLeft',
                offset: -5,
                style: { fontSize: 12, fill: '#475569', fontWeight: 600 },
              }}
            />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
                  const row = payload[0]?.payload as Record<string, number | string> | undefined;
                  const totalMentions = sovBrandKeys.reduce((sum, key) => {
                    const v = row?.[`${key}Mention`];
                    return sum + (typeof v === "number" ? v : 0);
                  }, 0);
                  return (
                    <div className="bg-white border-2 border-slate-200 rounded-xl p-3 shadow-xl">
                      <p className="font-semibold text-slate-900 mb-2 text-sm">{label}</p>
                      <div className="space-y-1.5">
                        {payload.map((entry: any, idx: number) => {
                          const key = entry.dataKey as string;
                          const mentionFromRow = row?.[`${key}Mention`];
                          const mentions = typeof mentionFromRow === "number" ? mentionFromRow : 0;
                          const pctFromRow = row?.[`${key}Pct`];
                          const pct =
                            typeof pctFromRow === "string" && pctFromRow
                              ? pctFromRow
                              : total > 0
                                ? `${((entry.value || 0) / total * 100).toFixed(1)}%`
                                : "0%";
                          return (
                            <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-slate-600">{sovLabels[entry.dataKey] || entry.dataKey}</span>
                              </div>
                              <span className="font-semibold text-slate-900">
                                {mentions.toLocaleString()} <span className="text-slate-500 font-normal">({pct})</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="border-t border-slate-200 mt-2 pt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Total Conversations</span>
                        <span className="font-semibold text-slate-900">{totalMentions.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                }}
              />
            <Legend
              formatter={(value: string) => <span className="text-xs text-slate-700">{sovLabels[value] || value}</span>}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: 8 }}
            />
            {sovBrandKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={brandColors[key]}
                radius={i === sovBrandKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}