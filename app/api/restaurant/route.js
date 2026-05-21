import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Restaurant from '@/models/Restaurant';

export async function GET() {
  try {
    await connectDB();
    const restaurant = await Restaurant.findOne();
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(restaurant);
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const restaurant = await Restaurant.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true }
    );
    return NextResponse.json(restaurant);
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}