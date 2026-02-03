// Track memory allocations and build memory timeline

export const processMemoryEvents = (events) => {
  const memoryTimeline = [];
  const memoryStats = {};
  let totalAllocated = 0;
  let totalReserved = 0;
  let peakAllocated = 0;
  let peakReserved = 0;

  // Find memory-related events
  const memEvents = events.filter(e =>
    (e.ph === 'C' && e.name && e.name.toLowerCase().includes('memory')) ||
    (e.name && (e.name.includes('[memory]') || e.name.includes('MemoryAlloc')))
  );

  memEvents.forEach(event => {
    if (event.ph === 'C') {
      // Counter events for memory
      const args = event.args || {};

      if (args.allocated || args.Allocated) {
        totalAllocated = args.allocated || args.Allocated;
        peakAllocated = Math.max(peakAllocated, totalAllocated);
      }

      if (args.reserved || args.Reserved) {
        totalReserved = args.reserved || args.Reserved;
        peakReserved = Math.max(peakReserved, totalReserved);
      }

      memoryTimeline.push({
        timestamp: event.ts,
        allocated: totalAllocated,
        reserved: totalReserved,
      });
    } else if (event.name && event.name.includes('[memory]')) {
      // Memory allocation events
      const isAllocation = event.name.includes('alloc');
      const size = event.args?.Bytes || event.args?.bytes || 0;
      const address = event.args?.Addr || event.args?.addr || null;
      const operatorName = event.args?.operator || 'Unknown';

      if (isAllocation) {
        totalAllocated += size;
        peakAllocated = Math.max(peakAllocated, totalAllocated);
      } else {
        totalAllocated = Math.max(0, totalAllocated - size);
      }

      memoryTimeline.push({
        timestamp: event.ts,
        type: isAllocation ? 'Allocation' : 'Free',
        address,
        size,
        operator: operatorName,
        totalAllocated,
        totalReserved,
      });

      // Track per-operator memory stats
      if (!memoryStats[operatorName]) {
        memoryStats[operatorName] = {
          operator: operatorName,
          size: 0,
          allocationCount: 0,
          freeCount: 0,
          netIncrease: 0,
        };
      }

      if (isAllocation) {
        memoryStats[operatorName].size += size;
        memoryStats[operatorName].allocationCount++;
        memoryStats[operatorName].netIncrease += size;
      } else {
        memoryStats[operatorName].freeCount++;
        memoryStats[operatorName].netIncrease -= size;
      }
    }
  });

  return {
    timeline: memoryTimeline,
    stats: Object.values(memoryStats).sort((a, b) => b.size - a.size),
    peak: {
      allocated: peakAllocated,
      reserved: peakReserved,
    },
  };
};

// Build memory curve data for charting
export const buildMemoryCurve = (memoryTimeline) => {
  if (!memoryTimeline || memoryTimeline.length === 0) {
    return [];
  }

  return memoryTimeline.map(point => ({
    timestamp: point.timestamp,
    allocated: point.allocated || 0,
    reserved: point.reserved || 0,
  }));
};
