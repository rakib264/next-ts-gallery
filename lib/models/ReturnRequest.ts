import mongoose, { Document, Schema } from 'mongoose';

export interface IReturnRequest extends Document {
  requestId: string;
  orderId: string;
  userId?: mongoose.Types.ObjectId;
  customerName: string;
  email: string;
  phone: string;
  type: 'return' | 'exchange';
  reason: string;
  details: string;
  products: {
    productName: string;
    quantity: number;
    variant?: string;
    reason: string;
    details?: string;
  }[];
  attachments: string[];
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  statusHistory: {
    status: string;
    message: string;
    timestamp: Date;
    updatedBy?: string;
  }[];
  adminNotes?: string;
  refundAmount?: number;
  refundMethod?: string;
  trackingNumber?: string;
  courierName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnRequestSchema = new Schema<IReturnRequest>({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  type: {
    type: String,
    enum: ['return', 'exchange'],
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: String,
    required: false,
    trim: true
  },
  products: [{
    productName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 99
    },
    variant: {
      type: String,
      required: false,
      trim: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    details: {
      type: String,
      required: false,
      trim: true
    }
  }],
  attachments: [{
    type: String,
    required: false
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: String,
      required: false
    }
  }],
  adminNotes: {
    type: String,
    required: false,
    trim: true
  },
  refundAmount: {
    type: Number,
    required: false,
    min: 0
  },
  refundMethod: {
    type: String,
    required: false,
    enum: ['original_payment', 'store_credit', 'bank_transfer']
  },
  trackingNumber: {
    type: String,
    required: false,
    trim: true
  },
  courierName: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
ReturnRequestSchema.index({ requestId: 1 });
ReturnRequestSchema.index({ orderId: 1 });
ReturnRequestSchema.index({ userId: 1 });
ReturnRequestSchema.index({ email: 1 });
ReturnRequestSchema.index({ status: 1 });
ReturnRequestSchema.index({ createdAt: -1 });

export const ReturnRequest = mongoose.models.ReturnRequest || mongoose.model<IReturnRequest>('ReturnRequest', ReturnRequestSchema);
