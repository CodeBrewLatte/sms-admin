// Audit Log Data Store

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "TRIGGER" | "TOGGLE";
  entityType: "TEMPLATE" | "OVERRIDE" | "ORG" | "PROVISIONING" | "SUPPRESSION";
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  details: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const hoursAgo = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

// Dummy audit log entries
export const auditLog: AuditLogEntry[] = [
  {
    id: "audit-1",
    timestamp: hoursAgo(1),
    action: "UPDATE",
    entityType: "TEMPLATE",
    entityId: "tpl-1",
    entityName: "Home Equity Change Alert",
    userId: "admin-1",
    userName: "Sarah Admin",
    details: "Updated template body",
    changes: [
      {
        field: "defaultBody",
        oldValue: "Hi {{first_name}}, your equity changed...",
        newValue: "Hello {{first_name}}, your home equity changed by {{equity_change}}...",
      },
    ],
  },
  {
    id: "audit-2",
    timestamp: hoursAgo(3),
    action: "CREATE",
    entityType: "OVERRIDE",
    entityId: "override-5",
    entityName: "Acme Realty - Payment Reminder",
    userId: "admin-2",
    userName: "Mike Support",
    details: "Created template override for Acme Realty Group",
  },
  {
    id: "audit-3",
    timestamp: hoursAgo(5),
    action: "TOGGLE",
    entityType: "ORG",
    entityId: "org-3",
    entityName: "Metro Property Management",
    userId: "admin-1",
    userName: "Sarah Admin",
    details: "Disabled SMS for organization",
    changes: [
      {
        field: "smsEnabled",
        oldValue: "true",
        newValue: "false",
      },
    ],
  },
  {
    id: "audit-4",
    timestamp: hoursAgo(12),
    action: "TRIGGER",
    entityType: "PROVISIONING",
    entityId: "prov-1",
    entityName: "Pacific Home Loans",
    userId: "admin-2",
    userName: "Mike Support",
    details: "Triggered provisioning job",
  },
  {
    id: "audit-5",
    timestamp: daysAgo(1),
    action: "UPDATE",
    entityType: "TEMPLATE",
    entityId: "tpl-4",
    entityName: "Special Promotion",
    userId: "admin-1",
    userName: "Sarah Admin",
    details: "Added new variable",
    changes: [
      {
        field: "variables",
        oldValue: "first_name, promotion_details",
        newValue: "first_name, promotion_details, short_link",
      },
    ],
  },
  {
    id: "audit-6",
    timestamp: daysAgo(2),
    action: "DELETE",
    entityType: "OVERRIDE",
    entityId: "override-old",
    entityName: "Sunset Mortgage - Old Template",
    userId: "admin-1",
    userName: "Sarah Admin",
    details: "Deleted obsolete template override",
  },
  {
    id: "audit-7",
    timestamp: daysAgo(3),
    action: "CREATE",
    entityType: "SUPPRESSION",
    entityId: "sup-6",
    entityName: "+1 (555) 123-4567",
    userId: "admin-2",
    userName: "Mike Support",
    details: "Manually added suppression for bounced number",
  },
  {
    id: "audit-8",
    timestamp: daysAgo(5),
    action: "TOGGLE",
    entityType: "ORG",
    entityId: "org-1",
    entityName: "Acme Realty Group",
    userId: "admin-1",
    userName: "Sarah Admin",
    details: "Enabled SMS for organization",
    changes: [
      {
        field: "smsEnabled",
        oldValue: "false",
        newValue: "true",
      },
    ],
  },
];

// Add new audit log entry
export function addAuditLogEntry(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  auditLog.unshift(newEntry);
  return newEntry;
}

