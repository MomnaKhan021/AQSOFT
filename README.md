# AQSOFT — aqsoft.tech

Company website for **AQSOFT**: web solutions, custom software, e-commerce, mobile apps, cloud and AI.

A fast, dependency-free static site (HTML + CSS + JS): black cinematic theme, WebGL particle "AI core" hero,
scroll-driven storytelling (AQ POS walkthrough, horizontal solutions, platform layers) and a fully responsive layout.

## Project structure

```
AQSOFT/
├── index.html              # the whole one-page site
├── assets/
│   ├── css/style.css       # all styles (colors live in :root at the top)
│   ├── js/main.js          # 3D world, animations, services ring, menu, contact form
│   ├── js/content.js       # portfolio projects + team (edit this)
│   ├── js/vendor/          # Three.js r128 + bloom, Lenis smooth scroll (bundled, no CDN)
│   └── img/
│       ├── logo.svg            # full logo (mark + wordmark)
│       ├── logo-mark.svg       # icon only (also the favicon)
│       ├── logo-1040.png       # full logo PNG, transparent
│       ├── logo-mark-512.png   # icon PNG, transparent (social profiles, app icon)
│       ├── apple-touch-icon.png
│       └── og-image.png        # preview image when the link is shared
├── CNAME                   # tells GitHub Pages to serve aqsoft.tech
├── robots.txt / sitemap.xml
└── .nojekyll
```

## Adding portfolio projects and team photos

Everything lives in `assets/js/content.js`, with examples inside it.

1. Put project screenshots in `assets/img/projects/` and team photos in `assets/img/team/`
   (JPG or WebP, around 1600px wide for projects and 800px for portraits).
2. Add an entry per project / person in `content.js`.
3. The **Portfolio** and **Team** sections (and the "Work" menu link) appear automatically
   once they have at least one entry.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Get it into your Documents/AQSOFT folder

```bash
cd ~/Documents
git clone https://github.com/MomnaKhan021/AQSOFT.git
```

On Windows, run the same in PowerShell from `C:\Users\<you>\Documents`, or use GitHub Desktop → *Clone repository*.

## Put it live on aqsoft.tech

### Option A: GitHub Pages (free, recommended)

1. GitHub → repo **Settings → Pages** → *Source: Deploy from a branch* → **main** / **(root)** → Save.
   (On a free GitHub plan the repository must be public for Pages.)
2. In the same page, set **Custom domain** to `aqsoft.tech` (the `CNAME` file already does this).
3. At your domain registrar's DNS panel for `aqsoft.tech`, remove any existing parking/forwarding records and add:

   | Type  | Host / Name | Value                       |
   |-------|-------------|-----------------------------|
   | A     | @           | 185.199.108.153             |
   | A     | @           | 185.199.109.153             |
   | A     | @           | 185.199.110.153             |
   | A     | @           | 185.199.111.153             |
   | CNAME | www         | momnakhan021.github.io      |

4. Wait for DNS to propagate (minutes to a few hours), then tick **Enforce HTTPS** in Settings → Pages.

### Option B: Your hosting's cPanel / file manager

Upload everything in this folder (keep the `assets` folder structure) into `public_html`.
The `CNAME` file is only used by GitHub Pages and can be ignored there.

## Before going live: things to update

- **Email**: the site uses `abdullah@aqsoft.tech`. Create that mailbox (or change it in `index.html` and `assets/js/main.js`).
- **Contact form**: currently opens the visitor's email app. For direct form submissions, connect a service like Formspree and point the form at it.
- **Work section**: shows example project types. Replace with real case studies when ready.
- **Brand colors**: edit the variables at the top of `assets/css/style.css`.
