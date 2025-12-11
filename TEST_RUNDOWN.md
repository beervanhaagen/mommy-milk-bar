## 🧪 Mommy Milk Bar – Test Run Log

**Purpose:** Structured rundown for manual testing before App Store submission.  
**Source checklist:** See `MVP_LAUNCH_CHECKLIST.md` (Pre-submission checklist section).  
**Tip:** For each test run, add a new dated section and fill in results instead of overwriting older runs.

---

## 🧾 Run 1 – Pre-submission Testing

**Tester:** _Tess_  
**Date:** _fill in_  
**Build / Version:** _e.g. 1.0.0 (build 1)_  
**Device(s):** _e.g. iPhone 14 Pro simulator / real device_  

Overall status options (per test case):  
- **NOT RUN** – not executed yet  
- **IN PROGRESS** – partially executed, still investigating  
- **PASS** – expected behaviour confirmed  
- **FAIL** – bug found, needs fix before submission  

---

## Phase 1 – Onboarding Flow Testing (Critical)

### Test Case 1 – Fresh Install: Happy Path

**Scope:** Fresh install → Landing → Onboarding → Privacy Consent → Account Creation → Sync → Main App.

- **Status:** `NOT RUN` / `IN PROGRESS` / `PASS` / `FAIL`  _(select one and edit)_
- **Devices tested:**  
- **Notes:**  
  - Steps followed:  
    - Delete app → Open app → Landing page  
    - Tap "Aan de slag" → Onboarding welcome  
    - Complete all onboarding steps → Privacy consent  
    - Check all 3 consent boxes (18+, medical disclaimer, privacy)  
    - Tap legal links (privacy + voorwaarden)  
    - Tap "Akkoord & doorgaan" → CreateAccount  
    - Enter email + password → AccountDone  
    - Wait for sync → Button shows "Gegevens opslaan..." with spinner  
    - After sync → Navigate to main app tabs  
  - Checks:  
    - All text Dutch (no English)  
    - No emojis on consent screen  
    - Sync completes without errors  
    - User lands in main app without crash  
  - Findings: _fill in after testing_

---

### Test Case 2 – Legal Links (Current Focus)

**Scope:** Verify all legal links correctly open browser to `privacy.html` and `terms.html`.

- **Status:** `IN PROGRESS`  _(current state)_  
- **Devices tested:** _fill in_  
- **Notes from current run:**  
  - From **privacy-consent** screen:  
    - Tester does **not** see legal links on:  
      - Leeftijdscheck (18+ check) section – unclear if links are required here.  
      - Medical disclaimer section – unclear if links are required here.  
    - For **privacy policy** and **algemene voorwaarden**, links are visible **at the bottom of the screen** (not inline per section).  
  - From **CreateAccount** screen:  
    - Inline "privacy policy" and "voorwaarden" links need to be verified that they:  
      - Open external browser (not in-app webview, unless intended).  
      - Point to the correct URLs (`/privacy.html` and `/terms.html`).  
  - **Open questions / follow-up:**  
    - Decide whether leeftijdscheck and medical disclaimer blocks must also contain explicit legal links, or if having them only at the bottom is acceptable.  
    - Confirm for App Store review that: “All legal links are easy to find and functional” is satisfied.

- **Retest checklist:**  
  - [ ] From privacy-consent screen, tap "Privacy Policy" → browser opens correct `privacy.html`.  
  - [ ] From privacy-consent screen, tap "Algemene Voorwaarden" → browser opens correct `terms.html`.  
  - [ ] From CreateAccount, tap inline "privacy policy" → browser opens `privacy.html`.  
  - [ ] From CreateAccount, tap inline "voorwaarden" → browser opens `terms.html`.  

---

### Test Case 3 – Supabase Data Sync (Current Focus)

**Scope:** Confirm all onboarding data and consent fields are saved correctly to Supabase.

- **Status:** `IN PROGRESS`  _(current state)_  
- **Test account(s):** e.g. `beervhaagen@icloud.com`  
- **Notes from current run:**  
  - **1. Onboarding behaviour:**  
    - Completing onboarding with test account **works**, user reaches home screen.  
    - A **small error message** is visible on the home screen after onboarding (screenshot referenced by tester) – details to be captured and tied to a bug ticket.  
  - **2. Supabase – Authentication → Users:**  
    - New user row created with `uid` (shown as `id` / `UID` in Supabase).  
    - This matches expected `user_id` creation.  
  - **3. Supabase – `profiles` table:**  
    - There is a `profiles` table with an `id` such as `b0e24a8a-4709-47b1-bfba-1dd9b9084d28` corresponding to the created user.  
    - Tester was unsure where to find `profiles` at first → UX/Docs note: document where to look in Supabase (Database → Tables → `profiles`).  
  - **4. Email verification:**  
    - When trying to activate the email address via the email link, Supabase email opens a page that returns **404** after pressing the confirmation button.  
    - This matches known **TASK 12: Fix Email Verification Flow** in `MVP_LAUNCH_CHECKLIST.md` (needs Edge Function / route wiring).  
    - **Impact:** Email verification currently **fails** for the tested account and must be fixed before public launch (but not strictly blocking onboarding test itself).  
  - **5. Babies & other profile data:**  
    - Need to explicitly verify:  
      - `mother_name`, `mother_birthdate` stored in `profiles`.  
      - `consent_version = "1.0.0"`.  
      - `age_consent = true`.  
      - `medical_disclaimer_consent = true`.  
      - `privacy_policy_consent = true`.  
      - `consent_timestamp` has ISO date.  
      - `babies` table has row(s) if baby data entered during onboarding.  

