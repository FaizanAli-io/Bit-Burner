import type { NS } from '@ns';
import { printHelp } from '/cli.js';

const DOCS = {
  'manager.js': {
    usage: 'manager.js [flags]',
    description: 'Runs the progression workers and optionally the batch controller.',
    args: [
      {
        name: 'flags',
        description: 'Combine d (display), k (karma), c (controller), and t (timer).',
      },
    ],
    examples: ['manager.js c', 'manager.js dkc', 'manager.js dckt'],
  },
  'controller.js': {
    usage: 'controller.js [t]',
    description: 'Analyzes targets and continuously launches HWGW batches.',
    args: [{ name: 't', description: 'Show a timer tail during each batch interval.' }],
  },
  'analyze.js': {
    usage: 'analyze.js [display]',
    description: 'Selects the most profitable rooted hacking target.',
    args: [
      { name: 'display', description: 'Any truthy value opens the analysis tables in a tail.' },
    ],
  },
  'primer.js': {
    usage: 'primer.js <target>',
    description: 'Raises a target to maximum money and minimum security.',
    args: [{ name: 'target', description: 'Server hostname to prime.' }],
  },
  'batching/hacker.js': {
    usage: 'batching/hacker.js <target> <additionalMsec>',
    description: 'Runs one delayed hack operation for the batch controller.',
    args: [
      { name: 'target', description: 'Server hostname.' },
      { name: 'additionalMsec', description: 'Additional delay in milliseconds.' },
    ],
  },
  'batching/grower.js': {
    usage: 'batching/grower.js <target> <additionalMsec>',
    description: 'Runs one delayed grow operation for the batch controller.',
    args: [
      { name: 'target', description: 'Server hostname.' },
      { name: 'additionalMsec', description: 'Additional delay in milliseconds.' },
    ],
  },
  'batching/weakener.js': {
    usage: 'batching/weakener.js <target>',
    description: 'Runs one weaken operation for the batch controller.',
    args: [{ name: 'target', description: 'Server hostname.' }],
  },
  'display.js': {
    usage: 'display.js',
    description: 'Displays RAM usage for home and purchased servers.',
  },
  'stop.js': { usage: 'stop.js', description: 'Stops scripts on rooted and purchased servers.' },
  'usage.js': { usage: 'usage.js', description: 'Lists script RAM usage on home.' },
  'crimes.js': {
    usage: 'crimes.js [commit]',
    description: 'Ranks crimes by expected money per second.',
    args: [{ name: 'commit', description: 'Any truthy value commits the highest-ranked crime.' }],
  },
  'gym.js': {
    usage: 'gym.js <threshold> [sleeves]',
    description: 'Trains player combat stats to a threshold.',
    args: [
      {
        name: 'threshold',
        description: 'Target level for strength, defense, dexterity, and agility.',
      },
      { name: 'sleeves', description: 'Any truthy value also trains all sleeves.' },
    ],
  },
  'sleeve.js': {
    usage: 'sleeve.js <mode> [args...]',
    description: 'Controls sleeve idle, training, faction work, and augmentation actions.',
    args: [
      { name: 'mode', description: 'FREE, TRAIN, FACTION, or AUGMENT.' },
      {
        name: 'args',
        description: 'FREE: lower/upper sleeve index. TRAIN: str/def/dex/agi/cha/hack/gym.',
      },
    ],
    examples: [
      'sleeve.js FREE 0 3',
      'sleeve.js TRAIN hack',
      'sleeve.js FACTION',
      'sleeve.js AUGMENT',
    ],
  },
  'blade.js': {
    usage: 'blade.js [v]',
    description: 'Runs the Bladeburner automation loop.',
    args: [{ name: 'v', description: 'Print skill purchases and detailed status.' }],
  },
  'gang.js': {
    usage: 'gang.js',
    description: 'Automates gang recruitment, equipment, ascensions, and tasks.',
  },
  'augs.js': {
    usage: 'augs.js',
    description: 'Prints combined augmentation multipliers by faction.',
  },
  'installCost.js': {
    usage: 'installCost.js [limit] [hack|blade] [BUY] [NFG]',
    description: 'Lists purchasable augmentations and calculates installation cost.',
    args: [
      { name: 'limit', description: 'Optional numeric augmentation price limit.' },
      { name: 'hack|blade', description: 'Filter to hacking or Bladeburner-related multipliers.' },
      { name: 'BUY', description: 'Purchase the listed augmentations.' },
      { name: 'NFG', description: 'Show or purchase NeuroFlux Governors.' },
    ],
  },
  'graft.js': {
    usage: 'graft.js [LOG]',
    description: 'Lists graftable augmentations and optionally starts them in time order.',
    args: [{ name: 'LOG', description: 'Only list grafts; do not start them.' }],
  },
  'misc/timer.js': {
    usage: 'misc/timer.js <milliseconds>',
    description: 'Displays a progress timer in a tail.',
    args: [{ name: 'milliseconds', description: 'Duration of the timer.' }],
  },
  'misc/karma.js': {
    usage: 'misc/karma.js',
    description: 'Tracks karma, kill rate, and estimated time to -54,000 karma.',
  },
  'workers/infiltrate.js': {
    usage: 'workers/infiltrate.js',
    description: 'Builds server lists and cracks every available server.',
  },
  'workers/buyAndUpgradeServers.js': {
    usage: 'workers/buyAndUpgradeServers.js',
    description: 'Buys and upgrades purchased servers.',
  },
  'workers/buyRamAndCores.js': {
    usage: 'workers/buyRamAndCores.js',
    description: 'Buys affordable home RAM and core upgrades.',
  },
  'workers/buyTorAndPrograms.js': {
    usage: 'workers/buyTorAndPrograms.js',
    description: 'Buys the TOR router and affordable darkweb programs.',
  },
  'factions/city-factions.js': {
    usage: 'factions/city-factions.js',
    description: 'Travels to cities and joins available city factions.',
  },
  'factions/hack-factions.js': {
    usage: 'factions/hack-factions.js [backdoorDemon]',
    description: 'Backdoors faction servers and joins their factions.',
    args: [
      {
        name: 'backdoorDemon',
        description: 'Any truthy value also attempts the w0r1d_d43m0n backdoor.',
      },
    ],
  },
  'factions/faction-work.js': {
    usage: 'factions/faction-work.js',
    description: 'Selects the best faction work target and starts working.',
  },
  'corporate/boostOptimizer.js': {
    usage: 'corporate/boostOptimizer.js',
    description: 'Maintains corporation warehouse boost-material targets.',
  },
  'corporate/buyAndAssignEmployees.js': {
    usage: 'corporate/buyAndAssignEmployees.js <amount>',
    description: 'Expands offices, hires employees, and assigns them across jobs.',
    args: [{ name: 'amount', description: 'Desired employee count per office.' }],
  },
  'corporate/customBuy.js': {
    usage: 'corporate/customBuy.js <amount> [buy]',
    description: 'Calculates or performs a Toba 1 Sector-12 office expansion.',
    args: [
      { name: 'amount', description: 'Desired office size.' },
      { name: 'buy', description: 'Truthy value performs the purchase and hiring.' },
    ],
  },
  'corporate/setSalesPrice.js': {
    usage: 'corporate/setSalesPrice.js <division> <mode> [factor]',
    description: 'Sets produced-material sale prices or enables Market-TA2.',
    args: [
      { name: 'division', description: 'Corporation division name.' },
      { name: 'mode', description: '1 sets a sale-price factor; 2 enables Market-TA2.' },
      { name: 'factor', description: 'Sale-price factor used with mode 1.' },
    ],
  },
  'corporate/setupExport.js': {
    usage: 'corporate/setupExport.js',
    description: 'Configures corporation material exports.',
  },
  'corporate/storageOptimizer.js': {
    usage: 'corporate/storageOptimizer.js',
    description: 'Optimizes corporation storage allocation.',
  },
  'corporate/continuousDevelopment.js': {
    usage: 'corporate/continuousDevelopment.js',
    description: 'Runs continuous corporation development actions.',
  },
  'corporate/teaParty.js': {
    usage: 'corporate/teaParty.js',
    description: 'Runs corporation tea parties continuously.',
  },
};

export function getDocs(script) {
  return DOCS[script];
}

export async function main(ns: NS) {
  const requested = String(ns.args[0] ?? '');
  if (requested === '--help' || requested === '-h' || requested === 'help') {
    printHelp(ns, {
      usage: 'docs.js [script] | all',
      description: 'Prints command-line documentation for this Bitburner automation suite.',
      args: [
        { name: 'script', description: 'Script path to document, or all for the complete index.' },
      ],
      examples: ['docs.js controller.js', 'docs.js sleeve.js', 'docs.js all'],
    });
    return;
  }

  if (!requested || requested === 'all') {
    for (const [script, doc] of Object.entries(DOCS)) {
      ns.tprint(`${script.padEnd(42)} ${doc.description}`);
    }
    ns.tprint('\nUse: run docs.js <script>');
    return;
  }

  const doc = getDocs(requested);
  if (!doc) {
    ns.tprint(`No documentation found for ${requested}. Try: run docs.js all`);
    return;
  }
  printHelp(ns, doc, true);
}
