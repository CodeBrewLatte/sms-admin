"use client";

import { calculateHealthScore } from "@/lib/utils";

interface HealthScoreProps {
  org: {
    smsEnabled: boolean;
    smsReady: boolean;
    twilioSubaccountSid?: string;
    a2pBrandId?: string;
  };
  deliveryRate: number;
  suppressionCount: number;
  size?: "sm" | "md" | "lg";
}

export default function HealthScore({
  org,
  deliveryRate,
  suppressionCount,
  size = "md",
}: HealthScoreProps) {
  const { score, label, color } = calculateHealthScore(org, deliveryRate, suppressionCount);

  const colorClasses = {
    green: {
      bg: "bg-green-100",
      text: "text-green-800",
      ring: "ring-green-500",
      fill: "bg-green-500",
    },
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      ring: "ring-blue-500",
      fill: "bg-blue-500",
    },
    yellow: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      ring: "ring-yellow-500",
      fill: "bg-yellow-500",
    },
    red: {
      bg: "bg-red-100",
      text: "text-red-800",
      ring: "ring-red-500",
      fill: "bg-red-500",
    },
  };

  const colors = colorClasses[color as keyof typeof colorClasses];

  const sizeClasses = {
    sm: { container: "w-10 h-10", text: "text-xs", label: "text-xs" },
    md: { container: "w-14 h-14", text: "text-sm", label: "text-sm" },
    lg: { container: "w-20 h-20", text: "text-lg", label: "text-base" },
  };

  const sizes = sizeClasses[size];

  return (
    <div className="flex items-center space-x-2">
      {/* Circular progress */}
      <div className={`relative ${sizes.container}`}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="currentColor"
            strokeWidth="8%"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="currentColor"
            strokeWidth="8%"
            fill="none"
            strokeDasharray={`${score * 2.83} 283`}
            strokeLinecap="round"
            className={colors.text}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${colors.text} ${sizes.text}`}>{score}</span>
        </div>
      </div>
      {size !== "sm" && (
        <div>
          <span className={`font-medium ${colors.text} ${sizes.label}`}>{label}</span>
        </div>
      )}
    </div>
  );
}

