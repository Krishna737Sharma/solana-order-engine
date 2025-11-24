import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import { orderQueue, setNotifier } from './services/queue';
import { randomUUID } from 'crypto';

const fastify = Fastify({ logger: true });

fastify.register(cors);
fastify.register(websocket);

// Store active websocket connections: Map<OrderId, Socket>
const connections = new Map<string, any>();

// Configure the Queue Notifier to send updates to WebSocket
setNotifier((orderId: string, data: any) => {
  const socket = connections.get(orderId);
  if (socket) {
    socket.send(JSON.stringify(data));
  }
});

// POST Endpoint to create order
fastify.post('/api/orders/execute', async (request, reply) => {
  const orderId = randomUUID();
  const { type, amount, token } = request.body as any;

  // Add to Queue
  await orderQueue.add('trade', { orderId, type, amount, token });

  // Return Order ID immediately
  return { orderId, message: "Order received. Connect to WebSocket for updates." };
});

// WebSocket Endpoint for updates
fastify.register(async function (fastify) {
  fastify.get('/ws/orders/:orderId', { websocket: true }, (connection, req: any) => {
    const { orderId } = req.params;
    fastify.log.info(`Client connected for order: ${orderId}`);
    
    connections.set(orderId, connection.socket);

    connection.socket.on('close', () => {
      connections.delete(orderId);
    });
  });
});

const start = async () => {
  try {
    // Listen on 0.0.0.0 to work with Docker/Railway
    await fastify.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' });
    console.log('Server running on port 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();