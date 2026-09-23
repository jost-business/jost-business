# GitHub Cleanup Checklist for PWA Countdown Migration

Nach der Migration von GitHub Pages zu Docker solltest du folgende Aufräumarbeiten durchführen:

## 1. GitHub Pages Deaktivieren
**Link:** https://github.com/jost-business/jost-business/settings/pages

- [ ] Gehe zu Settings → Pages
- [ ] Source: Stelle sicher, dass es auf "None" gesetzt ist
- [ ] Verifiziere, dass keine GitHub Pages Deployment mehr aktiv ist

## 2. GitHub Secrets Aufräumen
**Link:** https://github.com/jost-business/jost-business/settings/secrets/actions

- [ ] Lösche: `GH_TOKEN` (falls vorhanden)
- [ ] Lösche: `GITHUB_TOKEN` (falls nur für PWA genutzt)
- [ ] Behalte: Andere Secrets, die für andere Workflows nötig sind

## 3. Environments Checken
**Link:** https://github.com/jost-business/jost-business/settings/environments

- [ ] Lösche Environment "github-pages" (falls vorhanden)
- [ ] Lösche Environment "pwa-countdown" (falls vorhanden)
- [ ] Behalte: Andere Environments für andere Deployments

## 4. Action Permissions Verifizieren
**Link:** https://github.com/jost-business/jost-business/settings/actions

- [ ] Gehe zu Settings → Actions → General
- [ ] Verifiziere, dass Actions noch für andere Workflows aktiviert sind

## 5. Deploy Keys Aufräumen
**Link:** https://github.com/jost-business/jost-business/settings/keys

- [ ] Lösche Deploy Keys, die nur für PWA waren

## 6. Workflow Runs Löschen (Optional)
**Link:** https://github.com/jost-business/jost-business/actions

- [ ] Gehe zu Actions
- [ ] Lösche alte "Deploy PWA Countdown" Runs (optional, für Archiv-Cleanup)

## 7. Branch Protection Rules Checken
**Link:** https://github.com/jost-business/jost-business/settings/branch_protection_rules/new

- [ ] Verifiziere, dass keine PWA-spezifischen Rules existieren

## Zusammenfassung
Nach diesen Schritten sollte GitHub sauber sein und nur noch die Docker-basierte Deployment-Konfiguration widerspiegeln.

**Wichtig:** Die PWA wird jetzt über Docker zu `countdown.jost.business` deployed. Kein GitHub Pages mehr nötig! 🚀
