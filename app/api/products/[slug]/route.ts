import Product, { IProduct } from '@/lib/models/Product';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    
    const { slug } = await context.params;
    const product = await Product.findOne({ slug, isActive: true })
      .populate('category', 'name slug')
      .populate('reviews.user', 'firstName lastName')
      .lean() as IProduct | null;
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get related products from same category
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true
    })
    .select('name slug price comparePrice thumbnailImage averageRating totalReviews')
    .limit(4)
    .lean();

    return NextResponse.json({
      product,
      relatedProducts
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}