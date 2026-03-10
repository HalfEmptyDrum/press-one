# press-one

Automatically presses `1` to accept changes. For the lazy and the brave.

Born from the Claude Code workflow where you mash `1` to accept every change — now automated, so your fingers can rest while your repo burns.

## Install

```bash
npm install -g press-one
```

## Usage

```bash
press-one [--delay <ms>] <command> [args...]
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--delay <ms>` | Delay between keypresses in milliseconds | `500` |
| `--help` | Show help | — |

### Examples

```bash
# Just vibes
press-one claude

# With some breathing room
press-one --delay 2000 claude "fix all the bugs"

# Maximum trust
press-one --delay 100 claude "refactor everything"
```

## How it works

1. Spawns your command in a pseudo-TTY (so it thinks it's a real terminal)
2. Pipes `1` into stdin on a loop
3. That's it. That's the whole thing.

## Known "features"

- **The 1s are always flowing.** While the command is thinking, you'll see a gentle stream of `11111` in the terminal. This is not a bug — it's a meditation on trust. You chose to press one. Now one presses itself.
- **You can't type.** Stdin belongs to the machine now. If you need to intervene, `Ctrl+C` and start over like a person who reads diffs.

## Warning

This will blindly accept **everything**. Use `--delay` to give yourself time to `Ctrl+C` before your repo becomes modern art.

## Requirements

- Node.js >= 16
- Python 3 (used internally for PTY allocation — preinstalled on macOS and most Linux)

## License

MIT
