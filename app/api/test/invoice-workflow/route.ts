import { auth } from '@/lib/auth';
import emailService from '@/lib/email';
import { EventHandlers } from '@/lib/eventHandlers';
import invoiceService, { InvoiceData } from '@/lib/invoice';
import Order from '@/lib/models/Order';
import connectDB from '@/lib/mongodb';
import rabbitMQService, { EventType } from '@/lib/rabbitmq';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'manager'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, testType = 'full' } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findById(orderId)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name thumbnailImage');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const results: any = {
      orderId,
      orderNumber: order.orderNumber,
      testType,
      timestamp: new Date().toISOString()
    };

    if (testType === 'invoice-only' || testType === 'full') {
      // Test invoice generation
      try {
        const customerName = order.customer 
          ? `${order.customer.firstName} ${order.customer.lastName}`
          : order.shippingAddress.name;

        const invoiceData: InvoiceData = {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          customerName,
          customerEmail: order.customer?.email || order.shippingAddress.email,
          customerPhone: order.customer?.phone || order.shippingAddress.phone,
          shippingAddress: {
            street: order.shippingAddress.street,
            city: order.shippingAddress.city,
            district: order.shippingAddress.district,
            division: order.shippingAddress.division,
            postalCode: order.shippingAddress.postalCode
          },
          items: order.items.map((item: any) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            variant: item.variant,
            image: item.image
          })),
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          tax: order.tax || 0,
          discountAmount: order.discountAmount || 0,
          total: order.total,
          paymentMethod: order.paymentMethod,
          deliveryType: order.deliveryType,
          orderDate: order.createdAt,
          expectedDelivery: order.expectedDelivery,
          notes: order.notes
        };

        const invoicePath = await invoiceService.generateInvoice(invoiceData);
        
        results.invoiceGeneration = {
          success: true,
          invoicePath,
          message: 'Invoice generated successfully'
        };

        // Update order with invoice URL
        await Order.findByIdAndUpdate(order._id, { invoiceUrl: invoicePath });

      } catch (error) {
        results.invoiceGeneration = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Invoice generation failed'
        };
      }
    }

    if (testType === 'email-only' || testType === 'full') {
      // Test email sending
      const customerEmail = order.customer?.email || order.shippingAddress.email;
      const customerName = order.customer 
        ? `${order.customer.firstName} ${order.customer.lastName}`
        : order.shippingAddress.name;

      if (customerEmail) {
        try {
          const invoicePath = results.invoiceGeneration?.invoicePath || order.invoiceUrl;
          
          if (invoicePath) {
            const emailSent = await emailService.sendInvoiceEmail(
              customerEmail,
              customerName,
              {
                orderNumber: order.orderNumber,
                orderDate: new Date(order.createdAt).toLocaleDateString(),
                total: `৳${order.total}`,
                paymentMethod: order.paymentMethod,
                deliveryType: order.deliveryType
              },
              invoicePath
            );

            results.emailSending = {
              success: emailSent,
              customerEmail,
              message: emailSent ? 'Email sent successfully' : 'Failed to send email'
            };
          } else {
            results.emailSending = {
              success: false,
              error: 'No invoice available to send',
              message: 'Email sending skipped - no invoice found'
            };
          }
        } catch (error) {
          results.emailSending = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Email sending failed'
          };
        }
      } else {
        results.emailSending = {
          success: false,
          error: 'No customer email found',
          message: 'Email sending skipped - no customer email'
        };
      }
    }

    if (testType === 'rabbitmq-only' || testType === 'full') {
      // Test RabbitMQ event publishing
      try {
        const eventPublished = await rabbitMQService.publishEvent({
          type: EventType.INVOICE_GENERATION,
          id: `test-invoice-${order._id}-${Date.now()}`,
          timestamp: new Date(),
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          customerEmail: order.customer?.email || order.shippingAddress.email,
          customerId: order.customer?._id?.toString(),
          orderData: order.toObject()
        });

        results.rabbitMQEvent = {
          success: eventPublished,
          message: eventPublished ? 'Event published successfully' : 'Failed to publish event'
        };
      } catch (error) {
        results.rabbitMQEvent = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'RabbitMQ event publishing failed'
        };
      }
    }

    if (testType === 'event-handler' || testType === 'full') {
      // Test event handler directly
      try {
        await EventHandlers.handleInvoiceGeneration({
          type: EventType.INVOICE_GENERATION,
          id: `test-handler-${order._id}-${Date.now()}`,
          timestamp: new Date(),
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          customerEmail: order.customer?.email || order.shippingAddress.email,
          customerId: order.customer?._id?.toString(),
          orderData: order.toObject()
        } as any);

        results.eventHandler = {
          success: true,
          message: 'Event handler executed successfully'
        };
      } catch (error) {
        results.eventHandler = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Event handler execution failed'
        };
      }
    }

    return NextResponse.json({
      message: 'Invoice workflow test completed',
      results
    });

  } catch (error) {
    console.error('Invoice workflow test error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
