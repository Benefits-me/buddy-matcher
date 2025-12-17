# Buddy Matcher - Mitarbeiter Matching Tool

Ein einfaches Browser-basiertes Tool zum automatischen Erstellen von Buddy-Matches zwischen Mitarbeitern aus verschiedenen Abteilungen.

## 🎯 Zweck

Das Buddy Matcher Tool hilft dabei, Mitarbeiter aus verschiedenen Abteilungen miteinander zu vernetzen, indem es automatisch Buddy-Paare erstellt. Jeder Mitarbeiter wird mit einem Kollegen aus einer anderen Abteilung gematcht.

## 🚀 Verwendung

### Zugriff auf das Tool

Das Tool kann über folgende URL aufgerufen werden:
```
http://localhost:8080/buddy-matcher.html
```

Oder wenn der Server läuft:
```
https://your-domain.com/buddy-matcher.html
```

### Schritt-für-Schritt Anleitung

1. **Öffnen Sie die Buddy Matcher Seite** in Ihrem Browser
2. **Bereiten Sie eine JSON-Datei** mit Ihren Mitarbeiterdaten vor (siehe Format unten)
3. **Laden Sie die JSON-Datei hoch**:
   - Klicken Sie auf "Datei auswählen" oder
   - Ziehen Sie die Datei per Drag & Drop in den Upload-Bereich
4. **Sehen Sie sich die Ergebnisse an**:
   - Statistiken über Mitarbeiter, Abteilungen und Matches
   - Liste aller Buddy-Paare
5. **Laden Sie die Ergebnisse herunter** als JSON-Datei für weitere Verwendung
6. **Wiederholen Sie den Vorgang** mit einer neuen Datei, falls gewünscht

## 📋 JSON-Format

Die Input-JSON-Datei muss folgende Struktur haben:

```json
{
  "C-Level": {
    "Clara Müller": { "email": "clara.mueller@benefits.me", "departments": ["IT", "Marketing"] },
    "Tom CEO": { "email": "tom.ceo@benefits.me", "departments": ["Sales", "Finance"] }
  },
  "IT": [
    { "name": "Max Mustermann", "email": "max.mustermann@benefits.me" },
    { "name": "Anna Schmidt", "email": "anna.schmidt@benefits.me" },
    { "name": "Peter Wagner", "email": "peter.wagner@benefits.me" }
  ],
  "Marketing": [
    { "name": "Lisa Müller", "email": "lisa.mueller@benefits.me" },
    { "name": "Tom Weber", "email": "tom.weber@benefits.me" },
    { "name": "Sophie Klein", "email": "sophie.klein@benefits.me" }
  ],
  "Sales": [
    { "name": "Sarah Klein", "email": "sarah.klein@benefits.me" },
    { "name": "Michael Becker", "email": "michael.becker@benefits.me" }
  ],
  "Human Resources": [
    { "name": "Julia Hoffmann", "email": "julia.hoffmann@benefits.me" },
    { "name": "David Richter", "email": "david.richter@benefits.me" }
  ],
  "Finance": [
    { "name": "Maria Fischer", "email": "maria.fischer@benefits.me" }
  ]
}
```

### Anforderungen

- **C-Level**: Optionaler Block mit C-Level-Manager:innen. Jeder Eintrag enthält Name, E-Mail und eine Liste der zugehörigen Abteilungen.
- **Struktur**: Ein Objekt mit Abteilungsnamen als Schlüssel
- **Mitarbeiter**: Jede Abteilung enthält ein Array von Mitarbeiter-Objekten
- **Pflichtfeld**: `name` ist erforderlich
- **Optional**: `email` und weitere Felder können hinzugefügt werden
- **Minimum**: Mindestens 2 Abteilungen erforderlich

### Beispieldatei

Eine Beispieldatei ist verfügbar unter:
```
public/sample-employees.json
```

## 📑 CSV-Format

Die Ergebnisse können auch als CSV-Datei heruntergeladen werden. Das Format ist wie folgt (Trennzeichen: Semikolon):

| Name 1         | E-Mail 1                  | Abteilung 1      | Name 2         | E-Mail 2                  | Abteilung 2      |
|--------------- |--------------------------|------------------|----------------|---------------------------|------------------|
| Max Mustermann | max.mustermann@...       | IT               | Lisa Müller    | lisa.mueller@...          | Marketing        |
| ...            | ...                      | ...              | ...            | ...                       | ...              |

- Jede Zeile entspricht einem Match.
- Ist kein Buddy vorhanden, bleiben die Felder von Person 2 leer.
- Auch C-Level-Manager:innen werden mit Name, E-Mail und "C-Level" als Abteilung exportiert, sofern sie ein Match haben.

