import type { Holding } from '../types/models';

export const MOCK_HOLDINGS: Holding[] = [
  {
    id: 'holding-1',
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    quantity: 50,
    averageCost: 165.40,
    addedAt: Date.now() - 180 * 24 * 60 * 60_000,
    notes: '',
  },
  {
    id: 'holding-2',
    symbol: 'NVDA',
    companyName: 'NVIDIA Corporation',
    quantity: 10,
    averageCost: 620.00,
    addedAt: Date.now() - 90 * 24 * 60 * 60_000,
    notes: 'Long-term AI play',
  },
  {
    id: 'holding-3',
    symbol: 'SPY',
    companyName: 'SPDR S&P 500 ETF',
    quantity: 25,
    averageCost: 480.00,
    addedAt: Date.now() - 365 * 24 * 60 * 60_000,
    notes: 'Core index position',
  },
  {
    id: 'holding-4',
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    quantity: 20,
    averageCost: 380.00,
    addedAt: Date.now() - 120 * 24 * 60 * 60_000,
    notes: '',
  },
];
