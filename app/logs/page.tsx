"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSmsLogs, getOrganizations, getSmsTemplates } from "@/lib/api";
import { SmsMessageLog, Organization, SmsTemplate } from "@/types";
import ExportButton from "@/components/ExportButton";

function SmsLogsContent() {
  const searchParams = useSearchParams();
  const orgIdParam = searchParams.get("orgId");

  const [logs, setLogs] = useState<SmsMessageLog[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [orgFilter, setOrgFilter] = useState<string>(orgIdParam || "ALL");
  const [directionFilter, setDirectionFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [templateFilter, setTemplateFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadData() {
      const [logsData, orgsData, templatesData] = await Promise.all([
        getSmsLogs({ orgId: orgIdParam || undefined }),
        getOrganizations(),
        getSmsTemplates(),
      ]);
      setLogs(logsData);
      setOrgs(orgsData);
      setTemplates(templatesData);
      setLoading(false);
    }
    loadData();
  }, [orgIdParam]);

  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    if (orgFilter !== "ALL") {
      filtered = filtered.filter((log) => log.orgId === orgFilter);
    }
    if (directionFilter !== "ALL") {
      filtered = filtered.filter((log) => log.direction === directionFilter);
    }
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((log) => log.status === statusFilter);
    }
    if (templateFilter !== "ALL") {
      filtered = filtered.filter((log) => log.smsTemplateId === templateFilter);
    }

    return filtered;
  }, [logs, orgFilter, directionFilter, statusFilter, templateFilter]);

  const getOrgName = (id: string): string => {
    return orgs.find((o) => o.id === id)?.name || id;
  };

  const getTemplateName = (id?: string): string => {
    if (!id) return "N/A";
    return templates.find((t) => t.id === id)?.name || id;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const exportColumns = [
    { key: "createdAt", label: "Time" },
    { key: "orgId", label: "Org ID" },
    { key: "direction", label: "Direction" },
    { key: "phoneNumber", label: "Phone" },
    { key: "status", label: "Status" },
    { key: "body", label: "Message" },
    { key: "smsTemplateId", label: "Template ID" },
    { key: "failureReason", label: "Failure Reason" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SMS Message Logs</h1>
        <ExportButton
          data={filteredLogs}
          columns={exportColumns}
          filename={`sms-logs-${new Date().toISOString().split("T")[0]}`}
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization
            </label>
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Organizations</option>
              {orgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Direction</label>
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All</option>
              <option value="OUTBOUND">Outbound</option>
              <option value="INBOUND">Inbound</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All</option>
              <option value="QUEUED">Queued</option>
              <option value="SENT">Sent</option>
              <option value="DELIVERED">Delivered</option>
              <option value="FAILED">Failed</option>
              <option value="RECEIVED">Received</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
            <select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Templates</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredLogs.length} of {logs.length} messages
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/orgs/${log.orgId}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {getOrgName(log.orgId)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.direction === "OUTBOUND"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {log.direction}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.status === "DELIVERED" || log.status === "RECEIVED"
                          ? "bg-green-100 text-green-800"
                          : log.status === "FAILED"
                          ? "bg-red-100 text-red-800"
                          : log.status === "SENT"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {log.status}
                    </span>
                    {log.failureReason && (
                      <div className="text-xs text-red-600 mt-1 max-w-xs truncate">
                        {log.failureReason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getTemplateName(log.smsTemplateId)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate" title={log.body}>
                      {log.body}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            No messages found matching the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}

export default function SmsLogsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <SmsLogsContent />
    </Suspense>
  );
}

