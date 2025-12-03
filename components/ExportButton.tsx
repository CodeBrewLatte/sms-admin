"use client";

import { generateCSV, downloadFile } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
}

interface ExportButtonProps {
  data: Record<string, any>[];
  columns: Column[];
  filename: string;
  label?: string;
}

export default function ExportButton({
  data,
  columns,
  filename,
  label = "Export CSV",
}: ExportButtonProps) {
  const handleExport = () => {
    const csv = generateCSV(data, columns);
    downloadFile(csv, `${filename}.csv`);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <svg
        className="w-4 h-4 mr-2 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {label}
    </button>
  );
}

