# Mommy Milk Bar - Landing Page

Deze folder bevat de landing page voor Mommy Milk Bar op [mommymilkbar.nl](http://mommymilkbar.nl).

## Structuur

```
website/
├── index.html          # Hoofdpagina
├── styles.css          # Styling
├── script.js           # JavaScript functionaliteit
├── assets/
│   └── images/         # Afbeeldingen en iconen
└── README.md           # Deze file
```

## Lokaal testen

Open `index.html` in je browser, of gebruik een lokale server:

```bash
# Met Python
python3 -m http.server 8000

# Met Node.js (npx)
npx serve .

# Met PHP
php -S localhost:8000
```

Bezoek dan http://localhost:8000 in je browser.

## Deployment

Deze website kan gedeployed worden via:

### Optie 1: Vercel (Aanbevolen)
1. Push de code naar GitHub
2. Ga naar [vercel.com](https://vercel.com)
3. Importeer je GitHub repository
4. Stel de root directory in op `website`
5. Deploy!
6. Voeg je custom domain `mommymilkbar.nl` toe in de Vercel settings

### Optie 2: Netlify
1. Push de code naar GitHub
2. Ga naar [netlify.com](https://netlify.com)
3. Importeer je GitHub repository
4. Stel de publish directory in op `website`
5. Deploy!
6. Voeg je custom domain `mommymilkbar.nl` toe in de Netlify settings

### Optie 3: GitHub Pages
1. Push de code naar GitHub
2. Ga naar repository Settings > Pages
3. Selecteer de branch en `/website` als root directory
4. Configureer je custom domain

## App Store Link

Wanneer de app live is op de App Store, update de link in `script.js`:
```javascript
window.location.href = 'https://apps.apple.com/app/your-app-id';
```
