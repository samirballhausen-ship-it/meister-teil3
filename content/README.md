# Content · Daten-Grundlage Meister-Atelier Teil III

**Prinzip:** *Single Source of Truth* für alle Lern-Inhalte und Fragen.
**Nicht token-effizient** gedacht — **vollständig** und **KI-nutzbar**.

> ⚠️ **Kritischer Kontext:** Samirs Prüfung ist nur **1 Tag nach Kursende (2026-05-09)**. Kein Puffer. Deshalb: Content **tages-inkrementell** einarbeiten (nicht wochenweise). Jeder Unterrichtstag, den Samir mitbringt, wird am selben Abend in die Datenbank gespeist.

---

## Struktur

```
content/
├── README.md                        # Dieses Dokument
├── index.json                       # Master-Index aller Themen + Metriken
├── lehrplan/
│   ├── stundenplan.json             # Timeline: wann wurde was gelehrt (Tag 1–6, Dozenten, Dauer)
│   └── themen-timeline.json         # Chronologische Reihenfolge im Kurs
├── themen/                          # FEINGLIEDRIGE Themen (≠ HF-Gruppen)
│   ├── rechnungswesen-grundlagen.mdx
│   ├── gob-grundsaetze.mdx
│   ├── inventar-bilanz.mdx
│   ├── rechtsformen.mdx
│   ├── unternehmensgruendung.mdx
│   ├── unternehmensziele.mdx
│   ├── zielbeziehungen.mdx
│   ├── unternehmensanalyse-swot.mdx
│   ├── marketing-4p.mdx
│   ├── marktforschung.mdx
│   ├── kennziffern-marktvolumen.mdx
│   ├── kalkulation-grundlagen.mdx
│   ├── klr-kostenarten.mdx
│   ├── steuerwesen-ueberblick.mdx
│   ├── umsatzsteuer.mdx
│   ├── gewerbesteuer.mdx
│   ├── einkommensteuer.mdx
│   ├── koerperschaftssteuer.mdx
│   ├── wettbewerbsrecht.mdx
│   └── ...                          # wird iterativ gewachsen
├── fragen/
│   ├── master.json                  # SINGLE SOURCE OF TRUTH aller Fragen
│   ├── quellen.json                 # Woher kam welche Frage? (Traceability)
│   └── dubletten.json               # Log erkannter Duplikate (nicht in master)
├── quellen/
│   ├── index.json                   # Alle Unterrichts-Dokumente mit Metadaten
│   └── zitate.json                  # Direkte Zitate aus Unterricht (authentisch)
└── gesetze/
    ├── hgb.json                     # Wichtige HGB-§§ (extrahiert)
    ├── ao.json
    ├── estg.json
    └── ustg.json
```

---

## Taxonomie der Themen

Statt der 3 groben HF-Gruppen (GÜ/UF/WW) nutzen wir **feingliedrige Themen**,
gruppiert nach **Fach-Clustern** (nicht zu verwechseln mit HF):

### Cluster 1 · Rechnungswesen & Buchführung
- Rechnungswesen-Grundlagen (Teilbereiche, Zweck)
- Gesetzliche Grundlagen (HGB, AO, Steuergesetze)
- GOB (Grundsätze ordnungsgemäßer Buchführung)
- Inventar & Inventurverfahren
- Bilanz-Aufbau
- Soll-Haben-Prinzip
- Doppelte Buchführung

### Cluster 2 · Kalkulation & Kosten
- Kalkulations-Grundlagen (Angebotspreis-Aufbau)
- Kostenartenrechnung
- Kostenstellenrechnung
- Kostenträgerrechnung
- Stundensatz-Kalkulation
- Deckungsbeitragsrechnung
- Bilanz-Kennzahlen (Eigenkapitalquote, Umsatzrentabilität)

### Cluster 3 · Unternehmensgründung
- Rechtsformen & Haftung
- Institutionen (7 Körperschaften)
- Fremdkapital & Businessplan
- Einlagen & Mindestkapital
- Gesellschafter vs. Geschäftsführer
- Gründung vs. Übernahme

### Cluster 4 · Unternehmensführung
- Unternehmensziele vs. Leitbild vs. Philosophie
- Zielarten (Formal-/Sach-/Finanz-/Sozial-/Nachhaltigkeitsziele)
- Zielbeziehungen (komplementär, indifferent, konfliktär)
- Stakeholder & Interessengruppen
- Unternehmensplanung & Regelkreislauf
- Risikoanalyse
- Unternehmenskultur

