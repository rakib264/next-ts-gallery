import { NextRequest, NextResponse } from 'next/server';
import emailService from '@/lib/email';
import GeneralSettings from '@/lib/models/GeneralSettings';
import connectDB from '@/lib/mongodb';

export async function GET() {
  return NextResponse.json({ 
    message: 'Contact API is working',
    methods: ['GET', 'POST', 'OPTIONS'],
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Log the submission for debugging
    console.log('Contact form submission received:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (!adminEmail) {
      console.error('Admin email not configured');
      return NextResponse.json({ error: 'Admin email not configured.' }, { status: 500 });
    }

    try {
      // Pull branding for logo/colors
      await connectDB();
      const settings = await GeneralSettings.findOne();
      const branding = {
        siteName: settings?.siteName || process.env.NEXT_PUBLIC_SITE_NAME || 'TSR Gallery',
        logoUrl: settings?.logo1 || '/lib/assets/images/tsrgallery.png',
        primaryColor: settings?.primaryColor,
        secondaryColor: settings?.secondaryColor
      };

      console.log('Sending email to:', adminEmail);
      const sent = await emailService.sendContactFormEmail(
        adminEmail,
        email,
        { name, email, subject, message },
        branding
      );

      if (!sent) {
        console.error('Failed to send email');
        return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
      }

      console.log('Email sent successfully');
      return NextResponse.json({ 
        success: true,
        message: 'Contact form submitted and email sent successfully'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Return success even if email fails, but log the error
      return NextResponse.json({ 
        success: true,
        message: 'Contact form received, but email delivery failed',
        warning: 'Please contact us directly if urgent'
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ 
      error: 'Unexpected error.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}


