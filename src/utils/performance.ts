/**
 * Performance monitoring utilities for API endpoints
 */

export interface PerformanceMetrics {
  startTime: number
  endTime?: number
  duration?: number
  operation: string
  success: boolean
  error?: string
  metadata?: Record<string, unknown>
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private maxMetrics = 100 // Keep only last 100 metrics

  /**
   * Start timing an operation
   */
  start(operation: string, metadata?: Record<string, unknown>): PerformanceMetrics {
    const metric: PerformanceMetrics = {
      startTime: Date.now(),
      operation,
      success: false,
      metadata
    }
    
    this.metrics.push(metric)
    
    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
    
    return metric
  }

  /**
   * End timing an operation
   */
  end(metric: PerformanceMetrics, success: boolean = true, error?: string): PerformanceMetrics {
    metric.endTime = Date.now()
    metric.duration = metric.endTime - metric.startTime
    metric.success = success
    if (error) {
      metric.error = error
    }
    
    return metric
  }

  /**
   * Get performance statistics
   */
  getStats(operation?: string): {
    total: number
    average: number
    min: number
    max: number
    successRate: number
    recentMetrics: PerformanceMetrics[]
  } {
    const filteredMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics

    if (filteredMetrics.length === 0) {
      return {
        total: 0,
        average: 0,
        min: 0,
        max: 0,
        successRate: 0,
        recentMetrics: []
      }
    }

    const durations = filteredMetrics
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!)

    const successful = filteredMetrics.filter(m => m.success).length

    return {
      total: filteredMetrics.length,
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      successRate: (successful / filteredMetrics.length) * 100,
      recentMetrics: filteredMetrics.slice(-10) // Last 10 operations
    }
  }

  /**
   * Log performance metrics
   */
  logStats(operation?: string): void {
    const stats = this.getStats(operation)
    const operationName = operation || 'All Operations'
    
    console.log(`\n📊 Performance Stats - ${operationName}:`)
    console.log(`   Total Operations: ${stats.total}`)
    console.log(`   Average Duration: ${stats.average.toFixed(2)}ms`)
    console.log(`   Min Duration: ${stats.min}ms`)
    console.log(`   Max Duration: ${stats.max}ms`)
    console.log(`   Success Rate: ${stats.successRate.toFixed(1)}%`)
    
    if (stats.recentMetrics.length > 0) {
      console.log(`   Recent Operations:`)
      stats.recentMetrics.forEach(metric => {
        const status = metric.success ? '✅' : '❌'
        const duration = metric.duration ? `${metric.duration}ms` : 'N/A'
        console.log(`     ${status} ${metric.operation}: ${duration}`)
      })
    }
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * Decorator for timing async functions
 */
export function timed<T extends unknown[], R>(
  operation: string,
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const metric = performanceMonitor.start(operation)
    
    try {
      const result = await fn(...args)
      performanceMonitor.end(metric, true)
      return result
    } catch (error) {
      performanceMonitor.end(metric, false, error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }
}

/**
 * Utility function to measure API response times
 */
export function measureApiResponse<T>(
  operation: string,
  fn: () => Promise<T>,
  _metadata?: Record<string, unknown>
): Promise<T> {
  return timed(operation, fn)()
}
