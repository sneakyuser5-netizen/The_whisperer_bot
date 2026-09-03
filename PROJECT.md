# 🤖 WhisperBot Project Documentation

## Overview

WhisperBot is a modular WhatsApp bot built with **Node.js** and **Baileys**. It is designed to provide powerful group moderation, automation, multilingual support, owner management, utility tools, and fun commands while remaining lightweight, easy to maintain, and easy to extend.

The project follows a modular architecture where commands, events, libraries, and data storage are separated into independent components. This allows new features to be added without modifying the core of the bot.

---

# Architecture

The project is divided into several major components.

```
index.js
      │
      ▼
Baileys Socket
      │
      ▼
eventHandler.js
      │
      ▼
handler.js
      │
      ▼
Command
```

---

# Project Structure

```
assets/
commands/
core/
database/
events/
github/
language/
lib/
plugins/
tools/

config.js
handler.js
eventHandler.js
index.js
package.json
README.md
start.sh
```

---

# Entry Point

The application starts from **index.js**.

Responsibilities include:

- Connecting to WhatsApp using Baileys
- Multi-device authentication
- Pairing code generation
- Automatic reconnection
- Loading commands
- Loading events
- Managing presence updates
- Auto typing
- Auto recording
- Auto read
- AFK detection
- Activity tracking
- Running events
- Forwarding commands to the handler

---

# Command System

Commands are stored inside:

```
commands/
```

They are grouped into categories.

- Admin
- Group
- General
- Fun
- Info
- Owner
- Tools

Each command exports metadata such as:

- name
- description
- category
- permission
- usage
- minArgs

and an execute() function.

Commands are loaded automatically during startup.

Current command count:

**88 commands**

---

# Event System

Events are located inside:

```
events/
```

Examples include:

- Welcome
- Goodbye
- Anti-Link
- Anti-Spam
- Anti-Delete
- Moderation
- Status
- Message Cache

Events are loaded automatically by eventHandler.js.

---

# Library System

The lib directory contains reusable modules responsible for the bot's internal logic.

Examples include:

## settings.js

Stores global and group settings.

Examples:

- Language
- Slowmode
- Welcome
- Goodbye
- Auto typing
- Auto recording
- Auto read
- Public/Private mode

---

## lang.js

Provides multilingual translation.

Supports:

```
t("key")
```

and

```
t(jid, "key")
```

The language is selected from the global settings.

---

## identity.js

Responsible for identifying users.

Features include:

- Phone normalization
- LID to phone conversion
- Creator detection
- Bot owner detection
- Sudo detection
- Owner detection

This ensures compatibility with newer WhatsApp LID accounts.

---

## permissions.js

Provides helper functions for checking:

- Owner
- Group Admin
- Bot Admin

---

## owner.js

Stores the WhatsApp account that owns the current bot instance.

---

## sudo.js

Allows each bot owner to maintain their own list of sudo users.

Supports:

- Add
- Remove
- Check
- List

---

## warns.js

Stores user warnings.

Supports:

- Add warning
- Get warning count
- Reset warnings
- List warned users

---

## mute.js

Stores temporary muted users.

Automatically removes expired mutes.

---

## activity.js

Tracks group activity.

Stores:

- Last seen
- Message count

Used by:

- leaderboard
- ghosts
- seen
- tagactive

---

## setup.js

Stores the phone number used during initial pairing.

---

# Database

The bot uses JSON files instead of an external database.

Examples include:

activity.json

Tracks message activity.

edited.json

Stores edited messages.

mutes.json

Stores muted users.

owner.json

Stores the bot owner.

settings.json

Stores global and group settings.

setup.json

Stores pairing information.

status.json

Stores status configuration.

sudo.json

Stores sudo users.

warns.json

Stores warnings.

This design keeps the project lightweight and easy to deploy.

---

# Language System

WhisperBot currently supports:

- English
- French

Command descriptions are maintained inside:

```
language/dictionary.js
```

After adding or modifying descriptions, run:

```
npm run build
```

This automatically regenerates:

- generated-en.js
- generated-fr.js

User-facing messages are translated using:

```
t(jid, "translation.key")
```

Translations are stored inside:

- language/en.js
- language/fr.js

---

# Plugin System

Additional functionality can be added through plugins.

Plugins are stored inside:

```
plugins/
```

The plugin manager loads them automatically when the bot starts.

---

# Permissions

Commands support different permission levels.

- Public
- Group Admin
- Sudo
- Owner
- Creator

Permissions are checked automatically before a command executes.

---

# Features

Current features include:

- Multi-device support
- Pairing code login
- English/French translations
- Public and private mode
- Owner and sudo management
- Welcome and goodbye messages
- Anti-Link protection
- Anti-Spam protection
- Anti-Delete
- Warning system
- Temporary mute system
- Activity tracking
- Leaderboards
- Ghost member detection
- Last seen tracking
- Group moderation
- Runtime information
- Server information
- Utility commands
- Fun commands
- Plugin support
- Automatic command loading
- Automatic event loading
- Auto typing
- Auto recording
- Auto read

---

# Command Development Workflow

To add a new command:

1. Create the command file inside the appropriate commands category.

2. Add the French command description to:

```
language/dictionary.js
```

3. Run:

```
npm run build
```

4. Commit your changes.

5. Push to GitHub.

This automatically updates the generated language files.

---

# Design Principles

WhisperBot follows a modular architecture.

The project aims to keep:

- reusable libraries
- simple command creation
- independent events
- lightweight JSON storage
- multilingual support
- maintainable code
- clear separation of responsibilities

This structure allows the bot to scale easily while remaining easy to understand and contribute to.

---

# Author

Developed by **THE-WHISPERER**.

WhisperBot is an actively maintained open-source WhatsApp bot focused on reliability, extensibility, and modern WhatsApp features.
