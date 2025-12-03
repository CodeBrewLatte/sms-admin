// Template Version History

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  name: string;
  key: string;
  type: "MARKETING" | "TRANSACTIONAL";
  defaultBody: string;
  description?: string;
  variables: string[];
  isActive: boolean;
  changedBy: string;
  changedByName: string;
  changeNote?: string;
  createdAt: string;
}

const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Dummy version history for templates
export const templateVersions: TemplateVersion[] = [
  // EQUITY_ALERT versions
  {
    id: "ver-1-3",
    templateId: "tpl-1",
    version: 3,
    name: "Home Equity Change Alert",
    key: "EQUITY_ALERT",
    type: "TRANSACTIONAL",
    defaultBody: "Hi {{first_name}}, your equity changed by {{equity_change}}. View: {{short_link}} Reply STOP to opt out.",
    description: "Sent when homeowner equity changes significantly",
    variables: ["first_name", "equity_change", "short_link"],
    isActive: true,
    changedBy: "admin-1",
    changedByName: "Sarah Admin",
    changeNote: "Updated wording for clarity",
    createdAt: daysAgo(10),
  },
  {
    id: "ver-1-2",
    templateId: "tpl-1",
    version: 2,
    name: "Home Equity Change Alert",
    key: "EQUITY_ALERT",
    type: "TRANSACTIONAL",
    defaultBody: "Hello {{first_name}}, your home equity has changed by {{equity_change}}. Check details: {{short_link}} Text STOP to unsubscribe.",
    description: "Sent when homeowner equity changes significantly",
    variables: ["first_name", "equity_change", "short_link"],
    isActive: true,
    changedBy: "admin-2",
    changedByName: "Mike Support",
    changeNote: "Made greeting more formal",
    createdAt: daysAgo(45),
  },
  {
    id: "ver-1-1",
    templateId: "tpl-1",
    version: 1,
    name: "Equity Alert",
    key: "EQUITY_ALERT",
    type: "TRANSACTIONAL",
    defaultBody: "{{first_name}}, your equity changed: {{equity_change}}. Details: {{short_link}} STOP to opt out.",
    description: "Initial version",
    variables: ["first_name", "equity_change", "short_link"],
    isActive: true,
    changedBy: "admin-1",
    changedByName: "Sarah Admin",
    createdAt: daysAgo(200),
  },
  // MARKETING_NEW_LISTING versions
  {
    id: "ver-2-2",
    templateId: "tpl-2",
    version: 2,
    name: "New Property Listing",
    key: "MARKETING_NEW_LISTING",
    type: "MARKETING",
    defaultBody: "{{first_name}}, check out this new {{property_type}} in {{location}}: {{short_link}} Reply STOP to unsubscribe.",
    description: "Marketing message for new property listings",
    variables: ["first_name", "property_type", "location", "short_link"],
    isActive: true,
    changedBy: "admin-1",
    changedByName: "Sarah Admin",
    changeNote: "Added location variable",
    createdAt: daysAgo(5),
  },
  {
    id: "ver-2-1",
    templateId: "tpl-2",
    version: 1,
    name: "New Property Listing",
    key: "MARKETING_NEW_LISTING",
    type: "MARKETING",
    defaultBody: "{{first_name}}, we have a new {{property_type}} for you! View: {{short_link}} STOP to unsubscribe.",
    description: "Marketing message for new property listings",
    variables: ["first_name", "property_type", "short_link"],
    isActive: true,
    changedBy: "admin-2",
    changedByName: "Mike Support",
    createdAt: daysAgo(180),
  },
  // PAYMENT_REMINDER versions
  {
    id: "ver-3-2",
    templateId: "tpl-3",
    version: 2,
    name: "Payment Reminder",
    key: "PAYMENT_REMINDER",
    type: "TRANSACTIONAL",
    defaultBody: "{{first_name}}, your payment of ${{amount}} is due on {{due_date}}. Pay now: {{short_link}}",
    description: "Reminder for upcoming payments",
    variables: ["first_name", "amount", "due_date", "short_link"],
    isActive: true,
    changedBy: "admin-1",
    changedByName: "Sarah Admin",
    changeNote: "Added dollar sign to amount",
    createdAt: daysAgo(20),
  },
  {
    id: "ver-3-1",
    templateId: "tpl-3",
    version: 1,
    name: "Payment Reminder",
    key: "PAYMENT_REMINDER",
    type: "TRANSACTIONAL",
    defaultBody: "{{first_name}}, payment of {{amount}} due {{due_date}}. Pay: {{short_link}}",
    description: "Initial version",
    variables: ["first_name", "amount", "due_date", "short_link"],
    isActive: true,
    changedBy: "admin-2",
    changedByName: "Mike Support",
    createdAt: daysAgo(150),
  },
];

// Get versions for a template
export function getTemplateVersions(templateId: string): TemplateVersion[] {
  return templateVersions
    .filter((v) => v.templateId === templateId)
    .sort((a, b) => b.version - a.version);
}

// Add new version
export function addTemplateVersion(version: Omit<TemplateVersion, "id" | "createdAt">): TemplateVersion {
  const newVersion: TemplateVersion = {
    ...version,
    id: `ver-${version.templateId}-${version.version}`,
    createdAt: new Date().toISOString(),
  };
  templateVersions.unshift(newVersion);
  return newVersion;
}

