import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      await connectDB();

      // Send initial orders immediately
      const initialOrders = await Order.find({}).sort({ createdAt: -1 });
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(initialOrders)}\n\n`)
      );

      // Check for new orders every 3 seconds
      // Only sends data if something changed — no full reload
      let lastCount = initialOrders.length;
      let lastPendingCount = initialOrders.filter(o => o.status === 'pending').length;

      const interval = setInterval(async () => {
        try {
          const orders = await Order.find({}).sort({ createdAt: -1 });
          const pendingCount = orders.filter(o => o.status === 'pending').length;

          // Only push if something actually changed
          if (orders.length !== lastCount || pendingCount !== lastPendingCount) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(orders)}\n\n`)
            );
            lastCount = orders.length;
            lastPendingCount = pendingCount;
          }
        } catch (err) {
          clearInterval(interval);
          controller.close();
        }
      }, 3000);

      // Clean up when client disconnects
      return () => clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}