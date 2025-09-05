import Order from '@/lib/models/Order';
import { ReturnRequest } from '@/lib/models/ReturnRequest';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch return requests (for logged-in users)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const requestId = searchParams.get('requestId');
    const orderId = searchParams.get('orderId');
    
    if (requestId) {
      // Track specific request by ID
      const returnRequest = await ReturnRequest.findOne({ requestId })
        .populate('userId', 'name email')
        .lean();
      
      if (!returnRequest) {
        return NextResponse.json(
          { error: 'Return request not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ returnRequest });
    }
    
    if (orderId) {
      // Track by order ID
      const returnRequest = await ReturnRequest.findOne({ orderId })
        .populate('userId', 'name email')
        .lean();
      
      if (!returnRequest) {
        return NextResponse.json(
          { error: 'No return request found for this order' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ returnRequest });
    }
    
    if (userId) {
      // Get all requests for a user
      const returnRequests = await ReturnRequest.find({ userId })
        .sort({ createdAt: -1 })
        .lean();
      
      return NextResponse.json({ returnRequests });
    }
    
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error fetching return requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new return/exchange request
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      orderId,
      customerName,
      email,
      phone,
      type,
      reason,
      details,
      products,
      attachments,
      userId // Optional - for logged-in users
    } = body;
    
    // Validate required fields
    if (!orderId || !customerName || !email || !type || !reason || !products || products.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if order exists (optional validation)
    if (userId) {
      const order = await Order.findOne({ _id: orderId, userId });
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found or does not belong to user' },
          { status: 404 }
        );
      }
    }
    
    // Generate unique request ID
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create return request
    const returnRequest = new ReturnRequest({
      requestId,
      orderId,
      userId: userId || null,
      customerName,
      email,
      phone: phone || '',
      type,
      reason,
      details: details || '',
      products,
      attachments: attachments || [],
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        message: 'Return request submitted',
        timestamp: new Date()
      }]
    });
    
    await returnRequest.save();
    
    // Send confirmation email (implement email service)
    // await sendReturnConfirmationEmail(email, requestId, returnRequest);
    
    return NextResponse.json({
      success: true,
      requestId,
      message: 'Return request submitted successfully',
      returnRequest: {
        requestId,
        status: returnRequest.status,
        createdAt: returnRequest.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error creating return request:', error);
    return NextResponse.json(
      { error: 'Failed to submit return request' },
      { status: 500 }
    );
  }
}

// PUT - Update return request status (admin only)
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { requestId, status, message, adminId } = body;
    
    if (!requestId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const returnRequest = await ReturnRequest.findOne({ requestId });
    if (!returnRequest) {
      return NextResponse.json(
        { error: 'Return request not found' },
        { status: 404 }
      );
    }
    
    // Update status
    returnRequest.status = status;
    returnRequest.statusHistory.push({
      status,
      message: message || `Status updated to ${status}`,
      timestamp: new Date(),
      updatedBy: adminId || 'system'
    });
    
    await returnRequest.save();
    
    return NextResponse.json({
      success: true,
      message: 'Return request status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating return request:', error);
    return NextResponse.json(
      { error: 'Failed to update return request' },
      { status: 500 }
    );
  }
}