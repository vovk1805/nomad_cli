import axios from 'axios';
import { getRunningAllocations } from './common.js';

const [serviceName] = process.argv.slice(2);
const serviceToAllocationIdMap = new Map();

const startLoadingAnimation = () => {
  let dotsCount = 0;
  const interval = setInterval(() => {
    process.stdout.clearLine();
    process.stdout.write('.'.repeat(dotsCount));
    dotsCount += 1;
    process.stdout.cursorTo(0);
  }, 200);

  return interval;
};

const finishLoadingAnimation = (interval) => {
  clearInterval(interval);
  process.stdout.clearLine();
};
let interval = null;

(async () => {
  try {
    const allocationsRunning = await getRunningAllocations();

    for (const { data } of allocationsRunning) {
      const { ID, TaskGroup: serviceName } = data;
      serviceToAllocationIdMap.set(serviceName, ID);
    }

    const allocationId = serviceToAllocationIdMap.get(serviceName);

    interval = startLoadingAnimation();
    await axios({ method: 'put', url: `http://127.0.0.1:4646/v1/client/allocation/${allocationId}/restart` });
    finishLoadingAnimation(interval);

    process.stdout.write(`\x1b[32mSUCCESS\x1b[0m\n`);
  } catch (_) {
    finishLoadingAnimation(interval);
    const message = 'Fail to restart or Nomad is not running';
    process.stderr.write(`\x1b[31m${message}\x1b[0m\n`);
  }
})();
