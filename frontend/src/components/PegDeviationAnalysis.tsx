import { useMemo } from 'react'
import { ShieldAlert, Clock, TrendingDown, Activity, AlertTriangle, BarChart3 } from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import { useDashboard } from '../hooks/useUsd1Data'
import { useTheme } from '../lib/ThemeContext'

function chartColors(dark: boolean) {
  return {
    fgBase: dark ? '#e7e7e7' : '#1a1a1a',
    fgSubtle: dark ? '#aaaaaa' : '#666666',
    fgMuted: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)',
    tooltipBg: dark ? 'rgba(10,10,10,0.95)' : 'rgba(255,255,255,0.95)',
    tooltipBorder: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
    splitLineColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)',
    axisLineColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
    timelineBg: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    timelineBorder: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  }
}

/** 偏差严重程度颜色 */
function devSeverityColor(devPct: number): string {
  if (devPct < 0.05) return '#10b981'   // 极稳定
  if (devPct < 0.1) return '#22d3ee'    // 正常
  if (devPct < 0.3) return '#f59e0b'    // 轻度偏移
  if (devPct < 0.5) return '#f97316'    // 中度偏移
  return '#ef4444'                       // 严重脱锚
}

interface DepegEvent {
  startDate: string
  endDate: string
  peakDev: number
  direction: 'above' | 'below'
  durationHours: number
}

/**
 * 历史 Peg 偏差与脱锚事件分析
 * 基于 90 天价格数据：热力图 + 脱锚事件时间线 + 关键统计卡片
 */
