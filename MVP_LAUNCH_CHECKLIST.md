# 🚀 Mommy Milk Bar - MVP Launch Checklist

**Last Updated:** January 26, 2025
**Target:** App Store Submission Ready
**Status:** 7/9 Must-Fix Complete ✅

---

## ✅ COMPLETED TASKS

### Legal & Compliance
- [x] **TASK 1:** Create Terms of Service & Privacy Policy Documents
  - ✅ Created [website/privacy.html](website/privacy.html)
  - ✅ Created [website/terms.html](website/terms.html)
  - ✅ GDPR Article 13 compliant
  - ✅ Medical disclaimers included

- [x] **TASK 2:** Make Legal Links Functional in App
  - ✅ Fixed [app/onboarding/CreateAccount.tsx](app/onboarding/CreateAccount.tsx)
  - ✅ Fixed [app/onboarding/privacy-consent.tsx](app/onboarding/privacy-consent.tsx)
  - ✅ Links now open browser to legal documents

- [x] **TASK 3:** Add Disclaimer to Landing Page
  - ✅ Added subtle disclaimer to [app/landing.tsx](app/landing.tsx)
  - ✅ Text: "Deze app geeft algemene richtlijnen, geen medisch advies."

- [x] **TASK 4:** Integrate Privacy Consent Screen into Main Flow
  - ✅ Updated [app/onboarding/ready.tsx](app/onboarding/ready.tsx)
  - ✅ Updated [app/onboarding/privacy-consent.tsx](app/onboarding/privacy-consent.tsx)
  - ✅ Flow: ready → privacy-consent → CreateAccount → AccountDone

- [x] **TASK 5:** Fix Data Sync After Onboarding
  - ✅ Updated [app/onboarding/AccountDone.tsx](app/onboarding/AccountDone.tsx)
  - ✅ Updated [app/index.tsx](app/index.tsx)
  - ✅ Sync to Supabase on account creation
  - ✅ Load from Supabase on app startup

- [x] **TASK 6:** Localize English Text to Dutch
  - ✅ Translated [app/result.tsx](app/result.tsx) with improved safety messaging
  - ✅ Translated [app/settings.tsx](app/settings.tsx) completely
  - ✅ Translated [app/plan.tsx](app/plan.tsx) all labels and buttons
  - ✅ Translated [app/(tabs)/drinks.tsx](app/(tabs)/drinks.tsx)
  - ✅ Verified auth screens already in Dutch

### Security
- [x] **Verified .env not in Git**
  - ✅ .env was never committed
  - ✅ Keys are safe
  - ✅ Updated [.env.example](.env.example) with warnings

---

## 🔴 MUST-FIX BEFORE SUBMISSION (2 Remaining)

### UX - Critical Bugs

**TASK 7: Remove/Implement Non-Functional UI Elements** 🔴 BLOCKING
- **Issue:** Broken buttons hurt user trust and App Store approval
- **Files to fix:**
  - [ ] [app/(tabs)/profile.tsx](app/(tabs)/profile.tsx:461-479) - "Account instellingen", "Notificaties", "Privacy & data", "Help & ondersteuning"
  - [x] [app/settings.tsx](app/settings.tsx) - Already removed broken "Privacy Policy" and "Disclaimer" buttons ✅
  - [ ] [app/plan.tsx](app/plan.tsx:74-76) - "Tijdstip wijzigen" button (non-functional)
- **Options:**
  - Quick: Comment out or delete non-functional links
  - Better: Implement basic functionality or show "Coming soon"
- **Impact:** App Store approval, user trust
- **Estimate:** 2-3 hours

### Algorithm/Safety - Critical Messaging

**TASK 8: Improve "Likely Safe" Messaging** ✅ COMPLETE
- **Issue:** [app/result.tsx](app/result.tsx) used checkmark that felt too authoritative
- **Implementation:**
  - [x] Changed "✅ Likely Safe Now!" → "Veilig volgens berekening"
  - [x] Added disclaimer: "Dit is een indicatie. Raadpleeg bij twijfel een professional."
  - [x] Removed checkmark emoji for less authoritative tone
