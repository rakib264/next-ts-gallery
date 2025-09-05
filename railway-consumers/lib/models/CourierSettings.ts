import mongoose, { Document, Schema } from 'mongoose';

export interface ICourierSettings extends Document {
  // Sender Information
  senderInfo: {
    name: string;
    phone: string;
    address: string;
    division: string;
    district: string;
  };
  
  // Delivery Charges
  deliveryCharges: {
    regularWithinDhaka: number;
    regularOutsideDhaka: number;
    expressWithinDhaka: number;
    expressOutsideDhaka: number;
    sameDayWithinDhaka: number;
    fragileHandlingCharge: number;
  };
  
  // COD Settings
  codChargeRate: number;
  weightBasedCharging: boolean;
  
  // Additional Settings
  freeDeliveryThreshold: number;
  defaultCourierPartners: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

const CourierSettingsSchema = new Schema<ICourierSettings>({
  senderInfo: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    division: { type: String, default: '' },
    district: { type: String, default: '' },
  },
  deliveryCharges: {
    regularWithinDhaka: { type: Number, default: 60 },
    regularOutsideDhaka: { type: Number, default: 120 },
    expressWithinDhaka: { type: Number, default: 100 },
    expressOutsideDhaka: { type: Number, default: 150 },
    sameDayWithinDhaka: { type: Number, default: 150 },
    fragileHandlingCharge: { type: Number, default: 20 },
  },
  codChargeRate: { type: Number, default: 1 },
  weightBasedCharging: { type: Boolean, default: true },
  freeDeliveryThreshold: { type: Number, default: 1000 },
  defaultCourierPartners: { 
    type: [String], 
    default: ['steadfast'],
    validate: {
      validator: function(partners: string[]) {
        return partners.length > 0;
      },
      message: 'At least one courier partner must be selected'
    }
  },
}, {
  timestamps: true
});

export default mongoose.models.CourierSettings || mongoose.model<ICourierSettings>('CourierSettings', CourierSettingsSchema);
