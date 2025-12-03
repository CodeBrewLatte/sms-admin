"use client";

import { useState, useEffect } from "react";
import { QuietHoursConfig, getQuietHoursForOrg, updateQuietHours, timezones } from "@/data/quietHours";

interface QuietHoursConfigProps {
  orgId: string;
}

export default function QuietHoursConfigComponent({ orgId }: QuietHoursConfigProps) {
  const [config, setConfig] = useState<QuietHoursConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [enabled, setEnabled] = useState(false);
  const [startTime, setStartTime] = useState("21:00");
  const [endTime, setEndTime] = useState("09:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [applyToMarketing, setApplyToMarketing] = useState(true);
  const [applyToTransactional, setApplyToTransactional] = useState(false);

  useEffect(() => {
    const existing = getQuietHoursForOrg(orgId);
    if (existing) {
      setConfig(existing);
      setEnabled(existing.enabled);
      setStartTime(existing.startTime);
      setEndTime(existing.endTime);
      setTimezone(existing.timezone);
      setDaysOfWeek([...existing.daysOfWeek]);
      setApplyToMarketing(existing.applyToMarketing);
      setApplyToTransactional(existing.applyToTransactional);
    }
  }, [orgId]);

  const handleSave = () => {
    setSaving(true);
    const updated = updateQuietHours(orgId, {
      enabled,
      startTime,
      endTime,
      timezone,
      daysOfWeek,
      applyToMarketing,
      applyToTransactional,
    });
    setConfig(updated);
    setSaving(false);
    setIsEditing(false);
  };

  const toggleDay = (day: number) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quiet Hours</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Configure
          </button>
        </div>

        {config && config.enabled ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                ACTIVE
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {config.startTime} - {config.endTime}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {timezones.find((t) => t.value === config.timezone)?.label || config.timezone}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Applies to: {[config.applyToMarketing && "Marketing", config.applyToTransactional && "Transactional"].filter(Boolean).join(", ")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Days: {config.daysOfWeek.map((d) => dayNames[d]).join(", ")}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Quiet hours are not configured. Messages can be sent at any time.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configure Quiet Hours</h3>

      <div className="space-y-4">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-900 dark:text-white">Enable Quiet Hours</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Days of Week
          </label>
          <div className="flex flex-wrap gap-2">
            {dayNames.map((day, index) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(index)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  daysOfWeek.includes(index)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Apply To
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={applyToMarketing}
                onChange={(e) => setApplyToMarketing(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Marketing messages</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={applyToTransactional}
                onChange={(e) => setApplyToTransactional(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Transactional messages</span>
            </label>
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Configuration"}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

