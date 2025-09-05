import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  subtitle?: string;
  bannerImage?: string;
  discountText: string;
  startDate: Date;
  endDate: Date;
  products: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  subtitle: { 
    type: String,
    trim: true
  },
  bannerImage: { 
    type: String 
  },
  discountText: { 
    type: String, 
    required: true,
    trim: true
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  products: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

// Add validation for start and end dates
EventSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'));
  } else {
    next();
  }
});

// Add virtual for status based on dates
EventSchema.virtual('status').get(function() {
  const now = new Date();
  if (!this.isActive) return 'inactive';
  if (now < this.startDate) return 'upcoming';
  if (now > this.endDate) return 'expired';
  return 'active';
});

// Include virtuals in JSON output
EventSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
