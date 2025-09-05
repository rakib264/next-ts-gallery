import mongoose from 'mongoose';

interface CTAButton {
  label: string;
  url: string;
}

export interface IBanner {
  _id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  discount?: string;
  image: string;
  ctaButtons?: CTAButton[];
  // Legacy fields for backward compatibility
  ctaButtonLabel?: string;
  ctaButtonUrl?: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const BannerSchema = new mongoose.Schema<IBanner>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300
  },
  discount: {
    type: String,
    trim: true,
    maxlength: 50
  },
  image: {
    type: String,
    required: true
  },
  ctaButtons: [{
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30
    },
    url: {
      type: String,
      required: true,
      trim: true
    }
  }],
  // Legacy fields for backward compatibility
  ctaButtonLabel: {
    type: String,
    trim: true,
    maxlength: 50
  },
  ctaButtonUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
BannerSchema.index({ isActive: 1, order: 1 });

const Banner = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;
