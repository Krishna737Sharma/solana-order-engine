// Mock Implementation with artificial delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockDexRouter {
  // Mock logic to get quote from Raydium
  async getRaydiumQuote(amount: number) {
    await sleep(500); // Simulate network delay
    const basePrice = 100; // Assume base price is $100
    // Add variance: price * (0.98 + random)
    return { price: basePrice * (0.98 + Math.random() * 0.04), dex: 'Raydium' };
  }

  // Mock logic to get quote from Meteora
  async getMeteoraQuote(amount: number) {
    await sleep(500);
    const basePrice = 100;
    return { price: basePrice * (0.97 + Math.random() * 0.05), dex: 'Meteora' };
  }

  // Execute the swap (Mock transaction)
  async executeSwap(dex: string, amount: number) {
    // Simulate 2-3 second execution time
    await sleep(2000); 
    return { 
      txHash: 'KoX' + Math.random().toString(36).substring(7) + 'sol', 
      status: 'confirmed' 
    };
  }
}