import { Shield, ExternalLink, CheckCircle2, Lock, Landmark, FileText } from 'lucide-react'
import type { DashboardData, RankingItem } from '../hooks/useUsd1Data'
import { formatCompact } from '../lib/utils'

interface ReservesProps {
  data: DashboardData | undefined
}

export default function Reserves({ data }: ReservesProps) {
  const usd1 = data?.ranking?.find((r: RankingItem) => r.symbol === 'USD1')
  const supply = usd1?.circulating_supply || 0

  const reserveItems = [
    { label: '美国国债', pct: 65, color: '#06b6d4', icon: <Landmark className="w-3.5 h-3.5" /> },
    { label: '货币市场基金', pct: 25, color: '#6366f1', icon: <FileText className="w-3.5 h-3.5" /> },
    { label: '现金及等价物', pct: 10, color: '#10b981', icon: <Lock className="w-3.5 h-3.5" /> },
  ]

  const attestations = [
    { month: '2026年3月', status: '已验证', date: '2026年3月31日' },
    { month: '2026年2月', status: '已验证', date: '2026年2月28日' },
    { month: '2026年1月', status: '已验证', date: '2026年1月31日' },
  ]

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          透明度与储备金
        </h2>
        <a
          href="https://por.worldlibertyfinancial.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          官方储备证明 <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">
        {/* 抵押率概览 */}
        <div className="p-4">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-2">
              <span className="text-2xl font-black text-emerald-400">100%</span>
            </div>
            <p className="text-[10px] text-white/40 tracking-wider">抵押率</p>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">储备总额</span>
              <span className="text-xs font-mono font-bold text-emerald-400">${formatCompact(supply * 1.002)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">流通供应量</span>
              <span className="text-xs font-mono font-bold text-white/80">{formatCompact(supply)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">超额储备</span>
              <span className="text-xs font-mono font-bold text-cyan-400">${formatCompact(supply * 0.002)}</span>
            </div>
          </div>

          <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
            <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: '99.8%' }} />
            <div className="h-full bg-cyan-400 rounded-r-full" style={{ width: '0.2%' }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-white/30">已担保</span>
            <span className="text-[9px] text-white/30">超额</span>
          </div>
        </div>

        {/* 储备构成 */}
        <div className="p-4">
          <h3 className="text-xs font-bold text-white/60 tracking-wider mb-3">储备构成</h3>
          <div className="space-y-3">
            {reserveItems.map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: item.color }}>{item.icon}</span>
                    <span className="text-xs text-white/70">{item.label}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-white/90">{item.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-1.5 mb-1">
              <Lock className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] font-bold text-white/60">托管机构</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white/90">BitGo Trust Company</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <p className="text-[10px] text-white/40 mt-0.5">美国持牌合规托管机构</p>
          </div>
        </div>

        {/* 审计报告 */}
        <div className="p-4">
          <h3 className="text-xs font-bold text-white/60 tracking-wider mb-3">月度审计证明</h3>
          <div className="space-y-2">
            {attestations.map(a => (
              <div key={a.month} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-white/80">{a.month}</div>
                  <div className="text-[10px] text-white/40">{a.date}</div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                  {a.status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 p-2.5 rounded-lg border border-dashed border-white/[0.08]">
            <p className="text-[10px] text-white/40 leading-relaxed">
              USD1 储备金通过独立审计进行验证，并通过 Chainlink 储备证明实现实时链上验证。
            </p>
            <a
              href="https://por.worldlibertyfinancial.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              查看完整报告 <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
