export async function main(ns) {
  const sle = ns.sleeve;
  const sin = ns.singularity;
  const GYM = 'Powerhouse Gym';
  const threshold = Number(ns.args[0]);
  const runSleeves = Boolean(ns.args[1]);
  const numSleeves = runSleeves ? sle.getNumSleeves() : 0;
  const GymTypeEnum = ns.enums.GymType;
  const isWorking = (task, stat) =>
    task?.type === 'CLASS' && task.location === GYM && task.classType === stat;
  const getNextStat = () => {
    const { strength, defense, dexterity, agility } = ns.getPlayer().skills;
    if (strength < threshold) return GymTypeEnum.strength;
    if (defense < threshold) return GymTypeEnum.defense;
    if (dexterity < threshold) return GymTypeEnum.dexterity;
    if (agility < threshold) return GymTypeEnum.agility;
    return null;
  };
  while (true) {
    const stat = getNextStat();
    if (!stat) {
      sin.stopAction();
      for (let i = 0; i < numSleeves; i++) sle.setToIdle(i);
      break;
    }
    if (!isWorking(sin.getCurrentWork(), stat)) sin.gymWorkout(GYM, stat, false);
    for (let i = 0; i < numSleeves; i++) {
      if (!isWorking(sle.getTask(i), stat)) sle.setToGymWorkout(i, GYM, stat);
    }
    await ns.sleep(1e3);
  }
}
