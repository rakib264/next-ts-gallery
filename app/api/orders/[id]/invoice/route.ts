import invoiceService, { InvoiceData } from '@/lib/invoice';
import Order from '@/lib/models/Order';
import connectDB from '@/lib/mongodb';
import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    
    // Validate if the ID is a valid MongoDB ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const order = await Order.findById(id)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name thumbnailImage');
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Optional: Add access control for guest orders
    // You might want to add a token-based system for guest order access
    
    // Check if invoice already exists
    if (order.invoiceUrl) {
      try {
        const invoiceFilePath = path.join(process.cwd(), 'public', order.invoiceUrl);
        const invoiceExists = await fs.access(invoiceFilePath).then(() => true).catch(() => false);
        
        if (invoiceExists) {
          // Return existing invoice
          const invoiceBuffer = await fs.readFile(invoiceFilePath);
          
          return new NextResponse(invoiceBuffer as any, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="invoice-${order.orderNumber}.pdf"`
            }
          });
        }
      } catch (error) {
        console.error('Existing invoice not found, generating new one');
      }
    }

    // Generate new invoice
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

    // Generate invoice
    const invoicePath = await invoiceService.generateInvoice(invoiceData);
    
    // Update order with invoice URL
    await Order.findByIdAndUpdate(order._id, { invoiceUrl: invoicePath });
    
    // Read and return the generated PDF
    const invoiceFilePath = path.join(process.cwd(), 'public', invoicePath);
    const invoiceBuffer = await fs.readFile(invoiceFilePath);
    
    return new NextResponse(invoiceBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderNumber}.pdf"`
      }
    });

  } catch (error) {
    console.error('Generate invoice error:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}