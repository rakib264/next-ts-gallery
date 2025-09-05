import { auth } from '@/lib/auth';
import Order from '@/lib/models/Order';
import Product, { IProduct } from '@/lib/models/Product';
import connectDB from '@/lib/mongodb';
 
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    
    const { rating, comment } = await request.json();
    
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid rating (1-5) is required' }, { status: 400 });
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json({ error: 'Review comment must be at least 10 characters' }, { status: 400 });
    }

    const { slug } = await context.params;
    const product = await Product.findOne({ slug });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      (review: any) => review.user.toString() === session.user.id
    );

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 });
    }

    // Check if user has purchased this product (for verified purchase badge)
    const hasPurchased = await Order.findOne({
      customer: session.user.id,
      'items.product': product._id,
      orderStatus: 'delivered'
    });

    // Add review
    const newReview = {
      user: session.user.id,
      rating,
      comment: comment.trim(),
      verified: !!hasPurchased,
      helpful: 0,
      createdAt: new Date()
    };

    product.reviews.push(newReview);

    // Recalculate average rating
    const totalRating = product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    product.averageRating = totalRating / product.reviews.length;
    product.totalReviews = product.reviews.length;

    await product.save();

    return NextResponse.json({ 
      message: 'Review submitted successfully',
      review: newReview 
    });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    
    const { slug } = await context.params;
    const product = await Product.findOne({ slug })
      .populate('reviews.user', 'firstName lastName')
      .select('reviews averageRating totalReviews')
      .lean() as IProduct | null;
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      reviews: product.reviews,
      averageRating: product.averageRating,
      totalReviews: product.totalReviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
} 