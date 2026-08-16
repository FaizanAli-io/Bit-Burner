export async function main(ns) {
  await ns.hack(String(ns.args[0]), { additionalMsec: Number(ns.args[1]) });
}
