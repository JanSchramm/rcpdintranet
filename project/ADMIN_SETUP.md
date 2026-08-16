# Admin-Menü Konfigurationsanleitung

## 1. **Datenbankänderungen durchführen**

Die folgende Migration wurde erstellt, um das `role` Feld zur `user` Tabelle hinzuzufügen:

```bash
# Migration wird automatisch mit Supabase aktualisiert
# Datei: supabase/migrations/20260817_add_role_to_user.sql
```

Die möglichen Rollen sind:
- `'officer'` - Standard-Benutzer (Standard)
- `'admin'` - Administrator mit vollem Zugriff
- `'supervisor'` - Supervisor mit eingeschränktem Admin-Zugriff

## 2. **Admin-Benutzer manuell erstellen (Datenbankzugriff erforderlich)**

### Option A: Über Supabase Dashboard

1. Gehe zu: https://app.supabase.com
2. Wähle dein Projekt
3. Navigiere zu: SQL Editor
4. Führe diese Abfrage aus:

```sql
-- Admin für einen bestehenden Benutzer setzen (mit seiner User-ID)
UPDATE "user"
SET role = 'admin'
WHERE id = 'USER_ID_HIER';

-- Beispiel:
UPDATE "user"
SET role = 'admin'
WHERE id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
```

5. Oder nach E-Mail suchen (über auth.users):

```sql
-- Admin anhand der E-Mail setzen
UPDATE "user"
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1
);
```

### Option B: Über einen Seed-Datei (empfohlen für Entwicklung)

Erstelle die Datei: `supabase/seed.sql`

```sql
-- Seed-Daten mit Admin-Rollen
INSERT INTO "user" (id, firstname, lastname, rank, role, created_at)
VALUES (
  'YOUR_AUTH_USER_ID',
  'Admin',
  'User',
  'Captain',
  'admin',
  now()
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin', rank = 'Captain';
```

Dann in der CLI ausführen:
```bash
supabase db reset
```

## 3. **Admin-Benutzer über Discord authentifizieren**

1. Melde dich mit Discord an (normale OAuth-Anmeldung)
2. Deine User-ID wird automatisch in der `user` Tabelle gespeichert
3. Bitten Sie einen bestehenden Admin oder Datenbankadministrator, deine Rolle zu `'admin'` zu aktualisieren

## 4. **Wie das Admin-System funktioniert**

### useAdmin Hook

```typescript
import { useAdmin } from '@/hooks/useAdmin';

function MyComponent() {
  const { isAdmin, loading, officer } = useAdmin();

  if (loading) return <div>Laden...</div>;
  if (!isAdmin) return <div>Kein Zugriff</div>;

  return <div>Admin-Inhalte</div>;
}
```

### AdminProtection Komponente

Schützt ganze Seiten vor unbefugtem Zugriff:

```typescript
import AdminProtection from '@/components/AdminProtection';

export default function AdminPage() {
  return (
    <AdminProtection>
      <div>Nur Admins können das sehen</div>
    </AdminProtection>
  );
}
```

## 5. **Admin-Funktionen verfügbar**

Das Admin-Menü bietet folgende Platzhalter-Seiten:

- **Benutzerverwaltung** (`/dashboard/admin/users`)
  - Verwalte Benutzer, Rollen und Berechtigungen
  - Platzhalter für Benutzerliste und Rolle-Verwaltung

- **Systemeinstellungen** (`/dashboard/admin/system`)
  - Konfiguriere globale Einstellungen
  - Wartungsmodus-Toggle

- **Systemprotokolle** (`/dashboard/admin/logs`)
  - Überprüfe Aktivitätslogs
  - Suche und Export-Funktionen

- **Analytics & Berichte** (Platzhalter: `/dashboard/admin/analytics`)
- **Sicherheit** (Platzhalter: `/dashboard/admin/security`)
- **Datenbankverwaltung** (Platzhalter: `/dashboard/admin/database`)

## 6. **Zugriffsschutz**

- ✅ Der Admin-Link wird **nur für Admins** in der Sidebar angezeigt
- ✅ Admin-Seiten sind mit `AdminProtection` geschützt
- ✅ Nicht-Admins werden automatisch zu `/dashboard` umgeleitet
- ✅ Alle Admin-Aktionen sollten protokolliert werden (für Audit-Trail)

## 7. **Rollen erweitern (optional)**

Um weitere Rollen hinzuzufügen:

1. Aktualisiere die Datenbanktypen in `lib/database.types.ts`:
```typescript
role: 'officer' | 'admin' | 'supervisor' | 'deine_rolle';
```

2. Update die Migration:
```sql
ALTER TABLE "user" DROP CONSTRAINT "valid_role";
ALTER TABLE "user" ADD CONSTRAINT "valid_role" 
  CHECK (role IN ('officer', 'admin', 'supervisor', 'deine_rolle'));
```

3. Aktualisiere RLS-Richtlinien nach Bedarf

## 8. **Testing**

Um als verschiedene Benutzer zu testen:

1. Öffne eine Inkognito-Fenster / Private-Fenster
2. Melde dich als verschiedene Discord-Konten an
3. Überprüfe die Sidebar: Admin-Link sollte nur für Admin-Konten sichtbar sein
4. Versuche, auf `/dashboard/admin` direkt zuzugreifen - du solltest umgeleitet werden, wenn nicht admin

## 9. **Sicherheitshinweise**

⚠️ **WICHTIG:**
- Admin-Rollen sollten nur vertrauenswürdigen Personen zugewiesen werden
- Alle Admin-Aktionen sollten protokolliert werden
- Regelmäßige Überprüfung, wer Admin-Zugriff hat
- RLS-Richtlinien sind implementiert (siehe Migration), aber verwende auch serverseitige Validierung
- Sensitive Daten sollten nur von autorisierten Admins zugänglich sein
