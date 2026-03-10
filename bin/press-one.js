#!/usr/bin/env node

const { spawn, execFileSync } = require("child_process");
const os = require("os");

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

// Build the shell command string with proper escaping
const shellCmd = args
  .map((a) => (a.includes(" ") || a.includes('"') ? `'${a.replace(/'/g, "'\\''")}'` : a))
  .join(" ");

console.log(`press-one: Starting "${args.join(" ")}" with ${delay}ms delay`);
console.log("press-one: Will press 1 every time input is needed.");
console.log("press-one: Ctrl+C to stop before it's too late.\n");

// Use `script` to allocate a real PTY without native modules.
// macOS and Linux have different `script` syntax.
const isDarwin = os.platform() === "darwin";
const scriptArgs = isDarwin
  ? ["-q", "/dev/null", "/bin/zsh", "-i", "-c", shellCmd]
  : ["-qfc", shellCmd, "/dev/null"];

const child = spawn("script", scriptArgs, {
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
