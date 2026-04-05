import { useState } from 'react'
import { Bell, AlertTriangle, TrendingDown, Waves, ShieldAlert, MessageSquareWarning, Send, ChevronDown, ChevronUp } from 'lucide-react'

interface Alert {
  id: string
  type: 'peg' | 'whale' | 'volume' | 'reserve' | 'sentiment'
  title: string
  description: string
  threshold: string
  active: boolean
  icon: React.ReactNode
  color: string
}

export default function AlertCenter() {
  const [expanded, setExpanded] = useState(true)
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 'peg', type: 'peg', title: '锚定偏离', description: 'USD1价格偏离$1.00', threshold: '>0.5%', active: true, icon: <TrendingDown className="w-3.5 h-3.5" />, color: '#ef4444' },
    { id: 'whale', type: 'whale', title: '巨鲸转账', description: '检测到链上大额转账', threshold: '>$500K', active: true, icon: <Waves className="w-3.5 h-3.5" />, color: '#f59e0b' },
    { id: 'volume', type: 'volume', title: '交易量异动', description: '24小时交易量异常飙升', threshold: '>300%', active: true, icon: <AlertTriangle className="w-3.5 h-3.5" />, color: '#6366f1' },
    { id: 'reserve', type: 'reserve', title: '储备金下降', description: '抵押率出现下降', threshold: '<100%', active: false, icon: <ShieldAlert className="w-3.5 h-3.5" />, color: '#ef4444' },
    { id: 'sentiment', type: 'sentiment', title: '舆情突变', description: '社交舆情出现快速变化', threshold: 'Δ>0.3', active: false, icon: <MessageSquareWarning className="w-3.5 h-3.5" />, color: '#fd4b96' },
  ])

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))
  }

  const activeCount = alerts.filter(a => a.active).length

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors"
      >
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-red-400" />
          预警中心
          {activeCount > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono font-bold">{activeCount} 已启用</span>
          )}
        </h2>
        {expanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
      </button>

      {expanded && (
        <div className="p-4">
          <div className="space-y-2 mb-4">
            {alerts.map(a => (
              <div
                key={a.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                  a.active ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-transparent border-white/[0.04] opacity-50'
                }`}
                onClick={() => toggleAlert(a.id)}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}15`, color: a.color }}>
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/90">{a.title}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded font-mono font-bold" style={{ color: a.color, background: `${a.color}12` }}>
                      {a.threshold}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/40">{a.description}</span>
                </div>
                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${a.active ? 'bg-emerald-500' : 'bg-white/10'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${a.active ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            ))}
          </div>

          {/* 通知渠道 */}
          <div className="border-t border-white/[0.06] pt-3">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">通知方式</span>
            <div className="flex gap-2 mt-2">
              {[
                { label: 'Telegram', icon: <Send className="w-3 h-3" />, color: '#0088cc' },
                { label: 'Discord', icon: <MessageSquareWarning className="w-3 h-3" />, color: '#5865f2' },
                { label: 'Webhook', icon: <Bell className="w-3 h-3" />, color: '#10b981' },
              ].map(ch => (
                <button
                  key={ch.label}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-[10px] font-medium text-white/60 hover:text-white hover:border-white/[0.15] transition-all"
                >
                  <span style={{ color: ch.color }}>{ch.icon}</span>
                  {ch.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
