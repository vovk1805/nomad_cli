import { getRunningAllocations } from './common.js';

(async () => {
  try {
    const allocationsRunning = await getRunningAllocations();
    debugger;
    const output = [];

    for (const { data } of allocationsRunning) {
      const { ID, TaskGroup: serviceName, AllocatedResources } = data;
      const shortId = ID.slice(0, 8);
      const ports = AllocatedResources.Shared.Ports;
      const allocationInDebugMode = ports?.find(({ Label }) => Label === 'debug');

      if (!allocationInDebugMode) {
        continue;
      }

      const { Value: port, HostIP: host } = allocationInDebugMode;

      output.push({ serviceName, host, port, shortId });
    }

    if (output.length === 0) {
      const message = 'No allocations in debug mode are running';
      process.stderr.write(`\x1b[31m${message}\x1b[0m\n`);
      process.exit(0);
    }

    output.forEach(({ serviceName, host, port, shortId }) => {
      process.stdout.write(`\x1b[32m${serviceName}\x1b[0m\n`);
      process.stdout.write(`\x1b[36m${host}:${port}\x1b[0m\n`);
      process.stdout.write(`\x1b[33m${shortId}\x1b[0m\n`);
      process.stdout.write(`----------------\n`);
    });
  } catch (_) {
    const message = 'Nomad is not running';
    process.stderr.write(`\x1b[31m${message}\x1b[0m\n`);
  }
})();
