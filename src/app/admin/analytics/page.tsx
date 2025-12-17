'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3,
  Users,
  Eye,
  MousePointer,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface AnalyticsData {
  visitors: {
    total: number
    unique: number
    returning: number
    change: number
  }
  pageViews: {
    total: number
    change: number
  }
  bounceRate: {
    percentage: number
    change: number
  }
  avgSessionDuration: {
    minutes: number
    change: number
  }
  topPages: Array<{
    page: string
    views: number
    change: number
  }>
  topKeywords: Array<{
    keyword: string
    impressions: number
    clicks: number
    ctr: number
    position: number
  }>
  trafficSources: Array<{
    source: string
    visitors: number
    percentage: number
  }>
  deviceBreakdown: Array<{
    device: string
    visitors: number
    percentage: number
  }>
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')

  const dateRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ]

  useEffect(() => {
    loadAnalyticsData()
  }, [dateRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual analytics API call
      // Removed artificial delay for better performance
      
      // Mock data - replace with real analytics data
      const mockData: AnalyticsData = {
        visitors: {
          total: 15420,
          unique: 12350,
          returning: 3070,
          change: 12.5
        },
        pageViews: {
          total: 45680,
          change: 8.3
        },
        bounceRate: {
          percentage: 42.5,
          change: -2.1
        },
        avgSessionDuration: {
          minutes: 3.2,
          change: 15.7
        },
        topPages: [
          { page: '/tours', views: 12540, change: 8.5 },
          { page: '/', views: 11200, change: 12.3 },
          { page: '/destinations', views: 8900, change: 5.7 },
          { page: '/tours/cultural-triangle', views: 5600, change: 18.2 },
          { page: '/about', views: 3200, change: -1.2 }
        ],
        topKeywords: [
          { keyword: 'sri lanka tours', impressions: 12500, clicks: 850, ctr: 6.8, position: 3.2 },
          { keyword: 'cultural heritage sri lanka', impressions: 8900, clicks: 620, ctr: 7.0, position: 2.8 },
          { keyword: 'ella train journey', impressions: 7600, clicks: 540, ctr: 7.1, position: 4.1 },
          { keyword: 'sigiriya rock fortress', impressions: 6800, clicks: 480, ctr: 7.1, position: 3.5 },
          { keyword: 'yala national park safari', impressions: 5400, clicks: 380, ctr: 7.0, position: 4.8 }
        ],
        trafficSources: [
          { source: 'Organic Search', visitors: 8500, percentage: 55.1 },
          { source: 'Direct', visitors: 3200, percentage: 20.7 },
          { source: 'Social Media', visitors: 2100, percentage: 13.6 },
          { source: 'Referral', visitors: 1200, percentage: 7.8 },
          { source: 'Paid Search', visitors: 420, percentage: 2.7 }
        ],
        deviceBreakdown: [
          { device: 'Desktop', visitors: 7200, percentage: 46.7 },
          { device: 'Mobile', visitors: 6500, percentage: 42.1 },
          { device: 'Tablet', visitors: 1720, percentage: 11.2 }
        ]
      }
      
      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />
    } else if (change < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading analytics data...</span>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Analytics data will appear here once configured.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Website performance and SEO insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <button
            onClick={loadAnalyticsData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Visitors</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.visitors.total)}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4 flex items-center">
            {getChangeIcon(analyticsData.visitors.change)}
            <span className={`text-sm font-medium ${getChangeColor(analyticsData.visitors.change)}`}>
              {analyticsData.visitors.change > 0 ? '+' : ''}{analyticsData.visitors.change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Page Views</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.pageViews.total)}</p>
            </div>
            <Eye className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4 flex items-center">
            {getChangeIcon(analyticsData.pageViews.change)}
            <span className={`text-sm font-medium ${getChangeColor(analyticsData.pageViews.change)}`}>
              {analyticsData.pageViews.change > 0 ? '+' : ''}{analyticsData.pageViews.change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.bounceRate.percentage}%</p>
            </div>
            <MousePointer className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="mt-4 flex items-center">
            {getChangeIcon(analyticsData.bounceRate.change)}
            <span className={`text-sm font-medium ${getChangeColor(analyticsData.bounceRate.change)}`}>
              {analyticsData.bounceRate.change > 0 ? '+' : ''}{analyticsData.bounceRate.change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Session</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.avgSessionDuration.minutes}m</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-4 flex items-center">
            {getChangeIcon(analyticsData.avgSessionDuration.change)}
            <span className={`text-sm font-medium ${getChangeColor(analyticsData.avgSessionDuration.change)}`}>
              {analyticsData.avgSessionDuration.change > 0 ? '+' : ''}{analyticsData.avgSessionDuration.change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Top Pages</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 w-8">{index + 1}</span>
                    <span className="text-sm text-gray-700 ml-2">{page.page}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-900">{formatNumber(page.views)}</span>
                    <div className="flex items-center">
                      {getChangeIcon(page.change)}
                      <span className={`text-sm font-medium ${getChangeColor(page.change)}`}>
                        {page.change > 0 ? '+' : ''}{page.change}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Keywords */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Top Keywords</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.topKeywords.map((keyword, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{keyword.keyword}</span>
                    <span className="text-sm text-gray-500">Position: {keyword.position}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{formatNumber(keyword.impressions)} impressions</span>
                    <span>{keyword.clicks} clicks</span>
                    <span>{keyword.ctr}% CTR</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Sources and Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Traffic Sources</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.trafficSources.map((source, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{source.source}</span>
                    <span className="text-sm text-gray-500">{source.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">{formatNumber(source.visitors)} visitors</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Device Breakdown</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.deviceBreakdown.map((device, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{device.device}</span>
                    <span className="text-sm text-gray-500">{device.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">{formatNumber(device.visitors)} visitors</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export and Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Export Data</h3>
            <p className="text-gray-600">Download analytics reports and data</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
