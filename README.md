✦ NEXORA

A modular WhatsApp bot built with Node.js and Baileys, designed around a dynamic command system, event handling, multilingual support, moderation tools, utilities, media features, and extensibility.

NEXORA is built to be easy to expand: commands, events, plugins, language files, and reusable helpers are separated into their own systems instead of being packed into one large file.

---

✦ What is NEXORA?

NEXORA is a feature-rich WhatsApp bot that uses the WhatsApp multi-device protocol through Baileys.

Its architecture is centered around:

- Dynamic command loading
- Event-driven message handling
- Permission management
- Group moderation
- Interactive command sessions
- JSON-based persistent storage
- English/French localization
- Plugin support
- Media and utility features
- Optional AI and third-party integrations

The project is actively developed and its architecture continues to evolve.

---

⚡ Features

💬 Messaging & Presence

- Auto typing
- Auto recording
- Automatic read/blue-tick controls
- Per-user read controls
- Message caching
- AFK detection and responses
- Bot-account mention detection
- Interactive message sessions

🛡️ Group Management

- Group moderation commands
- Admin permission checks
- Anti-link utilities
- Anti-spam features
- Mute controls
- Warning systems
- Group participant events
- Group activity tracking

👑 Permission System

NEXORA supports multiple permission levels:

Creator
   ↓
Owner
   ↓
Sudo
   ↓
Admin
   ↓
Public

Commands can define the permission level required to execute them.

The bot also supports public/private operating modes and per-command cooldowns.

📊 Activity & Utilities

- Activity tracking
- User activity information
- Leaderboards
- Seen utilities
- Status saver
- AFK system
- Runtime/session utilities
- Message caching

🎨 Localization

NEXORA currently supports:

- 🇬🇧 English
- 🇫🇷 French

Language files are maintained through the project's language build system.

After changing language data:

```bash
npm run translate
```

or:

```bash
npm run build
```

🧩 Plugins & Events

The bot has separate systems for:

- Commands
- Events
- Plugins
- Reusable library modules

This makes it possible to add functionality without continually modifying the main entry point.

---

🚀 Installation

Requirements

Before installing NEXORA, make sure you have:

- Node.js 20+
- npm
- A WhatsApp account for pairing
- Internet access
- Git (recommended)

Some optional features may require additional API keys or system dependencies.

---

1. Clone the repository

```bash
git clone https://github.com/sneakyuser5-netizen/NEXORA.git
cd NEXORA
```

2. Install dependencies

```bash
npm install
```

The project's "postinstall" script also prepares the additional dependencies used by some media/Lottie functionality.

3. Check dependencies

```bash
npm run check
```

This runs the project's dependency-checking script.

4. Start NEXORA

```bash
npm start
```

The main entry point is:

```
index.js
```

---

🔐 Pairing & First-Time Setup

NEXORA uses WhatsApp's multi-device authentication and pairing-code flow.

During the first setup, the bot needs the phone number that will be paired with WhatsApp.

The setup information is stored in:

```
database/setup.json
```

Use international number format.

Example:

```json
{
  "phone": "2376XXXXXXXX"
}
```

⚠️ Important

Do not replace the example above with somebody else's number.

Use the WhatsApp number that you intend to pair with the bot.

After configuring the number:

```bash
npm start
```

Follow the pairing instructions printed by the bot.

Once authentication has been completed, the WhatsApp authentication state is stored locally in the session directory.

---

📁 Authentication Data

NEXORA uses multi-file authentication state.

The authentication/session data is sensitive.

```
session/
```

⚠️ Never publish or share your session files.

Anyone who obtains valid WhatsApp authentication credentials may potentially gain access to the connected WhatsApp account.

Keep the session directory private and make sure it is excluded from Git.

---

⚙️ Configuration

Main configuration is handled through:

```
config.js
```

Current core settings include:

- `BOT_NAME`
- `PREFIX`
- `CREATOR`
- `TIMEZONE`

The default command prefix is:

```
.
```

So a command can look like:

```
.menu
```

or:

```
.help
```

Runtime and persistent settings are stored in JSON files under:

```
database/
```

Examples include settings for:

- Global configuration
- Group configuration
- Owner information
- Sudo users
- Mutes
- Activity
- Read settings
- Other runtime state

Do not treat runtime database files as source code.

They may change while the bot is running.

---

🔑 Environment Variables

Optional integrations can use environment variables.

Keep private API keys inside:

```
.env
```

For example:

