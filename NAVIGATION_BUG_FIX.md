# Navigation Bug Fix - Analyse & Oplossing

## Het Probleem

### Symptomen:
1. Na het loggen van een drankje (als ingelogde gebruiker) wordt je soms doorgestuurd naar het "Goed gedaan!" scherm (completion.tsx)
2. Dit scherm heeft opties "Maak account aan" en "Ga door zonder account"
3. Als je op "Ga door zonder account" klikt, kom je wel in de app maar mogelijk zonder correcte account koppeling
4. Als je dan op "Account verwijderen" klikt krijg je de database error

### Root Cause Analyse:

**Bug 1: Verkeerde navigatie na drink loggen**
- Locatie: [app/(tabs)/drinks.tsx:104](app/(tabs)/drinks.tsx#L104)
- Code: `router.push('/')`
- Probleem: Na het loggen van een drink navigeert de app naar `'/'` (root index)
- Dit triggert de routing logic in app/index.tsx die checkt of onboarding compleet is
- Als er een state inconsistentie is, kan dit leiden tot redirect naar completion scherm

**Bug 2: Completion scherm toegankelijk voor ingelogde gebruikers**
- Locatie: app/index.tsx:48-50
- De index route checkt: `if (isAuthenticated && !hasCompletedOnboarding)` → redirect to completion
- Maar completion.tsx heeft optie "Ga door zonder account" die niet logisch is voor al ingelogde gebruikers
- Completion.tsx is bedoeld voor NIEUWE accounts, niet voor bestaande ingelogde gebruikers

**Bug 3: Delete account zonder auth check**
- Locatie: [app/settings.tsx](app/settings.tsx)
- De delete account functie probeert te verwijderen zonder te checken of gebruiker wel ingelogd is
- Dit veroorzaakt de database error die we net gefixed hebben

## De Fixes

### Fix 1: Navigeer direct naar home na drink loggen ✅

**File:** app/(tabs)/drinks.tsx:104

**WAS:**
```typescript
setTimeout(() => {
  setShowSuccess(false);
  router.push('/');  // ❌ Gaat via index routing logic
}, 2500);
```

**WORDT:**
```typescript
setTimeout(() => {
  setShowSuccess(false);
  router.push('/(tabs)');  // ✅ Direct naar home tab
}, 2500);
```

**Waarom:** Direct naar de tabs navigeren vermijdt de routing logic in index.tsx die kan leiden tot verkeerde redirects.

### Fix 2: Prevent completion screen voor ingelogde users ✅

**File:** app/onboarding/completion.tsx

**Voeg toe aan het begin van het component:**
```typescript
import { useAuth } from '../../src/contexts/AuthContext';

export default function Completion() {
  const router = useRouter();
  const { updateSettings } = useStore();
  const { isAuthenticated } = useAuth(); // Add this

  // Redirect authenticated users away from this screen
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  // ... rest of component
}
```

**Waarom:** Ingelogde gebruikers horen niet op dit scherm te komen. Het is alleen voor nieuwe accounts/guest mode.

### Fix 3: Verbeter delete account check ✅

**File:** app/settings.tsx:54-112

**Voeg betere auth check toe:**
```typescript
const handleDeleteAccount = () => {
  // Check if user is actually authenticated
  if (!isAuthenticated || !user) {
    Alert.alert(
      'Niet ingelogd',
      'Je bent niet ingelogd. Log eerst in om je account te verwijderen.',
      [{ text: 'OK' }]
    );
    return;
  }

  Alert.alert(
    'Account verwijderen',
    'Weet je zeker dat je je account wilt verwijderen? Dit kan niet ongedaan worden gemaakt en al je data wordt permanent verwijderd.',
    [
      { text: 'Annuleren', style: 'cancel' },
      {
        text: 'Verwijderen',
        style: 'destructive',
        onPress: async () => {
          // ... existing delete logic
        }
      }
    ]
  );
};
```

**Waarom:** Voorkomt dat niet-ingelogde gebruikers proberen account te verwijderen, wat tot database errors leidt.

## Extra Aanbeveling

### Verbeter index.tsx routing logic

**File:** app/index.tsx:48-50

**Overweeg om te checken:**
```typescript
// If authenticated but onboarding not complete, continue onboarding
if (isAuthenticated && !hasCompletedOnboarding) {
  // Maybe redirect to a different screen or handle this edge case
  // Current: redirects to completion which is confusing for logged in users
  return <Redirect href="/onboarding/completion" />;
}
```

Mogelijk is het beter om:
1. Ingelogde gebruikers met incomplete onboarding door te sturen naar een specifiek "complete je profiel" scherm
2. Of: direct naar de app sturen en later vragen om profiel aan te vullen

## Testing Checklist

Na deze fixes testen:

- [ ] Log in als bestaande gebruiker
- [ ] Ga naar drinks tab
- [ ] Log een drankje
- [ ] Verify: Je komt direct terug op home tab (niet via completion scherm)
- [ ] Ga naar profile/settings
- [ ] Klik op "Account verwijderen"
- [ ] Verify: Account wordt correct verwijderd
- [ ] Test guest mode flow: Ga door zonder account vanaf completion
- [ ] Verify: Guest gebruikers kunnen NIET op "Account verwijderen" klikken
- [ ] Test: Log opnieuw in na guest mode
- [ ] Verify: Geen conflicten met vorige guest data

## Impact

✅ **Fix 1**: Voorkomt verkeerde navigatie na drink loggen
✅ **Fix 2**: Voorkomt toegang tot completion scherm voor ingelogde users
✅ **Fix 3**: Voorkomt database errors bij delete zonder auth
✅ **Overall**: Betere user experience en minder verwarrende flows

## Files to Modify

1. [app/(tabs)/drinks.tsx](app/(tabs)/drinks.tsx) - line 104
2. [app/onboarding/completion.tsx](app/onboarding/completion.tsx) - add useEffect check
3. [app/settings.tsx](app/settings.tsx) - improve handleDeleteAccount
4. (Optional) [app/index.tsx](app/index.tsx) - improve routing logic
