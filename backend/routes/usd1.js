const { dataApi } = require('@surf-ai/sdk/server')
const { Router } = require('express')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')
const router = Router()

// Aggregated USD1 dashboard data
router.get('/', async (req, res) => {
  try {
    const [price1d, price30d, price90d, ranking, holders, transfers, dexTrades, projectDetail] = await Promise.all([
      dataApi.market.price({ symbol: 'USD1', time_range: '1d' }),
      dataApi.market.price({ symbol: 'USD1', time_range: '30d' }),
      dataApi.market.price({ symbol: 'USD1', time_range: '90d' }),
      dataApi.market.ranking({ sort_by: 'market_cap', category: 'STABLECOIN', limit: 10 }),
      dataApi.token.holders({ address: '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d', chain: 'ethereum', limit: 20 }),
      dataApi.token.transfers({ address: '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d', chain: 'ethereum', limit: 20 }),
      dataApi.token.dex_trades({ address: '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d', chain: 'ethereum', limit: 20 }),
      dataApi.project.detail({ q: 'USD1', fields: 'overview,token_info,contracts,social' }),
    ])
    res.json({
      price1d: price1d.data || [],
      price30d: price30d.data || [],
      price90d: price90d.data || [],
      ranking: ranking.data || [],
      holders: holders.data || [],
      transfers: transfers.data || [],
      dexTrades: dexTrades.data || [],
      projectDetail: projectDetail.data || {},
    })
  } catch (e) {
    console.error('USD1 dashboard error:', e)
    res.status(500).json({ error: e.message })
  }
})

// Comparison stablecoin prices
router.get('/compare', async (req, res) => {
  const { time_range = '30d' } = req.query
  try {
    const [usd1, usdt, usdc, usde] = await Promise.all([
      dataApi.market.price({ symbol: 'USD1', time_range }),
      dataApi.market.price({ symbol: 'USDT', time_range }),
      dataApi.market.price({ symbol: 'USDC', time_range }),
      dataApi.market.price({ symbol: 'USDE', time_range }),
    ])
    res.json({
      usd1: usd1.data || [],
      usdt: usdt.data || [],
      usdc: usdc.data || [],
      usde: usde.data || [],
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// OHLCV candlestick data
router.get('/klines', async (req, res) => {
  const { interval = '1h', limit = '100' } = req.query
  try {
    const data = await dataApi.exchange.klines({ pair: 'USD1/USDT', interval, limit: parseInt(limit) })
    res.json(data.data || [])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Chain-specific holders
router.get('/holders/:chain', async (req, res) => {
  const { chain } = req.params
  const addressMap = {
    ethereum: '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d',
    bsc: '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d',
    solana: 'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB',
  }
  const address = addressMap[chain]
  if (!address) return res.json([])
  try {
    const data = await dataApi.token.holders({ address, chain, limit: 20 })
    res.json(data.data || [])
  } catch (e) {
    res.json([])
  }
})

// Chain-specific transfers
router.get('/transfers/:chain', async (req, res) => {
  const { chain } = req.params
  const addressMap = {
    ethereum: '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d',
    bsc: '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d',
    solana: 'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB',
  }
  const address = addressMap[chain]
  if (!address) return res.json([])
  try {
    const data = await dataApi.token.transfers({ address, chain, limit: 100 })
    res.json(data.data || [])
  } catch (e) {
    res.json([])
  }
})

// Social data
router.get('/social', async (req, res) => {
  try {
    const [detail, mindshare, posts] = await Promise.all([
      dataApi.social.detail({ q: 'USD1', fields: 'sentiment', time_range: '7d' }).catch(() => null),
      dataApi.social.mindshare({ q: 'USD1', interval: '1d' }).catch(() => null),
      dataApi.get('social/user-posts', { handle: 'worldlibertyfi', limit: 10 }).catch(() => null),
    ])
    res.json({
      sentiment: detail?.data?.sentiment || null,
      mindshare: mindshare?.data || [],
      posts: posts?.data || [],
    })
  } catch (e) {
    res.json({ sentiment: null, mindshare: [], posts: [] })
  }
})

// Download source code
router.get('/download-source', (req, res) => {
  try {
    const projectRoot = path.resolve(__dirname, '../../')
    const outFile = path.join(projectRoot, 'usd1-dashboard-source.tar.gz')
    // 每次请求时重新打包，确保最新
    execSync(
      `tar czf "${outFile}" --exclude='node_modules' --exclude='dist' --exclude='.vite' --exclude='usd1-dashboard-source.tar.gz' frontend/ backend/ CLAUDE.md`,
      { cwd: projectRoot }
    )
    res.setHeader('Content-Type', 'application/gzip')
    res.setHeader('Content-Disposition', 'attachment; filename="usd1-dashboard-source.tar.gz"')
    const stream = fs.createReadStream(outFile)
    stream.pipe(res)
    stream.on('end', () => {
      try { fs.unlinkSync(outFile) } catch (_) {}
    })
  } catch (e) {
    console.error('Download error:', e)
    res.status(500).json({ error: 'Failed to package source code' })
  }
})

module.exports = router