- **Impact:** Liability protection, clear risk communication
- **Completed:** January 26, 2025 (as part of Task 6)

**TASK 9: Add Quantity-Based Alcohol Warnings** 🟠 RECOMMENDED
- **Issue:** App doesn't warn about health risks of heavy drinking
- **Implementation:**
  - [ ] Add warning in [app/(tabs)/drinks.tsx](app/(tabs)/drinks.tsx) when > 3 drinks logged
  - [ ] Warning text: "⚠️ Let op: Regelmatig veel alcohol kan melkproductie en baby-ontwikkeling beïnvloeden."
  - [ ] Show on result screen if daily total exceeds safe limits
- **Impact:** Harm reduction, liability protection
- **Estimate:** 1 hour

---

## 🟡 STRONGLY RECOMMENDED (Before Public Launch)

### Technical - Reliability

**TASK 10: Add Loading States to Async Operations**
- **Issue:** No feedback during delete account, export data, etc.
- **Files:**
  - [ ] [app/(tabs)/profile.tsx](app/(tabs)/profile.tsx:236) - Export data
  - [ ] [app/(tabs)/profile.tsx](app/(tabs)/profile.tsx) - Delete account
  - [ ] Profile edit modals
- **Implementation:** Add `isLoading` state, show ActivityIndicator
- **Estimate:** 1-2 hours

**TASK 11: Add Input Validation**
- **Issue:** No validation on custom drink inputs or profile data
- **Files:**
  - [ ] [app/(tabs)/drinks.tsx](app/(tabs)/drinks.tsx:161) - Custom alcohol %
  - [ ] [app/(tabs)/drinks.tsx](app/(tabs)/drinks.tsx:170-182) - Quantity limits (max 10)
  - [ ] Profile modals - Weight/height ranges
- **Implementation:** Add validation functions with user-friendly errors
- **Estimate:** 1-2 hours

**TASK 12: Fix Email Verification Flow**
- **Issue:** App calls RPC but should call Edge Function
- **File:** [src/services/profile.service.ts](src/services/profile.service.ts)
- **Implementation:**
  ```typescript
  const { data, error } = await supabase.functions.invoke('verify-email', {
    body: { token }
  });
  ```
- **Estimate:** 15 minutes

### Database - Maintenance

**TASK 13: Fix Migration Naming Conflict**
- **Issue:** Two migrations named `003_*`
- **Files:** `/supabase/migrations/`
- **Implementation:** Rename `003_add_consent_and_email_fields.sql` → `004_add_consent_and_email_fields.sql`
- **Estimate:** 5 minutes

**TASK 14: Schedule Analytics Anonymization**
- **Issue:** GDPR requires data retention limits
- **Implementation:**
  - [ ] Enable `pg_cron` extension in Supabase
  - [ ] Schedule: `SELECT cron.schedule('anonymize-analytics', '0 2 * * *', 'SELECT anonymize_old_analytics()');`
- **Estimate:** 10 minutes

### Content - Trust & Credibility

**TASK 15: Add Scientific References**
- **Issue:** Users may not trust calculations without sources
- **Implementation:**
  - [ ] Create [app/how-it-works.tsx](app/how-it-works.tsx)
  - [ ] Cite LactMed database, AAP guidelines
  - [ ] Show calculation formula
  - [ ] Link from settings or countdown card
- **Estimate:** 2-3 hours

---

## 💡 NICE-TO-HAVE (Post-Launch)

### Features
- [ ] Implement Feedings tab (currently placeholder)
- [ ] Implement actual reminder functionality (currently just alert)
- [ ] Add onboarding progress indicator (e.g., "Step 3 of 8")
- [ ] Add haptic feedback throughout app
- [ ] Create "How Mimi Works" explainer animation

### UX Polish
- [ ] Add loading skeletons for data-heavy screens
- [ ] Implement real-time Supabase subscriptions for multi-device
- [ ] Add success metrics tracking (with consent)
- [ ] Adjust physical measurement sliders for edge cases (< 40kg, > 120kg)
- [ ] Add network error handling for offline scenarios