## 🔧 Matching-Algorithmus

Der Algorithmus funktioniert wie folgt:

1. **Randomisierung**: Alle Mitarbeiter werden zufällig gemischt
2. **Paarung**: Jeder Mitarbeiter wird mit einem Kollegen aus einer anderen Abteilung gepaart
3. **Optimierung**: Der Algorithmus versucht, möglichst viele erfolgreiche Matches zu erstellen
4. **Verbleibende**: Falls kein Match möglich ist (z.B. zu viele Mitarbeiter aus einer Abteilung), werden diese als "Ohne Buddy" markiert

## 📊 Output-Format

Die heruntergeladene JSON-Datei enthält ein Array von Match-Objekten:

```json
[
  {
    "employee1": {
      "name": "Max Mustermann",
      "email": "max@example.com",
      "department": "IT"
    },
    "employee2": {
      "name": "Lisa Müller",
      "email": "lisa@example.com",
      "department": "Marketing"
    }
  },
  {
    "employee1": {
      "name": "Anna Schmidt",
      "email": "anna@example.com",
      "department": "IT"
    },
    "employee2": null
  }
]
```

### Match-Objekt

- `employee1`: Der erste Mitarbeiter im Buddy-Paar
- `employee2`: Der zweite Mitarbeiter im Buddy-Paar (oder `null` wenn kein Match gefunden)
- Jedes Mitarbeiter-Objekt enthält:
  - `name`: Name des Mitarbeiters
  - `email`: E-Mail-Adresse (falls vorhanden)
  - `department`: Abteilungsname

## ✨ Features

- ✅ **Browser-basiert**: Keine Installation erforderlich, läuft komplett im Browser
- ✅ **Drag & Drop**: Einfaches Hochladen von Dateien per Drag & Drop
- ✅ **Echtzeit-Verarbeitung**: Sofortige Ergebnisse nach dem Upload
- ✅ **Statistiken**: Übersichtliche Anzeige von Kennzahlen
- ✅ **Export**: Download der Ergebnisse als JSON-Datei
- ✅ **Responsive Design**: Funktioniert auf Desktop und Mobile
- ✅ **Fehlerbehandlung**: Klare Fehlermeldungen bei ungültigen Daten
- ✅ **Datenschutz**: Alle Daten bleiben im Browser, keine Server-Übertragung

## 🔒 Datenschutz

Das Buddy Matcher Tool:
- Verarbeitet alle Daten **ausschließlich im Browser**
- Sendet **keine Daten an externe Server**
- Speichert **keine Daten persistent**
- Ist vollständig **DSGVO-konform**

## 🛠️ Technische Details

- **Technologie**: Pure HTML, CSS, JavaScript (keine Frameworks)
- **Browser-Kompatibilität**: Moderne Browser (Chrome, Firefox, Safari, Edge)
- **Dateigröße**: < 20 KB (sehr schnell)
- **Abhängigkeiten**: Keine externen Bibliotheken

## 📝 Beispiel-Workflow

1. HR exportiert Mitarbeiterliste aus dem System
2. Konvertiert die Daten in das JSON-Format (falls nötig)
3. Öffnet den Buddy Matcher
4. Lädt die JSON-Datei hoch
5. Überprüft die Matches
6. Lädt die Ergebnisse herunter
7. Informiert die Mitarbeiter über ihre Buddies

## 💡 Tipps

- **Ausgewogene Abteilungen**: Für beste Ergebnisse sollten die Abteilungsgrößen ähnlich sein
- **Mehrfache Durchläufe**: Führen Sie das Matching mehrmals aus, um verschiedene Kombinationen zu sehen
- **Manuelle Anpassungen**: Die Ergebnisse können nach dem Export manuell angepasst werden
- **Regelmäßige Updates**: Aktualisieren Sie die Buddy-Paare regelmäßig (z.B. vierteljährlich)

## 🐛 Fehlerbehebung

### "Es werden mindestens 2 Abteilungen benötigt"
- Stellen Sie sicher, dass Ihre JSON-Datei mindestens 2 verschiedene Abteilungen enthält

### "Alle Mitarbeiter müssen ein 'name' Feld haben"
- Überprüfen Sie, dass jedes Mitarbeiter-Objekt ein `name`-Feld besitzt

### "Fehler beim Parsen der JSON-Datei"
- Validieren Sie Ihre JSON-Datei mit einem JSON-Validator
- Achten Sie auf korrekte Syntax (Kommas, Anführungszeichen, Klammern)

## 📞 Support

Bei Fragen oder Problemen wenden Sie sich bitte an das IT-Team.

---

**Version**: 1.0  
**Letzte Aktualisierung**: Dezember 2025