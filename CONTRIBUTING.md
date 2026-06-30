# Contributing to Timestamper

Thank you for helping improve Timestamper.

## Prerequisites

- Windows 10 or 11
- Node.js 22+
- pnpm 10
- Rust stable (MSVC toolchain)
- Microsoft C++ Build Tools
- WebView2 Runtime

## Setup

```powershell
pnpm install
pnpm tauri dev
```

## Branch workflow

- Integration branch: `dev`
- Create feature branches from `dev` using `type/thing-done` (kebab-case)
- Open pull requests against `dev` unless the change is part of a release merge to `main`

## Commits

Format:

```text
type(scope): thing done
```

- Subject line only — no body unless requested
- Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`, `ci`
- One logical change per commit

## Required checks

Before opening or updating a pull request:

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
```

For packaging or release-related changes, also run:

```powershell
pnpm tauri build
```

## Manual testing

Global hotkeys and OBS synchronization must be tested manually on Windows when relevant.

Suggested smoke test:

1. Start a stream session.
2. Add at least one mark with a global hotkey.
3. Stop the session and verify History.
4. Export marks and change hotkeys in Settings.

## Release process

- Releases are tagged on `main` as `v*`
- GitHub Actions builds Windows installers on tag push
- See [CHANGELOG.md](CHANGELOG.md) for release notes

## Questions

Open a GitHub issue for bugs or feature requests using the provided templates.
