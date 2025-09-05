import { auth } from '@/lib/auth';
import ReturnExchangeRequest from '@/lib/models/ReturnExchangeRequest';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for bulk delete
const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one ID is required')
});

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const validatedData = bulkDeleteSchema.parse(body);

    const result = await ReturnExchangeRequest.deleteMany({
      _id: { $in: validatedData.ids }
    });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} requests deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error bulk deleting return/exchange requests:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: (error as any).errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to delete requests'
    }, { status: 500 });
  }
}
