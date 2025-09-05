import mongoose, { Document, Schema } from 'mongoose';

export interface IReturnExchangeRequest extends Document {
  requestId: string;
  orderId: string;
  customerName: string;
  email: string;
  phone?: string;
  type: 'return' | 'exchange';
  products: {
    productName: string;
    quantity: number;
    variant?: string;
    reason: string;
    details?: string;
  }[];
  reason: string;
  details?: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  attachments?: string[];
  adminNotes?: string;
  resolutionNotes?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnExchangeRequestSchema = new Schema<IReturnExchangeRequest>({
  requestId: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  },
  orderId: { type: String, required: true },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  type: { 
    type: String, 
    enum: ['return', 'exchange'], 
    required: true 
  },
  products: [{
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variant: String,
    reason: { type: String, required: true },
    details: String
  }],
  reason: { type: String, required: true },
  details: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'resolved'], 
    default: 'pending' 
  },
  attachments: [{ type: String }],
  adminNotes: { type: String },
  resolutionNotes: { type: String },
  processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  processedAt: { type: Date }
}, {
  timestamps: true
});

// Index for better query performance
ReturnExchangeRequestSchema.index({ orderId: 1 });
ReturnExchangeRequestSchema.index({ email: 1 });
ReturnExchangeRequestSchema.index({ status: 1 });
ReturnExchangeRequestSchema.index({ createdAt: -1 });

export default mongoose.models.ReturnExchangeRequest || mongoose.model<IReturnExchangeRequest>('ReturnExchangeRequest', ReturnExchangeRequestSchema);
