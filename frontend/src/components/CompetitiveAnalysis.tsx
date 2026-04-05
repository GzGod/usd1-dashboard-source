import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { BarChart3, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import type { DashboardData, RankingItem } from '../hooks/useUsd1Data'
import { formatCompact, pegDeviation } from '../lib/utils'
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

interface Props {
  data: DashboardData | undefined
}

const STABLE_COLORS: Record<string, string> = {
  USD1: '#06b6d4',
  USDT: '#26a17b',
  USDC: '#2775ca',
  USDE: '#f59e0b',
  USDS: '#6366f1',
  DAI: '#f5ac37',
}

export default function CompetitiveAnalysis({ data }: Props) {
  const { dark } = useTheme()
  const stables = useMemo(() => {
    if (!data?.ranking) return []
    const targets = ['USD1', 'USDT', 'USDC', 'USDE', 'USDS', 'DAI']
    return targets.map(sym => data.ranking.find((r: RankingItem) => r.symbol === sym)).filter(Boolean) as RankingItem[]
  }, [data])

  const volumeOption = useMemo(() => {
    if (!stables.length) return {}
    const c = chartColors(dark)
    return {
      grid: { left: 56, right: 16, top: 16, bottom: 40 },
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
          return `<div style="font-weight:600;font-size:12px;color:${c.fgBase};margin-bottom:4px">${p.name}</div>
            <div style="display:flex;align-items:center;gap:6px">
              <span style="display:inline-block;width:12px;height:2.5px;border-radius:1px;background:${p.color}"></span>
              <span style="color:${c.fgSubtle};font-size:12px">24小时交易量</span>
              <span style="font-weight:600;font-size:12px;color:${c.fgBase}">$${formatCompact(p.value)}</span>
            </div>`
        },
      },
      xAxis: {
        type: 'category',
        data: stables.map(s => s.symbol),
        axisLine: { show: true, lineStyle: { color: c.axisLineColor } },
        axisLabel: { color: c.fgSubtle, fontSize: 10, fontWeight: 'bold' },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: c.fgSubtle, fontSize: 10, formatter: (v: number) => `$${formatCompact(v)}` },
        splitLine: { lineStyle: { type: 'dashed', color: c.splitLineColor } },
      },
      series: [{
        type: 'bar',
        barMaxWidth: 32,
        borderRadius: [2, 2, 0, 0],
        data: stables.map(s => ({
          value: s.volume_24h_usd,
          itemStyle: { color: STABLE_COLORS[s.symbol] || '#666' },
        })),
      }],
    }
  }, [stables, dark])

  const DevBadge = ({ price }: { price: number }) => {
    const dev = pegDeviation(price)
    const color = dev < 0.01 ? '#10b981' : dev < 0.1 ? '#f59e0b' : '#ef4444'
    const Icon = dev < 0.01 ? Minus : price > 1 ? ArrowUp : ArrowDown
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ color, background: `${color}12` }}>
        <Icon className="w-2.5 h-2.5" />{dev.toFixed(4)}%
      </span>
    )
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-400" />
          竞品对比分析
        </h2>
      </div>

      {/* 对比表格 */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['稳定币', '价格', '锚定偏离', '总市值', '24h交易量', '24h涨跌', '供应量'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stables.map(s => (
              <tr key={s.symbol} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${s.symbol === 'USD1' ? 'bg-cyan-500/[0.03]' : ''}`}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {s.image && <img src={s.image} alt={s.symbol} className="w-5 h-5 rounded-full" />}
                    <div>
                      <span className="font-bold text-white/90">{s.symbol}</span>
                      <span className="text-white/40 ml-1 text-[10px]">{s.name}</span>
                    </div>
                    {s.symbol === 'USD1' && <span className="text-[8px] px-1 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">当前</span>}
                  </div>
                </td>
                <td className="px-3 py-2.5 font-mono font-bold text-white/90">${s.price_usd.toFixed(5)}</td>
                <td className="px-3 py-2.5"><DevBadge price={s.price_usd} /></td>
                <td className="px-3 py-2.5 font-mono text-white/70">${formatCompact(s.market_cap_usd)}</td>
                <td className="px-3 py-2.5 font-mono text-white/70">${formatCompact(s.volume_24h_usd)}</td>
                <td className="px-3 py-2.5">
                  <span className={`font-mono font-bold ${s.change_24h_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.change_24h_pct >= 0 ? '+' : ''}{s.change_24h_pct.toFixed(4)}%
                  </span>
                </td>
                <td className="px-3 py-2.5 font-mono text-white/70">{formatCompact(s.circulating_supply)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 交易量图表 */}
      <div className="p-2 border-t border-white/[0.06]">
        <ReactECharts option={volumeOption} style={{ height: 200 }} opts={{ renderer: 'svg' }} theme={dark ? 'dark' : undefined} />
      </div>
    </div>
  )
}
