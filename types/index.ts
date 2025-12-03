// Data model types

export interface Organization {
  id: string;
  name: string;
  smsEnabled: boolean;
  smsReady: boolean;
  twilioSubaccountSid?: string;
  marketingMessagingServiceSid?: string;
  transactionalMessagingServiceSid?: string;
  a2pBrandId?: string;
  a2pCampaignIds?: string[];
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface SmsTemplate {
  id: string;
  key: string;
  name: string;
  type: "MARKETING" | "TRANSACTIONAL";
  defaultBody: string;
  description?: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrgSmsTemplateOverride {
  id: string;
  orgId: string;
  smsTemplateId: string;
  overrideBody: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SmsJob {
  id: string;
  orgId: string;
  smsTemplateId: string;
  status: "PENDING" | "RUNNING" | "COMPLETE" | "FAILED";
  sendType: "IMMEDIATE" | "SCHEDULED";
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  meta?: { [key: string]: any };
}

export interface SmsMessageLog {
  id: string;
  orgId: string;
  userId?: string;
  direction: "OUTBOUND" | "INBOUND";
  phoneNumber: string;
  body: string;
  smsTemplateId?: string;
  smsJobId?: string;
  twilioMessageSid?: string;
  status: "QUEUED" | "SENT" | "DELIVERED" | "FAILED" | "RECEIVED";
  failureReason?: string;
  numSegments?: number;
  clicked?: boolean;
  clickedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SmsSuppression {
  id: string;
  orgId: string;
  phoneNumber: string;
  suppressionScope: "ORG" | "GLOBAL" | "NUMBER";
  reason: "STOP" | "BOUNCE" | "MANUAL" | "OTHER";
  source: "INBOUND_SMS" | "ADMIN" | "IMPORT";
  createdAt: string;
  updatedAt: string;
}

export interface ProvisioningStep {
  name: string;
  status: "PENDING" | "RUNNING" | "COMPLETE" | "FAILED";
  message?: string;
}

export interface ProvisioningJob {
  id: string;
  orgId: string;
  status: "PENDING" | "RUNNING" | "COMPLETE" | "FAILED";
  steps: ProvisioningStep[];
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

