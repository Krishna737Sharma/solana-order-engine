import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { MockDexRouter } from './dexRouter';

// Redis Connection Setup with IPv4 Fix
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  family: 4 // <--- YE LINE SABSE ZAROORI HAI (TIMEOUT ROKNE KE LIYE)
});

export const orderQueue = new Queue('order-queue', { connection });
const dexRouter = new MockDexRouter();

// Function to notify user via WebSocket
let notifyUser: (orderId: string, status: any) => void;
export const setNotifier = (fn: any) => { notifyUser = fn; };

// Worker implementation
const worker = new Worker('order-queue', async (job) => {
  const { orderId, amount } = job.data;

  notifyUser(orderId, { status: 'pending', msg: 'Order queued' });
  
  notifyUser(orderId, { status: 'routing', msg: 'Checking prices on Raydium vs Meteora...' });
  const raydium = await dexRouter.getRaydiumQuote(amount);
  const meteora = await dexRouter.getMeteoraQuote(amount);
  
  const bestDex = raydium.price < meteora.price ? raydium : meteora;
  
  notifyUser(orderId, { status: 'building', msg: `Best Price on ${bestDex.dex} at $${bestDex.price.toFixed(2)}` });
  notifyUser(orderId, { status: 'submitted', msg: 'Transaction sent to Solana' });

  const result = await dexRouter.executeSwap(bestDex.dex, amount);
  
  notifyUser(orderId, { status: 'confirmed', txHash: result.txHash, finalPrice: bestDex.price });
  
  return result;
}, { connection });