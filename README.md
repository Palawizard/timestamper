<div align="center">

# Timestamper

### Marquez vos moments importants pendant un stream Twitch

[![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?style=for-the-badge&logo=tauri)](https://v2.tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Rust](https://img.shields.io/badge/Rust-stable-000000?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-local-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/Licence-MIT-green?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Plateforme-Windows_10%2F11-0078D4?style=for-the-badge&logo=windows)](https://www.microsoft.com/windows)

[Fonctionnalités](#-fonctionnalités) • [Téléchargement](#-téléchargement) • [Démarrage rapide](#-démarrage-rapide) • [Architecture](#-architecture) • [Vérification](#-vérification)

</div>

---

## ◆ Fonctionnalités

<table>
<tr>
<td width="50%">

### » Session live

- **Timer de stream** : démarre à zéro quand la session commence
- **Marquage instantané** : enregistre l'instant écoulé depuis le début du stream
- **Raccourcis globaux** : start/stop et add mark depuis n'importe quelle application
- **Liste des marks courants** : affichage immédiat avec horodatage `HH:MM:SS`
- **Streams vides ignorés** : une session sans mark n'est pas sauvegardée dans l'historique

</td>
<td width="50%">

### » Historique et export

- **Streams terminés** : date, heure de début, durée et nombre de marks
- **Détail par stream** : liste complète des timestamps enregistrés
- **Copie** : un timestamp ou tous les marks en texte brut
- **Export** : CSV et JSON par stream
- **Suppression** : confirmation avant effacement définitif

</td>
</tr>
<tr>
<td>

### » Réglages et OBS

- **Raccourcis configurables** : capture clavier intégrée dans les réglages
- **Validation** : un raccourci invalide ne remplace pas la configuration précédente
- **Intégration OBS optionnelle** : synchronisation start/stop via WebSocket 5.x
- **Guide OBS intégré** : étapes de connexion depuis l'écran Réglages
- **Reconnexion** : reprise automatique après déconnexion temporaire

</td>
<td>

### » Expérience

- **Interface en anglais** : navigation `Live`, `History`, `Settings`
- **Stockage local** : SQLite dans le dossier de données Tauri
- **Hors ligne** : aucun compte, cloud ni télémétrie
- **Application légère** : shell Tauri 2, pas de navigateur embarqué complet

</td>
</tr>
<tr>
<td colspan="2">

### » Limites connues (beta)

- Windows 10 et 11 uniquement — pas de macOS ni Linux dans cette release
- Installateur **non signé** : SmartScreen peut demander une confirmation supplémentaire
- Les raccourcis globaux peuvent nécessiter des autorisations système selon la configuration Windows
- OBS doit exposer son serveur WebSocket ; Timestamper **n'envoie jamais de commandes** à OBS
- Pas de connexion Twitch, détection VOD, cloud sync ni auto-update

</td>
</tr>
</table>

---

## ◆ Téléchargement

Les releases sont publiées sur [GitHub Releases](https://github.com/Palawizard/timestamper/releases).

| Fichier                         | Description                                     |
| ------------------------------- | ----------------------------------------------- |
| `Timestamper_*_x64-setup.exe`   | Installateur NSIS Windows (utilisateur courant) |
| `Timestamper_*_x64_en-US.msi`   | Installateur MSI Windows                        |
| `release-checksums.txt`         | Empreintes SHA-256 des artefacts (si présent)   |

**Prérequis runtime** : Microsoft Edge WebView2 (installé automatiquement par l'installateur si nécessaire).

---

## ▶ Démarrage rapide

### Prérequis (développement)

- Windows 10 (1803+) ou Windows 11
- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 10
- [Rust](https://www.rust-lang.org/) stable (MSVC)
- Microsoft C++ Build Tools avec `Desktop development with C++`
- [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)

### Installation des dépendances

```powershell
pnpm install
```

### Lancer en développement

```powershell
pnpm tauri dev
```

> `pnpm dev` seul lance Vite sans runtime Tauri — utile uniquement pour le frontend.

### Vérifier le projet

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm tauri build
```

### Créer l'installateur Windows

```powershell
pnpm tauri build
```

L'installateur est généré dans `src-tauri/target/release/bundle/`.

### Raccourcis par défaut

```text
Ctrl+Alt+F9  : start or stop stream
Ctrl+Alt+F10 : add mark
```

Modifiables dans **Settings** → **Save**.

### Configuration OBS (optionnel)

1. OBS → **Tools** → **WebSocket Server Settings** → activer le serveur (port **4455** par défaut)
2. Timestamper → **Settings** → activer **OBS integration**, renseigner host, port et mot de passe
3. **Test connection** puis **Save**

Timestamper observe l'état du stream OBS ; il ne démarre ni n'arrête OBS.

---

## ◆ Scripts utiles

<div align="center">

| Commande            | Description                               |
| ------------------- | ----------------------------------------- |
| `pnpm dev`          | Serveur Vite seul (frontend)              |
| `pnpm tauri dev`    | Application complète en développement     |
| `pnpm test`         | Tests unitaires et composants (Vitest)    |
| `pnpm lint`         | ESLint                                    |
| `pnpm typecheck`    | Vérification TypeScript                   |
| `pnpm format:check` | Vérification Prettier                     |
| `pnpm format`       | Formatage Prettier                        |
| `pnpm build`        | Build frontend                            |
| `pnpm tauri build`  | Build production + installateurs Windows  |

</div>

---

## ◆ Architecture

```
timestamper/
├── src/                          → Frontend React (features, composants)
│   ├── app/                      → App shell et routes
│   ├── components/               → UI partagée (layout, boutons, timer)
│   ├── features/
│   │   ├── live/                 → Session active, timer, marks courants
│   │   ├── history/              → Streams terminés, détail, export
│   │   ├── settings/             → Raccourcis et connexion OBS
│   │   ├── obs/                  → Orchestration WebSocket OBS
│   │   └── export/               → Formatage TXT / CSV / JSON
│   ├── domain/                   → Types et helpers purs
│   └── services/                 → SQLite, hotkeys, repositories
├── src-tauri/
│   ├── src/                      → Shell Tauri et plugins Rust
│   ├── capabilities/             → Permissions Tauri
│   └── app-icon.svg              → Source SVG des icônes
└── .github/workflows/            → CI qualité et pipeline release
```

### Flux session live

```
Start stream → Timer (elapsed ms) → Add mark (offset ms) → Stop stream
    → Persist session + marks → History → Copy / export
```

`useLiveSession` reste monté au niveau App via `LiveSessionProvider` pour que les raccourcis globaux survivent aux changements de vue.

---

## ◆ Stack technique

<div align="center">

| Couche              | Technologie                                      |
| ------------------- | ------------------------------------------------ |
| **Shell desktop**   | Tauri 2                                          |
| **Backend**         | Rust 2021, plugins SQL et global shortcut        |
| **Frontend**        | React 19, TypeScript strict, Vite                |
| **Persistance**     | SQLite (plugin Tauri SQL), migrations versionnées |
| **OBS**             | obs-websocket-js 5.x                             |
| **Tests**           | Vitest, React Testing Library                    |
| **Qualité**         | ESLint, Prettier, GitHub Actions                 |

</div>

### Pourquoi Tauri ?

- → Raccourcis globaux natifs pendant qu'OBS ou un jeu est au premier plan
- → Stockage SQLite local sans serveur
- → Installateur léger et permissions Tauri minimales
- → Interface web rapide à itérer sans embarquer Chromium complet

---

## ◆ Sécurité et confidentialité

- Application **locale** : pas de télémétrie ni de compte
- Capacités Tauri **limitées** au SQL, aux raccourcis globaux et au runtime desktop
- Mot de passe OBS stocké **localement** dans SQLite
- Timestamper **n'envoie pas de commandes** à OBS — observation uniquement
- Installateur en mode **utilisateur courant** — pas d'élévation admin par défaut

Voir [SECURITY.md](SECURITY.md) pour signaler une vulnérabilité.

---

## ◆ Vérification

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm tauri build
```

> Les raccourcis globaux et l'installateur sur machine vierge doivent être validés manuellement.

---

## ◆ Contribution et release

- Branche d'intégration : `dev`
- Commits : `type(scope): thing done` (anglais, sans body)
- Releases : tag `v*` sur `main` déclenche le workflow GitHub Actions
- Changelog : voir [CHANGELOG.md](CHANGELOG.md)
- Guide contributeur : [CONTRIBUTING.md](CONTRIBUTING.md)

---

## ◆ Licence

Distribué sous licence [MIT](LICENSE).

---

<div align="center">

Timestamper · Version beta · Windows 10/11

</div>
