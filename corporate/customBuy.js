/** @param {NS} ns */
export async function main(ns) {
  const corp = ns.corporation;
  const amount = ns.args[0] || 0;
  const buy = ns.args[1] || false;

  if (!amount || amount <= 0) {
    ns.tprint('Please specify a valid amount.');
    return;
  }

  const buyAmount = amount - corp.getOffice('Toba 1', 'Sector-12').size;

  if (buyAmount <= 0) {
    ns.tprint('Buy amount is invalid: ', buyAmount);
    return;
  }

  const division = 'Toba 1';
  const city = 'Sector-12';

  const cost = corp.getOfficeSizeUpgradeCost(division, city, buyAmount);
  ns.tprint(`Upgrade cost for ${buyAmount} employees: ${ns.format.number(cost)}`);

  if (buy) {
    const funds = corp.getCorporation().funds;

    if (cost > funds) {
      ns.tprint('Not enough funds to upgrade office size.');
      ns.tprint('Current Funds: ', ns.format.number(funds));
      return;
    }

    corp.upgradeOfficeSize(division, city, buyAmount);

    const office = corp.getOffice(division, city);
    const diff = office.size - office.numEmployees;

    for (let i = 0; i < diff; i++) {
      corp.hireEmployee(division, city, 'Research & Development');
    }
  }
}
