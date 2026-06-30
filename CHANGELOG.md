# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0-beta.1] - 2026-07-01

First public beta of Timestamper.

### Added

- Live stream session timer with start/stop controls and elapsed display.
- Timestamp marks saved relative to session start with global hotkeys.
- Configurable start/stop and add-mark hotkeys with keyboard capture in Settings.
- Completed stream history with mark counts, details, and delete confirmation.
- Copy and export marks as plain text, CSV, or JSON.
- Local SQLite persistence for sessions, marks, and settings.
- Optional OBS WebSocket 5.x integration for automatic session sync.
- OBS setup guide dialog and live connection status in the UI.
- Desktop-required guard when running outside the Tauri runtime.
- Windows packaging with NSIS and MSI installers.

### Changed

- Polished Live, History, and Settings screens and empty states.
- Stop stream button uses destructive styling while a session is active.
- History layout adapts on narrow widths without horizontal overflow.

### Fixed

- Global hotkeys remain registered while switching views.
- Settings Save submits the form correctly.
- Only one active session at a time; stale sessions are recovered safely.
- Failed hotkey registration no longer overwrites saved settings in SQLite.
- SQLite write and global shortcut permissions for Tauri capabilities.
- Initial migration checksum preserved for existing databases.
- Hotkey capture ignores shortcut actions during recording.

### Known limitations

- Windows 10 and 11 only for this beta release.
- Unsigned installer may trigger SmartScreen warnings.
- No Twitch API, cloud sync, or auto-update.

[0.1.0-beta.1]: https://github.com/Palawizard/timestamper/releases/tag/v0.1.0-beta.1
