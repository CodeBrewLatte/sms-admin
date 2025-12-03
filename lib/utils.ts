// Utility functions

// Sample data for template preview
export const sampleVariables: Record<string, string> = {
  first_name: "John",
  last_name: "Smith",
  equity_change: "$15,000",
  short_link: "https://link.co/abc123",
  property_type: "Condo",
  location: "Downtown",
  amount: "1,250.00",
  due_date: "Dec 15, 2024",
  promotion_details: "20% off closing costs",
  code: "123456",
  newsletter_summary: "Home prices up 5% this month",
  document_type: "Loan Estimate",
};

// Substitute variables in template body
export function substituteVariables(
  body: string,
  variables: Record<string, string> = sampleVariables
): string {
  let result = body;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// Format date for display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Calculate delivery stats
export function calculateDeliveryStats(logs: { status: string }[]) {
  const total = logs.length;
  const delivered = logs.filter((l) => l.status === "DELIVERED").length;
  const failed = logs.filter((l) => l.status === "FAILED").length;
  const sent = logs.filter((l) => l.status === "SENT").length;
  const queued = logs.filter((l) => l.status === "QUEUED").length;
  const received = logs.filter((l) => l.status === "RECEIVED").length;

  return {
    total,
    delivered,
    failed,
    sent,
    queued,
    received,
    deliveryRate: total > 0 ? Math.round((delivered / (total - received)) * 100) : 0,
    failureRate: total > 0 ? Math.round((failed / (total - received)) * 100) : 0,
  };
}

// Generate CSV from data
export function generateCSV(data: Record<string, any>[], columns: { key: string; label: string }[]): string {
  const headers = columns.map((c) => c.label).join(",");
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const value = row[c.key];
        if (value === null || value === undefined) return "";
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(",")
  );
  return [headers, ...rows].join("\n");
}

// Download file
export function downloadFile(content: string, filename: string, type: string = "text/csv") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Calculate health score for an org
export function calculateHealthScore(org: {
  smsEnabled: boolean;
  smsReady: boolean;
  twilioSubaccountSid?: string;
  a2pBrandId?: string;
}, deliveryRate: number, suppressionCount: number): { score: number; label: string; color: string } {
  let score = 0;

  // Provisioning (40 points)
  if (org.smsReady) score += 40;
  else if (org.twilioSubaccountSid) score += 20;

  // Delivery rate (40 points)
  score += Math.round((deliveryRate / 100) * 40);

  // Low suppression bonus (20 points)
  if (suppressionCount === 0) score += 20;
  else if (suppressionCount < 5) score += 15;
  else if (suppressionCount < 10) score += 10;
  else if (suppressionCount < 20) score += 5;

  // SMS enabled required
  if (!org.smsEnabled) score = Math.min(score, 30);

  let label: string;
  let color: string;

  if (score >= 80) {
    label = "Excellent";
    color = "green";
  } else if (score >= 60) {
    label = "Good";
    color = "blue";
  } else if (score >= 40) {
    label = "Fair";
    color = "yellow";
  } else {
    label = "Poor";
    color = "red";
  }

  return { score, label, color };
}

