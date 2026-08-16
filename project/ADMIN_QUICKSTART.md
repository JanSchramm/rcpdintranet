# Admin-Menü - Quick Start Guide

## 🎯 Was wurde erstellt?

Ein vollständiges Admin-System mit Zugriffsschutz für deine RCPD-Intranet-Anwendung.

### Neue Dateien & Änderungen:

✅ **Datenbank-Migration**
- `supabase/migrations/20260817_add_role_to_user.sql` - Fügt `role` Feld zur user Tabelle hinzu

✅ **Frontend-Komponenten**
- `hooks/useAdmin.ts` - Hook zum Prüfen der Admin-Rolle
- `components/AdminProtection.tsx` - Schützt Admin-Seiten vor unbefugtem Zugriff
- `components/Sidebar.tsx` - Aktualisiert: Zeigt Admin-Link nur für Admins

✅ **Admin-Seiten**
- `app/dashboard/admin/page.tsx` - Administratorkonsole mit Menü
- `app/dashboard/admin/users/page.tsx` - Benutzerverwaltung (Platzhalter)
- `app/dashboard/admin/system/page.tsx` - Systemeinstellungen (Platzhalter)
- `app/dashboard/admin/logs/page.tsx` - Systemprotokolle (Platzhalter)
- Weitere Seiten-Platzhalter vorbereitet

✅ **Dokumentation**
- `ADMIN_SETUP.md` - Ausführliche Setupanleitung
- `ADMIN_QUICKSTART.md` - Diese Datei

---

## 🚀 Schnelle Einrichtung (3 Schritte)

### Schritt 1: Datenbank aktualisieren
Die Migration wurde bereits erstellt. Um sie anzuwenden:

```bash
# Wenn du Supabase CLI hast:
supabase db reset

# Sonst: Führe die Abfrage im Supabase Dashboard aus
# SQL Editor → Datei: supabase/migrations/20260817_add_role_to_user.sql
```

### Schritt 2: Dich selbst als Admin setzen

Führe diese SQL-Abfrage im **Supabase Dashboard → SQL Editor** aus:

```sql
-- Ersetze 'deine-user-id-hier' mit deiner tatsächlichen User-ID
UPDATE "user" 
SET role = 'admin' 
WHERE id = 'deine-user-id-hier';
```

**Wie findest du deine User-ID?**

Option A: Im Discord mit anmelden und in der Datenbank nachschauen
```sql
SELECT id, firstname, lastname, email FROM "user" LIMIT 10;
```

Option B: Über das Supabase Dashboard → Authentication → Users

### Schritt 3: App neuladen

```bash
# Terminal in der Projekt-Ordner
npm run dev

# Oder falls bereits laufen: Seite neu laden (F5)
```

---

## ✨ Was kannst du jetzt tun?

### Als **ADMIN** 👑

1. **Admin-Link in Sidebar sehen**
   - Nach dem Anmelden in der Sidebar: "Administration → Administratorkonsole"

2. **Administratorkonsole öffnen**
   - Gehe zu: `/dashboard/admin`
   - Sehe folgende Menü-Optionen:
     - Benutzerverwaltung
     - Systemeinstellungen
     - Systemprotokolle
     - Analytik & Berichte
     - Sicherheit
     - Datenbankverwaltung

3. **Admin-Seiten anschauen**
   - Jede Seite ist mit Platzhaltern gefüllt
   - Bereit für weitere Entwicklung

### Als **regulärer Officer** 👮

1. **Admin-Link ist unsichtbar**
   - Sidebar zeigt nur normale Navigation

2. **Zugriff auf Admin-Seiten blockiert**
   - Versuch auf `/dashboard/admin` zuzugreifen → Umleitung zu `/dashboard`
   - Schöne Fehlermeldung wird angezeigt

---

## 🔐 Sicherheitsfeatures

✅ **Rollenbasierter Zugriff (RBAC)**
- Nur Admins sehen Admin-Links
- Nur Admins können Admin-Seiten öffnen

