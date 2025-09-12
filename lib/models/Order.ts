import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  orderNumber: string;
  customer?: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    variant?: string;
    image?: string;
  }[];
  subtotal: number;
  tax: number;
  taxRate: number;
  shippingCost: number;
  discountAmount: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'cod' | 'sslcommerz' | 'bkash' | 'nagad';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    name: string;
    phone: string;
    email?: string;
    street: string;
    city: string;
    district: string;
    division: string;
    postalCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
      divisionName?: string;
      district?: string;
      thanaOrUpazilaName?: string;
      placeName?: string;
      countryCode?: string;
    };
  };
  billingAddress?: {
    name: string;
    phone: string;
    email?: string;
    street: string;
    city: string;
    district: string;
    division: string;
    postalCode?: string;
  };
  deliveryType: 'Inside Dhaka' | 'Outside Dhaka';
  expectedDelivery?: Date;
  deliveredAt?: Date;
  notes?: string;
  trackingNumber?: string;
  courierInfo?: {
    courierName: string;
    trackingId: string;
    courierPhone?: string;
  };
  paymentDetails?: {
    transactionId?: string;
    gatewayData?: any;
    validationId?: string;
    cardType?: string;
    paidAmount?: number;
    paidAt?: Date;
    failureReason?: string;
    ipnReceived?: boolean;
    ipnData?: any;
    validationData?: any;
    cancelledAt?: Date;
    failedAt?: Date;
  };
  invoiceUrl?: string;
  invoiceGenerated?: boolean;
  invoiceGeneratedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    variant: String,
    image: String
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  couponCode: String,
  total: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['cod', 'sslcommerz', 'bkash', 'nagad'], 
    default: 'cod' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  orderStatus: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    street: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    division: { type: String, required: true },
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number,
      divisionName: String,
      district: String,
      thanaOrUpazilaName: String,
      placeName: String,
      countryCode: String
    }
  },
  billingAddress: {
    name: String,
    phone: String,
    email: String,
    street: String,
    city: String,
    district: String,
    division: String,
    postalCode: String
  },
  deliveryType: { 
    type: String, 
    enum: ['Inside Dhaka', 'Outside Dhaka'], 
    default: 'Inside Dhaka' 
  },
  expectedDelivery: Date,
  deliveredAt: Date,
  notes: String,
  trackingNumber: String,
  courierInfo: {
    courierName: String,
    trackingId: String,
    courierPhone: String
  },
  paymentDetails: {
    transactionId: String,
    gatewayData: Schema.Types.Mixed,
    validationId: String,
    cardType: String,
    paidAmount: Number,
    paidAt: Date,
    failureReason: String,
    ipnReceived: { type: Boolean, default: false },
    ipnData: Schema.Types.Mixed,
    validationData: Schema.Types.Mixed,
    cancelledAt: Date,
    failedAt: Date
  },
  invoiceUrl: String,
  invoiceGenerated: { type: Boolean, default: false },
  invoiceGeneratedAt: Date
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);