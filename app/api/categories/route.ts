import Category from '@/lib/models/Category';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/categories - Get all active categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const categories = await Category.find({ isActive: true })
      .select('name slug description image parent sortOrder')
      .populate('parent', 'name slug')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return NextResponse.json({
      categories: categories || []
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

