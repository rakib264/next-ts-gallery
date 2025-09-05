import { auth } from '@/lib/auth';
import Banner from '@/lib/models/Banner';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch single banner
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.role || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid banner ID' }, { status: 400 });
    }

    const banner = await Banner.findById(id);
    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error fetching banner:', error);
    return NextResponse.json({ error: 'Failed to fetch banner' }, { status: 500 });
  }
}

// PUT - Update banner
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.role || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid banner ID' }, { status: 400 });
    }

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
      isActive, 
      order 
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

    const updateData: any = {
      title: title.trim(),
      subtitle: subtitle?.trim() || '',
      description: description?.trim() || '',
      discount: discount?.trim() || '',
      image: image.trim(),
      ctaButtons: ctaButtons || [],
      // Legacy fields for backward compatibility
      ctaButtonLabel: ctaButtonLabel?.trim() || '',
      ctaButtonUrl: ctaButtonUrl?.trim() || '',
      isActive: isActive !== undefined ? isActive : true,
    };

    if (order !== undefined) {
      updateData.order = order;
    }

    const banner = await Banner.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

// DELETE - Delete banner
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.role || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid banner ID' }, { status: 400 });
    }

    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
