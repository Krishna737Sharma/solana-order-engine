import WebSocket from 'ws';

async function testOrder() {
  console.log("1. Placing Order via API...");
  
  // 1. Create Order (POST Request)
  const response = await fetch('http://localhost:3000/api/orders/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'MARKET', amount: 10, token: 'SOL' })
  });

  const data = await response.json() as any;
  console.log("✅ Order Created! ID:", data.orderId);

  // 2. Connect to WebSocket
  console.log("2. Connecting to WebSocket for Updates...");
  const ws = new WebSocket(`ws://localhost:3000/ws/orders/${data.orderId}`);

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