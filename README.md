# SMS Admin - Multi-Tenant SMS Management System

A full-stack TypeScript admin web application for managing SMS across multiple organizations in a multi-tenant SaaS product.

## Features

- **Organizations Management**: View and manage organizations with SMS configuration status
- **SMS Templates**: Global template definitions with per-org override support
- **Template Overrides**: Customize SMS copy per organization
- **SMS Logs**: View message logs with filtering capabilities
- **Provisioning Jobs**: Track Twilio provisioning status per organization
- **Suppressions**: View opt-out and suppression status

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript**
- **Tailwind CSS** for styling
- **React** with client-side state management
- Mock API layer (no real backend required)

## Project Structure

```
sms-admin/
├── app/                    # Next.js app directory
│   ├── orgs/              # Organization pages
│   │   ├── page.tsx       # Organizations list
│   │   └── [orgId]/       # Organization detail
│   │       ├── page.tsx
│   │       └── templates/[templateId]/  # Template override editor
│   ├── templates/         # Global templates page
│   ├── logs/              # SMS logs page
│   └── page.tsx           # Dashboard
├── components/            # React components
│   └── Navigation.tsx     # Main navigation
├── lib/                   # Utilities and API
│   └── api.ts            # Mock API layer
├── types/                 # TypeScript type definitions
│   └── index.ts
└── data/                  # Dummy data
    └── dummyData.ts
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

If you encounter npm cache permission issues, try:
```bash
sudo chown -R $(whoami) ~/.npm
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Data Models

The application uses the following main entities:

- **Organization**: Represents a B2B customer with SMS configuration
- **SmsTemplate**: Global SMS template definitions
- **OrgSmsTemplateOverride**: Per-org template customizations
- **SmsJob**: Campaign or batch job for sending SMS
- **SmsMessageLog**: Individual message logs (inbound/outbound)
- **SmsSuppression**: Opt-out and suppression tracking
- **ProvisioningJob**: Twilio provisioning status tracking

All data is stored in memory (dummy data) and resets on page refresh.

## Pages

- **Dashboard** (`/`): Overview with stats and recent activity
- **Organizations** (`/orgs`): List all organizations with filters
- **Organization Detail** (`/orgs/:orgId`): View org details, provisioning, templates, logs, suppressions
- **Templates** (`/templates`): View all global SMS templates
- **Template Override** (`/orgs/:orgId/templates/:templateId`): Create/edit org-specific template overrides
- **SMS Logs** (`/logs`): View message logs with filtering

## Deployment to Vercel

This project is ready to deploy to Vercel:

1. Push your code to GitHub/GitLab/Bitbucket
2. Import the project in Vercel
3. Vercel will automatically detect Next.js and configure the build

Or use the Vercel CLI:
```bash
npm i -g vercel
vercel
```

## Notes

- All API calls are mocked with simulated network delays
- Data is stored in memory and resets on refresh
- No real database or external services required
- Perfect for prototyping and demonstrating the admin interface structure
