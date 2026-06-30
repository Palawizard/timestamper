# Security Policy

## Supported versions

| Version    | Supported |
| ---------- | --------- |
| 0.1.x beta | Yes       |
| < 0.1.0    | No        |

## Reporting a vulnerability

If you discover a security issue, please report it privately instead of opening a public GitHub issue.

Preferred contact:

- GitHub: [Palawizard](https://github.com/Palawizard) (private security advisory on the repository when available)

Include:

- Affected version
- Steps to reproduce
- Impact assessment
- Suggested fix if you have one

We aim to acknowledge reports within a reasonable timeframe and coordinate a fix before public disclosure when appropriate.

## Scope notes

Timestamper is a local desktop application. It stores stream history and settings in a local SQLite database. OBS WebSocket credentials are stored locally. The app does not expose a remote API and does not send telemetry by default.
