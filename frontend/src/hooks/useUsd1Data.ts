import { useQuery } from '@tanstack/react-query'

// Use Vite's BASE_URL so fetch requests work behind the preview proxy path prefix.
// In dev: BASE_URL = './' or '/preview/.../', in prod: same.
// We need an absolute path for fetch, so strip trailing slash and ensure it ends clean.
const rawBase = import.meta.env.BASE_URL || '/'
const BASE = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return res.json()
}

export interface PricePoint {
  metric: string
  symbol: string
  timestamp: number
  value: number
}

export interface RankingItem {
  symbol: string
  name: string
  image: string
  price_usd: number
  market_cap_usd: number
  volume_24h_usd: number
  change_24h_pct: number
  circulating_supply: number
  total_supply: number
  rank: number
  high_24h: number
  low_24h: number
  fdv: number
}

export interface HolderItem {
  address: string
  balance: string
  percentage: number
  entity_name?: string
  entity_type?: string
}

export interface TransferItem {
  amount: string
  amount_usd: number
  block_number: number
  from_address: string
  to_address: string
  symbol: string
  timestamp: number
  tx_hash: string
}

export interface DexTradeItem {
  amount_usd: number
  block_time: number
  project: string
  taker: string
  token_pair: string
  token_bought_amount: number
  token_bought_symbol: string
  token_sold_amount: number
  token_sold_symbol: string
  tx_hash: string
  version: string
}

export interface DashboardData {
  price1d: PricePoint[]
  price30d: PricePoint[]
  price90d: PricePoint[]
  ranking: RankingItem[]
  holders: HolderItem[]
  transfers: TransferItem[]
  dexTrades: DexTradeItem[]
  projectDetail: {
    overview?: {
      name: string
      description: string
      logo_url: string
      website: string
      x_handle: string
      tags: string[]
    }
  }
}

export interface CompareData {
  usd1: PricePoint[]
  usdt: PricePoint[]
  usdc: PricePoint[]
  usde: PricePoint[]
}

export interface KlineCandle {
  open: number
  high: number
  low: number
  close: number
  volume: number
  timestamp: number
}

export interface SocialData {
  sentiment: { score: number | null; time_range: string } | null
  mindshare: Array<{ timestamp: number; value: number }>
  posts: Array<{ text: string; created_at: string; metrics?: Record<string, number> }>
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['usd1-dashboard'],
    queryFn: () => fetchJSON(`${BASE}/api/usd1`),
    refetchInterval: 30000,
    staleTime: 15000,
  })
}

export function useCompare(timeRange: string) {
  return useQuery<CompareData>({
    queryKey: ['usd1-compare', timeRange],
    queryFn: () => fetchJSON(`${BASE}/api/usd1/compare?time_range=${timeRange}`),
    refetchInterval: 60000,
    staleTime: 30000,
  })
}

export function useKlines(interval: string) {
  return useQuery<Array<{ candles: KlineCandle[]; exchange: string }>>({
    queryKey: ['usd1-klines', interval],
    queryFn: () => fetchJSON(`${BASE}/api/usd1/klines?interval=${interval}&limit=200`),
    refetchInterval: 30000,
  })
}

export function useChainHolders(chain: string) {
  return useQuery<HolderItem[]>({
    queryKey: ['usd1-holders', chain],
    queryFn: () => fetchJSON(`${BASE}/api/usd1/holders/${chain}`),
    refetchInterval: 60000,
  })
}

export function useChainTransfers(chain: string) {
  return useQuery<TransferItem[]>({
    queryKey: ['usd1-transfers', chain],
    queryFn: () => fetchJSON(`${BASE}/api/usd1/transfers/${chain}`),
    refetchInterval: 20000, // 20秒刷新
  })
}

export function useSocial() {
  return useQuery<SocialData>({
    queryKey: ['usd1-social'],
    queryFn: () => fetchJSON(`${BASE}/api/usd1/social`),
    refetchInterval: 60000,
  })
}
