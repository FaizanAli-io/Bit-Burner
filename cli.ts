import type { NS } from '@ns';
/**
 * Small, dependency-free CLI documentation helper for Bitburner scripts.
 *
 * Example:
 *   import { printHelp } from '/cli.js';
 *   if (printHelp(ns, { usage: 'foo.js [mode]', description: 'Does a thing.' })) return;
 */
export function isHelpRequested(ns: NS) {
  return ns.args.includes('--help') || ns.args.includes('-h') || ns.args[0] === 'help';
}

export function printHelp(ns: NS, { usage, description, args = [], examples = [] }, force = false) {
  if (!force && !isHelpRequested(ns)) return false;

  ns.tprint(description);
  ns.tprint(`Usage: run ${usage}`);

  if (args.length) {
    ns.tprint('\nArguments:');
    for (const { name, description: detail } of args) {
      ns.tprint(`  ${name.padEnd(18)} ${detail}`);
    }
  }

  if (examples.length) {
    ns.tprint('\nExamples:');
    for (const example of examples) ns.tprint(`  run ${example}`);
  }

  return true;
}
