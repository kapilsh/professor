// Classify trace events into categories for step time breakdown

export const classifyEvent = (event) => {
  const cat = event.cat || '';
  const name = event.name || '';
  const catLower = cat.toLowerCase();
  const nameLower = name.toLowerCase();

  // Kernel execution
  if (catLower.includes('kernel') || catLower.includes('gpu_op')) {
    return 'Kernel';
  }

  // Memory copy operations
  if (catLower.includes('memcpy') || nameLower.includes('memcpy')) {
    return 'Memcpy';
  }

  // Memory set operations
  if (catLower.includes('memset') || nameLower.includes('memset')) {
    return 'Memset';
  }

  // Communication (NCCL, all-reduce, etc.)
  if (
    catLower.includes('nccl') ||
    catLower.includes('communication') ||
    nameLower.includes('all_reduce') ||
    nameLower.includes('allreduce') ||
    nameLower.includes('broadcast') ||
    nameLower.includes('allgather')
  ) {
    return 'Communication';
  }

  // CUDA Runtime
  if (catLower.includes('runtime') || catLower.includes('cuda_runtime')) {
    return 'Runtime';
  }

  // DataLoader
  if (
    nameLower.includes('dataloader') ||
    nameLower.includes('enumerate(dataloader)')
  ) {
    return 'DataLoader';
  }

  // CPU operators
  if (catLower.includes('cpu_op') || catLower.includes('cpu')) {
    return 'CPU Exec';
  }

  // Default to Other
  return 'Other';
};

export const isGPUEvent = (event) => {
  const cat = (event.cat || '').toLowerCase();
  const name = (event.name || '').toLowerCase();

  return (
    cat.includes('kernel') ||
    cat.includes('gpu') ||
    cat.includes('cuda') ||
    name.includes('cuda') ||
    name.includes('gpu')
  );
};

export const isCPUEvent = (event) => {
  const cat = (event.cat || '').toLowerCase();
  return cat.includes('cpu') || !isGPUEvent(event);
};

export const isMemoryEvent = (event) => {
  return event.ph === 'C' && event.name && event.name.includes('Memory');
};

export const isOperatorEvent = (event) => {
  const cat = (event.cat || '').toLowerCase();
  return (
    cat.includes('operator') ||
    cat.includes('cpu_op') ||
    cat.includes('gpu_op')
  );
};

export const isKernelEvent = (event) => {
  const cat = (event.cat || '').toLowerCase();
  return cat.includes('kernel');
};

export const hasTensorCoreSupport = (kernelName) => {
  const nameLower = kernelName.toLowerCase();

  // Common Tensor Core kernel patterns
  return (
    nameLower.includes('hmma') ||    // Half-precision Matrix Multiply Accumulate
    nameLower.includes('imma') ||    // Integer Matrix Multiply Accumulate
    nameLower.includes('wmma') ||    // Warp Matrix Multiply Accumulate
    nameLower.includes('tensor_op') ||
    nameLower.includes('tensorop')
  );
};
