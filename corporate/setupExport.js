const resetString = '0';
const exportString = '(IPROD+IINV/10)*(-1)';

/** @param {NS} ns */
export async function main(ns) {
  const corp = ns.corporation;
  const div1 = 'Agro 1';
  const div2 = 'Chem 1';
  const div3 = 'Toba 1';

  const cities = corp.getDivision(div1).cities;

  for (const city of cities) {
    corp.exportMaterial(div1, city, div3, city, 'Plants', exportString);
    corp.exportMaterial(div1, city, div2, city, 'Plants', exportString);
    corp.exportMaterial(div2, city, div1, city, 'Chemicals', exportString);

    // corp.cancelExportMaterial(div1, city, div3, city, 'Plants');
    // corp.cancelExportMaterial(div1, city, div2, city, 'Plants');
    // corp.cancelExportMaterial(div2, city, div1, city, 'Chemicals');
  }
}
