import { createAuditLog, getClientIP } from '@/lib/audit';
import { auth } from '@/lib/auth';
import AuditLog from '@/lib/models/AuditLog';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
 
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'manager', 'staff'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const featured = searchParams.get('featured') === 'true';
    const active = searchParams.get('active');
    const isNewArrival = searchParams.get('isNewArrival');
    const isLimitedEdition = searchParams.get('isLimitedEdition');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const stock = searchParams.get('stock'); // 'in' | 'out'
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    if (minPrice > 0 || maxPrice < 999999) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    }

    if (featured) {
      query.isFeatured = true;
    }

    if (active !== null && active !== undefined) {
      query.isActive = active === 'true';
    }

    if (isNewArrival !== null && isNewArrival !== undefined) {
      query.isNewArrival = isNewArrival === 'true';
    }

    if (isLimitedEdition !== null && isLimitedEdition !== undefined) {
      query.isLimitedEdition = isLimitedEdition === 'true';
    }

    if (!isNaN(minRating) && minRating > 0) {
      query.averageRating = { $gte: minRating };
    }

    if (stock === 'in') {
      query.quantity = { $gt: 0 };
    } else if (stock === 'out') {
      query.quantity = { $lte: 0 };
    }

    if (dateFrom || dateTo) {
      query.createdAt = {} as any;
      if (dateFrom) {
        // Interpret dateFrom as local date (not UTC). Build at local midnight to avoid TZ shift
        const [fy, fm, fd] = dateFrom.split('-').map((v) => parseInt(v, 10));
        const from = new Date(fy, (fm || 1) - 1, fd || 1, 0, 0, 0, 0);
        (query.createdAt as any).$gte = from;
      }
      if (dateTo) {
        // Include entire end day (local 23:59:59.999)
        const [ty, tm, td] = dateTo.split('-').map((v) => parseInt(v, 10));
        const to = new Date(ty, (tm || 1) - 1, td || 1, 23, 59, 59, 999);
        (query.createdAt as any).$lte = to;
      }
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    // Log VIEW action
    await createAuditLog({
      userId: session.user.id,
      action: 'VIEW',
      resource: 'Product',
      resourceId: 'list',
      metadata: {
        filters: { search, category, sortBy, sortOrder, minPrice, maxPrice, featured, active, isNewArrival, isLimitedEdition, minRating, stock, dateFrom, dateTo },
        resultCount: products.length,
        totalCount: total
      },
      ipAddress: getClientIP(request)
    });

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'manager'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const data = await request.json();
    
    // Validation
    const errors: string[] = [];
    
    // Required fields validation
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Product name is required');
    }
    
    if (!data.slug || data.slug.trim().length === 0) {
      errors.push('Product slug is required');
    }
    
    if (!data.description || data.description.trim().length === 0) {
      errors.push('Product description is required');
    }
    
    if (!data.category) {
      errors.push('Product category is required');
    }
    
    if (!data.price || data.price <= 0) {
      errors.push('Product price must be greater than 0');
    }
    
    if (!data.sku || data.sku.trim().length === 0) {
      errors.push('Product SKU is required');
    }
    
    if (!data.thumbnailImage || data.thumbnailImage.trim().length === 0) {
      errors.push('Product thumbnail image is required');
    }
    
    // Validate category exists (accepts either slug or ObjectId string)
    let categoryId;
    if (data.category) {
      if (mongoose.Types.ObjectId.isValid(data.category)) {
        const category = await Category.findById(data.category);
        if (!category) {
          errors.push(`Category not found: ${data.category}`);
        } else {
          categoryId = category._id;
        }
      } else {
        const category = await Category.findOne({ slug: data.category });
        if (!category) {
          errors.push(`Category not found: ${data.category}`);
        } else {
          categoryId = category._id;
        }
      }
    }
    
    // Validate price logic
    if (data.comparePrice && data.comparePrice <= data.price) {
      errors.push('Compare price must be greater than regular price');
    }
    
    if (data.cost && data.cost > data.price) {
      errors.push('Cost cannot be greater than selling price');
    }
    
    // Validate quantity
    if (data.trackQuantity && (data.quantity === undefined || data.quantity < 0)) {
      errors.push('Quantity must be 0 or greater when tracking quantity');
    }
    
    // Validate images array
    if (data.images && !Array.isArray(data.images)) {
      errors.push('Images must be an array');
    }
    
    // Validate videoLinks array
    if (data.videoLinks && !Array.isArray(data.videoLinks)) {
      errors.push('Video links must be an array');
    }
    
    // Validate variants
    if (data.variants && Array.isArray(data.variants)) {
      for (let i = 0; i < data.variants.length; i++) {
        const variant = data.variants[i];
        if (!variant.name || !variant.value) {
          errors.push(`Variant ${i + 1}: name and value are required`);
        }
        if (variant.price && variant.price <= 0) {
          errors.push(`Variant ${i + 1}: price must be greater than 0`);
        }
        if (variant.quantity !== undefined && variant.quantity < 0) {
          errors.push(`Variant ${i + 1}: quantity must be 0 or greater`);
        }
      }
    }
    
    // Check for duplicate SKU
    const existingProduct = await Product.findOne({ sku: data.sku });
    if (existingProduct) {
      errors.push('SKU already exists. Please use a unique SKU');
    }
    
    // Check for duplicate slug
    const existingSlug = await Product.findOne({ slug: data.slug });
    if (existingSlug) {
      errors.push('Slug already exists. Please use a unique slug');
    }
    
    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: errors 
      }, { status: 400 });
    }
    
    // Prepare data for creation
    const productData = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      shortDescription: data.shortDescription,
      category: categoryId,
      price: parseFloat(data.price),
      comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : undefined,
      cost: data.cost ? parseFloat(data.cost) : undefined,
      sku: data.sku,
      barcode: data.barcode,
      trackQuantity: data.trackQuantity,
      quantity: data.quantity ? parseInt(data.quantity) : 0,
      lowStockThreshold: data.lowStockThreshold ? parseInt(data.lowStockThreshold) : 10,
      thumbnailImage: data.thumbnailImage,
      images: data.images || [],
      videoLinks: data.videoLinks || [],
      sizeImage: data.sizeImage,
      weight: data.weight ? parseFloat(data.weight) : undefined,
      dimensions: data.dimensions,
      shippingCost: data.shippingCost ? parseFloat(data.shippingCost) : undefined,
      taxRate: data.taxRate ? parseFloat(data.taxRate) : undefined,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
      isNewArrival: data.isNewArrival !== undefined ? data.isNewArrival : false,
      isLimitedEdition: data.isLimitedEdition !== undefined ? data.isLimitedEdition : false,
      tags: data.tags || [],
      productSize: data.productSize || [],
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      seoKeywords: data.seoKeywords || [],
      variants: data.variants || []
    };

    const product = await Product.create(productData);

    // Log audit
    await AuditLog.create({
      user: session.user.id,
      action: 'CREATE',
      resource: 'Product',
      resourceId: product._id.toString(),
      metadata: { productName: product.name, sku: product.sku }
    });
    
    return NextResponse.json({
      message: 'Product created successfully',
      product
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Create product error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({ 
        error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      }, { status: 400 });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: error.message 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'manager'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { ids, isActive } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No product ids provided' }, { status: 400 });
    }
    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 });
    }

    const result = await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive } }
    );

    // Audit logs per product (minimal metadata to avoid extra reads)
    const logs = ids.map((id: string) => ({
      user: session.user.id,
      action: 'UPDATE',
      resource: 'Product',
      resourceId: id,
      changes: [
        {
          field: 'isActive',
          oldValue: undefined,
          newValue: isActive,
        },
      ],
      metadata: { bulk: true },
    }));
    try {
      await AuditLog.insertMany(logs);
    } catch (_) {
      // best-effort; ignore audit failures
    }

    return NextResponse.json({ updated: result.modifiedCount || 0 });
  } catch (error) {
    console.error('Bulk update products error:', error);
    return NextResponse.json({ error: 'Failed to update products' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No product ids provided' }, { status: 400 });
    }

    const results: Array<{ id: string; status: 'deleted' | 'skipped'; reason?: string }> = [];

    for (const id of ids) {
      try {
        const product = await Product.findById(id);
        if (!product) {
          results.push({ id, status: 'skipped', reason: 'Product not found' });
          continue;
        }

        await Product.findByIdAndDelete(id);

        // Log audit
        await AuditLog.create({
          user: session.user.id,
          action: 'DELETE',
          resource: 'Product',
          resourceId: id,
          metadata: { productName: product.name, sku: product.sku, bulk: true }
        });

        results.push({ id, status: 'deleted' });
      } catch (_err) {
        results.push({ id, status: 'skipped', reason: 'Unexpected error' });
      }
    }

    const deleted = results.filter(r => r.status === 'deleted').length;
    const skipped = results.length - deleted;

    return NextResponse.json({ deleted, skipped, results });
  } catch (error) {
    console.error('Bulk delete products error:', error);
    return NextResponse.json({ error: 'Failed to bulk delete products' }, { status: 500 });
  }
}