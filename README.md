# ReportLootHelper

Schnellleisten-Helfer für Die Stämme. Das Script liest die erspähten Rohstoffe aus einem geöffneten Einzelbericht, berechnet anhand der Tragkraft die benötigte Haupttruppe und ergänzt frei einstellbare Begleittruppen.

## Installation

1. Dieses Paket in ein öffentliches GitHub-Repository namens `ReportLootHelper` unter `8k9fgd7kf7-art` hochladen.
2. In Die Stämme unter **Einstellungen → Schnellleiste → Neuen Link hinzufügen** wechseln.
3. Als Ziel den vollständigen Inhalt aus `Schnellleisten-Code.txt` einfügen.
4. Den Helfer in einem geöffneten Spähbericht starten.

Der Schnellleistencode bleibt bei späteren Updates unverändert.

## Dateien

- `loader.js`: dauerhafter Loader der Schnellleiste
- `latest.json`: zeigt auf die aktuell veröffentlichte Version
- `releases/report-loot-helper-v1.0.5.js`: vollständiges Script
- `Schnellleisten-Code.txt`: kurzer Code für Die Stämme

## Sicherheit

Der Helfer sendet keinen Angriff selbstständig ab. Er berechnet die Truppen und öffnet höchstens die Bestätigungsseite. Der eigentliche Angriff muss im Spiel manuell bestätigt werden.

## Update-Schema

1. Neue Scriptversion unter `releases/report-loot-helper-vX.Y.Z.js` ablegen.
2. `version` und `file` in `latest.json` aktualisieren.
3. `loader.js` und der Eintrag in der Schnellleiste bleiben unverändert.
