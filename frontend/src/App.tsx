import { useState, useEffect } from 'react'
import { useDashboard } from './hooks/useUsd1Data'
import Header from './components/Header'
import PriceChart from './components/PriceChart'
import OnChainActivity from './components/OnChainActivity'
import Reserves from './components/Reserves'
import SocialSentiment from './components/SocialSentiment'
import CompetitiveAnalysis from './components/CompetitiveAnalysis'
import AgentPay from './components/AgentPay'
import AlertCenter from './components/AlertCenter'
import CapitalFlow from './components/CapitalFlow'
import PegDeviationAnalysis from './components/PegDeviationAnalysis'
import { Database, ExternalLink, Shield, Download } from 'lucide-react'
import { ThemeContext } from './lib/ThemeContext'

/** 根据本地时间自动判断：18:00–06:00 为夜间模式 */
function isNightTime() {
  const h = new Date().getHours()
  return h >= 18 || h < 6
}

export default function App() {
  const { data, isLoading } = useDashboard()
  const [darkMode, setDarkMode] = useState(isNightTime)

  // 切换 html 上的 dark 类，驱动 CSS 变量切换
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <ThemeContext.Provider value={{ dark: darkMode }}>
    <div className="min-h-screen font-[Lato,sans-serif] transition-colors duration-300" style={{ background: 'var(--dash-bg)', color: 'var(--dash-fg)' }}>
      {/* Scanline effect overlay */}
      <div className="pointer-events-none fixed inset-0 z-40 opacity-[0.015]" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, var(--dash-scanline) 2px, var(--dash-scanline) 4px)` }} />

      {/* Header */}
      <Header
        data={data}
        isLoading={isLoading}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(!darkMode)}
      />

      {/* Main Content */}
      <main className="px-4 sm:px-6 pb-8 space-y-4">
        {/* Row 1: Price Chart + Capital Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PriceChart />
          <CapitalFlow />
        </div>

        {/* Row 2: Peg Deviation & Depeg Events */}
        <PegDeviationAnalysis />

        {/* Row 3: On-Chain Activity */}
        <OnChainActivity />

        {/* Row 3: Reserves */}
        <Reserves data={data} />

        {/* Row 4: Social + AgentPay */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SocialSentiment />
          <AgentPay />
        </div>

        {/* Row 5: Competitive Analysis */}
        <CompetitiveAnalysis data={data} />

        {/* Row 6: Alert Center */}
        <AlertCenter />

        {/* 页脚 */}
        <footer className="border-t border-white/[0.06] pt-6 pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={`${import.meta.env.BASE_URL}usd1-logo.png`} alt="USD1" className="w-7 h-7 rounded-full" />
              <div>
                <span className="text-xs font-bold text-white/60">USD1 数据看板</span>
                <span className="text-[10px] text-white/30 ml-1.5">实时哨兵</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                <Database className="w-3 h-3" />
                <span>数据来源</span>
                <span className="text-white/50 font-bold">AskSurf</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                <Shield className="w-3 h-3" />
                <span>储备验证</span>
                <a href="https://por.worldlibertyfinancial.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400/60 hover:text-cyan-400 transition-colors font-bold flex items-center gap-0.5">
                  WLFI <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            <a
              href={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/api/usd1/download-source`}
              download="usd1-dashboard-source.tar.gz"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[11px] font-bold hover:bg-cyan-500/20 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              下载源码
            </a>

            <div className="text-[9px] text-white/20 text-center sm:text-right max-w-xs leading-relaxed">
              本仪表盘仅供信息参考，不构成投资建议。数据可能存在延迟，请自行核实。
            </div>
          </div>
        </footer>
      </main>

    </div>
    </ThemeContext.Provider>
  )
}
