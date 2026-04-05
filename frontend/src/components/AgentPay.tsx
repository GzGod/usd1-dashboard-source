import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { Bot, Zap, ArrowLeftRight, CreditCard, Globe } from 'lucide-react'
import { useTheme } from '../lib/ThemeContext'

function chartColors(dark: boolean) {
  return {
    fgBase: dark ? '#e7e7e7' : '#1a1a1a',
    fgSubtle: dark ? '#aaaaaa' : '#666666',
    tooltipBg: dark ? '#171717' : '#ffffff',
    tooltipBorder: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
    splitLineColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    axisLineColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    shadowColor: dark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.12)',
  }
}

export default function AgentPay() {
  const { dark } = useTheme()
  const metrics = [
    { label: '无Gas交易', value: '2.4M', change: '+18.2%', icon: <Zap className="w-3.5 h-3.5" />, color: '#06b6d4' },
    { label: 'AI代理交易量', value: '$48.7M', change: '+32.5%', icon: <Bot className="w-3.5 h-3.5" />, color: '#6366f1' },
    { label: '跨链流动', value: '$12.3M', change: '+8.1%', icon: <ArrowLeftRight className="w-3.5 h-3.5" />, color: '#10b981' },
    { label: 'P2P借贷', value: '$5.6M', change: '+45.2%', icon: <CreditCard className="w-3.5 h-3.5" />, color: '#f59e0b' },
  ]

  const chartData = useMemo(() => {
    const days = 14
    const data: Array<{ date: string; gasless: number; agent: number; bridge: number }> = []
    for (let i = days; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      data.push({
        date: d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        gasless: 150000 + Math.random() * 50000 + (days - i) * 5000,
        agent: 2800000 + Math.random() * 1200000 + (days - i) * 200000,
        bridge: 700000 + Math.random() * 400000 + (days - i) * 50000,
      })
    }
    return data
  }, [])

  const chartOption = useMemo(() => {
    const c = chartColors(dark)
    return {
    grid: { left: 56, right: 16, top: 16, bottom: 64 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.tooltipBg,
      borderColor: c.tooltipBorder,
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: c.fgBase, fontSize: 12 },
      extraCssText: `border-radius:8px;box-shadow:0 4px 12px ${c.shadowColor};`,
      formatter: (params: any[]) => {
        const header = `<div style="font-weight:600;font-size:12px;color:${c.fgBase};margin-bottom:4px">${params[0].axisValueLabel}</div>`
        const rows = params.map((p: any) =>
          `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px">` +
            `<div style="display:flex;align-items:center;gap:6px">` +
              `<span style="display:inline-block;width:12px;height:2.5px;border-radius:1px;background:${p.color}"></span>` +
              `<span style="color:${c.fgSubtle};font-size:12px">${p.seriesName}</span>` +
            `</div>` +
            `<span style="font-weight:600;font-size:12px;color:${c.fgBase}">${p.seriesName === '无Gas交易' ? p.value.toLocaleString() : '$' + (p.value / 1e6).toFixed(2) + 'M'}</span>` +
          `</div>`
        ).join('')
        return header + rows
      },
    },
    legend: {
      type: 'plain',
      bottom: 0,
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 3,
      textStyle: { color: c.fgSubtle, fontSize: 11 },
    },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.date),
      axisLine: { show: true, lineStyle: { color: c.axisLineColor } },
      axisLabel: { color: c.fgSubtle, fontSize: 10 },
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: c.fgSubtle, fontSize: 10, formatter: (v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${(v / 1e3).toFixed(0)}K` },
        splitLine: { lineStyle: { type: 'dashed', color: c.splitLineColor } },
      },
    ],
    series: [
      {
        name: '无Gas交易',
        type: 'bar',
        barMaxWidth: 16,
        borderRadius: [2, 2, 0, 0],
        itemStyle: { color: '#06b6d4' },
        data: chartData.map(d => d.gasless),
      },
      {
        name: 'AI代理交易量',
        type: 'line',
        symbol: 'none',
        smooth: false,
        lineStyle: { width: 1.5 },
        itemStyle: { color: '#6366f1' },
        data: chartData.map(d => d.agent),
      },
      {
        name: '跨链流动',
        type: 'line',
        symbol: 'none',
        smooth: false,
        lineStyle: { width: 1.5, type: 'dashed' },
        itemStyle: { color: '#10b981' },
        data: chartData.map(d => d.bridge),
      },
    ],
  }
  }, [chartData, dark])

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          AI支付与WLFI生态
        </h2>
      </div>

      {/* 指标卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-white/[0.06] border-b border-white/[0.06]">
        {metrics.map(m => (
          <div key={m.label} className="p-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span style={{ color: m.color }}>{m.icon}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">{m.label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-white font-mono">{m.value}</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400">{m.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 图表 */}
      <div className="p-2">
        <ReactECharts option={chartOption} style={{ height: 240 }} opts={{ renderer: 'svg' }} theme={dark ? 'dark' : undefined} />
      </div>
    </div>
  )
}
