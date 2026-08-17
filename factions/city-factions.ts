import type { NS } from '@ns';
export async function main(ns: NS) {
  if (ns.getPlayer().money < 1e8) {
    ns.writePort(ns.pid, false);
    return;
  }
  const s = ns.singularity;
  const CityNameEnum = ns.enums.CityName;
  const FactionNameEnum = ns.enums.FactionName;
  const cityFactions = [
    [CityNameEnum.NewTokyo, [FactionNameEnum.NewTokyo]],
    [CityNameEnum.Chongqing, [FactionNameEnum.Chongqing]],
    [CityNameEnum.Ishima, [FactionNameEnum.Ishima, FactionNameEnum.TianDiHui]],
  ];
  let done = true;
  for (const [city, factions] of cityFactions) {
    s.travelToCity(city);
    for (const faction of factions) {
      if (ns.getPlayer().factions.includes(faction)) continue;
      let joined = false;
      for (let attempts = 0; attempts < 3; attempts++) {
        if (s.checkFactionInvitations().includes(faction)) {
          s.joinFaction(faction);
          joined = true;
          break;
        }
        await ns.sleep(1e3);
      }
      if (!joined) done = false;
    }
  }
  ns.writePort(ns.pid, done);
}
