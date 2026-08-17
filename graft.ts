import type { NS } from '@ns';
import { getAugmentationsData } from '/installCost.js';
export async function main(ns: NS) {
  const g = ns.grafting;
  const purchasable = getAugmentationsData(ns).map((x) => x[0]);
  const grafts = g
    .getGraftableAugmentations()
    .map((x) => [x, g.getAugmentationGraftTime(x)])
    .filter((x) => !purchasable.includes(x[0]))
    .sort((a, b) => Number(a[1]) - Number(b[1]));
  for (const graft of grafts) {
    if (ns.args[0] !== 'LOG') {
      await g.waitForOngoingGrafting();
      g.graftAugmentation(graft[0], false);
    }
    ns.tprint(`${graft[0].padEnd(60)} ${ns.format.time(graft[1])}`);
  }
}
