/* ============================================================
   VERCEL WEB ANALYTICS
   Initialization for Ancestor Calendar
   ============================================================ */

import { inject } from '@vercel/analytics';

// Initialize Vercel Web Analytics
// The inject() function will automatically load the analytics script
// and begin tracking page views when deployed to Vercel
inject({
  mode: 'auto',  // Automatically detects development vs production
  debug: false   // Set to true to see debug logs in console
});
