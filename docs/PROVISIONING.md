# Provisioning System Architecture

## Current State (Preview/Demo)

The current implementation uses **static dummy data**. When you click "Trigger Provisioning", it creates a new provisioning job but the status doesn't automatically update. This is fine for a preview/demo, but not how it would work in production.

## How It Would Work in Production

Provisioning updates would be **fully programmatic** and happen automatically. Here's how:

### 1. **Background Job Processing**

When "Trigger Provisioning" is clicked, it would:

```typescript
// Pseudo-code for real implementation
async function triggerProvisioningForOrg(orgId: string) {
  // 1. Create provisioning job record in database (status: PENDING)
  const job = await createProvisioningJob(orgId);
  
  // 2. Queue background job (using Bull, Celery, Sidekiq, etc.)
  await provisioningQueue.add('provision-org', { 
    orgId, 
    jobId: job.id 
  });
  
  // 3. Return immediately (async processing)
  return job;
}
```

### 2. **Background Worker Updates Status**

A background worker would:

```typescript
// Worker processes steps sequentially
async function processProvisioningJob(jobId: string) {
  const job = await getProvisioningJob(jobId);
  
  // Step 1: Create Twilio subaccount
  await updateStepStatus(jobId, 'Create Twilio subaccount', 'RUNNING');
  const subaccount = await twilioClient.accounts.create({...});
  await updateStepStatus(jobId, 'Create Twilio subaccount', 'COMPLETE', 
    `Subaccount ${subaccount.sid} created`);
  
  // Step 2: Buy numbers
  await updateStepStatus(jobId, 'Buy numbers', 'RUNNING');
  const numbers = await twilioClient.availablePhoneNumbers('US').local.list({...});
  await twilioClient.incomingPhoneNumbers.create({ phoneNumber: numbers[0].phoneNumber });
  await updateStepStatus(jobId, 'Buy numbers', 'COMPLETE', 
    `Purchased ${numbers.length} phone numbers`);
  
  // Continue for remaining steps...
}
```

### 3. **Real-Time Updates via Webhooks or Polling**

There are two approaches:

#### Option A: Webhooks (Recommended)
- Twilio sends webhooks when steps complete
- Your backend receives webhook → updates database → pushes to frontend (via WebSocket/SSE)

```typescript
// Webhook endpoint
app.post('/webhooks/twilio/provisioning', async (req, res) => {
  const { jobId, step, status, message } = req.body;
  await updateProvisioningStep(jobId, step, status, message);
  
  // Push update to frontend via WebSocket
  io.to(`org-${orgId}`).emit('provisioning-update', { step, status });
  
  res.sendStatus(200);
});
```

#### Option B: Polling
- Frontend polls API every few seconds while job is RUNNING
- Backend checks Twilio API status and updates database

```typescript
// Frontend polling (current page)
useEffect(() => {
  if (provisioningJob?.status === 'RUNNING' || provisioningJob?.status === 'PENDING') {
    const interval = setInterval(async () => {
      const updated = await getLatestProvisioningJobForOrg(orgId);
      setProvisioningJob(updated);
      
      // Stop polling if complete or failed
      if (updated.status === 'COMPLETE' || updated.status === 'FAILED') {
        clearInterval(interval);
      }
    }, 3000); // Poll every 3 seconds
    
    return () => clearInterval(interval);
  }
}, [provisioningJob?.status]);
```

### 4. **Database Updates**

Each step completion would update the database:

```sql
UPDATE provisioning_jobs 
SET 
  status = 'RUNNING',
  steps = jsonb_set(steps, '{1,status}', '"COMPLETE"'),
  steps = jsonb_set(steps, '{1,message}', '"Subaccount created"'),
  updated_at = NOW()
WHERE id = $1;
```

## Implementation Options for This App

Since this is a preview app without a real backend, we could:

### Option 1: Simulate Updates (Simple)
- Add polling that simulates step progression
- Steps advance automatically every few seconds
- Good for demo purposes

### Option 2: Add Real-Time Simulation (Better Demo)
- Use WebSockets or Server-Sent Events
- Simulate realistic timing (some steps take longer)
- Show progress bars

### Option 3: Keep Static (Current)
- Acknowledge it's preview-only
- Document how it would work in production

## Recommended Approach

For a **real production system**, use:
1. **Background job queue** (BullMQ, Celery, etc.) to process steps
2. **Webhooks from Twilio** to get real-time updates
3. **WebSocket/SSE** to push updates to frontend
4. **Database** to persist all status changes

For this **preview app**, we could add:
- Auto-polling that simulates step progression
- Realistic delays between steps
- Better visual feedback

Would you like me to implement simulated auto-updates for the provisioning jobs?

