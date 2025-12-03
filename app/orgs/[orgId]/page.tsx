"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getOrganizationById,
  toggleOrgSmsEnabled,
  getSmsTemplates,
  getOrgOverrides,
  getSmsLogs,
  getSuppressionsByOrg,
  getLatestProvisioningJobForOrg,
  triggerProvisioningForOrg,
} from "@/lib/api";
import {
  Organization,
  SmsTemplate,
  OrgSmsTemplateOverride,
  SmsMessageLog,
  SmsSuppression,
  ProvisioningJob,
} from "@/types";

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;

  const [org, setOrg] = useState<Organization | null>(null);
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [overrides, setOverrides] = useState<OrgSmsTemplateOverride[]>([]);
  const [recentLogs, setRecentLogs] = useState<SmsMessageLog[]>([]);
  const [suppressions, setSuppressions] = useState<SmsSuppression[]>([]);
  const [provisioningJob, setProvisioningJob] = useState<ProvisioningJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingSms, setTogglingSms] = useState(false);
  const [triggeringProvisioning, setTriggeringProvisioning] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [
        orgData,
        templatesData,
        overridesData,
        logsData,
        suppressionsData,
        provisioningData,
      ] = await Promise.all([
        getOrganizationById(orgId),
        getSmsTemplates(),
        getOrgOverrides(orgId),
        getSmsLogs({ orgId, limit: 10 }),
        getSuppressionsByOrg(orgId),
        getLatestProvisioningJobForOrg(orgId),
      ]);

      setOrg(orgData);
      setTemplates(templatesData);
      setOverrides(overridesData);
      setRecentLogs(logsData);
      setSuppressions(suppressionsData);
      setProvisioningJob(provisioningData);
      setLoading(false);
    }
    loadData();
  }, [orgId]);

  const handleToggleSms = async () => {
    if (!org) return;
    setTogglingSms(true);
    try {
      const updated = await toggleOrgSmsEnabled(orgId, !org.smsEnabled);
      setOrg(updated);
    } catch (error) {
      console.error("Failed to toggle SMS:", error);
    } finally {
      setTogglingSms(false);
    }
  };

  const handleTriggerProvisioning = async () => {
    setTriggeringProvisioning(true);
    try {
      const newJob = await triggerProvisioningForOrg(orgId);
      setProvisioningJob(newJob);
    } catch (error) {
      console.error("Failed to trigger provisioning:", error);
    } finally {
      setTriggeringProvisioning(false);
    }
  };

  const getEffectiveBody = (template: SmsTemplate): string => {
    const override = overrides.find((o) => o.smsTemplateId === template.id && o.isActive);
    return override ? override.overrideBody : template.defaultBody;
  };

  const getTemplateName = (templateId?: string): string => {
    if (!templateId) return "N/A";
    const template = templates.find((t) => t.id === templateId);
    return template?.name || templateId;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">Organization not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/orgs"
          className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
        >
          ← Back to Organizations
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{org.name}</h1>
      </div>

      {/* Org Summary */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Organization Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-medium text-gray-900">{org.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Country</p>
            <p className="text-lg font-medium text-gray-900">{org.country}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">SMS Enabled</p>
            <div className="flex items-center space-x-3 mt-1">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  org.smsEnabled
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {org.smsEnabled ? "Enabled" : "Disabled"}
              </span>
              <button
                onClick={handleToggleSms}
                disabled={togglingSms}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {togglingSms ? "Updating..." : org.smsEnabled ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">SMS Ready</p>
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mt-1 ${
                org.smsReady
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {org.smsReady ? "Ready" : "Not Ready"}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Twilio Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Subaccount SID</p>
              <p className="text-sm font-mono text-gray-900">
                {org.twilioSubaccountSid || "Not configured"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Marketing Messaging Service</p>
              <p className="text-sm font-mono text-gray-900">
                {org.marketingMessagingServiceSid || "Not configured"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Transactional Messaging Service</p>
              <p className="text-sm font-mono text-gray-900">
                {org.transactionalMessagingServiceSid || "Not configured"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">A2P Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Brand ID</p>
              <p className="text-sm font-mono text-gray-900">
                {org.a2pBrandId || "Not registered"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Campaign IDs</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {org.a2pCampaignIds && org.a2pCampaignIds.length > 0 ? (
                  org.a2pCampaignIds.map((id) => (
                    <span key={id} className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {id}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provisioning Panel */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Provisioning Status</h2>
          <button
            onClick={handleTriggerProvisioning}
            disabled={triggeringProvisioning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {triggeringProvisioning ? "Triggering..." : "Trigger Provisioning"}
          </button>
        </div>

        {provisioningJob ? (
          <div>
            <div className="mb-4">
              <span
                className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                  provisioningJob.status === "COMPLETE"
                    ? "bg-green-100 text-green-800"
                    : provisioningJob.status === "FAILED"
                    ? "bg-red-100 text-red-800"
                    : provisioningJob.status === "RUNNING"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {provisioningJob.status}
              </span>
              {provisioningJob.errorMessage && (
                <p className="mt-2 text-sm text-red-600">{provisioningJob.errorMessage}</p>
              )}
            </div>
            <div className="space-y-2">
              {provisioningJob.steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span
                    className={`w-24 px-2 py-1 text-xs font-semibold rounded ${
                      step.status === "COMPLETE"
                        ? "bg-green-100 text-green-800"
                        : step.status === "FAILED"
                        ? "bg-red-100 text-red-800"
                        : step.status === "RUNNING"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {step.status}
                  </span>
                  <span className="text-sm text-gray-900">{step.name}</span>
                  {step.message && (
                    <span className="text-sm text-gray-500">- {step.message}</span>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Created: {new Date(provisioningJob.createdAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">No provisioning job found for this organization.</p>
        )}
      </div>

      {/* Templates for This Org */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Templates for This Org</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Override
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effective Body Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((template) => {
                const hasOverride = overrides.some(
                  (o) => o.smsTemplateId === template.id && o.isActive
                );
                const effectiveBody = getEffectiveBody(template);
                return (
                  <tr key={template.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {template.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          template.type === "MARKETING"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {template.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasOverride ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Yes
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-md truncate">{effectiveBody}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/orgs/${orgId}/templates/${template.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit Override
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent SMS Activity */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent SMS Activity</h2>
          <Link
            href={`/logs?orgId=${orgId}`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View full logs →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentLogs.map((log) => (
                <tr key={log.id}>
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
                      <div className="text-xs text-red-600 mt-1">{log.failureReason}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getTemplateName(log.smsTemplateId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suppressions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Suppressions</h2>
        {suppressions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scope
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suppressions.map((sup) => (
                  <tr key={sup.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sup.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {sup.suppressionScope}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sup.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sup.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sup.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No suppressions for this organization.</p>
        )}
      </div>
    </div>
  );
}

