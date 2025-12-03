"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getOrganizationById,
  getSmsTemplateById,
  getOrgOverrideByTemplate,
  createOrgOverride,
  updateOrgOverride,
  deleteOrgOverride,
} from "@/lib/api";
import { Organization, SmsTemplate, OrgSmsTemplateOverride } from "@/types";

export default function TemplateOverridePage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  const templateId = params.templateId as string;

  const [org, setOrg] = useState<Organization | null>(null);
  const [template, setTemplate] = useState<SmsTemplate | null>(null);
  const [override, setOverride] = useState<OrgSmsTemplateOverride | null>(null);
  const [overrideBody, setOverrideBody] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [orgData, templateData, overrideData] = await Promise.all([
        getOrganizationById(orgId),
        getSmsTemplateById(templateId),
        getOrgOverrideByTemplate(orgId, templateId),
      ]);

      setOrg(orgData);
      setTemplate(templateData);
      setOverride(overrideData);
      if (overrideData) {
        setOverrideBody(overrideData.overrideBody);
        setIsActive(overrideData.isActive);
      } else if (templateData) {
        setOverrideBody(templateData.defaultBody);
      }
      setLoading(false);
    }
    loadData();
  }, [orgId, templateId]);

  const handleSave = async () => {
    if (!template) return;
    setSaving(true);
    try {
      if (override) {
        await updateOrgOverride(override.id, {
          overrideBody,
          isActive,
        });
      } else {
        await createOrgOverride({
          orgId,
          smsTemplateId: templateId,
          overrideBody,
          isActive,
        });
      }
      router.push(`/orgs/${orgId}`);
    } catch (error) {
      console.error("Failed to save override:", error);
      alert("Failed to save override");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!override) return;
    if (!confirm("Are you sure you want to delete this override?")) return;
    setDeleting(true);
    try {
      await deleteOrgOverride(override.id);
      router.push(`/orgs/${orgId}`);
    } catch (error) {
      console.error("Failed to delete override:", error);
      alert("Failed to delete override");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!org || !template) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">Organization or template not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href={`/orgs/${orgId}`}
          className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
        >
          ← Back to {org.name}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Template Override: {template.name}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Organization: {org.name} | Template Key: {template.key}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Template</h2>
        <div className="bg-gray-50 rounded-md p-4 mb-4">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{template.defaultBody}</p>
        </div>
        <div className="text-sm text-gray-600">
          <p>
            <strong>Variables:</strong> {template.variables.join(", ")}
          </p>
          <p className="mt-1">
            <strong>Type:</strong>{" "}
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                template.type === "MARKETING"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {template.type}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Override Configuration</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Override Body
          </label>
          <textarea
            value={overrideBody}
            onChange={(e) => setOverrideBody(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter custom message body..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Available variables: {template.variables.join(", ")}
          </p>
        </div>

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Override is active</span>
          </label>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : override ? "Update Override" : "Create Override"}
          </button>
          {override && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? "Deleting..." : "Delete Override"}
            </button>
          )}
          <Link
            href={`/orgs/${orgId}`}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

