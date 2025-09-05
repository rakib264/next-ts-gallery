import { auth } from '@/lib/auth';
import Banner from '@/lib/models/Banner';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all banners with search and filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // 'active', 'inactive', or null for all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'order';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build filter query
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { ctaButtonLabel: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get total count for pagination
    const total = await Banner.countDocuments(filter);

    // Fetch banners with pagination
    const banners = await Banner.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      banners,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

// POST - Create new banner
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { 
      title, 
      subtitle, 
      description, 
      discount, 
      image, 
      ctaButtons, 
      // Legacy fields for backward compatibility
      ctaButtonLabel, 
      ctaButtonUrl, 
      isActive = true 
    } = body;

    // Validation
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!image?.trim()) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Validate CTA buttons if provided
    if (ctaButtons && Array.isArray(ctaButtons)) {
      if (ctaButtons.length === 0) {
        return NextResponse.json({ error: 'At least one CTA button is required' }, { status: 400 });
      }
      
      for (const button of ctaButtons) {
        if (!button.label?.trim() || !button.url?.trim()) {
          return NextResponse.json({ error: 'Each CTA button must have both label and URL' }, { status: 400 });
        }
      }
    }

    // Get the next order number
    const lastBanner = await Banner.findOne({}, {}, { sort: { order: -1 } });
    const nextOrder = lastBanner ? lastBanner.order + 1 : 1;

    const banner = new Banner({
      title: title.trim(),
      subtitle: subtitle?.trim() || '',
      description: description?.trim() || '',
      discount: discount?.trim() || '',
      image: image.trim(),
      ctaButtons: ctaButtons || [],
      // Legacy fields for backward compatibility
      ctaButtonLabel: ctaButtonLabel?.trim() || '',
      ctaButtonUrl: ctaButtonUrl?.trim() || '',
      isActive,
      order: nextOrder
    });

    await banner.save();

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
