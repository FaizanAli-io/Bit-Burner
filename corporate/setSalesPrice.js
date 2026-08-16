/** Threshold Constants */
const STORED_THRESHOLD = 100; // stored > 100 → reduce 0.05
const SURPLUS_HIGH_THRESHOLD = 10; // surplus > 10 → reduce 0.01
const SURPLUS_LOW_THRESHOLD = 10; // surplus < 10 → increase 0.01

/** Color Constants (ANSI) */
const COLOR_RESET = '\x1b[0m';
const COLOR_RED = '\x1b[31m'; // decreasing price
const COLOR_GREEN = '\x1b[32m'; // increasing price
const COLOR_YELLOW = '\x1b[33m'; // neutral or unchanged

/** @param {NS} ns */
export async function main(ns) {
  ns.ui.openTail();
  const corp = ns.corporation;

  const division = ns.args[0];
  if (!division) {
    ns.tprint('Please provide a division name as the first argument');
    return;
  }

  const mode = ns.args[1];

  if (!mode) {
    ns.tprint('Please specify a mode');
    return;
  }

  if (mode === 1) {
    sellAtFactor(corp, division, ns.args[2]);
  } else if (mode === 2) {
    setMarketTA2(corp, division, true);
  }
}

function sellAtFactor(corp, division, factor) {
  if (!factor) {
    console.error('Please provide a factor as the second argument');
    return;
  }

  const price = factorToSellPrice(factor);
  const divisionData = corp.getDivision(division);

  const cities = divisionData.cities;
  const mats = corp.getIndustryData(divisionData.type).producedMaterials;

  for (const city of cities) {
    for (const mat of mats) {
      corp.sellMaterial(division, city, mat, 'MAX', price);
    }
  }
}

function setMarketTA2(corp, division, on) {
  const divisionData = corp.getDivision(division);

  const cities = divisionData.cities;
  const mats = corp.getIndustryData(divisionData.type).producedMaterials;

  for (const city of cities) {
    for (const mat of mats) {
      corp.setMaterialMarketTA2(division, city, mat, on);
    }
  }
}

const prettify = (obj) => JSON.stringify(obj, null, 2);
const factorToSellPrice = (f) => (f === 1 ? 'MP' : `MP*${f}`);