### Cluster 5 · Marketing & Markt
- Marketing-Grundlagen & 4 P's
- Marktanalyse vs. Marktbeobachtung
- Primär- vs. Sekundärforschung
- Wettbewerbskennziffern (Marktvolumen, Marktanteil, MBF)
- SWOT-Analyse
- ABC-Analyse
- Zielgruppen & Kundenorientierung

### Cluster 6 · Steuer & Recht
- Steuer-Überblick (Art 105 GG)
- Umsatzsteuer / Mehrwertsteuer
- Gewerbesteuer
- Einkommensteuer
- Einkünfte Gewerbebetrieb
- Körperschaftssteuer
- Erbschafts- & Schenkungssteuer
- Besteuerungsverfahren
- Wettbewerbsrecht (UWG)
- Wichtige Handwerks-Gesetze

---

## Master-Fragenkatalog (`fragen/master.json`)

**Regel:** Jede Frage — egal woher (Wiesbaden-Klausur, Probeklausur-Fotos, Unterricht,
Lehrbuch, Lehrer-Hand-outs) — bekommt **einen Eintrag** im master.json.

**Keine Dubletten.** Wird eine Frage in zwei Quellen gefunden, bekommt sie
weitere Quellen-IDs in `sources[]`, nicht einen neuen Eintrag.

### Frage-Schema

```ts
{
  id: "q-0001",                      // stabil, nie reused
  typ: "mc-5" | "mc-4" | "offen" | "rechnen" | "matrix-ankreuzen" | "liste" | "wahr-falsch",
  thema: "rechtsformen",             // slug aus themen/
  cluster: "unternehmensgruendung",  // Cluster-Zuordnung
  schwierigkeit: 1 | 2 | 3 | 4 | 5,
  prompt: "…",                       // die eigentliche Frage
  kontext?: "…",                     // optionaler Fallbeispiel-Text
  antworten?: [                      // nur bei mc-4/mc-5/matrix
    { text: "…", korrekt: boolean, erklaerung?: "…" }
  ],
  rechnen?: {                        // nur bei typ "rechnen"
    formel: "…",
    eingabe_felder: [{ label: "…", einheit: "€" | "%" | "…" }],
    loesung_wert: number,
    loesung_toleranz: number,        // akzeptierte Abweichung
    zwischenschritte: ["…"]
  },
  liste?: {                          // nur bei typ "liste"
    mindestanzahl: number,
    muster_items: string[]           // die Punkte die erwartet werden
  },
  musterantwort: string,             // offene Antwort · markdown
  musterpunkte: string[],            // Kernpunkte, gegen die die Antwort gematcht wird
  eselsbruecke?: string,             // Memo-Hilfe
  tags: string[],                    // Mehrfach-Zuordnung (z.B. ["haftung", "kapitalgesellschaft"])
  sources: [                         // WOHER kommt diese Frage
    {
      quellen_id: "wiesbaden-klausur-2026-02-24",
      frage_nr: 3,
      datei: "Prüfungsfragen_MV_Kurs_III_Wiesbaden_24022026.pdf",
      seite: 1
    }
  ],
  erstellt_am: "2026-04-19",
  zuletzt_gesehen?: number,          // für SRS
  mastery_default: 0                 // Startwert für adaptives Lernen
}
```

### De-Duplication-Strategie

1. **Exakt-Match:** identischer `prompt` (normalisiert: lowercase, umlaute, trim) → bestehenden Eintrag um Quelle erweitern.
2. **Near-Match:** Prompt-Ähnlichkeit ≥ 85 % (Levenshtein/Jaccard) → Flag in `dubletten.json` zur manuellen Review, nicht automatisch mergen.
3. **Themen-Match:** wenn Thema + Kern-Antwort identisch → als Dublette markieren.

## Verwendung durch die App

- **`lib/content/loader.ts`**: TypeScript-Loader liest master.json + themen/ und cached in-memory
- **`/unterricht/[thema]`**: rendert aus `themen/<slug>.mdx` + zugeordnete Fragen
- **`/pruefung`**: wählt Fragen nach Mastery-Algorithmus aus master.json
- **`lib/mastery.ts`**: Leitner-SRS + Mastery-Score-Engine

## Wachstums-Regel

Jede neue Unterrichtsstunde, die Samir mitbringt:
1. PDF/Bilder werden in `quellen/index.json` eingetragen
2. Neue Inhalte werden in entsprechendes `themen/*.mdx` eingearbeitet (kein eigenes Tages-File — Content ist themen-zentriert, Timeline ist Metadata)
3. Neue Fragen kommen in `master.json`, nach Dedup-Check
4. Wenn neues Thema: neues `themen/*.mdx` anlegen + in `index.json` registrieren

Die Content-Datenbank ist damit **live skalierbar ohne App-Neubau**.
