# 🤖 WhisperBot

[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-brightgreen)]()

A fast, modular and production-ready WhatsApp bot built with Node.js and Baileys. WhisperBot focuses on group moderation, utilities, multilingual support and extensibility through plugins and a simple command system.

---

## Highlights

- Multi-device WhatsApp support via @whiskeysockets/baileys
- Modular command + plugin architecture (auto-loads commands & events)
- Multilingual (English / French) with buildable dictionaries
- Owner / Sudo / Admin permission levels and command cooldowns
- Lightweight JSON-based storage (no external DB required)
- Built-in features: AFK, activity tracking, status saver, auto-read, auto-typing/recording, anti-call, pairing code flow

---

## Features

- Multi-device connection and pairing-code login
- Command handler with categories (Admin, Group, Fun, Info, Owner, Tools, etc.)
- Permissions: Creator, Owner, Sudo, Admin, Public/private modes
- Auto typing / auto recording presence simulation
- Auto read (blue ticks) and read-by-user toggles
- Status saver (forward posted statuses to owner)
- AFK detection and replies
- Message caching for session flows and utilities
- Activity tracking, leaderboards and “seen” utilities
- Anti-link, anti-spam, mute, warns and moderation utilities
- Plugin system to extend behavior without changing core
- Language tooling: build translations with npm run translate / build

---

## Quickstart

1. Clone the repo
   git clone https://github.com/sneakyuser5-netizen/The_whisperer_bot.git

2. Install dependencies
   npm install

3. Configure environment variables (optional)
   - Copy or edit `.env` to add API keys used by optional features (News, TMDB, GROQ, etc.):
     - NEWS_API_KEY
     - TMDB_API_KEY
     - GROQ_API_KEY

4. Configure the bot
   - Edit `database/setup.json` (used during initial pairing):
     {
       "phone": "237612345678"
     }
     Replace with your phone in international format (bot uses this to print a pairing code).

   - For core settings open `config.js` or use the settings library (global/group settings are stored in `database/settings.json`).

5. Start the bot
   npm start

6. Pair the bot
   - When the bot notices no registered credentials, it prints a pairing code to the console.
   - Follow the instructions in the console and in `database/setup.json` to complete pairing.

Notes:
- The bot uses multi-file auth state (session directory). Keep `./session` safe.
- The code prints pairing information rather than a QR by default (see index.js).

---

## Scripts

- npm start — run the bot (node index.js)
- npm run translate — regenerate language files (tools/build-language.js)
- npm run build — alias for build-language

---

## Configuration

- Main settings: config.js
  - BOT_NAME (from settings)
  - PREFIX (default `.`)
  - CREATOR (owner phone id)
  - TIMEZONE

- Runtime settings are stored in JSON files under `database/`:
  - settings.json (global & per-group)
  - owner.json
  - sudo.json
  - mutes.json
  - activity.json
  - read.json
  - etc.

- Environment variables go in `.env` for optional third-party integrations.

---

## Commands & Permissions

- Commands are located in `commands/` and are loaded automatically at startup.
- Each command exposes metadata:
  - name, aliases, description, category, permission, usage, minArgs, cooldown, execute()
- Permission levels:
  - public, admin (group admin), sudo, owner, creator
- The bot supports a global mode (public/private). In private mode only owner/sudo may use commands.

Command parsing supports:
- .command arg1 arg2
- .command=inlineArg otherArgs

Cooldowns are enforced per-user per-command.

---

## Events & Plugins

- Event handlers are in `events/` and loaded by `eventHandler.js`.
- Plugins can be placed in `plugins/` and will be auto-loaded by the plugin manager.
- Typical events: group-participants.update, messages.upsert, presence.update, call, connection.update.

---

## Language & Localization

- Supported: English & French
- Source dictionary & translations in `language/`
- After editing translations run:
  npm run translate
- Use the translation helper in code: t(jid, "translation.key") or t("translation.key")

---

## Project Structure (high level)

- index.js — entry point, Baileys socket, connection & pairing flow
- handler.js — command loader / executor, sessions, cooldowns
- eventHandler.js — loads and dispatches events
- commands/ — command modules
- events/ — event modules
- plugins/ — optional extensions
- lib/ — reusable helper modules (identity, settings, afk, activity, owner, sudo, presence, messageCache, etc.)
- database/ — JSON storage files
- tools/ — utilities (language builder, etc.)
- assets/ — images (welcome, icons)

---

## Security & Privacy

- Keep the `session/` directory private (contains WhatsApp auth files).
- Do not commit `.env` with secrets to public repos.
- Owner and sudo lists control privileged operations — use them carefully.

---

## Troubleshooting

- No pairing code printed?
  - Make sure `database/setup.json` contains a valid phone string and restart the bot.
- Bot reconnects or logs out:
  - index.js reconnects automatically; if you see a DisconnectReason.loggedOut, re-pair.
- QR not printing:
  - The bot uses pairing codes; the terminal QR may be disabled (printQRInTerminal: false).

---

## Development

- Add commands by creating a new file in `commands/<category>/`.
- Add events by placing modules in `events/`.
- Update language strings in `language/dictionary.js` and run `npm run translate`.
- Use the existing helper modules in `lib/` to integrate with settings, owner/sudo checks and persistence.

---

## Dependencies (selected)
- @whiskeysockets/baileys — WhatsApp protocol client
- @vitalets/google-translate-api — for translation automation
- openai — optional AI integrations
- axios, dotenv, pino, qrcode

See package.json for complete list and versions.

---

## Contributing

Contributions are welcome. Please:
1. Open an issue describing the change or feature.
2. Fork and create a branch for your change.
3. Run tests (if any) and ensure formatting is consistent.
4. Submit a pull request with a clear description.

---

## License

MIT License — see LICENSE file.

---

## Author

THE-WHISPERER — https://github.com/sneakyuser5-netizen

If you’d like, I can:
- Commit this README.md to the repository for you, or
- Create a shorter README for npm/github landing page, or
- Generate a CHANGELOG or CONTRIBUTING.md next. Which would you like me to do?
