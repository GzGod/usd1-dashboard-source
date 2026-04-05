import { useState, useEffect } from 'react'
import { Activity, TrendingUp, TrendingDown, Shield, Zap, Moon, Sun, ExternalLink } from 'lucide-react'
import { formatUSD, formatPct, pegDeviation, pegColor, formatCompact } from '../lib/utils'
import type { DashboardData, RankingItem } from '../hooks/useUsd1Data'

interface HeaderProps {
  data: DashboardData | undefined
  isLoading: boolean
  darkMode: boolean
  onToggleDark: () => void
}

export default function Header({ data, isLoading, darkMode, onToggleDark }: HeaderProps) {
  const [tick, setTick] = useState(0)
  useEffect(() => { const i = setInterval(() => setTick(t => t + 1), 5000); return () => clearInterval(i) }, [])

  const prices = data?.price1d || []
  const currentPrice = prices.length > 0 ? prices[prices.length - 1].value : null
  const firstPrice = prices.length > 1 ? prices[0].value : null
  const change24h = currentPrice != null && firstPrice != null ? ((currentPrice - firstPrice) / firstPrice) * 100 : null
  const dev = currentPrice != null ? pegDeviation(currentPrice) : null
  const devColor = dev != null ? pegColor(dev) : '#10b981'

  const usd1Ranking: RankingItem | undefined = data?.ranking?.find((r: RankingItem) => r.symbol === 'USD1')
  const marketCap = usd1Ranking?.market_cap_usd
  const volume24h = usd1Ranking?.volume_24h_usd
  const supply = usd1Ranking?.circulating_supply
  const holdersCount = data?.holders?.length || 0

  const shimmer = 'animate-pulse bg-white/5 rounded'

  const metrics = [
    {
      label: '当前价格',
      value: currentPrice != null ? formatUSD(currentPrice) : null,
      sub: change24h != null ? formatPct(change24h) : null,
      subColor: change24h != null ? (change24h >= 0 ? '#10b981' : '#ef4444') : undefined,
      icon: <Activity className="w-4 h-4" />,
      glow: '#06b6d4',
    },
    {
      label: '锚定偏离',
      value: dev != null ? `${dev.toFixed(4)}%` : null,
      sub: dev != null ? (dev < 0.01 ? '稳定' : dev < 0.1 ? '轻微偏移' : '预警') : null,
      subColor: devColor,
      icon: <Shield className="w-4 h-4" />,
      glow: devColor,
    },
    {
      label: '总市值',
      value: marketCap != null ? `$${formatCompact(marketCap)}` : null,
      sub: usd1Ranking ? `排名 #${usd1Ranking.rank}` : null,
      subColor: '#6366f1',
      icon: <TrendingUp className="w-4 h-4" />,
      glow: '#6366f1',
    },
    {
      label: '24小时交易量',
      value: volume24h != null ? `$${formatCompact(volume24h)}` : null,
      sub: null,
      subColor: undefined,
      icon: <Zap className="w-4 h-4" />,
      glow: '#f59e0b',
    },
    {
      label: '流通供应量',
      value: supply != null ? formatCompact(supply, 0) : null,
      sub: 'USD1',
      subColor: '#aaaaaa',
      icon: <TrendingDown className="w-4 h-4" />,
      glow: '#10b981',
    },
    {
      label: '主要持仓',
      value: holdersCount > 0 ? `${holdersCount}+` : null,
      sub: '追踪钱包',
      subColor: '#aaaaaa',
      icon: <Activity className="w-4 h-4" />,
      glow: '#fd4b96',
    },
    {
      label: '抵押率',
      value: '100%+',
      sub: '完全担保',
      subColor: '#10b981',
      icon: <Shield className="w-4 h-4" />,
      glow: '#10b981',
    },
  ]

  return (
    <header className="w-full">
      {/* 顶栏 */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={`${import.meta.env.BASE_URL}usd1-logo.png`} alt="USD1" className="w-9 h-9 rounded-full shadow-lg shadow-amber-500/20" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 animate-pulse" style={{ borderColor: 'var(--dash-bg)' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">USD1 <span className="text-cyan-400">数据看板</span></h1>
              <a
                href="https://x.com/Xuegaogx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-[10px] font-bold hover:bg-amber-500/20 transition-colors"
              >
                雪糕战神 <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <p className="text-[10px] text-white/40 tracking-widest">实时哨兵监控</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 实时行情 */}
          {currentPrice != null && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-mono font-bold text-white">{formatUSD(currentPrice)}</span>
              {dev != null && (
                <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ color: devColor, background: `${devColor}15` }}>
                  {dev < 0.01 ? '=' : currentPrice >= 1 ? '+' : '-'}{dev.toFixed(4)}%
                </span>
              )}
            </div>
          )}
          <button onClick={onToggleDark} className="w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors">
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 指标行 */}
      <div className="px-4 sm:px-6 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="relative flex-1 min-w-[140px] px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
            >
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: `inset 0 1px 0 ${m.glow}20, 0 0 20px ${m.glow}08` }} />
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-1">
                  <span style={{ color: m.glow }} className="opacity-60">{m.icon}</span>
                  <span className="text-[10px] text-white/40 tracking-wider font-medium">{m.label}</span>
                </div>
                {isLoading || m.value == null ? (
                  <div className={`h-6 w-20 ${shimmer}`} />
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-white font-mono">{m.value}</span>
                    {m.sub && <span className="text-[10px] font-medium" style={{ color: m.subColor }}>{m.sub}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