export default function PegDeviationAnalysis() {
  const { dark } = useTheme()
  const { data, isLoading } = useDashboard()

  // ===== 核心数据计算 =====
  const analysis = useMemo(() => {
    const prices = data?.price90d || []
    if (prices.length === 0) return null

    // 每日偏差数据
    const dailyDevs: Array<{
      date: string
      timestamp: number
      avgDev: number
      maxDev: number
      direction: 'above' | 'below' | 'mixed'
      dataPoints: number
    }> = []

    // 按日聚合
    const dayMap = new Map<string, Array<{ value: number; ts: number }>>()
    for (const p of prices) {
      const d = new Date(p.timestamp * 1000)
      const key = d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
      if (!dayMap.has(key)) dayMap.set(key, [])
      dayMap.get(key)!.push({ value: p.value, ts: p.timestamp })
    }

    let allDevs: number[] = []
    let maxDeviation = 0
    let maxDevDate = ''

    for (const [date, points] of dayMap) {
      const devs = points.map(p => (p.value - 1) * 100) // %
      const absDevs = devs.map(d => Math.abs(d))
      const avg = absDevs.reduce((s, d) => s + d, 0) / absDevs.length
      const max = Math.max(...absDevs)
      const above = devs.filter(d => d > 0).length
      const below = devs.filter(d => d < 0).length
      const dir = above > below * 2 ? 'above' as const : below > above * 2 ? 'below' as const : 'mixed' as const

      if (max > maxDeviation) {
        maxDeviation = max
        maxDevDate = date
      }

      allDevs.push(...absDevs)
      dailyDevs.push({
        date,
        timestamp: points[0].ts,
        avgDev: avg,
        maxDev: max,
        direction: dir,
        dataPoints: points.length,
      })
    }

    // 排序
    dailyDevs.sort((a, b) => a.timestamp - b.timestamp)

    // 关键统计
    const avgDeviation = allDevs.length > 0 ? allDevs.reduce((s, d) => s + d, 0) / allDevs.length : 0
    const variance = allDevs.length > 0
      ? allDevs.reduce((s, d) => s + (d - avgDeviation) ** 2, 0) / allDevs.length
      : 0
    const volatility = Math.sqrt(variance)

    // 识别脱锚事件（连续偏差 > 0.1%）
    const depegThreshold = 0.1
    const events: DepegEvent[] = []
    let eventStart: number | null = null
    let eventPeakDev = 0
    let eventDir: 'above' | 'below' = 'above'

    for (let i = 0; i < dailyDevs.length; i++) {
      const d = dailyDevs[i]
      if (d.maxDev > depegThreshold) {
        if (eventStart === null) {
          eventStart = i
          eventPeakDev = d.maxDev
          eventDir = d.direction === 'below' ? 'below' : 'above'
        } else {
          if (d.maxDev > eventPeakDev) eventPeakDev = d.maxDev
        }
      } else if (eventStart !== null) {
        const dur = (dailyDevs[i - 1].timestamp - dailyDevs[eventStart].timestamp) / 3600
        events.push({
          startDate: dailyDevs[eventStart].date,
          endDate: dailyDevs[i - 1].date,
          peakDev: eventPeakDev,
          direction: eventDir,
          durationHours: Math.max(dur, 24),
        })
        eventStart = null
        eventPeakDev = 0
      }
    }
    // 如果结尾还在事件中
    if (eventStart !== null) {
      const last = dailyDevs[dailyDevs.length - 1]
      const dur = (last.timestamp - dailyDevs[eventStart].timestamp) / 3600
      events.push({
        startDate: dailyDevs[eventStart].date,
        endDate: last.date,
        peakDev: eventPeakDev,
        direction: eventDir,
        durationHours: Math.max(dur, 24),
      })
    }

    const longestDepeg = events.length > 0 ? Math.max(...events.map(e => e.durationHours)) : 0

    return { dailyDevs, maxDeviation, maxDevDate, avgDeviation, volatility, events, longestDepeg }
  }, [data?.price90d])

  // ===== 热力图 option =====
  const heatmapOption = useMemo(() => {
    if (!analysis) return {}
    const c = chartColors(dark)
    const { dailyDevs } = analysis

    // 按周分组构建 heatmap 数据：x=周, y=星期几, value=偏差
    const weeks: string[] = []
    const heatData: Array<[number, number, number]> = []

    let currentWeek = -1
    for (let i = 0; i < dailyDevs.length; i++) {
      const d = new Date(dailyDevs[i].timestamp * 1000)
      const weekDay = d.getDay() // 0=Sun
      const weekIdx = Math.floor(i / 7)
      if (weekIdx > currentWeek) {
        currentWeek = weekIdx
        weeks.push(dailyDevs[i].date)
      }
      heatData.push([weekIdx, weekDay, dailyDevs[i].avgDev])
    }

    return {
      tooltip: {
        backgroundColor: c.tooltipBg,
        borderColor: c.tooltipBorder,
        textStyle: { color: c.fgBase, fontSize: 11 },
        formatter: (p: any) => {
          const devVal = p.value[2]
          return `<b>${p.name || weeks[p.value[0]] || ''}</b><br/>平均偏差: <b style="color:${devSeverityColor(devVal)}">${devVal.toFixed(4)}%</b>`
        },
      },
      grid: { left: 40, right: 16, top: 8, bottom: 24 },
      xAxis: {
        type: 'category' as const,
        data: weeks,
        axisLine: { lineStyle: { color: c.axisLineColor } },
        axisTick: { show: false },
        axisLabel: { color: c.fgMuted, fontSize: 9, interval: Math.max(0, Math.floor(weeks.length / 6) - 1) },
        splitArea: { show: false },
      },
      yAxis: {
        type: 'category' as const,
        data: ['日', '一', '二', '三', '四', '五', '六'],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: c.fgMuted, fontSize: 9 },
      },
      visualMap: {
        min: 0,
        max: Math.max(0.5, analysis.maxDeviation),
        calculable: false,
        orient: 'horizontal' as const,
        left: 'center',
        bottom: 0,
        show: false,
        inRange: {
          color: dark
            ? ['#064e3b', '#059669', '#fbbf24', '#f97316', '#dc2626']
            : ['#d1fae5', '#6ee7b7', '#fde68a', '#fdba74', '#fca5a5'],
        },
      },
      series: [{
        type: 'heatmap',
        data: heatData,
        label: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 6, shadowColor: 'rgba(0,0,0,0.3)' },
        },
        itemStyle: { borderColor: dark ? '#0a0a0a' : '#f5f5f7', borderWidth: 2, borderRadius: 3 },
      }],
    }
  }, [analysis, dark])

  // 统计卡片数据
  const stats = useMemo(() => {
    if (!analysis) return []
    return [
      {
        label: '最大偏移量',
        value: `${analysis.maxDeviation.toFixed(4)}%`,
        sub: analysis.maxDevDate,
        icon: TrendingDown,
        color: devSeverityColor(analysis.maxDeviation),
      },
      {
        label: '平均偏差',
        value: `${analysis.avgDeviation.toFixed(4)}%`,
        sub: analysis.avgDeviation < 0.05 ? '极稳定' : analysis.avgDeviation < 0.1 ? '正常' : '偏高',
        icon: Activity,
        color: devSeverityColor(analysis.avgDeviation),
      },
      {
        label: '波动率 (σ)',
        value: `${analysis.volatility.toFixed(4)}%`,
        sub: analysis.volatility < 0.05 ? '低波动' : analysis.volatility < 0.15 ? '中等' : '高波动',
        icon: BarChart3,
        color: analysis.volatility < 0.05 ? '#10b981' : analysis.volatility < 0.15 ? '#f59e0b' : '#ef4444',
      },
      {
        label: '最长脱锚',
        value: analysis.longestDepeg > 0 ? `${Math.round(analysis.longestDepeg)}h` : '无',
        sub: analysis.events.length > 0 ? `共 ${analysis.events.length} 次事件` : '90日内无脱锚',
        icon: Clock,
        color: analysis.longestDepeg > 48 ? '#ef4444' : analysis.longestDepeg > 0 ? '#f59e0b' : '#10b981',
      },
    ]
  }, [analysis])

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* 标题 */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          历史 Peg 偏差与脱锚事件分析
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40 font-mono">90日</span>
        </h2>
      </div>

      {isLoading || !analysis ? (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />)}
          </div>
          <div className="h-[180px] bg-white/5 rounded-lg animate-pulse" />
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* 关键统计卡片 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                    <span className="text-[10px] text-white/50 font-semibold">{s.label}</span>
                  </div>
                  <div className="text-lg font-black font-mono" style={{ color: s.color }}>{s.value}</div>
                  {s.sub && <div className="text-[10px] text-white/30 mt-0.5">{s.sub}</div>}
                </div>
              )
            })}
          </div>

          {/* 两列：热力图 + 脱锚事件时间线 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 热力图 — 占2列 */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart3 className="w-3.5 h-3.5 text-white/40" />
                <span className="text-[10px] text-white/50 font-semibold">Peg 偏差热力图</span>
                <div className="ml-auto flex items-center gap-1 text-[9px] text-white/30">
                  <span className="w-2 h-2 rounded-sm" style={{ background: '#059669' }} /> 稳定
                  <span className="w-2 h-2 rounded-sm ml-1" style={{ background: '#fbbf24' }} /> 轻度
                  <span className="w-2 h-2 rounded-sm ml-1" style={{ background: '#dc2626' }} /> 严重
                </div>
              </div>
              <div className="h-[180px]">
                <ReactECharts option={heatmapOption} style={{ width: '100%', height: '100%' }} opts={{ renderer: 'canvas' }} />
              </div>
            </div>

            {/* 脱锚事件时间线 — 占1列 */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-white/40" />
                <span className="text-[10px] text-white/50 font-semibold">脱锚事件时间线</span>
              </div>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {analysis.events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[160px] text-center">
                    <ShieldAlert className="w-8 h-8 text-emerald-500/40 mb-2" />
                    <span className="text-xs font-bold text-emerald-500/60">90日内无脱锚事件</span>
                    <span className="text-[10px] text-white/30 mt-1">USD1 锚定保持稳定</span>
                  </div>
                ) : (
                  analysis.events.map((evt, i) => (
                    <div
                      key={i}
                      className="relative pl-4 py-2 rounded-lg border transition-colors"
                      style={{
                        borderColor: chartColors(dark).timelineBorder,
                        background: chartColors(dark).timelineBg,
                      }}
                    >
                      {/* 左侧时间线竖线 + 圆点 */}
                      <div
                        className="absolute left-1.5 top-2.5 w-1.5 h-1.5 rounded-full"
                        style={{ background: devSeverityColor(evt.peakDev) }}
                      />
                      {i < analysis.events.length - 1 && (
                        <div className="absolute left-[8.5px] top-5 w-px h-[calc(100%-8px)]" style={{ background: chartColors(dark).timelineBorder }} />
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white/50">{evt.startDate} — {evt.endDate}</span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ color: devSeverityColor(evt.peakDev), background: `${devSeverityColor(evt.peakDev)}15` }}
                        >
                          {evt.direction === 'above' ? '↑' : '↓'} {evt.peakDev.toFixed(3)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] text-white/30">
                          <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                          持续 {Math.round(evt.durationHours)}h
                        </span>
                        <span className="text-[9px] text-white/30">
                          峰值偏离 {evt.peakDev.toFixed(4)}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="text-[9px] text-white/20 text-center">
            * 偏差基于 USD1 相对 $1.00 锚定价的绝对百分比偏移，脱锚阈值为 &gt;0.1%
          </div>
        </div>
      )}
    </div>
  )
}
