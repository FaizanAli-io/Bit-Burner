# Bitburner Automation Suite

This repository contains Netscript automation for server infiltration, infrastructure, target analysis, HWGW batching, factions, gangs, Bladeburner, sleeves, augmentations, grafting, and corporations.

The source is written in TypeScript. The `.ts` files are the maintainable source files; Bitburner itself executes compiled JavaScript, so a TypeScript-to-JavaScript build/copy step is required before uploading scripts to the game.

## Quick start

Run the manager from `home`:

```text
run manager.js c
```

Manager flags can be combined:

```text
run manager.js dkc
```

- `d` starts the purchased-server RAM display.
- `k` starts the karma monitor.
- `c` starts the target analyzer and HWGW batch controller.
- `t` enables a timer tail for controller batches.

The manager runs progression workers automatically. Use `stop.js` to stop the automation across the managed servers.

## Command-line documentation

The complete command registry is in `docs.js` and is formatted by the reusable helper in `cli.js`.

```text
run docs.js all
run docs.js controller.js
run docs.js sleeve.js
run docs.js --help
```

Every runnable script is registered in `docs.js`, including scripts with no arguments. The standard help convention for future scripts is:

```js
import { printHelp } from '/cli.js';

export async function main(ns) {
  if (
    printHelp(ns, {
      usage: 'example.js <target>',
      description: 'Does something useful.',
      args: [{ name: 'target', description: 'Server hostname.' }],
    })
  )
    return;
}
```

Help is requested with `--help`, `-h`, or `help` where a script explicitly implements the helper. For the full suite, `docs.js` is the canonical index and does not execute the documented script.

## Development commands

```text
npm run format
npm run typecheck
```

`npm run typecheck` currently reports several pre-existing dynamic API assumptions in the automation code, especially around `ns.args` and strict game enums. Those diagnostics are intentional and identify places where stronger types can be added incrementally.

## Main subsystems

- `manager.js`: orchestration and progression workers.
- `analyze.js`: target selection and profitability analysis.
- `primer.js`: prepares a server for batching.
- `controller.js`: launches hack/grow/weaken batches.
- `batching/`: individual batch operations.
- `workers/`: server discovery, cracking, purchasing, and upgrades.
- `factions/`, `corporate/`, and root-level automation scripts: progression systems.
- `lists/`: generated server lists used by the workers and batch controller.

## Operational notes

Scripts communicate through Netscript ports and generated list files. Start the manager from `home`, and avoid running multiple managers simultaneously because they can compete over the same ports and player actions.
