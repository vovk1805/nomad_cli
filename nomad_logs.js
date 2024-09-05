import { getRunningAllocations } from './common.js';

const [serviceName, logsType] = process.argv.slice(2);
const serviceToAllocationIdMap = new Map();

(async () => {
  try {
    const allocationsRunning = await getRunningAllocations();

    for (const { data } of allocationsRunning) {
      const { ID, TaskGroup: serviceName } = data;
      const shortId = ID.slice(0, 8);
      serviceToAllocationIdMap.set(serviceName, shortId);
    }

    switch (logsType) {
      case 'info':
        process.stdout.write(`logs -f ${serviceToAllocationIdMap.get(serviceName)}`);
        break;
      case 'error':
        process.stdout.write(`logs -f --stderr ${serviceToAllocationIdMap.get(serviceName)}`);
        break;

      default:
        throw new Error('Invalid log type');
    }
  } catch (_) {
    const message = 'Nomad is not running';
    process.stderr.write(`\x1b[31m${message}\x1b[0m\n`);
  }
})();
