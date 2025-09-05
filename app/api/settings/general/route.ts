import GeneralSettings from '@/lib/models/GeneralSettings';
import connectDB from '@/lib/mongodb';
import { NextResponse } from 'next/server';

// Public API endpoint for general settings
export async function GET() {
  try {
    await connectDB();
    
    // Get settings
    let settings = await GeneralSettings.findOne();
    if (!settings) {
      settings = await GeneralSettings.create({});
    }
    
    // Return public-safe data only
    const publicSettings = {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      siteUrl: settings.siteUrl,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      contactPerson: settings.contactPerson,
      address: settings.address,
      logo1: settings.logo1,
      logo2: settings.logo2,
      favicon: settings.favicon,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      location: settings.location,
      socialLinks: settings.socialLinks,
      currency: settings.currency,
      timezone: settings.timezone,
      language: settings.language,
    };
    
    // Cache the response for 5 minutes
    return NextResponse.json(publicSettings, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Public general settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch general settings' }, { status: 500 });
  }
}
