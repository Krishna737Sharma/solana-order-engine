import WebSocket from 'ws';

async function testOrder() {
  console.log("1. Placing Order via API...");
  
  // NOTE: Maine http ko https kar diya hai
  const response = await fetch('https://solana-order-engine-production.up.railway.app/api/orders/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'MARKET', amount: 10, token: 'SOL' })
  });

  const data = await response.json() as any;

  // DEBUGGING LINE: Ye bataega ki server ne kya response diya
  if (!data.orderId) {
    console.error("🔴 Server Error Response:", JSON.stringify(data, null, 2));
    console.error("❌ Order Failed. Checking Railway Logs...");
    return;
  }

  console.log("✅ Order Created! ID:", data.orderId);

  // 2. Connect to WebSocket
  console.log("2. Connecting to WebSocket for Updates...");
  const ws = new WebSocket(`wss://solana-order-engine-production.up.railway.app/ws/orders/${data.orderId}`);

  ws.on('open', () => {
    console.log("✅ WebSocket Connected!");
  });

  ws.on('message', (data: any) => {
    const update = JSON.parse(data.toString());
    console.log(`🔄 Update Received: [${update.status}]`, update);

    if (update.status === 'confirmed') {
      console.log("🎉 Trade Complete! Closing connection.");
      ws.close();
      process.exit(0);
    }
  });

  ws.on('error', (err: any) => {
    console.error("❌ WebSocket Error:", err);
  });
}

testOrder();