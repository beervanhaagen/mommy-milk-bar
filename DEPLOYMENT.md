# Deployment Instructies voor mommymilkbar.nl

## Stap 1: Push naar GitHub

Als je repository nog niet op GitHub staat:

```bash
# Voeg alle bestanden toe
git add .

# Maak een commit
git commit -m "Add landing page for mommymilkbar.nl"

# Push naar GitHub
git push origin main
```

Als je nog geen remote repository hebt:

```bash
# Maak een nieuwe repository op GitHub (via github.com)
# Dan voeg je de remote toe:
git remote add origin https://github.com/JOUW-USERNAME/mommy-milk-bar.git
git push -u origin main
```

## Stap 2: Deploy via Vercel (Aanbevolen)

### Waarom Vercel?
- Gratis voor persoonlijke projecten
- Automatische HTTPS
- Snelle deployments
- Gemakkelijke custom domain configuratie
- Automatische deployments bij elke push naar GitHub

### Stappen:

1. **Maak een Vercel account**
   - Ga naar [vercel.com](https://vercel.com)
   - Klik op "Sign Up"
   - Kies "Continue with GitHub" om je GitHub account te koppelen

2. **Importeer je repository**
   - Klik op "Add New..." > "Project"
   - Zoek je `mommy-milk-bar` repository
   - Klik op "Import"

3. **Configureer het project**
   - **Project Name**: `mommy-milk-bar`
   - **Framework Preset**: Selecteer "Other"
   - **Root Directory**: Klik op "Edit" en selecteer `website`
   - Laat Build Command leeg
   - Laat Output Directory op `.` staan
   - Klik op "Deploy"

4. **Voeg je custom domain toe**
   - Wacht tot de eerste deployment klaar is
   - Ga naar Project Settings > Domains
   - Voeg `mommymilkbar.nl` toe
   - Vercel geeft je DNS instructies

5. **Configureer DNS bij je domain provider**
   - Log in bij de provider waar je `mommymilkbar.nl` hebt gekocht
   - Voeg de volgende DNS records toe:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21

     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```
   - Of gebruik de specifieke instructies die Vercel geeft

6. **Klaar!**
   - Wacht 10-15 minuten tot DNS propagatie klaar is
   - Bezoek http://mommymilkbar.nl
   - Elke keer dat je naar GitHub pusht, wordt de site automatisch bijgewerkt!

## Alternatief: Deploy via Netlify

1. **Maak een Netlify account**
   - Ga naar [netlify.com](https://netlify.com)
   - Klik op "Sign Up" en kies "GitHub"

2. **Importeer je repository**
   - Klik op "Add new site" > "Import an existing project"
   - Kies "GitHub"
   - Selecteer je `mommy-milk-bar` repository

3. **Configureer build settings**
   - **Base directory**: `website`
   - **Build command**: (laat leeg)
   - **Publish directory**: `website`
   - Klik op "Deploy site"

4. **Voeg custom domain toe**
   - Ga naar Site settings > Domain management
   - Klik op "Add custom domain"
   - Voer `mommymilkbar.nl` in
   - Volg de DNS instructies

## Alternatief: GitHub Pages

1. **Enable GitHub Pages**
   - Ga naar je repository op GitHub
   - Klik op "Settings" > "Pages"
   - Bij "Source", selecteer de `main` branch
   - Bij "folder", selecteer `/website`
   - Klik op "Save"

2. **Voeg custom domain toe**
   - In dezelfde Pages settings, voer `mommymilkbar.nl` in bij "Custom domain"
   - Klik op "Save"

3. **Configureer DNS**
   - Voeg de volgende records toe bij je domain provider:
     ```
     Type: A
     Name: @
     Value: 185.199.108.153

     Type: A
     Name: @
     Value: 185.199.109.153

     Type: A
     Name: @
     Value: 185.199.110.153

     Type: A
     Name: @
     Value: 185.199.111.153

     Type: CNAME
     Name: www
     Value: JOUW-USERNAME.github.io
     ```

## Lokaal testen voor deployment

Voordat je deployt, test lokaal:

```bash
cd website
python3 -m http.server 8000
```

Bezoek dan http://localhost:8000

## Na deployment

### App Store link updaten

Wanneer je app live is op de App Store:

1. Open `website/script.js`
2. Zoek deze regel:
   ```javascript
   // window.location.href = 'https://apps.apple.com/app/your-app-id';
   ```
3. Verwijder de `//` en vervang `your-app-id` met je echte App Store ID
4. Commit en push naar GitHub - de site wordt automatisch bijgewerkt!

### Email configureren

Als je emails wilt ontvangen op `info@mommymilkbar.nl`, configureer email forwarding bij je domain provider.

## Troubleshooting

### Website niet zichtbaar na deployment
- Wacht 10-15 minuten voor DNS propagatie
- Check DNS instellingen met [whatsmydns.net](https://www.whatsmydns.net)

### Afbeeldingen niet zichtbaar
- Check of de `assets/images` folder correct is gekopieerd
- Check of de paden in `index.html` kloppen

### Custom domain werkt niet
- Controleer of de DNS records correct zijn ingesteld
- Wacht minimaal 15 minuten, soms kan het tot 48 uur duren

## Support

Bij vragen of problemen, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
