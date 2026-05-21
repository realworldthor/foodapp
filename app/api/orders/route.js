import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';

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