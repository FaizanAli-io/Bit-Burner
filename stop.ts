import type { NS } from '@ns';
export async function main(ns: NS) {
  const file = './lists/broken.txt';
  const servers = ns
    .read(file)
    .split('\n')
    .filter((x) => x)
    .concat(ns.cloud.getServerNames());
  servers.forEach((server) => ns.killall(server));
  ns.ui.clearTerminal();
  ns.killall();
}
