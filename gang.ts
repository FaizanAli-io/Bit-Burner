import type { NS } from '@ns';
/** @param {NS} ns */
export async function main(ns: NS) {
  await gang_script(ns);
  // setAll(ns, 'Territory Warfare');
}

/** @param {NS} ns */
function setAll(ns: NS, task) {
  const g = ns.gang;
  for (const member of g.getMemberNames()) g.setMemberTask(member, task);
}

/** @param {NS} ns */
async function gang_script(ns: NS) {
  let time = performance.now();

  while (true) {
    buy_equips(ns);
    recruit_members(ns);
    check_ascensions(ns);

    time = update_tasks(ns, time);

    await ns.gang.nextUpdate();
  }
}

/** @param {NS} ns */
function update_tasks(ns: NS, time) {
  const g = ns.gang;
  const gf = ns.formulas.gang;

  const gangInfo = g.getGangInformation();
  const tasks = g.getTaskNames().map((x) => g.getTaskStats(x));
  const members = g.getMemberNames().map((x) => g.getMemberInformation(x));

  const elapsed = performance.now() - time;
  const cycle = elapsed / (15 * 1000);

  for (const member of members) {
    if (cycle < 1) g.setMemberTask(member.name, 'Train Combat');
    else if (cycle < 2) g.setMemberTask(member.name, 'Train Hacking');
    else if (cycle < 3) g.setMemberTask(member.name, 'Train Charisma');
    else if (cycle < 4) {
      const bestTask =
        gangInfo.wantedPenalty <= 0.499
          ? 'Vigilante Justice'
          : tasks.reduce(
              (best, task) => {
                const respect = gf.respectGain(gangInfo, member, task);
                return respect > best.respect ? { task, respect } : best;
              },
              { task: null, respect: -Infinity },
            ).task.name;

      g.setMemberTask(member.name, bestTask);
    } else time = performance.now();
  }

  return time;
}

/** @param {NS} ns */
function recruit_members(ns: NS) {
  const g = ns.gang;

  let members = g.getMemberNames().sort();
  let pre = 'man',
    suf = members.length;

  while (g.canRecruitMember()) {
    let name = `${pre}-${suf++}`;
    ns.tprint(`Got ${name}`);
    g.recruitMember(name);
  }
}

/** @param {NS} ns */
function buy_equips(ns: NS) {
  const g = ns.gang;

  let members = g
    .getMemberNames()
    .sort()
    .map((x) => g.getMemberInformation(x));

  let equips = g.getEquipmentNames().map((x) => ({ name: x, ...g.getEquipmentStats(x) }));

  equips.forEach((x) => {
    x.type = g.getEquipmentType(x.name);
    x.cost = g.getEquipmentCost(x.name);
  });

  equips = equips.sort((a, b) => a.cost - b.cost);

  for (const equip of equips) {
    for (const member of members) {
      if (equip.type == 'Augmentation') {
        if (!member.augmentations.includes(equip)) g.purchaseEquipment(member.name, equip.name);
      } else {
        if (!member.upgrades.includes(equip)) g.purchaseEquipment(member.name, equip.name);
      }
    }
  }
}

/** @param {NS} ns */
function check_ascensions(ns: NS) {
  const g = ns.gang;

  const requirements = {
    hack: 1.25,
    str: 1.25,
    def: 1.25,
    dex: 1.25,
    agi: 1.25,
    cha: 1.25,
  };

  for (const member of g.getMemberNames()) {
    let member_mults = g.getAscensionResult(member);

    if (!member_mults) continue;

    let should_ascend = true;
    for (const [stat, mult] of Object.entries(requirements)) {
      should_ascend &= member_mults[stat] > mult;
    }

    if (should_ascend) {
      g.ascendMember(member);
      ns.tprint('Ascended ', member);
    }
  }
}
