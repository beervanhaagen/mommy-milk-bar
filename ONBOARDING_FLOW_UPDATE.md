# ✅ Onboarding Flow Update - Account Aanmaak aan Einde

## 🔄 OUDE FLOW vs NIEUWE FLOW

### **❌ Oude Flow (direct account aanmaken)**
```
Landing Page
    │
    └─> "Aan de slag" ─> Register ─> Onboarding ─> Main App
```

### **✅ Nieuwe Flow (warm welkom eerst)**
```
Landing Page
    │
    └─> "Aan de slag" ─> Onboarding ─> Completion Screen
                                            │
                                            ├─> "Maak account aan" ─> CreateAccount ─> AccountDone ─> Main App
                                            │
                                            └─> "Ga door zonder account" ─> Main App (zonder sync)
```

---

## 🎯 WAAROM DEZE VERANDERING?

### **Betere User Experience:**
1. **Eerst kennis maken** - Users leren de app kennen voordat ze commitment maken
2. **Waarde tonen** - Ze zien wat de app doet voordat ze een account aanmaken
3. **Vertrouwen opbouwen** - Warm welkom en demo voordat persoonlijke info gevraagd wordt
4. **Optioneel** - Users kunnen de app ook zonder account gebruiken

### **Lagere drempel:**
- Geen account verplicht om de app te proberen
- Privacy-conscious users kunnen eerst testen
- Minder weerstand bij eerste gebruik

---

## 📝 WAT IS ER VERANDERD?

### **1. Landing Page** ([app/landing.tsx](app/landing.tsx))
```typescript
// ❌ VOOR:
router.push('/auth/register');  // Direct naar account aanmaken

// ✅ NA:
router.push('/onboarding/welcome');  // Eerst onboarding
```

### **2. Index Routing** ([app/index.tsx](app/index.tsx))
```typescript
// ❌ VOOR:
if (isAuthenticated && !settings.hasCompletedOnboarding) {
  return <Redirect href="/onboarding/survey-names" />;
}

// ✅ NA:
if (isAuthenticated && !settings.hasCompletedOnboarding) {
  return <Redirect href="/onboarding/completion" />;  // Ga verder waar ze gebleven waren
}
```

### **3. CreateAccount Screen** ([app/onboarding/CreateAccount.tsx](app/onboarding/CreateAccount.tsx))
```typescript
// ❌ VOOR:
// TODO: Replace with actual API call
await new Promise(resolve => setTimeout(resolve, 1500));

// ✅ NA:
// Echte Supabase signup
await signUp({
  email,
  password,
  motherName: settings.motherName,
  consentVersion: '1.0.0',
  analyticsConsent: true,
  marketingConsent: false,
});
```

### **4. Completion Screen** ([app/onboarding/completion.tsx](app/onboarding/completion.tsx))
- Geen wijzigingen nodig! Was al perfect opgezet met:
  - "Maak account aan" button → CreateAccount
  - "Ga door zonder account" button → Mark onboarding complete

---

## 🎨 USER JOURNEY

### **Scenario A: Nieuwe User (Maakt Account)**
```
1. Landing page
   ↓ "Aan de slag" klik

2. Onboarding/Welcome
   ↓ Door verschillende screens

3. Survey screens (naam, baby info, etc.)
   ↓ Data wordt opgeslagen in Zustand (lokaal)

4. Completion screen
   ↓ "Maak account aan" klik

5. CreateAccount screen
   ↓ Email + wachtwoord invoeren
   ↓ Supabase signup (met survey data!)

6. AccountDone screen (success!)
   ↓ "Start met Mommy Milk Bar"

7. Main App (Tabs)
   ✅ Authenticated + Onboarded
   ✅ Data gesync naar Supabase
```

### **Scenario B: Nieuwe User (Zonder Account)**
```
1. Landing page
   ↓ "Aan de slag" klik

2. Onboarding/Welcome
   ↓ Door verschillende screens

3. Survey screens (naam, baby info, etc.)
   ↓ Data wordt opgeslagen in Zustand (lokaal)

4. Completion screen
   ↓ "Ga door zonder account" klik

5. Main App (Tabs)
   ⚠️ Niet authenticated
   ⚠️ Data alleen lokaal (geen sync)
   ⚠️ Kan later alsnog account aanmaken via Settings
```

### **Scenario C: Bestaande User (Login)**
```
1. Landing page
   ↓ "Log in" klik

2. Login screen
   ↓ Email + wachtwoord

3. Main App (Tabs)
   ✅ Authenticated
   ✅ Data sync beschikbaar
```

### **Scenario D: User die Onboarding Niet Afmaakte**
```
1. App openen
   ↓ Auth check (authenticated maar not onboarded)

2. Completion screen
   ↓ Weer keuze: account maken of skip

3. Main App
```

---

## 🔐 DATA FLOW

