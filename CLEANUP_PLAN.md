# Könyvtár tisztítás – mi kell, mi felesleges

## ✅ TARTANI (működő verzióhoz kell)

- **package.json**, **package-lock.json** – függőségek
- **vite.config.js**, **tailwind.config.cjs**, **postcss.config.cjs** – build
- **index.html** – SPA entry
- **src/** – React frontend (App, components, services, hooks, utils)
- **server/** – Express backend (index.js, database, services, transformers, config)
  - kivéve: `server/services/syncService.js.backup` → TÖRÖLNI
- **public/** – csak vite.svg (api.php nem kell, ha Node-ot használsz)
- **dist/** – build kimenet (index.html, assets); api.php → TÖRÖLNI ha nem PHP
- **.gitignore**, **.env.example** – konfig
- **README.md** – fő dokumentáció
- **Procfile**, **railway.json**, **.nixpacks.yml** – Railway deploy
- **git-push-changes.ps1** – push script
- **deployment/scripts/** – ha használod (deploy:check, deploy:live stb.); deployment/config, deployment/*.md → opcionális

## ❌ TÖRÖLNI (felesleges / régi)

- **api/** – régi Vercel serverless API; a backend a **server/index.js** (Railway)
- **vercel.json** – ha csak Railway-t használsz
- **server/services/syncService.js.backup** – backup
- **dist/api.php**, **public/api.php** – ha nincs PHP backend
- **debug.html** – debug fájl
- **category-report.txt** – egykori report
- **Root scripts/** – list-all-categories.js, list-categories.js, show-categories.js, debug-xml.js, test-frontend-api.js (a kategórialista: server/scripts/list-main-categories.js); **scripts/test-db.js** → TARTANI (npm run test:db)
- **test-backend.ps1**, **test-unas-api.ps1**, **test-unas-products.ps1**, **test-unas-simple.ps1** – régi PowerShell tesztek
- **Többlet .md dokumentumok** – csak README.md kell; a többi (BATCH_SYNC_PLAN, CODE_FIXES_SUMMARY, DATABASE_*.md, DEPLOYMENT_GUIDE, DEVELOPMENT*.md, EPIC_*, FRONTEND_*, IMPLEMENTATION_*, IMPROVEMENTS_*, POWERSHELL_*, PUSH_*, QUICK_*, RAILWAY_*, README_ULTIMATE, READY_*, RUNNING, SESSION_*, SETUP-*, TESTING*, TODO_*, ULTIMATE_*, UNAS_*, UX_*, VERCEL_*, XML_*) → egy README + opcionális egy QUICKSTART/DEPLOY összevonva

## ⚠️ OPCIONÁLIS

- **sample-products.csv** – törölhető, vagy megtartod tesztre
- **.env.deployment** – törölhető, ha nincs használatban
- **deployment/** – megtartható csak a használt scriptek; a deployment/*.md-ek törölhetők
- **scripts/check-db.js** – ha nem használod, törölhető

---

**✅ Tisztítás végrehajtva.** A fenti TÖRÖLNI lista alapján törölve lett:
- api/ (összes fájl), vercel.json, syncService.js.backup, api.php-k, debug.html, category-report.txt
- Root scripts/ (list-*, show-*, debug-xml, test-frontend-api, check-db) – megtartva: scripts/test-db.js (npm run test:db)
- test-*.ps1 (4 db), valamint a felesleges .md dokumentumok (~40 db)
- deployment/*.md (a deployment/scripts/ és config/ megmaradt)

**Megtartva:** README.md, CLEANUP_PLAN.md, package.json, server/, src/, dist/, public/, deployment/scripts+config, git-push-changes.ps1, .env.example, build konfigok, Procfile, railway.json.
