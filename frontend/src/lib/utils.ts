import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number | undefined | null, decimals = 2): string {
  if (n == null || isNaN(n)) return '—'
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(decimals)}B`
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(decimals)}M`
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(decimals)}K`
  return n.toFixed(decimals)
}

export function formatCompact(n: number | undefined | null, decimals = 2): string {
  if (n == null || isNaN(n)) return '—'
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(decimals)}B`
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(decimals)}M`
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(decimals)}K`
  return n.toFixed(decimals)
}

export function formatUSD(n: number | undefined | null, decimals = 4): string {
  if (n == null || isNaN(n)) return '—'
  return `$${n.toFixed(decimals)}`
}

export function formatPct(n: number | undefined | null, decimals = 3): string {
  if (n == null || isNaN(n)) return '—'
  return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`
}

export function shortenAddress(addr: string, chars = 6): string {
  if (!addr) return ''
  return `${addr.slice(0, chars)}...${addr.slice(-4)}`
}

export function pegDeviation(price: number): number {
  return Math.abs(price - 1) * 100
}

export function pegColor(deviation: number): string {
  if (deviation < 0.1) return '#10b981'
  if (deviation <= 0.5) return '#f59e0b'
  return '#ef4444'
}

export function timeAgo(ts: number): string {
  const diff = Date.now() / 1000 - ts
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export const CHAINS = [
  { id: 'ethereum', label: 'Ethereum', address: '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d', color: '#627eea' },
  { id: 'bsc', label: 'BNB Chain', address: '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d', color: '#f3ba2f' },
  { id: 'solana', label: 'Solana', address: 'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB', color: '#9945ff' },
] as const

export type ChainId = typeof CHAINS[number]['id']