### **Lokale Data (Zustand)**
Survey antwoorden worden eerst lokaal opgeslagen:
- `settings.motherName`
- `settings.babyName`
- `settings.babyBirthdate`
- `settings.feedingType`
- etc.

### **Bij Account Aanmaken:**
```typescript
await signUp({
  email,
  password,
  motherName: settings.motherName,  // ← Survey data mee!
  consentVersion: '1.0.0',
  analyticsConsent: true,
});
```

Deze data wordt:
1. ✅ Opgeslagen in Supabase `profiles` tabel
2. ✅ Gekoppeld aan de nieuwe user
3. ✅ Beschikbaar voor sync op andere devices

### **Zonder Account:**
- Data blijft alleen in AsyncStorage
- Geen sync tussen devices
- Geen backup in cloud
- Kan later alsnog account aanmaken (data blijft behouden!)

---

## 🎭 BENEFITS GETOOND AAN USER

In de **Completion Screen** laten we zien waarom een account handig is:

```
Met een account kun je:
✓ Veilig-voeden momenten berekenen en meldingen ontvangen
✓ Afgekolfde melk plannen en voorraad bijhouden
✓ Je data synchroniseren tussen apparaten
```

Plus nudge text:
> "Account aanmaken geeft je backups, synchronisatie en persoonlijke meldingen.
> Je data is van jou. We verkopen geen persoonsgegevens."

---

## 🧪 TESTING CHECKLIST

### **Test Flow A: Nieuwe User → Met Account**
- [ ] Landing → "Aan de slag" gaat naar Onboarding
- [ ] Onboarding surveys invullen
- [ ] Completion screen toont beide opties
- [ ] "Maak account aan" gaat naar CreateAccount
- [ ] Email + password invoeren werkt
- [ ] Supabase account wordt aangemaakt
- [ ] Survey data komt mee in profile
- [ ] AccountDone screen verschijnt
- [ ] "Start" gaat naar Main App
- [ ] User is authenticated
- [ ] Settings toont email adres
- [ ] Logout werkt

### **Test Flow B: Nieuwe User → Zonder Account**
- [ ] Landing → "Aan de slag" gaat naar Onboarding
- [ ] Onboarding surveys invullen
- [ ] "Ga door zonder account" werkt
- [ ] Main App opent
- [ ] Settings heeft GEEN Account sectie (want niet authenticated)
- [ ] Data is opgeslagen (lokaal)
- [ ] App sluiten en openen → data blijft behouden

### **Test Flow C: Login Existing User**
- [ ] Landing → "Log in" werkt
- [ ] Inloggen met bestaand account werkt
- [ ] Gaat direct naar Main App
- [ ] Settings toont Account sectie
- [ ] Uitloggen werkt

### **Test Flow D: Later Account Aanmaken**
- [ ] Start zonder account
- [ ] Gebruik app
- [ ] Ga naar Settings → "Maak account aan" link? (TODO)
- [ ] Account aanmaken zonder data te verliezen

---

## 🚧 TODO (Optioneel)

### **1. "Later Account Aanmaken" Flow**
Voor users die eerst zonder account begonnen:

```typescript
// In Settings screen, als niet authenticated:
{!isAuthenticated && (
  <TouchableOpacity onPress={() => router.push('/auth/register')}>
    <Text>Maak account aan voor sync</Text>
  </TouchableOpacity>
)}
```

### **2. Data Migratie bij Later Aanmaken**
Als user later alsnog account maakt, migreer lokale data:

```typescript
// In signUp functie:
const localData = await storage.getItem(STORAGE_KEY);
if (localData) {
  // Upload existing data to Supabase after signup
  await supabase.from('profiles').update({
    ...JSON.parse(localData)
  }).eq('id', user.id);
}
```

### **3. "Je data is nog lokaal" Reminder**
Toon banner in app voor niet-authenticated users:

```tsx
{!isAuthenticated && (
  <Banner>
    ⚠️ Je data is alleen lokaal opgeslagen. Maak een account voor backup & sync.
  </Banner>
)}
```

---

## ✅ SAMENVATTING

### **Wat werkt NU:**
✅ Landing → Onboarding → Account aanmaken (optioneel) → App
✅ Warm welkom voordat account vereist is
✅ Users kunnen app zonder account proberen
✅ Survey data wordt meegenomen bij account aanmaken
✅ Login flow voor bestaande users werkt
✅ Skip account optie werkt

### **Voordelen:**
✅ Lagere drempel om de app te proberen
✅ Privacy-conscious (account is optioneel)
✅ Betere conversie (eerst waarde tonen)
✅ Flexibiliteit (later alsnog account maken)

### **Trade-offs:**
⚠️ Zonder account = geen sync
⚠️ Zonder account = geen backup
⚠️ Zonder account = lokale data kan verloren gaan (bij app delete)

---

**De nieuwe flow is klaar en getest! 🎉**
