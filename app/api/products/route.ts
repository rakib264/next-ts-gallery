import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import connectDB from '@/lib/mongodb';
import { getAllSubcategories } from '@/lib/utils/categoryUtils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
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
    const isNewArrival = searchParams.get('isNewArrival') === 'true';
    const isLimitedEdition = searchParams.get('isLimitedEdition') === 'true';
    const active = searchParams.get('active');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const colorParam = searchParams.get('color') || '';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    // Handle active filter
    if (active !== null) {
      query.isActive = active === 'true';
    } else {
      query.isActive = true; // Default to active products only
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        // First, try to find products in the current category
        const currentCategoryQuery = { ...query, category: categoryDoc._id };
        const currentCategoryProducts = await Product.find(currentCategoryQuery).countDocuments();
        
        if (currentCategoryProducts > 0) {
          // If current category has products, use it
          query.category = categoryDoc._id;
        } else {
          // If current category has no products, get all subcategories recursively
          const subcategoryIds = await getAllSubcategories(categoryDoc._id.toString());
          
          if (subcategoryIds.length > 0) {
            // Search in all subcategories
            query.category = { $in: subcategoryIds };
          } else {
            // No subcategories either, return empty result
            query.category = null; // This will match no products
          }
        }
      }
    }

    if (minPrice > 0 || maxPrice < 999999) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    }

    if (featured) {
      query.isFeatured = true;
    }
    
    if (isNewArrival) {
      query.isNewArrival = true;
    }
    
    if (isLimitedEdition) {
      query.isLimitedEdition = true;
    }

    if (minRating > 0) {
      query.averageRating = { $gte: minRating };
    }

    if (colorParam) {
      const colors = colorParam.split(',').map((c) => c.trim()).filter(Boolean);
      if (colors.length > 0) {
        // Match products that have a variant named like "Color" with any of the selected colors
        query.variants = {
          $elemMatch: {
            name: { $regex: /^color$/i },
            value: { $in: colors.map((c) => new RegExp(`^${c}$`, 'i')) }
          }
        };
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

    // Determine if we're showing fallback products
    let isFallback = false;
    let fallbackInfo = null;
    
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        const currentCategoryQuery = { ...query, category: categoryDoc._id };
        const currentCategoryProducts = await Product.find(currentCategoryQuery).countDocuments();
        
        if (currentCategoryProducts === 0 && total > 0) {
          isFallback = true;
          const subcategoryIds = await getAllSubcategories(categoryDoc._id.toString());
          const subcategories = await Category.find({ 
            _id: { $in: subcategoryIds } 
          }).select('name slug').lean();
          
          fallbackInfo = {
            originalCategory: {
              name: categoryDoc.name,
              slug: categoryDoc.slug
            },
            showingFromSubcategories: subcategories.map(sub => ({
              name: sub.name,
              slug: sub.slug
            }))
          };
        }
      }
    }

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      isFallback,
      fallbackInfo
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
    
    // Validate category exists
    let categoryId;
    if (data.category) {
      const category = await Category.findOne({ 
        $or: [
          { slug: data.category },
          { _id: data.category }
        ]
      });
      
      if (!category) {
        errors.push('Category not found');
      } else {
        categoryId = category._id;
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
      ...data,
      category: categoryId,
      price: parseFloat(data.price),
      comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : undefined,
      cost: data.cost ? parseFloat(data.cost) : undefined,
      quantity: data.quantity ? parseInt(data.quantity) : 0,
      lowStockThreshold: data.lowStockThreshold ? parseInt(data.lowStockThreshold) : 10,
      shippingCost: data.shippingCost ? parseFloat(data.shippingCost) : undefined,
      taxRate: data.taxRate ? parseFloat(data.taxRate) : undefined,
      weight: data.weight ? parseFloat(data.weight) : undefined,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
      tags: data.tags || [],
      seoKeywords: data.seoKeywords || [],
      variants: data.variants || []
    };
    
    const product = await Product.create(productData);
    
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