import { auth } from '@/lib/auth';
import GeneralSettings from '@/lib/models/GeneralSettings';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get or create settings
    let settings = await GeneralSettings.findOne();
    if (!settings) {
      settings = await GeneralSettings.create({});
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('General settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch general settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    await connectDB();
    
    // Build update payload with whitelisted fields (use dotted paths for nested)
    const {
      siteName,
      siteDescription,
      siteUrl,
      contactEmail,
      contactPhone,
      contactPerson,
      address,
      logo1,
      logo2,
      favicon,
      primaryColor,
      secondaryColor,
      location,
      currency,
      timezone,
      language,
      socialLinks,
    } = data || {};

    const $set: Record<string, any> = {};
    if (typeof siteName !== 'undefined') $set['siteName'] = siteName;
    if (typeof siteDescription !== 'undefined') $set['siteDescription'] = siteDescription;
    if (typeof siteUrl !== 'undefined') $set['siteUrl'] = siteUrl;
    if (typeof contactEmail !== 'undefined') $set['contactEmail'] = contactEmail;
    if (typeof contactPhone !== 'undefined') $set['contactPhone'] = contactPhone;
    if (typeof contactPerson !== 'undefined') $set['contactPerson'] = contactPerson;
    if (typeof address !== 'undefined') $set['address'] = address;
    if (typeof logo1 !== 'undefined') $set['logo1'] = logo1;
    if (typeof logo2 !== 'undefined') $set['logo2'] = logo2;
    if (typeof favicon !== 'undefined') $set['favicon'] = favicon;
    if (typeof primaryColor !== 'undefined') $set['primaryColor'] = primaryColor;
    if (typeof secondaryColor !== 'undefined') $set['secondaryColor'] = secondaryColor;
    if (typeof currency !== 'undefined') $set['currency'] = currency;
    if (typeof timezone !== 'undefined') $set['timezone'] = timezone;
    if (typeof language !== 'undefined') $set['language'] = language;
    if (location && typeof location === 'object') {
      if (typeof location.address !== 'undefined') $set['location.address'] = location.address;
      if (typeof location.latitude !== 'undefined') $set['location.latitude'] = location.latitude;
      if (typeof location.longitude !== 'undefined') $set['location.longitude'] = location.longitude;
      if (typeof location.formattedAddress !== 'undefined') $set['location.formattedAddress'] = location.formattedAddress;
    }
    if (socialLinks && typeof socialLinks === 'object') {
      if (typeof socialLinks.facebook !== 'undefined') $set['socialLinks.facebook'] = socialLinks.facebook;
      if (typeof socialLinks.youtube !== 'undefined') $set['socialLinks.youtube'] = socialLinks.youtube;
      if (typeof socialLinks.instagram !== 'undefined') $set['socialLinks.instagram'] = socialLinks.instagram;
      if (typeof socialLinks.tiktok !== 'undefined') $set['socialLinks.tiktok'] = socialLinks.tiktok;
    }

    const settings = await GeneralSettings.findOneAndUpdate(
      {},
      Object.keys($set).length > 0 ? { $set } : {},
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Update general settings error:', error);
    return NextResponse.json({ 
      error: 'Failed to update general settings', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
