import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string; // Optional for social login users
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'customer';
  phone?: string;
  profileImage?: string;
  address?: {
    street: string;
    division: string;
    district: string;
    postCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  isActive: boolean;
  emailVerified: boolean;
  authProvider?: 'google' | 'facebook' | 'credentials';
  authProviderId?: string;
  lastLogin?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for social login
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'customer'], default: 'customer' },
  phone: { type: String },
  profileImage: { type: String },
  address: {
    street: String,
    division: String,
    district: String,
    postCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  authProvider: { type: String, enum: ['google', 'facebook', 'credentials'], default: 'credentials' },
  authProviderId: { type: String },
  lastLogin: { type: Date },
  deletedAt: { type: Date },
}, {
  timestamps: true
});

// Add validation to ensure password exists for credential-based users
UserSchema.pre('save', function(next) {
  if (this.authProvider === 'credentials' && !this.password) {
    return next(new Error('Password is required for credential-based authentication'));
  }
  next();
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);