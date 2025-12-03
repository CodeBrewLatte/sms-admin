"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrganizations, getSmsTemplates, getSmsLogs } from "@/lib/api";
import { Organization, SmsTemplate, SmsMessageLog } from "@/types";

export default function Dashboard() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [recentLogs, setRecentLogs] = useState<SmsMessageLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [orgsData, templatesData, logsData] = await Promise.all([
        getOrganizations(),
        getSmsTemplates(),
        getSmsLogs({ limit: 10 }),
      ]);
      setOrgs(orgsData);
      setTemplates(templatesData);
      setRecentLogs(logsData);
      setLoading(false);
    }
    loadData();
  }, []);

  const smsEnabledCount = orgs.filter((o) => o.smsEnabled).length;
  const smsReadyCount = orgs.filter((o) => o.smsReady).length;
  const activeTemplatesCount = templates.filter((t) => t.isActive).length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Organizations</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{orgs.length}</p>
          <p className="text-sm text-gray-600 mt-1">
            {smsEnabledCount} SMS enabled, {smsReadyCount} ready
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">SMS Templates</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{templates.length}</p>
          <p className="text-sm text-gray-600 mt-1">{activeTemplatesCount} active</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Recent Messages</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{recentLogs.length}</p>
          <p className="text-sm text-gray-600 mt-1">Last 10 messages</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent SMS Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Org
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {orgs.find((o) => o.id === log.orgId)?.name || log.orgId}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <Link
            href="/logs"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all logs →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Organizations</h2>
            <Link
              href="/orgs"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all →
            </Link>
          </div>
          <div className="px-6 py-4">
            <ul className="space-y-2">
              {orgs.slice(0, 5).map((org) => (
                <li key={org.id} className="flex items-center justify-between">
                  <Link
                    href={`/orgs/${org.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {org.name}
                  </Link>
                  <div className="flex space-x-2">
                    {org.smsEnabled && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Enabled
                      </span>
                    )}
                    {org.smsReady && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        Ready
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Templates</h2>
            <Link
              href="/templates"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all →
            </Link>
          </div>
          <div className="px-6 py-4">
            <ul className="space-y-2">
              {templates.slice(0, 5).map((template) => (
                <li key={template.id} className="flex items-center justify-between">
                  <Link
                    href={`/templates#${template.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {template.name}
                  </Link>
                  <div className="flex space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        template.type === "MARKETING"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {template.type}
                    </span>
                    {!template.isActive && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
