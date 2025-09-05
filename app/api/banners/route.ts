import Banner from '@/lib/models/Banner';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch active banners for public display
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch only active banners, sorted by order
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1 })
      .limit(limit)
      .select('title subtitle image ctaButtons description discount order')
      .lean();

    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Error fetching public banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}