- **Retest checklist:**  
  - [ ] Complete onboarding with a dedicated test account.  
  - [ ] In Supabase → `auth.users`: confirm new row created and email matches test account.  
  - [ ] In Supabase → `profiles`: confirm `id` matches `auth.users.id`.  
  - [ ] In `profiles`: confirm mother data and all consent fields populated as expected.  
  - [ ] In `babies`: confirm baby data exists if entered.  
  - [ ] Re-run email verification after fixing TASK 12 to ensure no 404.  
  - [ ] Confirm home screen no longer shows the small error after sync.  

---

## Phase 2 – Main App Testing (Overview – To Be Filled In)

For each test case below, copy this mini-template and fill in as you test:

> **Status:** `NOT RUN` / `IN PROGRESS` / `PASS` / `FAIL`  
> **Devices tested:**  
> **Notes:** key findings, screenshots references, open questions.

### Test Case 4 – Logging Drinks (Core Feature)
- **Status:** `NOT RUN`  
- **Notes:** _to be filled in_

### Test Case 5 – Alcohol Warning (3+ Drinks)
- **Status:** `NOT RUN`  
- **Notes:** _to be filled in_

### Test Case 6 – Result Screen
- **Status:** `NOT RUN`  
- **Notes:** _to be filled in_

### Test Case 7 – Plan Ahead
- **Status:** `NOT RUN`  
- **Notes:** _to be filled in_

### Test Case 8 – Profile Editing
- **Status:** `PASS`
- **Devices tested:**  
- **Steps:**
  1. Ga naar het tabblad **Profiel**.
  2. Tik op **“Bewerk”** in een sectie (namen, lichaamsmetingen of voedingsvoorkeuren).
  3. Wijzig een waarde en kies **Opslaan**.
  4. Sluit de app volledig (force close).
  5. Start de app opnieuw, ga naar Profiel en controleer of de wijziging is bewaard.
- **✅ Expected:** Wijzigingen worden zowel lokaal als in Supabase opgeslagen en blijven zichtbaar na herstart.
- **Feedback / Findings:**
  - Lichaamsmetingen-slider onthoudt de numerieke waarde (bijv. 80 kg) maar de hendelpositie springt na het heropenen helemaal naar rechts i.p.v. naar de juiste relatieve plek.
  - Gewichtsschaal moet doorlopen tot **200 kg**; lengteschaal tot **210 cm**.
  - Positief: wijzigingen blijven correct opgeslagen, ook na herstart.

### Test Case 9 – Settings
- **Status:** `NOT RUN`
- **Devices tested:**  
- **Steps:**
  1. Tik op het **instellingen-icoon** om de instellingenpagina te openen.
  2. Controleer dat alle labels in het Nederlands zijn: “Instellingen”, “Veiligheidsmodus”, “Notificaties”.
  3. Verifieer dat er geen kapotte “Privacy Policy” of “Disclaimer” knoppen meer bestaan.
  4. Zet **Veiligheidsmodus** aan/uit en controleer of de status wordt onthouden.
  5. Zet **Notificaties** aan/uit en controleer of de status wordt onthouden.
- **✅ Expected:** Instellingen werken zonder errors en toggles behouden hun stand.

---

## Phase 3 – Legal & Compliance Testing

### Test Case 10 – Disclaimers
- **Status:** `PASS`
- **Devices tested:**  
- **Steps:**
  1. Bekijk de **landing page** en controleer de lange disclaimer onderaan (“MMB is een informatieve tool… indicaties zijn gebaseerd op richtlijnen…”).
  2. Log een drankje en wacht tot het result scherm aangeeft dat voeden weer kan.
  3. Controleer of het result scherm de tekst bevat:
     > “Dit is een indicatie… Raadpleeg bij twijfel een professional.”
- **✅ Expected:** Beide disclaimers zichtbaar en consistent met juridische messaging.

### Test Case 11 – Consent Data
- **Status:** `NOT RUN`
- **Devices tested:**  
- **Steps:**
  1. Doorloop onboarding en maak een **nieuw account**.
  2. Ga in Supabase naar `profiles` en zoek de gebruiker.
  3. Controleer de velden:
     - `age_consent = true`
     - `medical_disclaimer_consent = true`
     - `privacy_policy_consent = true`
     - `consent_version = "1.0.0"`
     - `consent_timestamp =` geldige ISO-datum
- **Extra:** Bezoek in de app **Instellingen → Consentcentrum**, toggle marketing- en analytics-toestemming en controleer dat deze waarden direct updaten in Supabase.
- **✅ Expected:** Alle consentvelden zijn gezet (GDPR compliance).

---

## Phase 4 – Data & Account Testing