### Admin/Ops
- [ ] Build admin dashboard for content tips management
- [ ] Add error monitoring (Sentry, LogRocket)
- [ ] Set up automated testing (E2E tests)
- [ ] Add analytics dashboard

---

## 📋 PRE-SUBMISSION CHECKLIST

### Testing Required

**Onboarding Flow:**
- [ ] Fresh install → Landing → Onboarding → Privacy Consent → Account Creation → Sync → Main App
- [ ] Test all legal links open correctly
- [ ] Verify data syncs to Supabase
- [ ] Test "skip account" flow works
- [ ] Test loading states during sync

**Main App:**
- [ ] Log drinks → Countdown updates → Result screen accurate
- [ ] Plan drinks → Feasibility assessment shows correctly
- [ ] Profile editing → Data saves → Syncs to Supabase
- [ ] Multi-device sync works (login on second device)
- [ ] Export data works
- [ ] Delete account works

**Legal/Compliance:**
- [ ] All legal links work (app + website)
- [ ] Privacy Policy displays correctly
- [ ] Terms of Service displays correctly
- [ ] Disclaimers visible on landing and result screens
- [ ] Consent data saves to Supabase

**Supabase:**
- [ ] Check `profiles` table has data
- [ ] Check `babies` table has data (if entered)
- [ ] Check consent fields populated correctly
- [ ] RLS policies working (users can't see others' data)
- [ ] Edge Functions deployed and working

### App Store Requirements

**Metadata:**
- [ ] App name: "Mommy Milk Bar"
- [ ] Subtitle: Clear value proposition
- [ ] Keywords: borstvoeding, alcohol, planning, etc.
- [ ] Description: Mention it's informational, not medical advice
- [ ] Privacy Policy URL: https://mommymilkbar.nl/privacy.html
- [ ] Terms of Use URL: https://mommymilkbar.nl/terms.html

**Assets:**
- [ ] App icon (1024x1024px)
- [ ] Screenshots (6.5", 5.5" iPhone)
- [ ] Optional: App preview video

**Build:**
- [ ] Build number incremented
- [ ] Version number set (e.g., 1.0.0)
- [ ] Expo build completes without errors
- [ ] Test on real iOS device
- [ ] Test on real Android device (if doing Play Store)

**Age Rating:**
- [ ] Set to 18+ (alcohol content)

**Categories:**
- [ ] Primary: Health & Fitness or Lifestyle
- [ ] Secondary: Parenting

---

## 🎯 REALISTIC MVP TIMELINE

**Must-Fix Tasks (6-7 hours):**
- TASK 6: Localization (1-2h)
- TASK 7: Remove broken links (2-3h)
- TASK 8: Messaging improvements (0.5h)
- TASK 9: Alcohol warnings (1h)
- TASK 10: Loading states (1-2h)
- TASK 11: Input validation (1-2h)

**Testing & QA (4-6 hours):**
- Manual testing all flows
- Fix bugs found
- Test on real devices

**App Store Prep (2-3 hours):**
- Screenshots
- Metadata
- Build submission

**TOTAL: 2-3 days of focused work**

---

## ✅ WHEN TO SUBMIT

You're ready when:
- ✅ All "Must-Fix" tasks complete
- ✅ All legal links work
- ✅ No broken UI elements
- ✅ Data syncs to Supabase
- ✅ Testing checklist complete
- ✅ App Store metadata ready
- ✅ No critical bugs

---

## 📞 NEXT STEPS

**Immediate (Today):**
1. Review this checklist
2. Prioritize which tasks to tackle first
3. Test the 5 completed tasks to verify they work

**This Week:**
1. Complete TASK 6-9 (must-fix items)
2. Test thoroughly
3. Fix any bugs found

**Next Week:**
1. Complete remaining recommended tasks
2. Prepare App Store assets
3. Submit for review

---

**Questions or need help?** Reference the comprehensive audit document and task descriptions for detailed implementation guidance.

**Progress:** 7/9 Must-Fix Complete (Tasks 1-6, 8) | ~75% Ready for Submission

**Remaining Must-Fix:** Task 7 (broken buttons), Task 9 (alcohol warnings)
