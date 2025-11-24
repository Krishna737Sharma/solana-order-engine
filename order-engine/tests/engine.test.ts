import { MockDexRouter } from '../src/services/dexRouter';

describe('Order Execution Engine Tests', () => {
  const router = new MockDexRouter();

  // Test Group 1: DexRouter Logic
  test('1. Raydium quote should return a number', async () => {
    const quote = await router.getRaydiumQuote(10);
    expect(quote.price).toBeGreaterThan(0);
    expect(quote.dex).toBe('Raydium');
  });

  test('2. Meteora quote should return a number', async () => {
    const quote = await router.getMeteoraQuote(10);
    expect(quote.price).toBeGreaterThan(0);
    expect(quote.dex).toBe('Meteora');
  });

  test('3. Execution should return txHash', async () => {
    const result = await router.executeSwap('Raydium', 10);
    expect(result.status).toBe('confirmed');
    expect(result.txHash).toBeDefined();
  });

  test('4. TxHash should be a string ending in "sol"', async () => {
    const result = await router.executeSwap('Meteora', 5);
    expect(result.txHash).toMatch(/sol$/);
  });

  // Test Group 2: Data Integrity
  test('5. Quote variance should be within expected range (Raydium)', async () => {
    const quote = await router.getRaydiumQuote(100);
    // Base is 100, max variance is small
    expect(quote.price).toBeGreaterThan(90);
    expect(quote.price).toBeLessThan(110);
  });

  test('6. Quote variance should be within expected range (Meteora)', async () => {
    const quote = await router.getMeteoraQuote(100);
    expect(quote.price).toBeGreaterThan(90);
    expect(quote.price).toBeLessThan(110);
  });

  // Test Group 3: System Stability (Mock)
  test('7. Should handle small amounts', async () => {
    const quote = await router.getRaydiumQuote(0.1);
    expect(quote.price).toBeGreaterThan(0);
  });

  test('8. Should handle large amounts', async () => {
    const quote = await router.getRaydiumQuote(1000000);
    expect(quote.price).toBeGreaterThan(0);
  });

  test('9. Execute swap should simulate delay', async () => {
    const start = Date.now();
    await router.executeSwap('Raydium', 1);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(1900); // Verify ~2s delay
  });

  test('10. Router should handle concurrent requests', async () => {
    const p1 = router.getRaydiumQuote(10);
    const p2 = router.getMeteoraQuote(10);
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBeDefined();
    expect(r2).toBeDefined();
  });
});
