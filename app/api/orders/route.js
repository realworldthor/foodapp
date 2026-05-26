import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';

async function sendTelegramNotification(order) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const itemsList = order.items
      .map(item => `• ${item.quantity}x ${item.name} — ₹${item.price * item.quantity}`)
      .join('\n');

    const address = typeof order.address === 'object'
      ? `${order.address.street}, ${order.address.city} - ${order.address.pincode}`
      : order.address;

    const message = `
🔔 *New Order Received!*

📦 *Order ID:* #${order._id.toString().slice(-6).toUpperCase()}
💰 *Total:* ₹${order.total}
💳 *Payment:* ${order.paymentMethod.toUpperCase()}

🛒 *Items:*
${itemsList}

📍 *Address:* ${address}
    `.trim();

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
  } catch (err) {
    console.error('Telegram notification failed:', err);
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession();

    const { items, total, address, paymentMethod } = await req.json();

    if (!items || !total || !address) {
      return NextResponse.json(
        { error: 'Items, total and address are required' },
        { status: 400 }
      );
    }

    const order = await Order.create({
      customer: session?.user?.id || null,
      items,
      total,
      address,
      paymentMethod: paymentMethod || 'cod',
      status: 'pending',
    });

    await sendTelegramNotification(order);

    return NextResponse.json(
      { message: 'Order placed successfully', orderId: order._id },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}