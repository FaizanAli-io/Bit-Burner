import type { NS } from '@ns';
const upgradeName = 'Smart Storage';

const warehouseSteps = 1;

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.ui.openTail();
  const corp = ns.corporation;

  while (true) {
    const corporation = corp.getCorporation();

    const funds = corporation.funds / 100;
    const divisions = corporation.divisions;

    for (const division of divisions) {
      const cities = corp.getDivision(division).cities;

      const { cityData, totalSize, bestCity } = collectCityData(corp, division, cities);
      const { upgradeLevels, expensePerUnit, upgradeCost } = collectUpgradeData(corp, totalSize);

      if (bestCity.expensePerUnit < expensePerUnit) {
        if (funds > cityData[bestCity.city][3])
          corp.upgradeWarehouse(division, bestCity.city, warehouseSteps);
      } else {
        if (funds > upgradeCost) corp.levelUpgrade(upgradeName);
      }

      [
        [
          division,
          upgradeName,
          upgradeLevels,
          ns.format.number(expensePerUnit),
          ns.format.number(upgradeCost),
        ],
        ...Object.entries(cityData).map(([city, data]) => [
          division,
          city,
          data[0],
          ns.format.number(data[2]),
          ns.format.number(data[3]),
        ]),
      ].forEach((entry) => {
        const [division, city, level, pricePerUnit, totalPrice] = entry;

        ns.print(
          division.padEnd(5) +
            ' - ' +
            city.padEnd(15) +
            ' | ' +
            level.toString().padEnd(8) +
            ' | ' +
            pricePerUnit.padEnd(12) +
            ' | ' +
            ns.format.number(totalPrice).padStart(10),
        );
      });

      ns.print('\n');
    }

    ns.print('\n');

    await corp.nextUpdate();
  }
}

function collectCityData(corp, division, cities) {
  let cityData = {};
  let totalSize = 0;
  let bestCity = { expensePerUnit: Infinity, city: '' };

  for (const city of cities) {
    const warehouse = corp.getWarehouse(division, city);
    const upgradeIncrease = warehouse.size / warehouse.level;
    const upgradeCost = corp.getUpgradeWarehouseCost(division, city, warehouseSteps);
    const expensePerUnit = upgradeCost / upgradeIncrease;

    cityData[city] = [warehouse.level, upgradeIncrease, expensePerUnit, upgradeCost];
    totalSize += warehouse.size;

    if (expensePerUnit < bestCity.expensePerUnit) {
      bestCity = { expensePerUnit, city };
    }
  }

  return { cityData, totalSize, bestCity };
}

function collectUpgradeData(corp, totalSize) {
  const upgradeLevels = corp.getUpgradeLevel(upgradeName);
  const upgradeCost = corp.getUpgradeLevelCost(upgradeName);
  const upgradeIncrease = (1 / upgradeLevels) * totalSize;
  const expensePerUnit = upgradeCost / upgradeIncrease;

  return { upgradeLevels, upgradeIncrease, expensePerUnit, upgradeCost };
}

const prettify = (obj) => JSON.stringify(obj, null, 2);
