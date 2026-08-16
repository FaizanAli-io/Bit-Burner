import { getFactionOrder } from '/factions/faction-work.js';

/** @param {NS} ns */
export async function main(ns) {
  const actions = {
    FREE: freeUp,
    TRAIN: basicTrain,
    FACTION: factionWork,
    AUGMENT: buySleeveAugs,
  };
  (actions[ns.args[0].toUpperCase()] || (() => ns.tprint('Invalid mode selected: ', ns.args[0])))(
    ns,
  );
}

function freeUp(ns) {
  const numSleeves = ns.sleeve.getNumSleeves();

  const lower = ns.args[1] !== undefined ? Math.max(0, parseInt(ns.args[1])) : 0;
  const upper =
    ns.args[2] !== undefined ? Math.min(numSleeves - 1, parseInt(ns.args[2])) : numSleeves - 1;

  for (let i = lower; i <= upper; i++) ns.sleeve.setToIdle(i);
}

function basicTrain(ns, category = ns.args[1]) {
  const { sleeve } = ns;
  if (['str', 'def', 'dex', 'agi'].includes(category)) {
    [...Array(sleeve.getNumSleeves()).keys()].forEach((i) =>
      sleeve.setToGymWorkout(i, 'Powerhouse Gym', category),
    );
  } else if (['cha', 'hack'].includes(category)) {
    [...Array(sleeve.getNumSleeves()).keys()].forEach((i) =>
      sleeve.setToUniversityCourse(
        i,
        'Rothman University',
        category === 'cha' ? 'Leadership' : 'Algorithms',
      ),
    );
  } else if (category === 'gym') {
    ['str', 'str', 'def', 'def', 'dex', 'dex', 'agi', 'agi'].forEach((task, i) =>
      sleeve.setToGymWorkout(i, 'Powerhouse Gym', task),
    );
  } else {
    ['str', 'def', 'dex', 'agi', 'Leadership', 'Leadership', 'Algorithms', 'Algorithms'].forEach(
      (task, i) =>
        i < 4
          ? sleeve.setToGymWorkout(i, 'Powerhouse Gym', task)
          : sleeve.setToUniversityCourse(i, 'Rothman University', task),
    );
  }

  checkOptimal(ns);
}

/** @param {NS} ns */
function getSleeveOrder(ns) {
  const { sleeve } = ns;
  return [...Array(sleeve.getNumSleeves()).keys()]
    .map((i) => ({ ...sleeve.getSleeve(i), index: i }))
    .sort((a, b) => b.storedCycles - a.storedCycles)
    .map((s) => s.index);
}

/** @param {NS} ns */
function factionWork(ns) {
  const { sleeve } = ns;

  freeUp(ns);

  const sleeves = getSleeveOrder(ns);

  getFactionOrder(ns)
    .slice(0, sleeves.length)
    .forEach((f, i) => sleeve.setToFactionWork(sleeves[i], f.name, f.workType));
}

/** @param {NS} ns */
function checkOptimal(ns) {
  const { sleeve } = ns;
  [...Array(sleeve.getNumSleeves()).keys()].forEach((i) => {
    const s = sleeve.getSleeve(i);
    s.shock > 0 ? sleeve.setToShockRecovery(i) : s.sync < 100 ? sleeve.setToSynchronize(i) : null;
  });
}

/** @param {NS} ns */
export function buySleeveAugs(ns) {
  const { sleeve } = ns;
  [...Array(sleeve.getNumSleeves()).keys()].forEach((i) => {
    if (sleeve.getSleeve(i).shock == 0) {
      let augments = sleeve.getSleevePurchasableAugs(i);
      let successes = augments.map((a) => sleeve.purchaseSleeveAug(i, a.name)).filter((x) => x);
      ns.tprint(`Bought ${successes.length} Augs out of ${augments.length} for Sleeve ${i}`);
    }
  });
}
