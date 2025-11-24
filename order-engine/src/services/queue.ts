import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { MockDexRouter } from './dexRouter';

// Redis Connection
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

export const orderQueue = new Queue('order-queue', { connection });
const dexRouter = new MockDexRouter();

// Function to notify user via WebSocket (will be set from server.ts)
let notifyUser: (orderId: string, status: any) => void;

export const setNotifier = (fn: any) => { notifyUser = fn; };

// Worker implementation
const worker = new Worker('order-queue', async (job) => {
  const { orderId, amount } = job.data;

  // Step 1: Pending
  notifyUser(orderId, { status: 'pending', msg: 'Order queued' });
  
  // Step 2: Routing (Compare Prices)
  notifyUser(orderId, { status: 'routing', msg: 'Checking prices on Raydium vs Meteora...' });
  const raydium = await dexRouter.getRaydiumQuote(amount);
  const meteora = await dexRouter.getMeteoraQuote(amount);
  
  // Select best price
  const bestDex = raydium.price < meteora.price ? raydium : meteora;
  
  // Step 3: Building & Submitting
  notifyUser(orderId, { status: 'building', msg: `Best Price found on ${bestDex.dex} at $${bestDex.price.toFixed(2)}` });
  notifyUser(orderId, { status: 'submitted', msg: 'Transaction sent to Solana network' });

  // Step 4: Settlement (Execute Swap)
  const result = await dexRouter.executeSwap(bestDex.dex, amount);
  
  // Step 5: Confirmed
  notifyUser(orderId, { status: 'confirmed', txHash: result.txHash, finalPrice: bestDex.price });
  
  return result;

}, { connection });