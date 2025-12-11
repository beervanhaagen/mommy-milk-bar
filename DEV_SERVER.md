# 🚀 Development Server Setup

## Tunnel Mode (Werkt overal - geen Wi‑Fi nodig!)

Gebruik tunnel mode om de app te testen vanaf elke locatie, zonder dat je Mac en iPhone op hetzelfde Wi‑Fi hoeven te zitten.

### Quick Start (Aanbevolen - Simpel)

```bash
npm run start:tunnel
```

Dit start Expo in tunnel mode en **Expo toont automatisch een QR code** in de terminal. Gewoon scannen met Expo Go!

### Achtergrond Mode (Blijft draaien)

Als je de server in de achtergrond wilt laten draaien:

```bash
npm run start:tunnel:bg
```

Dit script:
- ✅ Start Expo in tunnel mode
- ✅ Probeert automatisch QR code te genereren
- ✅ Blijft draaien in de achtergrond
- ✅ Herstart automatisch als de server crasht

### Handmatig starten

Als je meer controle wilt:

```bash
# Start tunnel mode
npm run tunnel

# In een andere terminal, wacht tot je de tunnel URL ziet, dan:
EXPO_TUNNEL_URL="exp://u.expo.dev/..." npm run qr:tunnel
```

### Server stoppen

```bash
pkill -f "expo start"
```

## Local Wi‑Fi Mode (Sneller, maar alleen opzelfde Wi‑Fi)

Als je Mac en iPhone op hetzelfde Wi‑Fi zitten, is local mode sneller:

```bash
npm run start:qr
```

## Troubleshooting

### Tunnel URL niet gevonden?

1. Check de logs: `tail -f expo-tunnel.log`
2. Zoek naar een regel met `exp://` of `https://exp.host`
3. Kopieer de URL en run:
   ```bash
   EXPO_TUNNEL_URL="exp://..." npm run qr:tunnel
   ```

### Server stopt steeds?

Het `start-tunnel.sh` script monitort de server en herstart automatisch. Als het niet werkt:
- Check of je `nohup` hebt geïnstalleerd
- Check de logs: `cat expo-tunnel.log`
- Start handmatig: `npx expo start --tunnel`

### QR code werkt niet?

- Zorg dat Expo Go app is geïnstalleerd op je iPhone
- Scan de QR code met de camera app (niet met Expo Go direct)
- Of open Expo Go → "Scan QR Code"

## Logs bekijken

```bash
# Live logs
tail -f expo-tunnel.log

# Laatste 50 regels
tail -n 50 expo-tunnel.log
```

## Tips

- **Tunnel mode is langzamer** dan local mode (maar werkt overal)
- **Local mode is sneller** maar vereist hetzelfde Wi‑Fi
- De server blijft draaien in de achtergrond, zelfs als je de terminal sluit
- Gebruik `pkill -f "expo start"` om alle Expo processen te stoppen

