"use client";

import { useState, useMemo } from "react";
import { auditLog, AuditLogEntry } from "@/data/auditLog";
import { formatDateTime } from "@/lib/utils";
import ExportButton from "@/components/ExportButton";

export default function AuditLogPage() {
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("ALL");
  const [actionFilter, setActionFilter] = useState<string>("ALL");

  const filteredLogs = useMemo(() => {
    let logs = [...auditLog];
    if (entityTypeFilter !== "ALL") {
      logs = logs.filter((log) => log.entityType === entityTypeFilter);
    }
    if (actionFilter !== "ALL") {
      logs = logs.filter((log) => log.action === actionFilter);
    }
    return logs;
  }, [entityTypeFilter, actionFilter]);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "UPDATE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "TRIGGER":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "TOGGLE":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "TEMPLATE":
        return "📝";
      case "OVERRIDE":
        return "✏️";
      case "ORG":
        return "🏢";
      case "PROVISIONING":
        return "⚙️";
      case "SUPPRESSION":
        return "🚫";
      default:
        return "📄";
    }
  };

  const exportColumns = [
    { key: "timestamp", label: "Timestamp" },
    { key: "action", label: "Action" },
    { key: "entityType", label: "Entity Type" },
    { key: "entityName", label: "Entity Name" },
    { key: "userName", label: "User" },
    { key: "details", label: "Details" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Log</h1>
        <ExportButton
          data={filteredLogs}
          columns={exportColumns}
          filename={`audit-log-${new Date().toISOString().split("T")[0]}`}
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entity Type
            </label>
            <select
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ALL">All Types</option>
              <option value="TEMPLATE">Templates</option>
              <option value="OVERRIDE">Overrides</option>
              <option value="ORG">Organizations</option>
              <option value="PROVISIONING">Provisioning</option>
              <option value="SUPPRESSION">Suppressions</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="TRIGGER">Trigger</option>
              <option value="TOGGLE">Toggle</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredLogs.map((entry) => (
            <div key={entry.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 text-2xl">{getEntityIcon(entry.entityType)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getActionBadgeColor(
                        entry.action
                      )}`}
                    >
                      {entry.action}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.entityName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({entry.entityType})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{entry.details}</p>
                  {entry.changes && entry.changes.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {entry.changes.map((change, index) => (
                        <div key={index} className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">{change.field}:</span>{" "}
                          <span className="line-through text-red-500">{change.oldValue}</span>{" "}
                          <span className="text-green-600 dark:text-green-400">→ {change.newValue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex items-center text-xs text-gray-400">
                    <span>{entry.userName}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDateTime(entry.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No audit log entries found matching the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}

