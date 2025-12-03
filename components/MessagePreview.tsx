"use client";

import { useState } from "react";
import { substituteVariables, sampleVariables } from "@/lib/utils";

interface MessagePreviewProps {
  body: string;
  variables: string[];
}

export default function MessagePreview({ body, variables }: MessagePreviewProps) {
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [showCustomize, setShowCustomize] = useState(false);

  const getPreviewBody = () => {
    const merged = { ...sampleVariables, ...customValues };
    return substituteVariables(body, merged);
  };

  const previewBody = getPreviewBody();
  const charCount = previewBody.length;
  const segmentCount = Math.ceil(charCount / 160);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">Message Preview</span>
        <button
          onClick={() => setShowCustomize(!showCustomize)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {showCustomize ? "Hide" : "Customize"} Values
        </button>
      </div>

      {showCustomize && (
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            {variables.map((variable) => (
              <div key={variable}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {`{{${variable}}}`}
                </label>
                <input
                  type="text"
                  value={customValues[variable] || sampleVariables[variable] || ""}
                  onChange={(e) =>
                    setCustomValues({ ...customValues, [variable]: e.target.value })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-4">
        {/* Phone mockup */}
        <div className="max-w-xs mx-auto">
          <div className="bg-gray-900 rounded-3xl p-2">
            <div className="bg-white rounded-2xl p-4 min-h-[120px]">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">SMS</span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{previewBody}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 text-center text-xs text-gray-500">
          {charCount} characters · {segmentCount} {segmentCount === 1 ? "segment" : "segments"}
        </div>
      </div>
    </div>
  );
}

