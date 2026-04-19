# Deploy-Strategie: teil3.clawbuis.com & teil4.clawbuis.com

## Ziel
Beide Lernapps (Teil III + Teil IV) laufen unter der bestehenden `clawbuis.com`,
aber als **eigene Subdomains**:

- `teil3.clawbuis.com` → dieses Projekt
- `teil4.clawbuis.com` → bestehendes Teil-IV-Projekt

**Wichtig:** Das kostet dich **0 € extra**. Vercel Hobby erlaubt unbegrenzt viele Projekte.
Pro-Plan wird pro User abgerechnet, nicht pro Projekt. Du musst NICHTS migrieren.

---

## Schritt-für-Schritt (zu tun wenn du deployen willst)

### 1. Neues Vercel-Projekt für Teil III

In Vercel Dashboard → **Add New → Project**:
- Repository: dein Teil-III Git-Repo (wenn noch keins: erst `git init` + GitHub-Push)
- Framework: Next.js (auto-erkannt)
- Root Directory: `./`
- Build Command: default
- Environment Variables: **alle 6 `NEXT_PUBLIC_FIREBASE_*`** Keys aus `.env.local` eintragen
  (zusätzlich `NEXT_PUBLIC_APP_NAMESPACE=teil3`)

### 2. Custom Domain hinzufügen

Im neuen Projekt → **Settings → Domains**:
- `teil3.clawbuis.com` eintragen
- Vercel zeigt dir einen DNS-CNAME-Eintrag (sowas wie `cname.vercel-dns.com`)

### 3. DNS-Eintrag bei deinem Domain-Provider setzen

Wo auch immer `clawbuis.com` gehostet wird (Cloudflare, Hetzner, Namecheap, …):
```
Type:  CNAME
Name:  teil3
Value: cname.vercel-dns.com
TTL:   Auto / 3600
```

Warte 2-10 Minuten auf Propagation. Vercel macht SSL-Zertifikat automatisch.

### 4. Gleiches für Teil IV (falls noch nicht)

Falls `teil4.clawbuis.com` noch nicht existiert: im Teil-IV-Vercel-Projekt dieselben
Schritte wiederholen, nur mit `teil4` statt `teil3`.

### 5. Firebase Auth-Domain freigeben

Wichtig für Google-Login: beide Subdomains in Firebase Console whitelisten.

Firebase Console → Project `meister-tischler-lernapp` → **Authentication → Settings → Authorized domains**:
- `teil3.clawbuis.com` hinzufügen
- `teil4.clawbuis.com` hinzufügen

Sonst zeigt Google-Login den Fehler `auth/unauthorized-domain`.

---

## Warum nicht Monorepo?

Ein Monorepo mit `apps/teil3`, `apps/teil4` und Vercel-Rewrites wäre technisch
eleganter — aber:

- **Kostet dich 2-3 Tage Arbeit** (Config, Turborepo-Setup, gemeinsame Packages)
- **Kein Preisvorteil** (Hobby-Plan ist schon kostenlos)
- **Deployment-Kopplung**: ein Fehler in Teil III kann Teil IV-Deploy blockieren

Der Subdomain-Weg ist also: **schneller, sicherer, gleiche Kosten**.

**Wechsel auf Monorepo lohnt erst**, wenn:
- Du 3+ Apps hast und 80% Code-Sharing brauchst
- Ein Team mit mehreren Entwicklern daran arbeitet

Solange du solo bist: **zwei getrennte Vercel-Projekte**.

---

## Firestore-Datentrennung

Beide Apps nutzen dasselbe Firebase-Projekt `meister-tischler-lernapp`,
aber **getrennte Firestore-Collections** via `NEXT_PUBLIC_APP_NAMESPACE`:

- Teil III schreibt nach `users-teil3/{uid}`
- Teil IV schreibt nach `users-teil4/{uid}` (bzw. wie dort konfiguriert)

User kann sich mit **demselben Google-Account** in beide Apps einloggen — der Progress
bleibt aber pro App getrennt. Das ist genau was wir wollen.

---

## Spätere Option: Single-Sign-On Hub

Wenn du irgendwann willst dass User auf `clawbuis.com` einen einzigen Login machen
und dann per Magic-Link in Teil III und Teil IV eingeloggt sind:
- **Firebase Auth** kann das mit `signInWithCustomToken` von einer Parent-App aus
- Kommt später — jetzt nicht nötig

---

## Checkliste vor First-Deploy

- [ ] `.env.local` ist lokal gefüllt und läuft
- [ ] `npm run build` lokal grün
- [ ] Git-Repo initialisiert + auf GitHub gepusht
- [ ] Vercel-Projekt verbunden
- [ ] Environment Variables in Vercel eingetragen (alle 7)
- [ ] Custom Domain `teil3.clawbuis.com` hinzugefügt
- [ ] CNAME-Eintrag im DNS-Provider gesetzt
- [ ] Firebase Auth-Domain whitelist erweitert
- [ ] Test: Google-Login funktioniert auf `https://teil3.clawbuis.com`
