import {
  Organization,
  SmsTemplate,
  OrgSmsTemplateOverride,
  SmsJob,
  SmsMessageLog,
  SmsSuppression,
  ProvisioningJob,
} from "@/types";
import {
  dummyOrganizations,
  dummySmsTemplates,
  dummyOrgOverrides,
  dummySmsJobs,
  dummySmsLogs,
  dummySuppressions,
  dummyProvisioningJobs,
} from "@/data/dummyData";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Organizations API
export async function getOrganizations(): Promise<Organization[]> {
  await delay(300);
  return [...dummyOrganizations];
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  await delay(200);
  return dummyOrganizations.find((org) => org.id === id) || null;
}

export async function toggleOrgSmsEnabled(
  orgId: string,
  enabled: boolean
): Promise<Organization> {
  await delay(400);
  const org = dummyOrganizations.find((o) => o.id === orgId);
  if (!org) throw new Error("Organization not found");
  org.smsEnabled = enabled;
  org.updatedAt = new Date().toISOString();
  return org;
}

// SMS Templates API
export async function getSmsTemplates(): Promise<SmsTemplate[]> {
  await delay(250);
  return [...dummySmsTemplates];
}

export async function getSmsTemplateById(id: string): Promise<SmsTemplate | null> {
  await delay(200);
  return dummySmsTemplates.find((tpl) => tpl.id === id) || null;
}

// Org Template Overrides API
export async function getOrgOverrides(orgId: string): Promise<OrgSmsTemplateOverride[]> {
  await delay(200);
  return dummyOrgOverrides.filter((override) => override.orgId === orgId);
}

export async function getOrgOverrideByTemplate(
  orgId: string,
  templateId: string
): Promise<OrgSmsTemplateOverride | null> {
  await delay(200);
  return (
    dummyOrgOverrides.find(
      (override) => override.orgId === orgId && override.smsTemplateId === templateId
    ) || null
  );
}

export async function createOrgOverride(
  override: Omit<OrgSmsTemplateOverride, "id" | "createdAt" | "updatedAt">
): Promise<OrgSmsTemplateOverride> {
  await delay(400);
  const newOverride: OrgSmsTemplateOverride = {
    ...override,
    id: `override-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  dummyOrgOverrides.push(newOverride);
  return newOverride;
}

export async function updateOrgOverride(
  id: string,
  updates: Partial<OrgSmsTemplateOverride>
): Promise<OrgSmsTemplateOverride> {
  await delay(400);
  const index = dummyOrgOverrides.findIndex((o) => o.id === id);
  if (index === -1) throw new Error("Override not found");
  dummyOrgOverrides[index] = {
    ...dummyOrgOverrides[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return dummyOrgOverrides[index];
}

export async function deleteOrgOverride(id: string): Promise<void> {
  await delay(300);
  const index = dummyOrgOverrides.findIndex((o) => o.id === id);
  if (index !== -1) {
    dummyOrgOverrides.splice(index, 1);
  }
}

// SMS Jobs API
export async function getSmsJobsByOrg(orgId: string): Promise<SmsJob[]> {
  await delay(250);
  return dummySmsJobs.filter((job) => job.orgId === orgId);
}

export async function getAllSmsJobs(): Promise<SmsJob[]> {
  await delay(300);
  return [...dummySmsJobs];
}

// SMS Logs API
export interface SmsLogFilters {
  orgId?: string;
  direction?: "OUTBOUND" | "INBOUND";
  status?: string;
  templateId?: string;
  limit?: number;
}

export async function getSmsLogs(filters: SmsLogFilters = {}): Promise<SmsMessageLog[]> {
  await delay(300);
  let logs = [...dummySmsLogs];

  if (filters.orgId) {
    logs = logs.filter((log) => log.orgId === filters.orgId);
  }
  if (filters.direction) {
    logs = logs.filter((log) => log.direction === filters.direction);
  }
  if (filters.status) {
    logs = logs.filter((log) => log.status === filters.status);
  }
  if (filters.templateId) {
    logs = logs.filter((log) => log.smsTemplateId === filters.templateId);
  }

  // Sort by createdAt descending
  logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (filters.limit) {
    logs = logs.slice(0, filters.limit);
  }

  return logs;
}

// Suppressions API
export async function getSuppressionsByOrg(orgId: string): Promise<SmsSuppression[]> {
  await delay(200);
  return dummySuppressions.filter((sup) => sup.orgId === orgId);
}

export async function getAllSuppressions(): Promise<SmsSuppression[]> {
  await delay(250);
  return [...dummySuppressions];
}

// Provisioning Jobs API
export async function getProvisioningJobs(orgId?: string): Promise<ProvisioningJob[]> {
  await delay(250);
  let jobs = [...dummyProvisioningJobs];
  if (orgId) {
    jobs = jobs.filter((job) => job.orgId === orgId);
  }
  // Sort by createdAt descending
  jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return jobs;
}

export async function getLatestProvisioningJobForOrg(
  orgId: string
): Promise<ProvisioningJob | null> {
  await delay(200);
  const jobs = await getProvisioningJobs(orgId);
  return jobs.length > 0 ? jobs[0] : null;
}

export async function triggerProvisioningForOrg(orgId: string): Promise<ProvisioningJob> {
  await delay(500);
  const newJob: ProvisioningJob = {
    id: `prov-${Date.now()}`,
    orgId,
    status: "PENDING",
    steps: [
      { name: "Create Twilio subaccount", status: "PENDING" },
      { name: "Buy numbers", status: "PENDING" },
      { name: "Create messaging services", status: "PENDING" },
      { name: "Register A2P brand", status: "PENDING" },
      { name: "Register A2P campaigns", status: "PENDING" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  dummyProvisioningJobs.unshift(newJob);
  return newJob;
}

