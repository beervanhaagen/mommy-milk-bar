/**
 * App Configuration
 *
 * This file extends app.json and ensures environment variables
 * are properly injected into production builds.
 *
 * CRITICAL: This prevents the TestFlight crash caused by missing
 * EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
 * environment variables in production builds.
 */

module.exports = ({ config }) => {
  // Read from app.json as base config
  const appJson = require('./app.json');

  return {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra || {}),
      // Inject environment variables at build time
      // These will be available via Constants.expoConfig.extra
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  };
};
