import type { NS } from '@ns';
import { buySleeveAugs } from '/sleeve.js';
export async function main(ns: NS) {
  const s = ns.singularity;
  const augFormat = (x) => x[0].padEnd(60) + ns.format.number(x[1]).padEnd(20) + x[2];
  const orderedList = getAugmentationsData(ns, s);
  orderedList.forEach((x) => ns.tprint(augFormat(x)));
  ns.tprint(`Total Installation Cost: ${ns.format.number(calculateTotalCost(orderedList))}`);
  if (ns.args.includes('BUY')) {
    let actual = 0;
    for (const aug of orderedList) {
      actual += s.getAugmentationPrice(aug[0]);
      s.purchaseAugmentation(aug[2], aug[0])
        ? ns.tprint('Success: ', augFormat(aug))
        : ns.tprint('Failure: ', augFormat(aug));
      await ns.sleep(500);
    }
    ns.tprint(`Total Spent: ${ns.format.number(actual)}`);
    buySleeveAugs(ns);
  }
  if (ns.args.includes('NFG')) {
    buyNeuroFluxGovernor(ns, s);
  }
}
function buyNeuroFluxGovernor(ns: NS, s) {
  let factions = ns
    .getPlayer()
    .factions.map((x) => ({ name: x, rep: s.getFactionRep(x) }))
    .sort((a, b) => b.rep - a.rep);
  if (factions.length === 0) {
    ns.tprint('No Faction to purchase from');
    return;
  }
  let count = 0;
  let success = true;
  const bestFaction = factions[0];
  const aug = 'NeuroFlux Governor';
  const F = (x) => ns.format.number(x);
  if (ns.args.includes('BUY')) {
    while (success) {
      success = s.purchaseAugmentation(bestFaction.name, aug);
      if (!success) {
        const reqRep = s.getAugmentationRepReq(aug);
        const playerRep = s.getFactionRep(bestFaction.name);
        if (playerRep < reqRep) {
          const donationAmount = ns.getPlayer().money / 100;
          s.donateToFaction(bestFaction.name, donationAmount);
          success = s.purchaseAugmentation(bestFaction.name, aug);
          ns.tprint(`Donated ${F(donationAmount)} to ${bestFaction.name}`);
        }
      }
      count += success ? 1 : 0;
    }
    ns.tprint('Purchased ', count, ' NFGs');
    ns.tprint('Faction: ', bestFaction.name);
    ns.tprint('Money: ', F(ns.getPlayer().money), ' / ', F(s.getAugmentationPrice(aug)));
    ns.tprint('Reputation: ', F(bestFaction.rep), ' / ', F(s.getAugmentationRepReq(aug)));
  } else {
    const playerRep = bestFaction.rep;
    let playerMoney = ns.getPlayer().money;
    const augRep = s.getAugmentationRepReq(aug);
    const augPrice = s.getAugmentationPrice(aug);
    let updatedRep = augRep;
    let updatedPrice = augPrice;
    let buyable = 0;
    while (playerRep >= updatedRep && playerMoney >= updatedPrice) {
      playerMoney -= updatedPrice;
      buyable++;
      updatedRep *= 1.14;
      updatedPrice *= 1.9;
    }
    ns.tprint(`Can buy ${buyable} NeuroFlux Governors from ${bestFaction.name}`);
    ns.tprint(`P: ${F(playerMoney)} / ${F(augPrice)} ->  ${F(updatedPrice)}`);
    ns.tprint(`R: ${F(playerRep)} / ${F(augRep)} ->  ${F(updatedRep)}`);
  }
}
export function getAugmentationsData(ns: NS, s) {
  let augments = [];
  let ownedAugs = s.getOwnedAugmentations(true);
  ns.getPlayer().factions.forEach((x) => {
    augments = augments.concat(
      s
        .getAugmentationsFromFaction(x)
        .filter(
          (y) =>
            !ownedAugs.includes(y) &&
            !augments.map((z) => z[1]).includes(y) &&
            s.getAugmentationRepReq(y) < s.getFactionRep(x),
        )
        .map((y) => [x, y]),
    );
  });
  const hackMults = [
    'faction_rep',
    'hacking_chance',
    'hacking_exp',
    'hacking_grow',
    'hacking_money',
    'hacking_speed',
    'hacking',
  ];
  const bladeMults = [
    'bladeburner_analysis',
    'bladeburner_max_stamina',
    'bladeburner_stamina_gain',
    'bladeburner_success_chance',
    'charisma',
    'charisma_exp',
    'defense',
    'defense_exp',
    'dexterity',
    'dexterity_exp',
    'agility',
    'agility_exp',
    'strength',
    'strength_exp',
    'faction_rep',
  ];
  const limit = typeof ns.args[0] === 'number' ? ns.args[0] : 1e30;
  const mults = ns.args.includes('hack') ? hackMults : ns.args.includes('blade') ? bladeMults : [];
  if (mults.length > 0)
    augments = augments.filter((x) => mults.some((mult) => s.getAugmentationStats(x[1])[mult] > 1));
  augments = augments
    .map((x) => [x[1], s.getAugmentationPrice(x[1]), x[0]])
    .filter((x) => !ns.args[0] || x[1] < limit)
    .sort((a, b) => b[1] - a[1]);
  return getAugmentationOrder(ns, augments);
}
function getAugmentationOrder(ns: NS, augmentList) {
  const orderedList = [];
  const bought = /* @__PURE__ */ new Set();
  const buyAugmentation = (augment) => {
    const s = ns.singularity;
    for (const preReq of s.getAugmentationPrereq(augment[0])) {
      if (s.getOwnedAugmentations(true).includes(preReq) || bought.has(preReq)) continue;
      const preReqAug = augmentList.find((aug) => aug[0] === preReq);
      if (preReqAug) buyAugmentation(preReqAug);
    }
    if (!bought.has(augment[0])) {
      orderedList.push(augment);
      bought.add(augment[0]);
    }
  };
  augmentList.forEach((augment) => buyAugmentation(augment));
  return orderedList;
}
function calculateTotalCost(augments) {
  let totalCost = 0;
  for (let i = 0; i < augments.length; i++) {
    totalCost += augments[i][1];
    for (let j = i + 1; j < augments.length; j++) {
      augments[j][1] *= 1.9;
    }
  }
  return totalCost;
}
