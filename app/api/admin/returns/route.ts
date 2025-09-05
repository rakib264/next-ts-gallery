import { auth } from '@/lib/auth';
import { ReturnRequest } from '@/lib/models/ReturnRequest';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all return requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Build query
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { requestId: { $regex: search, $options: 'i' } },
        { orderId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [returnRequests, total] = await Promise.all([
      ReturnRequest.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReturnRequest.countDocuments(query)
    ]);
    
    return NextResponse.json({
      returnRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching return requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update return request status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const body = await request.json();
    const { 
      requestId, 
      status, 
      message, 
      adminNotes, 
      refundAmount, 
      refundMethod,
      trackingNumber,
      courierName
    } = body;
    
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
    
    // Update fields
    returnRequest.status = status;
    if (adminNotes) returnRequest.adminNotes = adminNotes;
    if (refundAmount) returnRequest.refundAmount = refundAmount;
    if (refundMethod) returnRequest.refundMethod = refundMethod;
    if (trackingNumber) returnRequest.trackingNumber = trackingNumber;
    if (courierName) returnRequest.courierName = courierName;
    
    // Add status history entry
    returnRequest.statusHistory.push({
      status,
      message: message || `Status updated to ${status}`,
      timestamp: new Date(),
      updatedBy: session.user.id
    });
    
    await returnRequest.save();
    
    // Send notification email to customer (implement email service)
    // await sendStatusUpdateEmail(returnRequest.email, returnRequest.requestId, status, message);
    
    return NextResponse.json({
      success: true,
      message: 'Return request updated successfully',
      returnRequest: {
        requestId: returnRequest.requestId,
        status: returnRequest.status,
        updatedAt: returnRequest.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Error updating return request:', error);
    return NextResponse.json(
      { error: 'Failed to update return request' },
      { status: 500 }
    );
  }
}

// DELETE - Delete return request (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    
    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }
    
    const returnRequest = await ReturnRequest.findOneAndDelete({ requestId });
    if (!returnRequest) {
      return NextResponse.json(
        { error: 'Return request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Return request deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting return request:', error);
    return NextResponse.json(
      { error: 'Failed to delete return request' },
      { status: 500 }
    );
  }
}