import { auth } from '@/lib/auth';
import emailService from '@/lib/email';
import Order from '@/lib/models/Order';
import connectDB from '@/lib/mongodb';
import rabbitMQService, { EventType } from '@/lib/rabbitmq';
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

    // Try direct email sending first (for immediate feedback)
    try {
      // console.log('Attempting to send invoice email directly to:', customerEmail);
      
      const emailResult = await emailService.sendInvoiceEmail(
        customerEmail,
        order.customer?.firstName ? `${order.customer.firstName} ${order.customer.lastName}` : order.shippingAddress?.name || 'Customer',
        {
          orderNumber: order.orderNumber,
          orderDate: new Date(order.createdAt).toLocaleDateString(),
          total: new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0
          }).format(order.total),
          paymentMethod: order.paymentMethod,
          deliveryType: order.deliveryType
        },
        '' // invoicePath - empty for now since we're not generating PDF
      );

      // console.log('Direct email result:', emailResult);

      if (emailResult) {
        return NextResponse.json({ 
          message: 'Invoice sent successfully (direct)',
          email: customerEmail,
          method: 'direct'
        });
      }
    } catch (directEmailError) {
      console.error('Direct email sending failed:', directEmailError);
    }

    // Fallback to RabbitMQ event
    try {
      // console.log('Falling back to RabbitMQ event publishing');
      
      const eventPublished = await rabbitMQService.publishEvent({
        type: EventType.INVOICE_GENERATION,
        id: `invoice-resend-${order._id}-${Date.now()}`,
        timestamp: new Date(),
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerEmail: customerEmail,
        customerId: order.customer?._id?.toString(),
        orderData: order.toObject()
      });

      // console.log('RabbitMQ event published:', eventPublished);

      return NextResponse.json({ 
        message: eventPublished ? 'Invoice event queued successfully' : 'Invoice queued but may be delayed',
        email: customerEmail,
        method: 'rabbitmq',
        eventPublished
      });
    } catch (rabbitmqError) {
      console.error('RabbitMQ publishing failed:', rabbitmqError);
      
      return NextResponse.json({ 
        error: 'Failed to send invoice - both direct and queue methods failed',
        details: {
          directEmailError: 'Direct email failed',
          rabbitmqError: rabbitmqError instanceof Error ? rabbitmqError.message : 'Queue failed'
        }
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Send invoice error:', error);
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 });
  }
}
