"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrganizations } from "@/lib/api";
import { Organization } from "@/types";

type SmsEnabledFilter = "ALL" | "ENABLED" | "DISABLED";
type SmsReadyFilter = "ALL" | "READY" | "NOT_READY";

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [smsEnabledFilter, setSmsEnabledFilter] = useState<SmsEnabledFilter>("ALL");
  const [smsReadyFilter, setSmsReadyFilter] = useState<SmsReadyFilter>("ALL");
  const [loading, setLoading] = useState(true);

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
  }, [orgs, smsEnabledFilter, smsReadyFilter]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
        <div className="text-sm text-gray-600">
          Showing {filteredOrgs.length} of {orgs.length} organizations
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMS Enabled Filter
            </label>
            <select
              value={smsEnabledFilter}
              onChange={(e) => setSmsEnabledFilter(e.target.value as SmsEnabledFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All</option>
              <option value="ENABLED">Enabled</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMS Ready Filter
            </label>
            <select
              value={smsReadyFilter}
              onChange={(e) => setSmsReadyFilter(e.target.value as SmsReadyFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All</option>
              <option value="READY">Ready</option>
              <option value="NOT_READY">Not Ready</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SMS Enabled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SMS Ready
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Twilio Subaccount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrgs.map((org) => (
                <tr
                  key={org.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => (window.location.href = `/orgs/${org.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/orgs/${org.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {org.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {org.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {org.smsEnabled ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {org.smsReady ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Ready
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Not Ready
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {org.twilioSubaccountSid ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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

