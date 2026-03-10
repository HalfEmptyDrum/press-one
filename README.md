# press-one

Automatically presses `1` to accept changes. For the lazy and the brave.

Born from the Claude Code workflow where you mash `1` to accept every change — now automated, so your fingers can rest while your repo burns.

## Install

```bash
npm install -g press-one
```

## Usage

```bash
press-one <command> [args...]
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

1. Spawns your command as a child process
2. Pipes `1\n` into stdin on a loop
3. That's it. That's the whole thing.

## Warning

This will blindly accept **everything**. Use `--delay` to give yourself time to `Ctrl+C` before your repo becomes modern art.

## License

MIT
