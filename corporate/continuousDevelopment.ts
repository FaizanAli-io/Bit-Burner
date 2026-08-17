import type { NS } from '@ns';
export async function main(ns: NS) {
  const corp = ns.corporation;
  const division = 'Toba 1';
  const city = 'Sector-12';
  ns.disableLog('ALL');
  ns.ui.openTail();
  while (true) {
    discontinue(ns, division);
    const name = `TobaProduct-${Date.now()}`;
    const invest = corp.getCorporation().funds / 20;
    corp.makeProduct(division, city, name, invest, invest);
    while (true) {
      const product = corp.getProduct(division, city, name);
      const progress = product.developmentProgress;
      if (progress >= 100) break;
      await marketing(ns, division);
      await corp.nextUpdate();
    }
    corp.sellProduct(division, city, name, 'MAX', 'MP', true);
    corp.setProductMarketTA2(division, name, true);
  }
}
function discontinue(ns: NS, division) {
  const corp = ns.corporation;
  const divisionData = corp.getDivision(division);
  const maxProducts = divisionData.maxProducts;
  const products = divisionData.products;
  if (products.length === maxProducts) {
    const sortedProducts = products
      .map((product) => [product, Number(product.split('-')[1])])
      .sort((a, b) => a[1] - b[1]);
    const productToDiscontinue = sortedProducts[0][0];
    ns.print(`Discontinuing product: ${productToDiscontinue}`);
    corp.discontinueProduct(division, productToDiscontinue);
  }
}
async function marketing(ns: NS, division) {
  const corp = ns.corporation;
  const divisionData = corp.getDivision(division);
  const popularity = divisionData.popularity;
  const awareness = divisionData.awareness;
  if (popularity > 175e306 || awareness > 175e306) return;
  let funds = corp.getCorporation().funds;
  let hireAdVertCost = corp.getHireAdVertCost(division);
  let wilsonCost = corp.getUpgradeLevelCost('Wilson Analytics');
  while (funds / 2 > wilsonCost) {
    await ns.sleep(100);
    corp.levelUpgrade('Wilson Analytics');
    funds = corp.getCorporation().funds;
    wilsonCost = corp.getUpgradeLevelCost('Wilson Analytics');
    ns.print('Upgrading Wilson Analytics for ' + ns.format.number(wilsonCost));
  }
  while (funds / 10 > hireAdVertCost) {
    await ns.sleep(100);
    corp.hireAdVert(division);
    funds = corp.getCorporation().funds;
    hireAdVertCost = corp.getHireAdVertCost(division);
    ns.print('Hired Adverts for ' + ns.format.number(hireAdVertCost));
  }
}
const prettify = (obj) => JSON.stringify(obj, null, 2);
