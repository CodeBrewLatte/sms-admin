// Quiet Hours Configuration

export interface QuietHoursConfig {
  id: string;
  orgId: string;
  enabled: boolean;
  startTime: string; // "21:00" format
  endTime: string; // "09:00" format
  timezone: string;
  daysOfWeek: number[]; // 0 = Sunday, 6 = Saturday
  applyToMarketing: boolean;
  applyToTransactional: boolean;
  createdAt: string;
  updatedAt: string;
}

const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Dummy quiet hours configs
export const quietHoursConfigs: QuietHoursConfig[] = [
  {
    id: "qh-1",
    orgId: "org-1",
    enabled: true,
    startTime: "21:00",
    endTime: "09:00",
    timezone: "America/New_York",
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    applyToMarketing: true,
    applyToTransactional: false,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "qh-2",
    orgId: "org-4",
    enabled: true,
    startTime: "20:00",
    endTime: "08:00",
    timezone: "America/Los_Angeles",
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    applyToMarketing: true,
    applyToTransactional: true,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(10),
  },
  {
    id: "qh-3",
    orgId: "org-10",
    enabled: false,
    startTime: "22:00",
    endTime: "07:00",
    timezone: "America/Chicago",
    daysOfWeek: [0, 6], // Weekends only
    applyToMarketing: true,
    applyToTransactional: false,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
  },
];

// Get quiet hours for org
export function getQuietHoursForOrg(orgId: string): QuietHoursConfig | null {
  return quietHoursConfigs.find((qh) => qh.orgId === orgId) || null;
}

// Update quiet hours
export function updateQuietHours(
  orgId: string,
  config: Partial<QuietHoursConfig>
): QuietHoursConfig {
  const existing = quietHoursConfigs.find((qh) => qh.orgId === orgId);
  if (existing) {
    Object.assign(existing, config, { updatedAt: new Date().toISOString() });
    return existing;
  } else {
    const newConfig: QuietHoursConfig = {
      id: `qh-${Date.now()}`,
      orgId,
      enabled: false,
      startTime: "21:00",
      endTime: "09:00",
      timezone: "America/New_York",
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      applyToMarketing: true,
      applyToTransactional: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...config,
    };
    quietHoursConfigs.push(newConfig);
    return newConfig;
  }
}

// Available timezones
export const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona (AZ)" },
  { value: "Pacific/Honolulu", label: "Hawaii (HT)" },
  { value: "America/Anchorage", label: "Alaska (AKT)" },
];

