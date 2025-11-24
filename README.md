# 🚀 Solana Order Execution Engine

A high-performance backend system that simulates a **DEX Aggregator** on Solana. It automatically routes orders to the best liquidity pool (**Raydium vs Meteora**) and provides real-time status updates via WebSockets.

## 🔗 Live Demo
**Base URL:** `https://solana-order-engine-production.up.railway.app`
<img width="1907" height="916" alt="Image" src="https://github.com/user-attachments/assets/5cabc733-39a6-4898-967b-0e1c4bb069f2" />
---

## 🌟 Key Features

* **⚡ Smart DEX Routing:** Queries simulated quotes from Raydium and Meteora to find the best price execution.
* **🔄 Real-time Updates:** Uses **WebSockets** to stream order status (`pending` → `routing` → `confirmed`) instantly to the client.
* **🛡️ Concurrency & Queuing:** Implemented using **BullMQ** and **Redis** to handle multiple simultaneous orders without server crashes.
* **🧪 Mock Simulation:** Simulates network latency (2-3s) and price variance to mimic real-world blockchain conditions.
* **✅ Robust Testing:** Includes comprehensive Unit Tests using **Jest** to verify routing logic.

---

## 🏗️ Architecture

The system follows an asynchronous, event-driven architecture:

1. **API Layer:** Fastify server accepts HTTP POST requests.
2. **Queue Layer:** Orders are pushed to a Redis-backed queue (BullMQ).
3. **Worker Layer:** A background worker processes the job:
   * Fetches quotes from Mock DEXs.
   * Selects the best price.
   * Simulates the swap transaction.
4. **Notification Layer:** The worker pushes updates back to the client via a persistent WebSocket connection.

### 📸 Execution Proofs

**1. Order Execution Logs (Terminal)**
> Shows the journey from Pending to Confirmed.

<img width="992" height="290" alt="Image" src="https://github.com/user-attachments/assets/026443cd-60b4-48bf-aff2-1e82e98d84b7" />

**2. Unit Tests Passing**
> Verification of routing logic and queue behavior (10/10 Tests Passed).

<img width="796" height="460" alt="Image" src="https://github.com/user-attachments/assets/1a9ba3b8-95cc-412f-bf48-f3fb3c4120d1" />

---

## 🛠️ Tech Stack

* **Runtime:** Node.js & TypeScript
* **Server Framework:** Fastify (Chosen for low overhead and native WebSocket support)
* **Queue Management:** BullMQ & Redis
* **Testing:** Jest
* **Deployment:** Railway (Dockerized)

---

## 🚀 Getting Started Locally

Follow these steps to run the engine on your machine.

### Prerequisites
* Node.js (v18+)
* Docker (for Redis)

### 1. Clone the Repository
```bash
git clone https://github.com/Krishna737Sharma/solana-order-engine.git
cd solana-order-engine/order-engine
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Redis
You can run Redis easily using Docker:

```bash
docker run -d -p 6379:6379 redis
```

### 4. Run the Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`.

---

## 🧪 How to Test

### Option A: Using the Test Client Script
I have included a script that simulates a client creating an order and listening for updates.

```bash
npx ts-node src/test-client.ts
```

### Option B: Running Unit Tests
To verify the routing logic and data integrity:

```bash
npx jest
```

---

## 📡 API Documentation

### 1. Execute Order
**Endpoint:** `POST /api/orders/execute`

**Body:**
```json
{
  "type": "MARKET",
  "amount": 10,
  "token": "SOL"
}
```

**Response:**
```json
{
  "orderId": "abc-123-uuid",
  "message": "Order received..."
}
```

### 2. WebSocket Stream
**Endpoint:** `wss://solana-order-engine-production.up.railway.app/ws/orders/:orderId`

**Events:**
* `pending`: Order received.
* `routing`: Comparing DEX prices.
* `building`: Transaction being built.
* `submitted`: Sent to blockchain.
* `confirmed`: Success (includes txHash).

---

## 🧠 Design Decisions

### Why Market Orders?
Chosen for simplicity to focus on the core architectural challenge of routing and queuing. Limit orders would require an internal order book which adds complexity not required for this specific task.

### Why BullMQ?
Solana is high-speed. If 1000 orders come in at once, a direct processing approach would crash the server. A queue allows us to buffer requests and process them reliably.

### Why Fastify over Express?
Fastify has significantly better performance benchmarks and a cleaner, more modern approach to async/await and WebSocket integration.

---

## 👤 Author
**Krishna Sharma**

GitHub: [@Krishna737Sharma](https://github.com/Krishna737Sharma)
