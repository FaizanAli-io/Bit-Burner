/** @param {NS} ns */
export async function main(ns) {
  const b = ns.bladeburner;
  let healingNeeded = false;
  let verbose = ns.args[0] === 'v';

  while (true) {
    let actions = getActionsInfo(ns).raw;
    let general = getBladeburnerGeneralInfo(ns).raw;

    let bestCity = getBestCity(ns);
    let staminaPerc = general.stamina[0] / general.stamina[1];
    let bestSkill = getBestSkill(ns, general.blackOpsCompleted[0]);
    let analysisNeeded = actions.some((x) => x.successChance[1] - x.successChance[0] > 0.01);

    let chance = general.nextBlackOpSuccessChance;
    let blackOpActive = general.rank > general.nextBlackOpRank && chance[0] > 0.9;

    let runTask = (type, task) => {
      if (!general.currentAction || general.currentAction.name != task) b.startAction(type, task);
    };

    if (general.city != bestCity) {
      b.switchCity(bestCity);
    }

    if (staminaPerc > 0.9) {
      healingNeeded = false;
    } else if (staminaPerc < 0.5) {
      healingNeeded = true;
    }

    if (blackOpActive) {
      let chance = general.nextBlackOpSuccessChance;
      chance[1] - chance[0] > 0.01
        ? runTask('general', 'Field Analysis')
        : runTask('black operations', general.nextBlackOp);
    } else if (general.chaos > 50) {
      runTask('general', 'Diplomacy');
    } else if (analysisNeeded) {
      runTask('general', 'Field Analysis');
    } else if (healingNeeded) {
      runTask('general', 'Hyperbolic Regeneration Chamber');
    } else {
      let possible = actions
        .filter((x) => x.successChance[0] > 0.8)
        .sort((a, b) => b.repGainRate - a.repGainRate);

      if (general.population < 1e9) possible = possible.filter((x) => x.name != 'Raid');

      if (possible.length > 0) {
        let good = possible.filter(
          (x) => x.repGainRate >= possible[0].repGainRate / 10 && x.count >= 1,
        );

        good.length > 0
          ? runTask(good[0].actionType, good[0].name)
          : runTask('general', 'Incite Violence');
      } else {
        runTask('general', 'Training');
      }
    }

    if (!blackOpActive && general.skillPoints > bestSkill.cost) {
      if (verbose) ns.tprint(`Purchased ${bestSkill.name}\n\n`);
      b.upgradeSkill(bestSkill.name);
    }

    if (verbose) displayStats(ns);

    await b.nextUpdate();
  }
}

/** @param {NS} ns */
function getBestSkill(ns, blackOpsCompleted) {
  const b = ns.bladeburner;

  const skills = [
    { name: 'Reaper' },
    { name: 'Evasive System' },
    { name: 'Digital Observer' },
    { name: "Blade's Intuition" },
    { name: 'Overclock', max: 90 },
    { name: 'Datamancer', max: 40 },
    { name: "Cyber's Edge", max: 50 },
    ...(blackOpsCompleted < 18 ? [{ name: 'Cloak' }, { name: 'Short-Circuit' }] : []),
  ];

  skills.forEach((skill) => {
    const level = b.getSkillLevel(skill.name);
    skill.cost = b.getSkillUpgradeCost(skill.name);
    skill.value = skill.max && level >= skill.max ? 0 : (1 + 1 / level) / skill.cost;
  });

  return skills.reduce((max, skill) => (skill.value > max.value ? skill : max));
}

function getBestCity(ns) {
  const b = ns.bladeburner;
  const cities = ['Aevum', 'Chongqing', 'Sector-12', 'New Tokyo', 'Ishima', 'Volhaven'];

  return cities.reduce(
    (acc, city) => {
      let pop = b.getCityEstimatedPopulation(city);
      return pop > acc.pop ? { city, pop } : acc;
    },
    { city: null, pop: 0 },
  ).city;
}

function displayStats(ns) {
  const actions = getActionsInfo(ns).pretty;
  const general = getBladeburnerGeneralInfo(ns).pretty;

  pretty_print(ns, general);
  printTable(ns, 'Actions', actions);
}

