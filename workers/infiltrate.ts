import type { NS } from '@ns';
import { tryCrack } from '/crack.js';
export function main(ns: NS) {
  new Infiltrator(ns).infiltrate();
}
export class Infiltrator {
  ns: NS;
  done = false;
  constructor(ns: NS) {
    this.ns = ns;
  }
  infiltrate() {
    this.writeServerList(this.ns);
    this.crackServerList(this.ns);
    this.ns.writePort(this.ns.pid, this.done);
  }
  writeServerList(ns) {
    const servers = this.buildServerList(ns, 'home', {});
    const serverNames = Object.keys(servers)
      .filter((x) => x !== 'home' && !x.startsWith('myserver'))
      .sort()
      .sort((a, b) => servers[a].maxRam - servers[b].maxRam);
    ns.write('lists/servers.txt', serverNames.join('\n'), 'w');
  }
  crackServerList(ns) {
    const broken = [];
    for (const server of ns.read('./lists/servers.txt').split('\n')) {
      if (server && (ns.hasRootAccess(server) || tryCrack(ns, server))) {
        broken.push(server);
      }
    }
    ns.write('lists/broken.txt', broken.join('\n'), 'w');
    this.done = ns.fileExists('SQLInject.exe');
  }
  buildServerList(ns, root, nodeList) {
    for (const node of ns.scan(root)) {
      if (!nodeList[node]) {
        nodeList[node] = ns.getServer(node);
        this.buildServerList(ns, node, nodeList);
      }
    }
    return nodeList;
  }
}
