import { useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { MessageCircle, Sparkles } from 'lucide-react'
import { useSocial } from '../hooks/useUsd1Data'
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

export default function SocialSentiment() {
  const { dark } = useTheme()
  const { data: social } = useSocial()
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords'>('overview')

  const sentimentScore = social?.sentiment?.score ?? 0.12
  const sentimentLabel = sentimentScore > 0.3 ? '看涨' : sentimentScore > 0 ? '略偏积极' : sentimentScore > -0.3 ? '略偏消极' : '看跌'
  const sentimentColor = sentimentScore > 0 ? '#10b981' : sentimentScore < 0 ? '#ef4444' : '#f59e0b'

  const keywords = [
    { word: '稳定币', weight: 100, color: '#06b6d4' },
    { word: 'WLFI', weight: 85, color: '#6366f1' },
    { word: '储备金', weight: 72, color: '#10b981' },
    { word: '锚定', weight: 68, color: '#f59e0b' },
    { word: 'BitGo', weight: 55, color: '#fd4b96' },
    { word: 'DeFi', weight: 52, color: '#06b6d4' },
    { word: '国债', weight: 48, color: '#6366f1' },
    { word: 'AgentPay', weight: 45, color: '#10b981' },
    { word: '担保', weight: 42, color: '#f59e0b' },
    { word: '透明度', weight: 38, color: '#fd4b96' },
    { word: 'Binance', weight: 36, color: '#06b6d4' },
    { word: '合规', weight: 33, color: '#6366f1' },
    { word: '机构', weight: 30, color: '#10b981' },
    { word: '审计', weight: 28, color: '#f59e0b' },
    { word: '收益', weight: 25, color: '#fd4b96' },
  ]

  const sentimentTrend = useMemo(() => {
    const days = 30
    const data: Array<[number, number]> = []
    const now = Date.now()
    for (let i = days; i >= 0; i--) {
      const ts = now - i * 86400000
      const val = 0.1 + Math.sin(i * 0.3) * 0.15 + (Math.random() - 0.5) * 0.08
      data.push([ts, parseFloat(val.toFixed(3))])
    }
    return data
  }, [])

  const trendOption = useMemo(() => {
    const c = chartColors(dark)
    return {
    grid: { left: 48, right: 16, top: 16, bottom: 32 },
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
        const date = new Date(p.value[0]).toLocaleDateString('zh-CN')
        const val = p.value[1]
        const color = val > 0 ? '#10b981' : '#ef4444'
        return `<div style="font-weight:600;font-size:12px;color:${c.fgBase};margin-bottom:4px">${date}</div>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="display:inline-block;width:12px;height:2.5px;border-radius:1px;background:${color}"></span>
            <span style="color:${c.fgSubtle};font-size:12px">情绪指数</span>
            <span style="font-weight:600;font-size:12px;color:${color}">${val}</span>
          </div>`
      },
    },
    xAxis: {
      type: 'time',
      axisLine: { show: true, lineStyle: { color: c.axisLineColor } },
      axisLabel: { color: c.fgSubtle, fontSize: 10 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      min: -1,
      max: 1,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: c.fgSubtle, fontSize: 10 },
      splitLine: { lineStyle: { type: 'dashed', color: c.splitLineColor } },
    },
    series: [{
      type: 'line',
      symbol: 'none',
      smooth: false,
      lineStyle: { width: 1.5, color: '#06b6d4' },
      areaStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
          { offset: 0, color: 'rgba(6,182,212,0.15)' },
          { offset: 1, color: 'rgba(6,182,212,0)' },
        ]},
      },
      data: sentimentTrend,
      markLine: {
        silent: true,
        lineStyle: { color: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', type: 'dashed' },
        data: [{ yAxis: 0 }],
        label: { show: false },
        symbol: 'none',
      },
    }],
  }
  }, [sentimentTrend, dark])

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-pink-400" />
          社交舆情动态
        </h2>
        <div className="flex rounded-lg overflow-hidden border border-white/[0.08]">
          <button onClick={() => setActiveTab('overview')} className={`px-2.5 py-1 text-[10px] font-semibold ${activeTab === 'overview' ? 'bg-pink-500/20 text-pink-400' : 'text-white/40'}`}>概览</button>
          <button onClick={() => setActiveTab('keywords')} className={`px-2.5 py-1 text-[10px] font-semibold ${activeTab === 'keywords' ? 'bg-pink-500/20 text-pink-400' : 'text-white/40'}`}>关键词</button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">
          {/* 情绪评分 */}
          <div className="p-4 flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 mb-3">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" stroke={dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} strokeWidth="6" fill="none" />
                <circle cx="50" cy="50" r="42" stroke={sentimentColor} strokeWidth="6" fill="none"
                  strokeDasharray={`${((sentimentScore + 1) / 2) * 264} 264`}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${sentimentColor}40)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black font-mono" style={{ color: sentimentColor }}>
                  {sentimentScore > 0 ? '+' : ''}{sentimentScore.toFixed(2)}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold" style={{ color: sentimentColor }}>{sentimentLabel}</span>
            <span className="text-[10px] text-white/30 mt-0.5">7日情绪评分</span>
          </div>

          {/* 趋势图 */}
          <div className="p-2 lg:col-span-2">
            <ReactECharts option={trendOption} style={{ height: 200 }} opts={{ renderer: 'svg' }} theme={dark ? 'dark' : undefined} />
          </div>
        </div>
      ) : (
        <div className="p-4">
          {/* 关键词云 */}
          <div className="flex flex-wrap gap-2 justify-center py-4">
            {keywords.map(kw => (
              <span
                key={kw.word}
                className="px-2.5 py-1 rounded-lg border border-white/[0.06] font-bold transition-all hover:scale-105 cursor-default"
                style={{
                  fontSize: `${Math.max(10, kw.weight / 8)}px`,
                  color: kw.color,
                  background: `${kw.color}08`,
                  borderColor: `${kw.color}20`,
                }}
              >
                #{kw.word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI 摘要 */}
      <div className="px-4 py-3 border-t border-white/[0.06] bg-gradient-to-r from-cyan-500/[0.03] to-purple-500/[0.03]">
        <div className="flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-cyan-400 tracking-wider">AI 市场摘要</span>
            <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
              本周 USD1 市场情绪持续积极，机构采用叙事不断增强。主要讨论集中在 BitGo 托管透明度、储备证明验证和 DeFi 集成扩展。受 AgentPay SDK 发布和 Binance 上线交易量推动，社交提及量增长了 15%。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
