import mongoose, { Document, Schema } from 'mongoose';

export interface IGeneralSettings extends Document {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
  address: string;
  logo1: string;
  logo2: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    formattedAddress?: string;
  };
  socialLinks?: {
    facebook?: string;
    youtube?: string;
    instagram?: string;
    tiktok?: string;
  };
  currency: string;
  timezone: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const GeneralSettingsSchema = new Schema<IGeneralSettings>({
  siteName: { type: String, default: 'TSR Gallery' },
  siteDescription: { type: String, default: 'Your Trusted Online Shopping Destination' },
  siteUrl: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactPerson: { type: String, default: '' },
  address: { type: String, default: '' },
  logo1: { type: String, default: '' },
  logo2: { type: String, default: '' },
  favicon: { type: String, default: '' },
  primaryColor: { type: String, default: '#3949AB' },
  secondaryColor: { type: String, default: '#10b981' },
  location: {
    address: { type: String, default: '' },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    formattedAddress: { type: String, default: '' }
  },
  socialLinks: {
    facebook: { type: String, default: '' },
    youtube: { type: String, default: '' },
    instagram: { type: String, default: '' },
    tiktok: { type: String, default: '' }
  },
  currency: { type: String, default: 'BDT' },
  timezone: { type: String, default: 'Asia/Dhaka' },
  language: { type: String, default: 'en' }
}, {
  timestamps: true
});

export default mongoose.models.GeneralSettings || mongoose.model<IGeneralSettings>('GeneralSettings', GeneralSettingsSchema);