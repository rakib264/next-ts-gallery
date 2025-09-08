import GeneralSettings from '../models/GeneralSettings';
import connectDB from '../mongodb';
import { EmailSettings } from '../types/email-settings';

/**
 * Get email settings with priority: Database > Environment > Defaults
 */
export async function getEmailSettings(): Promise<EmailSettings> {
  let dbSettings: any = null;
  
  try {
    await connectDB();
    dbSettings = await GeneralSettings.findOne().select({
      siteName: 1,
      siteDescription: 1,
      siteUrl: 1,
      contactEmail: 1,
      contactPhone: 1,
      address: 1,
      logo1: 1,
      primaryColor: 1,
      secondaryColor: 1
    }).lean();
  } catch (error) {
    console.warn('Could not fetch settings from database:', error);
  }


  return {
    siteName: dbSettings?.siteName || process.env.NEXT_PUBLIC_SITE_NAME || 'TSR Gallery',
    siteDescription: dbSettings?.siteDescription || process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Your Trusted Online Shopping Destination',
    siteUrl: dbSettings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    contactEmail: dbSettings?.contactEmail || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info.tsrgallery@gmail.com',
    contactPhone: dbSettings?.contactPhone || process.env.NEXT_PUBLIC_CONTACT_PHONE || '8801339561702',
    contactAddress: dbSettings?.address || process.env.NEXT_PUBLIC_CONTACT_ADDRESS || 'Kazipara Metro Station, Begum Rokeya Sharani, Kazipara, Dhaka, 1216, Bangladesh',
    logo: dbSettings?.logo1 || undefined,
    primaryColor: dbSettings?.primaryColor || '#3949AB',
    secondaryColor: dbSettings?.secondaryColor || '#10b981'
  };
}