✅ **Zugriffsschutz**
- AdminProtection-Komponente schützt alle Admin-Seiten
- Automatische Umleitung bei unbefugtem Zugriff

✅ **Datenbank-RLS (Row Level Security)**
- RLS-Richtlinien implementiert
- Admins können alle Benutzer sehen/aktualisieren
- Officers können nur ihre eigenen Daten sehen

✅ **Audit-Trail**
- Alle Admin-Aktionen sollten protokolliert werden (bereit für Implementierung)

---

## 📝 Code-Beispiele

### Admin prüfen (im Code)

```typescript
import { useAdmin } from '@/hooks/useAdmin';

export default function MyComponent() {
  const { isAdmin, loading, officer } = useAdmin();

  if (loading) return <p>Laden...</p>;
  if (!isAdmin) return <p>Nur für Admins verfügbar</p>;

  return <div>Admin-Inhalte</div>;
}
```

### Ganze Seite schützen

```typescript
import AdminProtection from '@/components/AdminProtection';

export default function AdminOnlyPage() {
  return (
    <AdminProtection>
      <div>Diese Seite ist nur für Admins zugänglich</div>
    </AdminProtection>
  );
}
```

---

## 🛠️ Nächste Schritte (optional)

### 1. **Weitere Admin-Seiten ausfüllen**
   - `app/dashboard/admin/users/page.tsx` → Benutzerliste implementieren
   - `app/dashboard/admin/logs/page.tsx` → Echte Log-Daten anzeigen
   - etc.

### 2. **Admin-Aktionen implementieren**
   - Benutzerrolle ändern
   - Benutzer löschen / deaktivieren
   - Systemeinstellungen ändern

### 3. **Audit-Trail hinzufügen**
   - Erstelle `admin_logs` Tabelle
   - Protokolliere alle Admin-Aktionen
   - Zeige Logs in der Logs-Seite an

### 4. **Weitere Rollen hinzufügen**
   - `'supervisor'` für eingeschränkte Admin-Rechte
   - `'officer'` für reguläre Benutzer
   - etc.

### 5. **Zwei-Faktor-Authentifizierung**
   - Erhöhte Sicherheit für Admin-Zugriff
   - 2FA beim Admin-Login erzwingen

---

## 🐛 Troubleshooting

**Problem: "Admin-Link ist nicht sichtbar"**
- Stelle sicher, dass deine `role` auf `'admin'` gesetzt ist
- App neu laden (F5 / Ctrl+R)
- Browser-Cache löschen falls nötig

**Problem: "Umleitung zu Dashboard wenn ich /admin öffne"**
- Das ist das beabsichtigte Verhalten für Non-Admins
- Stelle sicher, dass du als Admin angemeldet bist
- Überprüfe die Rolle in der Datenbank: `SELECT * FROM "user" WHERE id = 'deine-id';`

**Problem: "Migration wird nicht angewendet"**
- Stelle sicher, dass du `supabase db reset` läufst
- Oder führe die Migration manuell im SQL Editor aus
- Überprüfe, ob die `role` Spalte in der `user` Tabelle existiert

---

## 📚 Weitere Ressourcen

- **Ausführliche Anleitung:** Siehe `ADMIN_SETUP.md`
- **Database Types:** `lib/database.types.ts`
- **Admin-Seitenstruktur:** `app/dashboard/admin/`
- **Components:** `components/AdminProtection.tsx`, `hooks/useAdmin.ts`

---

## ✅ Checkliste für erste Schritte

- [ ] Migration in Supabase ausgeführt
- [ ] Deine User-ID in Datenbank gefunden
- [ ] Rolle auf 'admin' aktualisiert
- [ ] App neu geladen
- [ ] Admin-Link in Sidebar sichtbar
- [ ] Administratorkonsole geöffnet
- [ ] Admin-Seiten durchschaut

Viel Erfolg! 🚀
