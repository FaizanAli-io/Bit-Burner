import type { NS } from '@ns';
export function tryCrack(ns: NS, host) {
  const tools = [
    ['SQLInject.exe', (h) => ns.sqlinject(h)],
    ['HTTPWorm.exe', (h) => ns.httpworm(h)],
    ['relaySMTP.exe', (h) => ns.relaysmtp(h)],
    ['FTPCrack.exe', (h) => ns.ftpcrack(h)],
    ['BruteSSH.exe', (h) => ns.brutessh(h)],
  ];
  let needed = ns.getServerNumPortsRequired(host);
  for (const [file, use] of tools) {
    if (needed <= 0) break;
    if (ns.fileExists(file)) {
      use(host);
      needed--;
    }
  }
  return needed <= 0 ? ns.nuke(host) : false;
}