/** @param {NS} ns */
function getBladeburnerGeneralInfo(ns) {
  const b = ns.bladeburner;

  const city = b.getCity();
  const blackop = b.getNextBlackOp();
  const allBlackops = b.getBlackOpNames();

  let raw = {
    city: city,
    chaos: b.getCityChaos(city),
    communities: b.getCityCommunities(city),
    population: b.getCityEstimatedPopulation(city),

    rank: b.getRank(),
    stamina: b.getStamina(),
    skillPoints: b.getSkillPoints(),
    currentAction: b.getCurrentAction(),

    nextBlackOp: blackop.name,
    nextBlackOpRank: blackop.rank,
    blackOpsCompleted: [allBlackops.indexOf(blackop.name), allBlackops.length],
    nextBlackOpSuccessChance: b.getActionEstimatedSuccessChance('black operations', blackop.name),
  };

  let pretty = {
    city: raw.city,
    chaos: ns.format.number(raw.chaos),
    population: ns.format.number(raw.population),
    communities: raw.communities,

    rank: ns.format.number(raw.rank),
    skillPoints: ns.format.number(raw.skillPoints),
    stamina: raw.stamina.map((x) => ns.format.number(x)).join(' / '),

    bonus: ns.format.time(b.getBonusTime()),
    currentActionTime: ns.format.time(b.getActionCurrentTime()),
    currentActionTotalTime: !raw.currentAction
      ? null
      : ns.format.time(b.getActionTime(raw.currentAction.type, raw.currentAction.name)),

    nextBlackOp: raw.nextBlackOp,
    nextBlackOpRank: ns.format.number(raw.nextBlackOpRank),
    blackOpsCompleted: raw.blackOpsCompleted.join(' / '),
    nextBlackOpSuccessChance: raw.nextBlackOpSuccessChance
      .map((x) => ns.format.percent(x))
      .join(' - '),
  };

  return { raw, pretty };
}

/** @param {NS} ns */
function getActionsInfo(ns) {
  const b = ns.bladeburner;

  const actions = [
    ...b.getContractNames().map((x) => ({ name: x, type: 'contract' })),
    ...b.getOperationNames().map((x) => ({ name: x, type: 'operation' })),
  ];

  let { raw, pretty } = actions.reduce(
    (acc, action) => {
      let { name, type } = action;

      let raw = {
        name: name,
        actionType: type,
        time: b.getActionTime(type, name),
        maxLevel: b.getActionMaxLevel(type, name),
        successes: b.getActionSuccesses(type, name),
        count: b.getActionCountRemaining(type, name),
        currentLevel: b.getActionCurrentLevel(type, name),
        successChance: b.getActionEstimatedSuccessChance(type, name),
      };

      raw.repGain = b.getActionRepGain(type, name, raw.currentLevel);
      raw.repGainRate = raw.repGain / (raw.time / 1000);

      let pretty = {
        name: raw.name,
        type: raw.actionType,
        time: ns.format.time(raw.time),
        count: ns.format.number(raw.count),
        successes: ns.format.number(raw.successes),
        currentLevel: ns.format.number(raw.currentLevel),
        repGainRate: ns.format.number(raw.repGainRate),
        successChance: raw.successChance.map((x) => ns.format.percent(x)).join(' - '),
      };

      acc.raw.push(raw);
      acc.pretty.push(pretty);

      return acc;
    },
    { raw: [], pretty: [] },
  );

  pretty = pretty.sort((a, b) => b.repGainRate - a.repGainRate);

  return { raw, pretty };
}

/** @param {NS} ns */
function printTable(ns, title, data) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((header) => String(row[header])));
  const colWidths = headers.map((header, i) =>
    Math.max(header.length, ...rows.map((row) => row[i].length)),
  );

  const formatRow = (row) => row.map((val, i) => val.padEnd(colWidths[i])).join(' | ');

  let dashes = '-'.repeat(colWidths.reduce((sum, w) => sum + w, headers.length * 3 - 1));

  let output = title + '\n';
  output += dashes + '\n';
  output += formatRow(headers) + '\n';
  output += dashes + '\n';
  rows.forEach((row) => (output += formatRow(row) + '\n'));
  output += '\n';

  ns.tprint(output);
}

function pretty_print(ns, data) {
  ns.tprint(JSON.stringify(data, null, 2) + '\n\n');
}
