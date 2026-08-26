// frontend/src/components/history/PerformanceChart.tsx

import type { InterviewDto } from "../../types/interview.types";

interface Props {
  interviews: InterviewDto[];
}

export default function PerformanceChart({ interviews }: Props) {
  const completed = interviews
    .filter((i) => i.status === "COMPLETED" && i.overallScore !== null)
    .slice(-10)
    .reverse();

  if (completed.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center justify-center h-48">
        <p className="text-slate-500 text-sm">
          Complete interviews to see your performance chart
        </p>
      </div>
    );
  }

  const maxScore = 100;
  const chartHeight = 160;
  const chartWidth = 500;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const points = completed.map((interview, index) => ({
    x: padding.left + (index / Math.max(completed.length - 1, 1)) * innerWidth,
    y: padding.top + innerHeight - ((interview.overallScore ?? 0) / maxScore) * innerHeight,
    score: interview.overallScore ?? 0,
    type: interview.type,
    date: new Date(interview.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaD =
    pathD +
    ` L ${points[points.length - 1].x} ${padding.top + innerHeight}` +
    ` L ${points[0].x} ${padding.top + innerHeight} Z`;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <p className="text-slate-300 text-sm font-semibold mb-4">
        Score Trend (Last {completed.length} interviews)
      </p>
      <div className="overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="w-full"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y =
              padding.top +
              innerHeight -
              (val / maxScore) * innerHeight;
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <text
                  x={padding.left - 5}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#gradient)" opacity="0.3" />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gradient */}
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="5"
                fill={getScoreColor(p.score)}
                stroke="#1e293b"
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={p.y - 10}
                fill={getScoreColor(p.score)}
                fontSize="10"
                textAnchor="middle"
                fontWeight="bold"
              >
                {Math.round(p.score)}
              </text>
              <text
                x={p.x}
                y={padding.top + innerHeight + 15}
                fill="#64748b"
                fontSize="9"
                textAnchor="middle"
              >
                {p.date}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 justify-center">
        {[
          { color: "bg-green-500", label: "Excellent (80+)" },
          { color: "bg-yellow-500", label: "Good (60-79)" },
          { color: "bg-red-500", label: "Needs Work (<60)" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-slate-500 text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}