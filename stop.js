export async function main(ns) {
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
