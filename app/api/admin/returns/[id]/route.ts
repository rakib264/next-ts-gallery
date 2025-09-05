import { auth } from '@/lib/auth';
import { ReturnRequest } from '@/lib/models/ReturnRequest';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

// PATCH - Update return request status by ID (admin only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await context.params;
    const body = await request.json();
    const { 
      status, 
      message, 
      adminNotes, 
      refundAmount, 
      refundMethod,
      trackingNumber,
      courierName
    } = body;
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    
    const returnRequest = await ReturnRequest.findOne({ 
      $or: [
        { _id: id },
        { requestId: id }
      ]
    });
    
    if (!returnRequest) {
      return NextResponse.json(
        { error: 'Return request not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    returnRequest.status = status;
    if (adminNotes !== undefined) returnRequest.adminNotes = adminNotes;
    if (refundAmount !== undefined) returnRequest.refundAmount = refundAmount;
    if (refundMethod !== undefined) returnRequest.refundMethod = refundMethod;
    if (trackingNumber !== undefined) returnRequest.trackingNumber = trackingNumber;
    if (courierName !== undefined) returnRequest.courierName = courierName;
    
    // Add status history entry
    returnRequest.statusHistory.push({
      status,
      message: message || `Status updated to ${status}`,
      timestamp: new Date(),
      updatedBy: session.user.id
    });
    
    await returnRequest.save();
    
    return NextResponse.json({
      success: true,
      message: 'Return request updated successfully',
      returnRequest: {
        _id: returnRequest._id,
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

// GET - Get specific return request by ID (admin only)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await context.params;
    
    const returnRequest = await ReturnRequest.findOne({ 
      $or: [
        { _id: id },
        { requestId: id }
      ]
    })
    .populate('userId', 'name email')
    .lean();
    
    if (!returnRequest) {
      return NextResponse.json(
        { error: 'Return request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ returnRequest });
    
  } catch (error) {
    console.error('Error fetching return request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}