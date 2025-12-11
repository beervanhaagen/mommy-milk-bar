# iOS Build Guide - Real Device Testing 📱

## Overview

This guide will help you build and install Mommy Milk Bar on your iPhone for real device testing.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Apple Developer Account** (free or paid)
  - Free: Can install on your own devices (expires after 7 days)
  - Paid ($99/year): Can use TestFlight, no expiration
- [ ] **Xcode installed** on your Mac (from App Store)
- [ ] **iPhone connected** via USB cable (for ad-hoc installation)
- [ ] **Expo account** (free) - Sign up at https://expo.dev

## Two Installation Methods

### Method 1: Development Build (Recommended for Testing)
**Pros:** Quick, free, good for testing
**Cons:** Expires after 7 days (free account)

### Method 2: TestFlight (Recommended for MVP)
**Pros:** No expiration, easy sharing with testers
**Cons:** Requires paid Apple Developer account ($99/year)

---

## Method 1: Development Build (Quick Testing)

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

If you don't have an account, create one at https://expo.dev

### Step 3: Configure Project

```bash
eas build:configure
```

This will set up your project for EAS builds.

### Step 4: Build for iOS (Development)

```bash
eas build --platform ios --profile development
```

**What happens:**
1. EAS uploads your code to Expo's servers
2. Builds the iOS app in the cloud
3. Provides a download link when complete
4. Build takes ~10-15 minutes

### Step 5: Install on iPhone

**Option A: Direct Install (Easiest)**
1. Open the build URL on your iPhone (sent via email or shown in terminal)
2. Tap "Install" in Safari
3. Go to Settings → General → VPN & Device Management
4. Trust the developer certificate
5. App will appear on home screen

**Option B: Using Xcode**
1. Download the `.ipa` file from EAS dashboard
2. Connect iPhone to Mac
3. Open Xcode → Window → Devices and Simulators
4. Select your iPhone
5. Drag `.ipa` file to "Installed Apps" section

---

## Method 2: TestFlight Distribution (MVP/Beta Testing)

### Step 1: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in details:
   - **Platform:** iOS
   - **Name:** Mommy Milk Bar
   - **Primary Language:** Dutch (Nederlands)
   - **Bundle ID:** `com.milkbar.app` (must match app.json)
   - **SKU:** `mommy-milk-bar` (internal ID)
   - **User Access:** Full Access

### Step 2: Update app.json for Production

Ensure these fields are set:

```json
{
  "expo": {
    "name": "Mommy Milk Bar",
    "slug": "mommy-milk-bar",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.milkbar.app",
      "buildNumber": "1"
    }
  }
}
```

### Step 3: Build for TestFlight

```bash
eas build --platform ios --profile production
```

### Step 4: Submit to TestFlight

```bash
eas submit --platform ios
```

**What you'll need:**
- Apple ID
- App-specific password (generate at appleid.apple.com)
- The build ID from previous step

### Step 5: Invite Testers

1. Go to App Store Connect → TestFlight
2. Wait for build to process (~15-30 minutes)
3. Add internal testers (email addresses)
4. Testers receive email with TestFlight link
5. Install TestFlight app from App Store
6. Accept invitation and install app

---

## Current Configuration Review

### app.json
```json
"ios": {
  "supportsTablet": false,  ✅ iPhone only
  "bundleIdentifier": "com.milkbar.app"  ✅ Configured
}
```

### eas.json
```json
"build": {
  "development": {
    "developmentClient": true,
    "distribution": "internal"  ← For ad-hoc testing
  },
  "preview": {
    "distribution": "internal",
    "ios": {
      "simulator": true  ← Also builds for simulator
    }
  },
  "production": {}  ← For App Store/TestFlight
}
```

---

## Troubleshooting

### Build Fails: "Bundle identifier already in use"

**Problem:** Someone else registered `com.milkbar.app`

**Solution:** Change bundle identifier in `app.json`:
```json
"ios": {
  "bundleIdentifier": "com.yourname.mommymilkbar"
}
```

### Build Fails: "Missing credentials"

**Problem:** No provisioning profile/certificate

**Solution:** EAS will prompt you to create them:
```bash
eas credentials
```
Choose "Generate new credentials" and follow prompts.

