import type { NS } from '@ns';
export const calculateRamCost = (threads) =>
  threads.hackThread * 1.7 +
  (threads.weakenThreadHack + threads.growThread + threads.weakenThreadGrow) * 1.75;
export const isPrimed = (node) =>
  node.moneyAvailable === node.moneyMax && node.hackDifficulty === node.minDifficulty;
export const getPrimeString = (ns, primeTime) =>
  primeTime ? `${ns.format.time(primeTime)}` : 'Already Primed';
