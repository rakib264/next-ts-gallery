import { auth } from '@/lib/auth';
import AuditLog from '@/lib/models/AuditLog';
import Product from '@/lib/models/Product';
import connectDB from '@/lib/mongodb';
 
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !['admin', 'manager', 'staff'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { id } = await context.params;
    const product = await Product.findById(id).populate('category', 'name slug');
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !['admin', 'manager'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const data = await request.json();
    const { id } = await context.params;
    const oldProduct = await Product.findById(id);
    
    if (!oldProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    // Log audit with changes
    const changes = [];
    for (const key in data) {
      if (oldProduct[key] !== data[key]) {
        changes.push({
          field: key,
          oldValue: oldProduct[key],
          newValue: data[key]
        });
      }
    }

    await AuditLog.create({
      user: session.user.id,
      action: 'UPDATE',
      resource: 'Product',
      resourceId: id,
      changes,
      metadata: { productName: updatedProduct.name, sku: updatedProduct.sku }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !['admin'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { id } = await context.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await Product.findByIdAndDelete(id);

    // Log audit
    await AuditLog.create({
      user: session.user.id,
      action: 'DELETE',
      resource: 'Product',
      resourceId: id,
      metadata: { productName: product.name, sku: product.sku }
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}