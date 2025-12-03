"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrganizations, getSmsTemplates, getSmsLogs, getSuppressionsByOrg } from "@/lib/api";
import { Organization, SmsTemplate, SmsMessageLog } from "@/types";
import { calculateDeliveryStats, formatDateTime } from "@/lib/utils";
import HealthScore from "@/components/HealthScore";
import ExportButton from "@/components/ExportButton";

export default function Dashboard() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [allLogs, setAllLogs] = useState<SmsMessageLog[]>([]);
  const [orgSuppressions, setOrgSuppressions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [orgsData, templatesData, logsData] = await Promise.all([
        getOrganizations(),
        getSmsTemplates(),
        getSmsLogs({}),
      ]);
      setOrgs(orgsData);
      setTemplates(templatesData);
      setAllLogs(logsData);

      // Load suppressions for each org
      const suppressions: Record<string, number> = {};
      for (const org of orgsData) {
        const sups = await getSuppressionsByOrg(org.id);
        suppressions[org.id] = sups.length;
      }
      setOrgSuppressions(suppressions);
      setLoading(false);
    }
    loadData();
  }, []);

  const stats = calculateDeliveryStats(allLogs);
  const smsEnabledCount = orgs.filter((o) => o.smsEnabled).length;
  const smsReadyCount = orgs.filter((o) => o.smsReady).length;
  const activeTemplatesCount = templates.filter((t) => t.isActive).length;

  // Get delivery rate per org for the chart
  const orgDeliveryRates = orgs.map((org) => {
    const orgLogs = allLogs.filter((l) => l.orgId === org.id);
    const orgStats = calculateDeliveryStats(orgLogs);
    return { org, rate: orgStats.deliveryRate, total: orgStats.total };
  }).sort((a, b) => b.total - a.total).slice(0, 5);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Organizations</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{orgs.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {smsEnabledCount} enabled, {smsReadyCount} ready
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Templates</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{templates.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activeTemplatesCount} active</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Rate</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.deliveryRate}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {stats.delivered} of {stats.total - stats.received} delivered
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed Messages</h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.failed}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stats.failureRate}% failure rate</p>
        </div>
      </div>

      {/* Delivery Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Message Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Message Status Breakdown</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Delivered</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.delivered}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(stats.delivered / stats.total) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Sent</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.sent}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(stats.sent / stats.total) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Queued</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.queued}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${(stats.queued / stats.total) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Failed</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.failed}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(stats.failed / stats.total) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Inbound</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.received}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${(stats.received / stats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Organizations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Organizations by Volume</h2>
          <div className="space-y-4">
            {orgDeliveryRates.map(({ org, rate, total }) => (
              <div key={org.id} className="flex items-center space-x-4">
                <HealthScore
                  org={org}
                  deliveryRate={rate}
                  suppressionCount={orgSuppressions[org.id] || 0}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/orgs/${org.id}`}
                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 truncate block"
                  >
                    {org.name}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {total} messages · {rate}% delivered
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent SMS Activity</h2>
          <ExportButton
            data={allLogs.slice(0, 100)}
            columns={[
              { key: "createdAt", label: "Time" },
              { key: "orgId", label: "Org ID" },
              { key: "direction", label: "Direction" },
              { key: "phoneNumber", label: "Phone" },
              { key: "status", label: "Status" },
              { key: "body", label: "Message" },
            ]}
            filename="recent-sms-logs"
            label="Export"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Org
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {allLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {orgs.find((o) => o.id === log.orgId)?.name || log.orgId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.direction === "OUTBOUND"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}
                    >
                      {log.direction}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {log.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.status === "DELIVERED" || log.status === "RECEIVED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : log.status === "FAILED"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : log.status === "SENT"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDateTime(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/logs"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all logs →
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/orgs"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-2xl mb-2">🏢</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Organizations</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage {orgs.length} organizations
          </p>
        </Link>
        <Link
          href="/templates"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-2xl mb-2">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Templates</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {templates.length} master templates
          </p>
        </Link>
        <Link
          href="/audit"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-2xl mb-2">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Log</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track all changes
          </p>
        </Link>
      </div>
    </div>
  );
}
