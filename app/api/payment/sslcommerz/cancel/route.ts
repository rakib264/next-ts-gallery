import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const transactionId = formData.get('tran_id') as string;

    if (transactionId) {
      // Update order status
      await Order.findOneAndUpdate(
        { 'paymentDetails.transactionId': transactionId },
        {
          paymentStatus: 'cancelled',
          'paymentDetails.cancelledAt': new Date()
        }
      );
    }

    return NextResponse.redirect(new URL('/checkout?error=payment_cancelled', request.url));
  } catch (error) {
    console.error('SSLCommerz cancel handler error:', error);
    return NextResponse.redirect(new URL('/checkout?error=payment_processing_error', request.url));
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get('tran_id');

  if (transactionId) {
    await connectDB();
    await Order.findOneAndUpdate(
      { 'paymentDetails.transactionId': transactionId },
      {
        paymentStatus: 'cancelled',
        'paymentDetails.cancelledAt': new Date()
      }
    );
  }

  return NextResponse.redirect(new URL('/checkout?error=payment_cancelled', request.url));
}