```
NEWS_API_KEY=your_key_here
TMDB_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

Never commit real API keys to a public repository.

Use ".env.example" as a template where applicable.

---

🧠 Command System

Commands live under:

```
commands/
```

Commands are loaded dynamically at startup.

You generally do not need to manually import every command into "index.js".

A command can define metadata such as:

- `name`
- `aliases`
- `description`
- `category`
- `permission`
- `usage`
- `minArgs`
- `cooldown`
- `execute()`

A simplified command structure looks like:

```
commands/
├── admin/
├── fun/
├── general/
├── group/
├── info/
├── owner/
└── tools/
```

Additional categories may exist as the project evolves.

---

⌨️ Command Usage

The normal command format is:

```
.command argument1 argument2
```

Commands can also support inline argument syntax:

```
.command=argument
```

Aliases can provide alternative names for the same command.

Cooldowns can be applied per user and per command.

---

👑 Permissions

NEXORA separates privileged operations into different levels.

**Public**

Available to normal users when the relevant command allows public access.

**Admin**

Requires appropriate group-admin privileges.

**Sudo**

Trusted users granted additional bot privileges.

**Owner**

Users recognized by the bot as owners.

**Creator**

The highest-level creator permission.

The exact permission required depends on each command.

---

🔒 Public & Private Mode

NEXORA supports different operating modes.

In public mode, commands configured for public use can be accessed normally.

In private mode, command access is restricted to privileged users according to the permission system.

This allows the bot owner to limit who can interact with administrative functionality.

---

🧩 Interactive Sessions

Some operations require more than one message.

NEXORA supports temporary interactive sessions that allow a command to:

```
User sends command
        ↓
Bot requests additional input
        ↓
Session stores the pending operation
        ↓
User responds
        ↓
Bot continues the operation
```

This system is useful for confirmation prompts, multi-step operations, and other conversational commands.

---

📡 Event System

Event modules are stored under:

```
events/
```

The event handler loads and dispatches event modules separately from commands.

Depending on the current implementation, events can handle things such as:

- Incoming messages
- Message updates
- Group participant changes
- Presence updates
- Calls
- Connection changes
- Other WhatsApp events

This separation keeps event-specific logic outside the main command system.

---

🔌 Plugin System

Plugins live under:

```
plugins/
```

The plugin architecture allows additional functionality to be introduced without unnecessarily modifying the core bot.

A plugin can interact with existing helper systems and bot events depending on the plugin interface being used.

This is intended to keep NEXORA extensible as the project grows.

---

🌍 Language System

NEXORA supports:

- English
- French

Language resources are located in:

```
language/
```

The project includes a language build tool:

```
tools/build-language.js
```

To regenerate the language files:

```bash
npm run translate
```

The same build operation can also be run with:

```bash
npm run build
```

When adding or changing translation keys, keep placeholders, key names, and command-related strings consistent with the existing language system.

---

🏗️ Project Architecture

The project is divided into several major systems.

```
NEXORA/
│
├── assets/
│   └── Static assets and bot resources
│
├── commands/
│   └── Command modules
│
├── core/
│   └── Core bot functionality
│
├── database/
│   └── JSON-based runtime storage
│
├── events/
│   └── WhatsApp event modules
│
├── language/
│   └── Localization resources
│
├── lib/
│   └── Reusable helper systems
│
├── media/
│   └── Media-related resources
│
├── plugins/
│   └── Optional extensions
│
├── scripts/
│   └── Setup and maintenance scripts
│
├── tools/
│   └── Development/build utilities
│
├── config.js
│   └── Core configuration
│
├── eventHandler.js
│   └── Event loading/dispatch system
│
├── handler.js
│   └── Command loading/execution and message processing
│
├── index.js
│   └── Main entry point and WhatsApp connection
│
├── package.json
│   └── Dependencies and npm scripts
│
└── start.sh
    └── Startup helper
```

---

🔄 Message Processing

At a high level, an incoming message passes through several layers before a command is executed.

```
WhatsApp message
       │
       ▼
Message/event handling
       │
       ├── Read handling
       ├── Message caching
       ├── Identity handling
       ├── AFK handling
       ├── Activity tracking
       ├── Mention handling
       │
       ▼
Command detection
       │
       ▼
Command parsing
       │
       ▼
Cooldown / mode checks
       │
       ▼
Permission validation
       │
       ▼
Argument validation
       │
       ▼