### App crashes on iPhone

**Common causes:**
1. **Fonts not loading:** Check font files are included
2. **API keys missing:** Ensure `.env` values are in `app.json` or EAS secrets
3. **Native modules:** Some packages need custom native code

**Debug steps:**
1. Connect iPhone to Mac
2. Open Xcode → Window → Devices and Simulators
3. Select your iPhone
4. Click "View Device Logs"
5. Filter by "mommy-milk-bar"

### App won't install: "Unable to install"

**Solutions:**
1. Delete old version of app first
2. Trust certificate in Settings → General → VPN & Device Management
3. Ensure iPhone is registered in Apple Developer Portal
4. Try restarting iPhone

---

## Environment Variables for Production Build

Sensitive data (API keys) should be stored as EAS secrets, not in code.

### Set EAS Secrets

```bash
# Supabase credentials
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://lqmnkdqyoxytyyxuglhx.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key-here"
```

These will be injected at build time without exposing them in your code.

---

## Testing Checklist (Once Installed)

Run through all test cases from [TEST_RUNDOWN.md](TEST_RUNDOWN.md):

### Critical iOS-Specific Tests

- [ ] **Safe Area Insets:** Check notch area doesn't overlap content
- [ ] **Home Indicator:** Bottom bar doesn't hide navigation
- [ ] **Touch Targets:** Buttons are minimum 44x44 points (Apple guideline)
- [ ] **Fonts:** Custom fonts (Poppins, Quicksand) load correctly
- [ ] **Keyboard:** Dismisses properly, no content overlap
- [ ] **Background Mode:** Countdown continues when app is backgrounded
- [ ] **Notifications:** Permission prompts appear correctly
- [ ] **Performance:** Smooth scrolling, no lag
- [ ] **Rotation Lock:** Portrait mode only (as configured)
- [ ] **Dark Mode:** App looks good in both light/dark system settings

### Device-Specific Tests

Test on multiple devices if possible:
- **iPhone SE (small screen):** Check layout doesn't break
- **iPhone 14/15 Pro (Dynamic Island):** Top area handling
- **iPhone Plus/Max (large screen):** Content scales properly

---

## Quick Start Commands

### First Time Setup
```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Initialize project (if not done)
eas build:configure

# 4. Build for testing
eas build --platform ios --profile development
```

### Subsequent Builds
```bash
# After making changes, rebuild
eas build --platform ios --profile development

# For production/TestFlight
eas build --platform ios --profile production
```

### Check Build Status
```bash
eas build:list
```

Or visit: https://expo.dev → Your Project → Builds

---

## Cost Summary

| Method | Cost | Expiration | Best For |
|--------|------|------------|----------|
| **Development Build (Free Account)** | Free | 7 days | Quick testing, debugging |
| **Development Build (Paid Account)** | $99/year | 1 year | Internal team testing |
| **TestFlight** | $99/year | 90 days/build | Beta testing, MVP |
| **App Store** | $99/year | Permanent | Public release |

---

## Next Steps

1. **Choose your method:**
   - Quick testing → Development Build (free)
   - MVP testing → TestFlight ($99/year)

2. **Run the build:**
   ```bash
   npm install -g eas-cli
   eas login
   eas build --platform ios --profile development
   ```

3. **Install on iPhone** using instructions above

4. **Run all test cases** from TEST_RUNDOWN.md

5. **Document issues** you find on real hardware

6. **Iterate:** Fix issues → Rebuild → Test again

---

## Support Resources

- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **iOS Deployment:** https://docs.expo.dev/deploy/build-project/
- **TestFlight Guide:** https://developer.apple.com/testflight/
- **Expo Forums:** https://forums.expo.dev/

---

## Tips for Faster Testing

1. **Use Expo Go during development** for instant changes
   - Won't work for all native features
   - Great for UI/logic testing

2. **Build for Simulator first** to catch obvious issues:
   ```bash
   eas build --platform ios --profile preview
   ```

3. **Use EAS Update** for over-the-air updates (JS-only changes):
   ```bash
   eas update --branch production
   ```
   No need to rebuild for non-native changes!

4. **Enable hot reload** in development builds for faster iteration

---

**Ready to build?** Start with Method 1 (Development Build) for quick testing! 🚀
