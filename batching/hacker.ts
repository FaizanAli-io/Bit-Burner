import type { NS } from '@ns';
export async function main(ns: NS) {
  await ns.hack(String(ns.args[0]), { additionalMsec: Number(ns.args[1]) });
}