Command execution
```

This layered design allows individual systems to evolve without placing every feature directly inside the command itself.

---

🛠️ Development

**Add a command**

Create a JavaScript file inside an appropriate category:

```
commands/<category>/<command>.js
```

The command should expose the metadata expected by the command loader and an execution function.

Because commands are dynamically loaded, avoid duplicating command registration in unrelated files.

---

**Add an event**

Create the event module under:

```
events/
```

Use the existing event conventions when connecting the module to WhatsApp events.

---

**Add or modify translations**

Update the appropriate language resources and rebuild them:

```bash
npm run translate
```

Then check the generated changes before committing.

---

**Check the project**

Run:

```bash
npm run check
```

You can also check individual JavaScript files with Node:

```bash
node --check path/to/file.js
```

For example:

```bash
node --check index.js
```

---

📜 Available npm Scripts

The current "package.json" defines:

| Command | Purpose |
|---------|---------|
| `npm start` | Start NEXORA |
| `npm run setup` | Run the setup script |
| `npm run check` | Check project dependencies |
| `npm run translate` | Build/regenerate language files |
| `npm run build` | Run the language build process |

The project also uses a "postinstall" script for additional dependency/setup tasks.

---

📦 Main Dependencies

NEXORA currently uses a number of packages for different parts of its functionality, including:

- **Baileys** — WhatsApp multi-device communication
- **Axios** — HTTP requests
- **dotenv** — environment configuration
- **OpenAI** — optional AI functionality
- **Google Translate API** — translation functionality
- **Sharp / Jimp** — image processing
- **Edge TTS** — text-to-speech
- **youtube-dl-exec** — media downloading
- **QRCode** — QR-related utilities
- **Pino** — logging
- **BTCH Downloader / TTDL** — media/download functionality

See "package.json" for the authoritative dependency list and versions.

---

🔐 Security

If you are running your own instance, treat the following as private:

- `session/`
- `.env`
- private API keys
- WhatsApp authentication credentials
- private runtime data

Never commit:

- `.env`
- session credentials
- real API keys
- private authentication files

Before pushing changes to a public repository, inspect your Git diff:

```bash
git diff
```

and:

```bash
git status
```

If a secret has already been committed, simply deleting it from the latest file is not always enough because Git history may still contain it.

---

🗃️ Runtime Database

NEXORA uses lightweight JSON storage instead of requiring an external database server.

This makes the project easy to run on environments such as:

- Linux
- Termux
- VPS environments
- Local development machines

Runtime JSON files may change while the bot is running.

For that reason, avoid blindly committing every modified file under "database/".

Only commit database changes when they are intentionally part of the project.

---

🧪 Troubleshooting

**The bot does not start**

Try:

```bash
npm install
npm run check
npm start
```

If a JavaScript syntax problem is suspected:

```bash
node --check index.js
```

Then check the relevant module reported by Node.

---

**No pairing code appears**

Check that the initial setup information is present and valid:

```
database/setup.json
```

Then restart:

```bash
npm start
```

Make sure the phone number uses international format.

---

**The bot logs out**

If WhatsApp authentication has been invalidated or logged out, the existing session may need to be removed and the bot paired again.

Do not delete the session directory casually while troubleshooting unless you understand that doing so can require a new authentication process.

---

**Translation changes are not appearing**

Run:

```bash
npm run translate
```

Then verify the generated language files and restart the bot if necessary.

---

📢 NEXORA Updates

Follow the official NEXORA WhatsApp Channel for:

- 🚀 New features
- 🛠️ Improvements
- 🐛 Bug fixes
- 📚 Usage information
- 🔔 Project announcements

Official WhatsApp Channel:

https://whatsapp.com/channel/0029VbCmque7Noa0J2BLR82e

---

🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

Before making a contribution:

1. Fork the repository.
2. Create a separate branch for your changes.
3. Keep changes focused.
4. Test the affected functionality.
5. Check JavaScript syntax.
6. Avoid committing runtime credentials or private data.
7. Update documentation when behavior changes.
8. Submit a clear pull request.

For larger changes, opening an issue first can help establish the intended direction.

---

🧹 Development Philosophy

NEXORA is designed around a few simple principles:

**Keep features modular**

Commands should remain commands.

Events should remain events.

Reusable functionality should live in "lib/".

**Avoid unnecessary duplication**

Before creating a new helper or system, check whether an existing module already provides the required functionality.

**Protect runtime data**

Source code can be public.

Authentication credentials and private configuration should not be.

**Keep documentation synchronized**

When the architecture changes, update the README and related documentation instead of allowing old instructions to remain indefinitely.

---

📄 License

This project is released under the MIT License.

See the repository license file for the complete license text.

---

👤 Author

THE-WHISPERER

GitHub: https://github.com/sneakyuser5-netizen

---

✦ NEXORA

«Modular. Extensible. Built for WhatsApp.»
