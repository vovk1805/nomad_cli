import axios from 'axios';

export const getRunningAllocations = async () => {
  try {
    const { data: jobAllocations } = await axios('http://127.0.0.1:4646/v1/job/local/allocations');
    const { data: schedulersAllocations } = await axios('http://127.0.0.1:4646/v1/job/schedulers/allocations');

    const info = [...jobAllocations, ...schedulersAllocations].map((allocation) => {
      return {
        ID: allocation.ID,
        TaskGroup: allocation.TaskGroup,
      };
    });

    const allocationDetails = await Promise.all(
      info.map(({ ID }) => axios(`http://127.0.0.1:4646/v1/allocation/${ID}?index=1`)),
    );

    const allocationsRunning = allocationDetails.filter(({ data }) => data.ClientStatus === 'running');

    if (allocationsRunning.length === 0) {
      const message = 'No allocations are running';
      process.stderr.write(`\x1b[31m${message}\x1b[0m\n`);
      process.exit(0);
    }

    return allocationsRunning;
  } catch (error) {
    const message = 'Nomad is not running';
    process.stderr.write(`\x1b[31m${message}\x1b[0m\n`);
    process.exit(0);
  }
};