### Test Case 12 – Multi-Device Sync
- **Status:** `PASS`
- **Devices tested:**  
- **Steps:**
  1. Log in op **Device 1** met een testaccount en registreer twee drankjes.
  2. Log in op **Device 2** met hetzelfde account.
  3. Controleer of de drankjes zichtbaar zijn op Device 2.
- **✅ Expected:** Drinkgegevens synchroniseren tussen devices.

### Test Case 13 – Export Data
- **Status:** `PASS`
- **Devices tested:**  
- **Steps:**
  1. Ga naar **Profiel** → scroll naar beneden.
  2. Tik op **“Data exporteren”**.
  3. Controleer of het JSON-bestand bevat:
     - Profielgegevens
     - Dranklog
     - Baby-informatie (indien aanwezig)
- **✅ Expected:** Exportbestand is volledig.

### Test Case 14 – Delete Account
- **Status:** `PASS`
- **Devices tested:**  
- **Steps:**
  1. Ga naar **Profiel** → scroll naar onder.
  2. Tik op **“Account verwijderen”** en bevestig.
  3. App moet terugkeren naar de landing page.
  4. Controleer in Supabase dat de gebruiker (auth + profiel) is verwijderd.
- **✅ Expected:** Account wordt volledig verwijderd in app en backend.

---

## Phase 5 – Real Device Testing

### iOS Simulator Testing (In Progress)
- **Status:** `IN PROGRESS` 🏗️
- **Build Started:** 2025-11-28 11:46 CET
- **Build URL:** https://expo.dev/accounts/beervanhaagen/projects/mommy-milk-bar/builds
- **Steps:**
  1. ✅ EAS Build configured (`eas.json` updated)
  2. ✅ expo-dev-client installed
  3. ⏳ Build uploading to EAS (477 MB, ~5-10 min)
  4. ⏳ Cloud build process (~10-15 min after upload)
  5. Download .app file when ready
  6. Install on iOS Simulator (Xcode required)
  7. Run all testcases from phases above
- **✅ Expected:** App runs smoothly on simulator, no crashes
- **⚠️ Note:** Simulator testing won't show real device performance

### iOS Device Testing
- **Status:** `BLOCKED - Waiting for Apple Developer approval` ⏸️
- **Blocker:** Apple Developer Program enrollment under review (typically 24-48 hours)
- **Contact:** "Please contact us" message at developer.apple.com
- **Steps:**
  1. ⏳ Wait for Apple Developer approval email
  2. Build iOS version for device: `npx eas build --platform ios --profile development`
  3. Install on real iPhone via Safari or TestFlight
  4. Run all testcases from phases above
  5. Test device-specific features:
     - Notch/Dynamic Island handling
     - Safe area insets
     - Touch target sizes (44x44pt minimum)
     - Real gesture performance
     - Actual font rendering
     - Battery/performance impact
  6. Test on multiple devices if possible (SE, Pro, Plus)
- **✅ Expected:** App runs smoothly on real iPhone hardware
- **Next Action:** Check Apple Developer email for approval status

### Android Device Testing (Optional voor MVP)
- **Status:** `NOT RUN`
- **Steps:**
  1. Bouw een Android-versie (`npx expo build:android`).
  2. Installeer op een fysiek Android toestel.
  3. Doorloop kernflows (loggen, plannen, profiel, instellingen).
- **✅ Expected:** Basisfunctionaliteit werkt ook op Android.

---

## Phase 6 – Edge Cases & Error Handling

### Test Case 15 – Offline Mode
- **Status:** `NOT RUN`
- **Steps:**
  1. Schakel Wi-Fi en mobiel internet uit.
  2. Probeer een account aan te maken → verwachte foutmelding.
  3. Log een drankje → moet lokaal lukken.
  4. Zet internet terug aan → controleer of de data synchroniseert.
- **✅ Expected:** Offline acties werken en syncen later zonder dat data verloren gaat.

### Test Case 16 – Invalid Input
- **Status:** `NOT RUN`
- **Steps:**
  1. Probeer 0 drankjes te loggen → moet voorkomen worden.
  2. Maak een account aan met een te kort wachtwoord → fout tonen.
  3. Probeer een drankje te loggen zonder selectie → moet voorkomen worden.
- **✅ Expected:** Validaties blokkeren ongeldige invoer met duidelijke feedback.

---

## 🐛 Bug & Issue Log (Link to Tasks)

Use this section to quickly log issues you see during the run and then link or copy them into your main task system.

| ID | Date | Area | Severity (Critical/High/Med/Low) | Summary | Linked Test Case(s) | Notes / Links |
|----|------|------|-----------------------------------|---------|----------------------|---------------|
| 1  | _fill_ | Home screen | Med | Small error shown after onboarding on home tab | TC3 | Screenshot in testing notes |
| 2  | _fill_ | Email verification | High | Email verification link → 404 page after clicking button | TC3, TASK 12 | Needs Edge Function / route fix |
| 3  | _fill_ | Legal links / consent | TBD | Placement/absence of links on leeftijdscheck & medical disclaimer sections | TC2 | Decide if required by design/legal |

Add new rows as needed during testing.


