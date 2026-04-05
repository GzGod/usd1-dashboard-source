import { useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useCompare, useKlines } from '../hooks/useUsd1Data'
import { useTheme } from '../lib/ThemeContext'

const TIMEFRAMES = ['1d', '7d', '30d', '90d'] as const
const INTERVALS = ['1h', '4h', '1d'] as const

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

export default function PriceChart() {
  const { dark } = useTheme()
  const [range, setRange] = useState<string>('30d')
  const [klineInterval, setKlineInterval] = useState<string>('1h')
  const [view, setView] = useState<'line' | 'candle'>('line')

  const { data: compare, isLoading: loadingCompare } = useCompare(range)
  const { data: klines } = useKlines(klineInterval)

  const lineOption = useMemo(() => {
    if (!compare) return {}
    const c = chartColors(dark)
    const series = [
      { name: 'USD1', data: compare.usd1, color: '#06b6d4' },
      { name: 'USDT', data: compare.usdt, color: '#26a17b' },
      { name: 'USDC', data: compare.usdc, color: '#2775ca' },
      { name: 'USDe', data: compare.usde, color: '#f59e0b' },
    ]

    return {
      grid: { left: 56, right: 16, top: 40, bottom: 64 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: c.tooltipBg,
        borderColor: c.tooltipBorder,
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: c.fgBase, fontSize: 12 },
        extraCssText: `border-radius:8px;box-shadow:0 4px 12px ${c.shadowColor};`,
        formatter: (params: any[]) => {
          const header = `<div style="font-weight:600;font-size:12px;color:${c.fgBase};margin-bottom:4px">${new Date(params[0].value[0] * 1000).toLocaleString('zh-CN')}</div>`
          const rows = params.map((p: any) =>
            `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px">` +
              `<div style="display:flex;align-items:center;gap:6px">` +
                `<span style="display:inline-block;width:12px;height:2.5px;border-radius:1px;background:${p.color}"></span>` +
                `<span style="color:${c.fgSubtle};font-size:12px">${p.seriesName}</span>` +
              `</div>` +
              `<span style="font-weight:600;font-size:12px;color:${c.fgBase}">$${p.value[1].toFixed(5)}</span>` +
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
        type: 'time',
        axisLine: { show: true, lineStyle: { color: c.axisLineColor, width: 1 } },
        axisLabel: { color: c.fgSubtle, fontSize: 10 },
        axisTick: { show: false },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        min: (v: any) => Math.max(0.99, v.min - 0.001),
        max: (v: any) => Math.min(1.01, v.max + 0.001),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: c.fgSubtle, fontSize: 10, formatter: (v: number) => `$${v.toFixed(4)}` },
        splitLine: { lineStyle: { type: 'dashed', color: c.splitLineColor } },
      },
      series: series.map(s => ({
        name: s.name,
        type: 'line',
        symbol: 'none',
        smooth: false,
        lineStyle: { width: s.name === 'USD1' ? 1.5 : 1, type: s.name === 'USD1' ? 'solid' : 'dashed' },
        itemStyle: { color: s.color },
        areaStyle: s.name === 'USD1' ? { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${s.color}20` }, { offset: 1, color: `${s.color}00` }] } } : undefined,
        data: s.data.map(p => [p.timestamp, p.value]),
      })),
    }
  }, [compare, dark])

  const candleOption = useMemo(() => {
    if (!klines || !klines[0]?.candles) return {}
    const c = chartColors(dark)
    const candles = klines[0].candles

    // timestamp 可能是秒或毫秒，自动检测：如果 < 1e12 说明是秒级
    const toMs = (ts: number) => ts < 1e12 ? ts * 1000 : ts

    return {
      grid: { left: 56, right: 16, top: 16, bottom: 24 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: c.tooltipBg,
        borderColor: c.tooltipBorder,
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: c.fgBase, fontSize: 12 },
        extraCssText: `border-radius:8px;box-shadow:0 4px 12px ${c.shadowColor};`,
        formatter: (params: any[]) => {
          const p = params[0]
          if (!p) return ''
          return `<div style="font-size:12px;color:${c.fgBase}">
            <div style="font-weight:600;margin-bottom:4px">${new Date(p.value[0]).toLocaleString('zh-CN')}</div>
            <div>开: $${p.value[1].toFixed(5)}</div>
            <div>高: $${p.value[4].toFixed(5)}</div>
            <div>低: $${p.value[3].toFixed(5)}</div>
            <div>收: $${p.value[2].toFixed(5)}</div>
          </div>`
        },
      },
      xAxis: {
        type: 'time',
        axisLine: { show: true, lineStyle: { color: c.axisLineColor, width: 1 } },
        axisLabel: { color: c.fgSubtle, fontSize: 10 },
        axisTick: { show: false },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: c.fgSubtle, fontSize: 10, formatter: (v: number) => `$${v.toFixed(4)}` },
        splitLine: { lineStyle: { type: 'dashed', color: c.splitLineColor } },
      },
      series: [{
        type: 'candlestick',
        itemStyle: { color: '#10b981', color0: '#ef4444', borderColor: '#10b981', borderColor0: '#ef4444' },
        data: candles.map(k => [toMs(k.timestamp), k.open, k.close, k.low, k.high]),
      }],
    }
  }, [klines, dark])

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          价格与锚定稳定性
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-white/[0.08]">
            <button onClick={() => setView('line')} className={`px-2.5 py-1 text-[10px] font-semibold transition-colors ${view === 'line' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/40 hover:text-white/60'}`}>折线图</button>
            <button onClick={() => setView('candle')} className={`px-2.5 py-1 text-[10px] font-semibold transition-colors ${view === 'candle' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/40 hover:text-white/60'}`}>K线图</button>
          </div>
          {view === 'line' ? (
            <div className="flex rounded-lg overflow-hidden border border-white/[0.08]">
              {TIMEFRAMES.map(tf => (
                <button key={tf} onClick={() => setRange(tf)} className={`px-2 py-1 text-[10px] font-semibold transition-colors ${range === tf ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/40 hover:text-white/60'}`}>{tf.toUpperCase()}</button>
              ))}
            </div>
          ) : (
            <div className="flex rounded-lg overflow-hidden border border-white/[0.08]">
              {INTERVALS.map(iv => (
                <button key={iv} onClick={() => setKlineInterval(iv)} className={`px-2 py-1 text-[10px] font-semibold transition-colors ${klineInterval === iv ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/40 hover:text-white/60'}`}>{iv.toUpperCase()}</button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="p-2 flex-1 min-h-0">
        {loadingCompare ? (
          <div className="h-full min-h-[320px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : (
          <ReactECharts
            key={view}
            option={view === 'line' ? lineOption : candleOption}
            notMerge={true}
            style={{ width: '100%', height: '100%', minHeight: 320 }}
            opts={{ renderer: 'svg' }}
            theme={dark ? 'dark' : undefined}
          />
        )}
      </div>
    </div>
  )
}
