#!/usr/bin/env node

const { spawn } = require("child_process");

const args = process.argv.slice(2);

let delay = 500;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--delay" && args[i + 1]) {
    const parsed = parseInt(args[i + 1], 10);
    if (isNaN(parsed) || parsed < 100) {
      console.error("Error: --delay must be a number >= 100 (milliseconds)");
      process.exit(1);
    }
    delay = parsed;
    args.splice(i, 2);
    break;
  }
  if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
press-one - Automatically presses 1 to accept changes.

Usage:
  press-one [--delay <ms>] <command> [args...]

Options:
  --delay <ms>  Delay between keypresses in ms (default: 500, min: 100)
  --help, -h    Show this help message

Examples:
  press-one claude
  press-one --delay 2000 claude "fix all the bugs"

Warning:
  This will blindly accept everything. Use --delay to give yourself
  time to Ctrl+C before your repo becomes modern art.
`);
    process.exit(0);
  }
}

if (args.length === 0) {
  console.error("Error: No command specified. Run press-one --help for usage.");
  process.exit(1);
}

console.log(`press-one: Starting "${args.join(" ")}" with ${delay}ms delay`);
console.log("press-one: Will press 1 every time input is needed.");
console.log("press-one: Ctrl+C to stop before it's too late.\n");

// Python helper that allocates a real PTY for the child process.
// The child (e.g. claude) sees a TTY and runs interactively.
// We read from our piped stdin and forward to the PTY master.
const pyHelper = `
import pty, os, sys, select, signal, struct, fcntl, termios

args = sys.argv[1:]
pid, fd = pty.fork()

if pid == 0:
    os.execvp(args[0], args)
else:
    # Forward SIGINT to child
    signal.signal(signal.SIGINT, lambda s, f: os.kill(pid, signal.SIGINT))
    signal.signal(signal.SIGTERM, lambda s, f: os.kill(pid, signal.SIGTERM))

    # Set stdin to non-blocking
    import fcntl, os
    flags = fcntl.fcntl(sys.stdin.fileno(), fcntl.F_GETFL)
    fcntl.fcntl(sys.stdin.fileno(), fcntl.F_SETFL, flags | os.O_NONBLOCK)

    alive = True
    while alive:
        try:
            rlist, _, _ = select.select([fd, sys.stdin.fileno()], [], [], 0.05)
        except (ValueError, OSError):
            break
        for r in rlist:
            if r == fd:
                try:
                    data = os.read(fd, 16384)
                    if not data:
                        alive = False
                        break
                    sys.stdout.buffer.write(data)
                    sys.stdout.buffer.flush()
                except OSError:
                    alive = False
                    break
            elif r == sys.stdin.fileno():
                try:
                    data = os.read(sys.stdin.fileno(), 4096)
                    if not data:
                        continue
                    os.write(fd, data)
                except OSError:
                    pass

    try:
        _, status = os.waitpid(pid, 0)
        sys.exit(os.WEXITSTATUS(status) if os.WIFEXITED(status) else 1)
    except ChildProcessError:
        sys.exit(0)
`;

const child = spawn("python3", ["-c", pyHelper, ...args], {
  stdio: ["pipe", "inherit", "inherit"],
  env: process.env,
});

const interval = setInterval(() => {
  try {
    if (!child.stdin.destroyed) {
      child.stdin.write("1");
    }
  } catch {
    clearInterval(interval);
  }
}, delay);

child.on("error", (err) => {
  clearInterval(interval);
  console.error(`press-one: Failed to start command: ${err.message}`);
  process.exit(1);
});

child.on("close", (code) => {
  clearInterval(interval);
  console.log(`\npress-one: Command exited with code ${code}`);
  process.exit(code ?? 0);
});

process.on("SIGINT", () => {
  clearInterval(interval);
  child.kill("SIGINT");
});

process.on("SIGTERM", () => {
  clearInterval(interval);
  child.kill("SIGTERM");
});
