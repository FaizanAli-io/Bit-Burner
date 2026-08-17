import type { NS } from '@ns';
export async function main(ns: NS) {
  const files = ns.ls('home', '.js');
  const ramUsages = [];
  for (const file of files) {
    const ram = ns.getScriptRam(file, 'home');
    if (ram > 0) ramUsages.push({ file, ram });
  }
  ramUsages.sort((a, b) => b.ram - a.ram);
  for (const { file, ram } of ramUsages) {
    ns.tprintf('%-30s %.2f GB', file, ram);
  }
}
