import { useMemo } from "react";
import { ThermometerSun, Volume2 } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import type { CompetitiveHeatmapRow } from "@/lib/dashboard-content-types";

type HeatmapRow = CompetitiveHeatmapRow;

export function CompetitiveHeatmapsView() {
  const content = useDashboardContent();

  // Ambil data heatmap dari instance; fallback ke kosong jika tidak ada
  const sentimentHeatmapData: HeatmapRow[] = (content?.competitiveSentimentScores ??
    []) as HeatmapRow[];
  const volumeHeatmapData: HeatmapRow[] = (content?.competitiveVolumeOfMentions ??
    []) as HeatmapRow[];

  const brandLabels = content?.competitiveBrandLabels;
  const competitiveMatrixItems = content?.competitiveMatrixItems ?? [];

  // Brand/kolom yang ditampilkan di heatmap (scrollable)
  const companies = useMemo(() => {
    if (competitiveMatrixItems.length > 0) {
      return competitiveMatrixItems.map((item) => item.name);
    }
    if (brandLabels) {
      const list: string[] = [];
      list.push(brandLabels.yourBrand);
      if (brandLabels.competitors?.length) {
        list.push(...brandLabels.competitors);
      } else {
        if (brandLabels.competitorA) list.push(brandLabels.competitorA);
        if (brandLabels.competitorB) list.push(brandLabels.competitorB);
        if (brandLabels.competitorC) list.push(brandLabels.competitorC);
        if (brandLabels.competitorD) list.push(brandLabels.competitorD);
      }
      return list;
    }
    return [];
  }, [competitiveMatrixItems, brandLabels]);

  // Jika kedua heatmap kosong, tampilkan placeholder
  if (!sentimentHeatmapData.length && !volumeHeatmapData.length) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-slate-500 rounded-xl border border-dashed border-slate-200">
        No heatmap data for this instance.
      </div>
    );
  }

  // Ambil nilai untuk satu brand dari satu baris heatmap
  const getBrandValue = (row: HeatmapRow, brandName: string): number => {
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

  // Normalisasi sentiment 0–1 (data bisa 0–1 atau 0–100)
  const normalizeSentiment = (v: number): number => (v > 1 ? v / 100 : v);

  // Warna sentiment (meniru Benings)
  const getSentimentColor = (value: number): string => {
    const v = normalizeSentiment(value);
    if (v >= 0.8) return "rgb(34, 197, 94)"; // Very Positive
    if (v >= 0.7) return "rgb(74, 222, 128)"; // Positive
    if (v >= 0.5) return "rgb(134, 239, 172)"; // Neutral
    if (v >= 0.3) return "rgb(251, 146, 60)"; // Negative (orange)
    return "rgb(239, 68, 68)"; // Very Negative
  };

  const getSentimentTextColor = (value: number): string => {
    const v = normalizeSentiment(value);
    if (v >= 0.5) return "rgb(255,255,255)";
    if (v >= 0.4) return "rgb(15,23,42)";
    return "rgb(255,255,255)";
  };

  // Warna volume (skala biru)
  const getVolumeColor = (value: number, max: number): string => {
    if (max <= 0) return "rgb(241,245,249)";
    const intensity = value / max;
    if (intensity >= 0.9) return "rgb(30, 58, 138)"; // Very High
    if (intensity >= 0.7) return "rgb(37, 99, 235)"; // High
    if (intensity >= 0.5) return "rgb(59, 130, 246)"; // Medium-High
    if (intensity >= 0.3) return "rgb(147, 197, 253)"; // Medium-Low
    return "rgb(219, 234, 254)"; // Low
  };

  const getVolumeTextColor = (value: number, max: number): string => {
    if (max <= 0) return "rgb(15,23,42)";
    const intensity = value / max;
    return intensity >= 0.6 ? "rgb(255,255,255)" : "rgb(15,23,42)";
  };

  const formatSentiment = (v: number): string => {
    const n = normalizeSentiment(v) * 100;
    return `${n.toFixed(2)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Sentiment Scores */}
      {sentimentHeatmapData.length > 0 && (
        <div className="bg-slate-50/60 rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-red-500 flex items-center justify-center">
              <ThermometerSun className="w-4 h-4 text-white" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-slate-900">Sentiment Scores</h5>
              <p className="text-xs text-slate-600">
                Darker green = more positive, Darker red = more negative
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Geser kanan/kiri untuk melihat semua merek
              </p>
            </div>
          </div>

          <div
            className="max-w-full overflow-x-auto overflow-y-visible rounded-lg border border-slate-200 bg-white"
            style={{ scrollbarGutter: "stable" }}
          >
            <table className="w-full border-collapse min-w-max text-xs">
              <thead>
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-700 bg-slate-50 border border-slate-200 sticky left-0 z-20 min-w-[120px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    Issue
                  </th>
                  {companies.map((company, idx) => (
                    <th
                      key={company}
                      className={`p-3 font-semibold text-slate-700 border border-slate-200 text-center whitespace-nowrap ${
                        idx === 0 ? "bg-violet-50" : "bg-slate-50"
                      }`}
                    >
                      {company}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sentimentHeatmapData.map((row, rowIdx) => (
                  <tr key={row.issue || rowIdx}>
                    <td className="p-3 font-medium text-slate-900 bg-slate-50 border border-slate-200 sticky left-0 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                      {row.issue}
                    </td>
                    {companies.map((company) => {
                      const value = getBrandValue(row, company);
                      const bg = getSentimentColor(value);
                      const fg = getSentimentTextColor(value);
                      return (
                        <td
                          key={company}
                          className="p-3 text-center border border-slate-200 whitespace-nowrap font-semibold"
                          style={{ backgroundColor: bg, color: fg }}
                        >
                          {formatSentiment(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(239,68,68)" }} />
              Very Negative
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(251,146,60)" }} />
              Negative
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(134,239,172)" }} />
              Neutral
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(74,222,128)" }} />
              Positive
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(34,197,94)" }} />
              Very Positive
            </span>
          </div>
        </div>
      )}

      {/* Volume of Mentions */}
      {volumeHeatmapData.length > 0 && (
        <div className="bg-slate-50/60 rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-300 to-sky-900 flex items-center justify-center">
              <Volume2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-slate-900">Volume of Mentions</h5>
              <p className="text-xs text-slate-600">
                Darker blue = higher volume of conversations
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Geser kanan/kiri untuk melihat semua merek
              </p>
            </div>
          </div>

          <div
            className="max-w-full overflow-x-auto overflow-y-visible rounded-lg border border-slate-200 bg-white"
            style={{ scrollbarGutter: "stable" }}
          >
            <table className="w-full border-collapse min-w-max text-xs">
              <thead>
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-700 bg-slate-50 border border-slate-200 sticky left-0 z-20 min-w-[120px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    Issue
                  </th>
                  {companies.map((company, idx) => (
                    <th
                      key={company}
                      className={`p-3 font-semibold text-slate-700 border border-slate-200 text-center whitespace-nowrap ${
                        idx === 0 ? "bg-violet-50" : "bg-slate-50"
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
                    ...companies.map((company) => getBrandValue(row, company))
                  );
                  return (
                    <tr key={row.issue || rowIdx}>
                      <td className="p-3 font-medium text-slate-900 bg-slate-50 border border-slate-200 sticky left-0 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                        {row.issue}
                      </td>
                      {companies.map((company) => {
                        const value = getBrandValue(row, company);
                        const bg = getVolumeColor(value, maxVolume);
                        const fg = getVolumeTextColor(value, maxVolume);
                        return (
                          <td
                            key={company}
                            className="p-3 text-center border border-slate-200 whitespace-nowrap font-semibold"
                            style={{ backgroundColor: bg, color: fg }}
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

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(219,234,254)" }} />
              Low Volume
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(147,197,253)" }} />
              Medium-Low
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(59,130,246)" }} />
              Medium-High
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(30,64,175)" }} />
              High Volume
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: "rgb(30,58,138)" }} />
              Very High Volume
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
