import type { NS } from '@ns';
import { tryCrack } from '/crack.js';
export async function main(ns: NS) {
  let done = true;
  const factions = [
    ['CyberSec', 'CSEC'],
    ['NiteSec', 'avmnite-02h'],
    ['The Black Hand', 'I.I.I.I'],
    ['BitRunners', 'run4theh111z'],
  ];
  const player = ns.getPlayer();
  for (const [factionName, serverName] of factions) {
    if (!player.factions.includes(factionName)) {
      done = false;
      const path = findPath(ns, serverName);
      if (path) await joinFaction(ns, factionName, path);
    }
  }
  if (Boolean(ns.args[0])) await checkDemon(ns);
  ns.writePort(ns.pid, done);
}
async function checkDemon(ns: NS) {
  const target = 'w0r1d_d43m0n';
  const path = findPath(ns, target);
  if (!path) {
    ns.tprint(`Path to ${target} not found.`);
    return;
  }
  const required = ns.getServerRequiredHackingLevel(target);
  if (ns.getHackingLevel() < required) {
    ns.tprint(`Hacking level too low for ${target} (Needed: ${required})`);
    return;
  }
  if (!tryCrack(ns, target)) {
    ns.tprint(`Failed to crack ${target}`);
    ns.singularity.connect('home');
    return;
  }
  for (const node of path) ns.singularity.connect(node);
  await ns.singularity.installBackdoor();
  ns.singularity.connect('home');
}
function findPath(ns: NS, to, from = 'home') {
  if (from === to) return [to];
  const queue = [from];
  const parent = { [from]: null };
  const seen = /* @__PURE__ */ new Set([from]);
  while (queue.length) {
    const node = queue.shift();
    for (const child of ns.scan(node)) {
      if (seen.has(child)) continue;
      seen.add(child);
      parent[child] = node;
      if (child === to) {
        const path = [];
        let cur = child;
        while (cur && cur !== from) {
          path.push(cur);
          cur = parent[cur];
        }
        return path.reverse();
      }
      queue.push(child);
    }
  }
  return null;
}
async function joinFaction(ns: NS, faction, path) {
  const single = ns.singularity;
  for (const node of path) single.connect(node);
  const current = path[path.length - 1];
  const required = ns.getServerRequiredHackingLevel(current);
  if (ns.getHackingLevel() < required) {
    single.connect('home');
    return;
  }
  if (!tryCrack(ns, current)) {
    ns.tprint(`Failed to crack ${current}`);
    single.connect('home');
    return;
  }
  await single.installBackdoor();
  if (single.joinFaction(faction)) ns.tprint(`Joined ${faction}`);
  else ns.tprint(`Couldn't join ${faction}`);
  single.connect('home');
}
