import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: mongoose.Types.ObjectId;
  subcategory?: mongoose.Types.ObjectId;
  price: number;
  comparePrice?: number;
  cost?: number;
  sku: string;
  barcode?: string;
  trackQuantity: boolean;
  quantity: number;
  lowStockThreshold?: number;
  thumbnailImage: string;
  images: string[];
  videoLinks?: string[];
  sizeImage?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shippingCost?: number;
  taxRate?: number;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isLimitedEdition: boolean;
  tags: string[];
  productSize: string[];
  metaTitle?: string;
  metaDescription?: string;
  seoKeywords?: string[];
  variants?: {
    name: string;
    value: string;
    price?: number;
    sku?: string;
    quantity?: number;
    image?: string;
  }[];
  reviews: {
    user: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
  averageRating: number;
  totalReviews: number;
  totalSales: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: Schema.Types.ObjectId, ref: 'Category' },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  cost: { type: Number },
  sku: { type: String, required: true, unique: true },
  barcode: { type: String },
  trackQuantity: { type: Boolean, default: true },
  quantity: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  thumbnailImage: { type: String, required: true },
  images: [{ type: String }],
  videoLinks: [{ type: String }],
  sizeImage: { type: String },
  weight: { type: Number },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  shippingCost: { type: Number },
  taxRate: { type: Number },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isLimitedEdition: { type: Boolean, default: false },
  tags: [{ type: String }],
  productSize: [{ type: String }],
  metaTitle: { type: String },
  metaDescription: { type: String },
  seoKeywords: [{ type: String }],
  variants: [{
    name: String,
    value: String,
    price: Number,
    sku: String,
    quantity: Number,
    image: String
  }],
  reviews: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);