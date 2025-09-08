import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info.tsrgallery@gmail.com';
    const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@tsrgallery.com';
    const FROM_NAME = process.env.FROM_NAME || 'TSR Gallery';

    if (!RESEND_API_KEY) {
      return NextResponse.json({ success: false, error: 'RESEND_API_KEY not set' }, { status: 500 });
    }

    const resend = new Resend(RESEND_API_KEY);

    // Test 1: Customer Order Confirmation Email
    console.log('📧 Testing customer order confirmation email...');
    const customerEmailResult = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: ['test@customer.com'],
      subject: 'Order Confirmation - ORD-12345678',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #3949AB;">✅ Order Confirmation</h2>
          <p>Dear Test Customer,</p>
          <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> ORD-12345678</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ৳500</p>
            <p><strong>Payment Method:</strong> Cash on Delivery</p>
            <p><strong>Delivery Type:</strong> Standard</p>
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; border-left: 4px solid #4caf50;">
            <h4>Items Ordered:</h4>
            <p>• Casual Sneakers Lace-up Juta For Men - Qty: 1 - ৳500</p>
          </div>
          
          <p>We will send you another email when your order ships.</p>
          <p>Thank you for shopping with TSR Gallery!</p>
        </div>
      `,
    });

    console.log('📧 Customer email result:', {
      success: !!customerEmailResult.data?.id,
      emailId: customerEmailResult.data?.id,
      error: customerEmailResult.error
    });

    // Test 2: Admin Order Notification Email
    console.log('📧 Testing admin order notification email...');
    const adminEmailResult = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      subject: 'New Order Received - ORD-12345678',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #8b5cf6;">🛒 New Order Received</h2>
          <p>A new order has been placed and requires processing.</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; border-left: 4px solid #8b5cf6;">
            <h4>Order Details:</h4>
            <p><strong>Order Number:</strong> ORD-12345678</p>
            <p><strong>Order ID:</strong> 68b1b254b9f1bfbdb2e0ca21</p>
            <p><strong>Customer:</strong> Test Customer</p>
            <p><strong>Email:</strong> test@customer.com</p>
            <p><strong>Total Amount:</strong> ৳500</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>Please process this order in your admin panel.</p>
        </div>
      `,
    });

    console.log('📧 Admin email result:', {
      success: !!adminEmailResult.data?.id,
      emailId: adminEmailResult.data?.id,
      error: adminEmailResult.error
    });

    return NextResponse.json({
      success: true,
      message: 'Order email tests completed',
      results: {
        customerEmail: {
          success: !!customerEmailResult.data?.id,
          emailId: customerEmailResult.data?.id,
          error: customerEmailResult.error
        },
        adminEmail: {
          success: !!adminEmailResult.data?.id,
          emailId: adminEmailResult.data?.id,
          error: adminEmailResult.error
        }
      },
      envCheck: {
        RESEND_API_KEY: 'Set',
        ADMIN_EMAIL,
        FROM_EMAIL,
        FROM_NAME
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Order email test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Order email test failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}
