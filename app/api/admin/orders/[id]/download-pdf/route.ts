import { auth } from '@/lib/auth';
import Order from '@/lib/models/Order';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
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
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name thumbnailImage');
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Generate HTML content for PDF
    const htmlContent = generateInvoiceHTML(order);

    // For now, return HTML content
    // In production, you would use a PDF generation library like puppeteer
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="invoice-${order.orderNumber}.html"`
      }
    });

  } catch (error) {
    console.error('Download PDF error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

function generateInvoiceHTML(order: any): string {
  const customerName = order.customer 
    ? `${order.customer.firstName} ${order.customer.lastName}`
    : order.shippingAddress?.name || 'Guest User';

  const customerEmail = order.customer?.email || order.shippingAddress?.email || '';
  const customerPhone = order.customer?.phone || order.shippingAddress?.phone || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Invoice - ${order.orderNumber}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .invoice-details { margin-bottom: 30px; }
            .customer-details { margin-bottom: 30px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .totals { text-align: right; margin-bottom: 30px; }
            .footer { text-align: center; margin-top: 40px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>INVOICE</h1>
            <h2>Your Company Name</h2>
            <p>Company Address, City, Country</p>
        </div>

        <div class="invoice-details">
            <h3>Invoice Details</h3>
            <p><strong>Invoice Number:</strong> ${order.orderNumber}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.orderStatus}</p>
        </div>

        <div class="customer-details">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Phone:</strong> ${customerPhone}</p>
            <p><strong>Shipping Address:</strong></p>
            <p>${order.shippingAddress.street}<br>
               ${order.shippingAddress.city}, ${order.shippingAddress.district}<br>
               ${order.shippingAddress.division}</p>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map((item: any) => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>৳${item.price.toFixed(2)}</td>
                        <td>৳${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <p><strong>Subtotal:</strong> ৳${order.subtotal.toFixed(2)}</p>
            ${order.discountAmount > 0 ? `<p><strong>Discount:</strong> -৳${order.discountAmount.toFixed(2)}</p>` : ''}
            <p><strong>Shipping:</strong> ৳${order.shippingCost.toFixed(2)}</p>
            <h3><strong>Total: ৳${order.total.toFixed(2)}</strong></h3>
        </div>

        <div class="footer">
            <p>Thank you for your business!</p>
            <p>For any queries, please contact us at support@yourcompany.com</p>
        </div>
    </body>
    </html>
  `;
}
