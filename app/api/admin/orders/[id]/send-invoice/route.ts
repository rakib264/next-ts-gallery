import { auth } from '@/lib/auth';
import Order from '@/lib/models/Order';
import connectDB from '@/lib/mongodb';
import queueService, { JobType } from '@/lib/queue';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !['admin', 'manager', 'staff'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { id } = await context.params;
    const order = await Order.findById(id)
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name thumbnailImage');
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get customer email
    const customerEmail = order.customer?.email || order.shippingAddress?.email;
    
    if (!customerEmail) {
      return NextResponse.json({ error: 'No email address found for this order' }, { status: 400 });
    }

    // Queue invoice generation job
    try {
      const jobId = await queueService.enqueue({
        type: JobType.GENERATE_INVOICE,
        orderId: order._id.toString(),
        orderData: order.toObject()
      } as any);

      return NextResponse.json({ 
        message: 'Invoice generation queued successfully',
        email: customerEmail,
        method: 'queue',
        jobId
      });
    } catch (queueError) {
      console.error('Invoice queue failed:', queueError);
      
      return NextResponse.json({ 
        error: 'Failed to queue invoice generation',
        details: {
          queueError: queueError instanceof Error ? queueError.message : 'Queue failed'
        }
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Send invoice error:', error);
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 });
  }
}
