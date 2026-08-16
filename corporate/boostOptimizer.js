const MATERIALS = ['Robots', 'AI Cores', 'Hardware', 'Real Estate'];

function optimizeCorpoMaterialsRaw(matSizes, divWeights, spaceConstraint, round) {
  const totalWeight = divWeights.reduce((a, b) => a + b, 0);
  const totalSize = matSizes.reduce((a, b) => a + b, 0);
  const result = [];

  for (let i = 0; i < matSizes.length; i++) {
    const size = matSizes[i];
    const weight = divWeights[i];

    let m =
      (spaceConstraint - 500 * ((size / weight) * (totalWeight - weight) - (totalSize - size))) /
      (totalWeight / weight) /
      size;

    if (weight <= 0 || m < 0) {
      return optimizeCorpoMaterialsRaw(
        matSizes.toSpliced(i, 1),
        divWeights.toSpliced(i, 1),
        spaceConstraint,
        round,
      ).toSpliced(i, 0, 0);
    }

    result.push(round ? Math.round(m) : m);
  }

  return result;
}

export function optimizeCorpoMaterials(ns, division, space, round = true) {
  const corp = ns.corporation;
  const type = corp.getDivision(division).type;
  const industry = corp.getIndustryData(type);

  const weights = [
    industry.robotFactor,
    industry.aiCoreFactor,
    industry.hardwareFactor,
    industry.realEstateFactor,
  ];

  const sizes = MATERIALS.map((m) => corp.getMaterialData(m).size);

  const resultArray = optimizeCorpoMaterialsRaw(sizes, weights, space, round);

  return Object.fromEntries(MATERIALS.map((mat, i) => [mat, resultArray[i]]));
}

export async function main(ns) {
  ns.ui.openTail();
  const corp = ns.corporation;
  const divisions = corp.getCorporation().divisions;

  const boostPercents = {
    'Toba 1': 0.25,
    'Agro 1': 0.25,
    'Chem 1': 0.75,
  };

  while (true) {
    for (const division of divisions) {
      const cities = corp.getDivision(division).cities;

      for (const city of cities) {
        const warehouse = corp.getWarehouse(division, city);
        const storageCap = warehouse.size * boostPercents[division];
        const targets = optimizeCorpoMaterials(ns, division, storageCap);

        for (const [mat, target] of Object.entries(targets)) {
          const current = corp.getMaterial(division, city, mat).stored;

          const diff = target - current;
          const amt = Math.round(diff / 10);

          if (amt > 0) {
            corp.buyMaterial(division, city, mat, amt);
          } else if (amt < 0) {
            corp.sellMaterial(division, city, mat, -amt, 'MP');
          } else {
            corp.buyMaterial(division, city, mat, 0);
            corp.sellMaterial(division, city, mat, 0, 'MP');
          }
          if (amt !== 0)
            ns.print(
              `${division.padEnd(15)} | ` +
                `${city.padEnd(15)} | ` +
                `${mat.padEnd(12)} | ` +
                `${ns.format.number(diff).padStart(10)}`,
            );
        }
      }

      ns.print('-'.repeat(60) + '\n');
    }

    ns.print('\n\n');

    await corp.nextUpdate();
  }
}

const prettify = (obj) => JSON.stringify(obj, null, 2);
