import { auth } from '@/lib/auth';
import Coupon from '@/lib/models/Coupon';
import Order from '@/lib/models/Order';
import PaymentSettings from '@/lib/models/PaymentSettings';
import Product from '@/lib/models/Product';
import connectDB from '@/lib/mongodb';
import rabbitMQService, { EventType } from '@/lib/rabbitmq';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const data = await request.json();
    const session = await auth();
    
    // Generate order number
    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
    
    // Get payment settings
    const paymentSettings = await PaymentSettings.findOne();
    
    // Validate items and calculate totals
    let calculatedSubtotal = 0;
    const validatedItems = [];
    
    for (const item of data.items) {
      // console.log('Processing item:', { productId: item.product, type: typeof item.product });
      
      // Validate product ID format
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        console.error('Invalid product ID:', item.product);
        return NextResponse.json({ 
          error: `Invalid product ID format: ${item.product}` 
        }, { status: 400 });
      }
      
      const product = await Product.findById(item.product);
      if (!product) {
        console.error('Product not found:', item.product);
        return NextResponse.json({ 
          error: `Product not found with ID: ${item.product}` 
        }, { status: 400 });
      }
      
      if (product.trackQuantity && product.quantity < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.quantity}` 
        }, { status: 400 });
      }
      
      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        variant: item.variant,
        image: item.image || product.thumbnailImage
      });
      
      calculatedSubtotal += product.price * item.quantity;
    }
    
    // Calculate tax (5%)
    const calculatedTax = Math.round(calculatedSubtotal * 0.05);

    // If client passed couponCode and discount, re-validate discount server-side for integrity
    let validatedDiscount = 0;
    let appliedCouponCode: string | undefined = undefined;
    if (data.couponCode) {
      const coupon = await Coupon.findOne({ 
        code: data.couponCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        expiryDate: { $gte: new Date() }
      });
      if (coupon) {
        // Check usage and min spend
        if ((!coupon.usageLimit || coupon.currentUsage < coupon.usageLimit) && (!coupon.minSpend || calculatedSubtotal >= coupon.minSpend)) {
          if (coupon.type === 'percentage') {
            validatedDiscount = Math.round((calculatedSubtotal * coupon.value) / 100);
            if (coupon.maxDiscount && validatedDiscount > coupon.maxDiscount) {
              validatedDiscount = coupon.maxDiscount;
            }
          } else {
            validatedDiscount = coupon.value;
          }
          appliedCouponCode = coupon.code;
          // Optionally increment usage later after successful payment; for COD we'll increment now
          coupon.currentUsage = (coupon.currentUsage || 0) + 1;
          await coupon.save();
        }
      }
    }
    
    // Create order data - make customer optional for guest users
    const orderData: any = {
      orderNumber,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      taxRate: 5,
      shippingCost: data.shippingCost || 60,
      discountAmount: validatedDiscount,
      couponCode: appliedCouponCode,
      total: calculatedSubtotal + (data.shippingCost || 60) + calculatedTax - validatedDiscount,
      paymentMethod: data.paymentMethod || 'cod',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      deliveryType: data.deliveryType || 'regular',
      notes: data.notes,
      paymentDetails: {
        transactionId: null,
        gatewayData: null,
        validationId: null,
        cardType: null,
        paidAmount: null,
        paidAt: null,
        failureReason: null,
        ipnReceived: false
      }
    };

    // Only add customer field if user is logged in
    if (session?.user?.id) {
      orderData.customer = session.user.id;
    }
    
    const order = await Order.create(orderData);
    
    // Update product quantities
    for (const item of validatedItems) {
      const product = await Product.findById(item.product);
      if (product && product.trackQuantity) {
        product.quantity -= item.quantity;
        product.totalSales += item.quantity;
        await product.save();
      }
    }
    
    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name thumbnailImage');
    
    // Get customer email from session or shipping address
    const customerEmail = session?.user?.email || data.shippingAddress?.email;
    
    // Publish events asynchronously (don't block order creation)
    try {
      // Publish new order creation event
      await rabbitMQService.publishEvent({
        type: EventType.NEW_ORDER_CREATION,
        id: `order-${order._id}-${Date.now()}`,
        timestamp: new Date(),
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerEmail: customerEmail,
        customerId: session?.user?.id,
        total: order.total
      });

      // Publish invoice generation event
      await rabbitMQService.publishEvent({
        type: EventType.INVOICE_GENERATION,
        id: `invoice-${order._id}-${Date.now()}`,
        timestamp: new Date(),
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerEmail: customerEmail,
        customerId: session?.user?.id,
        orderData: populatedOrder.toObject()
      });

      // console.log('Events published successfully for order:', order.orderNumber);
    } catch (error) {
      console.error('Failed to publish events for order:', order.orderNumber, error);
      // Don't fail the order creation if event publishing fails
    }
    
    const response = NextResponse.json({ 
      message: 'Order placed successfully',
      order: populatedOrder 
    }, { status: 201 });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  } catch (error) {
    console.error('Create order error:', error);
    const response = NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
    
    // Add CORS headers to error response
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const orders = await Order.find({ customer: session.user.id })
      .populate('items.product', 'name thumbnailImage')
      .sort({ createdAt: -1 });
    
    const response = NextResponse.json({ orders });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  } catch (error) {
    console.error('Get orders error:', error);
    const response = NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    
    // Add CORS headers to error response
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}