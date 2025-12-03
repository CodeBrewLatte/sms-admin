# Knowledge Download on SMS

## Where we fit

SMS is split into 2 areas P2P (Person 2 Person) and A2P (Application to Person). We are Application to person since we're a business and for us this means HEAVY regulations (hooray!).

We have several types of numbers available for texting but not all make sense for us to use.

| Type | Description |
|------|-------------|
| **10DLC (A2P long codes)** | Standard phone numbers (e.g., 555-555-5555). Best for high volume, requires brand/campaign registration. |
| **Shortcodes** | 5-6 digit numbers (e.g., 12345). Expensive, high volume only. |
| **Toll-free numbers** | 800-style numbers. Good for customer service, limited for marketing. |

When we text we can have a max of 160 GSM Characters. If we go over we break this and it will send as another text which is annoying and also more expensive.

## Regulations

While CAN-SPAM for email marketing in the US is a little more lax in terms of what they consider subscribing to marketing emails, SMS is not.

### Opt-in
- Clear consent for the type of messaging (marketing vs transactional)
- Capture how/when they opted in (web form, checkbox, keyword, etc.)

### Opt-out
- Must support STOP, UNSUBSCRIBE, CANCEL, etc.
- Must actually honor STOP at the **number level** and in your own DB
- **For us: Opt-out is at the ORG level** - if a homeowner opts out from one Zillow agent, ALL Zillow agents are blocked from texting that homeowner

### Message content
- Include brand identity
- For marketing: be explicit enough people recognize why they're being contacted

### Quiet hours / frequency
- Not strictly law everywhere, but good practice and sometimes required by carriers/CTIA guidelines (e.g., avoid blasting at 2am local time).

## Option 1 — Templates Only in Admin (Recommended)

### Flow:

**Admin DB holds:**
- Template name (e.g., EQUITY_ALERT)
- Template body with variables:
  - `"Hey {{first_name}}, your home value changed by {{equity_change}}. Check details: {{short_link}}"`
- Per-org overrides if needed

**When it's time to send:**
1. Admin picks the correct org + template
2. Fills variables
3. Sends to Twilio via the API from the correct subaccount / Messaging Service SID

**If you want to change copy:**
- Change it once in Admin
- Done. Next send uses the new copy automatically.
- No need to sync anything across Twilio.

### Pros
- One source of truth
- No sync tooling
- Works across 100+ orgs
- Same admin UI you already use for email strategy

## Onboarding Users

### Overview

When a new client (e.g., Zillow) signs up for SMS, we need to provision their Twilio infrastructure. This is a **one-time setup process** that happens before they can send any SMS messages.

### The Provisioning Process

**Step 1: Create Twilio Subaccount**
- Each client gets their own Twilio subaccount
- Isolates billing, usage tracking, and configuration
- Provides separate API credentials per client
- **Why:** Billing isolation, security, and compliance (each org has their own account)

**Step 2: Purchase Phone Numbers**
- Buy 10DLC phone numbers from Twilio
- Typically 1-5 numbers per client (depends on volume)
- Numbers are **shared across all users within that org**
- Example: Zillow gets `555-555-5555`, ALL Zillow agents send from this number
- **Why shared numbers:** 
  - Cost efficiency (don't need 1000s of numbers)
  - Opt-out management (one number = one suppression list)
  - Brand consistency (all Zillow messages come from same number)

**Step 3: Create Messaging Services**
- Create **Marketing Messaging Service** (for promotional messages)
- Create **Transactional Messaging Service** (for alerts, notifications)
- Each service has its own SID
- **Why separate:** Different compliance rules, different opt-out handling

**Step 4: Register A2P Brand**
- Register the client's brand with The Campaign Registry (TCR)
- Required for sending marketing SMS in the US
- Includes company info, website, use case description
- **Timeline:** Can take 1-2 weeks for approval
- **Why:** Carrier requirement for A2P messaging

**Step 5: Register A2P Campaigns**
- Register specific use cases (e.g., "Equity Alerts", "Property Updates")
- Each campaign links to a template in our system
- **Timeline:** Usually approved within 24-48 hours after brand approval
- **Why:** Carriers need to know what types of messages you're sending

### Opt-Out Architecture (Critical for B2B2C)

**How it works:**
1. **Shared Number = Shared Suppression List**
   - All Zillow agents send from `555-555-5555`
   - If homeowner `123-456-7890` texts "STOP" to any Zillow agent
   - That number is suppressed **at the org level** in our DB
   - ALL future Zillow agents are blocked from texting `123-456-7890`

2. **Suppression Storage:**
   - We maintain suppression list in our Admin DB
   - Key fields: `orgId`, `phoneNumber`, `suppressionScope` (ORG level)
   - Before sending ANY SMS, we check: "Is this number suppressed for this org?"
   - If yes → skip send, log suppression reason

3. **Twilio-Level Suppression:**
   - Twilio also maintains its own suppression list per Messaging Service
   - We sync our suppressions to Twilio (webhook on inbound STOP)
   - Twilio will automatically reject sends to suppressed numbers
   - **Double protection:** Our DB check + Twilio's check

4. **Why Org-Level (Not Agent-Level):**
   - **Compliance:** If someone opts out from Zillow, they opted out from Zillow (the brand), not just one agent
   - **User expectation:** Homeowner sees "Zillow" as the sender, not "Agent John"
   - **Legal safety:** Better to be conservative with opt-outs
   - **Operational:** Easier to manage one suppression list per org

### Onboarding Checklist

**Before client can send SMS:**
- [ ] Twilio subaccount created
- [ ] Phone numbers purchased
- [ ] Marketing messaging service created
- [ ] Transactional messaging service created
- [ ] A2P brand registered and approved
- [ ] A2P campaigns registered and approved
- [ ] Suppression sync configured
- [ ] Quiet hours configured (if needed)
- [ ] Templates assigned/overridden

**Timeline:**
- Steps 1-3: **Same day** (automated)
- Step 4 (Brand): **1-2 weeks** (TCR approval)
- Step 5 (Campaigns): **24-48 hours** (after brand approval)
- **Total:** ~2-3 weeks from signup to first send

### Ongoing Management

**Per-Org Configuration:**
- Quiet hours (when SMS can be sent)
- Template overrides (custom copy per org)
- Suppression management (view/manage opt-outs)
- Delivery monitoring (success rates, failures)

**Multi-Tenant Considerations:**
- Each org is completely isolated (separate Twilio subaccount)
- No cross-org data leakage
- Each org has their own phone numbers
- Suppressions are org-scoped
- Billing is per-org

### Example: Zillow Onboarding

1. **Day 1:** Zillow signs up for SMS
   - We create Twilio subaccount `AC_zillow_123`
   - Purchase number `555-555-5555`
   - Create messaging services

2. **Day 1-14:** A2P Brand Registration
   - Submit Zillow brand to TCR
   - Wait for approval (usually 1-2 weeks)

3. **Day 15:** A2P Campaign Registration
   - Register campaigns: "Property Updates", "Equity Alerts", "Agent Messages"
   - Usually approved within 24-48 hours

4. **Day 17:** Zillow is SMS-ready
   - All Zillow agents can now send SMS
   - All messages come from `555-555-5555`
   - Opt-outs apply to all Zillow agents

5. **Ongoing:**
   - Homeowner texts "STOP" → Suppressed for ALL Zillow agents
   - Homeowner texts "START" → Re-enabled for ALL Zillow agents
   - New Zillow agent added → Automatically uses same number, respects existing suppressions

