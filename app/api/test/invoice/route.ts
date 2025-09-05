import rabbitMQService, { EventType } from '@/lib/rabbitmq';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Test invoice generation event
    const success = await rabbitMQService.publishEvent({
      type: EventType.INVOICE_GENERATION,
      id: `test-invoice-${Date.now()}`,
      timestamp: new Date(),
      orderId: data.orderId || 'test-order-id',
      orderNumber: data.orderNumber || 'TEST-12345678',
      customerEmail: data.customerEmail || 'test@example.com',
      customerId: data.customerId || 'test-customer-id',
      orderData: data.orderData || {
        _id: 'test-order-id',
        orderNumber: 'TEST-12345678',
        shippingAddress: {
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '+880 1234-567890',
          street: '123 Test Street',
          city: 'Dhaka',
          district: 'Dhaka',
          division: 'Dhaka',
          postalCode: '1200'
        },
        items: [
          {
            name: 'Test Product',
            price: 1000,
            quantity: 2,
            variant: 'Test Variant',
            image: 'https://via.placeholder.com/150'
          }
        ],
        subtotal: 2000,
        shippingCost: 60,
        tax: 100,
        discountAmount: 0,
        total: 2160,
        paymentMethod: 'cod',
        deliveryType: 'regular',
        createdAt: new Date().toISOString(),
        notes: 'Test order for invoice generation'
      }
    });

    if (success) {
      return NextResponse.json({ 
        message: 'Test invoice generation event published successfully',
        eventId: `test-invoice-${Date.now()}`
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to publish test event' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test invoice generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to publish test event' 
    }, { status: 500 });
  }
}
