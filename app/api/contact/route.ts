import emailService from '@/lib/email';
import GeneralSettings from '@/lib/models/GeneralSettings';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (!adminEmail) {
      return NextResponse.json({ error: 'Admin email not configured.' }, { status: 500 });
    }

    // Pull branding for logo/colors
    await connectDB();
    const settings = await GeneralSettings.findOne();
    const branding = {
      siteName: settings?.siteName || process.env.NEXT_PUBLIC_SITE_NAME || 'NextEcom Admin',
      logoUrl: settings?.logo1 || '/lib/assets/images/tsrgallery.png',
      primaryColor: settings?.primaryColor,
      secondaryColor: settings?.secondaryColor
    };

    const sent = await emailService.sendContactFormEmail(
      adminEmail,
      email,
      { name, email, subject, message },
      branding
    );

    if (!sent) {
      return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}


