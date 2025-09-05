import { auth } from '@/lib/auth';
import IntegrationSettings from '@/lib/models/IntegrationSettings';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    let settings = await IntegrationSettings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await IntegrationSettings.create({
        cloudinaryEnabled: true,
        cloudinaryCloudName: '',
        cloudinaryApiKey: '',
        cloudinaryApiSecret: '',
        twilioEnabled: false,
        twilioAccountSid: '',
        twilioAuthToken: '',
        twilioPhoneNumber: '',
        zamanitEnabled: true,
        zamanitApiKey: '',
        zamanitSenderId: '',
        zamanitBaseUrl: 'http://45.120.38.242/api/sendsms',
        emailEnabled: true,
        emailProvider: 'smtp',
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: ''
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Integration settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch integration settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const data = await request.json();
    
    let settings = await IntegrationSettings.findOne();
    
    if (settings) {
      // Update existing settings
      Object.assign(settings, data);
      await settings.save();
    } else {
      // Create new settings
      settings = await IntegrationSettings.create(data);
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Update integration settings error:', error);
    return NextResponse.json({ 
      error: 'Failed to update integration settings', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
