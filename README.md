<div align="center">

# Timestamper

### Mark important moments during your Twitch stream

[![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?style=for-the-badge&logo=tauri)](https://v2.tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Rust](https://img.shields.io/badge/Rust-stable-000000?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-local-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows_10%2F11-0078D4?style=for-the-badge&logo=windows)](https://www.microsoft.com/windows)

[Features](#-features) • [Download](#-download) • [Quick start](#-quick-start) • [Architecture](#-architecture) • [Verification](#-verification)

</div>

---

## ◆ Features

<table>
<tr>
<td width="50%">

### » Live session

- **Stream timer** — starts at zero when the session begins
- **Instant marking** — saves elapsed time since stream start
- **Global shortcuts** — start/stop and add mark from any app
- **Current marks list** — immediate display with `HH:MM:SS` timestamps
- **Empty streams skipped** — sessions without marks are not saved to history

</td>
<td width="50%">

### » History and export

- **Completed streams** — date, start time, duration, and mark count
- **Stream details** — full list of saved timestamps
- **Copy** — one timestamp or all marks as plain text
- **Export** — CSV and JSON per stream
- **Delete** — confirmation before permanent removal

</td>
</tr>
<tr>
<td>

### » Settings and OBS

- **Configurable shortcuts** — built-in keyboard capture in Settings
- **Validation** — invalid shortcuts do not replace the previous working config
- **Optional OBS integration** — start/stop sync via WebSocket 5.x
- **Built-in OBS guide** — connection steps from the Settings screen
- **Reconnect** — automatic recovery after temporary disconnects

</td>
<td>

### » Experience

- **English UI** — navigation via `Live`, `History`, and `Settings`
- **Local storage** — SQLite in the Tauri app data folder
- **Offline** — no account, cloud, or telemetry
- **Lightweight app** — Tauri 2 shell without a full embedded browser

</td>
</tr>
<tr>
<td colspan="2">

### » Known limitations (beta)

- Windows 10 and 11 only — no macOS or Linux in this release
- **Unsigned installer** — SmartScreen may ask for extra confirmation
- Global shortcuts may require system permissions depending on Windows setup
- OBS must expose its WebSocket server; Timestamper **never sends commands** to OBS
- No Twitch API, VOD detection, cloud sync, or auto-update

</td>
</tr>
</table>

---

## ◆ Download

Releases are published on [GitHub Releases](https://github.com/Palawizard/timestamper/releases).

| File                          | Description                             |
| ----------------------------- | --------------------------------------- |
| `Timestamper_*_x64-setup.exe` | NSIS Windows installer (per-user)       |
| `release-checksums.txt`       | SHA-256 checksums for release artifacts |

> This beta ships the NSIS installer only — WiX/MSI does not accept the `beta` version suffix yet.

**Runtime requirement:** Microsoft Edge WebView2 (installed automatically by the installer when needed).

---

## ▶ Quick start

### Prerequisites (development)

- Windows 10 (1803+) or Windows 11
- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 10
- [Rust](https://www.rust-lang.org/) stable (MSVC)
- Microsoft C++ Build Tools with `Desktop development with C++`
- [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)

### Install dependencies

```powershell
pnpm install
```

### Run in development

```powershell
pnpm tauri dev
```

> `pnpm dev` runs Vite only without the Tauri runtime — frontend-only use.

### Verify the project

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm tauri build
```

### Build the Windows installer

```powershell
pnpm tauri build
```

The installer is generated in `src-tauri/target/release/bundle/`.

### Default shortcuts

```text
Ctrl+Alt+F9  : start or stop stream
Ctrl+Alt+F10 : add mark
```

Change them in **Settings** → **Save**.

### OBS setup (optional)

1. OBS → **Tools** → **WebSocket Server Settings** → enable the server (port **4455** by default)
2. Timestamper → **Settings** → enable **OBS integration**, set host, port, and password
3. **Test connection**, then **Save**

Timestamper observes OBS stream state; it does not start or stop OBS.

---

## ◆ Useful scripts

<div align="center">

| Command             | Description                           |
| ------------------- | ------------------------------------- |
| `pnpm dev`          | Vite dev server (frontend only)       |
| `pnpm tauri dev`    | Full app in development               |
| `pnpm test`         | Unit and component tests (Vitest)     |
| `pnpm lint`         | ESLint                                |
| `pnpm typecheck`    | TypeScript check                      |
| `pnpm format:check` | Prettier check                        |
| `pnpm format`       | Prettier format                       |
| `pnpm build`        | Frontend build                        |
| `pnpm tauri build`  | Production build + Windows installers |

</div>

---

## ◆ Architecture

```
timestamper/
├── src/                          → React frontend (features, components)
│   ├── app/                      → App shell and routes
│   ├── components/               → Shared UI (layout, buttons, timer)
│   ├── features/
│   │   ├── live/                 → Active session, timer, current marks
│   │   ├── history/              → Completed streams, details, export
│   │   ├── settings/             → Shortcuts and OBS connection
│   │   ├── obs/                  → OBS WebSocket orchestration
│   │   └── export/               → TXT / CSV / JSON formatting
│   ├── domain/                   → Pure types and helpers
│   └── services/                 → SQLite, hotkeys, repositories
├── src-tauri/
│   ├── src/                      → Tauri shell and Rust plugins
│   ├── capabilities/             → Tauri permissions
│   └── app-icon.svg              → SVG icon source
└── .github/workflows/            → CI and release pipelines
```

### Live session flow

```
Start stream → Timer (elapsed ms) → Add mark (offset ms) → Stop stream
    → Persist session + marks → History → Copy / export
```

`useLiveSession` stays mounted at App level via `LiveSessionProvider` so global shortcuts survive view changes.

---

## ◆ Tech stack

<div align="center">

| Layer             | Technology                                      |
| ----------------- | ----------------------------------------------- |
| **Desktop shell** | Tauri 2                                         |
| **Backend**       | Rust 2021, SQL and global shortcut plugins      |
| **Frontend**      | React 19, strict TypeScript, Vite               |
| **Persistence**   | SQLite (Tauri SQL plugin), versioned migrations |
| **OBS**           | obs-websocket-js 5.x                            |
| **Tests**         | Vitest, React Testing Library                   |
| **Quality**       | ESLint, Prettier, GitHub Actions                |

</div>

### Why Tauri?

- → Native global shortcuts while OBS or a game is focused
- → Local SQLite storage without a server
- → Lightweight installer with minimal Tauri permissions
- → Fast web UI iteration without shipping full Chromium

---

## ◆ Security and privacy

- **Local app** — no telemetry or account
- **Limited Tauri capabilities** — SQL, global shortcuts, and desktop runtime only
- OBS password stored **locally** in SQLite
- Timestamper **does not send commands** to OBS — observation only
- **Per-user installer** — no admin elevation by default

See [SECURITY.md](SECURITY.md) to report a vulnerability.

---

## ◆ Verification

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm tauri build
```

> Global shortcuts and the installer on a clean machine must be validated manually.

---

## ◆ Contributing and releases

- Integration branch: `dev`
- Commits: `type(scope): thing done` (English, no body)
- Releases: `v*` tags on `main` trigger the GitHub Actions workflow
- Changelog: see [CHANGELOG.md](CHANGELOG.md)
- Contributor guide: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## ◆ License

Distributed under the [MIT](LICENSE) license.

---

<div align="center">

Timestamper · Beta · Windows 10/11

</div>
