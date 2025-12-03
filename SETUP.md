# Quick Setup Guide

## Fixing npm Cache Issues (if needed)

If you encounter npm cache permission errors, run:

```bash
sudo chown -R $(whoami) ~/.npm
```

Then try installing again:

```bash
npm install
```

## Alternative: Use yarn

If npm continues to have issues, you can use yarn instead:

```bash
yarn install
yarn dev
```

## Running the Application

Once dependencies are installed:

```bash
npm run dev
```

The app will be available at http://localhost:3000

## What's Included

✅ Complete TypeScript type definitions for all data models
✅ Comprehensive dummy data (12 orgs, 7 templates, etc.)
✅ Mock API layer with simulated network delays
✅ All required pages:
   - Dashboard with overview stats
   - Organizations list with filters
   - Organization detail with provisioning, templates, logs, suppressions
   - Global templates list
   - Template override editor
   - SMS logs with filters
✅ Navigation component
✅ Responsive Tailwind CSS styling
✅ Ready for Vercel deployment

## Testing the App

1. Start at the Dashboard (`/`) to see overview
2. Navigate to Organizations (`/orgs`) to see the list
3. Click any organization to see details
4. Try filtering by SMS enabled/ready status
5. View templates and create overrides
6. Check SMS logs with various filters
7. Trigger provisioning jobs (creates dummy jobs)

All data is in-memory and resets on refresh - perfect for demonstration!

