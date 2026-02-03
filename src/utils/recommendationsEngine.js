// Generate performance recommendations based on trace analysis

export const generateRecommendations = (processedData) => {
  const recommendations = [];
  const { stepTimeBreakdown, gpuUtilization, kernels, operators, summary } = processedData;

  // 1. Check for DataLoader bottleneck
  const dataLoaderBreakdown = stepTimeBreakdown.find(item => item.name === 'DataLoader');
  if (dataLoaderBreakdown && dataLoaderBreakdown.percentage > 10) {
    recommendations.push({
      severity: 'warning',
      category: 'DataLoader',
      title: 'DataLoader Bottleneck Detected',
      description: `DataLoader operations consume ${dataLoaderBreakdown.percentage.toFixed(1)}% of total time. This suggests data loading is a bottleneck.`,
      suggestion: 'Increase num_workers in DataLoader, enable pin_memory=True, or use persistent_workers=True for better performance.',
      link: 'operators',
    });
  }

  // 2. Check for GPU underutilization
  if (gpuUtilization < 50) {
    recommendations.push({
      severity: 'warning',
      category: 'GPU Utilization',
      title: 'Low GPU Utilization',
      description: `GPU utilization is ${gpuUtilization.toFixed(1)}%, which is below optimal levels.`,
      suggestion: 'Consider increasing batch size, using mixed precision training (torch.cuda.amp), or optimizing data loading to keep the GPU busy.',
      link: 'overview',
    });
  }

  // 3. Check for high communication overhead
  const commBreakdown = stepTimeBreakdown.find(item => item.name === 'Communication');
  if (commBreakdown && commBreakdown.percentage > 20) {
    recommendations.push({
      severity: 'warning',
      category: 'Communication',
      title: 'High Communication Overhead',
      description: `Communication operations consume ${commBreakdown.percentage.toFixed(1)}% of total time in distributed training.`,
      suggestion: 'Consider using gradient accumulation to reduce communication frequency, or optimize network bandwidth. Check for all-reduce bottlenecks.',
      link: 'overview',
    });
  }

  // 4. Check for Tensor Core underutilization
  if (kernels && kernels.length > 0) {
    const tensorCoreKernels = kernels.filter(k => k.tensorCoresUsed);
    const eligibleKernels = kernels.filter(k =>
      k.name.toLowerCase().includes('gemm') ||
      k.name.toLowerCase().includes('conv') ||
      k.name.toLowerCase().includes('matmul')
    );

    if (eligibleKernels.length > 0) {
      const tensorCoreUsagePercent = (tensorCoreKernels.length / eligibleKernels.length) * 100;

      if (tensorCoreUsagePercent < 50) {
        recommendations.push({
          severity: 'info',
          category: 'Tensor Cores',
          title: 'Tensor Core Underutilization',
          description: `Only ${tensorCoreUsagePercent.toFixed(1)}% of eligible kernels are using Tensor Cores. Tensor Cores can significantly accelerate matrix operations.`,
          suggestion: 'Use mixed precision training with torch.cuda.amp.autocast() to enable Tensor Core acceleration. Ensure input dimensions are multiples of 8 for FP16.',
          link: 'kernels',
        });
      }
    }
  }

  // 5. Check for high CUDA Runtime overhead
  const runtimeBreakdown = stepTimeBreakdown.find(item => item.name === 'Runtime');
  if (runtimeBreakdown && runtimeBreakdown.percentage > 15) {
    recommendations.push({
      severity: 'info',
      category: 'Runtime',
      title: 'High CUDA Runtime Overhead',
      description: `CUDA runtime operations consume ${runtimeBreakdown.percentage.toFixed(1)}% of total time.`,
      suggestion: 'This may indicate frequent small kernel launches. Consider using torch.jit.script or torch.compile to fuse operations and reduce runtime overhead.',
      link: 'overview',
    });
  }

  // 6. Check for excessive memory copy operations
  const memcpyBreakdown = stepTimeBreakdown.find(item => item.name === 'Memcpy');
  if (memcpyBreakdown && memcpyBreakdown.percentage > 10) {
    recommendations.push({
      severity: 'warning',
      category: 'Memory Copy',
      title: 'Excessive Memory Copy Operations',
      description: `Memory copy operations consume ${memcpyBreakdown.percentage.toFixed(1)}% of total time.`,
      suggestion: 'Reduce CPU-GPU data transfers. Keep data on GPU when possible, use pin_memory for faster transfers, and avoid unnecessary .cpu() / .cuda() calls.',
      link: 'overview',
    });
  }

  // 7. Provide success message if everything looks good
  if (recommendations.length === 0) {
    recommendations.push({
      severity: 'success',
      category: 'Performance',
      title: 'Good Performance Profile',
      description: 'No major performance issues detected. Your training loop appears to be well optimized.',
      suggestion: 'Continue monitoring performance as your model evolves. Consider profiling with different batch sizes or input shapes.',
      link: null,
    });
  }

  return recommendations;
};
