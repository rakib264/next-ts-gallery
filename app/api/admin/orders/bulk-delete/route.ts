import { auth } from '@/lib/auth';
import AuditLog from '@/lib/models/AuditLog';
import Order from '@/lib/models/Order';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'manager'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { orderIds } = await request.json();
    
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'Invalid order IDs' }, { status: 400 });
    }

    // Get orders before deletion for audit log
    const orders = await Order.find({ _id: { $in: orderIds } });
    const orderNumbers = orders.map(order => order.orderNumber);

    // Delete orders
    const result = await Order.deleteMany({ _id: { $in: orderIds } });

    // Log audit
    await AuditLog.create({
      user: session.user.id,
      action: 'BULK_DELETE',
      resource: 'Order',
      resourceId: null,
      changes: [],
      metadata: { 
        deletedCount: result.deletedCount,
        orderNumbers: orderNumbers,
        reason: 'Bulk deletion via admin panel'
      }
    });

    return NextResponse.json({ 
      message: `${result.deletedCount} orders deleted successfully`,
      deletedCount: result.deletedCount,
      orderNumbers
    });
  } catch (error) {
    console.error('Bulk delete orders error:', error);
    return NextResponse.json({ error: 'Failed to delete orders' }, { status: 500 });
  }
}
