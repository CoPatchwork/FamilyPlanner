# Family Planner – P0

## 1. Datenbank einrichten (einmalig)

1. Gehe in dein Supabase-Projekt → **SQL Editor**.
2. Öffne die Datei `supabase/migrations/0001_p0_schema.sql` aus diesem Ordner,
   kopiere den kompletten Inhalt und führe ihn im SQL Editor aus ("Run").
3. Gehe zu **Authentication → URL Configuration** und trage bei
   "Redirect URLs" `http://localhost:3000/auth/callback` ein
   (später zusätzlich eure echte Domain, sobald ihr deployed).
4. Gehe zu **Authentication → Providers → Email** und stelle sicher, dass
   "Enable Email provider" aktiv ist (Magic Link nutzt diesen Provider,
   kein separates Passwort nötig).

## 2. Projekt lokal starten

Voraussetzung: [Node.js](https://nodejs.org) (Version 18 oder neuer) ist auf
deinem Rechner installiert.

```bash
cd family-planner
npm install
npm run dev
```

Öffne danach `http://localhost:3000` im Browser.

Die Datei `.env.local` enthält bereits eure Supabase-URL und den Publishable
Key – die ist schon fertig ausgefüllt, nichts weiter nötig.

## 3. Erster Test

1. Mit deiner E-Mail-Adresse einloggen (Magic Link kommt per Mail).
2. Beim ersten Login: "Neuen Familien-Haushalt erstellen" wählen.
3. Auf dem Dashboard auf "Partner einladen" klicken → Code generieren.
4. Der Partner/die Partnerin öffnet die App (Inkognito-Fenster oder anderes
   Gerät), loggt sich mit eigener E-Mail ein und gibt beim Onboarding den
   Code ein.
5. Unter "Familienprofile verwalten" können jetzt beide Kinder und weitere
   Details hinzufügen.

## Bekannte Lücken in diesem P0-Stand

- Die 4 Quick-Action-Buttons auf dem Dashboard führen zu Platzhaltern
  (Kalender, Einkaufsliste, Rezepte, Family Dates kommen in P1/P2).
- Es gibt noch keine App-Icons (`/public/icon-192.png`, `/public/icon-512.png`)
  – die PWA-Installation funktioniert, zeigt aber ein Standard-Icon.
- Kein automatisiertes Test-Setup bisher.
