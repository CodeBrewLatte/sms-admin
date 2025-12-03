"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOrganizations, toggleOrgSmsEnabled } from "@/lib/api";
import { Organization } from "@/types";
import ExportButton from "@/components/ExportButton";

type SmsEnabledFilter = "ALL" | "ENABLED" | "DISABLED";
type SmsReadyFilter = "ALL" | "READY" | "NOT_READY";

export default function OrganizationsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [smsEnabledFilter, setSmsEnabledFilter] = useState<SmsEnabledFilter>("ALL");
  const [smsReadyFilter, setSmsReadyFilter] = useState<SmsReadyFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [processingBulk, setProcessingBulk] = useState(false);

  useEffect(() => {
    async function loadOrgs() {
      const data = await getOrganizations();
      setOrgs(data);
      setFilteredOrgs(data);
      setLoading(false);
    }
    loadOrgs();
  }, []);

  useEffect(() => {
    let filtered = [...orgs];

    if (smsEnabledFilter === "ENABLED") {
      filtered = filtered.filter((o) => o.smsEnabled);
    } else if (smsEnabledFilter === "DISABLED") {
      filtered = filtered.filter((o) => !o.smsEnabled);
    }

    if (smsReadyFilter === "READY") {
      filtered = filtered.filter((o) => o.smsReady);
    } else if (smsReadyFilter === "NOT_READY") {
      filtered = filtered.filter((o) => !o.smsReady);
    }

    setFilteredOrgs(filtered);
    setSelectedOrgs(new Set()); // Clear selection when filters change
  }, [orgs, smsEnabledFilter, smsReadyFilter]);

  const toggleSelectAll = () => {
    if (selectedOrgs.size === filteredOrgs.length) {
      setSelectedOrgs(new Set());
    } else {
      setSelectedOrgs(new Set(filteredOrgs.map((o) => o.id)));
    }
  };

  const toggleSelectOrg = (orgId: string) => {
    const newSelected = new Set(selectedOrgs);
    if (newSelected.has(orgId)) {
      newSelected.delete(orgId);
    } else {
      newSelected.add(orgId);
    }
    setSelectedOrgs(newSelected);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrgs.size === 0) return;

    setProcessingBulk(true);

    try {
      if (bulkAction === "enable_sms") {
        for (const orgId of selectedOrgs) {
          await toggleOrgSmsEnabled(orgId, true);
        }
        alert(`SMS enabled for ${selectedOrgs.size} organizations (preview mode)`);
      } else if (bulkAction === "disable_sms") {
        for (const orgId of selectedOrgs) {
          await toggleOrgSmsEnabled(orgId, false);
        }
        alert(`SMS disabled for ${selectedOrgs.size} organizations (preview mode)`);
      }

      // Refresh orgs
      const data = await getOrganizations();
      setOrgs(data);
      setSelectedOrgs(new Set());
      setBulkAction("");
    } catch (error) {
      console.error("Bulk action failed:", error);
      alert("Failed to perform bulk action");
    } finally {
      setProcessingBulk(false);
    }
  };

  const exportColumns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "country", label: "Country" },
    { key: "smsEnabled", label: "SMS Enabled" },
    { key: "smsReady", label: "SMS Ready" },
    { key: "twilioSubaccountSid", label: "Twilio Subaccount" },
    { key: "createdAt", label: "Created" },
    { key: "updatedAt", label: "Updated" },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organizations</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredOrgs.length} of {orgs.length}
          </span>
          <ExportButton
            data={filteredOrgs}
            columns={exportColumns}
            filename={`organizations-${new Date().toISOString().split("T")[0]}`}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SMS Enabled Filter
            </label>
            <select
              value={smsEnabledFilter}
              onChange={(e) => setSmsEnabledFilter(e.target.value as SmsEnabledFilter)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ALL">All</option>
              <option value="ENABLED">Enabled</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SMS Ready Filter
            </label>
            <select
              value={smsReadyFilter}
              onChange={(e) => setSmsReadyFilter(e.target.value as SmsReadyFilter)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ALL">All</option>
              <option value="READY">Ready</option>
              <option value="NOT_READY">Not Ready</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrgs.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-6 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {selectedOrgs.size} organization{selectedOrgs.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center space-x-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1.5 text-sm border border-blue-300 dark:border-blue-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select action...</option>
                <option value="enable_sms">Enable SMS</option>
                <option value="disable_sms">Disable SMS</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || processingBulk}
                className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingBulk ? "Processing..." : "Apply"}
              </button>
              <button
                onClick={() => setSelectedOrgs(new Set())}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800"
              >
                Clear selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Organizations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrgs.size === filteredOrgs.length && filteredOrgs.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  SMS Enabled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  SMS Ready
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Twilio Subaccount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrgs.map((org) => (
                <tr
                  key={org.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    selectedOrgs.has(org.id) ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                  onClick={() => router.push(`/orgs/${org.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedOrgs.has(org.id)}
                      onChange={() => toggleSelectOrg(org.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/orgs/${org.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {org.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {org.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {org.smsEnabled ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {org.smsReady ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Ready
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Not Ready
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {org.twilioSubaccountSid ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(org.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
