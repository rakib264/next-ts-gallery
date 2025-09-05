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

    // Try direct email sending first
    try {
      
      const emailResult = await emailService.sendOrderConfirmation(
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
          deliveryType: order.deliveryType,
          items: order.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        }
      );

      if (emailResult) {
        return NextResponse.json({ 
          message: 'Confirmation email sent successfully (direct)',
          email: customerEmail,
          method: 'direct'
        });
      }
    } catch (directEmailError) {
      console.error('Direct confirmation email failed:', directEmailError);
    }

    // Fallback to RabbitMQ event
    try {
      // console.log('Falling back to RabbitMQ event for confirmation');
      
      const eventPublished = await rabbitMQService.publishEvent({
        type: EventType.NEW_ORDER_CREATION,
        id: `confirmation-resend-${order._id}-${Date.now()}`,
        timestamp: new Date(),
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerEmail: customerEmail,
        customerId: order.customer?._id?.toString(),
        total: order.total
      });

      // console.log('Confirmation RabbitMQ event published:', eventPublished);

      return NextResponse.json({ 
        message: eventPublished ? 'Confirmation event queued successfully' : 'Confirmation queued but may be delayed',
        email: customerEmail,
        method: 'rabbitmq',
        eventPublished
      });
    } catch (rabbitmqError) {
      console.error('RabbitMQ confirmation publishing failed:', rabbitmqError);
      
      return NextResponse.json({ 
        error: 'Failed to send confirmation - both direct and queue methods failed',
        details: {
          directEmailError: 'Direct email failed',
          rabbitmqError: rabbitmqError instanceof Error ? rabbitmqError.message : 'Queue failed'
        }
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Resend confirmation error:', error);
    return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 });
  }
}
