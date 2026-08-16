const jobs = ['Operations', 'Engineer', 'Business', 'Management', 'Research & Development'];

export async function main(ns) {
  const corp = ns.corporation;
  const amount = ns.args[0];

  if (!amount || amount <= 0) {
    ns.tprint('Please specify a valid amount.');
    return;
  }

  const divisions = corp.getCorporation().divisions;

  for (const division of divisions) {
    const cities = corp.getDivision(division).cities;

    for (const city of cities) {
      const failure = increaseEmployees(ns, corp, division, city, amount);
      if (failure) return;
    }
  }
}

function increaseEmployees(ns, corp, division, city, amount) {
  const maxEmployees = corp.getOffice(division, city).size;

  if (maxEmployees < amount) {
    const funds = corp.getCorporation().funds;
    const cost = corp.getOfficeSizeUpgradeCost(division, city, amount - maxEmployees);
    const difference = cost - funds;

    if (difference > 0) {
      ns.tprint(`${division}-${city}: Missing ${ns.format.number(difference)}`);
      ns.tprint(`${ns.format.number(funds)} / ${ns.format.number(cost)}`);
      return true;
    }

    corp.upgradeOfficeSize(division, city, amount - maxEmployees);
  }

  const numEmployees = corp.getOffice(division, city).numEmployees;

  if (numEmployees < amount) {
    for (let i = 0; i < amount - numEmployees; i++) {
      corp.hireEmployee(division, city, 'Research & Development');
    }
  }

  assignJobs(corp, division, city);
}

function assignJobs(corp, division, city) {
  for (const job of jobs) {
    corp.setJobAssignment(division, city, job, 0);
  }

  const totalEmployees = corp.getOffice(division, city).numEmployees;
  const empPerJob = Math.floor(totalEmployees / 5);

  if (city !== 'Sector-12' && division === 'Toba 1') {
    corp.setJobAssignment(division, city, jobs[4], totalEmployees);
  } else {
    for (const job of jobs) {
      corp.setJobAssignment(division, city, job, empPerJob);
    }
  }
}

const prettify = (obj) => JSON.stringify(obj, null, 2);
