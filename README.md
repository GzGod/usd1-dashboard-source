# USD1 Dashboard Source

A Surf-powered dashboard for tracking USD1 across market data, reserves, on-chain activity, social sentiment, and competitive stablecoin comparisons.

## Highlights

- Multi-panel USD1 monitoring dashboard built with `@surf-ai/sdk`
- Price and stablecoin comparison views for `USD1`, `USDT`, `USDC`, and `USDE`
- On-chain holder and transfer views across Ethereum, BSC, and Solana
- Reserve, capital flow, peg deviation, and social sentiment panels
- Downloadable source bundle exposed from the backend API

## Stack

- Frontend: React, Vite, TypeScript, Tailwind-style utility classes
- Backend: Express + `@surf-ai/sdk/server`
- Data source: Surf API / Surf SDK

## Project Structure

- `frontend/`: dashboard UI
- `backend/`: API routes and server
- `backend/routes/usd1.js`: aggregated USD1 data endpoints

## Run Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Notes

- Local `.env` files are intentionally excluded from version control.
- The project is based on the Surf SDK dashboard template and adapted for the USD1 use case.
